import { describe, expect, test } from 'vitest'

import {
  assertQuestionGradingContract,
  evaluateAnswer,
  getLessonById,
  lessonCatalog,
  type LessonQuestion,
} from '../../src/domain/lesson'
import { buildActiveQuestionTruthInventory } from '../../src/domain/content/questionTruthAudit'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

describe('all-active-question grading truth contract', () => {
  test('accepts every canonical response and rejects every generated adversarial response', () => {
    const inventory = buildActiveQuestionTruthInventory(getActiveContentPacks())
    const packByQuestionId = new Map(inventory.records.map((record) => [record.questionId, record.packId] as const))
    const questions = getAllActiveLessonQuestions()
    const reports = questions.map(assertQuestionGradingContract)
    const failures = reports.flatMap((report) => report.issues.map((issue) => ({
      packId: packByQuestionId.get(report.questionId) ?? 'unknown-pack',
      ...issue,
    })))

    expect(questions).toHaveLength(1368)
    expect(new Set(questions.map((question) => question.questionId)).size).toBe(1368)
    expect(reports.reduce((sum, report) => sum + report.canonicalSubmissionCount, 0)).toBe(1368)
    expect(reports.reduce((sum, report) => sum + report.adversarialSubmissionCount, 0)).toBeGreaterThan(9_000)
    expect(failures, JSON.stringify(failures.slice(0, 50), null, 2)).toEqual([])
  }, 20_000)

  test('rejects unknown or extra table mappings instead of ignoring malformed data', () => {
    const tableQuestion = getAllActiveLessonQuestions().find((question) => question.questionType === 'TABLE_MATCH')
    expect(tableQuestion?.questionType).toBe('TABLE_MATCH')
    if (!tableQuestion || tableQuestion.questionType !== 'TABLE_MATCH') return
    const canonical = Object.fromEntries(tableQuestion.rows.map((row) => [row.id, row.correctChoiceId]))

    expect(evaluateAnswer(tableQuestion, {
      questionType: 'TABLE_MATCH',
      payload: { selectedMappings: { ...canonical, unknownRow: 'unknownOption' } },
    }).isCorrect).toBe(false)
    expect(evaluateAnswer(tableQuestion, {
      questionType: 'TABLE_MATCH',
      payload: { selectedMappings: { ...canonical, [tableQuestion.rows[0].id]: 'unknownOption' } },
    }).isCorrect).toBe(false)
  })
})

function getAllActiveLessonQuestions(): LessonQuestion[] {
  if (cachedQuestions) return cachedQuestions
  cachedQuestions = lessonCatalog
    .filter((entry) => entry.selectionStatus === 'active' && !entry.packId.startsWith('legacy-'))
    .flatMap((entry) => {
      const result = getLessonById(entry.lessonId)
      if (!result.lesson || result.errors.length > 0) {
        throw new Error(`${entry.packId}/${entry.lessonId}: ${result.errors.join('; ')}`)
      }
      return result.lesson.questions
    })
  return cachedQuestions
}

let cachedQuestions: LessonQuestion[] | null = null
