export const CENTRAL_IDEA_ENGINE_PACK_ID = 'g3-information-detectives-central-idea-engine'
export const CENTRAL_IDEA_ENGINE_VERSION = 'g3-id-central-idea-r0.1.0'
export const CENTRAL_IDEA_ENGINE_SKILL_ID = 'g3-information-detectives-reading'
export const CENTRAL_IDEA_ENGINE_UNIT_ID = 'g3-id-unit-2'
export const CENTRAL_IDEA_ENGINE_WORLD_ID = 'information-detectives'
export const CENTRAL_IDEA_ENGINE_BENCHMARK = 'ELA.3.R.2.2'
export const CENTRAL_IDEA_ENGINE_REPORTING_CATEGORY = 'Reading Informational Text'

export const CENTRAL_IDEA_ENGINE_PASSAGE_IDS = Array.from({ length: 7 }, (_, index) => `g3-id-ci-passage-${index + 1}`)
export const CENTRAL_IDEA_ENGINE_LESSON_IDS = Array.from({ length: 7 }, (_, index) => `g3-id-ci-lesson-${index + 1}`)
export const CENTRAL_IDEA_ENGINE_LESSON_TITLES = [
  'Central Idea Engine Power-Up: Topic and Big Idea',
  'Central Idea Engine Power-Up: Important Details',
  'Central Idea Engine Lab: Stated Ideas',
  'Central Idea Engine Lab: Ideas Across Sections',
  'Central Idea Engine Checkpoint: Wetland Work',
  'Central Idea Engine Checkpoint: Sunlight to Electricity',
  'Central Idea Engine Checkpoint: A Book Returns',
] as const
