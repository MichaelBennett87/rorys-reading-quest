const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

const createPassageIds = (
  key: string,
  sentenceCount: number,
  sectionCount: number,
  visualKind: 'graph' | 'map' | 'illustration',
) => ({
  passageId: `g2-id-opinion-${key}`,
  titleFeatureId: `g2-id-opinion-${key}-title`,
  headingFeatureIds: buildSeries(`g2-id-opinion-${key}-heading`, sectionCount),
  sentenceIds: buildSeries(`g2-id-opinion-${key}-sentence`, sentenceCount),
  captionFeatureId: `g2-id-opinion-${key}-caption`,
  visualFeatureId: `g2-id-opinion-${key}-${visualKind}`,
  glossaryFeatureId: `g2-id-opinion-${key}-glossary`,
})

export const opinionEvidenceDeskPackId = 'g2-information-detectives-opinion-evidence-desk'
export const opinionEvidenceDeskContentVersion = 'g2-id-opinion-evidence-r0.1.0'
export const opinionEvidenceDeskWorldId = 'information-detectives'
export const opinionEvidenceDeskUnitId = 'id-unit-4'
export const opinionEvidenceDeskPrimarySkillId = 'g2-information-detectives-reading'

export const opinionEvidenceDeskPassageIds = {
  shadedRestSpots: createPassageIds('shaded-rest-spots', 8, 2, 'graph'),
  nativeFlowerBeds: createPassageIds('native-flower-beds', 8, 2, 'illustration'),
  clearTrailSymbols: createPassageIds('clear-trail-symbols', 8, 2, 'map'),
  reusableContainers: createPassageIds('reusable-containers', 8, 2, 'illustration'),
  birdFriendlyPlants: createPassageIds('bird-friendly-plants', 10, 3, 'graph'),
  compostSortingSigns: createPassageIds('compost-sorting-signs', 10, 3, 'illustration'),
  rainBarrelPlan: createPassageIds('rain-barrel-plan', 10, 3, 'map'),
} as const

export const opinionEvidenceDeskLessonIds = {
  prereqFactOpinionTopic: 'lesson-opinion-fact-opinion-topic',
  prereqMatchEvidence: 'lesson-opinion-match-evidence',
  guidedFindOpinion: 'lesson-opinion-find-the-author-opinion',
  guidedChooseStrongestEvidence: 'lesson-opinion-choose-strongest-evidence',
  checkpointA: 'lesson-opinion-checkpoint-a',
  checkpointB: 'lesson-opinion-checkpoint-b',
  checkpointC: 'lesson-opinion-checkpoint-c',
} as const

export const opinionEvidenceDeskQuestionIds = {
  prereqFactOpinionTopic: buildSeries(`${opinionEvidenceDeskLessonIds.prereqFactOpinionTopic}-q`, 5),
  prereqMatchEvidence: buildSeries(`${opinionEvidenceDeskLessonIds.prereqMatchEvidence}-q`, 5),
  guidedFindOpinion: buildSeries(`${opinionEvidenceDeskLessonIds.guidedFindOpinion}-q`, 5),
  guidedChooseStrongestEvidence: buildSeries(`${opinionEvidenceDeskLessonIds.guidedChooseStrongestEvidence}-q`, 5),
  checkpointA: buildSeries(`${opinionEvidenceDeskLessonIds.checkpointA}-q`, 7),
  checkpointB: buildSeries(`${opinionEvidenceDeskLessonIds.checkpointB}-q`, 7),
  checkpointC: buildSeries(`${opinionEvidenceDeskLessonIds.checkpointC}-q`, 7),
} as const

export const opinionEvidenceDeskSentenceIds = {
  shadedRestSpots: opinionEvidenceDeskPassageIds.shadedRestSpots.sentenceIds,
  nativeFlowerBeds: opinionEvidenceDeskPassageIds.nativeFlowerBeds.sentenceIds,
  clearTrailSymbols: opinionEvidenceDeskPassageIds.clearTrailSymbols.sentenceIds,
  reusableContainers: opinionEvidenceDeskPassageIds.reusableContainers.sentenceIds,
  birdFriendlyPlants: opinionEvidenceDeskPassageIds.birdFriendlyPlants.sentenceIds,
  compostSortingSigns: opinionEvidenceDeskPassageIds.compostSortingSigns.sentenceIds,
  rainBarrelPlan: opinionEvidenceDeskPassageIds.rainBarrelPlan.sentenceIds,
} as const

export const opinionEvidenceDeskFeatureIds = {
  shadedRestSpots: {
    title: opinionEvidenceDeskPassageIds.shadedRestSpots.titleFeatureId,
    headingA: opinionEvidenceDeskPassageIds.shadedRestSpots.headingFeatureIds[0],
    headingB: opinionEvidenceDeskPassageIds.shadedRestSpots.headingFeatureIds[1],
    visual: opinionEvidenceDeskPassageIds.shadedRestSpots.visualFeatureId,
    caption: opinionEvidenceDeskPassageIds.shadedRestSpots.captionFeatureId,
  },
  nativeFlowerBeds: {
    title: opinionEvidenceDeskPassageIds.nativeFlowerBeds.titleFeatureId,
    headingA: opinionEvidenceDeskPassageIds.nativeFlowerBeds.headingFeatureIds[0],
    headingB: opinionEvidenceDeskPassageIds.nativeFlowerBeds.headingFeatureIds[1],
    visual: opinionEvidenceDeskPassageIds.nativeFlowerBeds.visualFeatureId,
    caption: opinionEvidenceDeskPassageIds.nativeFlowerBeds.captionFeatureId,
  },
  clearTrailSymbols: {
    title: opinionEvidenceDeskPassageIds.clearTrailSymbols.titleFeatureId,
    headingA: opinionEvidenceDeskPassageIds.clearTrailSymbols.headingFeatureIds[0],
    headingB: opinionEvidenceDeskPassageIds.clearTrailSymbols.headingFeatureIds[1],
    visual: opinionEvidenceDeskPassageIds.clearTrailSymbols.visualFeatureId,
    caption: opinionEvidenceDeskPassageIds.clearTrailSymbols.captionFeatureId,
  },
  reusableContainers: {
    title: opinionEvidenceDeskPassageIds.reusableContainers.titleFeatureId,
    headingA: opinionEvidenceDeskPassageIds.reusableContainers.headingFeatureIds[0],
    headingB: opinionEvidenceDeskPassageIds.reusableContainers.headingFeatureIds[1],
    visual: opinionEvidenceDeskPassageIds.reusableContainers.visualFeatureId,
    caption: opinionEvidenceDeskPassageIds.reusableContainers.captionFeatureId,
    glossary: opinionEvidenceDeskPassageIds.reusableContainers.glossaryFeatureId,
  },
  birdFriendlyPlants: {
    title: opinionEvidenceDeskPassageIds.birdFriendlyPlants.titleFeatureId,
    headingA: opinionEvidenceDeskPassageIds.birdFriendlyPlants.headingFeatureIds[0],
    headingB: opinionEvidenceDeskPassageIds.birdFriendlyPlants.headingFeatureIds[1],
    headingC: opinionEvidenceDeskPassageIds.birdFriendlyPlants.headingFeatureIds[2],
    visual: opinionEvidenceDeskPassageIds.birdFriendlyPlants.visualFeatureId,
    caption: opinionEvidenceDeskPassageIds.birdFriendlyPlants.captionFeatureId,
  },
  compostSortingSigns: {
    title: opinionEvidenceDeskPassageIds.compostSortingSigns.titleFeatureId,
    headingA: opinionEvidenceDeskPassageIds.compostSortingSigns.headingFeatureIds[0],
    headingB: opinionEvidenceDeskPassageIds.compostSortingSigns.headingFeatureIds[1],
    headingC: opinionEvidenceDeskPassageIds.compostSortingSigns.headingFeatureIds[2],
    visual: opinionEvidenceDeskPassageIds.compostSortingSigns.visualFeatureId,
    caption: opinionEvidenceDeskPassageIds.compostSortingSigns.captionFeatureId,
  },
  rainBarrelPlan: {
    title: opinionEvidenceDeskPassageIds.rainBarrelPlan.titleFeatureId,
    headingA: opinionEvidenceDeskPassageIds.rainBarrelPlan.headingFeatureIds[0],
    headingB: opinionEvidenceDeskPassageIds.rainBarrelPlan.headingFeatureIds[1],
    headingC: opinionEvidenceDeskPassageIds.rainBarrelPlan.headingFeatureIds[2],
    visual: opinionEvidenceDeskPassageIds.rainBarrelPlan.visualFeatureId,
    caption: opinionEvidenceDeskPassageIds.rainBarrelPlan.captionFeatureId,
  },
} as const
