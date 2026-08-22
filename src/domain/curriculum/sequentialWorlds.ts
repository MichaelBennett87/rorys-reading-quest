import type { SequentialWorldRoadmap, SequentialWorldUnitShell } from './sequentialWorldTypes'

const informationDetectivesRoadmap: SequentialWorldRoadmap = {
  worldId: 'information-detectives',
  trackId: 'g2-information-detectives-reading',
  baseStatus: 'coming-later',
  units: [
    {
      unitId: 'id-unit-1',
      title: 'Text Feature Hunt',
      activeDifficulty: 1,
      completionDifficulty: 2,
      activeLabel: 'Trail 1',
      practiceFocus: 'titles, headings, captions, graphs, maps, glossaries, and illustrations',
      lockedMessage: 'Complete the earlier Information Detectives quests to unlock Text Feature Hunt.',
      futureContentMessage: 'Review titles, headings, captions, graphs, maps, glossaries, and illustrations.',
    },
    {
      unitId: 'id-unit-2',
      title: 'Central Idea Center',
      activeDifficulty: 2,
      completionDifficulty: 3,
      activeLabel: 'Trail 2',
      practiceFocus: 'central idea and relevant details',
      lockedMessage: 'Complete Text Feature Hunt to unlock Central Idea Center.',
      futureContentMessage: 'Review central idea and relevant details.',
    },
    {
      unitId: 'id-unit-3',
      title: 'Purpose Path',
      activeDifficulty: 3,
      completionDifficulty: 4,
      activeLabel: 'Trail 3',
      practiceFocus: "why an author wrote an informational text",
      lockedMessage: 'Complete Central Idea Center to unlock Purpose Path.',
      futureContentMessage: 'Review why an author wrote an informational text.',
    },
    {
      unitId: 'id-unit-4',
      title: 'Opinion & Evidence Desk',
      activeDifficulty: 4,
      completionDifficulty: 5,
      activeLabel: 'Trail 4',
      practiceFocus: "an author's opinion and supporting evidence",
      lockedMessage: 'Complete Purpose Path to unlock Opinion & Evidence Desk.',
      futureContentMessage: "Review an author's opinion and supporting evidence.",
    },
  ],
}

const contextCavernRoadmap: SequentialWorldRoadmap = {
  worldId: 'context-cavern',
  trackId: 'g2-context-cavern-vocabulary',
  baseStatus: 'locked',
  units: [
    {
      unitId: 'cc-unit-1',
      title: 'Academic Word Workshop',
      activeDifficulty: 1,
      completionDifficulty: 2,
      activeLabel: 'Trail 1',
      practiceFocus: 'using useful school and subject-area words',
      lockedMessage: 'Academic Word Workshop quests are being prepared.',
      futureContentMessage: 'Review useful school and subject-area words.',
    },
    {
      unitId: 'cc-unit-2',
      title: 'Morphology Mine',
      activeDifficulty: 2,
      completionDifficulty: 3,
      activeLabel: 'Trail 2',
      practiceFocus: 'base words, prefixes, and suffixes that reveal meaning',
      lockedMessage: 'Morphology Mine quests are being prepared.',
      futureContentMessage: 'Review base words, prefixes, and suffixes that reveal meaning.',
    },
    {
      unitId: 'cc-unit-3',
      title: 'Meaning Clue Chamber',
      activeDifficulty: 3,
      completionDifficulty: 4,
      activeLabel: 'Trail 3',
      practiceFocus: 'context clues, word relationships, reference tools, and background knowledge',
      lockedMessage: 'Meaning Clue Chamber quests are being prepared.',
      futureContentMessage: 'Review context clues, word relationships, reference tools, and background knowledge.',
    },
  ],
}

export const sequentialWorldRoadmaps: readonly SequentialWorldRoadmap[] = Object.freeze([
  informationDetectivesRoadmap,
  contextCavernRoadmap,
])

export function getSequentialWorldRoadmapByWorldId(worldId: string): SequentialWorldRoadmap | null {
  return sequentialWorldRoadmaps.find((roadmap) => roadmap.worldId === worldId) ?? null
}

export function buildSequentialWorldUnitShells(worldId: string): readonly SequentialWorldUnitShell[] {
  const roadmap = getSequentialWorldRoadmapByWorldId(worldId)
  if (!roadmap) return []

  return roadmap.units.map((unit) => ({
    id: unit.unitId,
    title: unit.title,
    difficultyLabel: 'Locked',
    progressPercent: 0,
    stars: 0,
    state: 'locked',
    practiceFocus: unit.lockedMessage,
  }))
}
