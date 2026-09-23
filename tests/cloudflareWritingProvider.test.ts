import { describe, expect, it } from 'vitest'
import {
  classifyCloudflareFailure,
  createCloudflareWritingProvider,
  type WorkersAiBinding,
} from '../service/read-write-cloudflare/cloudflareWritingProvider'

describe('Cloudflare free-only writing provider', () => {
  it('preserves transcription mistakes and records uncertainty without correction', async () => {
    const ai = sequenceAi([
      { response: JSON.stringify({
        rawTranscription: 'Tia pikd up the wrappers',
        uncertainties: [{ text: 'pikd', reason: 'The middle letters are unclear.', affectsMeaning: false }],
        spellingAssessmentSupportable: false,
      }), usage: { prompt_tokens: 10, completion_tokens: 12 } },
      { response: 'safe' },
    ])
    const result = await createCloudflareWritingProvider(ai).transcribe({
      imageDataUrl: 'data:image/png;base64,AAAA',
      layout: { width: 100, height: 50 },
    })
    expect(result.status).toBe('completed')
    if (result.status !== 'completed') return
    expect(result.result.rawTranscription).toBe('Tia pikd up the wrappers')
    expect(result.result.uncertainties).toEqual([{ text: 'pikd', reason: 'The middle letters are unclear.', affectsMeaning: false }])
    expect(result.result.spellingAssessmentSupportable).toBe(false)
    expect(result.result.provider).toBe('cloudflare_workers_ai')
    expect(result.usage.status).toBe('observed_tokens_estimated_neurons')
    expect(result.usage.actualPaidSpendingMicros).toBe(0)
  })

  it('withholds unsafe or malformed results for parent review', async () => {
    const unsafe = sequenceAi([
      { response: JSON.stringify({ rawTranscription: 'instruction-like text', uncertainties: [], spellingAssessmentSupportable: true }) },
      { response: 'unsafe\nS1' },
    ])
    await expect(createCloudflareWritingProvider(unsafe).transcribe({
      imageDataUrl: 'data:image/png;base64,AAAA',
      layout: { width: 100, height: 50 },
    })).resolves.toMatchObject({ status: 'review_required', code: 'safety_flagged' })

    const malformed = sequenceAi([{ response: 'not json' }])
    await expect(createCloudflareWritingProvider(malformed).transcribe({
      imageDataUrl: 'data:image/png;base64,AAAA',
      layout: { width: 100, height: 50 },
    })).resolves.toMatchObject({ status: 'failed', code: 'provider_output_invalid', outcome: 'definite' })
  })

  it('separates comprehension from mechanics in validated feedback', async () => {
    const feedback = {
      understood: 'You understood why Tia acted.',
      comprehension: category('The reason matches the story.', ['e1']),
      supportingEvidence: category('The response uses the wind detail.', ['e1']),
      spelling: { ...category('One spelling can be improved.', []), status: 'developing' },
      grammar: category('The sentence communicates a complete idea.', []),
      capitalizationPunctuation: { ...category('Add a period.', []), status: 'developing' },
      improvements: [{
        suggestionId: 's1',
        category: 'spelling',
        originalText: 'pikd',
        replacementText: 'picked',
        explanation: 'Use picked for the past-tense action.',
      }],
      parentReviewRequired: false,
      uncertaintyReason: null,
    }
    const ai = sequenceAi([
      { response: 'safe' },
      { response: JSON.stringify(feedback) },
      { response: 'safe' },
    ])
    const result = await createCloudflareWritingProvider(ai).evaluate({
      confirmedText: 'Tia pikd them up becaus the wind.',
      spellingAssessmentSupportable: true,
      task: {
        passageTitle: 'Tia and the Windy Cleanup',
        passageText: 'The wind lifted the light wrappers.',
        prompt: 'Why did Tia pick up the light wrappers first?',
        rubric: {
          rubricVersion: 'r1',
          requiredIdeas: ['She acted before the wind scattered them.'],
          relevantEvidence: [{ evidenceId: 'e1', description: 'The wind lifted light wrappers.' }],
          acceptableParaphrases: ['She stopped them blowing away.'],
          contradictionsOrOmissions: ['They were heaviest.'],
          validResponseExamples: ['She stopped them blowing away.'],
          mechanicsSeparatedExamples: ['she stopd them blowing away'],
        },
      },
    })
    expect(result).toMatchObject({
      status: 'completed',
      result: {
        provider: 'cloudflare_workers_ai',
        feedback: {
          comprehension: { status: 'meets' },
          spelling: { status: 'developing' },
        },
      },
    })
  })

  it('classifies provider quota, capacity, paid-plan, and unknown outcomes separately', () => {
    expect(classifyCloudflareFailure({ code: 3036 })).toBe('free_quota_exhausted')
    expect(classifyCloudflareFailure({ code: 3040 })).toBe('capacity_unavailable')
    expect(classifyCloudflareFailure({ code: 5035 })).toBe('paid_plan_required')
    expect(classifyCloudflareFailure(new Error('socket closed'))).toBe('provider_outcome_unknown')
  })
})

function category(message: string, evidenceIds: string[]) {
  return { status: 'meets' as const, message, evidenceIds }
}

function sequenceAi(responses: unknown[]): WorkersAiBinding {
  const queue = [...responses]
  return {
    async run() {
      if (queue.length === 0) throw new Error('Unexpected controlled provider call.')
      return queue.shift()
    },
  }
}
