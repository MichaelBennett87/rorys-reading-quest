export const PERSPECTIVE_PORTAL_PACK_ID = 'g2-story-scouts-perspective-portal'
export const PERSPECTIVE_PORTAL_PACK_TITLE = 'Grade 2 Story Scouts: Perspective Portal'
export const PERSPECTIVE_PORTAL_CONTENT_VERSION = 'g2-ss-perspective-r0.1.0'

export const PERSPECTIVE_PORTAL_PASSAGE_KEYS = {
  rainyGarden: 'rainy-garden',
  libraryDisplay: 'library-display',
  trailRoute: 'trail-route',
  artTable: 'art-table',
  seedlingsStorm: 'seedlings-storm',
  bridgeMeasure: 'bridge-measure',
  cleanupWater: 'cleanup-water',
} as const

export const PERSPECTIVE_PORTAL_PASSAGE_IDS = {
  rainyGarden: `${PERSPECTIVE_PORTAL_PACK_ID}-passage-${PERSPECTIVE_PORTAL_PASSAGE_KEYS.rainyGarden}`,
  libraryDisplay: `${PERSPECTIVE_PORTAL_PACK_ID}-passage-${PERSPECTIVE_PORTAL_PASSAGE_KEYS.libraryDisplay}`,
  trailRoute: `${PERSPECTIVE_PORTAL_PACK_ID}-passage-${PERSPECTIVE_PORTAL_PASSAGE_KEYS.trailRoute}`,
  artTable: `${PERSPECTIVE_PORTAL_PACK_ID}-passage-${PERSPECTIVE_PORTAL_PASSAGE_KEYS.artTable}`,
  seedlingsStorm: `${PERSPECTIVE_PORTAL_PACK_ID}-passage-${PERSPECTIVE_PORTAL_PASSAGE_KEYS.seedlingsStorm}`,
  bridgeMeasure: `${PERSPECTIVE_PORTAL_PACK_ID}-passage-${PERSPECTIVE_PORTAL_PASSAGE_KEYS.bridgeMeasure}`,
  cleanupWater: `${PERSPECTIVE_PORTAL_PACK_ID}-passage-${PERSPECTIVE_PORTAL_PASSAGE_KEYS.cleanupWater}`,
} as const

export const PERSPECTIVE_PORTAL_LESSON_IDS = {
  prerequisiteA: `${PERSPECTIVE_PORTAL_PACK_ID}-lesson-prerequisite-a`,
  prerequisiteB: `${PERSPECTIVE_PORTAL_PACK_ID}-lesson-prerequisite-b`,
  guidedA: `${PERSPECTIVE_PORTAL_PACK_ID}-lesson-guided-a`,
  guidedB: `${PERSPECTIVE_PORTAL_PACK_ID}-lesson-guided-b`,
  checkpointA: `${PERSPECTIVE_PORTAL_PACK_ID}-lesson-checkpoint-a`,
  checkpointB: `${PERSPECTIVE_PORTAL_PACK_ID}-lesson-checkpoint-b`,
  checkpointC: `${PERSPECTIVE_PORTAL_PACK_ID}-lesson-checkpoint-c`,
} as const

export const PERSPECTIVE_PORTAL_BROAD_TAGS = [
  'character-perspective-identification',
  'different-character-perspectives',
] as const

export const PERSPECTIVE_PORTAL_DETAILED_TAGS = [
  'perspective-as-attitude',
  'shared-event-different-views',
  'perspective-from-words',
  'perspective-from-actions',
  'perspective-from-feelings',
  'perspective-from-choices',
  'perspective-from-noticing',
  'perspective-supported-by-details',
  'perspective-vs-narrator-point-of-view',
] as const

export const PERSPECTIVE_PORTAL_QUESTION_TAGS = [
  ...PERSPECTIVE_PORTAL_BROAD_TAGS,
  ...PERSPECTIVE_PORTAL_DETAILED_TAGS,
] as const

export const perspectivePortalQuestionId = (lessonKey: string, questionKey: string) =>
  `${PERSPECTIVE_PORTAL_PACK_ID}-${lessonKey}-${questionKey}`

export const perspectivePortalSupportTargetId = (passageKey: string, targetKey: string) =>
  `${PERSPECTIVE_PORTAL_PACK_ID}-${passageKey}-${targetKey}`

export const perspectivePortalSentenceId = (passageKey: string, sentenceNumber: number) =>
  `${PERSPECTIVE_PORTAL_PACK_ID}-passage-${passageKey}-sentence-${sentenceNumber}`
