const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

const createPassageIds = (
  key: string,
  sentenceCount: number,
  sectionCount: number,
  visualKind: 'graph' | 'map' | 'illustration',
) => ({
  passageId: `g2-id-purpose-${key}`,
  titleFeatureId: `g2-id-purpose-${key}-title`,
  headingFeatureIds: buildSeries(`g2-id-purpose-${key}-heading`, sectionCount),
  sentenceIds: buildSeries(`g2-id-purpose-${key}-sentence`, sentenceCount),
  captionFeatureId: `g2-id-purpose-${key}-caption`,
  visualFeatureId: `g2-id-purpose-${key}-${visualKind}`,
  glossaryFeatureId: `g2-id-purpose-${key}-glossary`,
  labelFeatureId: `g2-id-purpose-${key}-label`,
})

export const purposePathPackId = 'g2-information-detectives-purpose-path'
export const purposePathContentVersion = 'g2-id-purpose-r0.1.0'
export const purposePathWorldId = 'information-detectives'
export const purposePathUnitId = 'id-unit-3'
export const purposePathPrimarySkillId = 'g2-information-detectives-reading'

export const purposePathPassageIds = {
  rainGaugeReadings: createPassageIds('rain-gauge-readings', 8, 2, 'illustration'),
  nestBuilderNotes: createPassageIds('nest-builder-notes', 8, 2, 'illustration'),
  beePollenPath: createPassageIds('bee-pollen-path', 8, 2, 'graph'),
  trailMarkerSystem: createPassageIds('trail-marker-system', 10, 3, 'map'),
  shadeGardenStudy: createPassageIds('shade-garden-study', 10, 3, 'illustration'),
  recyclingSortStation: createPassageIds('recycling-sort-station', 10, 3, 'graph'),
  compostChangeNotes: createPassageIds('compost-change-notes', 10, 3, 'map'),
} as const

export const purposePathLessonIds = {
  prereqTopicPurposeDetail: 'lesson-purpose-topic-purpose-detail',
  prereqFindAuthorGoal: 'lesson-purpose-find-author-goal',
  guidedExplainWhatTryingToExplain: 'lesson-purpose-what-is-author-trying-to-explain',
  guidedUseWholeTextPurpose: 'lesson-purpose-use-whole-text-purpose',
  checkpointA: 'lesson-purpose-checkpoint-a',
  checkpointB: 'lesson-purpose-checkpoint-b',
  checkpointC: 'lesson-purpose-checkpoint-c',
} as const

export const purposePathQuestionIds = {
  prereqTopicPurposeDetail: buildSeries(`${purposePathLessonIds.prereqTopicPurposeDetail}-q`, 5),
  prereqFindAuthorGoal: buildSeries(`${purposePathLessonIds.prereqFindAuthorGoal}-q`, 5),
  guidedExplainWhatTryingToExplain: buildSeries(`${purposePathLessonIds.guidedExplainWhatTryingToExplain}-q`, 5),
  guidedUseWholeTextPurpose: buildSeries(`${purposePathLessonIds.guidedUseWholeTextPurpose}-q`, 5),
  checkpointA: buildSeries(`${purposePathLessonIds.checkpointA}-q`, 7),
  checkpointB: buildSeries(`${purposePathLessonIds.checkpointB}-q`, 7),
  checkpointC: buildSeries(`${purposePathLessonIds.checkpointC}-q`, 7),
} as const

export const purposePathSentenceIds = {
  rainGaugeReadings: purposePathPassageIds.rainGaugeReadings.sentenceIds,
  nestBuilderNotes: purposePathPassageIds.nestBuilderNotes.sentenceIds,
  beePollenPath: purposePathPassageIds.beePollenPath.sentenceIds,
  trailMarkerSystem: purposePathPassageIds.trailMarkerSystem.sentenceIds,
  shadeGardenStudy: purposePathPassageIds.shadeGardenStudy.sentenceIds,
  recyclingSortStation: purposePathPassageIds.recyclingSortStation.sentenceIds,
  compostChangeNotes: purposePathPassageIds.compostChangeNotes.sentenceIds,
} as const

export const purposePathFeatureIds = {
  rainGaugeReadings: {
    title: purposePathPassageIds.rainGaugeReadings.titleFeatureId,
    headingA: purposePathPassageIds.rainGaugeReadings.headingFeatureIds[0],
    headingB: purposePathPassageIds.rainGaugeReadings.headingFeatureIds[1],
    visual: purposePathPassageIds.rainGaugeReadings.visualFeatureId,
    caption: purposePathPassageIds.rainGaugeReadings.captionFeatureId,
    glossary: purposePathPassageIds.rainGaugeReadings.glossaryFeatureId,
    label: purposePathPassageIds.rainGaugeReadings.labelFeatureId,
  },
  nestBuilderNotes: {
    title: purposePathPassageIds.nestBuilderNotes.titleFeatureId,
    headingA: purposePathPassageIds.nestBuilderNotes.headingFeatureIds[0],
    headingB: purposePathPassageIds.nestBuilderNotes.headingFeatureIds[1],
    visual: purposePathPassageIds.nestBuilderNotes.visualFeatureId,
    caption: purposePathPassageIds.nestBuilderNotes.captionFeatureId,
    glossary: purposePathPassageIds.nestBuilderNotes.glossaryFeatureId,
    label: purposePathPassageIds.nestBuilderNotes.labelFeatureId,
  },
  beePollenPath: {
    title: purposePathPassageIds.beePollenPath.titleFeatureId,
    headingA: purposePathPassageIds.beePollenPath.headingFeatureIds[0],
    headingB: purposePathPassageIds.beePollenPath.headingFeatureIds[1],
    visual: purposePathPassageIds.beePollenPath.visualFeatureId,
    caption: purposePathPassageIds.beePollenPath.captionFeatureId,
    glossary: purposePathPassageIds.beePollenPath.glossaryFeatureId,
    label: purposePathPassageIds.beePollenPath.labelFeatureId,
  },
  trailMarkerSystem: {
    title: purposePathPassageIds.trailMarkerSystem.titleFeatureId,
    headingA: purposePathPassageIds.trailMarkerSystem.headingFeatureIds[0],
    headingB: purposePathPassageIds.trailMarkerSystem.headingFeatureIds[1],
    headingC: purposePathPassageIds.trailMarkerSystem.headingFeatureIds[2],
    visual: purposePathPassageIds.trailMarkerSystem.visualFeatureId,
    caption: purposePathPassageIds.trailMarkerSystem.captionFeatureId,
    glossary: purposePathPassageIds.trailMarkerSystem.glossaryFeatureId,
    label: purposePathPassageIds.trailMarkerSystem.labelFeatureId,
  },
  shadeGardenStudy: {
    title: purposePathPassageIds.shadeGardenStudy.titleFeatureId,
    headingA: purposePathPassageIds.shadeGardenStudy.headingFeatureIds[0],
    headingB: purposePathPassageIds.shadeGardenStudy.headingFeatureIds[1],
    headingC: purposePathPassageIds.shadeGardenStudy.headingFeatureIds[2],
    visual: purposePathPassageIds.shadeGardenStudy.visualFeatureId,
    caption: purposePathPassageIds.shadeGardenStudy.captionFeatureId,
    glossary: purposePathPassageIds.shadeGardenStudy.glossaryFeatureId,
    label: purposePathPassageIds.shadeGardenStudy.labelFeatureId,
  },
  recyclingSortStation: {
    title: purposePathPassageIds.recyclingSortStation.titleFeatureId,
    headingA: purposePathPassageIds.recyclingSortStation.headingFeatureIds[0],
    headingB: purposePathPassageIds.recyclingSortStation.headingFeatureIds[1],
    headingC: purposePathPassageIds.recyclingSortStation.headingFeatureIds[2],
    visual: purposePathPassageIds.recyclingSortStation.visualFeatureId,
    caption: purposePathPassageIds.recyclingSortStation.captionFeatureId,
    glossary: purposePathPassageIds.recyclingSortStation.glossaryFeatureId,
    label: purposePathPassageIds.recyclingSortStation.labelFeatureId,
  },
  compostChangeNotes: {
    title: purposePathPassageIds.compostChangeNotes.titleFeatureId,
    headingA: purposePathPassageIds.compostChangeNotes.headingFeatureIds[0],
    headingB: purposePathPassageIds.compostChangeNotes.headingFeatureIds[1],
    headingC: purposePathPassageIds.compostChangeNotes.headingFeatureIds[2],
    visual: purposePathPassageIds.compostChangeNotes.visualFeatureId,
    caption: purposePathPassageIds.compostChangeNotes.captionFeatureId,
    glossary: purposePathPassageIds.compostChangeNotes.glossaryFeatureId,
    label: purposePathPassageIds.compostChangeNotes.labelFeatureId,
  },
} as const




