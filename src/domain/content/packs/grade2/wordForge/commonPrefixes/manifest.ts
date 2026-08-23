import type { ContentPackLesson } from '../../../contentPackTypes'
import type { TeachingBlock } from '../../../../../lesson'
import {
  COMMON_PREFIX_CONTENT_VERSION,
  COMMON_PREFIX_LESSON_IDS,
  COMMON_PREFIX_PACK_ID,
  COMMON_PREFIX_PACK_TITLE,
  COMMON_PREFIX_PASSAGE_IDS,
  COMMON_PREFIX_QUESTION_IDS,
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

export const grade2WordForgeCommonPrefixesManifest = {
  packId: COMMON_PREFIX_PACK_ID,
  packTitle: COMMON_PREFIX_PACK_TITLE,
  gradeBand: 2 as const,
  worldId: 'word-forge',
  unitId: 'wg-unit-3',
  primarySkillId: 'g2-word-forge-word-practice',
  benchmarkReferences: ['ELA.2.F.1.3d'],
  partialBenchmarkCoverage: 'Common prefixes only; common suffixes remain deferred to Phase 6C2.',
  difficultyRange: [4, 5] as const,
  contentVersion: COMMON_PREFIX_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
  coveredPatterns: [
    'common-prefixes',
    'prefix-un',
    'prefix-re',
    'prefix-pre',
    'prefix-dis',
    'prefix-mis',
  ],
  passageIds: [...Object.values(COMMON_PREFIX_PASSAGE_IDS)],
  questionIds: [
    ...COMMON_PREFIX_QUESTION_IDS.guidedFindTheBase,
    ...COMMON_PREFIX_QUESTION_IDS.guidedJoinTheParts,
    ...COMMON_PREFIX_QUESTION_IDS.guidedUnRePre,
    ...COMMON_PREFIX_QUESTION_IDS.guidedDisMis,
    ...COMMON_PREFIX_QUESTION_IDS.checkpointA,
    ...COMMON_PREFIX_QUESTION_IDS.checkpointB,
    ...COMMON_PREFIX_QUESTION_IDS.checkpointC,
  ],
  lessonIds: [
    COMMON_PREFIX_LESSON_IDS.guidedFindTheBase,
    COMMON_PREFIX_LESSON_IDS.guidedJoinTheParts,
    COMMON_PREFIX_LESSON_IDS.guidedUnRePre,
    COMMON_PREFIX_LESSON_IDS.guidedDisMis,
    COMMON_PREFIX_LESSON_IDS.checkpointA,
    COMMON_PREFIX_LESSON_IDS.checkpointB,
    COMMON_PREFIX_LESSON_IDS.checkpointC,
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

export const grade2WordForgeCommonPrefixesLessons: ContentPackLesson[] = [
  {
    lessonId: COMMON_PREFIX_LESSON_IDS.guidedFindTheBase,
    worldId: 'word-forge',
    unitId: 'wg-unit-3',
    activityId: 'activity-word-forge-common-prefixes-guided-find-the-base',
    difficulty: 4,
    passageIdentifiers: [
      COMMON_PREFIX_PASSAGE_IDS.rebuildCorner,
      COMMON_PREFIX_PASSAGE_IDS.cookingDemo,
    ],
    questionIdentifiers: [...COMMON_PREFIX_QUESTION_IDS.guidedFindTheBase],
    lessonTitle: 'Guided Practice: Find the Base Word',
    lessonObjective: 'Find the prefix, read the base word, and blend the parts.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Find the Base Word',
      'A prefix is a word part added to the beginning of a base word. We can read the prefix, read the base word, blend the two parts, and check whether the whole word makes sense.',
      ['un | pack', 're | build', 'pre | heat'],
      'Not every word that starts with these letters is a prefix word. We read the whole word before we decide.',
      'Find the prefix, then read the base word.',
    ),
    contentVersion: COMMON_PREFIX_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: COMMON_PREFIX_LESSON_IDS.guidedJoinTheParts,
    worldId: 'word-forge',
    unitId: 'wg-unit-3',
    activityId: 'activity-word-forge-common-prefixes-guided-join-the-parts',
    difficulty: 4,
    passageIdentifiers: [COMMON_PREFIX_PASSAGE_IDS.cookingDemo],
    questionIdentifiers: [...COMMON_PREFIX_QUESTION_IDS.guidedJoinTheParts],
    lessonTitle: 'Guided Practice: Join the Prefix and Base',
    lessonObjective: 'Join a prefix and a base word and use the sentence to check meaning.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Join the Parts',
      'Prefixes often change the meaning of a base word. For example, un- can mean not, re- can mean again, and pre- can mean before. We read the parts, blend them, and use the sentence to check the meaning.',
      ['un | safe', 're | paint', 'pre | test'],
      'We do not guess based on the first letters alone.',
      'Read the parts, then use the sentence clue.',
    ),
    contentVersion: COMMON_PREFIX_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: COMMON_PREFIX_LESSON_IDS.guidedUnRePre,
    worldId: 'word-forge',
    unitId: 'wg-unit-3',
    activityId: 'activity-word-forge-common-prefixes-guided-un-re-pre',
    difficulty: 5,
    passageIdentifiers: [COMMON_PREFIX_PASSAGE_IDS.schoolPreview],
    questionIdentifiers: [...COMMON_PREFIX_QUESTION_IDS.guidedUnRePre],
    lessonTitle: 'Trail 5 Guided Practice: UN-, RE-, and PRE-',
    lessonObjective: 'Read un-, re-, and pre- words by blending the prefix and base word.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Prefix Families',
      'Un- often means not or the opposite of, re- often means again or back, and pre- often means before. We read the prefix, read the base word, and check the sentence to make sure the word makes sense.',
      ['un | kind', 're | tell', 'pre | view'],
      'We do not treat every word that begins with the same letters as a prefix word.',
      'Say the prefix, say the base, and blend the whole word.',
    ),
    contentVersion: COMMON_PREFIX_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: COMMON_PREFIX_LESSON_IDS.guidedDisMis,
    worldId: 'word-forge',
    unitId: 'wg-unit-3',
    activityId: 'activity-word-forge-common-prefixes-guided-dis-mis',
    difficulty: 5,
    passageIdentifiers: [COMMON_PREFIX_PASSAGE_IDS.scienceNotebook],
    questionIdentifiers: [...COMMON_PREFIX_QUESTION_IDS.guidedDisMis],
    lessonTitle: 'Trail 5 Guided Practice: DIS- and MIS-',
    lessonObjective: 'Read dis- and mis- words by blending the prefix and base word.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedTeaching(
      'Prefix Meanings',
      'Dis- often means not, opposite, or apart. Mis- often means wrongly or incorrectly. We read the prefix, read the base word, blend the whole word, and use the sentence to check the meaning.',
      ['dis | like', 'mis | count', 'mis | spell'],
      'We do not split the base word away from its meaning.',
      'Read the prefix and the base word together.',
    ),
    contentVersion: COMMON_PREFIX_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: COMMON_PREFIX_LESSON_IDS.checkpointA,
    worldId: 'word-forge',
    unitId: 'wg-unit-3',
    activityId: 'activity-word-forge-common-prefixes-checkpoint-a',
    difficulty: 5,
    passageIdentifiers: [
      COMMON_PREFIX_PASSAGE_IDS.readingCircle,
      COMMON_PREFIX_PASSAGE_IDS.supplyCart,
      COMMON_PREFIX_PASSAGE_IDS.communityProject,
    ],
    questionIdentifiers: [...COMMON_PREFIX_QUESTION_IDS.checkpointA],
    lessonTitle: 'Prefix Power Trail 5 Checkpoint A',
    lessonObjective: 'Show independent reading with common prefixes and base-word review.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: COMMON_PREFIX_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: COMMON_PREFIX_LESSON_IDS.checkpointB,
    worldId: 'word-forge',
    unitId: 'wg-unit-3',
    activityId: 'activity-word-forge-common-prefixes-checkpoint-b',
    difficulty: 5,
    passageIdentifiers: [
      COMMON_PREFIX_PASSAGE_IDS.communityProject,
      COMMON_PREFIX_PASSAGE_IDS.rebuildCorner,
      COMMON_PREFIX_PASSAGE_IDS.cookingDemo,
      COMMON_PREFIX_PASSAGE_IDS.schoolPreview,
      COMMON_PREFIX_PASSAGE_IDS.scienceNotebook,
    ],
    questionIdentifiers: [...COMMON_PREFIX_QUESTION_IDS.checkpointB],
    lessonTitle: 'Prefix Power Trail 5 Checkpoint B',
    lessonObjective: 'Show independent reading with common prefixes and base-word review.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: COMMON_PREFIX_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: COMMON_PREFIX_LESSON_IDS.checkpointC,
    worldId: 'word-forge',
    unitId: 'wg-unit-3',
    activityId: 'activity-word-forge-common-prefixes-checkpoint-c',
    difficulty: 5,
    passageIdentifiers: [
      COMMON_PREFIX_PASSAGE_IDS.cookingDemo,
      COMMON_PREFIX_PASSAGE_IDS.schoolPreview,
      COMMON_PREFIX_PASSAGE_IDS.scienceNotebook,
      COMMON_PREFIX_PASSAGE_IDS.readingCircle,
      COMMON_PREFIX_PASSAGE_IDS.supplyCart,
    ],
    questionIdentifiers: [...COMMON_PREFIX_QUESTION_IDS.checkpointC],
    lessonTitle: 'Prefix Power Trail 5 Checkpoint C',
    lessonObjective: 'Show independent reading with common prefixes and base-word review.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: COMMON_PREFIX_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]
