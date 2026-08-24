import type { CurriculumTrackDefinition } from './curriculumTrackTypes'

const curriculumTrackDefinitions: CurriculumTrackDefinition[] = [
  {
    trackId: 'g2-word-forge-foundations', skillId: 'g2-word-forge-word-practice', worldId: 'word-forge', gradeBand: 2,
    entryUnitId: 'wg-unit-1', unitIds: ['wg-unit-1', 'wg-unit-2', 'wg-unit-3', 'wg-unit-4', 'wg-unit-5', 'wg-unit-6'],
    curriculumOrder: 10, worldChapterOrder: 1, initialDifficulty: 1, initialLastMasteredDifficulty: 0,
    completionDifficulty: 8, prerequisiteTrackIds: [], status: 'active', displayName: 'Word Forge Foundations',
  },
  {
    trackId: 'g2-story-scouts-prose', skillId: 'g2-story-scouts-prose', worldId: 'story-scouts', gradeBand: 2,
    entryUnitId: 'ss-unit-1', unitIds: ['ss-unit-1', 'ss-unit-2', 'ss-unit-3'],
    curriculumOrder: 20, worldChapterOrder: 1, initialDifficulty: 1, initialLastMasteredDifficulty: 0,
    completionDifficulty: 4, prerequisiteTrackIds: [], status: 'active', displayName: 'Story Scouts Prose',
  },
  {
    trackId: 'g2-poetry-planet', skillId: 'g2-poetry-planet-poetry', worldId: 'poetry-planet', gradeBand: 2,
    entryUnitId: 'pp-unit-1', unitIds: ['pp-unit-1'], curriculumOrder: 30, worldChapterOrder: 1,
    initialDifficulty: 1, initialLastMasteredDifficulty: 0, completionDifficulty: 2, prerequisiteTrackIds: [],
    status: 'active', displayName: 'Poetry Planet',
  },
  {
    trackId: 'g2-information-detectives-reading', skillId: 'g2-information-detectives-reading',
    worldId: 'information-detectives', gradeBand: 2, entryUnitId: 'id-unit-1',
    unitIds: ['id-unit-1', 'id-unit-2', 'id-unit-3', 'id-unit-4'], curriculumOrder: 40, worldChapterOrder: 1,
    initialDifficulty: 1, initialLastMasteredDifficulty: 0, completionDifficulty: 5, prerequisiteTrackIds: [],
    status: 'active', displayName: 'Information Detectives',
  },
  {
    trackId: 'g2-context-cavern-vocabulary', skillId: 'g2-context-cavern-vocabulary', worldId: 'context-cavern',
    gradeBand: 2, entryUnitId: 'cc-unit-1', unitIds: ['cc-unit-1', 'cc-unit-2', 'cc-unit-3'],
    curriculumOrder: 50, worldChapterOrder: 1, initialDifficulty: 1, initialLastMasteredDifficulty: 0,
    completionDifficulty: 4, prerequisiteTrackIds: [], status: 'active', displayName: 'Context Cavern Vocabulary',
  },
  {
    trackId: 'g2-across-genres-reading', skillId: 'g2-across-genres-reading', worldId: 'compare-castle', gradeBand: 2,
    entryUnitId: 'cg-unit-1', unitIds: ['cg-unit-1', 'cg-unit-2', 'cg-unit-3'], curriculumOrder: 60,
    worldChapterOrder: 1, initialDifficulty: 1, initialLastMasteredDifficulty: 0, completionDifficulty: 4,
    prerequisiteTrackIds: [], status: 'active', displayName: 'Across-Genre Reading',
  },
  {
    trackId: 'g3-word-forge-foundations', skillId: 'g3-word-forge-word-analysis', worldId: 'word-forge', gradeBand: 3,
    entryUnitId: 'g3-wg-unit-1', unitIds: ['g3-wg-unit-1', 'g3-wg-unit-2', 'g3-wg-unit-3', 'g3-wg-unit-4'],
    curriculumOrder: 110, worldChapterOrder: 2, initialDifficulty: 1, initialLastMasteredDifficulty: 0,
    completionDifficulty: 5, prerequisiteTrackIds: ['g2-word-forge-foundations'],
    status: 'active', displayName: 'Grade 3 Word Forge',
  },
  {
    trackId: 'g3-story-scouts-prose', skillId: 'g3-story-scouts-prose', worldId: 'story-scouts', gradeBand: 3,
    entryUnitId: 'g3-ss-unit-1', unitIds: ['g3-ss-unit-1', 'g3-ss-unit-2', 'g3-ss-unit-3'],
    curriculumOrder: 120, worldChapterOrder: 2, initialDifficulty: 1, initialLastMasteredDifficulty: 0,
    completionDifficulty: 4, prerequisiteTrackIds: ['g2-story-scouts-prose'],
    status: 'active', displayName: 'Grade 3 Story Scouts',
  },
  {
    trackId: 'g3-poetry-planet', skillId: 'g3-poetry-planet-poetry', worldId: 'poetry-planet', gradeBand: 3,
    entryUnitId: 'g3-pp-unit-1', unitIds: ['g3-pp-unit-1'], curriculumOrder: 130, worldChapterOrder: 2,
    initialDifficulty: 1, initialLastMasteredDifficulty: 0, completionDifficulty: 2,
    prerequisiteTrackIds: ['g2-poetry-planet'], status: 'planned_until_content_exists', displayName: 'Grade 3 Poetry Planet',
  },
  {
    trackId: 'g3-information-detectives-reading', skillId: 'g3-information-detectives-reading',
    worldId: 'information-detectives', gradeBand: 3, entryUnitId: 'g3-id-unit-1',
    unitIds: ['g3-id-unit-1', 'g3-id-unit-2', 'g3-id-unit-3', 'g3-id-unit-4'],
    curriculumOrder: 140, worldChapterOrder: 2, initialDifficulty: 1, initialLastMasteredDifficulty: 0,
    completionDifficulty: 5, prerequisiteTrackIds: ['g2-information-detectives-reading'],
    status: 'planned_until_content_exists', displayName: 'Grade 3 Information Detectives',
  },
  {
    trackId: 'g3-context-cavern-vocabulary', skillId: 'g3-context-cavern-vocabulary', worldId: 'context-cavern',
    gradeBand: 3, entryUnitId: 'g3-cc-unit-1', unitIds: ['g3-cc-unit-1', 'g3-cc-unit-2', 'g3-cc-unit-3'],
    curriculumOrder: 150, worldChapterOrder: 2, initialDifficulty: 1, initialLastMasteredDifficulty: 0,
    completionDifficulty: 4, prerequisiteTrackIds: ['g2-context-cavern-vocabulary'],
    status: 'planned_until_content_exists', displayName: 'Grade 3 Context Cavern',
  },
  {
    trackId: 'g3-across-genres-reading', skillId: 'g3-across-genres-reading', worldId: 'compare-castle', gradeBand: 3,
    entryUnitId: 'g3-cg-unit-1', unitIds: ['g3-cg-unit-1', 'g3-cg-unit-2', 'g3-cg-unit-3'],
    curriculumOrder: 160, worldChapterOrder: 2, initialDifficulty: 1, initialLastMasteredDifficulty: 0,
    completionDifficulty: 4, prerequisiteTrackIds: ['g2-across-genres-reading'],
    status: 'planned_until_content_exists', displayName: 'Grade 3 Across-Genre Reading',
  },
]

export const curriculumTracks: readonly CurriculumTrackDefinition[] = Object.freeze(
  curriculumTrackDefinitions.map((track) => Object.freeze({
    ...track,
    unitIds: Object.freeze([...(track.unitIds ?? [])]),
    prerequisiteTrackIds: Object.freeze([...track.prerequisiteTrackIds]),
  })),
)

const trackByTrackId = new Map(curriculumTracks.map((track) => [track.trackId, track] as const))
const trackBySkillId = new Map(curriculumTracks.map((track) => [track.skillId, track] as const))
const tracksByWorldId = new Map<string, CurriculumTrackDefinition[]>()
const trackByUnitId = new Map<string, CurriculumTrackDefinition>()

for (const track of curriculumTracks) {
  tracksByWorldId.set(track.worldId, [...(tracksByWorldId.get(track.worldId) ?? []), track])
  for (const unitId of new Set([track.entryUnitId, ...(track.unitIds ?? [])])) {
    if (trackByUnitId.has(unitId)) throw new Error(`Duplicate curriculum unit ID: ${unitId}`)
    trackByUnitId.set(unitId, track)
  }
}

export function getTrackByTrackId(trackId: string): CurriculumTrackDefinition | null {
  return trackByTrackId.get(trackId) ?? null
}

export function getTrackBySkillId(skillId: string): CurriculumTrackDefinition | null {
  return trackBySkillId.get(skillId) ?? null
}

export function getTracksByWorldId(worldId: string): readonly CurriculumTrackDefinition[] {
  return Object.freeze([...(tracksByWorldId.get(worldId) ?? [])].sort(compareWorldTracks))
}

/** Grade 2 compatibility helper. Multi-grade callers must resolve by exact skill, unit, or track ID. */
export function getTrackByWorldId(worldId: string): CurriculumTrackDefinition | null {
  return getTracksByWorldId(worldId).find((track) => track.gradeBand === 2) ?? null
}

export function getTrackByUnitId(unitId: string): CurriculumTrackDefinition | null {
  return trackByUnitId.get(unitId) ?? null
}

function compareWorldTracks(left: CurriculumTrackDefinition, right: CurriculumTrackDefinition): number {
  return left.gradeBand - right.gradeBand
    || left.worldChapterOrder - right.worldChapterOrder
    || left.curriculumOrder - right.curriculumOrder
    || left.trackId.localeCompare(right.trackId)
}
