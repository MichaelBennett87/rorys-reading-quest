import { describe, expect, it } from 'vitest'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

function questionById(questionId: string) {
  return getActiveContentPacks()
    .flatMap((pack) => pack.questions)
    .find((question) => question.questionIdentifier === questionId)
}

describe('Meaning Maze answer-uniqueness corrections', () => {
  it('limits the time-slipped-away evidence request to the following line', () => {
    const question = questionById('lesson-g3-cc-mm-figurative-phrase-paths-q-4')

    expect(question?.questionContent?.type).toBe('multi_select')
    expect(question?.prompt).toBe(
      'Choose the two details in the line immediately after time slipped away that show time passed before the work was finished. Select two.',
    )
  })

  it('asks for the next line rather than permitting the target line as its own confirmation', () => {
    const question = questionById('lesson-g3-cc-mm-figurative-phrase-paths-q-5')

    expect(question?.questionContent?.type).toBe('hot_text')
    expect(question?.prompt).toBe(
      'Select the next line after the idea took root that confirms the idea was accepted and developed by the group.',
    )
  })
})
