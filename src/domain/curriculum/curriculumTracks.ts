import type { CurriculumTrackDefinition } from './curriculumTrackTypes'

const curriculumTrackDefinitions: CurriculumTrackDefinition[] = [
  {
    trackId: 'g2-word-forge-foundations',
    skillId: 'g2-word-forge-word-practice',
    worldId: 'word-forge',
    entryUnitId: 'wg-unit-1',
    unitIds: ['wg-unit-1', 'wg-unit-2', 'wg-unit-3', 'wg-unit-4', 'wg-unit-5', 'wg-unit-6'],
    curriculumOrder: 10,
    initialDifficulty: 1,
    initialLastMasteredDifficulty: 0,
    status: 'active',
    displayName: 'Word Forge Foundations',
  },
  {
    trackId: 'g2-story-scouts-prose',
    skillId: 'g2-story-scouts-prose',
    worldId: 'story-scouts',
    entryUnitId: 'ss-unit-1',
    unitIds: ['ss-unit-1', 'ss-unit-2', 'ss-unit-3'],
    curriculumOrder: 20,
    initialDifficulty: 1,
    initialLastMasteredDifficulty: 0,
    status: 'active',
    displayName: 'Story Scouts Prose',
  },
  {
    trackId: 'g2-poetry-planet',
    skillId: 'g2-poetry-planet-poetry',
    worldId: 'poetry-planet',
    entryUnitId: 'pp-unit-1',
    unitIds: ['pp-unit-1'],
    curriculumOrder: 30,
    initialDifficulty: 1,
    initialLastMasteredDifficulty: 0,
    status: 'active',
    displayName: 'Poetry Planet',
  },
]

export const curriculumTracks: readonly CurriculumTrackDefinition[] = Object.freeze(
  curriculumTrackDefinitions.map((track) => Object.freeze({ ...track })),
)

const trackBySkillId = new Map(curriculumTracks.map((track) => [track.skillId, track] as const))
const trackByWorldId = new Map(curriculumTracks.map((track) => [track.worldId, track] as const))
const trackByUnitId = new Map(
  curriculumTracks.flatMap((track) => [track.entryUnitId, ...(track.unitIds ?? [])].map((unitId) => [unitId, track] as const)),
)
export function getTrackBySkillId(skillId: string): CurriculumTrackDefinition | null {
  return trackBySkillId.get(skillId) ?? null
}

export function getTrackByWorldId(worldId: string): CurriculumTrackDefinition | null {
  return trackByWorldId.get(worldId) ?? null
}

export function getTrackByUnitId(unitId: string): CurriculumTrackDefinition | null {
  return trackByUnitId.get(unitId) ?? null
}
