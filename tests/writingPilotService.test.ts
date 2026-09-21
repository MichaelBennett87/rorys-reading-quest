import { describe, expect, it, vi } from 'vitest'
import { WRITING_PILOT_NOTICE_VERSION, type WritingFeedback } from '../src/domain/writingPilot'
import {
  createWritingPilotService,
  type ApprovedWritingInstallation,
  type WritingAuthorizationStore,
  type WritingBudgetLedger,
  type WritingInferenceProvider,
} from '../src/server/writingPilot'

const origin = 'https://example.test'
const installation: ApprovedWritingInstallation = {
  installationId: 'approved-installation',
  consentVersion: WRITING_PILOT_NOTICE_VERSION,
  authorizationExpiresAt: '2026-10-01T00:00:00.000Z',
  retentionControl: 'approved_zero_data_retention',
  budgetLimitMicros: 2_000_000,
}

function setup(options: { exhausted?: boolean; invalidFeedback?: boolean } = {}) {
  const authorization: WritingAuthorizationStore = {
    exchangeActivationCode: vi.fn(async (code) => code === 'parent-provisioned-code' ? installation : null),
    createSession: vi.fn(async () => ({ token: 'opaque-session', expiresAt: '2026-10-01T00:00:00.000Z' })),
    resolveSession: vi.fn(async (token) => token === 'opaque-session' ? installation : null),
    revokeSession: vi.fn(async () => undefined),
  }
  const completed = new Map<string, unknown>()
  const budget: WritingBudgetLedger = {
    reserve: vi.fn(async ({ requestId }) => options.exhausted
      ? { status: 'exhausted' as const }
      : completed.has(requestId)
        ? { status: 'duplicate' as const, result: completed.get(requestId) }
        : { status: 'reserved' as const, remainingMicros: 1_500_000 }),
    complete: vi.fn(async ({ requestId, result }) => { completed.set(requestId, result) }),
    markUnknown: vi.fn(async () => undefined),
  }
  const provider: WritingInferenceProvider = {
    transcribe: vi.fn(async (input) => ({
      result: { rawTranscription: 'Tia got wrappers so wind did not blow them.', uncertainties: [], spellingAssessmentSupportable: true, provider: 'mocked' as const },
      costMicros: 10_000,
      seen: input,
    })),
    evaluate: vi.fn(async () => ({ result: { feedback: options.invalidFeedback ? invalidFeedback() : validFeedback(), provider: 'mocked' as const }, costMicros: 20_000 })),
  }
  const service = createWritingPilotService({ allowedOrigins: [origin], authorization, budget, provider, maxCostMicrosPerRequest: 100_000, now: () => new Date('2026-09-21T12:00:00.000Z') })
  return { service, authorization, budget, provider }
}

describe('protected writing pilot service', () => {
  it('answers only configured-origin credentialed CORS preflight requests', async () => {
    const { service } = setup()
    const allowed = await service(new Request(`${origin}/api/read-write/v1/activate`, { method: 'OPTIONS', headers: { origin } }))
    expect(allowed.status).toBe(204)
    expect(allowed.headers.get('access-control-allow-origin')).toBe(origin)
    expect(allowed.headers.get('access-control-allow-credentials')).toBe('true')
    const blocked = await service(new Request(`${origin}/api/read-write/v1/activate`, { method: 'OPTIONS', headers: { origin: 'https://not-approved.test' } }))
    expect(blocked.status).toBe(403)
  })

  it('requires parent-provisioned activation, current notice, ZDR approval, and an HttpOnly session', async () => {
    const { service } = setup()
    const rejected = await service(post('activate', { activationCode: 'wrong', consentVersion: WRITING_PILOT_NOTICE_VERSION }))
    expect(rejected.status).toBe(403)

    const activated = await service(post('activate', { activationCode: 'parent-provisioned-code', consentVersion: WRITING_PILOT_NOTICE_VERSION }))
    expect(activated.status).toBe(200)
    expect(activated.headers.get('set-cookie')).toMatch(/HttpOnly; Secure; SameSite=Strict/)
    expect(await activated.json()).toMatchObject({ status: 'authorized', retentionControl: 'approved_zero_data_retention' })
  })

  it('does not accept the local PIN or browser-supplied rubrics as request authority', async () => {
    const { service, provider } = setup()
    const unauthorized = await service(post('evaluate', evaluationBody({ pin: '1234', rubric: { answer: 'browser supplied' } })))
    expect(unauthorized.status).toBe(401)

    const authorized = await service(post('evaluate', evaluationBody({ rubric: { answer: 'browser supplied' }, model: 'arbitrary', url: 'https://attacker.test' }), true))
    expect(authorized.status).toBe(200)
    expect(provider.evaluate).toHaveBeenCalledTimes(1)
    const providerInput = vi.mocked(provider.evaluate).mock.calls[0][0]
    expect(providerInput.task.rubric.rubricVersion).toBe('rw-rubric-tia-r1')
    expect(JSON.stringify(providerInput)).not.toContain('browser supplied')
    expect(JSON.stringify(providerInput)).not.toContain('attacker.test')
  })

  it('keeps recognition isolated from expected answers and enforces finite budget', async () => {
    const normal = setup()
    const response = await normal.service(post('transcribe', {
      requestId: 'recognition-1',
      activityId: 'rw-g2-tia-wrappers-reason',
      sourceContentVersion: 'g2-ss-plot-elements-r0.2.0',
      inkRevision: 1,
      imageDataUrl: 'data:image/png;base64,AAAA',
      layout: { width: 1024, height: 480 },
      expectedAnswer: 'must not reach recognition',
    }, true))
    expect(response.status).toBe(200)
    const recognitionInput = vi.mocked(normal.provider.transcribe).mock.calls[0][0]
    expect(Object.keys(recognitionInput).sort()).toEqual(['imageDataUrl', 'layout'])

    const exhausted = setup({ exhausted: true })
    const blocked = await exhausted.service(post('transcribe', {
      requestId: 'recognition-2',
      activityId: 'rw-g2-tia-wrappers-reason',
      sourceContentVersion: 'g2-ss-plot-elements-r0.2.0',
      inkRevision: 1,
      imageDataUrl: 'data:image/png;base64,AAAA',
      layout: { width: 1024, height: 480 },
    }, true))
    expect(blocked.status).toBe(429)
    expect(exhausted.provider.transcribe).not.toHaveBeenCalled()
  })

  it('rejects unsupported evidence and correction spans from provider output', async () => {
    const { service, budget } = setup({ invalidFeedback: true })
    const response = await service(post('evaluate', evaluationBody(), true))
    expect(response.status).toBe(409)
    expect(budget.markUnknown).toHaveBeenCalledTimes(1)
    expect(budget.complete).not.toHaveBeenCalled()
  })
})

function post(path: string, body: Record<string, unknown>, authorized = false) {
  return new Request(`${origin}/api/read-write/v1/${path}`, {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json', ...(authorized ? { cookie: 'rrq_writing_session=opaque-session' } : {}) },
    body: JSON.stringify(body),
  })
}

function evaluationBody(extra: Record<string, unknown> = {}) {
  return {
    requestId: 'evaluation-1',
    activityId: 'rw-g2-tia-wrappers-reason',
    sourceContentVersion: 'g2-ss-plot-elements-r0.2.0',
    rubricVersion: 'rw-rubric-tia-r1',
    submissionId: 'submission-1',
    confirmedText: 'Tia got the wrappers before the wind blew them away.',
    spellingAssessmentSupportable: true,
    ...extra,
  }
}

function validFeedback(): WritingFeedback {
  const category = { status: 'meets' as const, message: 'The response fits the story.', evidenceIds: ['rw-rubric-tia-r1-e1'] }
  return {
    understood: 'You explained Tia’s reason.',
    comprehension: category,
    supportingEvidence: category,
    spelling: category,
    grammar: category,
    capitalizationPunctuation: category,
    improvements: [],
    parentReviewRequired: false,
    uncertaintyReason: null,
  }
}

function invalidFeedback(): WritingFeedback {
  const feedback = validFeedback()
  feedback.comprehension.evidenceIds = ['browser-invented-evidence']
  feedback.improvements = [{
    suggestionId: 'bad-span',
    category: 'grammar',
    originalText: 'words that are not in the response',
    replacementText: 'replacement',
    explanation: 'Invalid correction span.',
  }]
  return feedback
}
