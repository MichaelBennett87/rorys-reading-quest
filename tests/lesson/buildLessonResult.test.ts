import { describe, expect, test } from 'vitest'

import { buildLessonResult, type QuestionEvaluationResult } from '../../src/domain/lesson'

describe('buildLessonResult', () => {
  const base = {
    lessonId: 'lesson-word-forge-vowel-voyage',
    activityId: 'act-word-forge-vowel-voyage',
    skillId: 'g2-word-forge-word-practice',
    difficulty: 1,
    lessonRole: 'GUIDED_PRACTICE' as const,
  }

  test('tracks correct count and accuracy', () => {
    const questionEvaluations: QuestionEvaluationResult[] = [
      {
        questionId: 'q1',
        questionType: 'MULTIPLE_CHOICE',
        submittedAnswer: 'a',
        correctAnswer: 'a',
        isCorrect: true,
        explanation: 'Great.',
        evidenceReference: [],
      },
      {
        questionId: 'q2',
        questionType: 'MULTISELECT',
        submittedAnswer: ['a'],
        correctAnswer: ['a'],
        isCorrect: false,
        explanation: 'Try again.',
        evidenceReference: [],
      },
    ]

    const result = buildLessonResult({
      ...base,
      questionEvaluations,
    })

    expect(result.totalQuestions).toBe(2)
    expect(result.correctAnswers).toBe(1)
    expect(result.accuracy).toBe(50)
    expect(result.questionResults).toHaveLength(2)
  })

  test('preserves first-attempt correctness and never includes a FAST score', () => {
    const questionEvaluations: QuestionEvaluationResult[] = [
      {
        questionId: 'q1',
        questionType: 'EVIDENCE_PAIR',
        submittedAnswer: { partA: 'x', partB: 'y' },
        correctAnswer: { partA: 'x', partB: 'y' },
        isCorrect: true,
        explanation: 'Great.',
        evidenceReference: [],
      },
      {
        questionId: 'q2',
        questionType: 'HOT_TEXT',
        submittedAnswer: ['a'],
        correctAnswer: ['a'],
        isCorrect: true,
        explanation: 'Great.',
        evidenceReference: [],
      },
    ]

    const result = buildLessonResult({
      ...base,
      questionEvaluations,
    })

    expect(result.firstAttemptCorrect).toBe(2)
    expect(Object.keys(result)).not.toContain('fastScore')
    expect(result.questionResults[1]).toEqual(
      expect.objectContaining({
        questionId: 'q2',
        isCorrect: true,
      }),
    )
  })
})
