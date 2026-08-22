export const TEXT_FEATURE_HUNT_PACK_ID = 'g2-information-detectives-text-feature-hunt'
export const TEXT_FEATURE_HUNT_PACK_TITLE = 'Grade 2 Information Detectives: Text Feature Hunt'
export const TEXT_FEATURE_HUNT_CONTENT_VERSION = 'g2-id-text-features-r0.1.0'

export const TEXT_FEATURE_HUNT_PASSAGE_KEYS = {
  feederWatch: 'feeder-watch',
  gardenGrid: 'garden-grid',
  rainGauge: 'rain-gauge',
  trailMap: 'trail-map',
  moonNotes: 'moon-notes',
  recycleSort: 'recycle-sort',
  compostChange: 'compost-change',
} as const

export const TEXT_FEATURE_HUNT_PASSAGE_IDS = Object.fromEntries(
  Object.entries(TEXT_FEATURE_HUNT_PASSAGE_KEYS).map(([key, value]) => [key, `${TEXT_FEATURE_HUNT_PACK_ID}-passage-${value}`]),
) as Record<keyof typeof TEXT_FEATURE_HUNT_PASSAGE_KEYS, string>

export const TEXT_FEATURE_HUNT_LESSON_IDS = {
  buildingBlockA: `${TEXT_FEATURE_HUNT_PACK_ID}-lesson-building-block-a`,
  buildingBlockB: `${TEXT_FEATURE_HUNT_PACK_ID}-lesson-building-block-b`,
  guidedA: `${TEXT_FEATURE_HUNT_PACK_ID}-lesson-guided-a`,
  guidedB: `${TEXT_FEATURE_HUNT_PACK_ID}-lesson-guided-b`,
  checkpointA: `${TEXT_FEATURE_HUNT_PACK_ID}-lesson-checkpoint-a`,
  checkpointB: `${TEXT_FEATURE_HUNT_PACK_ID}-lesson-checkpoint-b`,
  checkpointC: `${TEXT_FEATURE_HUNT_PACK_ID}-lesson-checkpoint-c`,
} as const

export const TEXT_FEATURE_HUNT_SUPPORT_TARGET_IDS = {
  feederWatch: {
    sentence1: `${TEXT_FEATURE_HUNT_PACK_ID}-support-feeder-watch-1`,
    sentence2: `${TEXT_FEATURE_HUNT_PACK_ID}-support-feeder-watch-2`,
    sentence3: `${TEXT_FEATURE_HUNT_PACK_ID}-support-feeder-watch-3`,
    sentence4: `${TEXT_FEATURE_HUNT_PACK_ID}-support-feeder-watch-4`,
  },
  gardenGrid: {
    sentence1: `${TEXT_FEATURE_HUNT_PACK_ID}-support-garden-grid-1`,
    sentence2: `${TEXT_FEATURE_HUNT_PACK_ID}-support-garden-grid-2`,
    sentence3: `${TEXT_FEATURE_HUNT_PACK_ID}-support-garden-grid-3`,
    sentence4: `${TEXT_FEATURE_HUNT_PACK_ID}-support-garden-grid-4`,
  },
  rainGauge: {
    sentence1: `${TEXT_FEATURE_HUNT_PACK_ID}-support-rain-gauge-1`,
    sentence2: `${TEXT_FEATURE_HUNT_PACK_ID}-support-rain-gauge-2`,
    sentence3: `${TEXT_FEATURE_HUNT_PACK_ID}-support-rain-gauge-3`,
    sentence4: `${TEXT_FEATURE_HUNT_PACK_ID}-support-rain-gauge-4`,
  },
  trailMap: {
    sentence1: `${TEXT_FEATURE_HUNT_PACK_ID}-support-trail-map-1`,
    sentence2: `${TEXT_FEATURE_HUNT_PACK_ID}-support-trail-map-2`,
    sentence3: `${TEXT_FEATURE_HUNT_PACK_ID}-support-trail-map-3`,
    sentence4: `${TEXT_FEATURE_HUNT_PACK_ID}-support-trail-map-4`,
  },
  moonNotes: {
    sentence1: `${TEXT_FEATURE_HUNT_PACK_ID}-support-moon-notes-1`,
    sentence2: `${TEXT_FEATURE_HUNT_PACK_ID}-support-moon-notes-2`,
    sentence3: `${TEXT_FEATURE_HUNT_PACK_ID}-support-moon-notes-3`,
    sentence4: `${TEXT_FEATURE_HUNT_PACK_ID}-support-moon-notes-4`,
  },
  recycleSort: {
    sentence1: `${TEXT_FEATURE_HUNT_PACK_ID}-support-recycle-sort-1`,
    sentence2: `${TEXT_FEATURE_HUNT_PACK_ID}-support-recycle-sort-2`,
    sentence3: `${TEXT_FEATURE_HUNT_PACK_ID}-support-recycle-sort-3`,
    sentence4: `${TEXT_FEATURE_HUNT_PACK_ID}-support-recycle-sort-4`,
  },
  compostChange: {
    sentence1: `${TEXT_FEATURE_HUNT_PACK_ID}-support-compost-change-1`,
    sentence2: `${TEXT_FEATURE_HUNT_PACK_ID}-support-compost-change-2`,
    sentence3: `${TEXT_FEATURE_HUNT_PACK_ID}-support-compost-change-3`,
    sentence4: `${TEXT_FEATURE_HUNT_PACK_ID}-support-compost-change-4`,
  },
} as const

export const TEXT_FEATURE_HUNT_PASSAGE_SECTION_IDS = {
  feederWatch: { count: `${TEXT_FEATURE_HUNT_PACK_ID}-section-feeder-watch-count`, meaning: `${TEXT_FEATURE_HUNT_PACK_ID}-section-feeder-watch-meaning` },
  gardenGrid: { map: `${TEXT_FEATURE_HUNT_PACK_ID}-section-garden-grid-map`, word: `${TEXT_FEATURE_HUNT_PACK_ID}-section-garden-grid-word` },
  rainGauge: { graph: `${TEXT_FEATURE_HUNT_PACK_ID}-section-rain-gauge-graph`, glossary: `${TEXT_FEATURE_HUNT_PACK_ID}-section-rain-gauge-glossary` },
  trailMap: { map: `${TEXT_FEATURE_HUNT_PACK_ID}-section-trail-map-map`, illustration: `${TEXT_FEATURE_HUNT_PACK_ID}-section-trail-map-illustration` },
  moonNotes: { graph: `${TEXT_FEATURE_HUNT_PACK_ID}-section-moon-notes-graph`, glossary: `${TEXT_FEATURE_HUNT_PACK_ID}-section-moon-notes-glossary` },
  recycleSort: { graph: `${TEXT_FEATURE_HUNT_PACK_ID}-section-recycle-sort-graph`, illustration: `${TEXT_FEATURE_HUNT_PACK_ID}-section-recycle-sort-illustration` },
  compostChange: { map: `${TEXT_FEATURE_HUNT_PACK_ID}-section-compost-change-map`, illustration: `${TEXT_FEATURE_HUNT_PACK_ID}-section-compost-change-illustration` },
} as const

export const TEXT_FEATURE_HUNT_FEATURE_IDS = {
  feederWatch: {
    title: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-feeder-watch-title`,
    headingCount: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-feeder-watch-heading-count`,
    graph: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-feeder-watch-graph`,
    caption: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-feeder-watch-caption`,
    headingMeaning: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-feeder-watch-heading-meaning`,
    glossary: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-feeder-watch-glossary`,
  },
  gardenGrid: {
    title: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-garden-grid-title`,
    headingMap: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-garden-grid-heading-map`,
    map: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-garden-grid-map`,
    caption: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-garden-grid-caption`,
    headingWord: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-garden-grid-heading-word`,
    illustration: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-garden-grid-illustration`,
  },
  rainGauge: {
    title: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-rain-gauge-title`,
    headingGraph: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-rain-gauge-heading-graph`,
    graph: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-rain-gauge-graph`,
    caption: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-rain-gauge-caption`,
    headingGlossary: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-rain-gauge-heading-glossary`,
    glossary: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-rain-gauge-glossary`,
  },
  trailMap: {
    title: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-trail-map-title`,
    headingMap: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-trail-map-heading-map`,
    map: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-trail-map-map`,
    caption: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-trail-map-caption`,
    headingIllustration: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-trail-map-heading-illustration`,
    illustration: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-trail-map-illustration`,
  },
  moonNotes: {
    title: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-moon-notes-title`,
    headingGraph: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-moon-notes-heading-graph`,
    graph: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-moon-notes-graph`,
    caption: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-moon-notes-caption`,
    headingGlossary: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-moon-notes-heading-glossary`,
    glossary: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-moon-notes-glossary`,
  },
  recycleSort: {
    title: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-recycle-sort-title`,
    headingGraph: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-recycle-sort-heading-graph`,
    graph: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-recycle-sort-graph`,
    caption: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-recycle-sort-caption`,
    headingIllustration: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-recycle-sort-heading-illustration`,
    illustration: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-recycle-sort-illustration`,
  },
  compostChange: {
    title: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-compost-change-title`,
    headingMap: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-compost-change-heading-map`,
    map: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-compost-change-map`,
    caption: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-compost-change-caption`,
    headingIllustration: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-compost-change-heading-illustration`,
    illustration: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-compost-change-illustration`,
    glossary: `${TEXT_FEATURE_HUNT_PACK_ID}-feature-compost-change-glossary`,
  },
} as const

export const TEXT_FEATURE_HUNT_QUESTION_TAGS = {
  broad: ['informational-text-features', 'feature-meaning'] as const,
  detailed: [
    'title-contribution',
    'heading-contribution',
    'caption-contribution',
    'graph-contribution',
    'map-contribution',
    'glossary-contribution',
    'illustration-contribution',
    'feature-body-connection',
    'feature-selection-for-purpose',
  ] as const,
} as const

export const textFeatureHuntQuestionId = (lessonKey: string, questionKey: string) =>
  `${TEXT_FEATURE_HUNT_PACK_ID}-${lessonKey}-${questionKey}`

export const textFeatureHuntSupportTargetId = (passageKey: string, targetKey: string) =>
  `${TEXT_FEATURE_HUNT_PACK_ID}-${passageKey}-${targetKey}`

export const textFeatureHuntSentenceId = (passageKey: string, sentenceNumber: number) =>
  `${TEXT_FEATURE_HUNT_PACK_ID}-passage-${passageKey}-sentence-${sentenceNumber}`
