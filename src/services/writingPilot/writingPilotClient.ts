import {
  validateWritingFeedback,
} from '../../persistence/writingPilotStore'
import type {
  WritingEvaluationResult,
  WritingFeedback,
  WritingRecognitionResult,
  WritingServiceAuthority,
} from '../../domain/writingPilot'

export type WritingServiceFailureCode =
  | 'unavailable'
  | 'unauthorized'
  | 'consent_required'
  | 'retention_not_approved'
  | 'budget_exhausted'
  | 'timeout_unknown'
  | 'invalid_response'
  | 'request_failed'
  | 'revocation_unknown'

export type WritingServiceResult<T> =
  | { status: 'ok'; value: T }
  | { status: 'error'; code: WritingServiceFailureCode; message: string; retryable: boolean }

export interface WritingPilotClient {
  endpointId: string
  activate(activationCode: string, consentVersion: string): Promise<WritingServiceResult<WritingServiceAuthority>>
  revoke(): Promise<WritingServiceResult<{ revoked: true }>>
  transcribe(input: {
    requestId: string
    activityId: string
    sourceContentVersion: string
    inkRevision: number
    imageDataUrl: string
    layout: { width: number; height: number }
  }): Promise<WritingServiceResult<WritingRecognitionResult>>
  evaluate(input: {
    requestId: string
    activityId: string
    sourceContentVersion: string
    rubricVersion: string
    submissionId: string
    confirmedText: string
    spellingAssessmentSupportable: boolean
  }): Promise<WritingServiceResult<WritingEvaluationResult>>
}

interface ClientOptions {
  baseUrl?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

export function createWritingPilotClient(options: ClientOptions = {}): WritingPilotClient {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const timeoutMs = options.timeoutMs ?? 25_000
  const baseUrl = resolveBaseUrl(options.baseUrl)
  const endpointId = baseUrl ? new URL(baseUrl).origin + new URL(baseUrl).pathname : 'unconfigured'

  const request = async <T>(path: string, init: RequestInit, validate: (value: unknown) => T | null): Promise<WritingServiceResult<T>> => {
    if (!baseUrl || typeof fetchImpl !== 'function') return failure('unavailable', 'Protected writing processing is not configured.', false)
    const controller = new AbortController()
    const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchImpl(new URL(path, baseUrl), {
        ...init,
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
        headers: { 'content-type': 'application/json', ...init.headers },
      })
      if (!response.ok) return responseFailure(response.status)
      const parsed: unknown = await response.json()
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
    activate: (activationCode, consentVersion) => request('activate', {
      method: 'POST',
      body: JSON.stringify({ activationCode, consentVersion }),
    }, validateAuthority),
    revoke: () => request('revoke', { method: 'POST', body: '{}' }, (value) => (
      isRecord(value) && value.revoked === true ? { revoked: true as const } : null
    )),
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

function validateAuthority(value: unknown): WritingServiceAuthority | null {
  if (!isRecord(value)
    || value.status !== 'authorized'
    || typeof value.installationId !== 'string'
    || typeof value.endpointId !== 'string'
    || value.retentionControl !== 'approved_zero_data_retention'
    || typeof value.approvedAt !== 'string'
    || typeof value.expiresAt !== 'string'
    || !Number.isSafeInteger(value.budgetLimitMicros)
    || !Number.isSafeInteger(value.budgetRemainingMicros)) return null
  return value as unknown as WritingServiceAuthority
}

function validateRecognition(value: unknown): WritingRecognitionResult | null {
  if (!isRecord(value)
    || typeof value.rawTranscription !== 'string'
    || value.rawTranscription.length > 500
    || !Array.isArray(value.uncertainties)
    || typeof value.spellingAssessmentSupportable !== 'boolean'
    || !['openai', 'mocked'].includes(String(value.provider))) return null
  if (!value.uncertainties.every((entry) => isRecord(entry)
    && typeof entry.text === 'string'
    && typeof entry.reason === 'string'
    && typeof entry.affectsMeaning === 'boolean')) return null
  return value as unknown as WritingRecognitionResult
}

function validateEvaluation(value: unknown): WritingEvaluationResult | null {
  if (!isRecord(value) || !['openai', 'mocked'].includes(String(value.provider)) || !validateWritingFeedback(value.feedback)) return null
  return { feedback: value.feedback as WritingFeedback, provider: value.provider as 'openai' | 'mocked' }
}

function responseFailure(status: number): WritingServiceResult<never> {
  if (status === 401 || status === 403) return failure('unauthorized', 'Protected writing authorization is not active.', false)
  if (status === 409) return failure('timeout_unknown', 'A request with this identity is still unresolved. The work was saved for parent review.', false)
  if (status === 412) return failure('consent_required', 'Parent consent must be renewed before external processing.', false)
  if (status === 422) return failure('invalid_response', 'The writing service rejected the bounded request.', false)
  if (status === 429 || status === 402) return failure('budget_exhausted', 'The parent-approved writing budget is unavailable.', false)
  if (status === 503) return failure('retention_not_approved', 'Approved child-data retention controls are not active.', false)
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
