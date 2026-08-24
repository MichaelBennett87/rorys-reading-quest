const series = (prefix: string, count: number): string[] => Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

export const suffixShifterPackId = 'g3-word-forge-suffix-shifter'
export const suffixShifterContentVersion = 'g3-wf-suffix-shifter-r0.1.0'
export const suffixShifterWorldId = 'word-forge'
export const suffixShifterUnitId = 'g3-wg-unit-2'
export const suffixShifterSkillId = 'g3-word-forge-word-analysis'

export const suffixShifterPassageIds = {
  workshopTeam: 'g3-wf-suffix-shifter-workshop-team',
  natureCenter: 'g3-wf-suffix-shifter-nature-center',
  artProject: 'g3-wf-suffix-shifter-art-project',
  schoolNewsroom: 'g3-wf-suffix-shifter-school-newsroom',
  makerShowcase: 'g3-wf-suffix-shifter-maker-showcase',
  natureNight: 'g3-wf-suffix-shifter-nature-night',
  weatherGarden: 'g3-wf-suffix-shifter-weather-garden',
} as const

export const suffixShifterLessonIds = {
  powerUpNames: 'lesson-g3-suffix-shifter-power-up-names',
  powerUpDescriptions: 'lesson-g3-suffix-shifter-power-up-descriptions',
  labWordJobs: 'lesson-g3-suffix-shifter-lab-word-jobs',
  labSentenceFit: 'lesson-g3-suffix-shifter-lab-sentence-fit',
  checkpointMaker: 'lesson-g3-suffix-shifter-checkpoint-maker',
  checkpointNature: 'lesson-g3-suffix-shifter-checkpoint-nature',
  checkpointWeather: 'lesson-g3-suffix-shifter-checkpoint-weather',
} as const

export const suffixShifterQuestionIds = {
  powerUpNames: series(`${suffixShifterLessonIds.powerUpNames}-q`, 5),
  powerUpDescriptions: series(`${suffixShifterLessonIds.powerUpDescriptions}-q`, 5),
  labWordJobs: series(`${suffixShifterLessonIds.labWordJobs}-q`, 5),
  labSentenceFit: series(`${suffixShifterLessonIds.labSentenceFit}-q`, 5),
  checkpointMaker: series(`${suffixShifterLessonIds.checkpointMaker}-q`, 7),
  checkpointNature: series(`${suffixShifterLessonIds.checkpointNature}-q`, 7),
  checkpointWeather: series(`${suffixShifterLessonIds.checkpointWeather}-q`, 7),
} as const
