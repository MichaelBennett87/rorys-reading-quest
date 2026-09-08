import { describe, expect, test } from 'vitest'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

const pack = getActiveContentPacks().find(
  (candidate) => candidate.manifest.packId === 'g3-information-detectives-purpose-development-path',
)

if (!pack) {
  throw new Error('Purpose Development Path pack is unavailable.')
}

describe('Purpose Development Path answer uniqueness corrections', () => {
  test('constrains recycled-paper evidence to fiber softening and final drying', () => {
    const question = pack.questions.find(
      (candidate) => candidate.questionIdentifier === 'g3-id-pd-q1-3',
    )

    expect(question?.prompt).toBe(
      'Choose the detail explaining how soaking changes paper fibers and the later detail explaining how the damp layer becomes a firm sheet.',
    )
    expect(question?.correctAnswers).toEqual([
      'Soaking softens the paper and loosens the tiny fibers inside it.',
      'The damp layer dries until it becomes a firm sheet.',
    ])
  })

  test('asks specifically for the pulp-on-screen step', () => {
    const question = pack.questions.find(
      (candidate) => candidate.questionIdentifier === 'g3-id-pd-q1-4',
    )

    expect(question?.prompt).toBe(
      'Select the sentence that explains the step where watery pulp begins forming on a screen.',
    )
    expect(question?.correctAnswers).toEqual([
      'The watery pulp is poured across a flat screen.',
    ])
  })

  test('constrains pond evidence to the opening and returning winter details', () => {
    const question = pack.questions.find(
      (candidate) => candidate.questionIdentifier === 'g3-id-pd-q6-4',
    )

    expect(question?.prompt).toBe(
      'Choose the winter-ice detail and the later detail showing the pond returning to colder winter conditions.',
    )
    expect(question?.correctAnswers).toHaveLength(2)
  })

  test('asks how humid air changes drying time when the selectable sentence states the effect', () => {
    const question = pack.questions.find(
      (candidate) => candidate.questionIdentifier === 'g3-id-pd-q5-5',
    )

    expect(question?.prompt).toBe(
      'Select the sentence that best explains how humid air can change a puddle\'s drying time.',
    )
    expect(question?.correctAnswers).toEqual([
      'Evaporation may then happen more slowly than it does in drier air at the same temperature.',
    ])
  })
})
