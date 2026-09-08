import { describe, expect, it } from 'vitest'

import { summaryStrongholdQuestions } from '../../src/domain/content/packs/grade3/compareCastle/summaryStronghold/questions'

describe('Summary Stronghold answer uniqueness corrections', () => {
  it('gives every essential-detail item a visible centrality criterion', () => {
    const prompt = "Which detail most directly states the source's central problem or main idea?"
    const questions = summaryStrongholdQuestions.filter((question) => question.prompt === prompt)

    expect(questions).toHaveLength(7)
    expect(summaryStrongholdQuestions.some((question) => question.prompt === 'Which detail is important enough to include in a summary?')).toBe(false)
  })

  it('distinguishes Ava\'s central problem from a source-supported closing detail', () => {
    const question = summaryStrongholdQuestions.find((entry) => entry.questionIdentifier === 'g3-cg-ss-q1-2')
    const serialized = JSON.stringify(question)

    expect(question?.prompt).toBe("Which detail most directly states the source's central problem or main idea?")
    expect(serialized).toContain('When the first families entered, the route card was missing from the welcome table.')
    expect(serialized).toContain('Afterward, she thanked Mr. Ruiz and saved the photograph in the art-walk folder.')
    expect(question?.correctAnswers).toEqual(['When the first families entered, the route card was missing from the welcome table.'])
  })
})
