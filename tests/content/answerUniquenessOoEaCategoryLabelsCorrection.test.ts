import { describe, expect, it } from 'vitest'
import { checkpointQuestions, guidedQuestions } from '../../src/domain/content/packs/grade2/wordForge/variableVowelsOoEa'

describe('oo and ea category-label answer uniqueness', () => {
  it('uses an exact spelling contract instead of the undefined Mixed sound label', () => {
    const questions = [...guidedQuestions, ...checkpointQuestions]
    const spellingQuestions = questions.filter((question) =>
      question.prompt.startsWith('Which vowel-team spelling appears in'),
    )

    expect(spellingQuestions).toHaveLength(5)
    expect(questions.some((question) => question.answerChoices.includes('Mixed sound'))).toBe(false)

    for (const question of spellingQuestions) {
      if (question.questionContent?.type !== 'table_match') throw new Error('Expected a table-match question.')
      expect(question.questionContent.rows).toHaveLength(1)
      expect(question.questionContent.rows[0].options.map((option) => option.text).sort()).toEqual([
        'ea',
        'neither ea nor oo',
        'oo',
      ])
    }
  })
})
