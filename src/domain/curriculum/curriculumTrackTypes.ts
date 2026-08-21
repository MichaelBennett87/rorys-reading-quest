import type { LessonActivityCandidate } from '../progression/skillProgressTypes'

export type CurriculumTrackStatus = 'active' | 'planned_until_content_exists'

export interface CurriculumTrackDefinition {
  trackId: string
  skillId: string
  worldId: string
  entryUnitId: string
  curriculumOrder: number
  initialDifficulty: number
  initialLastMasteredDifficulty: number
  status: CurriculumTrackStatus
  displayName: string
}

export interface PlayableTrackDiscovery {
  track: CurriculumTrackDefinition
  activeLessonCandidates: readonly LessonActivityCandidate[]
}

export type ActiveLearningFocusSource =
  | 'active_session'
  | 'planned_quest'
  | 'latest_attempt'
  | 'global_planned_quest'
  | 'first_playable_track'
  | 'safe_fallback'

export interface ActiveLearningFocus {
  skillId: string | null
  worldId: string | null
  unitId: string | null
  difficulty: number
  displayName: string
  source: ActiveLearningFocusSource
}

