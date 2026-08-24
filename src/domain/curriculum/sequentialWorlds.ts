import type { SequentialWorldRoadmap, SequentialWorldUnitShell } from './sequentialWorldTypes'

const informationDetectivesRoadmap: SequentialWorldRoadmap = {
  worldId: 'information-detectives',
  trackId: 'g2-information-detectives-reading',
  gradeBand: 2,
  chapterTitle: 'Grade 2 Informational Reading',
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
  gradeBand: 2,
  chapterTitle: 'Grade 2 Vocabulary',
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
      futureContentMessage: 'You completed the available Context Cavern quests. Your progress is safe while new across-genre missions are prepared.',
    },
  ],
}

const compareCastleRoadmap: SequentialWorldRoadmap = {
  worldId: 'compare-castle',
  trackId: 'g2-across-genres-reading',
  gradeBand: 2,
  chapterTitle: 'Grade 2 Across Genres',
  baseStatus: 'locked',
  units: [
    {
      unitId: 'cg-unit-1',
      title: 'Wordplay Watchtower',
      activeDifficulty: 1,
      completionDifficulty: 2,
      activeLabel: 'Trail 1',
      practiceFocus: 'similes, idioms, alliteration, and what they mean in texts',
      lockedMessage: 'Wordplay Watchtower quests are being prepared.',
      futureContentMessage: 'Review similes, idioms, alliteration, and their meanings.',
    },
    {
      unitId: 'cg-unit-2',
      title: 'Retell Hall',
      activeDifficulty: 2,
      completionDifficulty: 3,
      activeLabel: 'Trail 2',
      practiceFocus: 'retelling literary and informational texts with the most important parts',
      lockedMessage: 'Complete Wordplay Watchtower to unlock Retell Hall.',
      futureContentMessage: 'Review literary and informational retelling.',
    },
    {
      unitId: 'cg-unit-3',
      title: 'Compare Keep',
      activeDifficulty: 3,
      completionDifficulty: 4,
      activeLabel: 'Trail 3',
      practiceFocus: 'comparing and contrasting important details from two texts',
      lockedMessage: 'Complete Retell Hall to unlock Compare Keep.',
      futureContentMessage: 'Review important similarities and differences across two texts.',
    },
  ],
}

const grade3Roadmaps: readonly SequentialWorldRoadmap[] = [
  plannedRoadmap('word-forge', 'g3-word-forge-foundations', 'Grade 3 Word Analysis', [
    plannedUnit('g3-wg-unit-1', 'Root Reactor', 'ELA.3.F.1.3', 'decoding words with common Greek and Latin roots and affixes', '7A1', 1, 2),
    {
      ...plannedUnit('g3-wg-unit-2', 'Suffix Shifter', 'ELA.3.F.1.3', 'derivational suffixes and how they change parts of speech', '7A2', 2, 3),
      lockedMessage: 'Complete Root Reactor to unlock Suffix Shifter.',
    },
    {
      ...plannedUnit('g3-wg-unit-3', 'Multisyllable Mountain', 'ELA.3.F.1.3', 'decoding Grade 3 multisyllabic words', '7A3', 3, 4),
      lockedMessage: 'Complete Suffix Shifter to unlock Multisyllable Mountain.',
    },
    {
      ...plannedUnit('g3-wg-unit-4', 'Fluency Flight Grade 3', 'ELA.3.F.1.4', 'accuracy, automaticity, phrasing, and expression practice without oral scoring', '7A4', 4, 5),
      lockedMessage: 'Complete Multisyllable Mountain to unlock Fluency Flight Grade 3.',
      futureContentMessage: 'Review smooth, meaningful reading. Completing this practice chapter does not measure oral fluency.',
    },
  ]),
  plannedRoadmap('story-scouts', 'g3-story-scouts-prose', 'Grade 3 Literary Analysis', [
    {
      ...plannedUnit('g3-ss-unit-1', 'Character Arc Camp', 'ELA.3.R.1.1', 'how characters develop throughout a plot', '7B1', 1, 2),
      lockedMessage: 'Complete the Grade 2 Story Scouts chapter to unlock Character Arc Camp.',
    },
    {
      ...plannedUnit('g3-ss-unit-2', 'Theme Development Trail', 'ELA.3.R.1.2', 'theme and how details develop it', '7B2', 2, 3),
      lockedMessage: 'Complete Character Arc Camp to unlock Theme Development Trail.',
      futureContentMessage: 'Theme Development Trail review quests are being prepared.',
    },
    {
      ...plannedUnit('g3-ss-unit-3', 'Perspective Portal Grade 3', 'ELA.3.R.1.3', "explaining and comparing how characters understand the same situation", '7B3', 3, 4),
      lockedMessage: 'Complete Theme Development Trail to unlock Perspective Portal Grade 3.',
      futureContentMessage: 'Review character perspectives, comparisons, changes, and supporting story evidence.',
    },
  ]),
  plannedRoadmap('poetry-planet', 'g3-poetry-planet', 'Grade 3 Poetry Forms', [
    plannedUnit('g3-pp-unit-1', 'Poem Form Observatory', 'ELA.3.R.1.4', 'free verse, rhymed verse, haiku, and limerick', '7B4', 1, 2),
  ]),
  plannedRoadmap('information-detectives', 'g3-information-detectives-reading', 'Grade 3 Informational Analysis', [
    plannedUnit('g3-id-unit-1', 'Structure Station', 'ELA.3.R.2.1', 'text features, chronology, comparison, and cause/effect', '7C1', 1, 2),
    plannedUnit('g3-id-unit-2', 'Central Idea Engine', 'ELA.3.R.2.2', 'how relevant details support the central idea', '7C2', 2, 3),
    plannedUnit('g3-id-unit-3', 'Purpose Development Path', 'ELA.3.R.2.3', "how details develop an author's purpose", '7C3', 3, 4),
    plannedUnit('g3-id-unit-4', 'Claim and Evidence Court', 'ELA.3.R.2.4', 'author claims and supporting evidence', '7C4', 4, 5),
  ]),
  plannedRoadmap('context-cavern', 'g3-context-cavern-vocabulary', 'Grade 3 Vocabulary', [
    plannedUnit('g3-cc-unit-1', 'Academic Word Workshop Grade 3', 'ELA.3.V.1.1', 'constrained practice using Grade 3 academic vocabulary appropriately', '7D4', 1, 2),
    plannedUnit('g3-cc-unit-2', 'Root Meaning Vault', 'ELA.3.V.1.2', 'Greek roots, Latin roots, base words, and affixes for word meaning', '7D5', 2, 3),
    plannedUnit('g3-cc-unit-3', 'Meaning Maze', 'ELA.3.V.1.3', 'multiple-meaning and unknown words and phrases using context, figurative language, relationships, references, and background knowledge', '7D6', 3, 4),
  ]),
  plannedRoadmap('compare-castle', 'g3-across-genres-reading', 'Grade 3 Across Genres', [
    plannedUnit('g3-cg-unit-1', 'Figurative Fortress', 'ELA.3.R.3.1', 'metaphors, personification, and hyperbole', '7D1', 1, 2),
    plannedUnit('g3-cg-unit-2', 'Summary Stronghold', 'ELA.3.R.3.2', 'literary summaries using plot and theme, and informational summaries using central idea and relevant details', '7D2', 2, 3),
    plannedUnit('g3-cg-unit-3', 'Author Lens Tower', 'ELA.3.R.3.3', 'comparing and contrasting how two authors present information on the same topic or theme', '7D3', 3, 4),
  ]),
]

export const sequentialWorldRoadmaps: readonly SequentialWorldRoadmap[] = Object.freeze([
  informationDetectivesRoadmap,
  contextCavernRoadmap,
  compareCastleRoadmap,
  ...grade3Roadmaps,
].map((roadmap) => Object.freeze({
  ...roadmap,
  units: Object.freeze(roadmap.units.map((unit) => Object.freeze({ ...unit }))),
})))

export function getSequentialWorldRoadmapByTrackId(trackId: string): SequentialWorldRoadmap | null {
  return sequentialWorldRoadmaps.find((roadmap) => roadmap.trackId === trackId) ?? null
}

export function getSequentialWorldRoadmapsByWorldId(worldId: string): readonly SequentialWorldRoadmap[] {
  return Object.freeze(sequentialWorldRoadmaps
    .filter((roadmap) => roadmap.worldId === worldId)
    .sort((left, right) => left.gradeBand - right.gradeBand || left.trackId.localeCompare(right.trackId)))
}

export function getSequentialWorldRoadmapByWorldId(worldId: string): SequentialWorldRoadmap | null {
  return getSequentialWorldRoadmapsByWorldId(worldId).find((roadmap) => roadmap.gradeBand === 2) ?? null
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

function plannedRoadmap(
  worldId: string,
  trackId: string,
  chapterTitle: string,
  units: readonly SequentialWorldRoadmap['units'][number][],
): SequentialWorldRoadmap {
  return { worldId, trackId, gradeBand: 3, chapterTitle, baseStatus: 'locked', units }
}

function plannedUnit(
  unitId: string,
  title: string,
  benchmarkReference: string,
  practiceFocus: string,
  plannedPhase: string,
  activeDifficulty: number,
  completionDifficulty: number,
): SequentialWorldRoadmap['units'][number] {
  return {
    unitId,
    title,
    benchmarkReference,
    plannedPhase,
    practiceFocus,
    activeDifficulty,
    completionDifficulty,
    activeLabel: `Trail ${activeDifficulty}`,
    lockedMessage: `Complete the earlier chapter work to unlock ${title}.`,
    futureContentMessage: `${title} content is planned for Phase ${plannedPhase}.`,
  }
}
