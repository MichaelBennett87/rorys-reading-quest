export const STORY_MAP_PACK_ID = 'g2-story-scouts-plot-structure-elements'
export const STORY_MAP_PACK_TITLE = 'Grade 2 Story Scouts: Story Map'
export const STORY_MAP_CONTENT_VERSION = 'g2-ss-plot-elements-r0.1.0'

export const STORY_MAP_PASSAGE_KEYS = {
  gardenSign: 'garden-sign',
  libraryCard: 'library-card',
  trailCleanup: 'trail-cleanup',
  birdBoxStorm: 'bird-box-storm',
  neighborhoodCleanup: 'neighborhood-cleanup',
  bridgeModel: 'bridge-model',
  seedlingsRain: 'seedlings-rain',
} as const

export const STORY_MAP_PASSAGE_IDS = {
  gardenSign: `${STORY_MAP_PACK_ID}-passage-${STORY_MAP_PASSAGE_KEYS.gardenSign}`,
  libraryCard: `${STORY_MAP_PACK_ID}-passage-${STORY_MAP_PASSAGE_KEYS.libraryCard}`,
  trailCleanup: `${STORY_MAP_PACK_ID}-passage-${STORY_MAP_PASSAGE_KEYS.trailCleanup}`,
  birdBoxStorm: `${STORY_MAP_PACK_ID}-passage-${STORY_MAP_PASSAGE_KEYS.birdBoxStorm}`,
  neighborhoodCleanup: `${STORY_MAP_PACK_ID}-passage-${STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup}`,
  bridgeModel: `${STORY_MAP_PACK_ID}-passage-${STORY_MAP_PASSAGE_KEYS.bridgeModel}`,
  seedlingsRain: `${STORY_MAP_PACK_ID}-passage-${STORY_MAP_PASSAGE_KEYS.seedlingsRain}`,
} as const

export const STORY_MAP_LESSON_IDS = {
  guidedA: `${STORY_MAP_PACK_ID}-lesson-guided-a`,
  guidedB: `${STORY_MAP_PACK_ID}-lesson-guided-b`,
  guidedC: `${STORY_MAP_PACK_ID}-lesson-guided-c`,
  guidedD: `${STORY_MAP_PACK_ID}-lesson-guided-d`,
  checkpointA: `${STORY_MAP_PACK_ID}-lesson-checkpoint-a`,
  checkpointB: `${STORY_MAP_PACK_ID}-lesson-checkpoint-b`,
  checkpointC: `${STORY_MAP_PACK_ID}-lesson-checkpoint-c`,
} as const

export const storyMapQuestionId = (lessonKey: string, questionKey: string) =>
  `${STORY_MAP_PACK_ID}-${lessonKey}-${questionKey}`

export const storyMapSupportTargetId = (passageKey: string, targetKey: string) =>
  `${STORY_MAP_PACK_ID}-${passageKey}-${targetKey}`

export const storyMapSentenceId = (passageKey: string, sentenceNumber: number) =>
  `${STORY_MAP_PACK_ID}-${passageKey}-sentence-${sentenceNumber}`

export const STORY_MAP_CHECKPOINT_TAGS = [
  'plot-structure',
  'setting',
  'characters',
  'sequence-of-events',
  'plot-beginning-middle-end',
  'plot-problem-resolution',
  'setting-where',
  'setting-when',
  'character-traits',
  'character-feelings',
  'character-behaviors',
  'event-sequencing',
] as const

export const STORY_MAP_BROAD_TAGS = [
  'plot-structure',
  'setting',
  'characters',
  'sequence-of-events',
] as const

