const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

const createPassageIds = (key: string, sentenceCount: number, sectionCount: number) => ({
  passageId: `g2-cc-morphology-${key}`,
  titleFeatureId: `g2-cc-morphology-${key}-title`,
  headingFeatureIds: buildSeries(`g2-cc-morphology-${key}-heading`, sectionCount),
  sentenceIds: buildSeries(`g2-cc-morphology-${key}-sentence`, sentenceCount),
})

export const contextCavernMorphologyMinePackId = 'g2-context-cavern-morphology-mine'
export const contextCavernMorphologyMineContentVersion = 'g2-cc-morphology-r0.1.0'
export const contextCavernMorphologyMineWorldId = 'context-cavern'
export const contextCavernMorphologyMineUnitId = 'cc-unit-2'
export const contextCavernMorphologyMinePrimarySkillId = 'g2-context-cavern-vocabulary'

export const contextCavernMorphologyMinePassageIds = {
  unpackSupplyCart: createPassageIds('unpack-supply-cart', 8, 2),
  rebuildPlantShelf: createPassageIds('rebuild-plant-shelf', 8, 2),
  preheatSnackDemo: createPassageIds('preheat-snack-demo', 8, 2),
  trailMapReview: createPassageIds('trail-map-review', 8, 2),
  toolShelfSort: createPassageIds('tool-shelf-sort', 8, 3),
  kitchenCrewPractice: createPassageIds('kitchen-crew-practice', 8, 3),
  readingTableReset: createPassageIds('reading-table-reset', 8, 3),
  countAndCompare: createPassageIds('count-and-compare', 8, 3),
} as const

export const contextCavernMorphologyMineLessonIds = {
  prereqFindBaseWord: 'lesson-cc-morphology-prereq-find-base-word',
  prereqMatchAffixMeaning: 'lesson-cc-morphology-prereq-match-affix-meaning',
  guidedPrefixesBuildMeanings: 'lesson-cc-morphology-guided-prefixes-build-meanings',
  guidedSuffixesBuildMeanings: 'lesson-cc-morphology-guided-suffixes-build-meanings',
  checkpointA: 'lesson-cc-morphology-checkpoint-a',
  checkpointB: 'lesson-cc-morphology-checkpoint-b',
  checkpointC: 'lesson-cc-morphology-checkpoint-c',
} as const

export const contextCavernMorphologyMineQuestionIds = {
  prereqFindBaseWord: buildSeries(`${contextCavernMorphologyMineLessonIds.prereqFindBaseWord}-q`, 5),
  prereqMatchAffixMeaning: buildSeries(`${contextCavernMorphologyMineLessonIds.prereqMatchAffixMeaning}-q`, 5),
  guidedPrefixesBuildMeanings: buildSeries(`${contextCavernMorphologyMineLessonIds.guidedPrefixesBuildMeanings}-q`, 5),
  guidedSuffixesBuildMeanings: buildSeries(`${contextCavernMorphologyMineLessonIds.guidedSuffixesBuildMeanings}-q`, 5),
  checkpointA: buildSeries(`${contextCavernMorphologyMineLessonIds.checkpointA}-q`, 7),
  checkpointB: buildSeries(`${contextCavernMorphologyMineLessonIds.checkpointB}-q`, 7),
  checkpointC: buildSeries(`${contextCavernMorphologyMineLessonIds.checkpointC}-q`, 7),
} as const

export const contextCavernMorphologyMineSentenceIds = {
  unpackSupplyCart: contextCavernMorphologyMinePassageIds.unpackSupplyCart.sentenceIds,
  rebuildPlantShelf: contextCavernMorphologyMinePassageIds.rebuildPlantShelf.sentenceIds,
  preheatSnackDemo: contextCavernMorphologyMinePassageIds.preheatSnackDemo.sentenceIds,
  trailMapReview: contextCavernMorphologyMinePassageIds.trailMapReview.sentenceIds,
  toolShelfSort: contextCavernMorphologyMinePassageIds.toolShelfSort.sentenceIds,
  kitchenCrewPractice: contextCavernMorphologyMinePassageIds.kitchenCrewPractice.sentenceIds,
  readingTableReset: contextCavernMorphologyMinePassageIds.readingTableReset.sentenceIds,
  countAndCompare: contextCavernMorphologyMinePassageIds.countAndCompare.sentenceIds,
} as const
