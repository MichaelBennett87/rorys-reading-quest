import { describe, expect, it } from 'vitest'

import { sampleContent } from '../../src/domain/content'

function question(questionIdentifier: string) {
  const found = sampleContent.questions.find((candidate) => candidate.questionIdentifier === questionIdentifier)
  if (!found) throw new Error(`Missing question ${questionIdentifier}`)
  return found
}

describe('semantic answer-uniqueness corrections for Grade 2 story and fluency questions', () => {
  it('bounds the final fluency checks to visible spelling evidence', () => {
    const checking = question('question-word-forge-fluency-practice-science-demonstration-2')
    expect(checking.prompt).toBe('Which sentence shows a child planning to check the spelling of a title?')
    expect(checking.correctAnswers).toEqual(['library-check-sentence'])

    const patterns = question('question-word-forge-fluency-practice-science-demonstration-3')
    expect(patterns.prompt).toBe(
      'Choose all the words that use a consonant-le ending, the prefix mis-, or the suffix -ful.',
    )
    expect(patterns.correctAnswers).toEqual([
      'library-bubble-choice-2',
      'library-misspell-choice-2',
      'library-helpful-choice-3',
    ])
  })

  it('distinguishes solution actions from later outcomes in Story Map', () => {
    expect(question('g2-story-scouts-plot-structure-elements-guided-b-q4').prompt).toBe(
      'Which sentence lists the actions Jamal uses to make the messy display neat?',
    )
    expect(question('g2-story-scouts-plot-structure-elements-checkpoint-c-q5').prompt).toBe(
      'Which sentence directly says the street and sidewalk look clean after the work?',
    )
  })

  it('uses explicit story-stage constraints for Theme Trail evidence', () => {
    expect(question('g2-story-scouts-theme-trail-checkpoint-a-mc-3').prompt).toContain('changing their plan')
    expect(question('g2-story-scouts-theme-trail-checkpoint-a-ht-1').prompt).toBe(
      'Select the sentence that identifies a different strength for each friend.',
    )
    expect(question('g2-story-scouts-theme-trail-checkpoint-b-ht-1').prompt).toContain('moment Ava decides')
    expect(question('g2-story-scouts-theme-trail-checkpoint-c-ms-1').prompt).toContain(
      'how Eli repaired trust after he forgot the book',
    )
    expect(question('g2-story-scouts-theme-trail-checkpoint-c-ht-1').prompt).toContain("lists Eli's actions")

    for (const suffix of ['a', 'b', 'c']) {
      const item = question(`g2-story-scouts-theme-trail-checkpoint-${suffix}-ep-1`)
      const content = item.questionContent
      expect(content?.type).toBe('two_part')
      if (content?.type === 'two_part') {
        expect(content.partBPrompt).toBe(
          'Which choice states the result and explains how it supports that theme?',
        )
      }
    }
  })

  it('separates first perspective, supporting action, and later outcome', () => {
    const perspectiveQuestions = sampleContent.questions.filter(
      (candidate) =>
        candidate.questionIdentifier.startsWith('g2-story-scouts-perspective-portal') &&
        candidate.questionType === 'hot_text',
    )
    expect(perspectiveQuestions).toHaveLength(7)
    for (const item of perspectiveQuestions) {
      expect(item.prompt).toMatch(/first view of what should happen\.$/)
      expect(item.evidenceReferenceIds).toHaveLength(1)
    }

    for (const suffix of ['a', 'b', 'c']) {
      const multi = question(`g2-story-scouts-perspective-portal-checkpoint-${suffix}-ms-1`)
      expect(multi.prompt).toMatch(/one that states .*'s view and one that shows .* acting on it\.$/)

      const paired = question(`g2-story-scouts-perspective-portal-checkpoint-${suffix}-ep-1`)
      const content = paired.questionContent
      expect(content?.type).toBe('two_part')
      if (content?.type === 'two_part') {
        expect(content.partBPrompt).toMatch(/^Which detail shows .* acting on that perspective\?$/)
      }
    }
  })
})
