import type { LessonPurpose } from '../lesson'
import { selectNextLesson } from './selectNextLesson'
import type { LessonActivityCandidate, NextQuestPlan, SkillProgressState } from './skillProgressTypes'

export interface PlanNextQuestInput {
  progress: SkillProgressState
  availableLessons: readonly LessonActivityCandidate[]
  purpose: LessonPurpose
  targetSkillId?: string
  targetDifficulty?: number
  preferredUnitId?: string | null
  preferredContentVersion?: string | null
}

export function planNextQuest(input: PlanNextQuestInput): NextQuestPlan {
  return selectNextLesson({
    skillId: input.targetSkillId ?? input.progress.skillId,
    difficulty: input.targetDifficulty ?? input.progress.currentDifficulty,
    purpose: input.purpose,
    availableLessons: input.availableLessons,
    recentActivityUsage: input.progress.recentActivityUsage,
    preferredUnitId: input.preferredUnitId ?? null,
    preferredContentVersion: input.preferredContentVersion ?? null,
  })
}
