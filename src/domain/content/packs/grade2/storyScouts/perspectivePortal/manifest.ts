import type { ContentPackLesson, ContentPackManifest } from '../../../contentPackTypes'
import {
  PERSPECTIVE_PORTAL_CONTENT_VERSION,
  PERSPECTIVE_PORTAL_LESSON_IDS,
  PERSPECTIVE_PORTAL_PACK_ID,
  PERSPECTIVE_PORTAL_PACK_TITLE,
  PERSPECTIVE_PORTAL_PASSAGE_IDS,
} from './ids'
import {
  perspectivePortalCheckpointQuestions,
  perspectivePortalGuidedQuestions,
  perspectivePortalPrerequisiteQuestions,
} from './questions'

const perspectivePortalQuestionIds = [
  ...perspectivePortalPrerequisiteQuestions,
  ...perspectivePortalGuidedQuestions,
  ...perspectivePortalCheckpointQuestions,
].map((question) => question.questionIdentifier)

const perspectivePortalLessonDefinitions = [
  {
    lessonId: PERSPECTIVE_PORTAL_LESSON_IDS.prerequisiteA,
    worldId: 'story-scouts',
    unitId: 'ss-unit-3',
    activityId: 'activity-perspective-portal-prerequisite-a',
    difficulty: 2,
    passageIdentifiers: [
      PERSPECTIVE_PORTAL_PASSAGE_IDS.rainyGarden,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.libraryDisplay,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.trailRoute,
    ],
    questionIdentifiers: perspectivePortalPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === PERSPECTIVE_PORTAL_LESSON_IDS.prerequisiteA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Perspective Portal Guide: What Does Each Character Think?',
    lessonObjective: 'Use a rainy garden story to identify each character’s perspective.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Look for Each Character’s View',
      explanation:
        'A character’s perspective is the way that character thinks about the same situation. We can find it by reading what the character says, does, feels, and chooses.',
      examples: [
        'One character may think the rain is a reason to protect the plants.',
        'Another character may think the rain is only a small problem for now.',
        'The same event can feel different to different characters.',
      ],
      contrast: 'We are not naming the narrator here. We are naming each character’s own view.',
      learnerCue: 'Read the clues and tell what each character thinks.',
    },
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: PERSPECTIVE_PORTAL_LESSON_IDS.prerequisiteB,
    worldId: 'story-scouts',
    unitId: 'ss-unit-3',
    activityId: 'activity-perspective-portal-prerequisite-b',
    difficulty: 2,
    passageIdentifiers: [
      PERSPECTIVE_PORTAL_PASSAGE_IDS.libraryDisplay,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.trailRoute,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.artTable,
    ],
    questionIdentifiers: perspectivePortalPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === PERSPECTIVE_PORTAL_LESSON_IDS.prerequisiteB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Perspective Portal Guide: Same Moment, Different Views',
    lessonObjective: 'Use a library story to explain two different perspectives with story clues.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'One Situation, Two Views',
      explanation:
        'Two characters can see the same moment in different ways. We look for clues in their words, actions, feelings, choices, and what they notice.',
      examples: [
        'One character may want the display to feel bright and welcoming.',
        'Another character may want the labels to stay clear and tidy.',
        'Both ideas can make sense in the same story.',
      ],
      contrast: 'The lesson focus is each character’s view, not the narrator’s point of view.',
      learnerCue: 'Match the clue to the character and tell what it shows.',
    },
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: PERSPECTIVE_PORTAL_LESSON_IDS.guidedA,
    worldId: 'story-scouts',
    unitId: 'ss-unit-3',
    activityId: 'activity-perspective-portal-guided-a',
    difficulty: 3,
    passageIdentifiers: [
      PERSPECTIVE_PORTAL_PASSAGE_IDS.trailRoute,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.artTable,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.seedlingsStorm,
    ],
    questionIdentifiers: perspectivePortalGuidedQuestions
      .filter((question) => question.lessonIdentifier === PERSPECTIVE_PORTAL_LESSON_IDS.guidedA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Perspective Portal Practice: Words and Choices',
    lessonObjective: 'Use a trail story to connect words, choices, and perspective clues.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Use the Clues to Explain the View',
      explanation:
        'The character’s words and choices help show perspective. We can say the perspective as a full thought and point to the clue that fits.',
      examples: [
        'A character may see a new side path as exciting.',
        'A different character may see the familiar marker as safer.',
        'A full thought says what the character thinks about the situation.',
      ],
      contrast: 'A feeling word alone is not enough. The perspective is the larger view.',
      learnerCue: 'Say the perspective in a complete sentence.',
    },
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: PERSPECTIVE_PORTAL_LESSON_IDS.guidedB,
    worldId: 'story-scouts',
    unitId: 'ss-unit-3',
    activityId: 'activity-perspective-portal-guided-b',
    difficulty: 3,
    passageIdentifiers: [
      PERSPECTIVE_PORTAL_PASSAGE_IDS.artTable,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.seedlingsStorm,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.bridgeMeasure,
    ],
    questionIdentifiers: perspectivePortalGuidedQuestions
      .filter((question) => question.lessonIdentifier === PERSPECTIVE_PORTAL_LESSON_IDS.guidedB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Perspective Portal Practice: Feelings, Noticing, and Actions',
    lessonObjective: 'Use an art table story to connect feelings, noticing, and perspective clues.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Gather the Clues',
      explanation:
        'What a character notices, feels, and does can help us explain that character’s perspective. We stay focused on the character’s own view.',
      examples: [
        'A character may think sorting first will keep the table ready.',
        'Another character may think a banner first will feel welcoming.',
        'The clues should fit the story details.',
      ],
      contrast: 'This is about the character’s perspective, not how the narrator tells the story.',
      learnerCue: 'Use the clues to tell what the character sees, thinks, or wants.',
    },
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: PERSPECTIVE_PORTAL_LESSON_IDS.checkpointA,
    worldId: 'story-scouts',
    unitId: 'ss-unit-3',
    activityId: 'activity-perspective-portal-checkpoint-a',
    difficulty: 3,
    passageIdentifiers: [
      PERSPECTIVE_PORTAL_PASSAGE_IDS.seedlingsStorm,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.bridgeMeasure,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.cleanupWater,
    ],
    questionIdentifiers: perspectivePortalCheckpointQuestions
      .filter((question) => question.lessonIdentifier === PERSPECTIVE_PORTAL_LESSON_IDS.checkpointA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Perspective Portal Checkpoint A',
    lessonObjective: 'Show independent reading with two perspectives, evidence, and shared-situation clues.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: PERSPECTIVE_PORTAL_LESSON_IDS.checkpointB,
    worldId: 'story-scouts',
    unitId: 'ss-unit-3',
    activityId: 'activity-perspective-portal-checkpoint-b',
    difficulty: 3,
    passageIdentifiers: [
      PERSPECTIVE_PORTAL_PASSAGE_IDS.bridgeMeasure,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.cleanupWater,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.rainyGarden,
    ],
    questionIdentifiers: perspectivePortalCheckpointQuestions
      .filter((question) => question.lessonIdentifier === PERSPECTIVE_PORTAL_LESSON_IDS.checkpointB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Perspective Portal Checkpoint B',
    lessonObjective: 'Show independent reading with two perspectives, evidence, and shared-situation clues.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: PERSPECTIVE_PORTAL_LESSON_IDS.checkpointC,
    worldId: 'story-scouts',
    unitId: 'ss-unit-3',
    activityId: 'activity-perspective-portal-checkpoint-c',
    difficulty: 3,
    passageIdentifiers: [
      PERSPECTIVE_PORTAL_PASSAGE_IDS.cleanupWater,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.rainyGarden,
      PERSPECTIVE_PORTAL_PASSAGE_IDS.libraryDisplay,
    ],
    questionIdentifiers: perspectivePortalCheckpointQuestions
      .filter((question) => question.lessonIdentifier === PERSPECTIVE_PORTAL_LESSON_IDS.checkpointC)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Perspective Portal Checkpoint C',
    lessonObjective: 'Show independent reading with two perspectives, evidence, and shared-situation clues.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
] satisfies ContentPackLesson[]

export const grade2StoryScoutsPerspectivePortalManifest: ContentPackManifest = {
  packId: PERSPECTIVE_PORTAL_PACK_ID,
  packTitle: PERSPECTIVE_PORTAL_PACK_TITLE,
  gradeBand: 2,
  worldId: 'story-scouts',
  unitId: 'ss-unit-3',
  primarySkillId: 'g2-story-scouts-prose',
  benchmarkReferences: ['ELA.2.R.1.3'],
  partialBenchmarkCoverage: 'Perspective Portal coverage of character perspective identification and comparison',
  difficultyRange: [2, 3],
  contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
  reviewStatus: 'DRAFT',
  coverageKind: 'benchmark',
  coveredPatterns: [
    'character-perspective-identification',
    'different-character-perspectives',
    'perspective-as-attitude',
    'shared-event-different-views',
    'perspective-from-words',
    'perspective-from-actions',
    'perspective-from-feelings',
    'perspective-from-choices',
    'perspective-from-noticing',
    'perspective-supported-by-details',
    'perspective-vs-narrator-point-of-view',
  ],
  passageIds: [
    PERSPECTIVE_PORTAL_PASSAGE_IDS.rainyGarden,
    PERSPECTIVE_PORTAL_PASSAGE_IDS.libraryDisplay,
    PERSPECTIVE_PORTAL_PASSAGE_IDS.trailRoute,
    PERSPECTIVE_PORTAL_PASSAGE_IDS.artTable,
    PERSPECTIVE_PORTAL_PASSAGE_IDS.seedlingsStorm,
    PERSPECTIVE_PORTAL_PASSAGE_IDS.bridgeMeasure,
    PERSPECTIVE_PORTAL_PASSAGE_IDS.cleanupWater,
  ],
  questionIds: perspectivePortalQuestionIds,
  lessonIds: [
    PERSPECTIVE_PORTAL_LESSON_IDS.prerequisiteA,
    PERSPECTIVE_PORTAL_LESSON_IDS.prerequisiteB,
    PERSPECTIVE_PORTAL_LESSON_IDS.guidedA,
    PERSPECTIVE_PORTAL_LESSON_IDS.guidedB,
    PERSPECTIVE_PORTAL_LESSON_IDS.checkpointA,
    PERSPECTIVE_PORTAL_LESSON_IDS.checkpointB,
    PERSPECTIVE_PORTAL_LESSON_IDS.checkpointC,
  ],
}

export const perspectivePortalLessons = perspectivePortalLessonDefinitions
