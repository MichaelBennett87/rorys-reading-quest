import { describe, expect, it, vi } from 'vitest'
import { WRITING_PILOT_NOTICE_VERSION, type WritingFeedback } from '../src/domain/writingPilot'
import {
  createWritingPilotService,
  type ApprovedWritingInstallation,
  type StoredWritingServiceResponse,
  type WritingAuthorizationStore,
  type WritingBudgetLedger,
  type WritingInferenceProvider,
  type WritingProviderBilling,
  type WritingProviderOperation,
  type WritingRecognitionProvenance,
} from '../src/server/writingPilot'

const origin = 'https://example.test'
const token = 'opaque-installation-token-1234567890abcdef'
const installation: ApprovedWritingInstallation = {
  installationId: 'approved-installation',
  consentVersion: WRITING_PILOT_NOTICE_VERSION,
  authorizationExpiresAt: '2026-10-01T00:00:00.000Z',
  retentionControl: 'approved_zero_data_retention',
  budgetLimitMicros: 2_000_000,
}

function setup(overrides: { installation?: ApprovedWritingInstallation; provider?: WritingInferenceProvider } = {}) {
  const approved = overrides.installation ?? installation
  const authorization: WritingAuthorizationStore = {
    exchangeActivationCode: vi.fn(async (code) => code === 'parent-provisioned-code' ? approved : null),
    createSession: vi.fn(async () => ({ token, expiresAt: '2026-10-01T00:00:00.000Z' })),
    resolveSession: vi.fn(async (value) => value === token ? approved : null),
    revokeSession: vi.fn(async () => undefined),
  }
  const budget = memoryBudget()
  const provider = overrides.provider ?? normalProvider()
  const service = createWritingPilotService({ allowedOrigins: [origin], authorization, budget, provider, now: () => new Date('2026-09-21T12:00:00.000Z') })
  return { service, authorization, budget, provider }
}

describe('protected writing pilot service', () => {
  it('uses CORS-safe bearer authorization instead of a cross-site cookie and rejects invalid expiry dates', async () => {
    const { service } = setup()
    const preflight = await service(new Request(`${origin}/api/read-write/v1/activate`, { method: 'OPTIONS', headers: { origin } }))
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-headers')).toContain('authorization')
    expect(preflight.headers.get('access-control-allow-credentials')).toBeNull()

    const activated = await service(post('activate', { activationCode: 'parent-provisioned-code', consentVersion: WRITING_PILOT_NOTICE_VERSION }))
    const body = await activated.json()
    expect(activated.status).toBe(200)
    expect(activated.headers.get('set-cookie')).toBeNull()
    expect(body).toMatchObject({ authMode: 'installation_bearer_v1', installationToken: token })

    const invalid = setup({ installation: { ...installation, authorizationExpiresAt: 'not-a-date' } })
    expect((await invalid.service(post('activate', { activationCode: 'parent-provisioned-code', consentVersion: WRITING_PILOT_NOTICE_VERSION }))).status).toBe(403)
  })

  it('does not accept a local PIN, cookie, browser rubric, arbitrary model, or URL as authority', async () => {
    const { service, provider } = setup()
    expect((await service(post('evaluate', evaluationBody({ pin: '1234' }), false, { cookie: `rrq_writing_session=${token}` }))).status).toBe(401)
    const authorized = await service(post('evaluate', evaluationBody({ rubric: { answer: 'browser supplied' }, model: 'arbitrary', url: 'https://attacker.test' }), true))
    expect(authorized.status).toBe(200)
    const input = vi.mocked(provider.evaluate).mock.calls[0][0]
    expect(input.task.rubric.rubricVersion).toBe('rw-rubric-tia-r1')
    expect(JSON.stringify(input)).not.toContain('browser supplied')
    expect(JSON.stringify(input)).not.toContain('attacker.test')
    expect(input.spellingAssessmentSupportable).toBe(false)
  })

  it('binds deduplication to operation, request identity, and payload identity', async () => {
    const { service, provider } = setup()
    const body = transcriptionBody()
    expect((await service(post('transcribe', body, true))).status).toBe(200)
    expect((await service(post('transcribe', body, true))).status).toBe(200)
    expect(provider.transcribe).toHaveBeenCalledTimes(1)
    const changed = await service(post('transcribe', { ...body, layout: { width: 2, height: 1 } }, true))
    expect(changed.status).toBe(409)
    expect(await changed.json()).toEqual({ error: 'request_identity_conflict' })
    expect(provider.transcribe).toHaveBeenCalledTimes(1)
  })

  it('derives spelling authority from matching recognition provenance and rejects stale ink', async () => {
    const { service, provider } = setup()
    expect((await service(post('transcribe', transcriptionBody(), true))).status).toBe(200)
    const evaluated = await service(post('evaluate', evaluationBody({
      recognitionRequestId: 'recognition-request-1',
      inputMode: 'handwriting',
      spellingAssessmentSupportable: false,
    }), true))
    expect(evaluated.status).toBe(200)
    expect(vi.mocked(provider.evaluate).mock.calls[0][0].spellingAssessmentSupportable).toBe(true)

    const stale = await service(post('evaluate', evaluationBody({
      requestId: 'evaluation-request-2',
      recognitionRequestId: 'recognition-request-1',
      inputMode: 'handwriting',
      inkRevision: 2,
    }), true))
    expect(stale.status).toBe(422)
    expect(provider.evaluate).toHaveBeenCalledTimes(1)
  })

  it('turns safety/refusal failures into parent review and retains ambiguous reservations', async () => {
    const reviewProvider = normalProvider({
      transcribe: vi.fn(async () => ({ status: 'review_required' as const, code: 'safety_flagged' as const, billing: { status: 'not_incurred' as const, model: 'recognition' } })),
    })
    const review = setup({ provider: reviewProvider })
    const response = await review.service(post('transcribe', transcriptionBody(), true))
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'parent_review_required' })
    expect(review.budget.complete).toHaveBeenCalledWith(expect.objectContaining({ actualCostMicros: 0 }))

    const unknownProvider = normalProvider({
      transcribe: vi.fn(async () => ({ status: 'failed' as const, code: 'usage_unavailable' as const, outcome: 'unknown' as const, billing: { status: 'unknown' as const, model: 'recognition' } })),
    })
    const unknown = setup({ provider: unknownProvider })
    expect((await unknown.service(post('transcribe', transcriptionBody(), true))).status).toBe(409)
    expect(unknown.budget.markUnknown).toHaveBeenCalledTimes(1)
    expect(unknown.budget.complete).not.toHaveBeenCalled()

    const thrown = setup({ provider: normalProvider({ transcribe: vi.fn(async () => { throw new Error('synthetic transport ambiguity') }) }) })
    expect((await thrown.service(post('transcribe', transcriptionBody(), true))).status).toBe(409)
    expect(thrown.budget.markUnknown).toHaveBeenCalledTimes(1)
  })

  it('rejects malformed PNG payloads and invalid provider evidence without calling either learner failure', async () => {
    const normal = setup()
    expect((await normal.service(post('transcribe', { ...transcriptionBody(), imageDataUrl: 'data:image/png;base64,AAAA' }, true))).status).toBe(422)
    expect(normal.provider.transcribe).not.toHaveBeenCalled()

    const provider = normalProvider({ evaluate: vi.fn(async () => ({
      status: 'completed' as const,
      result: { feedback: invalidFeedback(), provider: 'mocked' as const },
      billing: observed(20_000),
    })) })
    const invalid = setup({ provider })
    const response = await invalid.service(post('evaluate', evaluationBody(), true))
    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({ error: 'provider_output_invalid' })
  })
})

function memoryBudget(): WritingBudgetLedger & Record<'reserve' | 'complete' | 'markUnknown', ReturnType<typeof vi.fn>> {
  const entries = new Map<string, { operation: WritingProviderOperation; payloadHash: string; response?: StoredWritingServiceResponse; provenance?: WritingRecognitionProvenance; unresolved?: boolean }>()
  const reserve = vi.fn(async (input: Parameters<WritingBudgetLedger['reserve']>[0]) => {
    const key = `${input.installationId}:${input.requestId}`
    const existing = entries.get(key)
    if (existing) {
      if (existing.operation !== input.operation || existing.payloadHash !== input.payloadHash) return { status: 'identity_conflict' as const }
      if (existing.response) return { status: 'duplicate' as const, response: existing.response }
      return { status: 'unresolved' as const }
    }
    entries.set(key, { operation: input.operation, payloadHash: input.payloadHash })
    return { status: 'reserved' as const, remainingMicros: input.limitMicros - input.maximumCostMicros }
  })
  const complete = vi.fn(async (input: Parameters<WritingBudgetLedger['complete']>[0]) => {
    const entry = entries.get(`${input.installationId}:${input.requestId}`)
    if (entry) Object.assign(entry, { response: input.response, provenance: input.recognitionProvenance })
  })
  const markUnknown = vi.fn(async (input: Parameters<WritingBudgetLedger['markUnknown']>[0]) => {
    const entry = entries.get(`${input.installationId}:${input.requestId}`)
    if (entry) entry.unresolved = true
  })
  return {
    getRemaining: vi.fn(async (_installationId, limit) => limit),
    reserve,
    complete,
    markUnknown,
    resolveRecognition: vi.fn(async (installationId, requestId) => entries.get(`${installationId}:${requestId}`)?.provenance ?? null),
  }
}

function normalProvider(overrides: Partial<WritingInferenceProvider> = {}): WritingInferenceProvider {
  const provider: WritingInferenceProvider = {
    maximumCostMicros: vi.fn(() => 100_000),
    transcribe: vi.fn(async () => ({
      status: 'completed' as const,
      result: { rawTranscription: 'Tia got the wrappers before the wind blew them away.', uncertainties: [], spellingAssessmentSupportable: true, provider: 'mocked' as const },
      billing: observed(10_000),
    })),
    evaluate: vi.fn(async (input) => ({
      status: 'completed' as const,
      result: { feedback: validFeedback(input.spellingAssessmentSupportable), provider: 'mocked' as const },
      billing: observed(20_000),
    })),
    ...overrides,
  }
  return provider
}

function observed(costMicros: number): Extract<WritingProviderBilling, { status: 'observed' }> {
  return { status: 'observed', model: 'controlled-provider', pricingVersion: 'test-v1', inputTokens: 10, outputTokens: 5, totalTokens: 15, costMicros }
}

function post(path: string, body: Record<string, unknown>, authorized = false, extraHeaders: Record<string, string> = {}) {
  return new Request(`${origin}/api/read-write/v1/${path}`, {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json', ...(authorized ? { authorization: `Bearer ${token}` } : {}), ...extraHeaders },
    body: JSON.stringify(body),
  })
}

function transcriptionBody(extra: Record<string, unknown> = {}) {
  return {
    requestId: 'recognition-request-1',
    submissionId: 'submission-1',
    activityId: 'rw-g2-tia-wrappers-reason',
    sourceContentVersion: 'g2-ss-plot-elements-r0.2.0',
    inkRevision: 1,
    imageDataUrl: PNG,
    layout: { width: 1, height: 1 },
    ...extra,
  }
}

function evaluationBody(extra: Record<string, unknown> = {}) {
  return {
    requestId: 'evaluation-request-1',
    recognitionRequestId: null,
    activityId: 'rw-g2-tia-wrappers-reason',
    sourceContentVersion: 'g2-ss-plot-elements-r0.2.0',
    rubricVersion: 'rw-rubric-tia-r1',
    submissionId: 'submission-1',
    inkRevision: 1,
    inputMode: 'typed',
    transcriptionConfirmedBy: 'learner',
    confirmedText: 'Tia got the wrappers before the wind blew them away.',
    ...extra,
  }
}

function validFeedback(spellingSupportable: boolean): WritingFeedback {
  const category = { status: 'meets' as const, message: 'The response fits the story.', evidenceIds: ['rw-rubric-tia-r1-e1'] }
  return {
    understood: 'You explained Tia’s reason.',
    comprehension: category,
    supportingEvidence: category,
    spelling: spellingSupportable ? category : { status: 'withheld', message: 'Spelling was not assessed.', evidenceIds: [] },
    grammar: category,
    capitalizationPunctuation: category,
    improvements: [],
    parentReviewRequired: false,
    uncertaintyReason: null,
  }
}

function invalidFeedback(): WritingFeedback {
  const value = validFeedback(false)
  value.comprehension.evidenceIds = ['browser-invented-evidence']
  return value
}

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'
