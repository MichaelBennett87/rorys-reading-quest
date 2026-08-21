import {
  evaluateAnswer,
  type LessonDefinition,
  type LessonQuestion,
  type LessonQuestionSubmission,
  type QuestionEvaluationResult,
} from '../domain/lesson'
import type {
  ActiveLessonSession,
  PersistedAssistanceEvent,
  PersistedAnswer,
  PersistedSubmittedQuestion,
} from './questProgressTypes'

export function createActiveLessonSession(
  lesson: LessonDefinition,
  sessionId: string,
  timestamp: string,
): ActiveLessonSession {
  return {
    sessionId,
    lessonId: lesson.lessonId,
    lessonRole: lesson.lessonRole,
    activityId: lesson.activityId,
    contentVersion: lesson.contentVersion,
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    currentQuestionIndex: 0,
    submittedQuestions: [],
    assistanceEvents: [],
    fluencyPracticeState: lesson.lessonRole === 'FLUENCY_PRACTICE'
      ? {
          modelReadUsed: false,
          phrasePracticeCompleted: false,
          completedReadCount: 0,
          reflection: null,
        }
      : null,
    startedAt: timestamp,
    updatedAt: timestamp,
  }
}

export function checkpointSubmittedQuestion(
  session: ActiveLessonSession,
  evaluation: QuestionEvaluationResult,
  currentQuestionIndex: number,
  timestamp: string,
): ActiveLessonSession {
  const submittedAnswer = toPersistedAnswer(evaluation.submittedAnswer)
  const submitted: PersistedSubmittedQuestion = {
    questionId: evaluation.questionId,
    submittedAnswer,
    isCorrect: evaluation.isCorrect,
    isFirstAttemptCorrect: evaluation.isCorrect,
  }
  return {
    ...session,
    currentQuestionIndex,
    submittedQuestions: [
      ...session.submittedQuestions.filter((question) => question.questionId !== evaluation.questionId),
      submitted,
    ],
    assistanceEvents: cloneAssistanceEvents(session.assistanceEvents),
    updatedAt: timestamp,
  }
}

export function advanceActiveLessonSession(
  session: ActiveLessonSession,
  currentQuestionIndex: number,
  timestamp: string,
): ActiveLessonSession {
  return { ...session, currentQuestionIndex, assistanceEvents: cloneAssistanceEvents(session.assistanceEvents), updatedAt: timestamp }
}

export function restoreLessonEvaluations(
  lesson: LessonDefinition,
  session: ActiveLessonSession | null,
): QuestionEvaluationResult[] {
  if (!session) return []
  return session.submittedQuestions.flatMap((submitted) => {
    const question = lesson.questions.find((candidate) => candidate.questionId === submitted.questionId)
    if (!question) return []
    const submission = submissionFromPersisted(question, submitted.submittedAnswer)
    return submission ? [evaluateAnswer(question, submission)] : []
  })
}

function submissionFromPersisted(
  question: LessonQuestion,
  answer: PersistedAnswer,
): LessonQuestionSubmission | null {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
      return typeof answer === 'string'
        ? { questionType: question.questionType, payload: { selectedChoiceId: answer } }
        : null
    case 'MULTISELECT':
      return Array.isArray(answer)
        ? { questionType: question.questionType, payload: { selectedChoiceIds: [...answer] } }
        : null
    case 'HOT_TEXT':
      return Array.isArray(answer)
        ? { questionType: question.questionType, payload: { selectedSegmentIds: [...answer] } }
        : null
    case 'EVIDENCE_PAIR':
      return isStringRecord(answer)
        ? {
            questionType: question.questionType,
            payload: { partAChoiceId: answer.partA ?? '', partBChoiceId: answer.partB ?? '' },
          }
        : null
    case 'TABLE_MATCH':
      return isStringRecord(answer)
        ? { questionType: question.questionType, payload: { selectedMappings: { ...answer } } }
        : null
    default:
      return null
  }
}

function toPersistedAnswer(value: unknown): PersistedAnswer {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === 'string')
  if (isStringRecord(value)) return { ...value }
  return ''
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && Object.values(value).every((entry) => typeof entry === 'string')
}

function cloneAssistanceEvents(events: PersistedAssistanceEvent[]): PersistedAssistanceEvent[] {
  return events.map((event) => ({ ...event }))
}
