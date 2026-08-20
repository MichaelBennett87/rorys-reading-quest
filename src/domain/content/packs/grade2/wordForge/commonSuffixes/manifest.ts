import type { ContentPackLesson } from '../../../contentPackTypes'
import type { TeachingBlock } from '../../../../../lesson'
import {
  COMMON_SUFFIX_CONTENT_VERSION,
  COMMON_SUFFIX_LESSON_IDS,
  COMMON_SUFFIX_PACK_ID,
  COMMON_SUFFIX_PACK_TITLE,
  COMMON_SUFFIX_PASSAGE_IDS,
  COMMON_SUFFIX_QUESTION_IDS,
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

export const grade2WordForgeCommonSuffixesManifest = {
  packId: COMMON_SUFFIX_PACK_ID,
  packTitle: COMMON_SUFFIX_PACK_TITLE,
  gradeBand: 2 as const,
  worldId: 'word-forge',
  unitId: 'wg-unit-4',
  primarySkillId: 'g2-word-forge-word-practice',
  benchmarkReferences: ['ELA.2.F.1.3d'],
  partialBenchmarkCoverage: 'Common suffixes completing the DRAFT prefix-and-suffix benchmark coverage.',
  difficultyRange: [5, 6] as const,
  contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
  coveredPatterns: [
    'common-suffixes',
    'suffix-s-es',
    'suffix-ed',
    'suffix-ing',
    'suffix-er-est',
    'suffix-ful-less',
    'suffix-ly',
  ],
  passageIds: [...Object.values(COMMON_SUFFIX_PASSAGE_IDS)],
  questionIds: [
    ...COMMON_SUFFIX_QUESTION_IDS.guidedBaseAndEnding,
    ...COMMON_SUFFIX_QUESTION_IDS.guidedEndingSound,
    ...COMMON_SUFFIX_QUESTION_IDS.guidedActionEndings,
    ...COMMON_SUFFIX_QUESTION_IDS.guidedMeaningEndings,
    ...COMMON_SUFFIX_QUESTION_IDS.checkpointA,
    ...COMMON_SUFFIX_QUESTION_IDS.checkpointB,
    ...COMMON_SUFFIX_QUESTION_IDS.checkpointC,
  ],
  lessonIds: [
    COMMON_SUFFIX_LESSON_IDS.guidedBaseAndEnding,
    COMMON_SUFFIX_LESSON_IDS.guidedEndingSound,
    COMMON_SUFFIX_LESSON_IDS.guidedActionEndings,
    COMMON_SUFFIX_LESSON_IDS.guidedMeaningEndings,
    COMMON_SUFFIX_LESSON_IDS.checkpointA,
    COMMON_SUFFIX_LESSON_IDS.checkpointB,
    COMMON_SUFFIX_LESSON_IDS.checkpointC,
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

export const grade2WordForgeCommonSuffixesLessons: ContentPackLesson[] = [
  {
    lessonId: COMMON_SUFFIX_LESSON_IDS.guidedBaseAndEnding,
    worldId: 'word-forge',
    unitId: 'wg-unit-4',
    activityId: 'activity-word-forge-common-suffixes-guided-base-and-ending',
    difficulty: 5,
    passageIdentifiers: [COMMON_SUFFIX_PASSAGE_IDS.gardenBed],
    questionIdentifiers: [...COMMON_SUFFIX_QUESTION_IDS.guidedBaseAndEnding],
    lessonTitle: 'Guided Practice: Find the Base Word and Ending',
    lessonObjective: 'Find the base word, read the suffix, and blend the parts.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Find the Base Word and Ending',
      'A suffix is a word part added to the end of a base word. We can read the base word, read the ending, blend the parts, and check whether the whole word makes sense.',
      ['plant | ed', 'help | ful', 'care | less'],
      'We do not split inside the suffix or guess from the first letters only.',
      'Read the base word, then read the ending.',
    ),
    contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: COMMON_SUFFIX_LESSON_IDS.guidedEndingSound,
    worldId: 'word-forge',
    unitId: 'wg-unit-4',
    activityId: 'activity-word-forge-common-suffixes-guided-ending-sound',
    difficulty: 5,
    passageIdentifiers: [COMMON_SUFFIX_PASSAGE_IDS.shelterCare],
    questionIdentifiers: [...COMMON_SUFFIX_QUESTION_IDS.guidedEndingSound],
    lessonTitle: 'Guided Practice: Read the Ending Sound',
    lessonObjective: 'Read suffix endings and use the sentence to check the word.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Read the Ending Sound',
      'Suffix endings can sound different when we read them. -s and -es can make s, z, or iz sounds. -ed can sound like t, d, or id. -ly, -er, -est, -ful, and -less each help the word make sense.',
      ['box | es', 'help | ed', 'soft | ly'],
      'We read the whole word and the sentence, not just the ending letters.',
      'Read the ending sound and check the sentence.',
    ),
    contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: COMMON_SUFFIX_LESSON_IDS.guidedActionEndings,
    worldId: 'word-forge',
    unitId: 'wg-unit-4',
    activityId: 'activity-word-forge-common-suffixes-guided-action-endings',
    difficulty: 6,
    passageIdentifiers: [COMMON_SUFFIX_PASSAGE_IDS.trailCleanup],
    questionIdentifiers: [...COMMON_SUFFIX_QUESTION_IDS.guidedActionEndings],
    lessonTitle: 'Trail 6 Guided Practice: Action Endings',
    lessonObjective: 'Read action endings that show something is happening or already happened.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Action Endings',
      'The ending can tell us an action is happening now or already happened. We can read the base word, then the suffix, and blend the parts.',
      ['help | ing', 'fast | er', 'small | est'],
      'We read the base word first, then the ending, and we do not guess the split on the fly.',
      'Read the base word, then the action ending.',
    ),
    contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: COMMON_SUFFIX_LESSON_IDS.guidedMeaningEndings,
    worldId: 'word-forge',
    unitId: 'wg-unit-4',
    activityId: 'activity-word-forge-common-suffixes-guided-meaning-endings',
    difficulty: 6,
    passageIdentifiers: [COMMON_SUFFIX_PASSAGE_IDS.weatherWatch],
    questionIdentifiers: [...COMMON_SUFFIX_QUESTION_IDS.guidedMeaningEndings],
    lessonTitle: 'Trail 6 Guided Practice: Meaning Endings',
    lessonObjective: 'Read meaning endings that compare or describe.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Meaning Endings',
      'Some suffixes tell us about how something happens or what kind of word it is. We read the base word first, then the ending, and check the sentence.',
      ['hope | ful', 'care | less', 'kind | ly'],
      'We read the whole word and do not guess from the ending alone.',
      'Read the base word, then check the meaning ending.',
    ),
    contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: COMMON_SUFFIX_LESSON_IDS.checkpointA,
    worldId: 'word-forge',
    unitId: 'wg-unit-4',
    activityId: 'activity-word-forge-common-suffixes-checkpoint-a',
    difficulty: 6,
    passageIdentifiers: [
      COMMON_SUFFIX_PASSAGE_IDS.signPainting,
      COMMON_SUFFIX_PASSAGE_IDS.scienceTools,
      COMMON_SUFFIX_PASSAGE_IDS.pantryHelp,
    ],
    questionIdentifiers: [...COMMON_SUFFIX_QUESTION_IDS.checkpointA],
    lessonTitle: 'Suffix Station Trail 6 Checkpoint A',
    lessonObjective: 'Show independent reading with common suffixes and base-word review.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: COMMON_SUFFIX_LESSON_IDS.checkpointB,
    worldId: 'word-forge',
    unitId: 'wg-unit-4',
    activityId: 'activity-word-forge-common-suffixes-checkpoint-b',
    difficulty: 6,
    passageIdentifiers: [
      COMMON_SUFFIX_PASSAGE_IDS.scienceTools,
      COMMON_SUFFIX_PASSAGE_IDS.pantryHelp,
      COMMON_SUFFIX_PASSAGE_IDS.signPainting,
    ],
    questionIdentifiers: [...COMMON_SUFFIX_QUESTION_IDS.checkpointB],
    lessonTitle: 'Suffix Station Trail 6 Checkpoint B',
    lessonObjective: 'Show independent reading with common suffixes and base-word review.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: COMMON_SUFFIX_LESSON_IDS.checkpointC,
    worldId: 'word-forge',
    unitId: 'wg-unit-4',
    activityId: 'activity-word-forge-common-suffixes-checkpoint-c',
    difficulty: 6,
    passageIdentifiers: [
      COMMON_SUFFIX_PASSAGE_IDS.pantryHelp,
      COMMON_SUFFIX_PASSAGE_IDS.signPainting,
      COMMON_SUFFIX_PASSAGE_IDS.scienceTools,
    ],
    questionIdentifiers: [...COMMON_SUFFIX_QUESTION_IDS.checkpointC],
    lessonTitle: 'Suffix Station Trail 6 Checkpoint C',
    lessonObjective: 'Show independent reading with common suffixes and base-word review.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: COMMON_SUFFIX_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]

