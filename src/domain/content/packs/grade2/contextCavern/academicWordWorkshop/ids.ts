const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

const createPassageIds = (key: string, sentenceCount: number, sectionCount: number) => ({
  passageId: `g2-cc-aww-${key}`,
  titleFeatureId: `g2-cc-aww-${key}-title`,
  headingFeatureIds: buildSeries(`g2-cc-aww-${key}-heading`, sectionCount),
  sentenceIds: buildSeries(`g2-cc-aww-${key}-sentence`, sentenceCount),
})

export const contextCavernAcademicWordWorkshopPackId = 'g2-context-cavern-academic-word-workshop'
export const contextCavernAcademicWordWorkshopContentVersion = 'g2-cc-academic-word-r0.1.0'
export const contextCavernAcademicWordWorkshopWorldId = 'context-cavern'
export const contextCavernAcademicWordWorkshopUnitId = 'cc-unit-1'
export const contextCavernAcademicWordWorkshopPrimarySkillId = 'g2-context-cavern-vocabulary'

export const contextCavernAcademicWordWorkshopPassageIds = {
  weatherCharts: createPassageIds('weather-charts', 8, 2),
  researchNotes: createPassageIds('research-notes', 8, 2),
  gardenJournal: createPassageIds('garden-journal', 8, 2),
  plantReport: createPassageIds('plant-report', 8, 2),
  libraryPreview: createPassageIds('library-preview', 8, 2),
  natureWalk: createPassageIds('nature-walk', 8, 2),
  sortingGuide: createPassageIds('sorting-guide', 8, 2),
} as const

export const contextCavernAcademicWordWorkshopLessonIds = {
  prereqCompareDescribe: 'lesson-cc-aww-prereq-compare-describe',
  prereqExplainRecord: 'lesson-cc-aww-prereq-explain-record',
  guidedIdentifyMeasure: 'lesson-cc-aww-guided-identify-measure',
  guidedObservePredict: 'lesson-cc-aww-guided-observe-predict',
  checkpointA: 'lesson-cc-aww-checkpoint-a',
  checkpointB: 'lesson-cc-aww-checkpoint-b',
  checkpointC: 'lesson-cc-aww-checkpoint-c',
} as const

export const contextCavernAcademicWordWorkshopQuestionIds = {
  prereqCompareDescribe: buildSeries(`${contextCavernAcademicWordWorkshopLessonIds.prereqCompareDescribe}-q`, 5),
  prereqExplainRecord: buildSeries(`${contextCavernAcademicWordWorkshopLessonIds.prereqExplainRecord}-q`, 5),
  guidedIdentifyMeasure: buildSeries(`${contextCavernAcademicWordWorkshopLessonIds.guidedIdentifyMeasure}-q`, 5),
  guidedObservePredict: buildSeries(`${contextCavernAcademicWordWorkshopLessonIds.guidedObservePredict}-q`, 5),
  checkpointA: buildSeries(`${contextCavernAcademicWordWorkshopLessonIds.checkpointA}-q`, 7),
  checkpointB: buildSeries(`${contextCavernAcademicWordWorkshopLessonIds.checkpointB}-q`, 7),
  checkpointC: buildSeries(`${contextCavernAcademicWordWorkshopLessonIds.checkpointC}-q`, 7),
} as const

export const contextCavernAcademicWordWorkshopSentenceIds = {
  weatherCharts: contextCavernAcademicWordWorkshopPassageIds.weatherCharts.sentenceIds,
  researchNotes: contextCavernAcademicWordWorkshopPassageIds.researchNotes.sentenceIds,
  gardenJournal: contextCavernAcademicWordWorkshopPassageIds.gardenJournal.sentenceIds,
  plantReport: contextCavernAcademicWordWorkshopPassageIds.plantReport.sentenceIds,
  libraryPreview: contextCavernAcademicWordWorkshopPassageIds.libraryPreview.sentenceIds,
  natureWalk: contextCavernAcademicWordWorkshopPassageIds.natureWalk.sentenceIds,
  sortingGuide: contextCavernAcademicWordWorkshopPassageIds.sortingGuide.sentenceIds,
} as const
