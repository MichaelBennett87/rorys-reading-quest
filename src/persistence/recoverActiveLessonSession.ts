import type { ActiveSessionCompatibilityInput, ActiveSessionRecoveryResult } from './questProgressTypes'
import { normalizeQuestProgressForSave } from './validatePersistedQuestProgress'
import { findReviewQueueEntryByResolvedIdentity } from '../domain/progression/reviewQueueAffinity'

export function recoverActiveLessonSession(
  input: ActiveSessionCompatibilityInput,
): ActiveSessionRecoveryResult {
  const state = normalizeQuestProgressForSave(input.state)
  const active = state.activeLessonSession
  if (!active) return { state, status: 'none' }

  if (state.completedAttempts.some((attempt) => attempt.completionId === active.sessionId)) {
    return {
      state: { ...state, activeLessonSession: null },
      status: 'discarded_completed',
      technicalDetail: 'The stored active lesson session was already recorded as completed.',
    }
  }

  const candidate = input.availableLessons.find((lesson) => (
    lesson.lessonId === active.lessonId
    && lesson.activityId === active.activityId
    && lesson.contentVersion === active.contentVersion
    && lesson.skillId === active.skillId
    && lesson.difficulty === active.difficulty
  ))
  const validQuestionIds = new Set(
    candidate?.passageQuestionKeys.map((key) => key.slice(key.indexOf('::') + 2)) ?? [],
  )
  const submittedIds = active.submittedQuestions.map((question) => question.questionId)
  const compatible = Boolean(candidate)
    && submittedIds.every((questionId) => validQuestionIds.has(questionId))
    && new Set(submittedIds).size === submittedIds.length
    && active.currentQuestionIndex >= active.submittedQuestions.length - 1
    && active.currentQuestionIndex < validQuestionIds.size
    && isLaunchContextCompatible(state, active, candidate, input.availableLessons)

  if (compatible) return { state, status: 'resumable' }
  return {
    state: { ...state, activeLessonSession: null },
    status: 'discarded_incompatible',
    technicalDetail: 'Active lesson identifiers or content version no longer match the local catalog.',
  }
}

function isLaunchContextCompatible(
  state: ActiveSessionCompatibilityInput['state'],
  active: NonNullable<ActiveSessionCompatibilityInput['state']['activeLessonSession']>,
  candidate: ActiveSessionCompatibilityInput['availableLessons'][number] | undefined,
  availableLessons: ActiveSessionCompatibilityInput['availableLessons'],
): boolean {
  const context = active.launchContext
  if (!context) return true
  if (!candidate?.eligiblePurposes.includes(context.purpose)) return false
  if (context.purpose !== 'review') return context.reviewIdentity === undefined
  const identity = context.reviewIdentity
  if (!identity) return false
  if (
    identity.skillId !== candidate.skillId
    || identity.difficulty !== candidate.difficulty
    || identity.unitId !== candidate.unitId
    || identity.contentVersion !== candidate.contentVersion
  ) return false
  const progress = state.skillProgress[identity.skillId]
  if (context.returnLearningState && progress?.currentLearningState !== context.returnLearningState) return false
  return Boolean(findReviewQueueEntryByResolvedIdentity(identity, {
    reviewQueue: state.reviewQueue,
    completedAttempts: state.completedAttempts,
    availableLessons,
  }))
}
