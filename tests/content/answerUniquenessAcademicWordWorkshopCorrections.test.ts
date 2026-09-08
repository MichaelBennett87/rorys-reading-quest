import { describe, expect, it } from 'vitest'
import { academicWordWorkshopQuestions } from '../../src/domain/content/packs/grade2/contextCavern/academicWordWorkshop/pack'

describe('Academic Word Workshop answer-uniqueness corrections', () => {
  it('replaces broad subject judgments with seven exact two-task contracts', () => {
    const taskQuestions = academicWordWorkshopQuestions.filter((question) =>
      question.questionType === 'multi_select'
      && question.prompt.includes('Which two school tasks'),
    )

    expect(taskQuestions).toHaveLength(7)
    expect(academicWordWorkshopQuestions.some((question) => question.prompt.startsWith('Choose two subjects where'))).toBe(false)

    for (const question of taskQuestions) {
      if (question.questionContent?.type !== 'multi_select') throw new Error('Expected a multiselect question.')
      expect(question.prompt).toMatch(/Choose two\.$/)
      expect(question.questionContent.choices).toHaveLength(4)
      expect(question.questionContent.correctChoiceIds).toHaveLength(2)
      expect(new Set(question.questionContent.correctChoiceIds).size).toBe(2)
      expect(question.questionContent.correctChoiceIds.every((choiceId) =>
        question.questionContent?.type === 'multi_select'
        && question.questionContent.choices.some((choice) => choice.id === choiceId),
      )).toBe(true)
    }
  })

  it('offers only one sentence that contains the requested Hot Text target word', () => {
    const hotTextQuestions = academicWordWorkshopQuestions.filter((question) => question.questionType === 'hot_text')

    expect(hotTextQuestions).toHaveLength(7)
    for (const question of hotTextQuestions) {
      if (question.questionContent?.type !== 'hot_text') throw new Error('Expected a Hot Text question.')
      const targetWord = question.targetVocabulary[0].toLowerCase()
      const matchingSegments = question.questionContent.selectableSegments.filter((segment) =>
        segment.text.toLowerCase().split(/[^a-z]+/).includes(targetWord),
      )
      expect(matchingSegments).toHaveLength(1)
      expect(question.questionContent.correctSegmentIds).toEqual([matchingSegments[0].id])
    }
  })

  it('explains why each checkpoint word matches its meaning in Part B', () => {
    const expectedMeanings = new Map([
      ['lesson-cc-aww-checkpoint-a-q-7', 'An example is one sample that helps show an idea.'],
      ['lesson-cc-aww-checkpoint-b-q-7', 'A result is what happens after something is done.'],
      ['lesson-cc-aww-checkpoint-c-q-7', 'To predict means to make a smart guess about what may happen.'],
    ])

    for (const [questionId, expectedMeaning] of expectedMeanings) {
      const question = academicWordWorkshopQuestions.find((candidate) => candidate.questionIdentifier === questionId)
      expect(question, questionId).toBeDefined()
      const content = question?.questionContent
      expect(content?.type, questionId).toBe('two_part')
      if (content?.type !== 'two_part') throw new Error(`Expected ${questionId} to be a two-part question.`)
      const keyed = content.partBChoices.find((choice) => choice.id === content.partBCorrectChoiceId)
      expect(content.partBPrompt).toBe('Which explanation shows why the word fits?')
      expect(keyed?.text, questionId).toBe(expectedMeaning)
    }
  })
})
