import { describe, expect, test } from 'vitest'

import { grade2ContextCavernMorphologyMinePack } from '../../src/domain/content/packs/grade2/contextCavern/morphologyMine'

function table(questionId: string) {
  const question = grade2ContextCavernMorphologyMinePack.questions.find(
    (candidate) => candidate.questionIdentifier === questionId,
  )
  expect(question, questionId).toBeDefined()
  const content = question?.questionContent
  expect(content?.type, questionId).toBe('table_match')
  if (content?.type !== 'table_match') throw new Error(`Expected ${questionId} to be a table match.`)
  return content
}

describe('Morphology Mine answer-uniqueness corrections', () => {
  test('answers every base-word row with an actual base word', () => {
    const content = table('lesson-cc-morphology-prereq-find-base-word-q-5')
    const expected = new Map([
      ['helping', 'help'],
      ['slowly', 'slow'],
    ])

    for (const [rowPrompt, baseWord] of expected) {
      const row = content.rows.find((candidate) => candidate.prompt === rowPrompt)
      const keyed = row?.options.find((option) => option.id === row.correctChoiceId)
      expect(keyed?.text, rowPrompt).toBe(baseWord)
    }
  })

  test('removes the overlapping helpful synonym from the meaning table', () => {
    const content = table('lesson-cc-morphology-guided-prefixes-build-meanings-q-5')
    const row = content.rows.find((candidate) => candidate.prompt === 'helpful')
    expect(row).toBeDefined()
    expect(row?.options.map((option) => option.text)).not.toContain('kind helper')
    expect(row?.options.map((option) => option.text)).toContain('help happening now')
    expect(row?.options.find((option) => option.id === row.correctChoiceId)?.text).toBe('full of help')
  })
})
