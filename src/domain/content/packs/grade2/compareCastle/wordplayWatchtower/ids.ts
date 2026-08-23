const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

const createProseIds = (key: string, sentenceCount: number) => ({
  passageId: `g2-cg-wordplay-${key}`,
  titleFeatureId: `g2-cg-wordplay-${key}-title`,
  headingFeatureIds: buildSeries(`g2-cg-wordplay-${key}-heading`, 2),
  sentenceIds: buildSeries(`g2-cg-wordplay-${key}-sentence`, sentenceCount),
})

const createPoemIds = (key: string, lineCount: number, stanzaCount: number) => ({
  passageId: `g2-cg-wordplay-${key}`,
  titleFeatureId: `g2-cg-wordplay-${key}-title`,
  stanzaIds: buildSeries(`g2-cg-wordplay-${key}-stanza`, stanzaCount),
  lineIds: buildSeries(`g2-cg-wordplay-${key}-line`, lineCount),
})

export const WORDPLAY_WATCHTOWER_PACK_ID = 'g2-compare-castle-wordplay-watchtower'
export const WORDPLAY_WATCHTOWER_PACK_TITLE = 'Grade 2 Compare Castle: Wordplay Watchtower'
export const WORDPLAY_WATCHTOWER_CONTENT_VERSION = 'g2-cg-wordplay-r0.1.0'
export const WORDPLAY_WATCHTOWER_WORLD_ID = 'compare-castle'
export const WORDPLAY_WATCHTOWER_UNIT_ID = 'cg-unit-1'
export const WORDPLAY_WATCHTOWER_PRIMARY_SKILL_ID = 'g2-across-genres-reading'

export const WORDPLAY_WATCHTOWER_PASSAGE_IDS = {
  kiteParade: createProseIds('kite-parade', 7),
  libraryHelpers: createProseIds('library-helpers', 7),
  gardenDisplay: createProseIds('garden-display', 7),
  rooftopPoem: createPoemIds('rooftop-poem', 8, 2),
  bridgeModel: createProseIds('bridge-model', 7),
  seedSong: createPoemIds('seed-song', 8, 2),
  trailMap: createProseIds('trail-map', 7),
} as const

export const WORDPLAY_WATCHTOWER_LESSON_IDS = {
  prereqSpotTheComparison: 'lesson-cg-wordplay-prereq-spot-the-comparison',
  prereqMeaningBeyondWords: 'lesson-cg-wordplay-prereq-meaning-beyond-the-words',
  guidedSimilesAndIdiomsInContext: 'lesson-cg-wordplay-guided-similes-and-idioms-in-context',
  guidedSoundPatternsInAPoem: 'lesson-cg-wordplay-guided-sound-patterns-in-a-poem',
  checkpointA: 'lesson-cg-wordplay-checkpoint-a',
  checkpointB: 'lesson-cg-wordplay-checkpoint-b',
  checkpointC: 'lesson-cg-wordplay-checkpoint-c',
} as const

export const WORDPLAY_WATCHTOWER_QUESTION_IDS = {
  prereqSpotTheComparison: buildSeries(`${WORDPLAY_WATCHTOWER_LESSON_IDS.prereqSpotTheComparison}-q`, 5),
  prereqMeaningBeyondWords: buildSeries(`${WORDPLAY_WATCHTOWER_LESSON_IDS.prereqMeaningBeyondWords}-q`, 5),
  guidedSimilesAndIdiomsInContext: buildSeries(`${WORDPLAY_WATCHTOWER_LESSON_IDS.guidedSimilesAndIdiomsInContext}-q`, 5),
  guidedSoundPatternsInAPoem: buildSeries(`${WORDPLAY_WATCHTOWER_LESSON_IDS.guidedSoundPatternsInAPoem}-q`, 5),
  checkpointA: buildSeries(`${WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointA}-q`, 7),
  checkpointB: buildSeries(`${WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointB}-q`, 7),
  checkpointC: buildSeries(`${WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointC}-q`, 7),
} as const

export const WORDPLAY_WATCHTOWER_SENTENCE_IDS = {
  kiteParade: WORDPLAY_WATCHTOWER_PASSAGE_IDS.kiteParade.sentenceIds,
  libraryHelpers: WORDPLAY_WATCHTOWER_PASSAGE_IDS.libraryHelpers.sentenceIds,
  gardenDisplay: WORDPLAY_WATCHTOWER_PASSAGE_IDS.gardenDisplay.sentenceIds,
  rooftopPoem: WORDPLAY_WATCHTOWER_PASSAGE_IDS.rooftopPoem.lineIds,
  bridgeModel: WORDPLAY_WATCHTOWER_PASSAGE_IDS.bridgeModel.sentenceIds,
  seedSong: WORDPLAY_WATCHTOWER_PASSAGE_IDS.seedSong.lineIds,
  trailMap: WORDPLAY_WATCHTOWER_PASSAGE_IDS.trailMap.sentenceIds,
} as const
