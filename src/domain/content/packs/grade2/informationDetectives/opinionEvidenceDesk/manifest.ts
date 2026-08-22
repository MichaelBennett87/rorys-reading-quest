import type { ContentPackLesson, ContentPackManifest } from '../../../contentPackTypes'
import { opinionEvidenceDeskCheckpointQuestions } from './questionsCheckpoint'
import { opinionEvidenceDeskGuidedQuestions } from './questionsGuided'
import { opinionEvidenceDeskPrerequisiteQuestions } from './questionsPrerequisite'
import {
  opinionEvidenceDeskContentVersion,
  opinionEvidenceDeskLessonIds,
  opinionEvidenceDeskPackId,
  opinionEvidenceDeskPassageIds,
} from './ids'

const opinionEvidenceDeskQuestionIds = [
  ...opinionEvidenceDeskPrerequisiteQuestions,
  ...opinionEvidenceDeskGuidedQuestions,
  ...opinionEvidenceDeskCheckpointQuestions,
].map((question) => question.questionIdentifier)

export const opinionEvidenceDeskLessons = [
  {
    lessonId: opinionEvidenceDeskLessonIds.prereqFactOpinionTopic,
    worldId: 'information-detectives',
    unitId: 'id-unit-4',
    activityId: 'activity-opinion-fact-opinion-topic',
    difficulty: 3,
    passageIdentifiers: [opinionEvidenceDeskPassageIds.shadedRestSpots.passageId],
    questionIdentifiers: opinionEvidenceDeskPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === opinionEvidenceDeskLessonIds.prereqFactOpinionTopic)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Fact, Opinion, or Topic?',
    lessonObjective: 'Tell the topic apart from an author opinion and a fact.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Opinion is what the author thinks',
      explanation:
        'A fact can be checked. An opinion tells what the author thinks, believes, recommends, or judges about the topic.',
      examples: [
        'A topic is just what the text is about.',
        'A fact can be checked in the passage.',
        'An opinion often says what the author thinks should happen.',
      ],
      contrast: 'The best answer should sound like the author thinks or recommends something.',
      learnerCue: 'Ask whether the sentence names the topic, a fact, or the author opinion.',
    },
    contentVersion: opinionEvidenceDeskContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: opinionEvidenceDeskLessonIds.prereqMatchEvidence,
    worldId: 'information-detectives',
    unitId: 'id-unit-4',
    activityId: 'activity-opinion-match-evidence',
    difficulty: 3,
    passageIdentifiers: [opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId],
    questionIdentifiers: opinionEvidenceDeskPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === opinionEvidenceDeskLessonIds.prereqMatchEvidence)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Match the Evidence to the Opinion',
    lessonObjective: 'Choose the details that best support an author opinion.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Evidence helps explain why the opinion fits',
      explanation:
        'Supporting evidence is a fact, example, observation, or reason from the text that helps readers understand why the author holds that opinion.',
      examples: [
        'Pick details that connect closely to the opinion.',
        'A text can have another true detail that is not one of the best details.',
        'The strongest evidence is the detail that fits the opinion most closely.',
      ],
      contrast: 'Do not choose a true detail that does not help the opinion as much.',
      learnerCue: 'Choose the details that fit the opinion best.',
    },
    contentVersion: opinionEvidenceDeskContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: opinionEvidenceDeskLessonIds.guidedFindOpinion,
    worldId: 'information-detectives',
    unitId: 'id-unit-4',
    activityId: 'activity-opinion-find-the-opinion',
    difficulty: 4,
    passageIdentifiers: [opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId],
    questionIdentifiers: opinionEvidenceDeskGuidedQuestions
      .filter((question) => question.lessonIdentifier === opinionEvidenceDeskLessonIds.guidedFindOpinion)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Find the Author\'s Opinion',
    lessonObjective: 'Find the sentence that tells what the author thinks or recommends.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Look for what the author thinks',
      explanation:
        'An author opinion tells what the author thinks, believes, recommends, or judges about the topic. It is not the same as the topic or a simple fact.',
      examples: [
        'An opinion can be a complete thought.',
        'A fact can still appear in the same passage.',
        'The sentence that states the opinion should sound like what the author thinks or recommends.',
      ],
      contrast: 'The opinion should not just name the topic or repeat a fact.',
      learnerCue: 'Find the sentence that sounds like the author is recommending something.',
    },
    contentVersion: opinionEvidenceDeskContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: opinionEvidenceDeskLessonIds.guidedChooseStrongestEvidence,
    worldId: 'information-detectives',
    unitId: 'id-unit-4',
    activityId: 'activity-opinion-choose-strongest-evidence',
    difficulty: 4,
    passageIdentifiers: [opinionEvidenceDeskPassageIds.reusableContainers.passageId],
    questionIdentifiers: opinionEvidenceDeskGuidedQuestions
      .filter((question) => question.lessonIdentifier === opinionEvidenceDeskLessonIds.guidedChooseStrongestEvidence)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Choose the Strongest Evidence',
    lessonObjective: 'Pick the best evidence for an opinion and explain the match.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Strong evidence fits the opinion closely',
      explanation:
        'The strongest evidence is the fact, example, observation, or reason that connects most closely to the opinion. Readers can check that match with a short explanation.',
      examples: [
        'Choose the detail that best supports the opinion.',
        'A second true detail may be interesting but less helpful.',
        'A clear explanation can say, This evidence supports the opinion because it shows why the author thinks that way.',
      ],
      contrast: 'A strong evidence choice should make the opinion easier to understand.',
      learnerCue: 'Pick the detail that helps explain why the author thinks that way.',
    },
    contentVersion: opinionEvidenceDeskContentVersion,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: opinionEvidenceDeskLessonIds.checkpointA,
    worldId: 'information-detectives',
    unitId: 'id-unit-4',
    activityId: 'activity-opinion-checkpoint-a',
    difficulty: 4,
    passageIdentifiers: [
      opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId,
      opinionEvidenceDeskPassageIds.compostSortingSigns.passageId,
      opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId,
    ],
    questionIdentifiers: opinionEvidenceDeskCheckpointQuestions
      .filter((question) => question.lessonIdentifier === opinionEvidenceDeskLessonIds.checkpointA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Opinion & Evidence Checkpoint A',
    lessonObjective: 'Show independent reading with opinion, fact, and evidence.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: opinionEvidenceDeskContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: opinionEvidenceDeskLessonIds.checkpointB,
    worldId: 'information-detectives',
    unitId: 'id-unit-4',
    activityId: 'activity-opinion-checkpoint-b',
    difficulty: 4,
    passageIdentifiers: [
      opinionEvidenceDeskPassageIds.compostSortingSigns.passageId,
      opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId,
      opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId,
    ],
    questionIdentifiers: opinionEvidenceDeskCheckpointQuestions
      .filter((question) => question.lessonIdentifier === opinionEvidenceDeskLessonIds.checkpointB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Opinion & Evidence Checkpoint B',
    lessonObjective: 'Show independent reading with opinion, fact, and evidence.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: opinionEvidenceDeskContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: opinionEvidenceDeskLessonIds.checkpointC,
    worldId: 'information-detectives',
    unitId: 'id-unit-4',
    activityId: 'activity-opinion-checkpoint-c',
    difficulty: 4,
    passageIdentifiers: [
      opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId,
      opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId,
      opinionEvidenceDeskPassageIds.compostSortingSigns.passageId,
    ],
    questionIdentifiers: opinionEvidenceDeskCheckpointQuestions
      .filter((question) => question.lessonIdentifier === opinionEvidenceDeskLessonIds.checkpointC)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Opinion & Evidence Checkpoint C',
    lessonObjective: 'Show independent reading with opinion, fact, and evidence.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: opinionEvidenceDeskContentVersion,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
] satisfies ContentPackLesson[]

const opinionEvidenceDeskLessonIdList = opinionEvidenceDeskLessons.map((lesson) => lesson.lessonId)
const opinionEvidenceDeskPassageIdList = [
  opinionEvidenceDeskPassageIds.shadedRestSpots.passageId,
  opinionEvidenceDeskPassageIds.nativeFlowerBeds.passageId,
  opinionEvidenceDeskPassageIds.clearTrailSymbols.passageId,
  opinionEvidenceDeskPassageIds.reusableContainers.passageId,
  opinionEvidenceDeskPassageIds.birdFriendlyPlants.passageId,
  opinionEvidenceDeskPassageIds.compostSortingSigns.passageId,
  opinionEvidenceDeskPassageIds.rainBarrelPlan.passageId,
]

export const grade2InformationDetectivesOpinionEvidenceDeskManifest: ContentPackManifest = {
  packId: opinionEvidenceDeskPackId,
  packTitle: 'Grade 2 Information Detectives: Opinion & Evidence Desk',
  gradeBand: 2,
  worldId: 'information-detectives',
  unitId: 'id-unit-4',
  primarySkillId: 'g2-information-detectives-reading',
  benchmarkReferences: ['ELA.2.R.2.4'],
  partialBenchmarkCoverage: 'Identification and explanation of an informational author opinion or opinions and supporting evidence, without formal Grade 3 argument analysis',
  difficultyRange: [3, 4],
  contentVersion: opinionEvidenceDeskContentVersion,
  reviewStatus: 'DRAFT',
  coverageKind: 'benchmark',
  lessonIds: opinionEvidenceDeskLessonIdList,
  passageIds: opinionEvidenceDeskPassageIdList,
  questionIds: opinionEvidenceDeskQuestionIds,
  coveredPatterns: [
    'opinion',
    'supporting-evidence',
    'author-opinion-identification',
    'multiple-author-opinions',
    'fact-vs-opinion',
    'opinion-vs-topic',
    'opinion-vs-central-idea',
    'opinion-vs-author-purpose',
    'supporting-evidence-identification',
    'opinion-evidence-matching',
    'strongest-supporting-evidence',
    'evidence-connection',
    'evidence-across-sections',
  ],
}
