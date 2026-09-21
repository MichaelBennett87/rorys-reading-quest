import { describe, expect, it, vi } from 'vitest'
import { createOpenAiWritingProvider } from '../src/server/writingPilot'

describe('OpenAI writing provider adapter', () => {
  it('uses fixed server models, store false, no tools, and gives recognition no rubric or expected answer', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>
      expect(body.model).toBe('recognition-snapshot')
      expect(body.store).toBe(false)
      expect(body.background).toBe(false)
      expect(body.tools).toEqual([])
      expect(JSON.stringify(body)).not.toMatch(/rubric|expected answer|requiredIdeas/i)
      return new Response(JSON.stringify({ output_text: JSON.stringify({ rawTranscription: 'i lik the plan.', uncertainties: [], spellingAssessmentSupportable: true }) }), { status: 200 })
    }) as unknown as typeof fetch
    const provider = createOpenAiWritingProvider({
      apiKey: 'test-only-not-a-real-key',
      recognitionModel: 'recognition-snapshot',
      evaluationModel: 'evaluation-snapshot',
      moderationModel: 'moderation-snapshot',
      recognitionCostMicros: 15_000,
      evaluationCostMicros: 25_000,
      fetchImpl,
    })
    const output = await provider.transcribe({ imageDataUrl: 'data:image/png;base64,AAAA', layout: { width: 100, height: 50 } })
    expect(output.result.rawTranscription).toBe('i lik the plan.')
    expect(output.costMicros).toBe(15_000)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
