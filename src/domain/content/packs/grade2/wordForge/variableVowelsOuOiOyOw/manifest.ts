import type { ContentPackLesson } from '../../../contentPackTypes'
import type { TeachingBlock } from '../../../../../lesson'
import {
  OU_OI_OY_OW_CONTENT_VERSION,
  OU_OI_OY_OW_LESSON_IDS,
  OU_OI_OY_OW_PACK_ID,
  OU_OI_OY_OW_PACK_TITLE,
  OU_OI_OY_OW_PASSAGE_IDS,
  OU_OI_OY_OW_QUESTION_IDS,
} from './ids'

const guidedOuOwTeachingBlock: TeachingBlock = {
  title: 'Look closely at ou and ow',
  explanation: 'ou and ow can make different sounds, so we read the whole word and use the sentence to help us decide.',
  examples: [
    'cloud shows one ou sound',
    'soup shows a different ou sound',
    'snow shows an ow sound',
  ],
  contrast: 'ow can sound like snow, but it can also sound like cow.',
  learnerCue: 'Read the whole word and listen for the clue.',
}

const guidedOiOyTeachingBlock: TeachingBlock = {
  title: 'Look closely at oi and oy',
  explanation: 'oi and oy often share the sound in coin and toy, so we read the whole word and look at where the letters appear.',
  examples: [
    'coin has oi in the middle',
    'toy has oy at the end',
    'join has oi in the middle too',
  ],
  contrast: 'Often means usually, not always.',
  learnerCue: 'Use the word and sentence to help you decide.',
}

export const grade2WordForgeVariableVowelsOuOiOyOwManifest = {
  packId: OU_OI_OY_OW_PACK_ID,
  packTitle: OU_OI_OY_OW_PACK_TITLE,
  gradeBand: 2 as const,
  worldId: 'word-forge',
  unitId: 'wg-unit-1',
  primarySkillId: 'g2-word-forge-word-practice',
  benchmarkReferences: ['ELA.2.F.1.3a'],
  partialBenchmarkCoverage: 'ou, oi, oy, and ow',
  difficultyRange: [1, 2] as const,
  contentVersion: OU_OI_OY_OW_CONTENT_VERSION,
  reviewStatus: 'DRAFT' as const,
  coveredPatterns: ['ou', 'oi', 'oy', 'ow'],
  passageIds: Object.values(OU_OI_OY_OW_PASSAGE_IDS),
  questionIds: [
    ...OU_OI_OY_OW_QUESTION_IDS.guidedOuOwPrereq,
    ...OU_OI_OY_OW_QUESTION_IDS.guidedOiOyPrereq,
    ...OU_OI_OY_OW_QUESTION_IDS.guidedOuOwPractice,
    ...OU_OI_OY_OW_QUESTION_IDS.guidedOiOyPractice,
    ...OU_OI_OY_OW_QUESTION_IDS.checkpointA,
    ...OU_OI_OY_OW_QUESTION_IDS.checkpointB,
    ...OU_OI_OY_OW_QUESTION_IDS.checkpointC,
  ],
  lessonIds: [
    OU_OI_OY_OW_LESSON_IDS.guidedOuOwPrereq,
    OU_OI_OY_OW_LESSON_IDS.guidedOiOyPrereq,
    OU_OI_OY_OW_LESSON_IDS.guidedOuOwPractice,
    OU_OI_OY_OW_LESSON_IDS.guidedOiOyPractice,
    OU_OI_OY_OW_LESSON_IDS.checkpointA,
    OU_OI_OY_OW_LESSON_IDS.checkpointB,
    OU_OI_OY_OW_LESSON_IDS.checkpointC,
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

export const grade2WordForgeVariableVowelsOuOiOyOwLessons: ContentPackLesson[] = [
  {
    lessonId: OU_OI_OY_OW_LESSON_IDS.guidedOuOwPrereq,
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-ou-oi-oy-ow-guided-ou-ow-prereq',
    difficulty: 1,
    passageIdentifiers: [OU_OI_OY_OW_PASSAGE_IDS.cloudTownBoard],
    questionIdentifiers: [...OU_OI_OY_OW_QUESTION_IDS.guidedOuOwPrereq],
    lessonTitle: 'Trail 2 Guide: ou and ow clues',
    lessonObjective: 'Notice how ou and ow can make different sounds in short words.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedOuOwTeachingBlock,
    contentVersion: OU_OI_OY_OW_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: OU_OI_OY_OW_LESSON_IDS.guidedOiOyPrereq,
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-ou-oi-oy-ow-guided-oi-oy-prereq',
    difficulty: 1,
    passageIdentifiers: [OU_OI_OY_OW_PASSAGE_IDS.toySorting],
    questionIdentifiers: [...OU_OI_OY_OW_QUESTION_IDS.guidedOiOyPrereq],
    lessonTitle: 'Trail 2 Guide: oi and oy clues',
    lessonObjective: 'Notice how oi and oy usually show the same sound in middle and ending positions.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedOiOyTeachingBlock,
    contentVersion: OU_OI_OY_OW_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: OU_OI_OY_OW_LESSON_IDS.guidedOuOwPractice,
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-ou-oi-oy-ow-guided-ou-ow-practice',
    difficulty: 2,
    passageIdentifiers: [OU_OI_OY_OW_PASSAGE_IDS.soupWalk],
    questionIdentifiers: [...OU_OI_OY_OW_QUESTION_IDS.guidedOuOwPractice],
    lessonTitle: 'Trail 2 Practice: ou and ow in context',
    lessonObjective: 'Use the whole word and sentence to read more than one ou or ow sound group.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedOuOwTeachingBlock,
    contentVersion: OU_OI_OY_OW_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: OU_OI_OY_OW_LESSON_IDS.guidedOiOyPractice,
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-ou-oi-oy-ow-guided-oi-oy-practice',
    difficulty: 2,
    passageIdentifiers: [OU_OI_OY_OW_PASSAGE_IDS.coinGame],
    questionIdentifiers: [...OU_OI_OY_OW_QUESTION_IDS.guidedOiOyPractice],
    lessonTitle: 'Trail 2 Practice: oi and oy in context',
    lessonObjective: 'Use the whole word and sentence to read more than one oi or oy spelling pattern.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: guidedOiOyTeachingBlock,
    contentVersion: OU_OI_OY_OW_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: OU_OI_OY_OW_LESSON_IDS.checkpointA,
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-ou-oi-oy-ow-checkpoint-a',
    difficulty: 2,
    passageIdentifiers: [OU_OI_OY_OW_PASSAGE_IDS.townFair, OU_OI_OY_OW_PASSAGE_IDS.cleanupMarket, OU_OI_OY_OW_PASSAGE_IDS.scienceWalk],
    questionIdentifiers: [...OU_OI_OY_OW_QUESTION_IDS.checkpointA],
    lessonTitle: 'Word Forge Trail 2 Checkpoint A',
    lessonObjective: 'Show independent reading with ou, oi, oy, and ow patterns in new Trail 2 material.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: OU_OI_OY_OW_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: OU_OI_OY_OW_LESSON_IDS.checkpointB,
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-ou-oi-oy-ow-checkpoint-b',
    difficulty: 2,
    passageIdentifiers: [OU_OI_OY_OW_PASSAGE_IDS.cleanupMarket],
    questionIdentifiers: [...OU_OI_OY_OW_QUESTION_IDS.checkpointB],
    lessonTitle: 'Word Forge Trail 2 Checkpoint B',
    lessonObjective: 'Show independent reading with ou, oi, oy, and ow patterns in a fresh passage.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: OU_OI_OY_OW_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: OU_OI_OY_OW_LESSON_IDS.checkpointC,
    worldId: 'word-forge',
    unitId: 'wg-unit-1',
    activityId: 'activity-word-forge-ou-oi-oy-ow-checkpoint-c',
    difficulty: 2,
    passageIdentifiers: [OU_OI_OY_OW_PASSAGE_IDS.scienceWalk],
    questionIdentifiers: [...OU_OI_OY_OW_QUESTION_IDS.checkpointC],
    lessonTitle: 'Word Forge Trail 2 Checkpoint C',
    lessonObjective: 'Show independent reading with ou, oi, oy, and ow patterns in another fresh passage.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: OU_OI_OY_OW_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]
