const buildSeries = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

export const grade3MeaningMazePackId = 'g3-context-cavern-meaning-maze'
export const grade3MeaningMazeContentVersion = 'g3-cc-meaning-maze-r0.1.0'
export const grade3MeaningMazeWorldId = 'context-cavern'
export const grade3MeaningMazeUnitId = 'g3-cc-unit-3'
export const grade3MeaningMazePrimarySkillId = 'g3-context-cavern-vocabulary'

export const grade3MeaningMazePassageIds = {
  contextClueCompass: 'g3-cc-mm-context-clue-compass',
  relationshipRopes: 'g3-cc-mm-relationship-ropes',
  referenceToolRoom: 'g3-cc-mm-reference-tool-room',
  backgroundKnowledgeBridge: 'g3-cc-mm-background-knowledge-bridge',
  moreThanOneDoor: 'g3-cc-mm-more-than-one-door',
  figurativePhrasePaths: 'g3-cc-mm-figurative-phrase-paths',
  unknownWordsPhrases: 'g3-cc-mm-unknown-words-phrases',
} as const

export const grade3MeaningMazeLessonIds = {
  contextClueCompass: 'lesson-g3-cc-mm-context-clue-compass',
  relationshipRopes: 'lesson-g3-cc-mm-relationship-ropes',
  referenceToolRoom: 'lesson-g3-cc-mm-reference-tool-room',
  backgroundKnowledgeBridge: 'lesson-g3-cc-mm-background-knowledge-bridge',
  moreThanOneDoor: 'lesson-g3-cc-mm-more-than-one-door',
  figurativePhrasePaths: 'lesson-g3-cc-mm-figurative-phrase-paths',
  unknownWordsPhrases: 'lesson-g3-cc-mm-unknown-words-phrases',
} as const

export const grade3MeaningMazeQuestionIds = {
  contextClueCompass: buildSeries(`${grade3MeaningMazeLessonIds.contextClueCompass}-q`, 5),
  relationshipRopes: buildSeries(`${grade3MeaningMazeLessonIds.relationshipRopes}-q`, 5),
  referenceToolRoom: buildSeries(`${grade3MeaningMazeLessonIds.referenceToolRoom}-q`, 5),
  backgroundKnowledgeBridge: buildSeries(`${grade3MeaningMazeLessonIds.backgroundKnowledgeBridge}-q`, 5),
  moreThanOneDoor: buildSeries(`${grade3MeaningMazeLessonIds.moreThanOneDoor}-q`, 7),
  figurativePhrasePaths: buildSeries(`${grade3MeaningMazeLessonIds.figurativePhrasePaths}-q`, 7),
  unknownWordsPhrases: buildSeries(`${grade3MeaningMazeLessonIds.unknownWordsPhrases}-q`, 7),
} as const
