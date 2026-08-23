import { normalizeQuestProgressForSave } from './validatePersistedQuestProgress'
import type { QuestProgressV1 } from './questProgressTypes'

export function abandonActiveLesson(state: QuestProgressV1): QuestProgressV1 {
  const activeLessonSession = state.activeLessonSession
  if (!activeLessonSession) {
    return normalizeQuestProgressForSave(state)
  }

  const shouldClearPlannedQuest = (
    state.plannedNextQuest?.status === 'available'
    && state.plannedNextQuest.lesson.lessonId === activeLessonSession.lessonId
    && state.plannedNextQuest.lesson.activityId === activeLessonSession.activityId
    && state.plannedNextQuest.lesson.contentVersion === activeLessonSession.contentVersion
  )

  return normalizeQuestProgressForSave({
    ...state,
    activeLessonSession: null,
    plannedNextQuest: shouldClearPlannedQuest ? null : state.plannedNextQuest,
  })
}
