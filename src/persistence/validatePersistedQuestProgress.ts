import type { AssistanceSummary } from '../domain/assistance'
import type { LessonPurpose, LessonRole } from '../domain/lesson'
import type { LearningState, NextQuestPlan, RecentLessonActivityUsage, SkillProgressState } from '../domain/progression'
import {
  COMPLETED_ATTEMPT_LIMIT,
  QUEST_PROGRESS_SCHEMA_VERSION,
  RECENT_ACTIVITY_LIMIT_PER_TRAIL,
  type ActiveLessonSession,
  type CompletedLessonAttempt,
  type PersistedAssistanceEvent,
  type QuestProgressV1,
} from './questProgressTypes'

export type PersistedStateValidationResult =
  | { status: 'valid'; state: QuestProgressV1 }
  | { status: 'unsupported_version' | 'invalid_state'; reason: string }

export function validatePersistedQuestProgress(value: unknown): PersistedStateValidationResult {
  if (!isRecord(value)) return { status: 'invalid_state', reason: 'Persisted root must be an object.' }
  if (value.schemaVersion !== QUEST_PROGRESS_SCHEMA_VERSION) {
    return { status: 'unsupported_version', reason: `Unsupported schema version: ${String(value.schemaVersion)}` }
  }
  if (
    value.learnerId !== 'local-learner'
    || !isNonNegativeNumber(value.totalXp)
    || !isNonNegativeNumber(value.totalStars)
    || !isNonNegativeInteger(value.completedSessionCount)
    || !isRecord(value.skillProgress)
    || !Array.isArray(value.completedAttempts)
    || !isRecord(value.recentActivityUsage)
    || !Array.isArray(value.reviewQueue)
    || !('activeLessonSession' in value)
    || !('plannedNextQuest' in value)
    || !('lastProgressionOutcome' in value)
    || !isRecord(value.metadata)
    || typeof value.metadata.createdAt !== 'string'
    || typeof value.metadata.updatedAt !== 'string'
  ) {
    return { status: 'invalid_state', reason: 'Persisted root is missing required version-1 fields.' }
  }

  if (!Object.values(value.skillProgress).every(isSkillProgress)) {
    return { status: 'invalid_state', reason: 'Persisted skill progress is malformed.' }
  }
  if (!value.completedAttempts.every(isCompletedAttempt)) {
    return { status: 'invalid_state', reason: 'Persisted completed attempt history is malformed.' }
  }
  if (!Object.values(value.recentActivityUsage).every((entries) => (
    Array.isArray(entries) && entries.every(isRecentActivityUsage)
  ))) {
    return { status: 'invalid_state', reason: 'Persisted recent activity usage is malformed.' }
  }
  if (!value.reviewQueue.every(isReviewQueueEntry)) {
    return { status: 'invalid_state', reason: 'Persisted review queue is malformed.' }
  }
  if (value.activeLessonSession !== null && !isActiveLessonSession(value.activeLessonSession)) {
    return { status: 'invalid_state', reason: 'Persisted active lesson session is malformed.' }
  }
  if (value.plannedNextQuest !== null && !isNextQuestPlan(value.plannedNextQuest)) {
    return { status: 'invalid_state', reason: 'Persisted next quest plan is malformed.' }
  }
  if (value.lastProgressionOutcome !== null && !isLastProgressionOutcome(value.lastProgressionOutcome)) {
    return { status: 'invalid_state', reason: 'Persisted progression outcome is malformed.' }
  }

  return { status: 'valid', state: normalizeQuestProgressForSave(value as unknown as QuestProgressV1) }
}

export function normalizeQuestProgressForSave(state: QuestProgressV1): QuestProgressV1 {
  const recentActivityUsage = Object.fromEntries(
    Object.entries(state.recentActivityUsage).map(([key, entries]) => [
      key,
      entries.slice(-RECENT_ACTIVITY_LIMIT_PER_TRAIL).map(cloneUsage),
    ]),
  )
  const skillProgress = Object.fromEntries(
    Object.entries(state.skillProgress).map(([key, progress]) => [
      key,
      {
        ...progress,
        qualifyingIndependentActivityIds: [...progress.qualifyingIndependentActivityIds],
        recentActivityUsage: progress.recentActivityUsage
          .slice(-RECENT_ACTIVITY_LIMIT_PER_TRAIL)
          .map(cloneUsage),
        lastDecisionReasonCodes: [...progress.lastDecisionReasonCodes],
        remediationContext: progress.remediationContext ? { ...progress.remediationContext } : null,
      },
    ]),
  )
  return {
    ...state,
    skillProgress,
    completedAttempts: state.completedAttempts.slice(-COMPLETED_ATTEMPT_LIMIT).map((attempt) => ({
      ...attempt,
      questionResults: attempt.questionResults.map((result) => ({ ...result })),
      reasonCodes: [...attempt.reasonCodes],
      assistanceSummary: cloneAssistanceSummary(attempt.assistanceSummary),
      assistanceEvents: (attempt.assistanceEvents ?? []).map(cloneAssistanceEvent),
    })),
    recentActivityUsage,
    reviewQueue: state.reviewQueue.map((entry) => ({ ...entry })),
    activeLessonSession: state.activeLessonSession ? cloneActiveSession(state.activeLessonSession) : null,
    plannedNextQuest: state.plannedNextQuest ? structuredClone(state.plannedNextQuest) : null,
    lastProgressionOutcome: state.lastProgressionOutcome ? {
      ...state.lastProgressionOutcome,
      reasonCodes: [...state.lastProgressionOutcome.reasonCodes],
    } : null,
    metadata: { ...state.metadata },
  }
}

function isSkillProgress(value: unknown): value is SkillProgressState {
  return isRecord(value)
    && typeof value.skillId === 'string'
    && Number.isInteger(value.currentDifficulty)
    && Number.isInteger(value.lastMasteredDifficulty)
    && isLearningState(value.currentLearningState)
    && Array.isArray(value.qualifyingIndependentActivityIds)
    && value.qualifyingIndependentActivityIds.every((id) => typeof id === 'string')
    && isNonNegativeInteger(value.consecutiveUnsuccessfulAtCurrentDifficulty)
    && (value.lastCompletedActivityId === null || typeof value.lastCompletedActivityId === 'string')
    && Array.isArray(value.recentActivityUsage)
    && value.recentActivityUsage.every(isRecentActivityUsage)
    && isNonNegativeInteger(value.reviewStep)
    && (value.nextReviewDate === null || typeof value.nextReviewDate === 'string')
    && Array.isArray(value.lastDecisionReasonCodes)
    && value.lastDecisionReasonCodes.every((code) => typeof code === 'string')
    && (value.remediationContext === null || isRemediationContext(value.remediationContext))
}

function isCompletedAttempt(value: unknown): value is CompletedLessonAttempt {
  return isRecord(value)
    && typeof value.attemptId === 'string'
    && typeof value.completionId === 'string'
    && typeof value.lessonId === 'string'
    && typeof value.activityId === 'string'
    && typeof value.skillId === 'string'
    && Number.isInteger(value.difficulty)
    && (value.lessonRole === undefined || isLessonRole(value.lessonRole))
    && Array.isArray(value.questionResults)
    && value.questionResults.every((result) => isRecord(result)
      && typeof result.questionId === 'string'
      && typeof result.isCorrect === 'boolean'
      && typeof result.isFirstAttemptCorrect === 'boolean')
    && isNonNegativeNumber(value.accuracy)
    && isNonNegativeNumber(value.assistanceCount)
    && (!('assistanceSummary' in value) || isAssistanceSummary(value.assistanceSummary))
    && (!('assistanceEvents' in value) || (
      Array.isArray(value.assistanceEvents)
      && value.assistanceEvents.every(isAssistanceEvent)
    ))
    && typeof value.completedAt === 'string'
    && isLearningState(value.progressionDecisionState)
    && Array.isArray(value.reasonCodes)
    && value.reasonCodes.every((code) => typeof code === 'string')
    && (value.nextReviewDate === null || typeof value.nextReviewDate === 'string')
}

function isRecentActivityUsage(value: unknown): value is RecentLessonActivityUsage {
  return isRecord(value)
    && typeof value.lessonId === 'string'
    && typeof value.activityId === 'string'
    && typeof value.skillId === 'string'
    && Number.isInteger(value.difficulty)
    && (value.lessonRole === undefined || isLessonRole(value.lessonRole))
    && Array.isArray(value.passageQuestionKeys)
    && value.passageQuestionKeys.every((key) => typeof key === 'string')
    && typeof value.contentVersion === 'string'
    && typeof value.completedAt === 'string'
}

function isActiveLessonSession(value: unknown): value is ActiveLessonSession {
  return isRecord(value)
    && typeof value.sessionId === 'string'
    && typeof value.lessonId === 'string'
    && typeof value.activityId === 'string'
    && typeof value.contentVersion === 'string'
    && typeof value.skillId === 'string'
    && Number.isInteger(value.difficulty)
    && isNonNegativeInteger(value.currentQuestionIndex)
    && Array.isArray(value.submittedQuestions)
    && value.submittedQuestions.every((question) => isRecord(question)
      && typeof question.questionId === 'string'
      && typeof question.isCorrect === 'boolean'
      && typeof question.isFirstAttemptCorrect === 'boolean'
      && isPersistedAnswer(question.submittedAnswer))
    && (!('assistanceEvents' in value) || (
      Array.isArray(value.assistanceEvents)
      && value.assistanceEvents.every(isAssistanceEvent)
    ))
    && (!('fluencyPracticeState' in value) || value.fluencyPracticeState === null || isFluencyPracticeState(value.fluencyPracticeState))
    && typeof value.startedAt === 'string'
    && typeof value.updatedAt === 'string'
}

function isNextQuestPlan(value: unknown): value is NextQuestPlan {
  if (!isRecord(value) || !isLessonPurpose(value.purpose)) return false
  if (value.status === 'content_needed') {
    return typeof value.skillId === 'string'
      && Number.isInteger(value.difficulty)
      && typeof value.reason === 'string'
  }
  return value.status === 'available' && isLessonActivityCandidate(value.lesson, value.purpose)
}

function isLessonActivityCandidate(value: unknown, purpose: LessonPurpose): boolean {
  return isRecord(value)
    && typeof value.lessonId === 'string'
    && typeof value.activityId === 'string'
    && typeof value.skillId === 'string'
    && Number.isInteger(value.gradeBand)
    && Number.isInteger(value.difficulty)
    && typeof value.worldId === 'string'
    && typeof value.unitId === 'string'
    && typeof value.packId === 'string'
    && Array.isArray(value.benchmarkReferences)
    && value.benchmarkReferences.every((reference) => typeof reference === 'string')
    && Array.isArray(value.eligiblePurposes)
    && value.eligiblePurposes.every(isLessonPurpose)
    && value.eligiblePurposes.includes(purpose)
    && Array.isArray(value.passageQuestionKeys)
    && value.passageQuestionKeys.every((key) => typeof key === 'string')
    && typeof value.contentVersion === 'string'
}

function isLastProgressionOutcome(value: unknown): boolean {
  return isRecord(value)
    && typeof value.completionId === 'string'
    && isLearningState(value.decisionState)
    && Array.isArray(value.reasonCodes)
    && value.reasonCodes.every((code) => typeof code === 'string')
    && isNonNegativeNumber(value.earnedXp)
    && isNonNegativeNumber(value.earnedStars)
    && typeof value.completedAt === 'string'
    && (value.lessonRole === undefined || isLessonRole(value.lessonRole))
}

function isRemediationContext(value: unknown): boolean {
  return isRecord(value)
    && typeof value.originalSkillId === 'string'
    && Number.isInteger(value.originalDifficulty)
    && typeof value.remediationSkillId === 'string'
    && Number.isInteger(value.remediationDifficulty)
    && (value.reason === 'explicit_prerequisite' || value.reason === 'last_mastered_difficulty')
}

function isFluencyPracticeState(value: unknown): boolean {
  return isRecord(value)
    && typeof value.modelReadUsed === 'boolean'
    && typeof value.phrasePracticeCompleted === 'boolean'
    && isNonNegativeInteger(value.completedReadCount)
    && (value.reflection === null || value.reflection === 'smooth' || value.reflection === 'some_pauses' || value.reflection === 'try_again')
}

const LEARNING_STATES = new Set<LearningState>([
  'TEACH', 'GUIDED_PRACTICE', 'CHECKPOINT', 'FLUENCY_PRACTICE', 'VERIFY_MASTERY', 'ADVANCE',
  'RETRY_SAME_DIFFICULTY', 'REMEDIATE_PREREQUISITE', 'SPACED_REVIEW', 'PARENT_REVIEW', 'MASTERED',
])
const LESSON_PURPOSES = new Set<LessonPurpose>(['progression', 'verification', 'remediation', 'review'])
const LESSON_ROLES = new Set<LessonRole>(['GUIDED_PRACTICE', 'CHECKPOINT', 'FLUENCY_PRACTICE'])

function isLearningState(value: unknown): value is LearningState {
  return typeof value === 'string' && LEARNING_STATES.has(value as LearningState)
}

function isLessonPurpose(value: unknown): value is LessonPurpose {
  return typeof value === 'string' && LESSON_PURPOSES.has(value as LessonPurpose)
}

function isLessonRole(value: unknown): value is LessonRole {
  return typeof value === 'string' && LESSON_ROLES.has(value as LessonRole)
}

function isReviewQueueEntry(value: unknown): boolean {
  return isRecord(value)
    && typeof value.skillId === 'string'
    && Number.isInteger(value.difficulty)
    && Number.isInteger(value.reviewStep)
    && typeof value.dueAt === 'string'
    && (value.unitId === undefined || typeof value.unitId === 'string')
    && (value.contentVersion === undefined || typeof value.contentVersion === 'string')
}

function isAssistanceEvent(value: unknown): value is PersistedAssistanceEvent {
  return isRecord(value)
    && typeof value.eventId === 'string'
    && typeof value.sessionId === 'string'
    && typeof value.lessonId === 'string'
    && typeof value.activityId === 'string'
    && (value.questionId === undefined || typeof value.questionId === 'string')
    && typeof value.targetId === 'string'
    && typeof value.assistanceKind === 'string'
    && Number.isInteger(value.assistanceLevel)
    && typeof value.occurredAt === 'string'
}

function isPersistedAnswer(value: unknown): boolean {
  return typeof value === 'string'
    || (Array.isArray(value) && value.every((entry) => typeof entry === 'string'))
    || (isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string'))
}

function cloneUsage(usage: RecentLessonActivityUsage): RecentLessonActivityUsage {
  return { ...usage, passageQuestionKeys: [...usage.passageQuestionKeys] }
}

function cloneActiveSession(session: ActiveLessonSession): ActiveLessonSession {
  return {
    ...session,
    submittedQuestions: session.submittedQuestions.map((question) => ({
      ...question,
      submittedAnswer: structuredClone(question.submittedAnswer),
    })),
    assistanceEvents: (session.assistanceEvents ?? []).map(cloneAssistanceEvent),
  }
}

function cloneAssistanceEvent(event: PersistedAssistanceEvent): PersistedAssistanceEvent {
  return { ...event }
}

function cloneAssistanceSummary(summary: AssistanceSummary | undefined): AssistanceSummary {
  return summary ? { ...summary } : {
    totalUniqueEvents: 0,
    targetsHelped: 0,
    maximumAssistanceLevel: 0,
    visualHintUsed: false,
    spokenChunkHelpUsed: false,
    spokenWordHelpUsed: false,
    sentenceReadAloudUsed: false,
  }
}

function isAssistanceSummary(value: unknown): value is AssistanceSummary {
  return isRecord(value)
    && typeof value.totalUniqueEvents === 'number'
    && typeof value.targetsHelped === 'number'
    && typeof value.maximumAssistanceLevel === 'number'
    && typeof value.visualHintUsed === 'boolean'
    && typeof value.spokenChunkHelpUsed === 'boolean'
    && typeof value.spokenWordHelpUsed === 'boolean'
    && typeof value.sentenceReadAloudUsed === 'boolean'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return isNonNegativeNumber(value) && Number.isInteger(value)
}
