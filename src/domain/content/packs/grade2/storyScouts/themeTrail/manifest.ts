import type { ContentPackLesson, ContentPackManifest } from '../../../contentPackTypes'
import {
  THEME_TRAIL_CONTENT_VERSION,
  THEME_TRAIL_LESSON_IDS,
  THEME_TRAIL_PACK_ID,
  THEME_TRAIL_PACK_TITLE,
  THEME_TRAIL_PASSAGE_IDS,
} from './ids'
import { themeTrailCheckpointQuestions } from './questionsCheckpoint'
import { themeTrailGuidedQuestions } from './questionsGuided'
import { themeTrailPrerequisiteQuestions } from './questionsPrerequisite'

const themeTrailQuestionIds = [
  ...themeTrailPrerequisiteQuestions,
  ...themeTrailGuidedQuestions,
  ...themeTrailCheckpointQuestions,
].map((question) => question.questionIdentifier)

const themeTrailLessonDefinitions = [
  {
    lessonId: THEME_TRAIL_LESSON_IDS.prerequisiteA,
    worldId: 'story-scouts',
    unitId: 'ss-unit-2',
    activityId: 'activity-theme-trail-prerequisite-a',
    difficulty: 1,
    passageIdentifiers: [
      THEME_TRAIL_PASSAGE_IDS.gardenHelp,
      THEME_TRAIL_PASSAGE_IDS.libraryPause,
      THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
    ],
    questionIdentifiers: themeTrailPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === THEME_TRAIL_LESSON_IDS.prerequisiteA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Theme Trail Guide: Topic, Summary, or Theme?',
    lessonObjective: 'Use a garden story to tell the difference between a topic, a summary, and a theme.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Look for the Big Message',
      explanation:
        'A theme is a big message or idea a story shows about people, choices, or life. A topic is a short label, and a summary tells the important events.',
      examples: [
        'A topic is a short phrase like fixing the sign.',
        'A theme is a complete thought like asking for help can make a hard task easier.',
        'A summary tells what happened in order.',
      ],
      contrast: 'A topic names the subject, but a theme tells the bigger message.',
      learnerCue: 'Notice the topic, the summary, and the bigger message.',
    },
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: THEME_TRAIL_LESSON_IDS.prerequisiteB,
    worldId: 'story-scouts',
    unitId: 'ss-unit-2',
    activityId: 'activity-theme-trail-prerequisite-b',
    difficulty: 1,
    passageIdentifiers: [
      THEME_TRAIL_PASSAGE_IDS.libraryPause,
      THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
      THEME_TRAIL_PASSAGE_IDS.springFair,
    ],
    questionIdentifiers: themeTrailPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === THEME_TRAIL_LESSON_IDS.prerequisiteB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Theme Trail Guide: Find the Story’s Big Message',
    lessonObjective: 'Use a library story to explain the best-supported theme and the details that support it.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Tell the Theme in a Full Sentence',
      explanation:
        'A strong theme is a complete thought. We look at what the character does, what happens, and how the story ends to decide which theme is best supported.',
      examples: [
        'Being patient can help someone notice important details.',
        'A topic can be sorting books.',
        'A summary can tell the events in order.',
      ],
      contrast: 'The best-supported theme is a complete thought, not just a topic word.',
      learnerCue: 'Use the story details to tell the big message in a full sentence.',
    },
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: THEME_TRAIL_LESSON_IDS.guidedA,
    worldId: 'story-scouts',
    unitId: 'ss-unit-2',
    activityId: 'activity-theme-trail-guided-a',
    difficulty: 2,
    passageIdentifiers: [
      THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
      THEME_TRAIL_PASSAGE_IDS.springFair,
      THEME_TRAIL_PASSAGE_IDS.modelBridge,
    ],
    questionIdentifiers: themeTrailGuidedQuestions
      .filter((question) => question.lessonIdentifier === THEME_TRAIL_LESSON_IDS.guidedA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Theme Trail Practice: Truth and Trust',
    lessonObjective: 'Use a school story to connect choices, actions, and the theme.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Choices Matter',
      explanation:
        'A character’s choices and actions help us understand the theme. We check the problem, the helpful choice, and the result to find the best-supported theme.',
      examples: [
        'Telling the truth can help solve a problem.',
        'A character action can point to the theme.',
        'The ending can show the story’s message.',
      ],
      contrast: 'The theme is bigger than one event, but the events help prove it.',
      learnerCue: 'Look at the choice, the action, and the result.',
    },
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: THEME_TRAIL_LESSON_IDS.guidedB,
    worldId: 'story-scouts',
    unitId: 'ss-unit-2',
    activityId: 'activity-theme-trail-guided-b',
    difficulty: 2,
    passageIdentifiers: [
      THEME_TRAIL_PASSAGE_IDS.springFair,
      THEME_TRAIL_PASSAGE_IDS.modelBridge,
      THEME_TRAIL_PASSAGE_IDS.birdhousePlan,
    ],
    questionIdentifiers: themeTrailGuidedQuestions
      .filter((question) => question.lessonIdentifier === THEME_TRAIL_LESSON_IDS.guidedB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Theme Trail Practice: Careful Preparation',
    lessonObjective: 'Use a fair story to connect actions, events, and the theme.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Look Ahead and Prepare',
      explanation:
        'Sometimes a story shows that careful preparation prevents a bigger problem. We use the character’s actions, the weather clue, and the outcome to support the theme.',
      examples: [
        'A forecast can give an important clue.',
        'Careful preparation can keep supplies safe.',
        'A calm ending can prove the plan worked.',
      ],
      contrast: 'A summary tells what happened, but the theme tells the larger idea.',
      learnerCue: 'Check the clue, the action, and the outcome.',
    },
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: THEME_TRAIL_LESSON_IDS.checkpointA,
    worldId: 'story-scouts',
    unitId: 'ss-unit-2',
    activityId: 'activity-theme-trail-checkpoint-a',
    difficulty: 2,
    passageIdentifiers: [
      THEME_TRAIL_PASSAGE_IDS.modelBridge,
      THEME_TRAIL_PASSAGE_IDS.birdhousePlan,
      THEME_TRAIL_PASSAGE_IDS.bookSwapTrust,
    ],
    questionIdentifiers: themeTrailCheckpointQuestions
      .filter((question) => question.lessonIdentifier === THEME_TRAIL_LESSON_IDS.checkpointA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Theme Trail Checkpoint A',
    lessonObjective: 'Show independent reading with theme, topic, summary, and supporting details.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: THEME_TRAIL_LESSON_IDS.checkpointB,
    worldId: 'story-scouts',
    unitId: 'ss-unit-2',
    activityId: 'activity-theme-trail-checkpoint-b',
    difficulty: 2,
    passageIdentifiers: [
      THEME_TRAIL_PASSAGE_IDS.birdhousePlan,
      THEME_TRAIL_PASSAGE_IDS.bookSwapTrust,
      THEME_TRAIL_PASSAGE_IDS.gardenHelp,
    ],
    questionIdentifiers: themeTrailCheckpointQuestions
      .filter((question) => question.lessonIdentifier === THEME_TRAIL_LESSON_IDS.checkpointB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Theme Trail Checkpoint B',
    lessonObjective: 'Show independent reading with theme, topic, summary, and supporting details.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: THEME_TRAIL_LESSON_IDS.checkpointC,
    worldId: 'story-scouts',
    unitId: 'ss-unit-2',
    activityId: 'activity-theme-trail-checkpoint-c',
    difficulty: 2,
    passageIdentifiers: [
      THEME_TRAIL_PASSAGE_IDS.bookSwapTrust,
      THEME_TRAIL_PASSAGE_IDS.gardenHelp,
      THEME_TRAIL_PASSAGE_IDS.libraryPause,
    ],
    questionIdentifiers: themeTrailCheckpointQuestions
      .filter((question) => question.lessonIdentifier === THEME_TRAIL_LESSON_IDS.checkpointC)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Theme Trail Checkpoint C',
    lessonObjective: 'Show independent reading with theme, topic, summary, and supporting details.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: THEME_TRAIL_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
] satisfies ContentPackLesson[]

export const grade2StoryScoutsThemeTrailManifest: ContentPackManifest = {
  packId: THEME_TRAIL_PACK_ID,
  packTitle: THEME_TRAIL_PACK_TITLE,
  gradeBand: 2,
  worldId: 'story-scouts',
  unitId: 'ss-unit-2',
  primarySkillId: 'g2-story-scouts-prose',
  benchmarkReferences: ['ELA.2.R.1.2'],
  partialBenchmarkCoverage: 'Theme Trail coverage of theme identification, explanation, and supporting literary details',
  difficultyRange: [1, 2],
  contentVersion: THEME_TRAIL_CONTENT_VERSION,
  reviewStatus: 'DRAFT',
  coverageKind: 'benchmark',
  coveredPatterns: [
    'theme-identification',
    'theme-explanation',
    'theme-as-complete-thought',
    'theme-vs-topic',
    'theme-vs-summary',
    'best-supported-theme',
    'theme-supported-by-character-actions',
    'theme-supported-by-events',
    'theme-supported-by-outcome',
    'theme-supported-by-details',
  ],
  passageIds: [
    THEME_TRAIL_PASSAGE_IDS.gardenHelp,
    THEME_TRAIL_PASSAGE_IDS.libraryPause,
    THEME_TRAIL_PASSAGE_IDS.hallwayTruth,
    THEME_TRAIL_PASSAGE_IDS.springFair,
    THEME_TRAIL_PASSAGE_IDS.modelBridge,
    THEME_TRAIL_PASSAGE_IDS.birdhousePlan,
    THEME_TRAIL_PASSAGE_IDS.bookSwapTrust,
  ],
  questionIds: themeTrailQuestionIds,
  lessonIds: [
    THEME_TRAIL_LESSON_IDS.prerequisiteA,
    THEME_TRAIL_LESSON_IDS.prerequisiteB,
    THEME_TRAIL_LESSON_IDS.guidedA,
    THEME_TRAIL_LESSON_IDS.guidedB,
    THEME_TRAIL_LESSON_IDS.checkpointA,
    THEME_TRAIL_LESSON_IDS.checkpointB,
    THEME_TRAIL_LESSON_IDS.checkpointC,
  ],
}

export const themeTrailLessons = themeTrailLessonDefinitions
