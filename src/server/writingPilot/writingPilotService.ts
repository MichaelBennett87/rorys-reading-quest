import {
  WRITING_PILOT_NOTICE_VERSION,
  type WritingEvaluationResult,
  type WritingRecognitionResult,
} from '../../domain/writingPilot'
import { validateWritingFeedback } from '../../persistence/writingPilotStore'
import { resolveServerWritingTask } from './serverWritingCatalog'

export type WritingProviderOperation = 'transcribe' | 'evaluate'

interface LegacyControlledServiceAuthority {
  status: 'authorized'
  authMode: 'installation_bearer_v1'
  installationId: string
  endpointId: string
  retentionControl: 'approved_zero_data_retention'
  approvedAt: string
  expiresAt: string
  budgetLimitMicros: number
  budgetRemainingMicros: number
}

export type WritingProviderBilling =
  | {
      status: 'observed'
      model: string
      pricingVersion: string
      inputTokens: number
      outputTokens: number
      totalTokens: number
      costMicros: number
    }
  | { status: 'not_incurred'; model: string }
  | { status: 'unknown'; model: string }

export type WritingInferenceOutcome<T> =
  | { status: 'completed'; result: T; billing: Extract<WritingProviderBilling, { status: 'observed' }> }
  | { status: 'review_required'; code: 'safety_flagged' | 'safety_unavailable'; billing: WritingProviderBilling }
  | { status: 'refused'; code: 'provider_refused'; billing: WritingProviderBilling }
  | {
      status: 'failed'
      code: 'provider_failure' | 'invalid_provider_output' | 'usage_unavailable'
      outcome: 'definite' | 'unknown'
      billing: WritingProviderBilling
    }

export interface ApprovedWritingInstallation {
  installationId: string
  consentVersion: string
  authorizationExpiresAt: string
  retentionControl: 'approved_zero_data_retention'
  budgetLimitMicros: number
}

export interface WritingAuthorizationStore {
  exchangeActivationCode(code: string): Promise<ApprovedWritingInstallation | null>
  createSession(installationId: string): Promise<{ token: string; expiresAt: string }>
  resolveSession(token: string): Promise<ApprovedWritingInstallation | null>
  revokeSession(token: string): Promise<void>
}

export interface StoredWritingServiceResponse {
  status: number
  body: unknown
}

export interface WritingRecognitionProvenance {
  requestId: string
  activityId: string
  submissionId: string
  inkRevision: number
  rawTranscriptionHash: string
  spellingAssessmentSupportable: boolean
  meaningUncertain: boolean
}

export interface WritingBudgetLedger {
  getRemaining(installationId: string, limitMicros: number): Promise<number>
  reserve(input: {
    installationId: string
    operation: WritingProviderOperation
    requestId: string
    payloadHash: string
    maximumCostMicros: number
    limitMicros: number
  }): Promise<
    | { status: 'reserved'; remainingMicros: number }
    | { status: 'duplicate'; response: StoredWritingServiceResponse }
    | { status: 'unresolved' }
    | { status: 'identity_conflict' }
    | { status: 'exhausted' }
  >
  complete(input: {
    installationId: string
    operation: WritingProviderOperation
    requestId: string
    payloadHash: string
    response: StoredWritingServiceResponse
    actualCostMicros: number
    billing: WritingProviderBilling
    recognitionProvenance?: WritingRecognitionProvenance
  }): Promise<void>
  markUnknown(input: {
    installationId: string
    operation: WritingProviderOperation
    requestId: string
    payloadHash: string
  }): Promise<void>
  resolveRecognition(installationId: string, requestId: string): Promise<WritingRecognitionProvenance | null>
}

export interface WritingInferenceProvider {
  maximumCostMicros(operation: WritingProviderOperation): number
  transcribe(input: {
    imageDataUrl: string
    layout: { width: number; height: number }
  }): Promise<WritingInferenceOutcome<WritingRecognitionResult>>
  evaluate(input: {
    confirmedText: string
    spellingAssessmentSupportable: boolean
    task: NonNullable<ReturnType<typeof resolveServerWritingTask>>
  }): Promise<WritingInferenceOutcome<WritingEvaluationResult>>
}

interface WritingPilotServiceOptions {
  allowedOrigins: string[]
  authorization: WritingAuthorizationStore
  budget: WritingBudgetLedger
  provider: WritingInferenceProvider
  maxRequestBytes?: number
  now?: () => Date
}

export function createWritingPilotService(options: WritingPilotServiceOptions) {
  const maxRequestBytes = options.maxRequestBytes ?? 1_600_000
  const now = options.now ?? (() => new Date())

  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin') ?? ''
    if (!options.allowedOrigins.includes(origin)) return json({ error: 'origin_not_allowed' }, 403, origin, options.allowedOrigins)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, options.allowedOrigins, {
          'access-control-allow-methods': 'POST, OPTIONS',
          'access-control-allow-headers': 'authorization, content-type',
          'access-control-max-age': '600',
        }),
      })
    }
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin, options.allowedOrigins)
    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (!Number.isFinite(contentLength) || contentLength < 0 || contentLength > maxRequestBytes) {
      return json({ error: 'payload_too_large' }, 413, origin, options.allowedOrigins)
    }
    const path = new URL(request.url).pathname.split('/').filter(Boolean).at(-1)
    const body = await readBoundedJson(request, maxRequestBytes)
    if (!body) return json({ error: 'invalid_request' }, 422, origin, options.allowedOrigins)

    if (path === 'activate') {
      if (typeof body.activationCode !== 'string' || body.consentVersion !== WRITING_PILOT_NOTICE_VERSION) {
        return json({ error: 'consent_required' }, 412, origin, options.allowedOrigins)
      }
      const installation = await options.authorization.exchangeActivationCode(body.activationCode)
      if (!validInstallation(installation, now())) return json({ error: 'unauthorized' }, 403, origin, options.allowedOrigins)
      if (installation.consentVersion !== WRITING_PILOT_NOTICE_VERSION) return json({ error: 'consent_required' }, 412, origin, options.allowedOrigins)
      if (installation.retentionControl !== 'approved_zero_data_retention') return json({ error: 'retention_not_approved' }, 503, origin, options.allowedOrigins)
      if (installation.budgetLimitMicros <= 0) return json({ error: 'budget_exhausted' }, 429, origin, options.allowedOrigins)
      const session = await options.authorization.createSession(installation.installationId)
      const sessionExpiry = Date.parse(session.expiresAt)
      const installationExpiry = Date.parse(installation.authorizationExpiresAt)
      if (session.token.length < 32 || !Number.isFinite(sessionExpiry) || sessionExpiry <= now().getTime()) {
        return json({ error: 'authorization_unavailable' }, 503, origin, options.allowedOrigins)
      }
      const expiresAt = new Date(Math.min(sessionExpiry, installationExpiry)).toISOString()
      const authority: LegacyControlledServiceAuthority = {
        status: 'authorized',
        authMode: 'installation_bearer_v1',
        installationId: installation.installationId,
        endpointId: 'rrq-writing-pilot-v1',
        retentionControl: installation.retentionControl,
        approvedAt: now().toISOString(),
        expiresAt,
        budgetLimitMicros: installation.budgetLimitMicros,
        budgetRemainingMicros: await options.budget.getRemaining(installation.installationId, installation.budgetLimitMicros),
      }
      return json({ ...authority, installationToken: session.token }, 200, origin, options.allowedOrigins)
    }

    const token = bearerToken(request.headers.get('authorization'))
    const installation = token ? await options.authorization.resolveSession(token) : null
    if (!validInstallation(installation, now())) return json({ error: 'unauthorized' }, 401, origin, options.allowedOrigins)
    if (installation.consentVersion !== WRITING_PILOT_NOTICE_VERSION) return json({ error: 'consent_required' }, 412, origin, options.allowedOrigins)
    if (installation.retentionControl !== 'approved_zero_data_retention') return json({ error: 'retention_not_approved' }, 503, origin, options.allowedOrigins)

    if (path === 'revoke') {
      await options.authorization.revokeSession(token as string)
      return json({ revoked: true }, 200, origin, options.allowedOrigins)
    }
    if ((path !== 'transcribe' && path !== 'evaluate') || !validRequestId(body.requestId)) {
      return json({ error: 'invalid_request' }, 422, origin, options.allowedOrigins)
    }
    if (path === 'transcribe' && !validTranscriptionBody(body)) return json({ error: 'invalid_request' }, 422, origin, options.allowedOrigins)
    if (path === 'evaluate' && !validEvaluationBody(body)) return json({ error: 'invalid_request' }, 422, origin, options.allowedOrigins)

    const operation: WritingProviderOperation = path
    const task = resolveServerWritingTask({
      activityId: body.activityId as string,
      sourceContentVersion: body.sourceContentVersion as string,
      rubricVersion: path === 'transcribe' ? inferRubricVersion(body.activityId as string) : body.rubricVersion as string,
    })
    if (!task) return json({ error: 'unknown_activity' }, 422, origin, options.allowedOrigins)

    const maximumCostMicros = options.provider.maximumCostMicros(operation)
    if (!Number.isSafeInteger(maximumCostMicros) || maximumCostMicros <= 0 || maximumCostMicros > installation.budgetLimitMicros) {
      return json({ error: 'budget_configuration_invalid' }, 503, origin, options.allowedOrigins)
    }
    const payloadHash = await hashJson(body)
    const reservation = await options.budget.reserve({
      installationId: installation.installationId,
      operation,
      requestId: body.requestId,
      payloadHash,
      maximumCostMicros,
      limitMicros: installation.budgetLimitMicros,
    })
    if (reservation.status === 'exhausted') return json({ error: 'budget_exhausted' }, 429, origin, options.allowedOrigins)
    if (reservation.status === 'identity_conflict') return json({ error: 'request_identity_conflict' }, 409, origin, options.allowedOrigins)
    if (reservation.status === 'unresolved') return json({ error: 'request_unresolved' }, 409, origin, options.allowedOrigins)
    if (reservation.status === 'duplicate') return json(reservation.response.body, reservation.response.status, origin, options.allowedOrigins)

    if (path === 'transcribe') {
      const transcribeBody = body as TranscriptionBody
      let outcome: WritingInferenceOutcome<WritingRecognitionResult>
      try {
        outcome = await options.provider.transcribe({ imageDataUrl: transcribeBody.imageDataUrl, layout: transcribeBody.layout })
      } catch {
        await options.budget.markUnknown({ installationId: installation.installationId, operation, requestId: body.requestId, payloadHash })
        return json({ error: 'provider_outcome_unknown' }, 409, origin, options.allowedOrigins)
      }
      if (outcome.status !== 'completed') return settleNonCompletion(outcome, operation, installation.installationId, body.requestId, payloadHash, maximumCostMicros, options, origin)
      if (!validBilling(outcome.billing, maximumCostMicros)) {
        await options.budget.markUnknown({ installationId: installation.installationId, operation, requestId: body.requestId, payloadHash })
        return json({ error: 'provider_outcome_unknown' }, 409, origin, options.allowedOrigins)
      }
      if (!validRecognitionResult(outcome.result)) {
        const response: StoredWritingServiceResponse = { status: 422, body: { error: 'provider_output_invalid' } }
        await options.budget.complete({
          installationId: installation.installationId,
          operation,
          requestId: body.requestId,
          payloadHash,
          response,
          actualCostMicros: outcome.billing.costMicros,
          billing: outcome.billing,
        })
        return json(response.body, response.status, origin, options.allowedOrigins)
      }
      const response: StoredWritingServiceResponse = { status: 200, body: outcome.result }
      const provenance: WritingRecognitionProvenance = {
        requestId: body.requestId,
        activityId: transcribeBody.activityId,
        submissionId: transcribeBody.submissionId,
        inkRevision: transcribeBody.inkRevision,
        rawTranscriptionHash: await hashText(outcome.result.rawTranscription.trim()),
        spellingAssessmentSupportable: outcome.result.spellingAssessmentSupportable,
        meaningUncertain: outcome.result.uncertainties.some((entry) => entry.affectsMeaning),
      }
      await options.budget.complete({
        installationId: installation.installationId,
        operation,
        requestId: body.requestId,
        payloadHash,
        response,
        actualCostMicros: outcome.billing.costMicros,
        billing: outcome.billing,
        recognitionProvenance: provenance,
      })
      return json(response.body, response.status, origin, options.allowedOrigins)
    }

    const evaluateBody = body as EvaluationBody
    const spellingAssessmentSupportable = await deriveSpellingSupportability(options.budget, installation.installationId, evaluateBody)
    if (spellingAssessmentSupportable.status !== 'ok') {
      const response: StoredWritingServiceResponse = { status: 422, body: { error: spellingAssessmentSupportable.error } }
      await options.budget.complete({
        installationId: installation.installationId,
        operation,
        requestId: body.requestId,
        payloadHash,
        response,
        actualCostMicros: 0,
        billing: { status: 'not_incurred', model: 'not_called' },
      })
      return json(response.body, response.status, origin, options.allowedOrigins)
    }
    let outcome: WritingInferenceOutcome<WritingEvaluationResult>
    try {
      outcome = await options.provider.evaluate({ confirmedText: evaluateBody.confirmedText, spellingAssessmentSupportable: spellingAssessmentSupportable.value, task })
    } catch {
      await options.budget.markUnknown({ installationId: installation.installationId, operation, requestId: body.requestId, payloadHash })
      return json({ error: 'provider_outcome_unknown' }, 409, origin, options.allowedOrigins)
    }
    if (outcome.status !== 'completed') return settleNonCompletion(outcome, operation, installation.installationId, body.requestId, payloadHash, maximumCostMicros, options, origin)
    if (!validBilling(outcome.billing, maximumCostMicros)
      || !validEvaluationAgainstTask(outcome.result, evaluateBody.confirmedText, spellingAssessmentSupportable.value, task.rubric.relevantEvidence.map((entry) => entry.evidenceId))) {
      const response: StoredWritingServiceResponse = { status: 422, body: { error: 'provider_output_invalid' } }
      await options.budget.complete({
        installationId: installation.installationId,
        operation,
        requestId: body.requestId,
        payloadHash,
        response,
        actualCostMicros: validBilling(outcome.billing, maximumCostMicros) ? outcome.billing.costMicros : maximumCostMicros,
        billing: outcome.billing,
      })
      return json(response.body, response.status, origin, options.allowedOrigins)
    }
    const response: StoredWritingServiceResponse = { status: 200, body: outcome.result }
    await options.budget.complete({
      installationId: installation.installationId,
      operation,
      requestId: body.requestId,
      payloadHash,
      response,
      actualCostMicros: outcome.billing.costMicros,
      billing: outcome.billing,
    })
    return json(response.body, response.status, origin, options.allowedOrigins)
  }
}

async function settleNonCompletion<T>(
  outcome: Exclude<WritingInferenceOutcome<T>, { status: 'completed' }>,
  operation: WritingProviderOperation,
  installationId: string,
  requestId: string,
  payloadHash: string,
  maximumCostMicros: number,
  options: WritingPilotServiceOptions,
  origin: string,
): Promise<Response> {
  if (outcome.billing.status === 'unknown' || (outcome.status === 'failed' && outcome.outcome === 'unknown')) {
    await options.budget.markUnknown({ installationId, operation, requestId, payloadHash })
    return json({ error: 'provider_outcome_unknown' }, 409, origin, options.allowedOrigins)
  }
  const actualCostMicros = outcome.billing.status === 'observed' ? outcome.billing.costMicros : 0
  if (!Number.isSafeInteger(actualCostMicros) || actualCostMicros < 0 || actualCostMicros > maximumCostMicros) {
    await options.budget.markUnknown({ installationId, operation, requestId, payloadHash })
    return json({ error: 'provider_outcome_unknown' }, 409, origin, options.allowedOrigins)
  }
  const response: StoredWritingServiceResponse = outcome.status === 'review_required'
    ? { status: 409, body: { error: 'parent_review_required' } }
    : outcome.status === 'refused'
      ? { status: 409, body: { error: 'provider_refused' } }
      : { status: 503, body: { error: 'provider_failure' } }
  await options.budget.complete({ installationId, operation, requestId, payloadHash, response, actualCostMicros, billing: outcome.billing })
  return json(response.body, response.status, origin, options.allowedOrigins)
}

async function deriveSpellingSupportability(
  budget: WritingBudgetLedger,
  installationId: string,
  body: EvaluationBody,
): Promise<{ status: 'ok'; value: boolean } | { status: 'error'; error: string }> {
  if (body.inputMode === 'typed') {
    return body.recognitionRequestId === null
      ? { status: 'ok', value: false }
      : { status: 'error', error: 'recognition_provenance_invalid' }
  }
  if (!body.recognitionRequestId) return { status: 'error', error: 'recognition_provenance_required' }
  const provenance = await budget.resolveRecognition(installationId, body.recognitionRequestId)
  if (!provenance
    || provenance.activityId !== body.activityId
    || provenance.submissionId !== body.submissionId
    || provenance.inkRevision !== body.inkRevision) return { status: 'error', error: 'recognition_provenance_invalid' }
  if (provenance.meaningUncertain) return { status: 'error', error: 'parent_review_required' }
  const unchanged = provenance.rawTranscriptionHash === await hashText(body.confirmedText.trim())
  return {
    status: 'ok',
    value: unchanged && body.transcriptionConfirmedBy === 'learner' && provenance.spellingAssessmentSupportable,
  }
}

function validInstallation(value: ApprovedWritingInstallation | null, now: Date): value is ApprovedWritingInstallation {
  if (!value
    || !value.installationId
    || !Number.isSafeInteger(value.budgetLimitMicros)
    || value.budgetLimitMicros <= 0) return false
  const expiry = Date.parse(value.authorizationExpiresAt)
  return Number.isFinite(expiry) && expiry > now.getTime()
}

function validBilling(value: WritingProviderBilling, maximum: number): value is Extract<WritingProviderBilling, { status: 'observed' }> {
  return value.status === 'observed'
    && Number.isSafeInteger(value.costMicros)
    && value.costMicros >= 0
    && value.costMicros <= maximum
}

function validEvaluationAgainstTask(
  result: WritingEvaluationResult,
  confirmedText: string,
  spellingAssessmentSupportable: boolean,
  allowedEvidenceIds: readonly string[],
): boolean {
  if (!result || !validateWritingFeedback(result.feedback)) return false
  const feedback = result.feedback
  if (!spellingAssessmentSupportable && feedback.spelling.status !== 'withheld') return false
  const categories = [feedback.comprehension, feedback.supportingEvidence, feedback.spelling, feedback.grammar, feedback.capitalizationPunctuation]
  if (categories.some((category) => category.evidenceIds.some((evidenceId) => !allowedEvidenceIds.includes(evidenceId)))) return false
  return feedback.improvements.every((improvement) => (
    improvement.originalText === null
    || (improvement.originalText.length > 0 && confirmedText.includes(improvement.originalText))
  ))
}

function validRecognitionResult(result: WritingRecognitionResult): boolean {
  return Boolean(result)
    && typeof result.rawTranscription === 'string'
    && result.rawTranscription.length <= 500
    && typeof result.spellingAssessmentSupportable === 'boolean'
    && ['openai', 'mocked'].includes(result.provider)
    && Array.isArray(result.uncertainties)
    && result.uncertainties.length <= 12
    && result.uncertainties.every((entry) => typeof entry.text === 'string'
      && typeof entry.reason === 'string'
      && typeof entry.affectsMeaning === 'boolean')
}

function inferRubricVersion(activityId: string): string {
  const mapping: Record<string, string> = {
    'rw-g2-tia-wrappers-reason': 'rw-rubric-tia-r1',
    'rw-g2-tia-solution': 'rw-rubric-tia-r2',
    'rw-g2-bridge-brace-reason': 'rw-rubric-bridge-r1',
    'rw-g2-bridge-proof': 'rw-rubric-bridge-r2',
    'rw-g3-jalen-new-plan': 'rw-rubric-jalen-r1',
    'rw-g3-jalen-change': 'rw-rubric-jalen-r2',
  }
  return mapping[activityId] ?? ''
}

interface TranscriptionBody extends Record<string, unknown> {
  requestId: string
  submissionId: string
  activityId: string
  sourceContentVersion: string
  inkRevision: number
  imageDataUrl: string
  layout: { width: number; height: number }
}

interface EvaluationBody extends Record<string, unknown> {
  requestId: string
  recognitionRequestId: string | null
  activityId: string
  sourceContentVersion: string
  rubricVersion: string
  submissionId: string
  inkRevision: number
  inputMode: 'handwriting' | 'typed' | 'mixed'
  transcriptionConfirmedBy: 'learner' | 'parent'
  confirmedText: string
}

function validRequestId(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 8 && value.length <= 160
}

function validTranscriptionBody(body: Record<string, unknown>): body is TranscriptionBody {
  if (typeof body.submissionId !== 'string' || body.submissionId.length > 160
    || typeof body.activityId !== 'string'
    || typeof body.sourceContentVersion !== 'string'
    || !Number.isSafeInteger(body.inkRevision) || Number(body.inkRevision) < 0
    || typeof body.imageDataUrl !== 'string'
    || !isRecord(body.layout)
    || !boundedDimension(body.layout.width, 4_096)
    || !boundedDimension(body.layout.height, 4_096)) return false
  return validPng(body.imageDataUrl)
}

function validEvaluationBody(body: Record<string, unknown>): body is EvaluationBody {
  return typeof body.activityId === 'string'
    && typeof body.sourceContentVersion === 'string'
    && typeof body.rubricVersion === 'string'
    && typeof body.submissionId === 'string'
    && (body.recognitionRequestId === null || validRequestId(body.recognitionRequestId))
    && Number.isSafeInteger(body.inkRevision)
    && Number(body.inkRevision) >= 0
    && ['handwriting', 'typed', 'mixed'].includes(String(body.inputMode))
    && ['learner', 'parent'].includes(String(body.transcriptionConfirmedBy))
    && typeof body.confirmedText === 'string'
    && body.confirmedText.trim().length > 0
    && body.confirmedText.length <= 500
}

function validPng(dataUrl: string): boolean {
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(dataUrl) || dataUrl.length > 1_500_000) return false
  try {
    const bytes = Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), (character) => character.charCodeAt(0))
    if (bytes.length < 24) return false
    const signature = [137, 80, 78, 71, 13, 10, 26, 10]
    if (!signature.every((value, index) => bytes[index] === value)) return false
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    return boundedDimension(view.getUint32(16), 4_096) && boundedDimension(view.getUint32(20), 4_096)
  } catch {
    return false
  }
}

function boundedDimension(value: unknown, maximum: number): value is number {
  return Number.isFinite(value) && Number(value) >= 1 && Number(value) <= maximum
}

async function readBoundedJson(request: Request, maxBytes: number): Promise<Record<string, unknown> | null> {
  try {
    const text = await request.text()
    if (new TextEncoder().encode(text).byteLength > maxBytes) return null
    const parsed: unknown = JSON.parse(text)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

async function hashJson(value: unknown): Promise<string> {
  return hashText(JSON.stringify(canonicalize(value)))
}

async function hashText(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!isRecord(value)) return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
}

function json(value: unknown, status: number, origin: string, allowed: string[]): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: corsHeaders(origin, allowed, { 'content-type': 'application/json', 'cache-control': 'no-store' }),
  })
}

function corsHeaders(origin: string, allowed: string[], values: Record<string, string>): Headers {
  const headers = new Headers({ ...values, vary: 'Origin' })
  if (allowed.includes(origin)) headers.set('access-control-allow-origin', origin)
  return headers
}

function bearerToken(header: string | null): string | null {
  const match = header?.match(/^Bearer ([A-Za-z0-9._~-]{32,512})$/)
  return match?.[1] ?? null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
