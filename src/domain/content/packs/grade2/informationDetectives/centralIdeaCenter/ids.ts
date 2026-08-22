const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

const createPassageIds = (key: string, sentenceCount: number, sectionCount: number, visualKind: 'graph' | 'map' | 'illustration') => ({
  passageId: `g2-id-central-idea-${key}`,
  titleFeatureId: `g2-id-central-idea-${key}-title`,
  headingFeatureIds: buildSeries(`g2-id-central-idea-${key}-heading`, sectionCount),
  sentenceIds: buildSeries(`g2-id-central-idea-${key}-sentence`, sentenceCount),
  captionFeatureId: `g2-id-central-idea-${key}-caption`,
  visualFeatureId: `g2-id-central-idea-${key}-${visualKind}`,
  glossaryFeatureId: `g2-id-central-idea-${key}-glossary`,
  labelFeatureId: `g2-id-central-idea-${key}-label`,
})

export const centralIdeaCenterPackId = 'g2-information-detectives-central-idea-center'
export const centralIdeaCenterContentVersion = 'g2-id-central-idea-r0.1.0'
export const centralIdeaCenterWorldId = 'information-detectives'
export const centralIdeaCenterUnitId = 'id-unit-2'
export const centralIdeaCenterPrimarySkillId = 'g2-information-detectives-reading'

export const centralIdeaCenterPassageIds = {
  rainGardenHelpers: createPassageIds('rain-garden-helpers', 8, 2, 'illustration'),
  quietShelterSpaces: createPassageIds('quiet-shelter-spaces', 8, 2, 'map'),
  pollinatorPatchCounts: createPassageIds('pollinator-patch-counts', 8, 2, 'graph'),
  weatherStationNotes: createPassageIds('weather-station-notes', 8, 2, 'illustration'),
  seedTravelRoutes: createPassageIds('seed-travel-routes', 10, 3, 'map'),
  compostChangeStory: createPassageIds('compost-change-story', 10, 3, 'graph'),
  trailMarkersGuideTheWay: createPassageIds('trail-markers-guide-the-way', 10, 3, 'illustration'),
} as const

export const centralIdeaCenterLessonIds = {
  prereqTopicVsCentralIdea: 'lesson-central-idea-topic-vs-central-idea',
  prereqFindMostRelevantDetails: 'lesson-central-idea-find-most-relevant-details',
  guidedAcrossSections: 'lesson-central-idea-across-sections',
  guidedPutImportantDetailsTogether: 'lesson-central-idea-put-important-details-together',
  checkpointA: 'lesson-central-idea-checkpoint-a',
  checkpointB: 'lesson-central-idea-checkpoint-b',
  checkpointC: 'lesson-central-idea-checkpoint-c',
} as const

export const centralIdeaCenterQuestionIds = {
  prereqTopicVsCentralIdea: buildSeries(`${centralIdeaCenterLessonIds.prereqTopicVsCentralIdea}-q`, 5),
  prereqFindMostRelevantDetails: buildSeries(`${centralIdeaCenterLessonIds.prereqFindMostRelevantDetails}-q`, 5),
  guidedAcrossSections: buildSeries(`${centralIdeaCenterLessonIds.guidedAcrossSections}-q`, 5),
  guidedPutImportantDetailsTogether: buildSeries(`${centralIdeaCenterLessonIds.guidedPutImportantDetailsTogether}-q`, 5),
  checkpointA: buildSeries(`${centralIdeaCenterLessonIds.checkpointA}-q`, 7),
  checkpointB: buildSeries(`${centralIdeaCenterLessonIds.checkpointB}-q`, 7),
  checkpointC: buildSeries(`${centralIdeaCenterLessonIds.checkpointC}-q`, 7),
} as const

export const centralIdeaCenterSentenceIds = {
  rainGardenHelpers: centralIdeaCenterPassageIds.rainGardenHelpers.sentenceIds,
  quietShelterSpaces: centralIdeaCenterPassageIds.quietShelterSpaces.sentenceIds,
  pollinatorPatchCounts: centralIdeaCenterPassageIds.pollinatorPatchCounts.sentenceIds,
  weatherStationNotes: centralIdeaCenterPassageIds.weatherStationNotes.sentenceIds,
  seedTravelRoutes: centralIdeaCenterPassageIds.seedTravelRoutes.sentenceIds,
  compostChangeStory: centralIdeaCenterPassageIds.compostChangeStory.sentenceIds,
  trailMarkersGuideTheWay: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.sentenceIds,
} as const

export const centralIdeaCenterFeatureIds = {
  rainGardenHelpers: {
    title: centralIdeaCenterPassageIds.rainGardenHelpers.titleFeatureId,
    headingA: centralIdeaCenterPassageIds.rainGardenHelpers.headingFeatureIds[0],
    headingB: centralIdeaCenterPassageIds.rainGardenHelpers.headingFeatureIds[1],
    visual: centralIdeaCenterPassageIds.rainGardenHelpers.visualFeatureId,
    caption: centralIdeaCenterPassageIds.rainGardenHelpers.captionFeatureId,
    glossary: centralIdeaCenterPassageIds.rainGardenHelpers.glossaryFeatureId,
    label: centralIdeaCenterPassageIds.rainGardenHelpers.labelFeatureId,
  },
  quietShelterSpaces: {
    title: centralIdeaCenterPassageIds.quietShelterSpaces.titleFeatureId,
    headingA: centralIdeaCenterPassageIds.quietShelterSpaces.headingFeatureIds[0],
    headingB: centralIdeaCenterPassageIds.quietShelterSpaces.headingFeatureIds[1],
    visual: centralIdeaCenterPassageIds.quietShelterSpaces.visualFeatureId,
    caption: centralIdeaCenterPassageIds.quietShelterSpaces.captionFeatureId,
    glossary: centralIdeaCenterPassageIds.quietShelterSpaces.glossaryFeatureId,
    label: centralIdeaCenterPassageIds.quietShelterSpaces.labelFeatureId,
  },
  pollinatorPatchCounts: {
    title: centralIdeaCenterPassageIds.pollinatorPatchCounts.titleFeatureId,
    headingA: centralIdeaCenterPassageIds.pollinatorPatchCounts.headingFeatureIds[0],
    headingB: centralIdeaCenterPassageIds.pollinatorPatchCounts.headingFeatureIds[1],
    visual: centralIdeaCenterPassageIds.pollinatorPatchCounts.visualFeatureId,
    caption: centralIdeaCenterPassageIds.pollinatorPatchCounts.captionFeatureId,
    glossary: centralIdeaCenterPassageIds.pollinatorPatchCounts.glossaryFeatureId,
    label: centralIdeaCenterPassageIds.pollinatorPatchCounts.labelFeatureId,
  },
  weatherStationNotes: {
    title: centralIdeaCenterPassageIds.weatherStationNotes.titleFeatureId,
    headingA: centralIdeaCenterPassageIds.weatherStationNotes.headingFeatureIds[0],
    headingB: centralIdeaCenterPassageIds.weatherStationNotes.headingFeatureIds[1],
    visual: centralIdeaCenterPassageIds.weatherStationNotes.visualFeatureId,
    caption: centralIdeaCenterPassageIds.weatherStationNotes.captionFeatureId,
    glossary: centralIdeaCenterPassageIds.weatherStationNotes.glossaryFeatureId,
    label: centralIdeaCenterPassageIds.weatherStationNotes.labelFeatureId,
  },
  seedTravelRoutes: {
    title: centralIdeaCenterPassageIds.seedTravelRoutes.titleFeatureId,
    headingA: centralIdeaCenterPassageIds.seedTravelRoutes.headingFeatureIds[0],
    headingB: centralIdeaCenterPassageIds.seedTravelRoutes.headingFeatureIds[1],
    headingC: centralIdeaCenterPassageIds.seedTravelRoutes.headingFeatureIds[2],
    visual: centralIdeaCenterPassageIds.seedTravelRoutes.visualFeatureId,
    caption: centralIdeaCenterPassageIds.seedTravelRoutes.captionFeatureId,
    glossary: centralIdeaCenterPassageIds.seedTravelRoutes.glossaryFeatureId,
    label: centralIdeaCenterPassageIds.seedTravelRoutes.labelFeatureId,
  },
  compostChangeStory: {
    title: centralIdeaCenterPassageIds.compostChangeStory.titleFeatureId,
    headingA: centralIdeaCenterPassageIds.compostChangeStory.headingFeatureIds[0],
    headingB: centralIdeaCenterPassageIds.compostChangeStory.headingFeatureIds[1],
    headingC: centralIdeaCenterPassageIds.compostChangeStory.headingFeatureIds[2],
    visual: centralIdeaCenterPassageIds.compostChangeStory.visualFeatureId,
    caption: centralIdeaCenterPassageIds.compostChangeStory.captionFeatureId,
    glossary: centralIdeaCenterPassageIds.compostChangeStory.glossaryFeatureId,
    label: centralIdeaCenterPassageIds.compostChangeStory.labelFeatureId,
  },
  trailMarkersGuideTheWay: {
    title: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.titleFeatureId,
    headingA: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.headingFeatureIds[0],
    headingB: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.headingFeatureIds[1],
    headingC: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.headingFeatureIds[2],
    visual: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.visualFeatureId,
    caption: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.captionFeatureId,
    glossary: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.glossaryFeatureId,
    label: centralIdeaCenterPassageIds.trailMarkersGuideTheWay.labelFeatureId,
  },
} as const
