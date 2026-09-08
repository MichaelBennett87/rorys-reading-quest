import { describe, expect, it } from 'vitest'
import {
  rhymeRoutesCheckpointQuestions,
  rhymeRoutesGuidedQuestions,
} from '../../src/domain/content/packs/grade2/poetryPlanet/rhymeRoutes'

const byId = (questionId: string) => {
  const question = [...rhymeRoutesGuidedQuestions, ...rhymeRoutesCheckpointQuestions]
    .find((candidate) => candidate.questionIdentifier === questionId)
  if (!question) throw new Error(`Missing question ${questionId}.`)
  return question
}

describe('Rhyme Routes answer-uniqueness corrections', () => {
  it('identifies the intended first or intervening rhyme line', () => {
    expect(byId('g2-poetry-planet-rhyme-routes-lesson-guided-b-question-mc-2').prompt)
      .toBe('Which line ends with row, the new rhyme sound between lines 2 and 4?')
    expect(byId('g2-poetry-planet-rhyme-routes-lesson-checkpoint-a-question-mc-2').prompt)
      .toBe('Which line first introduces the rhyme labeled B?')
  })

  it.each([
    [
      'g2-poetry-planet-rhyme-routes-lesson-checkpoint-a-question-ep-1',
      'Which end-word evidence proves the complete AABB scheme?',
      'gate/wait and rope/hope',
    ],
    [
      'g2-poetry-planet-rhyme-routes-lesson-checkpoint-b-question-ep-1',
      'Which end-word evidence proves the complete ABABCDCD scheme?',
      'row/blow, pace/place, high/sky, and light/night',
    ],
  ])('requires complete evidence in %s', (questionId, expectedPrompt, expectedAnswer) => {
    const question = byId(questionId)
    const content = question.questionContent
    if (!content || content.type !== 'two_part') throw new Error('Expected a two-part question.')
    expect(content.partBPrompt).toBe(expectedPrompt)
    const keyed = content.partBChoices.find((choice) =>
      choice.id === content.partBCorrectChoiceId,
    )
    expect(keyed?.text).toBe(expectedAnswer)
    expect(content.partBChoices.filter((choice) => choice.text.includes('only'))).toHaveLength(1)
  })
})
