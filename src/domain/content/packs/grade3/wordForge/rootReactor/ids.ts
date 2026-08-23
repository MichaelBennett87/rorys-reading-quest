const series = (prefix: string, count: number): string[] => Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

export const rootReactorPackId = 'g3-word-forge-root-reactor'
export const rootReactorContentVersion = 'g3-wf-root-reactor-r0.1.0'
export const rootReactorWorldId = 'word-forge'
export const rootReactorUnitId = 'g3-wg-unit-1'
export const rootReactorSkillId = 'g3-word-forge-word-analysis'

export const rootReactorPassageIds = {
  farEarthCounts: 'g3-wf-root-reactor-far-earth-counts',
  picturesLifeTools: 'g3-wf-root-reactor-pictures-life-tools',
  greekWordLab: 'g3-wf-root-reactor-greek-word-lab',
  latinMovingLab: 'g3-wf-root-reactor-latin-moving-lab',
  scienceExhibit: 'g3-wf-root-reactor-science-exhibit',
  movingChanging: 'g3-wf-root-reactor-moving-changing',
  acrossUnder: 'g3-wf-root-reactor-across-under',
} as const

export const rootReactorLessonIds = {
  powerUpFarEarth: 'lesson-g3-root-reactor-power-up-far-earth',
  powerUpPicturesLife: 'lesson-g3-root-reactor-power-up-pictures-life',
  labGreek: 'lesson-g3-root-reactor-lab-greek',
  labLatin: 'lesson-g3-root-reactor-lab-latin',
  checkpointScience: 'lesson-g3-root-reactor-checkpoint-science',
  checkpointMoving: 'lesson-g3-root-reactor-checkpoint-moving',
  checkpointAcross: 'lesson-g3-root-reactor-checkpoint-across',
} as const

export const rootReactorQuestionIds = {
  powerUpFarEarth: series(`${rootReactorLessonIds.powerUpFarEarth}-q`, 5),
  powerUpPicturesLife: series(`${rootReactorLessonIds.powerUpPicturesLife}-q`, 5),
  labGreek: series(`${rootReactorLessonIds.labGreek}-q`, 5),
  labLatin: series(`${rootReactorLessonIds.labLatin}-q`, 5),
  checkpointScience: series(`${rootReactorLessonIds.checkpointScience}-q`, 7),
  checkpointMoving: series(`${rootReactorLessonIds.checkpointMoving}-q`, 7),
  checkpointAcross: series(`${rootReactorLessonIds.checkpointAcross}-q`, 7),
} as const
