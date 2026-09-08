import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../src/domain/content'

const pack = contentPacks.find((candidate) => candidate.manifest.packId === 'g2-word-forge-common-suffixes')

describe('common-suffix answer-uniqueness corrections', () => {
  it('limits the trail exact set to the four suffixes named in the prompt', () => {
    expect(pack).toBeDefined()
    const question = pack!.questions.find((candidate) => (
      candidate.questionIdentifier === 'q-word-forge-common-suffixes-guided-action-endings-3'
    ))

    expect(question?.prompt).toBe(
      'Choose all the words in the trail passage that end with -ing, -ly, -er, or -est.',
    )
    expect(question?.questionContent).toMatchObject({
      type: 'multi_select',
      correctChoiceIds: ['helping-choice', 'quickly-choice', 'faster-choice', 'smallest-choice'],
    })
  })

  it('does not ask learners to inspect undisplayed checkpoint passages', () => {
    expect(pack).toBeDefined()
    const comparisonQuestions = pack!.questions.filter((question) => (
      question.activityIdentifier?.match(/common-suffixes-checkpoint-[abc]-5$/)
    ))

    expect(comparisonQuestions).toHaveLength(3)
    for (const question of comparisonQuestions) {
      expect(question.prompt).toBe('Choose all the words that use -er or -est to compare things.')
      expect(question.prompt).not.toContain('checkpoint passages')
    }
  })

  it('makes the keyed quickly sentence uniquely responsive', () => {
    expect(pack).toBeDefined()
    const quicklyQuestions = pack!.questions.filter((question) => (
      question.activityIdentifier?.match(/common-suffixes-checkpoint-[abc]-6$/)
    ))

    expect(quicklyQuestions).toHaveLength(3)
    for (const question of quicklyQuestions) {
      expect(question.prompt).toBe(
        'Select the sentence that uses the word quickly to describe how the spill was wiped.',
      )
      expect(question.questionContent).toMatchObject({
        type: 'hot_text',
        correctSegmentIds: ['suffix-pantry-3'],
      })
    }
  })
})
