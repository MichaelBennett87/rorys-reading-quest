import { describe, expect, it } from 'vitest'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

const pack = getActiveContentPacks().find(
  (candidate) => candidate.manifest.packId === 'g3-word-forge-suffix-shifter',
)

if (!pack) throw new Error('Suffix Shifter pack is unavailable.')

function twoPartQuestion(questionIdentifier: string) {
  const question = pack!.questions.find(
    (candidate) => candidate.questionIdentifier === questionIdentifier,
  )

  expect(question).toBeDefined()
  expect(question?.questionContent?.type).toBe('two_part')
  const content = question?.questionContent
  if (!content || content.type !== 'two_part') {
    throw new Error(`Expected ${questionIdentifier} to be a two-part question.`)
  }

  return content
}

describe('Suffix Shifter answer-uniqueness corrections', () => {
  it.each([
    {
      questionId: 'lesson-g3-suffix-shifter-checkpoint-maker-q-7',
      morphology: 'color | ful',
      replacement: 'colorfu | l',
    },
    {
      questionId: 'lesson-g3-suffix-shifter-checkpoint-nature-q-7',
      morphology: 'break | able',
      replacement: 'breakabl | e',
    },
    {
      questionId: 'lesson-g3-suffix-shifter-checkpoint-weather-q-7',
      morphology: 'wash | able',
      replacement: 'washabl | e',
    },
  ])(
    'does not reuse the defensible Part A split as a Part B distractor in $questionId',
    ({ questionId, morphology, replacement }) => {
      const content = twoPartQuestion(questionId)
      const partBTexts = content.partBChoices.map((choice) => choice.text)

      expect(partBTexts).not.toContain(morphology)
      expect(partBTexts).toContain(replacement)
      expect(content.partBChoices).toHaveLength(4)
    },
  )
})
