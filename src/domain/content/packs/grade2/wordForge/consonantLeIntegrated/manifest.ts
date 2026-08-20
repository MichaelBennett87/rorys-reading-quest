import type { ContentPackLesson } from '../../../contentPackTypes'
import type { TeachingBlock } from '../../../../../lesson'
import {
  CONSONANT_LE_CONTENT_VERSION,
  CONSONANT_LE_LESSON_IDS,
  CONSONANT_LE_PACK_ID,
  CONSONANT_LE_PACK_TITLE,
  CONSONANT_LE_PASSAGE_IDS,
  CONSONANT_LE_QUESTION_IDS,
} from './ids'

const guidedTeaching = (
  title: string,
  explanation: string,
  examples: string[],
  contrast: string,
  learnerCue: string,
): TeachingBlock => ({
  title,
  explanation,
  examples,
  contrast,
  learnerCue,
})

export const grade2WordForgeConsonantLeManifest = {
  packId: CONSONANT_LE_PACK_ID,
  packTitle: CONSONANT_LE_PACK_TITLE,
  gradeBand: 2 as const,
  worldId: 'word-forge',
  unitId: 'wg-unit-2',
  primarySkillId: 'g2-word-forge-word-practice',
  benchmarkReferences: ['ELA.2.F.1.3c'],
  partialBenchmarkCoverage: 'consonant-le with integrated open and closed syllable review',
  difficultyRange: [3, 4] as const,
  contentVersion: CONSONANT_LE_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
  coveredPatterns: ['consonant-le'],
  passageIds: [...Object.values(CONSONANT_LE_PASSAGE_IDS)],
  questionIds: [
    ...CONSONANT_LE_QUESTION_IDS.guidedFinalBeat,
    ...CONSONANT_LE_QUESTION_IDS.guidedSplitBeforeConsonantLe,
    ...CONSONANT_LE_QUESTION_IDS.guidedConsonantLePractice,
    ...CONSONANT_LE_QUESTION_IDS.guidedMixedSyllables,
    ...CONSONANT_LE_QUESTION_IDS.checkpointA,
    ...CONSONANT_LE_QUESTION_IDS.checkpointB,
    ...CONSONANT_LE_QUESTION_IDS.checkpointC,
  ],
  lessonIds: [
    CONSONANT_LE_LESSON_IDS.guidedFinalBeat,
    CONSONANT_LE_LESSON_IDS.guidedSplitBeforeConsonantLe,
    CONSONANT_LE_LESSON_IDS.guidedConsonantLePractice,
    CONSONANT_LE_LESSON_IDS.guidedMixedSyllables,
    CONSONANT_LE_LESSON_IDS.checkpointA,
    CONSONANT_LE_LESSON_IDS.checkpointB,
    CONSONANT_LE_LESSON_IDS.checkpointC,
  ],
} satisfies {
  packId: string
  packTitle: string
  gradeBand: 2
  worldId: string
  unitId: string
  primarySkillId: string
  benchmarkReferences: string[]
  partialBenchmarkCoverage: string
  difficultyRange: [number, number]
  contentVersion: string
  reviewStatus: 'DRAFT'
  coveredPatterns: string[]
  passageIds: string[]
  questionIds: string[]
  lessonIds: string[]
}

export const grade2WordForgeConsonantLeLessons: ContentPackLesson[] = [
  {
    lessonId: CONSONANT_LE_LESSON_IDS.guidedFinalBeat,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-consonant-le-guided-final-beat',
    difficulty: 3,
    passageIdentifiers: [CONSONANT_LE_PASSAGE_IDS.orchardTable],
    questionIdentifiers: [...CONSONANT_LE_QUESTION_IDS.guidedFinalBeat],
    lessonTitle: 'Guided Practice: Find the Final Beat',
    lessonObjective: 'Find consonant-le endings and read the final beat with confidence.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Find the Final Beat',
      'A consonant-le syllable often appears at the end of a word. The consonant and le work together to make the final beat, as in ta | ble or can | dle. Look at the end of the word, find consonant plus le, split before it, and blend the chunks.',
      ['ta | ble', 'ma | ple', 'can | dle'],
      'We split before the consonant-le chunk rather than inside it.',
      'Find the final beat, then read the whole word.',
    ),
    contentVersion: CONSONANT_LE_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: CONSONANT_LE_LESSON_IDS.guidedSplitBeforeConsonantLe,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-consonant-le-guided-split-before',
    difficulty: 3,
    passageIdentifiers: [CONSONANT_LE_PASSAGE_IDS.candleDemo],
    questionIdentifiers: [...CONSONANT_LE_QUESTION_IDS.guidedSplitBeforeConsonantLe],
    lessonTitle: 'Guided Practice: Split Before Consonant-LE',
    lessonObjective: 'Split words before the consonant-le ending and blend the chunks.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Split Before Consonant-LE',
      'Look at the end of the word. Find consonant plus le, split before that final consonant group, read the first chunk, blend the chunks, and check whether the word sounds right.',
      ['ap | ple', 'bot | tle', 'lit | tle'],
      'Usually and often mean most of the time, not every time.',
      'Split before the consonant-le ending.',
    ),
    contentVersion: CONSONANT_LE_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: CONSONANT_LE_LESSON_IDS.guidedConsonantLePractice,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-consonant-le-guided-practice',
    difficulty: 4,
    passageIdentifiers: [CONSONANT_LE_PASSAGE_IDS.machineExhibit],
    questionIdentifiers: [...CONSONANT_LE_QUESTION_IDS.guidedConsonantLePractice],
    lessonTitle: 'Trail 4 Guided Practice: Consonant-LE Reading',
    lessonObjective: 'Read consonant-le words by blending the authored chunks.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Read the Final Beat',
      'Consonant-le often ends a word. We can read the first syllable, then the final beat. The first syllable can be open or closed, but the consonant-le ending stays together.',
      ['ti | tle', 'han | dle', 'bub | ble'],
      'The first syllable can change, but the consonant-le ending stays together.',
      'Read the first chunk, then blend the final beat.',
    ),
    contentVersion: CONSONANT_LE_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: CONSONANT_LE_LESSON_IDS.guidedMixedSyllables,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-consonant-le-guided-mixed',
    difficulty: 4,
    passageIdentifiers: [CONSONANT_LE_PASSAGE_IDS.jungleHabitat],
    questionIdentifiers: [...CONSONANT_LE_QUESTION_IDS.guidedMixedSyllables],
    lessonTitle: 'Trail 4 Guided Practice: Mixed Syllable Types',
    lessonObjective: 'Sort open, closed, and consonant-le syllables while reading the word.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Open, Closed, and Consonant-LE',
      'An open syllable usually ends in a vowel, a closed syllable usually ends in a consonant, and a consonant-le syllable is a special final syllable ending in consonant plus le. We can use the authored split to read each chunk and blend the word.',
      ['sta | ble', 'jun | gle', 'dim | ple'],
      'Open, closed, and consonant-le all help us read the word; we do not guess the split on the fly.',
      'Sort the syllable type, then blend the chunks.',
    ),
    contentVersion: CONSONANT_LE_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: CONSONANT_LE_LESSON_IDS.checkpointA,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-consonant-le-checkpoint-a',
    difficulty: 4,
    passageIdentifiers: [
      CONSONANT_LE_PASSAGE_IDS.jungleHabitat,
      CONSONANT_LE_PASSAGE_IDS.bottleRecycling,
      CONSONANT_LE_PASSAGE_IDS.bubbleScience,
    ],
    questionIdentifiers: [...CONSONANT_LE_QUESTION_IDS.checkpointA],
    lessonTitle: 'Syllable Summit Trail 4 Checkpoint A',
    lessonObjective: 'Show independent reading with consonant-le and integrated syllable review.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: CONSONANT_LE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: CONSONANT_LE_LESSON_IDS.checkpointB,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-consonant-le-checkpoint-b',
    difficulty: 4,
    passageIdentifiers: [
      CONSONANT_LE_PASSAGE_IDS.orchardTable,
      CONSONANT_LE_PASSAGE_IDS.puzzleClub,
      CONSONANT_LE_PASSAGE_IDS.jungleHabitat,
    ],
    questionIdentifiers: [...CONSONANT_LE_QUESTION_IDS.checkpointB],
    lessonTitle: 'Syllable Summit Trail 4 Checkpoint B',
    lessonObjective: 'Show independent reading with consonant-le and integrated syllable review.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: CONSONANT_LE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: CONSONANT_LE_LESSON_IDS.checkpointC,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-consonant-le-checkpoint-c',
    difficulty: 4,
    passageIdentifiers: [
      CONSONANT_LE_PASSAGE_IDS.candleDemo,
      CONSONANT_LE_PASSAGE_IDS.machineExhibit,
      CONSONANT_LE_PASSAGE_IDS.bottleRecycling,
    ],
    questionIdentifiers: [...CONSONANT_LE_QUESTION_IDS.checkpointC],
    lessonTitle: 'Syllable Summit Trail 4 Checkpoint C',
    lessonObjective: 'Show independent reading with consonant-le and integrated syllable review.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: CONSONANT_LE_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]
