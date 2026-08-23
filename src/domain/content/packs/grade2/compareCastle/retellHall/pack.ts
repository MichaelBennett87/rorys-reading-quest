import type { ContentPack, ContentPackLesson } from '../../../contentPackTypes'
import {
  RETELL_HALL_CONTENT_VERSION,
  RETELL_HALL_LESSON_IDS,
  RETELL_HALL_UNIT_ID,
  RETELL_HALL_WORLD_ID,
} from './ids'
import { grade2CompareCastleRetellHallManifest } from './manifest'
import { retellHallCheckpointQuestions } from './questionsCheckpoint'
import { retellHallGuidedQuestions } from './questionsGuided'
import { retellHallPrerequisiteQuestions } from './questionsPrerequisite'
import { retellHallPassages } from './passages'
import { retellHallRetellGuides } from './retellGuides'

const buildTeachingBlock = (title: string, explanation: string, examples: string[], contrast: string, learnerCue: string) => ({
  title,
  explanation,
  examples,
  contrast,
  learnerCue,
})

export const retellHallQuestions = [
  ...retellHallPrerequisiteQuestions,
  ...retellHallGuidedQuestions,
  ...retellHallCheckpointQuestions,
]

export const retellHallLessons: ContentPackLesson[] = [
  {
    lessonId: RETELL_HALL_LESSON_IDS.prereqStoryPartsInOrder,
    worldId: RETELL_HALL_WORLD_ID,
    unitId: RETELL_HALL_UNIT_ID,
    activityId: 'activity-cg-retell-prereq-story-parts-in-order',
    difficulty: 1,
    passageIdentifiers: [retellHallPassages[0].passageIdentifier],
    questionIdentifiers: retellHallPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === RETELL_HALL_LESSON_IDS.prereqStoryPartsInOrder)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Story Parts in Order',
    lessonObjective: 'Retell a literary text by naming the characters, setting, problem, events, and ending in order.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: buildTeachingBlock(
      'Retell the story in order',
      'A literary retell gives the important parts of a story in a clear order. We name the characters and setting first, then the problem, the important events, and the ending.',
      [
        'Opening: who and where',
        'Problem: what needs to be fixed or found',
        'Ending: how the story finishes',
      ],
      'Do not add every tiny detail. Keep the pieces that move the story forward.',
      'Ask what belongs in the opening, the middle, and the ending.',
    ),
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: RETELL_HALL_LESSON_IDS.prereqCentralIdeaAndImportantDetails,
    worldId: RETELL_HALL_WORLD_ID,
    unitId: RETELL_HALL_UNIT_ID,
    activityId: 'activity-cg-retell-prereq-central-idea-and-important-details',
    difficulty: 1,
    passageIdentifiers: [retellHallPassages[4].passageIdentifier],
    questionIdentifiers: retellHallPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === RETELL_HALL_LESSON_IDS.prereqCentralIdeaAndImportantDetails)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Central Idea and Important Details',
    lessonObjective: 'Retell an informational text by naming the central idea and the relevant details.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: buildTeachingBlock(
      'Keep the main idea and the key details',
      'An informational retell starts with the central idea. Then it gives the most relevant details and leaves out less important true details.',
      [
        'Central idea: what the text is mostly about',
        'Relevant details: the facts that best support the central idea',
        'Less relevant detail: a true fact that does not need to be in the retell',
      ],
      'A retell is not every detail in the passage. It is the main idea plus the important facts that fit it.',
      'Choose the detail that best helps explain the main idea.',
    ),
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: RETELL_HALL_LESSON_IDS.guidedBuildALiteraryRetell,
    worldId: RETELL_HALL_WORLD_ID,
    unitId: RETELL_HALL_UNIT_ID,
    activityId: 'activity-cg-retell-guided-build-a-literary-retell',
    difficulty: 2,
    passageIdentifiers: [retellHallPassages[1].passageIdentifier],
    questionIdentifiers: retellHallGuidedQuestions
      .filter((question) => question.lessonIdentifier === RETELL_HALL_LESSON_IDS.guidedBuildALiteraryRetell)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Build a Literary Retell',
    lessonObjective: 'Retell a literary text in logical order by choosing the important story parts.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: buildTeachingBlock(
      'Build the story retell',
      'A literary retell names the setting, the problem, the important events, and the ending. The parts should stay in story order.',
      [
        'Opening: characters and setting',
        'Problem: what goes wrong or needs help',
        'Ending: how the problem is solved',
      ],
      'A minor detail is true, but it does not belong in the retell if it does not move the story forward.',
      'Keep the events in order from start to finish.',
    ),
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: RETELL_HALL_LESSON_IDS.guidedBuildAnInformationalRetell,
    worldId: RETELL_HALL_WORLD_ID,
    unitId: RETELL_HALL_UNIT_ID,
    activityId: 'activity-cg-retell-guided-build-an-informational-retell',
    difficulty: 2,
    passageIdentifiers: [retellHallPassages[5].passageIdentifier],
    questionIdentifiers: retellHallGuidedQuestions
      .filter((question) => question.lessonIdentifier === RETELL_HALL_LESSON_IDS.guidedBuildAnInformationalRetell)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Build an Informational Retell',
    lessonObjective: 'Retell an informational text by choosing the central idea and the relevant details.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: buildTeachingBlock(
      'Build the informational retell',
      'An informational retell begins with the central idea. Then it uses the relevant details that best support that idea and keeps the order clear.',
      [
        'Central idea first',
        'Relevant detail one',
        'Relevant detail two',
      ],
      'A true detail can still be less important, so we leave it out when it does not fit the retell.',
      'Choose the facts that best explain the topic.',
    ),
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: RETELL_HALL_LESSON_IDS.checkpointLiteraryA,
    worldId: RETELL_HALL_WORLD_ID,
    unitId: RETELL_HALL_UNIT_ID,
    activityId: 'activity-cg-retell-checkpoint-literary-a',
    difficulty: 2,
    passageIdentifiers: [
      retellHallPassages[2].passageIdentifier,
      retellHallPassages[4].passageIdentifier,
      retellHallPassages[5].passageIdentifier,
    ],
    questionIdentifiers: retellHallCheckpointQuestions
      .filter((question) => question.lessonIdentifier === RETELL_HALL_LESSON_IDS.checkpointLiteraryA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Retell Hall Checkpoint A',
    lessonObjective: 'Show independent retell understanding for a literary text.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: RETELL_HALL_LESSON_IDS.checkpointInformational,
    worldId: RETELL_HALL_WORLD_ID,
    unitId: RETELL_HALL_UNIT_ID,
    activityId: 'activity-cg-retell-checkpoint-informational',
    difficulty: 2,
    passageIdentifiers: [
      retellHallPassages[6].passageIdentifier,
      retellHallPassages[0].passageIdentifier,
      retellHallPassages[3].passageIdentifier,
    ],
    questionIdentifiers: retellHallCheckpointQuestions
      .filter((question) => question.lessonIdentifier === RETELL_HALL_LESSON_IDS.checkpointInformational)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Retell Hall Checkpoint B',
    lessonObjective: 'Show independent retell understanding for an informational text.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: RETELL_HALL_LESSON_IDS.checkpointLiteraryB,
    worldId: RETELL_HALL_WORLD_ID,
    unitId: RETELL_HALL_UNIT_ID,
    activityId: 'activity-cg-retell-checkpoint-literary-b',
    difficulty: 2,
    passageIdentifiers: [
      retellHallPassages[3].passageIdentifier,
      retellHallPassages[1].passageIdentifier,
      retellHallPassages[6].passageIdentifier,
    ],
    questionIdentifiers: retellHallCheckpointQuestions
      .filter((question) => question.lessonIdentifier === RETELL_HALL_LESSON_IDS.checkpointLiteraryB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Retell Hall Checkpoint C',
    lessonObjective: 'Show independent retell understanding for a second literary text.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]

export const grade2CompareCastleRetellHallPack: ContentPack = {
  manifest: grade2CompareCastleRetellHallManifest,
  passages: retellHallPassages.map((passage) => ({
    ...passage,
  })),
  questions: retellHallQuestions,
  lessons: retellHallLessons,
  retellGuides: [...retellHallRetellGuides],
}

export { retellHallCheckpointQuestions, retellHallGuidedQuestions, retellHallPrerequisiteQuestions }
