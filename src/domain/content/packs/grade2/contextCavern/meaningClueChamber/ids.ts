const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

const createPassageIds = (key: string, sentenceCount: number, sectionCount: number) => ({
  passageId: `g2-cc-meaning-clues-${key}`,
  titleFeatureId: `g2-cc-meaning-clues-${key}-title`,
  headingFeatureIds: buildSeries(`g2-cc-meaning-clues-${key}-heading`, sectionCount),
  sentenceIds: buildSeries(`g2-cc-meaning-clues-${key}-sentence`, sentenceCount),
})

export const contextCavernMeaningClueChamberPackId = 'g2-context-cavern-meaning-clue-chamber'
export const contextCavernMeaningClueChamberContentVersion = 'g2-cc-meaning-clues-r0.1.0'
export const contextCavernMeaningClueChamberWorldId = 'context-cavern'
export const contextCavernMeaningClueChamberUnitId = 'cc-unit-3'
export const contextCavernMeaningClueChamberPrimarySkillId = 'g2-context-cavern-vocabulary'

export const contextCavernMeaningClueChamberPassageIds = {
  pondHabitat: createPassageIds('pond-habitat', 7, 2),
  birdNestSupport: createPassageIds('bird-nest-support', 7, 2),
  waterFilterStation: createPassageIds('water-filter-station', 7, 2),
  weatherNotesShade: createPassageIds('weather-notes-shade', 7, 2),
  seedTravelGround: createPassageIds('seed-travel-ground', 7, 3),
  trailMapHelpers: createPassageIds('trail-map-helpers', 7, 3),
  compostPileChange: createPassageIds('compost-pile-change', 7, 3),
} as const

export const contextCavernMeaningClueChamberLessonIds = {
  prereqFindTheClueAroundTheWord: 'lesson-cc-meaning-clues-prereq-find-the-clue-around-the-word',
  prereqConnectWordsAndReferenceTools: 'lesson-cc-meaning-clues-prereq-connect-words-and-reference-tools',
  guidedContextCluesAndWordRelationships: 'lesson-cc-meaning-clues-guided-context-clues-and-word-relationships',
  guidedGlossariesAndBackgroundKnowledge: 'lesson-cc-meaning-clues-guided-glossaries-and-background-knowledge',
  checkpointA: 'lesson-cc-meaning-clues-checkpoint-a',
  checkpointB: 'lesson-cc-meaning-clues-checkpoint-b',
  checkpointC: 'lesson-cc-meaning-clues-checkpoint-c',
} as const

export const contextCavernMeaningClueChamberQuestionIds = {
  prereqFindTheClueAroundTheWord: buildSeries(`${contextCavernMeaningClueChamberLessonIds.prereqFindTheClueAroundTheWord}-q`, 5),
  prereqConnectWordsAndReferenceTools: buildSeries(`${contextCavernMeaningClueChamberLessonIds.prereqConnectWordsAndReferenceTools}-q`, 5),
  guidedContextCluesAndWordRelationships: buildSeries(`${contextCavernMeaningClueChamberLessonIds.guidedContextCluesAndWordRelationships}-q`, 5),
  guidedGlossariesAndBackgroundKnowledge: buildSeries(`${contextCavernMeaningClueChamberLessonIds.guidedGlossariesAndBackgroundKnowledge}-q`, 5),
  checkpointA: buildSeries(`${contextCavernMeaningClueChamberLessonIds.checkpointA}-q`, 7),
  checkpointB: buildSeries(`${contextCavernMeaningClueChamberLessonIds.checkpointB}-q`, 7),
  checkpointC: buildSeries(`${contextCavernMeaningClueChamberLessonIds.checkpointC}-q`, 7),
} as const

export const contextCavernMeaningClueChamberSentenceIds = {
  pondHabitat: contextCavernMeaningClueChamberPassageIds.pondHabitat.sentenceIds,
  birdNestSupport: contextCavernMeaningClueChamberPassageIds.birdNestSupport.sentenceIds,
  waterFilterStation: contextCavernMeaningClueChamberPassageIds.waterFilterStation.sentenceIds,
  weatherNotesShade: contextCavernMeaningClueChamberPassageIds.weatherNotesShade.sentenceIds,
  seedTravelGround: contextCavernMeaningClueChamberPassageIds.seedTravelGround.sentenceIds,
  trailMapHelpers: contextCavernMeaningClueChamberPassageIds.trailMapHelpers.sentenceIds,
  compostPileChange: contextCavernMeaningClueChamberPassageIds.compostPileChange.sentenceIds,
} as const
