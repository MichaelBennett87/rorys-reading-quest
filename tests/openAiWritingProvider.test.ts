import { describe, expect, it, vi } from 'vitest'
import { createOpenAiWritingProvider, type WritingProviderPricing } from '../src/server/writingPilot'

const recognition = { rawTranscription: 'i lik the plan.', uncertainties: [], spellingAssessmentSupportable: true }
const feedback = {
  understood: 'You explained the reason.',
  comprehension: category('meets'),
  supportingEvidence: category('meets'),
  spelling: category('meets'),
  grammar: category('meets'),
  capitalizationPunctuation: category('meets'),
  improvements: [],
  parentReviewRequired: false,
  uncertaintyReason: null,
}

describe('OpenAI writing provider adapter', () => {
  it('uses pinned bounded requests, excludes rubrics from recognition, and calculates observed cost from usage', async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      if (String(url).endsWith('/moderations')) return moderation(false)
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>
      expect(body.model).toBe('recognition-2026-09-01')
      expect(body.max_output_tokens).toBe(400)
      expect(body.store).toBe(false)
      expect(body.background).toBe(false)
      expect(body.tools).toEqual([])
      expect(JSON.stringify(body)).not.toMatch(/rubric|expected answer|requiredIdeas/i)
      return response(recognition, { input_tokens: 1_000, output_tokens: 100, total_tokens: 1_100 }, 'recognition-2026-09-01')
    }) as unknown as typeof fetch
    const provider = createProvider(fetchImpl)
    const output = await provider.transcribe({ imageDataUrl: PNG, layout: { width: 100, height: 50 } })
    expect(output).toMatchObject({ status: 'completed', billing: { status: 'observed', costMicros: 450 } })
    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(provider.maximumCostMicros('transcribe')).toBe(1_800)
  })

  it('does not confuse configured maximums with actual cost', async () => {
    const usages = [
      { input_tokens: 100, output_tokens: 10, total_tokens: 110 },
      { input_tokens: 2_000, output_tokens: 300, total_tokens: 2_300 },
    ]
    const fetchImpl = vi.fn(async (url: string | URL | Request) => {
      if (String(url).endsWith('/moderations')) return moderation(false)
      return response(recognition, usages.shift(), 'recognition-2026-09-01')
    }) as unknown as typeof fetch
    const provider = createProvider(fetchImpl)
    const first = await provider.transcribe({ imageDataUrl: PNG, layout: { width: 1, height: 1 } })
    const second = await provider.transcribe({ imageDataUrl: PNG, layout: { width: 1, height: 1 } })
    expect(first.status === 'completed' && first.billing.costMicros).toBe(45)
    expect(second.status === 'completed' && second.billing.costMicros).toBe(1_100)
  })

  it('honors a flagged HTTP 200 moderation decision and fails closed for malformed safety output', async () => {
    const flaggedFetch = vi.fn(async () => moderation(true)) as unknown as typeof fetch
    const flagged = await createProvider(flaggedFetch).transcribe({ imageDataUrl: PNG, layout: { width: 1, height: 1 } })
    expect(flagged).toMatchObject({ status: 'review_required', code: 'safety_flagged', billing: { status: 'not_incurred' } })
    expect(flaggedFetch).toHaveBeenCalledTimes(1)

    const malformedFetch = vi.fn(async () => new Response(JSON.stringify({ results: [{}] }), { status: 200 })) as unknown as typeof fetch
    const malformed = await createProvider(malformedFetch).transcribe({ imageDataUrl: PNG, layout: { width: 1, height: 1 } })
    expect(malformed).toMatchObject({ status: 'review_required', code: 'safety_unavailable' })
  })

  it('checks generated feedback, preserves billed usage, and distinguishes refusals and missing usage', async () => {
    const unsafeOutput = vi.fn()
      .mockResolvedValueOnce(moderation(false))
      .mockResolvedValueOnce(response(feedback, { input_tokens: 1_000, output_tokens: 100, total_tokens: 1_100 }, 'evaluation-2026-09-01'))
      .mockResolvedValueOnce(moderation(true)) as unknown as typeof fetch
    const unsafe = await createProvider(unsafeOutput).evaluate(evaluationInput())
    expect(unsafe).toMatchObject({ status: 'review_required', code: 'safety_flagged', billing: { status: 'observed', costMicros: 450 } })

    const refusedFetch = vi.fn()
      .mockResolvedValueOnce(moderation(false))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        model: 'evaluation-2026-09-01',
        usage: { input_tokens: 10, output_tokens: 1, total_tokens: 11 },
        output: [{ content: [{ type: 'refusal', refusal: 'Unable to respond.' }] }],
      }), { status: 200 })) as unknown as typeof fetch
    expect(await createProvider(refusedFetch).evaluate(evaluationInput())).toMatchObject({ status: 'refused', code: 'provider_refused' })

    const missingUsageFetch = vi.fn()
      .mockResolvedValueOnce(moderation(false))
      .mockResolvedValueOnce(response(feedback, undefined, 'evaluation-2026-09-01')) as unknown as typeof fetch
    expect(await createProvider(missingUsageFetch).evaluate(evaluationInput())).toMatchObject({
      status: 'failed', code: 'usage_unavailable', outcome: 'unknown', billing: { status: 'unknown' },
    })
  })

  it('distinguishes definite provider rejection from an ambiguous server failure', async () => {
    const definiteFetch = vi.fn()
      .mockResolvedValueOnce(moderation(false))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'bounded request rejected' } }), { status: 400 })) as unknown as typeof fetch
    expect(await createProvider(definiteFetch).evaluate(evaluationInput())).toMatchObject({
      status: 'failed', code: 'provider_failure', outcome: 'definite', billing: { status: 'not_incurred' },
    })

    const ambiguousFetch = vi.fn()
      .mockResolvedValueOnce(moderation(false))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'server failure' } }), { status: 500 })) as unknown as typeof fetch
    expect(await createProvider(ambiguousFetch).evaluate(evaluationInput())).toMatchObject({
      status: 'failed', code: 'usage_unavailable', outcome: 'unknown', billing: { status: 'unknown' },
    })
  })
})

function createProvider(fetchImpl: typeof fetch) {
  return createOpenAiWritingProvider({
    apiKey: 'test-only-not-a-real-key',
    recognitionModel: 'recognition-2026-09-01',
    evaluationModel: 'evaluation-2026-09-01',
    moderationModel: 'omni-moderation-2024-09-26',
    recognitionPricing: pricing,
    evaluationPricing: pricing,
    fetchImpl,
  })
}

const pricing: WritingProviderPricing = {
  pricingVersion: 'reviewed-2026-09-22',
  inputMicrosPerMillionTokens: 250_000,
  outputMicrosPerMillionTokens: 2_000_000,
  maximumInputTokens: 4_000,
  maximumOutputTokens: 400,
}

function response(output: unknown, usage: unknown, model: string) {
  return new Response(JSON.stringify({ output_text: JSON.stringify(output), usage, model }), { status: 200 })
}

function moderation(flagged: boolean) {
  return new Response(JSON.stringify({ results: [{ flagged, categories: {}, category_scores: {} }] }), { status: 200 })
}

function category(status: 'meets') {
  return { status, message: 'The response fits the story.', evidenceIds: ['rw-rubric-tia-r1-e1'] }
}

function evaluationInput() {
  return {
    confirmedText: 'Tia got the wrappers before the wind blew them away.',
    spellingAssessmentSupportable: true,
    task: {
      activity: { prompt: 'Why did Tia pick up the wrappers?' },
      passageTitle: 'The Important Assignment',
      passageText: 'Tia picked up the wrappers before the wind blew them away.',
      rubric: { requiredIdeas: [], relevantEvidence: [], acceptableParaphrases: [], contradictionsOrOmissions: [], validResponseExamples: [], mechanicsSeparationExamples: [] },
    },
  } as never
}

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'
