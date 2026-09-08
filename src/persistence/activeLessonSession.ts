import {
  evaluateAnswer,
  type LessonDefinition,
  type LessonQuestion,
  type LessonQuestionSubmission,
  type QuestionEvaluationResult,
} from '../domain/lesson'
import type {
  ActiveLessonLaunchContext,
  ActiveLessonSession,
  PersistedAssistanceEvent,
  PersistedAnswer,
  PersistedSubmittedQuestion,
} from './questProgressTypes'

export function createActiveLessonSession(
  lesson: LessonDefinition,
  sessionId: string,
  timestamp: string,
  launchContext?: ActiveLessonLaunchContext,
): ActiveLessonSession {
  return {
    sessionId,
    lessonId: lesson.lessonId,
    lessonRole: lesson.lessonRole,
    activityId: lesson.activityId,
    contentVersion: lesson.contentVersion,
    ...(lesson.sessionContentFingerprint
      ? { sessionContentFingerprint: lesson.sessionContentFingerprint }
      : {}),
    skillId: lesson.skillId,
    difficulty: lesson.difficulty,
    currentQuestionIndex: 0,
    submittedQuestions: [],
    draftQuestion: null,
    assistanceEvents: [],
    fluencyPracticeState: lesson.lessonRole === 'FLUENCY_PRACTICE'
      ? {
          modelReadUsed: false,
          phrasePracticeCompleted: false,
          completedReadCount: 0,
          reflection: null,
        }
      : null,
    ...(launchContext ? { launchContext: cloneActiveLessonLaunchContext(launchContext) } : {}),
    startedAt: timestamp,
    updatedAt: timestamp,
  }
}

export function cloneActiveLessonLaunchContext(
  context: ActiveLessonLaunchContext,
): ActiveLessonLaunchContext {
  return {
    purpose: context.purpose,
    ...(context.reviewIdentity ? { reviewIdentity: { ...context.reviewIdentity } } : {}),
    ...(context.returnLearningState ? { returnLearningState: context.returnLearningState } : {}),
  }
}

export function sameActiveLessonLaunchContext(
  left: ActiveLessonLaunchContext | undefined,
  right: ActiveLessonLaunchContext | undefined,
): boolean {
  if (!left || !right) return left === right
  if (left.purpose !== right.purpose || left.returnLearningState !== right.returnLearningState) return false
  const leftReview = left.reviewIdentity
  const rightReview = right.reviewIdentity
  if (!leftReview || !rightReview) return leftReview === rightReview
  return leftReview.skillId === rightReview.skillId
    && leftReview.difficulty === rightReview.difficulty
    && leftReview.unitId === rightReview.unitId
    && leftReview.contentVersion === rightReview.contentVersion
    && leftReview.reviewStep === rightReview.reviewStep
    && leftReview.dueAt === rightReview.dueAt
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
    draftQuestion: null,
    assistanceEvents: cloneAssistanceEvents(session.assistanceEvents),
    updatedAt: timestamp,
  }
}

export function checkpointQuestionDraft(
  session: ActiveLessonSession,
  questionId: string,
  answer: PersistedAnswer,
  timestamp: string,
): ActiveLessonSession {
  const clonedAnswer = toPersistedAnswer(answer)
  return {
    ...session,
    draftQuestion: isEmptyPersistedAnswer(clonedAnswer)
      ? null
      : { questionId, answer: clonedAnswer },
    assistanceEvents: cloneAssistanceEvents(session.assistanceEvents),
    updatedAt: timestamp,
  }
}

export function advanceActiveLessonSession(
  session: ActiveLessonSession,
  currentQuestionIndex: number,
  timestamp: string,
): ActiveLessonSession {
  return {
    ...session,
    currentQuestionIndex,
    draftQuestion: null,
    assistanceEvents: cloneAssistanceEvents(session.assistanceEvents),
    updatedAt: timestamp,
  }
}

export function restoreLessonDraftAnswer(
  lesson: LessonDefinition,
  session: ActiveLessonSession | null,
  currentQuestionIndex: number,
): PersistedAnswer | null {
  const question = lesson.questions[currentQuestionIndex]
  const draft = session?.draftQuestion
  if (!question || !draft || draft.questionId !== question.questionId) return null
  return sanitizeDraftAnswer(question, draft.answer)
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

function sanitizeDraftAnswer(question: LessonQuestion, answer: PersistedAnswer): PersistedAnswer | null {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
      return typeof answer === 'string' && question.choices.some((choice) => choice.id === answer)
        ? answer
        : null
    case 'MULTISELECT':
      return Array.isArray(answer)
        ? uniqueStrings(answer.filter((id) => question.choices.some((choice) => choice.id === id)))
        : null
    case 'HOT_TEXT':
      return Array.isArray(answer)
        ? uniqueStrings(answer.filter((id) => question.segments.some((segment) => segment.id === id)))
        : null
    case 'EVIDENCE_PAIR': {
      if (!isStringRecord(answer)) return null
      const partA = question.partAChoices.some((choice) => choice.id === answer.partA) ? answer.partA : ''
      const partB = question.partBChoices.some((choice) => choice.id === answer.partB) ? answer.partB : ''
      return partA || partB ? { partA, partB } : null
    }
    case 'TABLE_MATCH': {
      if (!isStringRecord(answer)) return null
      const mappings = Object.fromEntries(question.rows.flatMap((row) => {
        const choiceId = answer[row.id]
        return choiceId && row.options.some((option) => option.id === choiceId)
          ? [[row.id, choiceId]]
          : []
      }))
      return Object.keys(mappings).length > 0 ? mappings : null
    }
    default:
      return null
  }
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)]
}

function isEmptyPersistedAnswer(answer: PersistedAnswer): boolean {
  if (typeof answer === 'string') return answer.length === 0
  if (Array.isArray(answer)) return answer.length === 0
  return Object.values(answer).every((value) => value.length === 0)
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
