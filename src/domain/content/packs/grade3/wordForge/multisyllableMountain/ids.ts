const series = (prefix: string, count: number): string[] => Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`)

export const multisyllableMountainPackId = 'g3-word-forge-multisyllable-mountain'
export const multisyllableMountainContentVersion = 'g3-wf-multisyllable-mountain-r0.1.0'
export const multisyllableMountainWorldId = 'word-forge'
export const multisyllableMountainUnitId = 'g3-wg-unit-3'
export const multisyllableMountainSkillId = 'g3-word-forge-word-analysis'

export const multisyllableMountainPassageIds = {
  trailStation: 'g3-wf-multisyllable-mountain-trail-station',
  weatherTrip: 'g3-wf-multisyllable-mountain-weather-trip',
  gardenProject: 'g3-wf-multisyllable-mountain-garden-project',
  wildlifeCenter: 'g3-wf-multisyllable-mountain-wildlife-center',
  museumExpedition: 'g3-wf-multisyllable-mountain-museum-expedition',
  engineeringChallenge: 'g3-wf-multisyllable-mountain-engineering-challenge',
  adventureClub: 'g3-wf-multisyllable-mountain-adventure-club',
} as const

export const multisyllableMountainLessonIds = {
  powerUpCompounds: 'lesson-g3-multisyllable-mountain-power-up-compounds',
  powerUpVowels: 'lesson-g3-multisyllable-mountain-power-up-vowels',
  labGarden: 'lesson-g3-multisyllable-mountain-lab-garden',
  labWildlife: 'lesson-g3-multisyllable-mountain-lab-wildlife',
  checkpointMuseum: 'lesson-g3-multisyllable-mountain-checkpoint-museum',
  checkpointEngineering: 'lesson-g3-multisyllable-mountain-checkpoint-engineering',
  checkpointAdventure: 'lesson-g3-multisyllable-mountain-checkpoint-adventure',
} as const

export const multisyllableMountainQuestionIds = {
  powerUpCompounds: series(`${multisyllableMountainLessonIds.powerUpCompounds}-q`, 5),
  powerUpVowels: series(`${multisyllableMountainLessonIds.powerUpVowels}-q`, 5),
  labGarden: series(`${multisyllableMountainLessonIds.labGarden}-q`, 5),
  labWildlife: series(`${multisyllableMountainLessonIds.labWildlife}-q`, 5),
  checkpointMuseum: series(`${multisyllableMountainLessonIds.checkpointMuseum}-q`, 7),
  checkpointEngineering: series(`${multisyllableMountainLessonIds.checkpointEngineering}-q`, 7),
  checkpointAdventure: series(`${multisyllableMountainLessonIds.checkpointAdventure}-q`, 7),
} as const
