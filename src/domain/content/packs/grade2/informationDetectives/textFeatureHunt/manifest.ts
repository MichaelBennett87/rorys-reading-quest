import type { ContentPackLesson, ContentPackManifest } from '../../../contentPackTypes'
import { textFeatureHuntCheckpointQuestions } from './questionsCheckpoint'
import { textFeatureHuntBuildingBlockQuestions } from './questionsBuildingBlock'
import { textFeatureHuntGuidedQuestions } from './questionsGuided'
import { textFeatureHuntPassages } from './passages'
import {
  TEXT_FEATURE_HUNT_CONTENT_VERSION,
  TEXT_FEATURE_HUNT_LESSON_IDS,
  TEXT_FEATURE_HUNT_PACK_ID,
  TEXT_FEATURE_HUNT_PACK_TITLE,
  TEXT_FEATURE_HUNT_PASSAGE_IDS,
} from './ids'

const textFeatureHuntQuestionIds = [
  ...textFeatureHuntBuildingBlockQuestions,
  ...textFeatureHuntGuidedQuestions,
  ...textFeatureHuntCheckpointQuestions,
].map((question) => question.questionIdentifier)

const textFeatureHuntLessons = [
  {
    lessonId: TEXT_FEATURE_HUNT_LESSON_IDS.buildingBlockA,
    worldId: 'information-detectives',
    unitId: 'id-unit-1',
    activityId: 'activity-text-feature-hunt-building-block-a',
    difficulty: 0,
    passageIdentifiers: [TEXT_FEATURE_HUNT_PASSAGE_IDS.feederWatch],
    questionIdentifiers: textFeatureHuntBuildingBlockQuestions
      .filter((question) => question.lessonIdentifier === TEXT_FEATURE_HUNT_LESSON_IDS.buildingBlockA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Find the Feature',
    lessonObjective: 'Notice titles, headings, captions, graphs, maps, glossaries, and illustrations in informational text.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Look for the feature that helps',
      explanation:
        'Informational text features are parts of a text that help readers find, picture, organize, compare, or understand information. A title gives a clue about the whole text, and a heading tells what one section explains.',
      examples: [
        'A title can preview the topic of the whole text.',
        'A heading can help a reader find one section quickly.',
        'A caption can add a detail about a picture or graph.',
      ],
      contrast: 'The feature and the body text work together to help the reader understand the information.',
      learnerCue: 'Ask what the feature helps me know.',
    },
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: TEXT_FEATURE_HUNT_LESSON_IDS.buildingBlockB,
    worldId: 'information-detectives',
    unitId: 'id-unit-1',
    activityId: 'activity-text-feature-hunt-building-block-b',
    difficulty: 0,
    passageIdentifiers: [TEXT_FEATURE_HUNT_PASSAGE_IDS.gardenGrid],
    questionIdentifiers: textFeatureHuntBuildingBlockQuestions
      .filter((question) => question.lessonIdentifier === TEXT_FEATURE_HUNT_LESSON_IDS.buildingBlockB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Match the Feature to Its Job',
    lessonObjective: 'Explain how an informational feature helps the reader understand the text.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Match the feature to the job',
      explanation:
        'Each feature has a job. A map shows where things are. A glossary explains special words. An illustration helps the reader picture something clearly.',
      examples: [
        'A map can help a reader locate a place.',
        'A glossary can help a reader understand a word.',
        'An illustration can help a reader picture a plant or object.',
      ],
      contrast: 'The best answer tells what the feature adds to meaning, not just its name.',
      learnerCue: 'Say what the feature helps the reader do.',
    },
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: TEXT_FEATURE_HUNT_LESSON_IDS.guidedA,
    worldId: 'information-detectives',
    unitId: 'id-unit-1',
    activityId: 'activity-text-feature-hunt-guided-a',
    difficulty: 1,
    passageIdentifiers: [TEXT_FEATURE_HUNT_PASSAGE_IDS.rainGauge],
    questionIdentifiers: textFeatureHuntGuidedQuestions
      .filter((question) => question.lessonIdentifier === TEXT_FEATURE_HUNT_LESSON_IDS.guidedA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Titles, Headings, Captions, and Illustrations',
    lessonObjective: 'Explain how titles, headings, captions, and illustrations add meaning.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Notice what each feature adds',
      explanation:
        'A title previews the whole topic. A heading names a section. A caption explains a picture, graph, or map. An illustration helps the reader picture the idea.',
      examples: [
        'A heading can help readers find the right section.',
        'A caption can tell what a graph means.',
        'An illustration can show what a place or object looks like.',
      ],
      contrast: 'The feature helps the reader understand the body text instead of replacing it.',
      learnerCue: 'Tell what the feature adds to the text.',
    },
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: TEXT_FEATURE_HUNT_LESSON_IDS.guidedB,
    worldId: 'information-detectives',
    unitId: 'id-unit-1',
    activityId: 'activity-text-feature-hunt-guided-b',
    difficulty: 1,
    passageIdentifiers: [TEXT_FEATURE_HUNT_PASSAGE_IDS.trailMap],
    questionIdentifiers: textFeatureHuntGuidedQuestions
      .filter((question) => question.lessonIdentifier === TEXT_FEATURE_HUNT_LESSON_IDS.guidedB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Graphs, Maps, and Glossaries',
    lessonObjective: 'Explain how graphs, maps, and glossaries add meaning.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Use the feature to learn more',
      explanation:
        'A graph organizes number data so the reader can compare amounts or notice a pattern. A map shows where places are and how they relate. A glossary explains special or unfamiliar words.',
      examples: [
        'A graph can help readers compare amounts.',
        'A map can help readers follow a route.',
        'A glossary can help readers understand a word like route.',
      ],
      contrast: 'The reader uses the feature together with the body text to understand the meaning.',
      learnerCue: 'Ask what new information the feature gives me.',
    },
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: TEXT_FEATURE_HUNT_LESSON_IDS.checkpointA,
    worldId: 'information-detectives',
    unitId: 'id-unit-1',
    activityId: 'activity-text-feature-hunt-checkpoint-a',
    difficulty: 1,
    passageIdentifiers: [
      TEXT_FEATURE_HUNT_PASSAGE_IDS.moonNotes,
      TEXT_FEATURE_HUNT_PASSAGE_IDS.feederWatch,
      TEXT_FEATURE_HUNT_PASSAGE_IDS.rainGauge,
    ],
    questionIdentifiers: textFeatureHuntCheckpointQuestions
      .filter((question) => question.lessonIdentifier === TEXT_FEATURE_HUNT_LESSON_IDS.checkpointA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Text Feature Hunt Checkpoint A',
    lessonObjective: 'Show independent reading with informational text feature meaning.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: TEXT_FEATURE_HUNT_LESSON_IDS.checkpointB,
    worldId: 'information-detectives',
    unitId: 'id-unit-1',
    activityId: 'activity-text-feature-hunt-checkpoint-b',
    difficulty: 1,
    passageIdentifiers: [
      TEXT_FEATURE_HUNT_PASSAGE_IDS.recycleSort,
      TEXT_FEATURE_HUNT_PASSAGE_IDS.gardenGrid,
      TEXT_FEATURE_HUNT_PASSAGE_IDS.trailMap,
    ],
    questionIdentifiers: textFeatureHuntCheckpointQuestions
      .filter((question) => question.lessonIdentifier === TEXT_FEATURE_HUNT_LESSON_IDS.checkpointB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Text Feature Hunt Checkpoint B',
    lessonObjective: 'Show independent reading with informational text feature meaning.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: TEXT_FEATURE_HUNT_LESSON_IDS.checkpointC,
    worldId: 'information-detectives',
    unitId: 'id-unit-1',
    activityId: 'activity-text-feature-hunt-checkpoint-c',
    difficulty: 1,
    passageIdentifiers: [
      TEXT_FEATURE_HUNT_PASSAGE_IDS.compostChange,
      TEXT_FEATURE_HUNT_PASSAGE_IDS.moonNotes,
      TEXT_FEATURE_HUNT_PASSAGE_IDS.gardenGrid,
    ],
    questionIdentifiers: textFeatureHuntCheckpointQuestions
      .filter((question) => question.lessonIdentifier === TEXT_FEATURE_HUNT_LESSON_IDS.checkpointC)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Text Feature Hunt Checkpoint C',
    lessonObjective: 'Show independent reading with informational text feature meaning.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
] satisfies ContentPackLesson[]

const textFeatureHuntLessonIds = textFeatureHuntLessons.map((lesson) => lesson.lessonId)
const textFeatureHuntPassageIds = textFeatureHuntPassages.map((passage) => passage.passageIdentifier)

export const grade2InformationDetectivesTextFeatureHuntManifest: ContentPackManifest = {
  packId: TEXT_FEATURE_HUNT_PACK_ID,
  packTitle: TEXT_FEATURE_HUNT_PACK_TITLE,
  gradeBand: 2,
  worldId: 'information-detectives',
  unitId: 'id-unit-1',
  primarySkillId: 'g2-information-detectives-reading',
  benchmarkReferences: ['ELA.2.R.2.1'],
  partialBenchmarkCoverage: 'Titles, headings, captions, graphs, maps, glossaries, illustrations, and their contribution to informational meaning',
  difficultyRange: [0, 1],
  contentVersion: TEXT_FEATURE_HUNT_CONTENT_VERSION,
  reviewStatus: 'DRAFT',
  coverageKind: 'benchmark',
  lessonIds: textFeatureHuntLessonIds,
  passageIds: textFeatureHuntPassageIds,
  questionIds: textFeatureHuntQuestionIds,
  coveredPatterns: [
    'informational-text-features',
    'feature-meaning',
    'title-contribution',
    'heading-contribution',
    'caption-contribution',
    'graph-contribution',
    'map-contribution',
    'glossary-contribution',
    'illustration-contribution',
    'feature-body-connection',
    'feature-selection-for-purpose',
  ],
}

export { textFeatureHuntLessons }
export { textFeatureHuntQuestionIds }
