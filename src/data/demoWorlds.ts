import { buildSequentialWorldUnitShells, deriveWorldsForProgress as deriveCurriculumWorlds } from '../domain/curriculum'
import { getLessonCandidates } from '../domain/lesson'

export type WorldStatus = 'available' | 'locked' | 'coming-later'

export type UnitState = 'available' | 'complete' | 'locked' | 'review'

export interface DemoUnit {
  id: string
  title: string
  difficultyLabel: string
  progressPercent: number
  stars: number
  state: UnitState
  practiceFocus: string
}

export interface DemoWorld {
  id: string
  name: string
  iconLabel: string
  status: WorldStatus
  description: string
  progressionLabel: string
  skills: string[]
  currentProgress: number
  units: DemoUnit[]
}

const wordForgeUnits: DemoUnit[] = [
  {
    id: 'wg-unit-1',
    title: 'Vowel Voyage',
    difficultyLabel: 'Trail 1',
    progressPercent: 75,
    stars: 2,
    state: 'available',
    practiceFocus: 'vowel patterns and short decoding',
  },
  {
    id: 'wg-unit-2',
    title: 'Syllable Summit',
    difficultyLabel: 'Trail 2',
    progressPercent: 30,
    stars: 1,
    state: 'available',
    practiceFocus: 'breaking words into beat units',
  },
  {
    id: 'wg-unit-3',
    title: 'Prefix Power',
    difficultyLabel: 'Trail 3',
    progressPercent: 0,
    stars: 0,
    state: 'locked',
    practiceFocus: 'prefix families for easy decoding',
  },
  {
    id: 'wg-unit-4',
    title: 'Suffix Station',
    difficultyLabel: 'Trail 4',
    progressPercent: 0,
    stars: 0,
    state: 'review',
    practiceFocus: 'suffix clues and fluency',
  },
  {
    id: 'wg-unit-5',
    title: 'Quiet Letter Quest',
    difficultyLabel: 'Locked',
    progressPercent: 0,
    stars: 0,
    state: 'locked',
    practiceFocus: 'Complete Suffix Station to unlock Quiet Letter Quest.',
  },
  {
    id: 'wg-unit-6',
    title: 'Fluency Flight',
    difficultyLabel: 'Locked',
    progressPercent: 0,
    stars: 0,
    state: 'locked',
    practiceFocus: 'Fluency Flight quests are being prepared.',
  },
]

const storyScoutsUnits: DemoUnit[] = [
  {
    id: 'ss-unit-1',
    title: 'Story Map',
    difficultyLabel: 'Trail 1',
    progressPercent: 40,
    stars: 1,
    state: 'locked',
    practiceFocus: 'finding characters and clues',
  },
  {
    id: 'ss-unit-2',
    title: 'Theme Trail',
    difficultyLabel: 'Trail 2',
    progressPercent: 10,
    stars: 0,
    state: 'locked',
    practiceFocus: 'sequencing story events',
  },
  {
    id: 'ss-unit-3',
    title: 'Perspective Portal',
    difficultyLabel: 'Trail 3',
    progressPercent: 0,
    stars: 0,
    state: 'locked',
    practiceFocus: 'character growth signs',
  },
]

const poetryPlanetUnits: DemoUnit[] = [
  {
    id: 'pp-unit-1',
    title: 'Rhyme Routes',
    difficultyLabel: 'Trail 1',
    progressPercent: 50,
    stars: 1,
    state: 'available',
    practiceFocus: 'line-end words, rhyme letters, and poem patterns',
  },
]

const infoDetectivesUnits: DemoUnit[] = [
  ...buildSequentialWorldUnitShells('information-detectives'),
]

const contextCavernUnits: DemoUnit[] = [...buildSequentialWorldUnitShells('context-cavern')]

export const demoWorlds: DemoWorld[] = [
  {
    id: 'word-forge',
    name: 'Word Forge',
    iconLabel: '🧭',
    status: 'available',
    description: 'Build powerful words piece by piece.',
    progressionLabel: 'Trail 1 active',
    skills: ['vowel patterns', 'syllables', 'prefixes', 'suffixes'],
    currentProgress: 32,
    units: wordForgeUnits,
  },
  {
    id: 'story-scouts',
    name: 'Story Scouts',
    iconLabel: '📖',
    status: 'coming-later',
    description: 'Track clues in stories and solve the plot.',
    progressionLabel: 'Story Scouts quests are being prepared.',
    skills: ['character', 'setting', 'sequence', 'problem and solution'],
    currentProgress: 16,
    units: storyScoutsUnits,
  },
  {
    id: 'information-detectives',
    name: 'Information Detectives',
    iconLabel: '🔎',
    status: 'coming-later',
    description: 'Inspect features, central ideas, and evidence.',
    progressionLabel: 'Information Detectives quests are being prepared.',
    skills: ['text features', 'central idea', 'author purpose', 'opinion and evidence'],
    currentProgress: 0,
    units: infoDetectivesUnits,
  },
  {
    id: 'poetry-planet',
    name: 'Poetry Planet',
    iconLabel: '🌙',
    status: 'available',
    description: 'Explore rhyme schemes and line patterns in short poems.',
    progressionLabel: 'Trail 1 active',
    skills: ['rhyme schemes', 'line endings', 'stanzas'],
    currentProgress: 25,
    units: poetryPlanetUnits,
  },
  {
    id: 'context-cavern',
    name: 'Context Cavern',
    iconLabel: '🗝️',
    status: 'locked',
    description: 'Use clues around a word to find meaning.',
    progressionLabel: 'Context Cavern quests are being prepared.',
    skills: ['academic words', 'word parts', 'context clues'],
    currentProgress: 0,
    units: contextCavernUnits,
  },
  {
    id: 'compare-castle',
    name: 'Compare Castle',
    iconLabel: '⚖️',
    status: 'locked',
    description: 'Compare ideas in two small passages.',
    progressionLabel: 'Locked',
    skills: ['same-topic comparisons', 'similarities', 'differences'],
    currentProgress: 0,
    units: [],
  },
  {
    id: 'evidence-arena',
    name: 'Evidence Arena',
    iconLabel: '🧾',
    status: 'coming-later',
    description: 'Gather textual clues and prove your answers.',
    progressionLabel: 'Opening later',
    skills: ['multiple choice', 'text evidence'],
    currentProgress: 0,
    units: [],
  },
  {
    id: 'writers-workshop',
    name: "Writer's Workshop",
    iconLabel: '✍️',
    status: 'coming-later',
    description: 'Practice making strong reader-like claims.',
    progressionLabel: 'Opening later',
    skills: ['sentence construction', 'claims and evidence'],
    currentProgress: 0,
    units: [],
  },
]

export const getDemoWorldById = (worldId: string): DemoWorld | undefined =>
  demoWorlds.find((world) => world.id === worldId)

export const getRecommendedWorldId = (): string =>
  demoWorlds.find((world) => world.status === 'available')?.id ?? demoWorlds[0].id

export function deriveWorldsForProgress(progress: Parameters<typeof deriveCurriculumWorlds>[1]): DemoWorld[] {
  return deriveCurriculumWorlds(demoWorlds, progress, getLessonCandidates())
}
