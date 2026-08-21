import type { ContentPackLesson, ContentPackManifest } from '../../../contentPackTypes'
import {
  STORY_MAP_CONTENT_VERSION,
  STORY_MAP_LESSON_IDS,
  STORY_MAP_PACK_ID,
  STORY_MAP_PACK_TITLE,
  STORY_MAP_PASSAGE_IDS,
} from './ids'
import {
  storyMapBuildingBlockQuestions,
} from './questionsBuildingBlock'
import { storyMapCheckpointQuestions } from './questionsCheckpoint'
import { storyMapGuidedQuestions } from './questionsGuided'

const storyMapQuestionIds = [
  ...storyMapBuildingBlockQuestions,
  ...storyMapGuidedQuestions,
  ...storyMapCheckpointQuestions,
].map((question) => question.questionIdentifier)

const storyMapLessonDefinitions = [
  {
    lessonId: STORY_MAP_LESSON_IDS.guidedA,
    worldId: 'story-scouts',
    unitId: 'ss-unit-1',
    activityId: 'activity-story-map-guided-a',
    difficulty: 0,
    passageIdentifiers: [STORY_MAP_PASSAGE_IDS.gardenSign],
    questionIdentifiers: storyMapBuildingBlockQuestions
      .filter((question) => question.lessonIdentifier === STORY_MAP_LESSON_IDS.guidedA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Guided Practice: Garden Sign Clues',
    lessonObjective: 'Use a garden story to notice the setting, the problem, and the fix.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Find the Story Pieces',
      explanation:
        'A story has a beginning, a middle, and an end. We look for who is in the story, where it happens, when it happens, and what problem needs a fix.',
      examples: [
        'Who is in the story?',
        'Where does the story happen?',
        'What problem does the character face?',
      ],
      contrast: 'Not every story part is the same size, but every part helps us understand the plot.',
      learnerCue: 'Look for the who, where, when, problem, and fix.',
    },
    contentVersion: STORY_MAP_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: STORY_MAP_LESSON_IDS.guidedB,
    worldId: 'story-scouts',
    unitId: 'ss-unit-1',
    activityId: 'activity-story-map-guided-b',
    difficulty: 0,
    passageIdentifiers: [STORY_MAP_PASSAGE_IDS.libraryCard],
    questionIdentifiers: storyMapBuildingBlockQuestions
      .filter((question) => question.lessonIdentifier === STORY_MAP_LESSON_IDS.guidedB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Guided Practice: Library Card Clues',
    lessonObjective: 'Use a library story to find the main character and the setting clues.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Read the Clues',
      explanation:
        'Setting tells where and when the story happens. Characters show feelings and actions that help us follow the plot.',
      examples: ['after school', 'in the library', 'Jamal felt proud'],
      contrast: 'A good clue can tell us both the place and the time.',
      learnerCue: 'Read the whole story and check the clues around the problem.',
    },
    contentVersion: STORY_MAP_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: STORY_MAP_LESSON_IDS.guidedC,
    worldId: 'story-scouts',
    unitId: 'ss-unit-1',
    activityId: 'activity-story-map-guided-c',
    difficulty: 1,
    passageIdentifiers: [STORY_MAP_PASSAGE_IDS.trailCleanup],
    questionIdentifiers: storyMapGuidedQuestions
      .filter((question) => question.lessonIdentifier === STORY_MAP_LESSON_IDS.guidedC)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Guided Practice: Trail Cleanup Clues',
    lessonObjective: 'Use a trail story to find the problem, the sequence, and the ending.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Follow the Order',
      explanation:
        'The beginning shows what happens first. The middle shows important events. The end shows how the problem gets fixed.',
      examples: ['first', 'then', 'at the end'],
      contrast: 'If the order does not make sense, read the story again.',
      learnerCue: 'First, middle, end, and then check the fix.',
    },
    contentVersion: STORY_MAP_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: STORY_MAP_LESSON_IDS.guidedD,
    worldId: 'story-scouts',
    unitId: 'ss-unit-1',
    activityId: 'activity-story-map-guided-d',
    difficulty: 1,
    passageIdentifiers: [STORY_MAP_PASSAGE_IDS.birdBoxStorm],
    questionIdentifiers: storyMapGuidedQuestions
      .filter((question) => question.lessonIdentifier === STORY_MAP_LESSON_IDS.guidedD)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Guided Practice: Bird Box Clues',
    lessonObjective: 'Use a bird-box story to notice the setting, the problem, and the resolution.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Track the Story',
      explanation:
        'A story clue can show where the action happens, what the problem is, and how the characters fix it.',
      examples: ['school yard', 'before the storm', 'the box was safe again'],
      contrast: 'The details work together to show the whole story.',
      learnerCue: 'Look for the clues that tell the story from start to finish.',
    },
    contentVersion: STORY_MAP_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: STORY_MAP_LESSON_IDS.checkpointA,
    worldId: 'story-scouts',
    unitId: 'ss-unit-1',
    activityId: 'activity-story-map-checkpoint-a',
    difficulty: 1,
    passageIdentifiers: [
      STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
      STORY_MAP_PASSAGE_IDS.bridgeModel,
      STORY_MAP_PASSAGE_IDS.seedlingsRain,
    ],
    questionIdentifiers: storyMapCheckpointQuestions
      .filter((question) => question.lessonIdentifier === STORY_MAP_LESSON_IDS.checkpointA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Story Map Checkpoint: Cleanup, Bridge, and Seedlings',
    lessonObjective: 'Prove story elements, sequence, and resolution with fresh reading.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: STORY_MAP_LESSON_IDS.checkpointB,
    worldId: 'story-scouts',
    unitId: 'ss-unit-1',
    activityId: 'activity-story-map-checkpoint-b',
    difficulty: 1,
    passageIdentifiers: [
      STORY_MAP_PASSAGE_IDS.bridgeModel,
      STORY_MAP_PASSAGE_IDS.seedlingsRain,
      STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
    ],
    questionIdentifiers: storyMapCheckpointQuestions
      .filter((question) => question.lessonIdentifier === STORY_MAP_LESSON_IDS.checkpointB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Story Map Checkpoint: Bridge, Seedlings, and Cleanup',
    lessonObjective: 'Prove story elements, sequence, and resolution with fresh reading.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: STORY_MAP_LESSON_IDS.checkpointC,
    worldId: 'story-scouts',
    unitId: 'ss-unit-1',
    activityId: 'activity-story-map-checkpoint-c',
    difficulty: 1,
    passageIdentifiers: [
      STORY_MAP_PASSAGE_IDS.seedlingsRain,
      STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
      STORY_MAP_PASSAGE_IDS.bridgeModel,
    ],
    questionIdentifiers: storyMapCheckpointQuestions
      .filter((question) => question.lessonIdentifier === STORY_MAP_LESSON_IDS.checkpointC)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Story Map Checkpoint: Seedlings, Cleanup, and Bridge',
    lessonObjective: 'Prove story elements, sequence, and resolution with fresh reading.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: STORY_MAP_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
] satisfies ContentPackLesson[]

export const grade2StoryScoutsPlotStructureElementsManifest: ContentPackManifest = {
  packId: STORY_MAP_PACK_ID,
  packTitle: STORY_MAP_PACK_TITLE,
  gradeBand: 2,
  worldId: 'story-scouts',
  unitId: 'ss-unit-1',
  primarySkillId: 'g2-story-scouts-prose',
  benchmarkReferences: ['ELA.2.R.1.1'],
  partialBenchmarkCoverage: 'Story Map coverage of plot structure, setting, characters, and sequence of events',
  difficultyRange: [0, 1],
  contentVersion: STORY_MAP_CONTENT_VERSION,
  reviewStatus: 'DRAFT',
  coveredPatterns: [
    'plot-structure',
    'setting',
    'characters',
    'sequence-of-events',
    'plot-beginning-middle-end',
    'plot-problem-resolution',
    'setting-where',
    'setting-when',
    'character-traits',
    'character-feelings',
    'character-behaviors',
    'event-sequencing',
  ],
  passageIds: [
    STORY_MAP_PASSAGE_IDS.gardenSign,
    STORY_MAP_PASSAGE_IDS.libraryCard,
    STORY_MAP_PASSAGE_IDS.trailCleanup,
    STORY_MAP_PASSAGE_IDS.birdBoxStorm,
    STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
    STORY_MAP_PASSAGE_IDS.bridgeModel,
    STORY_MAP_PASSAGE_IDS.seedlingsRain,
  ],
  questionIds: storyMapQuestionIds,
  lessonIds: [
    STORY_MAP_LESSON_IDS.guidedA,
    STORY_MAP_LESSON_IDS.guidedB,
    STORY_MAP_LESSON_IDS.guidedC,
    STORY_MAP_LESSON_IDS.guidedD,
    STORY_MAP_LESSON_IDS.checkpointA,
    STORY_MAP_LESSON_IDS.checkpointB,
    STORY_MAP_LESSON_IDS.checkpointC,
  ],
}

export const storyMapLessons = storyMapLessonDefinitions
