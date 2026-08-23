import type { ContentPackLesson } from '../../../contentPackTypes'
import type { TeachingBlock } from '../../../../../lesson'
import {
  SILENT_LETTER_CONTENT_VERSION,
  SILENT_LETTER_LESSON_IDS,
  SILENT_LETTER_PACK_ID,
  SILENT_LETTER_PACK_TITLE,
  SILENT_LETTER_PASSAGE_IDS,
  SILENT_LETTER_QUESTION_IDS,
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

export const grade2WordForgeSilentLetterCombinationsManifest = {
  packId: SILENT_LETTER_PACK_ID,
  packTitle: SILENT_LETTER_PACK_TITLE,
  gradeBand: 2 as const,
  worldId: 'word-forge',
  unitId: 'wg-unit-5',
  primarySkillId: 'g2-word-forge-word-practice',
  benchmarkReferences: ['ELA.2.F.1.3e'],
  partialBenchmarkCoverage: 'Bounded Grade 2 silent-letter set covering kn, wr, mb, gh, and the island-family silent-s pattern.',
  difficultyRange: [6, 7] as const,
  contentVersion: SILENT_LETTER_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
  coveredPatterns: [
    'silent-letter-combinations',
    'silent-kn',
    'silent-wr',
    'silent-mb',
    'silent-gh',
    'silent-s-island',
  ],
  passageIds: [...Object.values(SILENT_LETTER_PASSAGE_IDS)],
  questionIds: [
    ...SILENT_LETTER_QUESTION_IDS.guidedQuietBeginnings,
    ...SILENT_LETTER_QUESTION_IDS.guidedQuietEndings,
    ...SILENT_LETTER_QUESTION_IDS.guidedQuietReview,
    ...SILENT_LETTER_QUESTION_IDS.guidedQuietFamilies,
    ...SILENT_LETTER_QUESTION_IDS.checkpointA,
    ...SILENT_LETTER_QUESTION_IDS.checkpointB,
    ...SILENT_LETTER_QUESTION_IDS.checkpointC,
  ],
  lessonIds: [
    SILENT_LETTER_LESSON_IDS.guidedQuietBeginnings,
    SILENT_LETTER_LESSON_IDS.guidedQuietEndings,
    SILENT_LETTER_LESSON_IDS.guidedQuietReview,
    SILENT_LETTER_LESSON_IDS.guidedQuietFamilies,
    SILENT_LETTER_LESSON_IDS.checkpointA,
    SILENT_LETTER_LESSON_IDS.checkpointB,
    SILENT_LETTER_LESSON_IDS.checkpointC,
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

export const grade2WordForgeSilentLetterCombinationsLessons: ContentPackLesson[] = [
  {
    lessonId: SILENT_LETTER_LESSON_IDS.guidedQuietBeginnings,
    worldId: 'word-forge',
    unitId: 'wg-unit-5',
    activityId: 'activity-word-forge-silent-letter-combinations-guided-quiet-beginnings',
    difficulty: 6,
    passageIdentifiers: [SILENT_LETTER_PASSAGE_IDS.museumKnight],
    questionIdentifiers: [...SILENT_LETTER_QUESTION_IDS.guidedQuietBeginnings],
    lessonTitle: 'Quiet Beginnings',
    lessonObjective: 'Find silent letter groups at the start of words and blend the sounds we hear.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Quiet Beginnings',
      'Some letter groups contain a letter we do not say. At the start of many kn words, the k is quiet. At the start of many wr words, the w is quiet. We hear the next sound and blend the word.',
      ['knight', 'knee', 'write'],
      'We do not say the quiet letter at the start.',
      'Mark the quiet letter group, say the sound you hear, and blend.',
    ),
    contentVersion: SILENT_LETTER_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: SILENT_LETTER_LESSON_IDS.guidedQuietEndings,
    worldId: 'word-forge',
    unitId: 'wg-unit-5',
    activityId: 'activity-word-forge-silent-letter-combinations-guided-quiet-endings',
    difficulty: 6,
    passageIdentifiers: [SILENT_LETTER_PASSAGE_IDS.wrapStation],
    questionIdentifiers: [...SILENT_LETTER_QUESTION_IDS.guidedQuietEndings],
    lessonTitle: 'Quiet Endings and Hidden Letters',
    lessonObjective: 'Read words with quiet letters at the end and use the sentence to check meaning.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Quiet Endings and Hidden Letters',
      'At the end of many mb words, the b is quiet. Some island-family words also hide an s. We say the sounds we hear and use the sentence to check the word.',
      ['lamb', 'comb', 'island'],
      'The quiet letter stays in the written word even when we do not say it.',
      'Look for the quiet letter at the end, then read the whole word.',
    ),
    contentVersion: SILENT_LETTER_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: SILENT_LETTER_LESSON_IDS.guidedQuietReview,
    worldId: 'word-forge',
    unitId: 'wg-unit-5',
    activityId: 'activity-word-forge-silent-letter-combinations-guided-quiet-review',
    difficulty: 7,
    passageIdentifiers: [SILENT_LETTER_PASSAGE_IDS.shelterCare],
    questionIdentifiers: [...SILENT_LETTER_QUESTION_IDS.guidedQuietReview],
    lessonTitle: 'KN, WR, and MB Guided Practice',
    lessonObjective: 'Blend silent-kn, silent-wr, and silent-mb words in connected reading.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'KN, WR, and MB Guided Practice',
      'Some words begin with quiet kn or wr. Some words end with quiet mb. We can mark the quiet letters, read the sounds we hear, and blend the word.',
      ['knight', 'wren', 'thumb'],
      'We keep the quiet letter in the word but leave it out of the spoken sound.',
      'Find the quiet letters, then read the word in chunks.',
    ),
    contentVersion: SILENT_LETTER_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: SILENT_LETTER_LESSON_IDS.guidedQuietFamilies,
    worldId: 'word-forge',
    unitId: 'wg-unit-5',
    activityId: 'activity-word-forge-silent-letter-combinations-guided-quiet-families',
    difficulty: 7,
    passageIdentifiers: [SILENT_LETTER_PASSAGE_IDS.nightPicnic],
    questionIdentifiers: [...SILENT_LETTER_QUESTION_IDS.guidedQuietFamilies],
    lessonTitle: 'GH and Island-Family Guided Practice',
    lessonObjective: 'Use quiet-letter clues to read gh words and island-family words.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'GH and Island-Family Guided Practice',
      'Silent gh can be quiet in some words, and island-family words have a written s we do not say. We read the word carefully and check the sentence.',
      ['ghost', 'bright', 'island'],
      'The written letters help us recognize the word even when we do not say every letter.',
      'Mark the quiet letter, read the sounds you hear, and blend.',
    ),
    contentVersion: SILENT_LETTER_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: SILENT_LETTER_LESSON_IDS.checkpointA,
    worldId: 'word-forge',
    unitId: 'wg-unit-5',
    activityId: 'activity-word-forge-silent-letter-combinations-checkpoint-a',
    difficulty: 7,
    passageIdentifiers: [
      SILENT_LETTER_PASSAGE_IDS.museumKnight,
      SILENT_LETTER_PASSAGE_IDS.shelterCare,
      SILENT_LETTER_PASSAGE_IDS.islandStudy,
      SILENT_LETTER_PASSAGE_IDS.wrapStation,
      SILENT_LETTER_PASSAGE_IDS.nightPicnic,
    ],
    questionIdentifiers: [...SILENT_LETTER_QUESTION_IDS.checkpointA],
    lessonTitle: 'Quiet Letter Quest Trail 7 Checkpoint A',
    lessonObjective: 'Show independent reading with quiet letters across several silent-letter families.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: SILENT_LETTER_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: SILENT_LETTER_LESSON_IDS.checkpointB,
    worldId: 'word-forge',
    unitId: 'wg-unit-5',
    activityId: 'activity-word-forge-silent-letter-combinations-checkpoint-b',
    difficulty: 7,
    passageIdentifiers: [
      SILENT_LETTER_PASSAGE_IDS.workshopQuiet,
      SILENT_LETTER_PASSAGE_IDS.nightPicnic,
      SILENT_LETTER_PASSAGE_IDS.gardenWatch,
      SILENT_LETTER_PASSAGE_IDS.shelterCare,
      SILENT_LETTER_PASSAGE_IDS.islandStudy,
    ],
    questionIdentifiers: [...SILENT_LETTER_QUESTION_IDS.checkpointB],
    lessonTitle: 'Quiet Letter Quest Trail 7 Checkpoint B',
    lessonObjective: 'Show independent reading with quiet letters across several silent-letter families.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: SILENT_LETTER_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: SILENT_LETTER_LESSON_IDS.checkpointC,
    worldId: 'word-forge',
    unitId: 'wg-unit-5',
    activityId: 'activity-word-forge-silent-letter-combinations-checkpoint-c',
    difficulty: 7,
    passageIdentifiers: [
      SILENT_LETTER_PASSAGE_IDS.wrapStation,
      SILENT_LETTER_PASSAGE_IDS.shelterCare,
      SILENT_LETTER_PASSAGE_IDS.islandStudy,
      SILENT_LETTER_PASSAGE_IDS.museumKnight,
      SILENT_LETTER_PASSAGE_IDS.nightPicnic,
      SILENT_LETTER_PASSAGE_IDS.gardenWatch,
    ],
    questionIdentifiers: [...SILENT_LETTER_QUESTION_IDS.checkpointC],
    lessonTitle: 'Quiet Letter Quest Trail 7 Checkpoint C',
    lessonObjective: 'Show independent reading with quiet letters across several silent-letter families.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: SILENT_LETTER_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]
