export const GRADE3_FLUENCY_FLIGHT_PACK_ID = 'g3-word-forge-fluency-flight'
export const GRADE3_FLUENCY_FLIGHT_PACK_TITLE = 'Grade 3 Word Forge: Fluency Flight'
export const GRADE3_FLUENCY_FLIGHT_CONTENT_VERSION = 'g3-wf-fluency-flight-r0.1.0'
export const GRADE3_FLUENCY_FLIGHT_WORLD_ID = 'word-forge'
export const GRADE3_FLUENCY_FLIGHT_UNIT_ID = 'g3-wg-unit-4'
export const GRADE3_FLUENCY_FLIGHT_SKILL_ID = 'g3-word-forge-word-analysis'

export const GRADE3_FLUENCY_FLIGHT_PASSAGE_IDS = {
  hilltopSignal: 'passage-g3-fluency-flight-hilltop-signal',
  paperGlider: 'passage-g3-fluency-flight-paper-glider',
  missingMap: 'passage-g3-fluency-flight-missing-map',
  paperRotor: 'passage-g3-fluency-flight-paper-rotor',
  morningMarsh: 'passage-g3-fluency-flight-morning-marsh',
  firstLaunch: 'passage-g3-fluency-flight-first-launch',
  geeseFormation: 'passage-g3-fluency-flight-geese-formation',
} as const

export const GRADE3_FLUENCY_FLIGHT_LESSON_IDS = {
  guidedPunctuation: 'lesson-g3-fluency-flight-punctuation-pilot',
  guidedPhraseGroups: 'lesson-g3-fluency-flight-phrase-formation',
  guidedDialogue: 'lesson-g3-fluency-flight-dialogue-voices',
  guidedRereading: 'lesson-g3-fluency-flight-reread-route',
  independentDescription: 'lesson-g3-fluency-flight-marsh-morning',
  independentLiterary: 'lesson-g3-fluency-flight-first-launch',
  independentInformational: 'lesson-g3-fluency-flight-formation-facts',
} as const

export const GRADE3_FLUENCY_FLIGHT_QUESTION_IDS = {
  guidedPunctuation: Array.from({ length: 4 }, (_, index) => `question-g3-fluency-flight-punctuation-pilot-${index + 1}`),
  guidedPhraseGroups: Array.from({ length: 4 }, (_, index) => `question-g3-fluency-flight-phrase-formation-${index + 1}`),
  guidedDialogue: Array.from({ length: 4 }, (_, index) => `question-g3-fluency-flight-dialogue-voices-${index + 1}`),
  guidedRereading: Array.from({ length: 4 }, (_, index) => `question-g3-fluency-flight-reread-route-${index + 1}`),
  independentDescription: Array.from({ length: 4 }, (_, index) => `question-g3-fluency-flight-marsh-morning-${index + 1}`),
  independentLiterary: Array.from({ length: 4 }, (_, index) => `question-g3-fluency-flight-first-launch-${index + 1}`),
  independentInformational: Array.from({ length: 4 }, (_, index) => `question-g3-fluency-flight-formation-facts-${index + 1}`),
} as const

export const GRADE3_FLUENCY_FLIGHT_TARGET_IDS = {
  hilltopSignal: 'target-g3-fluency-flight-hilltop-signal',
  hilltopCareful: 'target-g3-fluency-flight-hilltop-careful',
  hilltopSmoothly: 'target-g3-fluency-flight-hilltop-smoothly',
  gliderTravels: 'target-g3-fluency-flight-glider-travels',
  gliderBalanced: 'target-g3-fluency-flight-glider-balanced',
  gliderSuddenly: 'target-g3-fluency-flight-glider-suddenly',
  mapCompass: 'target-g3-fluency-flight-map-compass',
  mapMystery: 'target-g3-fluency-flight-map-mystery',
  mapReturned: 'target-g3-fluency-flight-map-returned',
  rotorRotor: 'target-g3-fluency-flight-rotor-rotor',
  rotorRotation: 'target-g3-fluency-flight-rotor-rotation',
  rotorUneven: 'target-g3-fluency-flight-rotor-uneven',
  marshObservation: 'target-g3-fluency-flight-marsh-observation',
  marshBinoculars: 'target-g3-fluency-flight-marsh-binoculars',
  marshReflection: 'target-g3-fluency-flight-marsh-reflection',
  launchPracticed: 'target-g3-fluency-flight-launch-practiced',
  launchTrembled: 'target-g3-fluency-flight-launch-trembled',
  launchGently: 'target-g3-fluency-flight-launch-gently',
  geeseMigrating: 'target-g3-fluency-flight-geese-migrating',
  geeseFormation: 'target-g3-fluency-flight-geese-formation',
  geeseDirection: 'target-g3-fluency-flight-geese-direction',
} as const
