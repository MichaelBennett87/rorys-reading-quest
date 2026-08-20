import type { LessonPurpose } from '../lesson'
import { selectNextLesson } from './selectNextLesson'
import type { LessonActivityCandidate, NextQuestPlan, SkillProgressState } from './skillProgressTypes'

export interface PlanNextQuestInput {
  progress: SkillProgressState
  availableLessons: readonly LessonActivityCandidate[]
  purpose: LessonPurpose
  targetSkillId?: string
  targetDifficulty?: number
}

export function planNextQuest(input: PlanNextQuestInput): NextQuestPlan {
  return selectNextLesson({
    skillId: input.targetSkillId ?? input.progress.skillId,
    difficulty: input.targetDifficulty ?? input.progress.currentDifficulty,
    purpose: input.purpose,
    availableLessons: input.availableLessons,
    recentActivityUsage: input.progress.recentActivityUsage,
  })
}
