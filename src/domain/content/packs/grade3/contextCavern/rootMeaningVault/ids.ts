const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

export const rootMeaningVaultPackId = 'g3-context-cavern-root-meaning-vault'
export const rootMeaningVaultContentVersion = 'g3-cc-root-meaning-r0.1.0'
export const rootMeaningVaultWorldId = 'context-cavern'
export const rootMeaningVaultUnitId = 'g3-cc-unit-2'
export const rootMeaningVaultPrimarySkillId = 'g3-context-cavern-vocabulary'

export const rootMeaningVaultPassageIds = {
  prefixClues: 'g3-cc-rmv-prefix-clues',
  suffixClues: 'g3-cc-rmv-suffix-clues',
  greekRoots: 'g3-cc-rmv-greek-roots',
  latinRoots: 'g3-cc-rmv-latin-roots',
  buildMeaning: 'g3-cc-rmv-build-meaning',
  rootsAcrossSubjects: 'g3-cc-rmv-roots-across-subjects',
  unfamiliarWord: 'g3-cc-rmv-unfamiliar-word',
} as const

export const rootMeaningVaultLessonIds = {
  prefixClues: 'lesson-g3-cc-rmv-prefix-clues',
  suffixClues: 'lesson-g3-cc-rmv-suffix-clues',
  greekRoots: 'lesson-g3-cc-rmv-greek-roots',
  latinRoots: 'lesson-g3-cc-rmv-latin-roots',
  buildMeaningCheckpoint: 'lesson-g3-cc-rmv-build-meaning-checkpoint',
  rootsAcrossSubjectsCheckpoint: 'lesson-g3-cc-rmv-roots-across-subjects-checkpoint',
  unfamiliarWordCheckpoint: 'lesson-g3-cc-rmv-unfamiliar-word-checkpoint',
} as const

export const rootMeaningVaultQuestionIds = {
  prefixClues: buildSeries(`${rootMeaningVaultLessonIds.prefixClues}-q`, 5),
  suffixClues: buildSeries(`${rootMeaningVaultLessonIds.suffixClues}-q`, 5),
  greekRoots: buildSeries(`${rootMeaningVaultLessonIds.greekRoots}-q`, 5),
  latinRoots: buildSeries(`${rootMeaningVaultLessonIds.latinRoots}-q`, 5),
  buildMeaningCheckpoint: buildSeries(`${rootMeaningVaultLessonIds.buildMeaningCheckpoint}-q`, 7),
  rootsAcrossSubjectsCheckpoint: buildSeries(`${rootMeaningVaultLessonIds.rootsAcrossSubjectsCheckpoint}-q`, 7),
  unfamiliarWordCheckpoint: buildSeries(`${rootMeaningVaultLessonIds.unfamiliarWordCheckpoint}-q`, 7),
} as const
