import { WRITING_PILOT_NOTICE_VERSION, type WritingEvaluationResult, type WritingRecognitionResult, type WritingServiceAuthority } from '../../domain/writingPilot'
import { resolveServerWritingTask } from './serverWritingCatalog'

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

export interface WritingBudgetLedger {
  reserve(input: { installationId: string; requestId: string; maximumCostMicros: number }): Promise<{ status: 'reserved'; remainingMicros: number } | { status: 'duplicate'; result: unknown } | { status: 'exhausted' }>
  complete(input: { installationId: string; requestId: string; result: unknown; actualCostMicros: number }): Promise<void>
  markUnknown(input: { installationId: string; requestId: string }): Promise<void>
}

export interface WritingInferenceProvider {
  transcribe(input: { imageDataUrl: string; layout: { width: number; height: number } }): Promise<{ result: WritingRecognitionResult; costMicros: number }>
  evaluate(input: { confirmedText: string; spellingAssessmentSupportable: boolean; task: NonNullable<ReturnType<typeof resolveServerWritingTask>> }): Promise<{ result: WritingEvaluationResult; costMicros: number }>
}

interface WritingPilotServiceOptions {
  allowedOrigins: string[]
  authorization: WritingAuthorizationStore
  budget: WritingBudgetLedger
  provider: WritingInferenceProvider
  maxRequestBytes?: number
  maxCostMicrosPerRequest: number
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
          'access-control-allow-headers': 'content-type',
          'access-control-max-age': '600',
        }),
      })
    }
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin, options.allowedOrigins)
    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (contentLength > maxRequestBytes) return json({ error: 'payload_too_large' }, 413, origin, options.allowedOrigins)
    const path = new URL(request.url).pathname.split('/').filter(Boolean).at(-1)
    const body = await readBoundedJson(request, maxRequestBytes)
    if (!body) return json({ error: 'invalid_request' }, 422, origin, options.allowedOrigins)

    if (path === 'activate') {
      if (typeof body.activationCode !== 'string' || body.consentVersion !== WRITING_PILOT_NOTICE_VERSION) return json({ error: 'consent_required' }, 412, origin, options.allowedOrigins)
      const installation = await options.authorization.exchangeActivationCode(body.activationCode)
      if (!installation || installation.consentVersion !== WRITING_PILOT_NOTICE_VERSION) return json({ error: 'unauthorized' }, 403, origin, options.allowedOrigins)
      if (installation.retentionControl !== 'approved_zero_data_retention') return json({ error: 'retention_not_approved' }, 503, origin, options.allowedOrigins)
      if (installation.budgetLimitMicros <= 0) return json({ error: 'budget_exhausted' }, 429, origin, options.allowedOrigins)
      const session = await options.authorization.createSession(installation.installationId)
      const authority: WritingServiceAuthority = {
        status: 'authorized',
        installationId: installation.installationId,
        endpointId: 'rrq-writing-pilot-v1',
        retentionControl: installation.retentionControl,
        approvedAt: now().toISOString(),
        expiresAt: session.expiresAt,
        budgetLimitMicros: installation.budgetLimitMicros,
        budgetRemainingMicros: installation.budgetLimitMicros,
      }
      return json(authority, 200, origin, options.allowedOrigins, sessionCookie(session.token, session.expiresAt))
    }

    const token = cookieValue(request.headers.get('cookie'), 'rrq_writing_session')
    const installation = token ? await options.authorization.resolveSession(token) : null
    if (!installation || Date.parse(installation.authorizationExpiresAt) <= now().getTime()) return json({ error: 'unauthorized' }, 401, origin, options.allowedOrigins)
    if (installation.consentVersion !== WRITING_PILOT_NOTICE_VERSION) return json({ error: 'consent_required' }, 412, origin, options.allowedOrigins)
    if (installation.retentionControl !== 'approved_zero_data_retention') return json({ error: 'retention_not_approved' }, 503, origin, options.allowedOrigins)

    if (path === 'revoke') {
      await options.authorization.revokeSession(token as string)
      return json({ revoked: true }, 200, origin, options.allowedOrigins, 'rrq_writing_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
    }

    if ((path !== 'transcribe' && path !== 'evaluate') || typeof body.requestId !== 'string' || body.requestId.length > 160) {
      return json({ error: 'invalid_request' }, 422, origin, options.allowedOrigins)
    }
    if (path === 'transcribe' && !validTranscriptionBody(body)) return json({ error: 'invalid_request' }, 422, origin, options.allowedOrigins)
    if (path === 'evaluate' && !validEvaluationBody(body)) return json({ error: 'invalid_request' }, 422, origin, options.allowedOrigins)
    const task = resolveServerWritingTask({
      activityId: body.activityId as string,
      sourceContentVersion: body.sourceContentVersion as string,
      rubricVersion: path === 'transcribe' ? inferRubricVersion(body.activityId as string) : body.rubricVersion as string,
    })
    if (!task) return json({ error: 'unknown_activity' }, 422, origin, options.allowedOrigins)
    const reservation = await options.budget.reserve({
      installationId: installation.installationId,
      requestId: body.requestId,
      maximumCostMicros: options.maxCostMicrosPerRequest,
    })
    if (reservation.status === 'exhausted') return json({ error: 'budget_exhausted' }, 429, origin, options.allowedOrigins)
    if (reservation.status === 'duplicate') return reservation.result
      ? json(reservation.result, 200, origin, options.allowedOrigins)
      : json({ error: 'request_unresolved' }, 409, origin, options.allowedOrigins)

    try {
      if (path === 'transcribe') {
        const transcribeBody = body as Record<string, unknown> & { imageDataUrl: string; layout: { width: number; height: number } }
        const output = await options.provider.transcribe({ imageDataUrl: transcribeBody.imageDataUrl, layout: transcribeBody.layout })
        if (!validProviderCost(output.costMicros, options.maxCostMicrosPerRequest)) throw new Error('Provider cost was outside the reserved bound.')
        await options.budget.complete({ installationId: installation.installationId, requestId: body.requestId, result: output.result, actualCostMicros: output.costMicros })
        return json(output.result, 200, origin, options.allowedOrigins)
      }
      const evaluateBody = body as Record<string, unknown> & { confirmedText: string; spellingAssessmentSupportable: boolean }
      const output = await options.provider.evaluate({ confirmedText: evaluateBody.confirmedText, spellingAssessmentSupportable: evaluateBody.spellingAssessmentSupportable, task })
      if (!validProviderCost(output.costMicros, options.maxCostMicrosPerRequest)
        || !validEvaluationAgainstTask(output.result, evaluateBody.confirmedText, evaluateBody.spellingAssessmentSupportable, task.rubric.relevantEvidence.map((entry) => entry.evidenceId))) {
        throw new Error('Provider feedback did not satisfy the source-bound response contract.')
      }
      await options.budget.complete({ installationId: installation.installationId, requestId: body.requestId, result: output.result, actualCostMicros: output.costMicros })
      return json(output.result, 200, origin, options.allowedOrigins)
    } catch {
      await options.budget.markUnknown({ installationId: installation.installationId, requestId: body.requestId })
      return json({ error: 'provider_outcome_unknown' }, 409, origin, options.allowedOrigins)
    }
  }
}

function validProviderCost(value: number, maximum: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= maximum
}

function validEvaluationAgainstTask(
  result: WritingEvaluationResult,
  confirmedText: string,
  spellingAssessmentSupportable: boolean,
  allowedEvidenceIds: readonly string[],
): boolean {
  const feedback = result.feedback
  if (!spellingAssessmentSupportable && feedback.spelling.status !== 'withheld') return false
  const categories = [feedback.comprehension, feedback.supportingEvidence, feedback.spelling, feedback.grammar, feedback.capitalizationPunctuation]
  if (categories.some((category) => category.evidenceIds.some((evidenceId) => !allowedEvidenceIds.includes(evidenceId)))) return false
  return feedback.improvements.every((improvement) => (
    improvement.originalText === null
    || (improvement.originalText.length > 0 && confirmedText.includes(improvement.originalText))
  ))
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

function validTranscriptionBody(body: Record<string, unknown>): body is Record<string, unknown> & { activityId: string; sourceContentVersion: string; imageDataUrl: string; layout: { width: number; height: number } } {
  return typeof body.activityId === 'string'
    && typeof body.sourceContentVersion === 'string'
    && typeof body.imageDataUrl === 'string'
    && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(body.imageDataUrl)
    && body.imageDataUrl.length <= 1_500_000
    && isRecord(body.layout)
    && Number.isFinite(body.layout.width)
    && Number.isFinite(body.layout.height)
}

function validEvaluationBody(body: Record<string, unknown>): body is Record<string, unknown> & { activityId: string; sourceContentVersion: string; rubricVersion: string; confirmedText: string; spellingAssessmentSupportable: boolean } {
  return typeof body.activityId === 'string'
    && typeof body.sourceContentVersion === 'string'
    && typeof body.rubricVersion === 'string'
    && typeof body.confirmedText === 'string'
    && body.confirmedText.length > 0
    && body.confirmedText.length <= 500
    && typeof body.spellingAssessmentSupportable === 'boolean'
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

function json(value: unknown, status: number, origin: string, allowed: string[], cookie?: string): Response {
  const headers = corsHeaders(origin, allowed, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  if (cookie) headers.set('set-cookie', cookie)
  return new Response(JSON.stringify(value), { status, headers })
}

function corsHeaders(origin: string, allowed: string[], values: Record<string, string>): Headers {
  const headers = new Headers({ ...values, vary: 'Origin' })
  if (allowed.includes(origin)) {
    headers.set('access-control-allow-origin', origin)
    headers.set('access-control-allow-credentials', 'true')
  }
  return headers
}

function sessionCookie(token: string, expiresAt: string) {
  return `rrq_writing_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=${new Date(expiresAt).toUTCString()}`
}

function cookieValue(header: string | null, name: string): string | null {
  const match = header?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
