import { describe, expect, test } from 'vitest'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

const pack = getActiveContentPacks().find(
  (candidate) => candidate.manifest.packId === 'g3-information-detectives-central-idea-engine',
)

if (!pack) {
  throw new Error('Central Idea Engine pack is unavailable.')
}

describe('Central Idea Engine answer uniqueness corrections', () => {
  test('constrains helmet evidence to the keyed mechanism and later safety detail', () => {
    const question = pack.questions.find(
      (candidate) => candidate.questionIdentifier === 'g3-id-ci-q3-3',
    )

    expect(question?.prompt).toBe(
      'Choose the detail explaining what the hard outer shell does and the later detail explaining when a helmet should be replaced.',
    )
    if (!question?.questionContent || question.questionContent.type !== 'multi_select') {
      throw new Error('Expected the helmet evidence item to remain multiselect.')
    }
    expect(question.correctAnswers).toEqual([
      'The hard outer shell can spread some force and resist contact with a sharp surface.',
      'A helmet should be replaced after a hard crash because damage may not be visible.',
    ])
  })

  test('constrains seed evidence to the keyed wing mechanism and travel benefit', () => {
    const question = pack.questions.find(
      (candidate) => candidate.questionIdentifier === 'g3-id-ci-q4-3',
    )

    expect(question?.prompt).toBe(
      'Choose the detail explaining how a seed wing helps wind carry it and the later detail explaining why traveling away helps a seed.',
    )
    expect(question?.correctAnswers).toEqual([
      'The wing makes the seed spin as it falls and can give a breeze more time to carry it.',
      'Moving away can reduce competition with the parent plant for light, water, and space.',
    ])
  })

  test('asks specifically for the tiny-hook animal-travel mechanism', () => {
    const question = pack.questions.find(
      (candidate) => candidate.questionIdentifier === 'g3-id-ci-q4-4',
    )

    expect(question?.prompt).toBe(
      'Select the sentence that explains how tiny hooks can carry a seed on an animal.',
    )
    expect(question?.correctAnswers).toEqual([
      'The hooks can catch on animal fur and later fall off in another place.',
    ])
  })

  test('keeps every two-part evidence choice visibly distinct', () => {
    const twoPartQuestions = pack.questions.filter(
      (question) => question.questionContent?.type === 'two_part',
    )

    expect(twoPartQuestions).not.toHaveLength(0)
    for (const question of twoPartQuestions) {
      const content = question.questionContent
      if (!content || content.type !== 'two_part') {
        throw new Error('Expected a two-part question.')
      }
      const choiceTexts = content.partBChoices.map((choice) => choice.text)
      expect(new Set(choiceTexts).size, question.questionIdentifier).toBe(choiceTexts.length)
    }
  })
})
