import type { ContentPackLesson } from '../../../contentPackTypes'
import { TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION, TWO_SYLLABLE_OPEN_CLOSED_LESSON_IDS, TWO_SYLLABLE_OPEN_CLOSED_PACK_ID, TWO_SYLLABLE_OPEN_CLOSED_PACK_TITLE, TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS, TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS } from './ids'

const guidedTeaching = (title: string, explanation: string, examples: string[], contrast: string, learnerCue: string) => ({
  title,
  explanation,
  examples,
  contrast,
  learnerCue,
})

export const grade2WordForgeTwoSyllableOpenClosedManifest = {
  packId: TWO_SYLLABLE_OPEN_CLOSED_PACK_ID,
  packTitle: TWO_SYLLABLE_OPEN_CLOSED_PACK_TITLE,
  gradeBand: 2 as const,
  worldId: 'word-forge',
  unitId: 'wg-unit-2',
  primarySkillId: 'g2-word-forge-word-practice',
  benchmarkReferences: ['ELA.2.F.1.3b', 'ELA.2.F.1.3c'],
  partialBenchmarkCoverage: 'two-syllable words plus open and closed syllables; consonant-le deferred',
  difficultyRange: [2, 3] as const,
  contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
  coveredPatterns: ['two-syllable-short-vowels', 'two-syllable-long-vowels', 'open-syllable', 'closed-syllable'],
  passageIds: [...Object.values(TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS)],
  questionIds: [
    ...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.guidedClosed,
    ...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.guidedOpen,
    ...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.guidedShort,
    ...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.guidedLong,
    ...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.checkpointA,
    ...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.checkpointB,
    ...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.checkpointC,
  ],
  lessonIds: [...Object.values(TWO_SYLLABLE_OPEN_CLOSED_LESSON_IDS)],
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

export const grade2WordForgeTwoSyllableOpenClosedLessons: ContentPackLesson[] = [
  {
    lessonId: TWO_SYLLABLE_OPEN_CLOSED_LESSON_IDS.guidedClosed,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-syllable-summit-guided-closed',
    difficulty: 2,
    passageIdentifiers: [TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.rabbitHabitat],
    questionIdentifiers: [...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.guidedClosed],
    lessonTitle: 'Guided Practice: Closed Syllable Building Blocks',
    lessonObjective: 'Use closed syllables to read careful two-syllable words.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Closed Syllables',
      'A closed syllable ends with a consonant. The vowel usually makes a short sound, as in rab in rabbit or pic in picnic.',
      ['rab in rabbit', 'pic in picnic', 'sun in sunset'],
      'Usually means most of the time, not every time.',
      'Find the closed syllable, then read the vowel sound.',
    ),
    contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: TWO_SYLLABLE_OPEN_CLOSED_LESSON_IDS.guidedOpen,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-syllable-summit-guided-open',
    difficulty: 2,
    passageIdentifiers: [TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.robotExhibit],
    questionIdentifiers: [...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.guidedOpen],
    lessonTitle: 'Guided Practice: Open Syllable Building Blocks',
    lessonObjective: 'Use open syllables to read careful two-syllable words.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Open Syllables',
      'An open syllable ends with a vowel. The vowel usually says its long sound, as in ro in robot or mu in music.',
      ['ro in robot', 'mu in music', 'ze in zero'],
      'Usually means most of the time, not every time.',
      'Find the open syllable, then read the vowel sound.',
    ),
    contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: TWO_SYLLABLE_OPEN_CLOSED_LESSON_IDS.guidedShort,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-syllable-summit-guided-short-vowels',
    difficulty: 3,
    passageIdentifiers: [TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.picnicPlanning],
    questionIdentifiers: [...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.guidedShort],
    lessonTitle: 'Trail 3 Guide: Short-Vowel Two-Syllable Words',
    lessonObjective: 'Use syllable chunks to read two-syllable words with short vowels.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Chunk the Word',
      'We can find the vowel parts, choose a helpful split, read each chunk, and blend them together. Then we check that the word sounds right in the sentence.',
      ['rab-bit', 'pic-nic', 'mag-net'],
      'A split should be authored and checked, not guessed on the fly.',
      'Read the chunks, then blend the whole word.',
    ),
    contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: TWO_SYLLABLE_OPEN_CLOSED_LESSON_IDS.guidedLong,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-syllable-summit-guided-long-vowels',
    difficulty: 3,
    passageIdentifiers: [TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.musicRoom],
    questionIdentifiers: [...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.guidedLong],
    lessonTitle: 'Trail 3 Guide: Long-Vowel Two-Syllable Words',
    lessonObjective: 'Use syllable chunks to read two-syllable words with long vowels.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Read the Open Part',
      'Open syllables often let the vowel say its long sound. We can blend the chunks and check whether the word fits the sentence.',
      ['ro-bot', 'mu-sic', 'tu-lip'],
      'Not every word splits the same way, so we read the author’s chunks.',
      'Blend the chunks and listen for the long vowel.',
    ),
    contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: TWO_SYLLABLE_OPEN_CLOSED_LESSON_IDS.checkpointA,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-syllable-summit-checkpoint-a',
    difficulty: 3,
    passageIdentifiers: [
      TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.rabbitHabitat,
      TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.robotExhibit,
      TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.picnicPlanning,
    ],
    questionIdentifiers: [...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.checkpointA],
    lessonTitle: 'Syllable Summit Trail 3 Checkpoint A',
    lessonObjective: 'Show careful reading with short-vowel, long-vowel, open, and closed syllables.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: TWO_SYLLABLE_OPEN_CLOSED_LESSON_IDS.checkpointB,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-syllable-summit-checkpoint-b',
    difficulty: 3,
    passageIdentifiers: [
      TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.musicRoom,
      TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.tulipGarden,
      TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.pilotWeatherLog,
    ],
    questionIdentifiers: [...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.checkpointB],
    lessonTitle: 'Syllable Summit Trail 3 Checkpoint B',
    lessonObjective: 'Show careful reading with short-vowel, long-vowel, open, and closed syllables.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: TWO_SYLLABLE_OPEN_CLOSED_LESSON_IDS.checkpointC,
    worldId: 'word-forge',
    unitId: 'wg-unit-2',
    activityId: 'activity-word-forge-syllable-summit-checkpoint-c',
    difficulty: 3,
    passageIdentifiers: [
      TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.tulipGarden,
      TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.pilotWeatherLog,
      TWO_SYLLABLE_OPEN_CLOSED_PASSAGE_IDS.photoDisplay,
    ],
    questionIdentifiers: [...TWO_SYLLABLE_OPEN_CLOSED_QUESTION_IDS.checkpointC],
    lessonTitle: 'Syllable Summit Trail 3 Checkpoint C',
    lessonObjective: 'Show careful reading with short-vowel, long-vowel, open, and closed syllables.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: TWO_SYLLABLE_OPEN_CLOSED_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]

