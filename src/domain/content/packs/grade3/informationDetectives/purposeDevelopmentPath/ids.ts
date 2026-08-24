export const PURPOSE_DEVELOPMENT_PACK_ID = 'g3-information-detectives-purpose-development-path'
export const PURPOSE_DEVELOPMENT_VERSION = 'g3-id-purpose-development-r0.1.0'
export const PURPOSE_DEVELOPMENT_SKILL_ID = 'g3-information-detectives-reading'
export const PURPOSE_DEVELOPMENT_UNIT_ID = 'g3-id-unit-3'
export const PURPOSE_DEVELOPMENT_WORLD_ID = 'information-detectives'
export const PURPOSE_DEVELOPMENT_BENCHMARK = 'ELA.3.R.2.3'
export const PURPOSE_DEVELOPMENT_REPORTING_CATEGORY = 'Reading Informational Text'

export const PURPOSE_DEVELOPMENT_PASSAGE_IDS = Array.from({ length: 7 }, (_, index) => `g3-id-pd-passage-${index + 1}`)
export const PURPOSE_DEVELOPMENT_LESSON_IDS = Array.from({ length: 7 }, (_, index) => `g3-id-pd-lesson-${index + 1}`)
export const PURPOSE_DEVELOPMENT_LESSON_TITLES = [
  'Purpose Development Power-Up: Topic, Idea, and Purpose',
  'Purpose Development Power-Up: Strong Purpose Clues',
  'Purpose Development Lab: Teaching a Process',
  'Purpose Development Lab: Comparing Designs',
  'Purpose Development Checkpoint: Vanishing Puddles',
  'Purpose Development Checkpoint: A Pond Through the Year',
  'Purpose Development Checkpoint: Water from a Tower',
] as const
