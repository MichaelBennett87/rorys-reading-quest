import type { RecentLessonActivityUsage, SkillProgressState } from '../domain/progression'
import {
  COMPLETED_ATTEMPT_LIMIT,
  QUEST_PROGRESS_SCHEMA_VERSION,
  RECENT_ACTIVITY_LIMIT_PER_TRAIL,
  type ActiveLessonSession,
  type CompletedLessonAttempt,
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
  if (value.activeLessonSession !== null && !isActiveLessonSession(value.activeLessonSession)) {
    return { status: 'invalid_state', reason: 'Persisted active lesson session is malformed.' }
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
    && typeof value.currentLearningState === 'string'
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
    && (value.remediationContext === null || isRecord(value.remediationContext))
}

function isCompletedAttempt(value: unknown): value is CompletedLessonAttempt {
  return isRecord(value)
    && typeof value.attemptId === 'string'
    && typeof value.completionId === 'string'
    && typeof value.lessonId === 'string'
    && typeof value.activityId === 'string'
    && typeof value.skillId === 'string'
    && Number.isInteger(value.difficulty)
    && Array.isArray(value.questionResults)
    && value.questionResults.every((result) => isRecord(result)
      && typeof result.questionId === 'string'
      && typeof result.isCorrect === 'boolean'
      && typeof result.isFirstAttemptCorrect === 'boolean')
    && isNonNegativeNumber(value.accuracy)
    && isNonNegativeNumber(value.assistanceCount)
    && typeof value.completedAt === 'string'
    && typeof value.progressionDecisionState === 'string'
    && Array.isArray(value.reasonCodes)
    && (value.nextReviewDate === null || typeof value.nextReviewDate === 'string')
}

function isRecentActivityUsage(value: unknown): value is RecentLessonActivityUsage {
  return isRecord(value)
    && typeof value.lessonId === 'string'
    && typeof value.activityId === 'string'
    && typeof value.skillId === 'string'
    && Number.isInteger(value.difficulty)
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
    && typeof value.startedAt === 'string'
    && typeof value.updatedAt === 'string'
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
  }
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
