import { validateWritingFeedback } from '../../persistence/writingPilotStore'
import type {
  WritingEvaluationResult,
  WritingFeedback,
  WritingRecognitionResult,
  WritingServiceAuthority,
} from '../../domain/writingPilot'
import {
  createIndexedDbWritingPilotCredentialStore,
  type WritingPilotCredentialStore,
} from './writingPilotCredentialStore'

export type WritingServiceFailureCode =
  | 'unavailable'
  | 'unauthorized'
  | 'consent_required'
  | 'retention_not_approved'
  | 'budget_exhausted'
  | 'quota_exhausted'
  | 'application_quota_exhausted'
  | 'temporarily_unavailable'
  | 'timeout_unknown'
  | 'invalid_response'
  | 'request_failed'
  | 'revocation_unknown'
  | 'parent_review_required'
  | 'provider_refused'
  | 'request_identity_conflict'

export type WritingServiceResult<T> =
  | { status: 'ok'; value: T }
  | { status: 'error'; code: WritingServiceFailureCode; message: string; retryable: boolean }

export interface WritingPilotClient {
  endpointId: string
  activate(activationCode: string, consentVersion: string): Promise<WritingServiceResult<WritingServiceAuthority>>
  revoke(): Promise<WritingServiceResult<{ revoked: true }>>
  transcribe(input: {
    requestId: string
    submissionId: string
    activityId: string
    sourceContentVersion: string
    inkRevision: number
    imageDataUrl: string
    layout: { width: number; height: number }
  }): Promise<WritingServiceResult<WritingRecognitionResult>>
  evaluate(input: {
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
  }): Promise<WritingServiceResult<WritingEvaluationResult>>
}

interface ClientOptions {
  baseUrl?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
  credentials?: WritingPilotCredentialStore
}

interface ActivationWire extends WritingServiceAuthority {
  installationToken: string
}

export function createWritingPilotClient(options: ClientOptions = {}): WritingPilotClient {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const timeoutMs = options.timeoutMs ?? 25_000
  const baseUrl = resolveBaseUrl(options.baseUrl)
  const endpointId = baseUrl ? new URL(baseUrl).origin + new URL(baseUrl).pathname : 'unconfigured'
  const credentials = options.credentials ?? createIndexedDbWritingPilotCredentialStore()

  const request = async <T>(
    path: string,
    init: RequestInit,
    validate: (value: unknown) => T | null,
    tokenOverride?: string,
  ): Promise<WritingServiceResult<T>> => {
    if (!baseUrl || typeof fetchImpl !== 'function') return failure('unavailable', 'Protected writing processing is not configured.', false)
    let token = tokenOverride
    if (path !== 'activate' && !token) {
      try {
        token = await credentials.load(endpointId) ?? undefined
      } catch {
        return failure('unavailable', 'Private installation authorization storage is unavailable.', false)
      }
      if (!token) return failure('unauthorized', 'Protected writing authorization is not active.', false)
    }
    const controller = new AbortController()
    const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchImpl(new URL(path, baseUrl), {
        ...init,
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...init.headers,
        },
      })
      const parsed: unknown = await response.json().catch(() => null)
      if (!response.ok) return responseFailure(response.status, parsed)
      const value = validate(parsed)
      return value ? { status: 'ok', value } : failure('invalid_response', 'The writing service returned an invalid result.', false)
    } catch (error) {
      if (controller.signal.aborted) return failure('timeout_unknown', 'The protected request outcome is unknown. The work was saved for parent review.', false)
      return failure('request_failed', error instanceof Error ? error.message : 'The protected request failed.', true)
    } finally {
      globalThis.clearTimeout(timer)
    }
  }

  return {
    endpointId,
    async activate(activationCode, consentVersion) {
      const result = await request('activate', {
        method: 'POST',
        body: JSON.stringify({ activationCode, consentVersion }),
      }, validateActivation)
      if (result.status !== 'ok') return result
      try {
        await credentials.save(endpointId, result.value.installationToken)
      } catch {
        return failure('unavailable', 'Installation authorization could not be protected on this browser.', false)
      }
      const { installationToken: _installationToken, ...authority } = result.value
      return { status: 'ok', value: authority }
    },
    async revoke() {
      let token: string | null = null
      try {
        token = await credentials.load(endpointId)
        if (!token) return failure('unauthorized', 'Protected writing authorization is not active.', false)
        const result = await request('revoke', { method: 'POST', body: '{}' }, validateRevocation, token)
        await credentials.clear(endpointId)
        return result
      } catch {
        if (token) await credentials.clear(endpointId).catch(() => undefined)
        return failure('revocation_unknown', 'Remote authorization could not be confirmed. Local authorization was removed.', false)
      }
    },
    transcribe: (input) => request('transcribe', { method: 'POST', body: JSON.stringify(input) }, validateRecognition),
    evaluate: (input) => request('evaluate', { method: 'POST', body: JSON.stringify(input) }, validateEvaluation),
  }
}

function resolveBaseUrl(explicit?: string): string | null {
  if (explicit) return ensureTrailingSlash(explicit)
  if (typeof document === 'undefined') return null
  const configured = import.meta.env.VITE_RRQ_WRITING_SERVICE_URL?.trim()
  return ensureTrailingSlash(configured || new URL('api/read-write/v1/', document.baseURI).toString())
}

function validateActivation(value: unknown): ActivationWire | null {
  const authority = validateAuthority(value)
  if (!authority || !isRecord(value) || typeof value.installationToken !== 'string' || value.installationToken.length < 32) return null
  return { ...authority, installationToken: value.installationToken }
}

function validateAuthority(value: unknown): WritingServiceAuthority | null {
  if (!isRecord(value)
    || value.status !== 'authorized'
    || value.authMode !== 'installation_bearer_v1'
    || typeof value.installationId !== 'string'
    || typeof value.endpointId !== 'string'
    || value.provider !== 'cloudflare_workers_ai'
    || value.retentionControl !== 'cloudflare_workers_ai_no_training'
    || value.quotaPolicy !== 'cloudflare_free_only_v1'
    || value.model !== '@cf/google/gemma-4-26b-a4b-it'
    || typeof value.approvedAt !== 'string'
    || typeof value.expiresAt !== 'string'
    || typeof value.freePlanVerifiedAt !== 'string'
    || typeof value.quotaResetsAt !== 'string'
    || !Number.isFinite(Date.parse(value.approvedAt))
    || !Number.isFinite(Date.parse(value.expiresAt))
    || !Number.isFinite(Date.parse(value.freePlanVerifiedAt))
    || !Number.isFinite(Date.parse(value.quotaResetsAt))
    || !Number.isSafeInteger(value.dailyApplicationNeuronLimit)
    || Number(value.dailyApplicationNeuronLimit) <= 0
    || !Number.isSafeInteger(value.dailyApplicationNeuronsRemaining)
    || Number(value.dailyApplicationNeuronsRemaining) < 0
    || value.actualPaidSpendingMicros !== 0) return null
  return value as unknown as WritingServiceAuthority
}

function validateRevocation(value: unknown) {
  return isRecord(value) && value.revoked === true ? { revoked: true as const } : null
}

function validateRecognition(value: unknown): WritingRecognitionResult | null {
  if (!isRecord(value)
    || typeof value.rawTranscription !== 'string'
    || value.rawTranscription.length > 500
    || !Array.isArray(value.uncertainties)
    || typeof value.spellingAssessmentSupportable !== 'boolean'
    || !['cloudflare_workers_ai', 'openai', 'mocked'].includes(String(value.provider))) return null
  if (!value.uncertainties.every((entry) => isRecord(entry)
    && typeof entry.text === 'string'
    && typeof entry.reason === 'string'
    && typeof entry.affectsMeaning === 'boolean')) return null
  return value as unknown as WritingRecognitionResult
}

function validateEvaluation(value: unknown): WritingEvaluationResult | null {
  if (!isRecord(value) || !['cloudflare_workers_ai', 'openai', 'mocked'].includes(String(value.provider)) || !validateWritingFeedback(value.feedback)) return null
  return { feedback: value.feedback as WritingFeedback, provider: value.provider as WritingEvaluationResult['provider'] }
}

function responseFailure(status: number, value: unknown): WritingServiceResult<never> {
  const code = isRecord(value) && typeof value.error === 'string' ? value.error : ''
  if (code === 'parent_review_required' || code === 'safety_review_required') return failure('parent_review_required', 'The writing was saved for calm parent review.', false)
  if (code === 'provider_refused') return failure('provider_refused', 'The writing was saved for parent review because feedback was unavailable.', false)
  if (code === 'request_identity_conflict') return failure('request_identity_conflict', 'This protected request identity does not match the saved writing.', false)
  if (code === 'free_quota_exhausted' || code === 'provider_daily_quota' || code === 'cloudflare_3036') {
    return failure('quota_exhausted', 'Free AI checking is finished until the next 00:00 UTC reset.', false)
  }
  if (code === 'application_quota_exhausted') {
    return failure('application_quota_exhausted', 'This installation has reached its conservative free-AI allowance for today.', false)
  }
  if (code === 'capacity_unavailable' || code === 'provider_rate_limited' || code === 'cloudflare_3040') {
    return failure('temporarily_unavailable', 'Free AI checking is temporarily unavailable.', true)
  }
  if (code === 'paid_plan_required' || code === 'cloudflare_5035') {
    return failure('unavailable', 'This model is unavailable under the required free-only policy.', false)
  }
  if (status === 401 || status === 403) return failure('unauthorized', 'Protected writing authorization is not active.', false)
  if (status === 409) return failure('timeout_unknown', 'A request with this identity is still unresolved. The work was saved for parent review.', false)
  if (status === 412) return failure('consent_required', 'Parent consent must be renewed before external processing.', false)
  if (status === 422) return failure('invalid_response', 'The writing service rejected the bounded request.', false)
  if (status === 429) return failure('temporarily_unavailable', 'Free AI checking is temporarily unavailable.', true)
  if (status === 402) return failure('unavailable', 'Paid processing is prohibited for this pilot.', false)
  if (status === 503 && code === 'retention_not_approved') return failure('retention_not_approved', 'Approved child-data retention controls are not active.', false)
  return failure('unavailable', 'Protected writing processing is unavailable.', status >= 500)
}

function failure(code: WritingServiceFailureCode, message: string, retryable: boolean): WritingServiceResult<never> {
  return { status: 'error', code, message, retryable }
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
