export const RETELL_HALL_PACK_ID = 'g2-compare-castle-retell-hall'
export const RETELL_HALL_PACK_TITLE = 'Grade 2 Compare Castle: Retell Hall'
export const RETELL_HALL_WORLD_ID = 'compare-castle'
export const RETELL_HALL_UNIT_ID = 'cg-unit-2'
export const RETELL_HALL_PRIMARY_SKILL_ID = 'g2-across-genres-reading'
export const RETELL_HALL_CONTENT_VERSION = 'g2-cg-retell-r0.1.0'

export const RETELL_HALL_LESSON_IDS = {
  prereqStoryPartsInOrder: 'cg-retell-prereq-story-parts-in-order',
  prereqCentralIdeaAndImportantDetails: 'cg-retell-prereq-central-idea-and-important-details',
  guidedBuildALiteraryRetell: 'cg-retell-guided-build-a-literary-retell',
  guidedBuildAnInformationalRetell: 'cg-retell-guided-build-an-informational-retell',
  checkpointLiteraryA: 'cg-retell-checkpoint-literary-a',
  checkpointInformational: 'cg-retell-checkpoint-informational',
  checkpointLiteraryB: 'cg-retell-checkpoint-literary-b',
} as const

const makeQuestionIds = (baseId: string, count: number) =>
  Array.from({ length: count }, (_unused, index) => `${baseId}-q${index + 1}`) as readonly string[]

export const RETELL_HALL_QUESTION_IDS = {
  prereqStoryPartsInOrder: makeQuestionIds(RETELL_HALL_LESSON_IDS.prereqStoryPartsInOrder, 5),
  prereqCentralIdeaAndImportantDetails: makeQuestionIds(RETELL_HALL_LESSON_IDS.prereqCentralIdeaAndImportantDetails, 5),
  guidedBuildALiteraryRetell: makeQuestionIds(RETELL_HALL_LESSON_IDS.guidedBuildALiteraryRetell, 5),
  guidedBuildAnInformationalRetell: makeQuestionIds(RETELL_HALL_LESSON_IDS.guidedBuildAnInformationalRetell, 5),
  checkpointLiteraryA: makeQuestionIds(RETELL_HALL_LESSON_IDS.checkpointLiteraryA, 7),
  checkpointInformational: makeQuestionIds(RETELL_HALL_LESSON_IDS.checkpointInformational, 7),
  checkpointLiteraryB: makeQuestionIds(RETELL_HALL_LESSON_IDS.checkpointLiteraryB, 7),
} as const

export const RETELL_HALL_PASSAGE_IDS = {
  literaryMuralLabel: 'g2-cg-retell-mural-label',
  literaryBridgeRepair: 'g2-cg-retell-bridge-repair',
  literaryLibraryStoryNight: 'g2-cg-retell-library-story-night',
  literaryMapCardSearch: 'g2-cg-retell-map-card-search',
  informationalSeedTravel: 'g2-cg-retell-seed-travel',
  informationalRainGaugeNotes: 'g2-cg-retell-rain-gauge-notes',
  informationalBirdLayers: 'g2-cg-retell-bird-layers',
} as const
