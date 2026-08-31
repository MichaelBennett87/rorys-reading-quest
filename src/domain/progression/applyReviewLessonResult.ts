import type { LessonResult } from '../lesson'
import type {
  ActiveReviewIdentity,
  ReviewQueueEntry,
} from '../../persistence'
import { defaultProgressionRuleConfig } from './evaluateCheckpoint'
import { addDays } from './applyProgressionDecision'
import { lessonResultToCheckpoint } from './lessonResultToCheckpoint'
import { nextReviewInterval } from './reviewSchedule'
import type {
  AppliedLessonProgression,
  DeclinedLessonProgression,
  LessonActivityCandidate,
  SkillProgressState,
} from './skillProgressTypes'

const RECENT_ACTIVITY_LIMIT = 12

export interface ReviewCompletionUpdate {
  queueEntry: ReviewQueueEntry
  nextEntry: ReviewQueueEntry
}

export type ApplyReviewLessonResultResult =
  | (AppliedLessonProgression & { reviewCompletion: ReviewCompletionUpdate })
  | DeclinedLessonProgression

export function applyReviewLessonResult(input: {
  progress: SkillProgressState
  lessonResult: LessonResult
  availableLessons: readonly LessonActivityCandidate[]
  reviewIdentity: ActiveReviewIdentity
  reviewEntry: ReviewQueueEntry
  completedAt: string
}): ApplyReviewLessonResultResult {
  const candidate = input.availableLessons.find((lesson) => (
    lesson.lessonId === input.lessonResult.lessonId
    && lesson.activityId === input.lessonResult.activityId
    && lesson.skillId === input.reviewIdentity.skillId
    && lesson.difficulty === input.reviewIdentity.difficulty
    && lesson.unitId === input.reviewIdentity.unitId
    && lesson.contentVersion === input.reviewIdentity.contentVersion
    && lesson.eligiblePurposes.includes('review')
  ))
  if (!candidate || input.progress.skillId !== input.reviewIdentity.skillId) {
    return declined(input.progress, 'Review result does not match the authoritative review launch.')
  }
  if (
    input.reviewEntry.skillId !== input.reviewIdentity.skillId
    || input.reviewEntry.difficulty !== input.reviewIdentity.difficulty
    || input.reviewEntry.reviewStep !== input.reviewIdentity.reviewStep
    || input.reviewEntry.dueAt !== input.reviewIdentity.dueAt
  ) {
    return declined(input.progress, 'Review result does not match the authoritative review queue entry.')
  }

  const adapted = lessonResultToCheckpoint(input.lessonResult, {
    progress: { ...input.progress, currentDifficulty: input.reviewIdentity.difficulty },
    knownSkillIds: [...new Set(input.availableLessons.map((lesson) => lesson.skillId))],
    supportedDifficulties: [...new Set(input.availableLessons.map((lesson) => lesson.difficulty))],
    relevantPrerequisite: null,
  })
  if (adapted.status === 'declined') return declined(input.progress, adapted.reason)

  const passedReview = adapted.checkpointInput.accuracy >= defaultProgressionRuleConfig.partialAccuracyThreshold
  const schedule = nextReviewInterval(input.reviewEntry.reviewStep, passedReview)
  const assisted = input.lessonResult.assistanceUsed > 0
    || input.lessonResult.assistanceSummary.totalUniqueEvents > 0
  const intervalReason = schedule.nextStep > input.reviewEntry.reviewStep
    ? 'review_interval_advanced'
    : schedule.nextStep < input.reviewEntry.reviewStep
      ? 'review_interval_shortened'
      : 'review_interval_maintained'
  const reasonCodes = [
    'review_completed',
    intervalReason,
    'track_progress_preserved',
    ...(assisted ? ['review_assistance_observed'] : []),
  ]
  const progress = recordReviewUsage(input.progress, candidate, input.completedAt)
  return {
    status: 'applied',
    progress,
    decision: {
      decisionState: 'SPACED_REVIEW',
      nextDifficulty: input.progress.currentDifficulty,
      remediationRequired: false,
      remediationTarget: null,
      needsIndependentVerification: false,
      reviewAction: { kind: 'none', nextDifficulty: input.progress.currentDifficulty },
      parentExplanation: passedReview
        ? 'The completed review moved this exact unit to its next review interval without changing track progression.'
        : 'The completed review moved this exact unit to a closer review interval without changing track progression.',
      childSafeMessageKey: 'training_round',
      reasonCodes,
    },
    nextQuest: {
      status: 'content_needed',
      purpose: 'review',
      skillId: input.reviewIdentity.skillId,
      difficulty: input.reviewIdentity.difficulty,
      reason: 'Global planning resumes after the completed review is recorded.',
    },
    reviewCompletion: {
      queueEntry: { ...input.reviewEntry },
      nextEntry: {
        skillId: input.reviewIdentity.skillId,
        difficulty: input.reviewIdentity.difficulty,
        reviewStep: schedule.nextStep,
        dueAt: addDays(input.completedAt, schedule.nextIntervalDays),
        unitId: input.reviewIdentity.unitId,
        contentVersion: input.reviewIdentity.contentVersion,
      },
    },
  }
}

function recordReviewUsage(
  progress: SkillProgressState,
  lesson: LessonActivityCandidate,
  completedAt: string,
): SkillProgressState {
  return {
    ...progress,
    qualifyingIndependentActivityIds: [...progress.qualifyingIndependentActivityIds],
    lastCompletedActivityId: lesson.activityId,
    recentActivityUsage: [
      ...progress.recentActivityUsage.map((entry) => ({
        ...entry,
        passageQuestionKeys: [...entry.passageQuestionKeys],
      })),
      {
        lessonId: lesson.lessonId,
        activityId: lesson.activityId,
        skillId: lesson.skillId,
        difficulty: lesson.difficulty,
        passageQuestionKeys: [...lesson.passageQuestionKeys],
        contentVersion: lesson.contentVersion,
        completedAt,
      },
    ].slice(-RECENT_ACTIVITY_LIMIT),
    lastDecisionReasonCodes: [...progress.lastDecisionReasonCodes],
    remediationContext: progress.remediationContext ? { ...progress.remediationContext } : null,
  }
}

function declined(progress: SkillProgressState, reason: string): DeclinedLessonProgression {
  return {
    status: 'declined',
    progress: {
      ...progress,
      qualifyingIndependentActivityIds: [...progress.qualifyingIndependentActivityIds],
      recentActivityUsage: progress.recentActivityUsage.map((entry) => ({
        ...entry,
        passageQuestionKeys: [...entry.passageQuestionKeys],
      })),
      lastDecisionReasonCodes: [...progress.lastDecisionReasonCodes],
      remediationContext: progress.remediationContext ? { ...progress.remediationContext } : null,
    },
    reason,
  }
}
