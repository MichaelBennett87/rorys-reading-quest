const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

export const grade3AcademicWordWorkshopPackId = 'g3-context-cavern-academic-word-workshop'
export const grade3AcademicWordWorkshopContentVersion = 'g3-cc-academic-word-r0.1.0'
export const grade3AcademicWordWorkshopWorldId = 'context-cavern'
export const grade3AcademicWordWorkshopUnitId = 'g3-cc-unit-1'
export const grade3AcademicWordWorkshopPrimarySkillId = 'g3-context-cavern-vocabulary'

export const grade3AcademicWordWorkshopPassageIds = {
  scienceInvestigation: 'g3-cc-aww-science-investigation',
  mathematicsModel: 'g3-cc-aww-mathematics-model',
  readingDiscussion: 'g3-cc-aww-reading-discussion',
  writingRevision: 'g3-cc-aww-writing-revision',
  engineeringInvestigation: 'g3-cc-aww-engineering-investigation',
  sourceDiscussion: 'g3-cc-aww-source-discussion',
  projectPresentation: 'g3-cc-aww-project-presentation',
} as const

export const grade3AcademicWordWorkshopLessonIds = {
  wordsForSchoolThinking: 'lesson-g3-cc-aww-words-for-school-thinking',
  chooseThePreciseWord: 'lesson-g3-cc-aww-choose-the-precise-word',
  explainAndSupport: 'lesson-g3-cc-aww-explain-and-support',
  organizeAndRevise: 'lesson-g3-cc-aww-organize-and-revise',
  scienceAndMathCheckpoint: 'lesson-g3-cc-aww-science-and-math-checkpoint',
  readingAndWritingCheckpoint: 'lesson-g3-cc-aww-reading-and-writing-checkpoint',
  acrossSubjectsCheckpoint: 'lesson-g3-cc-aww-across-subjects-checkpoint',
} as const

export const grade3AcademicWordWorkshopQuestionIds = {
  wordsForSchoolThinking: buildSeries(`${grade3AcademicWordWorkshopLessonIds.wordsForSchoolThinking}-q`, 5),
  chooseThePreciseWord: buildSeries(`${grade3AcademicWordWorkshopLessonIds.chooseThePreciseWord}-q`, 5),
  explainAndSupport: buildSeries(`${grade3AcademicWordWorkshopLessonIds.explainAndSupport}-q`, 5),
  organizeAndRevise: buildSeries(`${grade3AcademicWordWorkshopLessonIds.organizeAndRevise}-q`, 5),
  scienceAndMathCheckpoint: buildSeries(`${grade3AcademicWordWorkshopLessonIds.scienceAndMathCheckpoint}-q`, 7),
  readingAndWritingCheckpoint: buildSeries(`${grade3AcademicWordWorkshopLessonIds.readingAndWritingCheckpoint}-q`, 7),
  acrossSubjectsCheckpoint: buildSeries(`${grade3AcademicWordWorkshopLessonIds.acrossSubjectsCheckpoint}-q`, 7),
} as const
