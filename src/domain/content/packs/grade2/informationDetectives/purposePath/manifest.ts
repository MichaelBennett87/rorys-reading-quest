import type { ContentPackLesson, ContentPackManifest } from '../../../contentPackTypes'
import { purposePathCheckpointQuestions } from './questionsCheckpoint'
import { purposePathGuidedQuestions } from './questionsGuided'
import { purposePathPrerequisiteQuestions } from './questionsPrerequisite'
import {
  purposePathContentVersion,
  purposePathLessonIds,
  purposePathPackId,
  purposePathPassageIds,
} from './ids'

const purposePathQuestionIds = [
  ...purposePathPrerequisiteQuestions,
  ...purposePathGuidedQuestions,
  ...purposePathCheckpointQuestions,
].map((question) => question.questionIdentifier)

export const purposePathLessons = [
  {
    lessonId: purposePathLessonIds.prereqTopicPurposeDetail,
    worldId: 'information-detectives',
    unitId: 'id-unit-3',
    activityId: 'activity-author-purpose-topic-vs-author-purpose',
    difficulty: 2,
    passageIdentifiers: [purposePathPassageIds.rainGaugeReadings.passageId],
    questionIdentifiers: purposePathPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === purposePathLessonIds.prereqTopicPurposeDetail)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Topic, Purpose, or Detail?',
    lessonObjective: "Tell the topic apart from the author's purpose in a short informational text.",
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Topic is not the same as author purpose',
      explanation:
        'The topic tells what the text is about. The author purpose tells the most important point the author wants the reader to understand about the topic.',
      examples: [
        'A topic can be a short phrase like rain gardens.',
        'An author purpose is a complete thought, not just the topic name.',
        'Relevant details are important facts that connect closely to the author purpose.',
      ],
      contrast: 'A detail is true, but it is not always the best detail to tell the main point.',
      learnerCue: 'Ask whether the answer names the topic, the author purpose, or a detail.',
    },
    contentVersion: purposePathContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: purposePathLessonIds.prereqFindAuthorGoal,
    worldId: 'information-detectives',
    unitId: 'id-unit-3',
    activityId: 'activity-author-purpose-find-most-relevant-details',
    difficulty: 2,
    passageIdentifiers: [purposePathPassageIds.nestBuilderNotes.passageId],
    questionIdentifiers: purposePathPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === purposePathLessonIds.prereqFindAuthorGoal)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Find the Author\'s Goal',
    lessonObjective: 'Choose the details that matter most for an author purpose.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Look for the details that matter most',
      explanation:
        'Relevant details are important facts that connect closely to the author purpose. A text can also include another true detail that is not one of the best details for the author purpose.',
      examples: [
        'A relevant detail helps the reader understand the main point.',
        'Another true detail may be interesting, but it is not one of the best details for the author purpose.',
        'The best details often repeat or connect across sections.',
      ],
      contrast: 'The best details help the author purpose stand out clearly.',
      learnerCue: 'Choose the details that fit the main point best.',
    },
    contentVersion: purposePathContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: purposePathLessonIds.guidedExplainWhatTryingToExplain,
    worldId: 'information-detectives',
    unitId: 'id-unit-3',
    activityId: 'activity-author-purpose-across-sections',
    difficulty: 3,
    passageIdentifiers: [purposePathPassageIds.beePollenPath.passageId],
    questionIdentifiers: purposePathGuidedQuestions
      .filter((question) => question.lessonIdentifier === purposePathLessonIds.guidedExplainWhatTryingToExplain)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'What Is the Author Trying to Explain?',
    lessonObjective: 'Use details from more than one section to identify the author purpose.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Use details from more than one section',
      explanation:
        'An author purpose can appear across the whole passage. Readers look at the title, headings, and body details to choose the best complete thought.',
      examples: [
        'One section may give one important detail.',
        'Another section may add a second detail that points to the same idea.',
        'The author\'s purpose explains why the author wrote the passage.',
      ],
      contrast: 'Do not stop at one detail if the passage gives several important details that point to the same idea.',
      learnerCue: 'Put the important details together and name the big idea.',
    },
    contentVersion: purposePathContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: purposePathLessonIds.guidedUseWholeTextPurpose,
    worldId: 'information-detectives',
    unitId: 'id-unit-3',
    activityId: 'activity-author-purpose-put-important-details-together',
    difficulty: 3,
    passageIdentifiers: [purposePathPassageIds.trailMarkerSystem.passageId],
    questionIdentifiers: purposePathGuidedQuestions
      .filter((question) => question.lessonIdentifier === purposePathLessonIds.guidedUseWholeTextPurpose)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Use the Whole Text to Find the Purpose',
    lessonObjective: 'Use the important details to identify a complete author purpose.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Build the purpose from the details',
      explanation:
        'Sometimes the author purpose is stated clearly. Other times the reader has to use important details to figure out the complete thought that best fits the passage.',
      examples: [
        'A stated author purpose can be shown in one clear sentence.',
        'An inferred author purpose is found by putting important details together.',
        'Relevant details are more useful than another true detail that does not fit the main point as well.',
      ],
      contrast: 'The best answer should be a complete thought, not just the topic name or one true detail.',
      learnerCue: 'Ask what the details are telling the reader about the topic.',
    },
    contentVersion: purposePathContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: purposePathLessonIds.checkpointA,
    worldId: 'information-detectives',
    unitId: 'id-unit-3',
    activityId: 'activity-author-purpose-checkpoint-a',
    difficulty: 3,
    passageIdentifiers: [
      purposePathPassageIds.shadeGardenStudy.passageId,
      purposePathPassageIds.recyclingSortStation.passageId,
      purposePathPassageIds.compostChangeNotes.passageId,
    ],
    questionIdentifiers: purposePathCheckpointQuestions
      .filter((question) => question.lessonIdentifier === purposePathLessonIds.checkpointA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Purpose Path Checkpoint A',
    lessonObjective: 'Show independent reading with topic, author purpose, and relevant details.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: purposePathContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: purposePathLessonIds.checkpointB,
    worldId: 'information-detectives',
    unitId: 'id-unit-3',
    activityId: 'activity-author-purpose-checkpoint-b',
    difficulty: 3,
    passageIdentifiers: [
      purposePathPassageIds.recyclingSortStation.passageId,
      purposePathPassageIds.compostChangeNotes.passageId,
      purposePathPassageIds.shadeGardenStudy.passageId,
    ],
    questionIdentifiers: purposePathCheckpointQuestions
      .filter((question) => question.lessonIdentifier === purposePathLessonIds.checkpointB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Purpose Path Checkpoint B',
    lessonObjective: 'Show independent reading with topic, author purpose, and relevant details.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: purposePathContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: purposePathLessonIds.checkpointC,
    worldId: 'information-detectives',
    unitId: 'id-unit-3',
    activityId: 'activity-author-purpose-checkpoint-c',
    difficulty: 3,
    passageIdentifiers: [
      purposePathPassageIds.compostChangeNotes.passageId,
      purposePathPassageIds.shadeGardenStudy.passageId,
      purposePathPassageIds.recyclingSortStation.passageId,
    ],
    questionIdentifiers: purposePathCheckpointQuestions
      .filter((question) => question.lessonIdentifier === purposePathLessonIds.checkpointC)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Purpose Path Checkpoint C',
    lessonObjective: 'Show independent reading with topic, author purpose, and relevant details.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: purposePathContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
] satisfies ContentPackLesson[]

const purposePathLessonIdList = purposePathLessons.map((lesson) => lesson.lessonId)
const purposePathPassageIdList = [
  purposePathPassageIds.rainGaugeReadings.passageId,
  purposePathPassageIds.nestBuilderNotes.passageId,
  purposePathPassageIds.beePollenPath.passageId,
  purposePathPassageIds.trailMarkerSystem.passageId,
  purposePathPassageIds.shadeGardenStudy.passageId,
  purposePathPassageIds.recyclingSortStation.passageId,
  purposePathPassageIds.compostChangeNotes.passageId,
]

export const grade2InformationDetectivesPurposePathManifest: ContentPackManifest = {
  packId: purposePathPackId,
  packTitle: 'Grade 2 Information Detectives: Purpose Path',
  gradeBand: 2,
  worldId: 'information-detectives',
  unitId: 'id-unit-3',
  primarySkillId: 'g2-information-detectives-reading',
  benchmarkReferences: ['ELA.2.R.2.3'],
  partialBenchmarkCoverage: 'Author purpose identification in Grade 2 informational texts, without the Grade 3 explanation-of-support requirement',
  difficultyRange: [2, 3],
  contentVersion: purposePathContentVersion,
  reviewStatus: 'DRAFT',
  coverageKind: 'benchmark',
  lessonIds: purposePathLessonIdList,
  passageIds: purposePathPassageIdList,
  questionIds: purposePathQuestionIds,
  coveredPatterns: [
    'informational-author-purpose',
    'author-purpose-specific',
    'purpose-vs-topic',
    'purpose-vs-central-idea',
    'purpose-vs-detail',
    'purpose-from-text-clues',
    'purpose-from-multiple-sections',
    'explain-how-purpose',
    'describe-purpose',
    'teach-about-purpose',
    'explain-process-purpose',
    'explain-why-purpose',
    'purpose-supported-by-text',
  ],
}





