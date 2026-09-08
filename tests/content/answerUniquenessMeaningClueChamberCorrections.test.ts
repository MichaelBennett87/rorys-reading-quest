import { describe, expect, it } from 'vitest'
import { meaningClueChamberQuestions } from '../../src/domain/content/packs/grade2/contextCavern/meaningClueChamber/pack'

describe('Meaning Clue Chamber answer-uniqueness corrections', () => {
  it('states the exact strategy evidence instead of asking learners to rank equally direct tools', () => {
    const strategyQuestions = meaningClueChamberQuestions.filter((question) =>
      question.questionType === 'multiple_choice'
      && question.questionContent?.type === 'multiple_choice'
      && question.questionContent.choices.some((choice) => choice.text === 'glossary')
      && question.questionContent.choices.some((choice) => choice.text === 'word relationship'),
    )

    expect(strategyQuestions).toHaveLength(7)
    for (const question of strategyQuestions) {
      expect(question.prompt, question.questionIdentifier).not.toContain('helps most')
      expect(question.prompt, question.questionIdentifier).toMatch(/displayed glossary entry|relationship between/)
    }
  })

  it('uses two distinct learner-visible clues in every exact-set question', () => {
    const multiselectQuestions = meaningClueChamberQuestions.filter((question) => question.questionType === 'multi_select')

    expect(multiselectQuestions).toHaveLength(7)
    for (const question of multiselectQuestions) {
      const content = question.questionContent
      expect(content?.type, question.questionIdentifier).toBe('multi_select')
      if (content?.type !== 'multi_select') throw new Error(`Expected ${question.questionIdentifier} to be multiselect.`)
      const keyedChoices = content.choices.filter((choice) => content.correctChoiceIds.includes(choice.id))
      expect(content.correctChoiceIds, question.questionIdentifier).toHaveLength(2)
      expect(new Set(keyedChoices.map((choice) => choice.text)).size, question.questionIdentifier).toBe(2)
      expect(content.choices.some((choice) => /^g2-cc-meaning-clues-.+-sentence-\d+$/.test(choice.text))).toBe(false)
      expect(question.prompt, question.questionIdentifier).toContain('Choose 2')
    }
  })

  it('offers only one Hot Text sentence containing the target word', () => {
    const hotTextQuestions = meaningClueChamberQuestions.filter((question) => question.questionType === 'hot_text')

    expect(hotTextQuestions).toHaveLength(7)
    for (const question of hotTextQuestions) {
      const content = question.questionContent
      expect(content?.type, question.questionIdentifier).toBe('hot_text')
      if (content?.type !== 'hot_text') throw new Error(`Expected ${question.questionIdentifier} to be Hot Text.`)
      const targetWord = question.targetVocabulary[0].toLowerCase()
      const matchingSegments = content.selectableSegments.filter((segment) =>
        segment.text.toLowerCase().includes(targetWord),
      )
      expect(matchingSegments, question.questionIdentifier).toHaveLength(1)
      expect(content.correctSegmentIds, question.questionIdentifier).toEqual([matchingSegments[0].id])
    }
  })
})
