import { createHash } from 'node:crypto'
import { createOpenAiWritingProvider } from '../../src/server/writingPilot/openAiWritingProvider'
import { createWritingPilotService, type ApprovedWritingInstallation } from '../../src/server/writingPilot/writingPilotService'
import { FileWritingPilotStores } from './fileWritingPilotStores'
import { startNodeWritingPilotServer } from './nodeWritingPilotServer'

const liveEnabled = required('RRQ_WRITING_LIVE_ENABLED')
if (liveEnabled !== 'true') throw new Error('The external writing service is disabled. Set RRQ_WRITING_LIVE_ENABLED=true only after approval and budget gates pass.')
if (required('RRQ_WRITING_RETENTION_CONTROL') !== 'approved_zero_data_retention') throw new Error('Approved Zero Data Retention configuration is required.')

const installation: ApprovedWritingInstallation = {
  installationId: required('RRQ_WRITING_INSTALLATION_ID'),
  consentVersion: required('RRQ_WRITING_CONSENT_VERSION'),
  authorizationExpiresAt: requiredDate('RRQ_WRITING_AUTHORIZATION_EXPIRES_AT'),
  retentionControl: 'approved_zero_data_retention',
  budgetLimitMicros: requiredPositiveInteger('RRQ_WRITING_BUDGET_LIMIT_MICROS'),
}
const stores = new FileWritingPilotStores({
  statePath: required('RRQ_WRITING_STATE_PATH'),
  installation,
  activationCodeSha256: requiredHash('RRQ_WRITING_ACTIVATION_CODE_SHA256'),
})
const provider = createOpenAiWritingProvider({
  apiKey: required('OPENAI_API_KEY'),
  recognitionModel: required('RRQ_WRITING_RECOGNITION_MODEL'),
  evaluationModel: required('RRQ_WRITING_EVALUATION_MODEL'),
  moderationModel: required('RRQ_WRITING_MODERATION_MODEL'),
  recognitionPricing: pricing('RECOGNITION'),
  evaluationPricing: pricing('EVALUATION'),
})
const service = createWritingPilotService({
  allowedOrigins: [required('RRQ_WRITING_ALLOWED_ORIGIN')],
  authorization: stores,
  budget: stores,
  provider,
})
const server = await startNodeWritingPilotServer({
  service,
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 8080),
})
process.stdout.write(`RRQ protected writing service listening on ${new URL(server.url).port}.\n`)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { void server.close().finally(() => process.exit(0)) })
}

function pricing(stage: 'RECOGNITION' | 'EVALUATION') {
  return {
    pricingVersion: required(`RRQ_WRITING_${stage}_PRICING_VERSION`),
    inputMicrosPerMillionTokens: requiredPositiveInteger(`RRQ_WRITING_${stage}_INPUT_MICROS_PER_MILLION`),
    outputMicrosPerMillionTokens: requiredPositiveInteger(`RRQ_WRITING_${stage}_OUTPUT_MICROS_PER_MILLION`),
    maximumInputTokens: requiredPositiveInteger(`RRQ_WRITING_${stage}_MAX_INPUT_TOKENS`),
    maximumOutputTokens: requiredPositiveInteger(`RRQ_WRITING_${stage}_MAX_OUTPUT_TOKENS`),
  }
}

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required.`)
  return value
}

function requiredPositiveInteger(name: string): number {
  const value = Number(required(name))
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer.`)
  return value
}

function requiredDate(name: string): string {
  const value = required(name)
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${name} must be an ISO date.`)
  return new Date(value).toISOString()
}

function requiredHash(name: string): string {
  const value = required(name).toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error(`${name} must be SHA-256 hex.`)
  return value
}

export function hashActivationCodeForProvisioning(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}
