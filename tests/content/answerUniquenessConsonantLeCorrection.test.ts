import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../src/domain/content'

describe('consonant-le answer-uniqueness correction', () => {
  it('does not falsely require the open-syllable answer to occur in the Puzzle Club source', () => {
    const pack = contentPacks.find((candidate) => candidate.manifest.packId === 'g2-word-forge-consonant-le-integrated')
    const question = pack?.questions.find((candidate) => (
      candidate.questionIdentifier === 'q-word-forge-consonant-le-checkpoint-b-4'
    ))

    expect(question).toBeDefined()
    expect(question?.prompt).toBe('Which word has an open syllable before consonant-le?')
    expect(question?.prompt).not.toContain('in the puzzle club lesson')
    expect(question?.questionContent).toMatchObject({
      type: 'multiple_choice',
      correctChoiceIds: ['table-choice'],
    })
  })
})
