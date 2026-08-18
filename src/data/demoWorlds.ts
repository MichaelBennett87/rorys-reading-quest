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
]

const storyScoutsUnits: DemoUnit[] = [
  {
    id: 'ss-unit-1',
    title: "Who’s in the Story?",
    difficultyLabel: 'Trail 1',
    progressPercent: 40,
    stars: 1,
    state: 'available',
    practiceFocus: 'finding characters and clues',
  },
  {
    id: 'ss-unit-2',
    title: 'What Happened Next?',
    difficultyLabel: 'Trail 2',
    progressPercent: 10,
    stars: 0,
    state: 'available',
    practiceFocus: 'sequencing story events',
  },
  {
    id: 'ss-unit-3',
    title: 'Character Clues',
    difficultyLabel: 'Trail 3',
    progressPercent: 0,
    stars: 0,
    state: 'locked',
    practiceFocus: 'character growth signs',
  },
]

const infoDetectivesUnits: DemoUnit[] = [
  {
    id: 'id-unit-1',
    title: 'Find the Main Topic',
    difficultyLabel: 'Trail 1',
    progressPercent: 20,
    stars: 0,
    state: 'available',
    practiceFocus: 'main idea in short passages',
  },
  {
    id: 'id-unit-2',
    title: 'Detail Detective',
    difficultyLabel: 'Trail 2',
    progressPercent: 0,
    stars: 0,
    state: 'locked',
    practiceFocus: 'key supporting details',
  },
  {
    id: 'id-unit-3',
    title: 'Text Feature Hunt',
    difficultyLabel: 'Trail 3',
    progressPercent: 0,
    stars: 0,
    state: 'locked',
    practiceFocus: 'headings, captions, and clues',
  },
]

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
    status: 'available',
    description: 'Track clues in stories and solve the plot.',
    progressionLabel: 'Trail 1 beginning',
    skills: ['character', 'setting', 'sequence', 'problem and solution'],
    currentProgress: 16,
    units: storyScoutsUnits,
  },
  {
    id: 'information-detectives',
    name: 'Information Detectives',
    iconLabel: '🔎',
    status: 'available',
    description: 'Inspect facts, topic points, and evidence.',
    progressionLabel: 'Trail 1 beginning',
    skills: ['topic and key details', 'text features', 'central idea'],
    currentProgress: 8,
    units: infoDetectivesUnits,
  },
  {
    id: 'poetry-planet',
    name: 'Poetry Planet',
    iconLabel: '🌙',
    status: 'coming-later',
    description: 'Explore rhythm, rhyme, and imagery in short poems.',
    progressionLabel: 'Opening soon',
    skills: ['rhyme', 'rhythm', 'stanzas'],
    currentProgress: 0,
    units: [],
  },
  {
    id: 'context-cavern',
    name: 'Context Cavern',
    iconLabel: '🗝️',
    status: 'locked',
    description: 'Use clues around a word to find meaning.',
    progressionLabel: 'Locked',
    skills: ['context clues', 'synonyms and antonyms'],
    currentProgress: 0,
    units: [],
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

