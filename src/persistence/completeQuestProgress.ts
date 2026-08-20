import type { LessonResult } from '../domain/lesson'
import type { AppliedLessonProgression } from '../domain/progression'
import {
  type CompletedLessonAttempt,
  type QuestProgressV1,
} from './questProgressTypes'
import { normalizeQuestProgressForSave } from './validatePersistedQuestProgress'

export interface CompleteQuestProgressInput {
  state: QuestProgressV1
  completionId: string
  lessonResult: LessonResult
  progression: AppliedLessonProgression
  completedAt: string
}

export interface CompleteQuestProgressResult {
  state: QuestProgressV1
  duplicate: boolean
  earnedXp: number
  earnedStars: number
}

export function starsForAccuracy(accuracy: number): number {
  if (accuracy >= 90) return 3
  if (accuracy >= 70) return 2
  return 1
}

export function xpForLesson(result: LessonResult): number {
  return result.totalQuestions * 10 + result.correctAnswers * 5
}

export function completeQuestProgress(input: CompleteQuestProgressInput): CompleteQuestProgressResult {
  if (input.state.completedAttempts.some((attempt) => attempt.completionId === input.completionId)) {
    return { state: normalizeQuestProgressForSave(input.state), duplicate: true, earnedXp: 0, earnedStars: 0 }
  }

  const earnedXp = xpForLesson(input.lessonResult)
  const earnedStars = starsForAccuracy(input.lessonResult.accuracy)
  const progressKey = input.progression.progress.remediationContext?.originalSkillId
    ?? input.progression.progress.skillId
  const attempt: CompletedLessonAttempt = {
    attemptId: input.completionId,
    completionId: input.completionId,
    lessonId: input.lessonResult.lessonId,
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
    completedAt: input.completedAt,
    progressionDecisionState: input.progression.decision.decisionState,
    reasonCodes: [...input.progression.decision.reasonCodes],
    nextReviewDate: input.progression.progress.nextReviewDate,
  }
  const usageKey = `${input.lessonResult.skillId}::${input.lessonResult.difficulty}`
  const reviewQueue = input.progression.progress.nextReviewDate
    ? [
        ...input.state.reviewQueue.filter((entry) => entry.skillId !== input.lessonResult.skillId),
        {
          skillId: input.lessonResult.skillId,
          difficulty: input.progression.progress.lastMasteredDifficulty,
          reviewStep: input.progression.progress.reviewStep,
          dueAt: input.progression.progress.nextReviewDate,
        },
      ]
    : input.state.reviewQueue.map((entry) => ({ ...entry }))

  const state = normalizeQuestProgressForSave({
    ...input.state,
    totalXp: Math.max(input.state.totalXp, 0) + earnedXp,
    totalStars: Math.max(input.state.totalStars, 0) + earnedStars,
    completedSessionCount: input.state.completedSessionCount + 1,
    skillProgress: {
      ...input.state.skillProgress,
      [progressKey]: input.progression.progress,
    },
    completedAttempts: [...input.state.completedAttempts, attempt],
    recentActivityUsage: {
      ...input.state.recentActivityUsage,
      [usageKey]: input.progression.progress.recentActivityUsage,
    },
    reviewQueue,
    activeLessonSession: null,
    plannedNextQuest: input.progression.nextQuest,
    lastProgressionOutcome: {
      completionId: input.completionId,
      decisionState: input.progression.decision.decisionState,
      reasonCodes: [...input.progression.decision.reasonCodes],
      earnedXp,
      earnedStars,
      completedAt: input.completedAt,
    },
    metadata: { ...input.state.metadata, updatedAt: input.completedAt },
  })
  return { state, duplicate: false, earnedXp, earnedStars }
}
