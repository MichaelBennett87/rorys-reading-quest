import { describe, expect, test, vi } from 'vitest'

import { sampleContent } from '../../src/domain/content'
import {
  buildWordSupportSpeechPlan,
  createWordSupportSpeechRequest,
  type SpeechService,
} from '../../src/services/speech'

function getTeamTarget() {
  const target = sampleContent.passages
    .flatMap((passage) => passage.wordSupportTargets ?? [])
    .find((candidate) => candidate.surfaceWord === 'team' && candidate.spokenChunks.length === 3)
  if (!target) throw new Error('Expected an authored team support target.')
  return target
}

describe('word-support speech planning', () => {
  test('uses separated pronounceable chunks for Hear the Parts', () => {
    const plan = buildWordSupportSpeechPlan(getTeamTarget(), 3)
    expect(plan?.kind).toBe('sequence')
    if (plan?.kind !== 'sequence') return
    expect(plan.steps.map((step) => step.text)).toEqual(['tuh', 'ee', 'mmm'])
    expect(plan.steps.every((step) => step.pauseAfterMs === 260)).toBe(true)
  })

  test('keeps the historical blended-word sequence distinct from Hear the Word', () => {
    const target = getTeamTarget()
    const blend = buildWordSupportSpeechPlan(target, 4)
    const word = buildWordSupportSpeechPlan(target, 5)
    expect(blend).toEqual({
      kind: 'sequence',
      steps: [
        { text: 'tuh', rate: 0.8, pauseAfterMs: 110 },
        { text: 'ee', rate: 0.8, pauseAfterMs: 110 },
        { text: 'mmm', rate: 0.8, pauseAfterMs: 110 },
        { text: 'team', rate: 0.7, pauseAfterMs: 120 },
        { text: 'team', rate: 0.9 },
      ],
    })
    expect(word).toEqual({ kind: 'text', step: { text: 'team', rate: 0.9 } })
    expect(blend).not.toEqual(word)
  })

  test('keeps whole-word and sentence requests separate', async () => {
    const service: SpeechService = {
      isSupported: () => true,
      cancel: vi.fn(),
      speakSequence: vi.fn(() => Promise.resolve()),
      speakText: vi.fn(() => Promise.resolve()),
    }
    const target = getTeamTarget()

    await createWordSupportSpeechRequest(target, 5, service)?.()
    expect(service.speakText).toHaveBeenLastCalledWith('team', { rate: 0.9 })

    await createWordSupportSpeechRequest(target, 6, service)?.()
    expect(service.speakText).toHaveBeenLastCalledWith(target.sentenceSpeechText, { rate: 0.95 })
    expect(createWordSupportSpeechRequest(target, 1, service)).toBeNull()
    expect(createWordSupportSpeechRequest(target, 2, service)).toBeNull()
  })
})
