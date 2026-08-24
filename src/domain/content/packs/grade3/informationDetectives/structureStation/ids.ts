export const STRUCTURE_STATION_PACK_ID = 'g3-information-detectives-structure-station'
export const STRUCTURE_STATION_VERSION = 'g3-id-structure-station-r0.1.0'
export const STRUCTURE_STATION_SKILL_ID = 'g3-information-detectives-reading'
export const STRUCTURE_STATION_UNIT_ID = 'g3-id-unit-1'
export const STRUCTURE_STATION_WORLD_ID = 'information-detectives'
export const STRUCTURE_STATION_BENCHMARK = 'ELA.3.R.2.1'
export const STRUCTURE_STATION_REPORTING_CATEGORY = 'Reading Informational Text'

export const STRUCTURE_STATION_PASSAGE_IDS = Array.from({ length: 7 }, (_, index) => `g3-id-ss-passage-${index + 1}`)
export const STRUCTURE_STATION_LESSON_IDS = Array.from({ length: 7 }, (_, index) => `g3-id-ss-lesson-${index + 1}`)
export const STRUCTURE_STATION_LESSON_TITLES = [
  'Structure Station Power-Up: Events in Order',
  'Structure Station Power-Up: Compare Two Animals',
  'Structure Station Lab: Causes and Results',
  'Structure Station Lab: Follow the Steps',
  'Structure Station Checkpoint: Bridges Side by Side',
  'Structure Station Checkpoint: A Garden That Helps',
  'Structure Station Checkpoint: Paper Begins Again',
] as const
