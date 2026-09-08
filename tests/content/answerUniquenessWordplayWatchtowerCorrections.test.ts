import { describe, expect, it } from 'vitest'
import { wordplayWatchtowerGuidedQuestions } from '../../src/domain/content/packs/grade2/compareCastle/wordplayWatchtower/questionsGuided'
import { wordplayWatchtowerPrerequisiteQuestions } from '../../src/domain/content/packs/grade2/compareCastle/wordplayWatchtower/questionsPrerequisite'

function requireQuestion(questionId: string) {
  const question = [...wordplayWatchtowerPrerequisiteQuestions, ...wordplayWatchtowerGuidedQuestions]
    .find((candidate) => candidate.questionIdentifier === questionId)
  expect(question, questionId).toBeDefined()
  return question!
}

describe('Wordplay Watchtower answer-uniqueness corrections', () => {
  it('identifies the intended banner comparison without making a second simile defensible', () => {
    const question = requireQuestion('lesson-cg-wordplay-prereq-spot-the-comparison-q-1')
    expect(question.prompt).toBe('Which sentence compares the banner to a bright fish?')
  })

  it('gives the agreement exact-set question two complete, source-visible clues', () => {
    const question = requireQuestion('lesson-cg-wordplay-prereq-meaning-beyond-the-words-q-3')
    expect(question.prompt).toContain('the phrase that shows agreement')
    const content = question.questionContent
    expect(content?.type).toBe('multi_select')
    if (content?.type !== 'multi_select') throw new Error('Expected a multiselect question.')
    const keyedTexts = content.choices
      .filter((choice) => content.correctChoiceIds.includes(choice.id))
      .map((choice) => choice.text)
    expect(keyedTexts).toEqual(['on the same page', 'the book club plan'])
  })

  it('uses source-exact Hot Text segments and a unique alliteration contract', () => {
    const expectations = [
      ['lesson-cg-wordplay-prereq-spot-the-comparison-q-4', 'Blue banners bobbed'],
      ['lesson-cg-wordplay-prereq-meaning-beyond-the-words-q-4', 'careful cats carried'],
      ['lesson-cg-wordplay-guided-similes-and-idioms-in-context-q-4', 'paper petals pushed'],
    ] as const

    for (const [questionId, expectedText] of expectations) {
      const question = requireQuestion(questionId)
      const content = question.questionContent
      expect(content?.type, questionId).toBe('hot_text')
      if (content?.type !== 'hot_text') throw new Error(`Expected ${questionId} to be Hot Text.`)
      expect(question.prompt, questionId).toContain('three-word phrase')
      const keyed = content.selectableSegments.find((segment) => content.correctSegmentIds.includes(segment.id))
      expect(keyed?.text, questionId).toBe(expectedText)
    }

    const library = requireQuestion('lesson-cg-wordplay-prereq-meaning-beyond-the-words-q-4')
    const libraryContent = library.questionContent
    if (libraryContent?.type !== 'hot_text') throw new Error('Expected library Hot Text.')
    expect(libraryContent.selectableSegments.some((segment) => segment.text === 'The helpers keep an eye')).toBe(true)

    const garden = requireQuestion('lesson-cg-wordplay-guided-similes-and-idioms-in-context-q-4')
    const gardenContent = garden.questionContent
    if (gardenContent?.type !== 'hot_text') throw new Error('Expected garden Hot Text.')
    expect(gardenContent.selectableSegments.some((segment) => segment.text === 'Maya helped get the ball rolling')).toBe(true)
  })
})
