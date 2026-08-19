import {
  type LessonQuestion,
  type LessonQuestionSubmission,
  type QuestionEvaluationResult,
} from './lessonTypes'

function sortChoiceIds(values: string[]) {
  return [...values].sort()
}

function normalizeAnswer(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((entry) => String(entry)).filter((entry) => entry.length > 0).sort()
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') {
    return {}
  }
  const source = value as Record<string, unknown>
  const output: Record<string, string> = {}
  for (const [key, raw] of Object.entries(source)) {
    if (typeof raw === 'string' && raw.trim()) {
      output[key] = raw.trim()
    }
  }
  return output
}

export function evaluateAnswer(
  question: LessonQuestion,
  submission: LessonQuestionSubmission,
): QuestionEvaluationResult {
  const evidenceReference = question.evidenceReferenceIds

  switch (question.questionType) {
    case 'MULTIPLE_CHOICE': {
      const selectedChoiceId = (submission.payload as { selectedChoiceId?: string }).selectedChoiceId ?? ''
      const isCorrect = question.correctChoiceIds.includes(selectedChoiceId)
      return {
        questionId: question.questionId,
        questionType: question.questionType,
        submittedAnswer: selectedChoiceId,
        correctAnswer: question.correctChoiceIds[0] ?? '',
        isCorrect,
        explanation: question.explanation,
        evidenceReference,
      }
    }
    case 'MULTISELECT': {
      const selectedChoiceIds = normalizeAnswer(
        (submission.payload as { selectedChoiceIds?: string[] }).selectedChoiceIds,
      )
      const expected = sortChoiceIds(question.correctChoiceIds)
      const actual = sortChoiceIds(selectedChoiceIds)
      const isCorrect =
        expected.length > 0 &&
        expected.length === actual.length &&
        expected.every((value, index) => value === actual[index])
      return {
        questionId: question.questionId,
        questionType: question.questionType,
        submittedAnswer: selectedChoiceIds,
        correctAnswer: expected,
        isCorrect,
        explanation: question.explanation,
        evidenceReference,
      }
    }
    case 'HOT_TEXT': {
      const selectedSegmentIds = normalizeAnswer(
        (submission.payload as { selectedSegmentIds?: string[] }).selectedSegmentIds,
      )
      const expected = sortChoiceIds(question.correctSegmentIds)
      const actual = sortChoiceIds(selectedSegmentIds)
      const isCorrect =
        expected.length > 0 &&
        expected.length === actual.length &&
        expected.every((value, index) => value === actual[index])
      return {
        questionId: question.questionId,
        questionType: question.questionType,
        submittedAnswer: selectedSegmentIds,
        correctAnswer: expected,
        isCorrect,
        explanation: question.explanation,
        evidenceReference,
      }
    }
    case 'EVIDENCE_PAIR': {
      const payload = submission.payload as {
        partAChoiceId?: string
        partBChoiceId?: string
      }
      const partAResult = (payload.partAChoiceId ?? '') === question.partACorrectChoiceId
      const partBResult = (payload.partBChoiceId ?? '') === question.partBCorrectChoiceId
      return {
        questionId: question.questionId,
        questionType: question.questionType,
        submittedAnswer: {
          partA: payload.partAChoiceId ?? '',
          partB: payload.partBChoiceId ?? '',
        },
        correctAnswer: {
          partA: question.partACorrectChoiceId,
          partB: question.partBCorrectChoiceId,
        },
        isCorrect: partAResult && partBResult,
        explanation: question.explanation,
        evidenceReference,
      }
    }
    case 'TABLE_MATCH': {
      const selected = asRecord((submission.payload as { selectedMappings?: Record<string, string> }).selectedMappings)
      const rows = question.rows
      let allCorrect = true
      for (const row of rows) {
        if ((selected[row.id] ?? '') !== row.correctChoiceId) {
          allCorrect = false
          break
        }
      }
      const allAnswered = rows.every((row) => typeof selected[row.id] === 'string')
      const isCorrect = allCorrect && allAnswered
      return {
        questionId: question.questionId,
        questionType: question.questionType,
        submittedAnswer: selected,
        correctAnswer: rows.reduce<Record<string, string>>((acc, row) => {
          acc[row.id] = row.correctChoiceId
          return acc
        }, {}),
        isCorrect,
        explanation: question.explanation,
        evidenceReference,
      }
    }
    default: {
      const _exhaustive: never = question
      void _exhaustive
      return {
        questionId: '',
        questionType: 'MULTIPLE_CHOICE',
        submittedAnswer: '',
        correctAnswer: '',
        isCorrect: false,
        explanation: '',
        evidenceReference,
      }
    }
  }
}
