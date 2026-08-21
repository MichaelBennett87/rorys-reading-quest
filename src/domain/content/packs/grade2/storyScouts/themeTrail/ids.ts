export const THEME_TRAIL_PACK_ID = 'g2-story-scouts-theme-trail'
export const THEME_TRAIL_PACK_TITLE = 'Grade 2 Story Scouts: Theme Trail'
export const THEME_TRAIL_CONTENT_VERSION = 'g2-ss-theme-r0.1.0'

export const THEME_TRAIL_PASSAGE_KEYS = {
  gardenHelp: 'garden-help',
  libraryPause: 'library-pause',
  hallwayTruth: 'hallway-truth',
  springFair: 'spring-fair',
  modelBridge: 'model-bridge',
  birdhousePlan: 'birdhouse-plan',
  bookSwapTrust: 'book-swap-trust',
} as const

export const THEME_TRAIL_PASSAGE_IDS = {
  gardenHelp: `${THEME_TRAIL_PACK_ID}-passage-${THEME_TRAIL_PASSAGE_KEYS.gardenHelp}`,
  libraryPause: `${THEME_TRAIL_PACK_ID}-passage-${THEME_TRAIL_PASSAGE_KEYS.libraryPause}`,
  hallwayTruth: `${THEME_TRAIL_PACK_ID}-passage-${THEME_TRAIL_PASSAGE_KEYS.hallwayTruth}`,
  springFair: `${THEME_TRAIL_PACK_ID}-passage-${THEME_TRAIL_PASSAGE_KEYS.springFair}`,
  modelBridge: `${THEME_TRAIL_PACK_ID}-passage-${THEME_TRAIL_PASSAGE_KEYS.modelBridge}`,
  birdhousePlan: `${THEME_TRAIL_PACK_ID}-passage-${THEME_TRAIL_PASSAGE_KEYS.birdhousePlan}`,
  bookSwapTrust: `${THEME_TRAIL_PACK_ID}-passage-${THEME_TRAIL_PASSAGE_KEYS.bookSwapTrust}`,
} as const

export const THEME_TRAIL_LESSON_IDS = {
  prerequisiteA: `${THEME_TRAIL_PACK_ID}-lesson-prerequisite-a`,
  prerequisiteB: `${THEME_TRAIL_PACK_ID}-lesson-prerequisite-b`,
  guidedA: `${THEME_TRAIL_PACK_ID}-lesson-guided-a`,
  guidedB: `${THEME_TRAIL_PACK_ID}-lesson-guided-b`,
  checkpointA: `${THEME_TRAIL_PACK_ID}-lesson-checkpoint-a`,
  checkpointB: `${THEME_TRAIL_PACK_ID}-lesson-checkpoint-b`,
  checkpointC: `${THEME_TRAIL_PACK_ID}-lesson-checkpoint-c`,
} as const

export const THEME_TRAIL_BROAD_TAGS = [
  'theme-identification',
  'theme-explanation',
] as const

export const THEME_TRAIL_DETAILED_TAGS = [
  'theme-as-complete-thought',
  'theme-vs-topic',
  'theme-vs-summary',
  'best-supported-theme',
  'theme-supported-by-character-actions',
  'theme-supported-by-events',
  'theme-supported-by-outcome',
  'theme-supported-by-details',
] as const

export const THEME_TRAIL_QUESTION_TAGS = [
  ...THEME_TRAIL_BROAD_TAGS,
  ...THEME_TRAIL_DETAILED_TAGS,
] as const

export const themeTrailQuestionId = (lessonKey: string, questionKey: string) =>
  `${THEME_TRAIL_PACK_ID}-${lessonKey}-${questionKey}`

export const themeTrailSupportTargetId = (passageKey: string, targetKey: string) =>
  `${THEME_TRAIL_PACK_ID}-${passageKey}-${targetKey}`

export const themeTrailSentenceId = (passageKey: string, sentenceNumber: number) =>
  `${THEME_TRAIL_PACK_ID}-passage-${passageKey}-sentence-${sentenceNumber}`
