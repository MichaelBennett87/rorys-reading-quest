import type { ActiveSessionCompatibilityInput, ActiveSessionRecoveryResult } from './questProgressTypes'
import { normalizeQuestProgressForSave } from './validatePersistedQuestProgress'

export function recoverActiveLessonSession(
  input: ActiveSessionCompatibilityInput,
): ActiveSessionRecoveryResult {
  const state = normalizeQuestProgressForSave(input.state)
  const active = state.activeLessonSession
  if (!active) return { state, status: 'none' }

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

  if (compatible) return { state, status: 'resumable' }
  return {
    state: { ...state, activeLessonSession: null },
    status: 'discarded_incompatible',
    technicalDetail: 'Active lesson identifiers or content version no longer match the local catalog.',
  }
}
