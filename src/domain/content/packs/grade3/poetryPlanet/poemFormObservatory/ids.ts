export const POEM_FORM_PACK_ID = 'g3-poetry-planet-poem-form-observatory'
export const POEM_FORM_VERSION = 'g3-pp-poem-form-r0.1.0'
export const POEM_FORM_SKILL_ID = 'g3-poetry-planet-poetry'
export const POEM_FORM_UNIT_ID = 'g3-pp-unit-1'
export const POEM_FORM_WORLD_ID = 'poetry-planet'
export const POEM_FORM_BENCHMARK = 'ELA.3.R.1.4'
export const POEM_FORM_REPORTING_CATEGORY = 'Reading Prose and Poetry'

export const POEM_FORM_PASSAGE_IDS = Array.from({ length: 7 }, (_, index) => `g3-pp-pfo-passage-${index + 1}`)
export const POEM_FORM_LESSON_IDS = Array.from({ length: 7 }, (_, index) => `g3-pp-pfo-lesson-${index + 1}`)
export const POEM_FORM_LESSON_TITLES = [
  'Poem Form Observatory Power-Up: Flexible Lines',
  'Poem Form Observatory Power-Up: Hear the Rhyme',
  'Poem Form Observatory Lab: A Classroom Haiku',
  'Poem Form Observatory Lab: Five Playful Lines',
  'Poem Form Observatory Checkpoint: Museum Lines',
  'Poem Form Observatory Checkpoint: Garden Rhymes',
  'Poem Form Observatory Checkpoint: The Crab Collection',
] as const
