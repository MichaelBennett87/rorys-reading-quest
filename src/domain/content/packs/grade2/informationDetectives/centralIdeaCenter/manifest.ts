import type { ContentPackLesson, ContentPackManifest } from '../../../contentPackTypes'
import { centralIdeaCenterCheckpointQuestions } from './questionsCheckpoint'
import { centralIdeaCenterGuidedQuestions } from './questionsGuided'
import { centralIdeaCenterPrerequisiteQuestions } from './questionsPrerequisite'
import {
  centralIdeaCenterContentVersion,
  centralIdeaCenterLessonIds,
  centralIdeaCenterPackId,
  centralIdeaCenterPassageIds,
} from './ids'

const centralIdeaCenterQuestionIds = [
  ...centralIdeaCenterPrerequisiteQuestions,
  ...centralIdeaCenterGuidedQuestions,
  ...centralIdeaCenterCheckpointQuestions,
].map((question) => question.questionIdentifier)

export const centralIdeaCenterLessons = [
  {
    lessonId: centralIdeaCenterLessonIds.prereqTopicVsCentralIdea,
    worldId: 'information-detectives',
    unitId: 'id-unit-2',
    activityId: 'activity-central-idea-topic-vs-central-idea',
    difficulty: 1,
    passageIdentifiers: [centralIdeaCenterPassageIds.rainGardenHelpers.passageId],
    questionIdentifiers: centralIdeaCenterPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === centralIdeaCenterLessonIds.prereqTopicVsCentralIdea)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Topic, Central Idea, or Detail?',
    lessonObjective: 'Tell the topic apart from the central idea in a short informational text.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Topic is not the same as central idea',
      explanation:
        'The topic tells what the text is about. The central idea tells the most important point the author wants the reader to understand about the topic.',
      examples: [
        'A topic can be a short phrase like rain gardens.',
        'A central idea is a complete thought, not just the topic name.',
        'Relevant details are important facts that connect closely to the central idea.',
      ],
      contrast: 'A detail is true, but it is not always the best detail to tell the main point.',
      learnerCue: 'Ask whether the answer names the topic, the central idea, or a detail.',
    },
    contentVersion: centralIdeaCenterContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: centralIdeaCenterLessonIds.prereqFindMostRelevantDetails,
    worldId: 'information-detectives',
    unitId: 'id-unit-2',
    activityId: 'activity-central-idea-find-most-relevant-details',
    difficulty: 1,
    passageIdentifiers: [centralIdeaCenterPassageIds.quietShelterSpaces.passageId],
    questionIdentifiers: centralIdeaCenterPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === centralIdeaCenterLessonIds.prereqFindMostRelevantDetails)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Find the Most Relevant Details',
    lessonObjective: 'Choose the details that matter most for a central idea.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Look for the details that matter most',
      explanation:
        'Relevant details are important facts that connect closely to the central idea. A text can also include another true detail that is not one of the best details for the central idea.',
      examples: [
        'A relevant detail helps the reader understand the main point.',
        'Another true detail may be interesting, but it is not one of the best details for the central idea.',
        'The best details often repeat or connect across sections.',
      ],
      contrast: 'The best details help the central idea stand out clearly.',
      learnerCue: 'Choose the details that fit the main point best.',
    },
    contentVersion: centralIdeaCenterContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: centralIdeaCenterLessonIds.guidedAcrossSections,
    worldId: 'information-detectives',
    unitId: 'id-unit-2',
    activityId: 'activity-central-idea-across-sections',
    difficulty: 2,
    passageIdentifiers: [centralIdeaCenterPassageIds.pollinatorPatchCounts.passageId],
    questionIdentifiers: centralIdeaCenterGuidedQuestions
      .filter((question) => question.lessonIdentifier === centralIdeaCenterLessonIds.guidedAcrossSections)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Central Idea Across Sections',
    lessonObjective: 'Use details from more than one section to identify the central idea.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Use details from more than one section',
      explanation:
        'A central idea can appear across the whole passage. Readers look at the title, headings, and body details to choose the best complete thought.',
      examples: [
        'One section may give one important detail.',
        'Another section may add a second detail that points to the same idea.',
        'The central idea is the complete thought those details support together.',
      ],
      contrast: 'Do not stop at one detail if the passage gives several important details that point to the same idea.',
      learnerCue: 'Put the important details together and name the big idea.',
    },
    contentVersion: centralIdeaCenterContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: centralIdeaCenterLessonIds.guidedPutImportantDetailsTogether,
    worldId: 'information-detectives',
    unitId: 'id-unit-2',
    activityId: 'activity-central-idea-put-important-details-together',
    difficulty: 2,
    passageIdentifiers: [centralIdeaCenterPassageIds.weatherStationNotes.passageId],
    questionIdentifiers: centralIdeaCenterGuidedQuestions
      .filter((question) => question.lessonIdentifier === centralIdeaCenterLessonIds.guidedPutImportantDetailsTogether)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Put the Important Details Together',
    lessonObjective: 'Use the important details to identify a complete central idea.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Build the central idea from the details',
      explanation:
        'Sometimes the central idea is stated clearly. Other times the reader has to use important details to figure out the complete thought that best fits the passage.',
      examples: [
        'A stated central idea can be shown in one clear sentence.',
        'An inferred central idea is found by putting important details together.',
        'Relevant details are more useful than another true detail that does not fit the main point as well.',
      ],
      contrast: 'The best answer should be a complete thought, not just the topic name or one true detail.',
      learnerCue: 'Ask what the details are telling the reader about the topic.',
    },
    contentVersion: centralIdeaCenterContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: centralIdeaCenterLessonIds.checkpointA,
    worldId: 'information-detectives',
    unitId: 'id-unit-2',
    activityId: 'activity-central-idea-checkpoint-a',
    difficulty: 2,
    passageIdentifiers: [
      centralIdeaCenterPassageIds.seedTravelRoutes.passageId,
      centralIdeaCenterPassageIds.compostChangeStory.passageId,
      centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId,
    ],
    questionIdentifiers: centralIdeaCenterCheckpointQuestions
      .filter((question) => question.lessonIdentifier === centralIdeaCenterLessonIds.checkpointA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Central Idea Center Checkpoint A',
    lessonObjective: 'Show independent reading with topic, central idea, and relevant details.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: centralIdeaCenterContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: centralIdeaCenterLessonIds.checkpointB,
    worldId: 'information-detectives',
    unitId: 'id-unit-2',
    activityId: 'activity-central-idea-checkpoint-b',
    difficulty: 2,
    passageIdentifiers: [
      centralIdeaCenterPassageIds.compostChangeStory.passageId,
      centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId,
      centralIdeaCenterPassageIds.seedTravelRoutes.passageId,
    ],
    questionIdentifiers: centralIdeaCenterCheckpointQuestions
      .filter((question) => question.lessonIdentifier === centralIdeaCenterLessonIds.checkpointB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Central Idea Center Checkpoint B',
    lessonObjective: 'Show independent reading with topic, central idea, and relevant details.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: centralIdeaCenterContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: centralIdeaCenterLessonIds.checkpointC,
    worldId: 'information-detectives',
    unitId: 'id-unit-2',
    activityId: 'activity-central-idea-checkpoint-c',
    difficulty: 2,
    passageIdentifiers: [
      centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId,
      centralIdeaCenterPassageIds.seedTravelRoutes.passageId,
      centralIdeaCenterPassageIds.compostChangeStory.passageId,
    ],
    questionIdentifiers: centralIdeaCenterCheckpointQuestions
      .filter((question) => question.lessonIdentifier === centralIdeaCenterLessonIds.checkpointC)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Central Idea Center Checkpoint C',
    lessonObjective: 'Show independent reading with topic, central idea, and relevant details.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: centralIdeaCenterContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
] satisfies ContentPackLesson[]

const centralIdeaCenterLessonIdList = centralIdeaCenterLessons.map((lesson) => lesson.lessonId)
const centralIdeaCenterPassageIdList = [
  centralIdeaCenterPassageIds.rainGardenHelpers.passageId,
  centralIdeaCenterPassageIds.quietShelterSpaces.passageId,
  centralIdeaCenterPassageIds.pollinatorPatchCounts.passageId,
  centralIdeaCenterPassageIds.weatherStationNotes.passageId,
  centralIdeaCenterPassageIds.seedTravelRoutes.passageId,
  centralIdeaCenterPassageIds.compostChangeStory.passageId,
  centralIdeaCenterPassageIds.trailMarkersGuideTheWay.passageId,
]

export const grade2InformationDetectivesCentralIdeaCenterManifest: ContentPackManifest = {
  packId: centralIdeaCenterPackId,
  packTitle: 'Grade 2 Information Detectives: Central Idea Center',
  gradeBand: 2,
  worldId: 'information-detectives',
  unitId: 'id-unit-2',
  primarySkillId: 'g2-information-detectives-reading',
  benchmarkReferences: ['ELA.2.R.2.2'],
  partialBenchmarkCoverage: 'Central idea and relevant-detail identification in Grade 2 informational texts, without the Grade 3 explanation-of-support requirement',
  difficultyRange: [1, 2],
  contentVersion: centralIdeaCenterContentVersion,
  reviewStatus: 'DRAFT',
  coverageKind: 'benchmark',
  lessonIds: centralIdeaCenterLessonIdList,
  passageIds: centralIdeaCenterPassageIdList,
  questionIds: centralIdeaCenterQuestionIds,
  coveredPatterns: [
    'central-idea',
    'relevant-details',
    'topic-vs-central-idea',
    'central-idea-complete-thought',
    'stated-central-idea',
    'inferred-central-idea',
    'relevant-detail-identification',
    'most-relevant-details',
    'relevant-details-across-sections',
    'central-idea-from-details',
    'central-idea-and-evidence',
  ],
}
