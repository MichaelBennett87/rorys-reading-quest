import { describe, expect, it } from 'vitest'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

const pack = getActiveContentPacks().find(
  (candidate) => candidate.manifest.packId === 'g3-word-forge-multisyllable-mountain',
)

describe('Multisyllable Mountain answer-uniqueness corrections', () => {
  it('uses visible constraints that exclude the proto- analysis from the exact-set item', () => {
    const question = pack?.questions.find(
      (candidate) =>
        candidate.questionIdentifier ===
        'lesson-g3-multisyllable-mountain-checkpoint-engineering-q-4',
    )

    expect(question).toMatchObject({
      prompt: 'Choose the compound word and the word that begins with re-.',
      correctAnswers: [
        'lesson-g3-multisyllable-mountain-checkpoint-engineering-q-4-choice-2',
        'lesson-g3-multisyllable-mountain-checkpoint-engineering-q-4-choice-3',
      ],
      questionContent: {
        type: 'multi_select',
        choices: [
          expect.objectContaining({ text: 'prototype' }),
          expect.objectContaining({ text: 'worktable' }),
          expect.objectContaining({ text: 'rebuild' }),
          expect.objectContaining({ text: 'magnetic' }),
        ],
      },
    })
  })
})
