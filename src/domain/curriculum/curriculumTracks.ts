import type { CurriculumTrackDefinition } from './curriculumTrackTypes'

const curriculumTrackDefinitions: CurriculumTrackDefinition[] = [
  {
    trackId: 'g2-word-forge-foundations',
    skillId: 'g2-word-forge-word-practice',
    worldId: 'word-forge',
    entryUnitId: 'wg-unit-1',
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
    curriculumOrder: 20,
    initialDifficulty: 1,
    initialLastMasteredDifficulty: 0,
    status: 'planned_until_content_exists',
    displayName: 'Story Scouts Prose',
  },
  {
    trackId: 'g2-poetry-planet',
    skillId: 'g2-poetry-planet-poetry',
    worldId: 'poetry-planet',
    entryUnitId: 'pp-unit-1',
    curriculumOrder: 30,
    initialDifficulty: 1,
    initialLastMasteredDifficulty: 0,
    status: 'planned_until_content_exists',
    displayName: 'Poetry Planet',
  },
]

export const curriculumTracks: readonly CurriculumTrackDefinition[] = Object.freeze(
  curriculumTrackDefinitions.map((track) => Object.freeze({ ...track })),
)

const trackBySkillId = new Map(curriculumTracks.map((track) => [track.skillId, track] as const))
const trackByWorldId = new Map(curriculumTracks.map((track) => [track.worldId, track] as const))
const trackByUnitId = new Map(curriculumTracks.map((track) => [track.entryUnitId, track] as const))
export function getTrackBySkillId(skillId: string): CurriculumTrackDefinition | null {
  return trackBySkillId.get(skillId) ?? null
}

export function getTrackByWorldId(worldId: string): CurriculumTrackDefinition | null {
  return trackByWorldId.get(worldId) ?? null
}

export function getTrackByUnitId(unitId: string): CurriculumTrackDefinition | null {
  return trackByUnitId.get(unitId) ?? null
}
