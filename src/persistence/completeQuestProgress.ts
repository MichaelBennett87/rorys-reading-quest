import type { LessonResult } from '../domain/lesson'
import { getLessonCatalogMetadata } from '../domain/lesson'
import type { AppliedLessonProgression } from '../domain/progression'
import type { ReviewCompletionUpdate } from '../domain/progression/applyReviewLessonResult'
import {
  type CompletedLessonAttempt,
  type PersistedAssistanceEvent,
  type QuestProgressV1,
} from './questProgressTypes'
import { normalizeQuestProgressForSave } from './validatePersistedQuestProgress'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../domain/progression/reviewQueueAffinity'

export interface CompleteQuestProgressInput {
  state: QuestProgressV1
  completionId: string
  lessonResult: LessonResult
  progression: AppliedLessonProgression
  completedAt: string
  reviewCompletion?: ReviewCompletionUpdate
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
    const reconciledState = input.state.activeLessonSession?.sessionId === input.completionId
      ? { ...input.state, activeLessonSession: null }
      : input.state
    return { state: normalizeQuestProgressForSave(reconciledState), duplicate: true, earnedXp: 0, earnedStars: 0 }
  }

  const earnedXp = xpForLesson(input.lessonResult)
  const earnedStars = starsForAccuracy(input.lessonResult.accuracy)
  const progressKey = input.progression.progress.remediationContext?.originalSkillId
    ?? input.progression.progress.skillId
  const lessonMetadata = getLessonCatalogMetadata(input.lessonResult.lessonId)
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
    progressionDecisionState: input.progression.decision.decisionState,
    reasonCodes: [...input.progression.decision.reasonCodes],
    nextReviewDate: input.reviewCompletion?.nextEntry.dueAt
      ?? input.progression.progress.nextReviewDate,
  }
  const usageKey = `${input.lessonResult.skillId}::${input.lessonResult.difficulty}`
  const nextReviewEntry = input.progression.progress.nextReviewDate
    ? {
        skillId: input.lessonResult.skillId,
        difficulty: input.progression.progress.lastMasteredDifficulty,
        reviewStep: input.progression.progress.reviewStep,
        dueAt: input.progression.progress.nextReviewDate,
        unitId: lessonMetadata?.unitId,
        contentVersion: lessonMetadata?.contentVersion,
      }
    : null
  const reviewQueue = input.reviewCompletion
    ? replaceExactReviewQueueEntry(
        input.state.reviewQueue,
        input.reviewCompletion.queueEntry,
        input.reviewCompletion.nextEntry,
      )
    : input.progression.progress.nextReviewDate
      ? upsertReviewQueueEntry(input.state.reviewQueue, nextReviewEntry!)
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
      lessonRole: input.lessonResult.lessonRole,
    },
    metadata: { ...input.state.metadata, updatedAt: input.completedAt },
  })
  return { state, duplicate: false, earnedXp, earnedStars }
}

function replaceExactReviewQueueEntry(
  queue: QuestProgressV1['reviewQueue'],
  expected: QuestProgressV1['reviewQueue'][number],
  replacement: QuestProgressV1['reviewQueue'][number],
): QuestProgressV1['reviewQueue'] {
  let replaced = false
  return queue.map((entry) => {
    if (!replaced && sameExactReviewQueueEntry(entry, expected)) {
      replaced = true
      return { ...replacement }
    }
    return { ...entry }
  })
}

function sameExactReviewQueueEntry(
  left: QuestProgressV1['reviewQueue'][number],
  right: QuestProgressV1['reviewQueue'][number],
): boolean {
  return left.skillId === right.skillId
    && left.difficulty === right.difficulty
    && left.reviewStep === right.reviewStep
    && left.dueAt === right.dueAt
    && left.unitId === right.unitId
    && left.contentVersion === right.contentVersion
}

function cloneAssistanceEvents(events: PersistedAssistanceEvent[]): PersistedAssistanceEvent[] {
  return events.map((event) => ({ ...event }))
}

function upsertReviewQueueEntry(
  queue: QuestProgressV1['reviewQueue'],
  entry: NonNullable<typeof queue>[number],
): QuestProgressV1['reviewQueue'] {
  const identity = buildReviewQueueIdentity(entry)
  const nextQueue: QuestProgressV1['reviewQueue'] = []
  let inserted = false

  for (const existing of queue) {
    if (sameReviewQueueIdentity(buildReviewQueueIdentity(existing), identity)) {
      if (!inserted) {
        nextQueue.push({ ...entry })
        inserted = true
      }
      continue
    }
    nextQueue.push({ ...existing })
  }

  if (!inserted) {
    nextQueue.push({ ...entry })
  }

  return nextQueue
}
