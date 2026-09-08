import { describe, expect, it } from 'vitest'

import { sampleContent } from '../../src/domain/content'

function question(questionId: string) {
  const result = sampleContent.questions.find((entry) => entry.questionIdentifier === questionId)
  expect(result, `Missing ${questionId}`).toBeDefined()
  return result!
}

describe('Syllable Summit answer-uniqueness corrections', () => {
  it('gives each single-select sentence prompt exactly one named word target', () => {
    const closed = question('q-word-forge-syllable-summit-guided-closed-4')
    const open = question('q-word-forge-syllable-summit-guided-open-4')

    expect(closed.prompt).toBe('Select the sentence that includes napkin, a word with two closed syllables.')
    expect(closed.questionContent?.type).toBe('hot_text')
    if (closed.questionContent?.type === 'hot_text') {
      expect(closed.questionContent.correctSegmentIds).toEqual(['rabbit-habitat-2'])
    }

    expect(open.prompt).toBe('Select the sentence that includes music, a word that begins with an open syllable.')
    expect(open.questionContent?.type).toBe('hot_text')
    if (open.questionContent?.type === 'hot_text') {
      expect(open.questionContent.correctSegmentIds).toEqual(['robot-exhibit-2'])
    }
  })

  it('defines the short-vowel contract as a short vowel in both syllables', () => {
    for (const questionId of [
      'q-word-forge-syllable-summit-checkpoint-a-1',
      'q-word-forge-syllable-summit-checkpoint-a-3',
      'q-word-forge-syllable-summit-checkpoint-b-1',
      'q-word-forge-syllable-summit-checkpoint-c-1',
      'q-word-forge-syllable-summit-checkpoint-c-3',
    ]) {
      expect(question(questionId).prompt).toMatch(/both syllables|two syllables each/)
    }

    const stableControl = question('q-word-forge-syllable-summit-checkpoint-b-1')
    expect(stableControl.questionContent?.type).toBe('multiple_choice')
    if (stableControl.questionContent?.type === 'multiple_choice') {
      expect(stableControl.questionContent.correctChoiceIds).toEqual(['sunset-choice'])
      expect(stableControl.questionContent.choices.map((choice) => choice.text)).not.toContain('magnet')
    }
  })

  it('states the open-syllable criterion and retains real distractors', () => {
    const longVowels = question('q-word-forge-syllable-summit-checkpoint-b-3')

    expect(longVowels.prompt).toBe('Choose all the words that begin with an open syllable whose vowel says its long sound.')
    expect(longVowels.questionContent?.type).toBe('multi_select')
    if (longVowels.questionContent?.type === 'multi_select') {
      expect(longVowels.questionContent.correctChoiceIds).toEqual(['music-choice', 'solo-choice'])
      expect(longVowels.questionContent.choices.map((choice) => choice.text)).toEqual(['music', 'solo', 'basket', 'rabbit'])
    }
  })

  it('limits the source-scoped checkpoint to words present in its displayed passage', () => {
    const sourceScoped = question('q-word-forge-syllable-summit-checkpoint-c-3')
    const passage = sampleContent.passages.find((entry) => entry.passageIdentifier === sourceScoped.passageIdentifier)

    expect(sourceScoped.questionContent?.type).toBe('multi_select')
    expect(passage).toBeDefined()
    if (sourceScoped.questionContent?.type === 'multi_select' && passage) {
      expect(sourceScoped.questionContent.correctChoiceIds).toEqual(['rabbit-choice', 'basket-choice'])
      expect(sourceScoped.questionContent.choices.every((choice) => passage.passageText.includes(choice.text))).toBe(true)
    }
  })
})
