export const RHYME_ROUTES_PACK_ID = 'g2-poetry-planet-rhyme-routes'
export const RHYME_ROUTES_PACK_TITLE = 'Grade 2 Poetry Planet: Rhyme Routes'
export const RHYME_ROUTES_CONTENT_VERSION = 'g2-pp-rhyme-routes-r0.1.0'

export const RHYME_ROUTES_POEM_KEYS = {
  kiteDay: 'kite-day',
  gardenCare: 'garden-care',
  recycleSpin: 'recycle-spin',
  bridgeTool: 'bridge-tool',
  helpGate: 'help-gate',
  weatherNotes: 'weather-notes',
  stagePage: 'stage-page',
} as const

export const RHYME_ROUTES_LESSON_KEYS = {
  buildingBlockA: 'building-block-a',
  buildingBlockB: 'building-block-b',
  guidedA: 'guided-a',
  guidedB: 'guided-b',
  checkpointA: 'checkpoint-a',
  checkpointB: 'checkpoint-b',
  checkpointC: 'checkpoint-c',
} as const

export const poetryPassageId = (poemKey: string) => `${RHYME_ROUTES_PACK_ID}-passage-${poemKey}`

export const poetryLineId = (poemKey: string, lineNumber: number) =>
  `${RHYME_ROUTES_PACK_ID}-passage-${poemKey}-line-${lineNumber}`

export const poetryStanzaId = (poemKey: string, stanzaNumber: number) =>
  `${RHYME_ROUTES_PACK_ID}-passage-${poemKey}-stanza-${stanzaNumber}`

export const poetrySupportTargetId = (poemKey: string, targetKey: string) =>
  `${RHYME_ROUTES_PACK_ID}-passage-${poemKey}-support-${targetKey}`

export const poetryLessonId = (lessonKey: string) => `${RHYME_ROUTES_PACK_ID}-lesson-${lessonKey}`

export const poetryQuestionId = (lessonKey: string, questionKey: string) =>
  `${RHYME_ROUTES_PACK_ID}-lesson-${lessonKey}-question-${questionKey}`
