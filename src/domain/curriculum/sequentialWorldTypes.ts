export interface SequentialWorldUnitDefinition {
  unitId: string
  title: string
  activeDifficulty: number
  completionDifficulty: number
  activeLabel: string
  practiceFocus: string
  lockedMessage: string
  futureContentMessage: string
}

export interface SequentialWorldRoadmap {
  worldId: string
  trackId: string
  baseStatus: 'locked' | 'coming-later'
  units: readonly SequentialWorldUnitDefinition[]
}

export interface SequentialWorldUnitShell {
  id: string
  title: string
  difficultyLabel: string
  progressPercent: number
  stars: number
  state: 'available' | 'complete' | 'locked' | 'review'
  practiceFocus: string
}
