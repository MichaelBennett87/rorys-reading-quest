import type { LessonResult } from '../domain/lesson'
import type { FluencyPracticeCompletionResult } from '../domain/progression/fluencyPractice'
import {
  type CompletedLessonAttempt,
  type PersistedAssistanceEvent,
  type QuestProgressV1,
} from './questProgressTypes'
import { normalizeQuestProgressForSave } from './validatePersistedQuestProgress'
import { starsForAccuracy, xpForLesson } from './completeQuestProgress'

export interface CompleteFluencyPracticeProgressInput {
  state: QuestProgressV1
  completionId: string
  lessonResult: LessonResult
  fluencyProgress: FluencyPracticeCompletionResult
  completedAt: string
}

export interface CompleteFluencyPracticeProgressResult {
  state: QuestProgressV1
  duplicate: boolean
  earnedXp: number
  earnedStars: number
}

export function completeFluencyPracticeProgress(
  input: CompleteFluencyPracticeProgressInput,
): CompleteFluencyPracticeProgressResult {
  if (input.state.completedAttempts.some((attempt) => attempt.completionId === input.completionId)) {
    return { state: normalizeQuestProgressForSave(input.state), duplicate: true, earnedXp: 0, earnedStars: 0 }
  }

  const earnedXp = xpForLesson(input.lessonResult)
  const earnedStars = starsForAccuracy(input.lessonResult.accuracy)
  const progressKey = input.fluencyProgress.progress.skillId
  const attempt: CompletedLessonAttempt = {
    attemptId: input.completionId,
    completionId: input.completionId,
    lessonId: input.lessonResult.lessonId,
    lessonRole: input.lessonResult.lessonRole,
    activityId: input.lessonResult.activityId,
    skillId: input.lessonResult.skillId,
    difficulty: input.lessonResult.difficulty,
    questionResults: input.lessonResult.questionResults.map((question) => ({
      questionId: question.questionId,
      isCorrect: question.isCorrect,
      isFirstAttemptCorrect: question.isFirstAttemptCorrect,
    })),
    accuracy: input.lessonResult.accuracy,
    assistanceCount: input.lessonResult.assistanceUsed,
    assistanceSummary: { ...input.lessonResult.assistanceSummary },
    fluencyPracticeSummary: input.lessonResult.fluencyPracticeSummary ? { ...input.lessonResult.fluencyPracticeSummary } : null,
    assistanceEvents: cloneAssistanceEvents(input.state.activeLessonSession?.assistanceEvents ?? []),
    completedAt: input.completedAt,
    progressionDecisionState: input.fluencyProgress.reasonCodes.includes('fluency_practice_exhausted')
      ? 'FLUENCY_PRACTICE'
      : 'FLUENCY_PRACTICE',
    reasonCodes: [...input.fluencyProgress.reasonCodes],
    nextReviewDate: null,
  }
  const state = normalizeQuestProgressForSave({
    ...input.state,
    totalXp: Math.max(input.state.totalXp, 0) + earnedXp,
    totalStars: Math.max(input.state.totalStars, 0) + earnedStars,
    completedSessionCount: input.state.completedSessionCount + 1,
    skillProgress: {
      ...input.state.skillProgress,
      [progressKey]: input.fluencyProgress.progress,
    },
    completedAttempts: [...input.state.completedAttempts, attempt],
    recentActivityUsage: {
      ...input.state.recentActivityUsage,
      [progressKey]: input.fluencyProgress.progress.recentActivityUsage,
    },
    reviewQueue: input.state.reviewQueue.map((entry) => ({ ...entry })),
    activeLessonSession: null,
    plannedNextQuest: input.fluencyProgress.nextQuest,
    lastProgressionOutcome: {
      completionId: input.completionId,
      decisionState: 'FLUENCY_PRACTICE',
      reasonCodes: [...input.fluencyProgress.reasonCodes],
      earnedXp,
      earnedStars,
      completedAt: input.completedAt,
      lessonRole: input.lessonResult.lessonRole,
    },
    metadata: { ...input.state.metadata, updatedAt: input.completedAt },
  })

  return { state, duplicate: false, earnedXp, earnedStars }
}

function cloneAssistanceEvents(events: PersistedAssistanceEvent[]): PersistedAssistanceEvent[] {
  return events.map((event) => ({ ...event }))
}
