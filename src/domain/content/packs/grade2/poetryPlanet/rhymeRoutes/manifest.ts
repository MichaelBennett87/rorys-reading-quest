import type { ContentPackLesson, ContentPackManifest } from '../../../contentPackTypes'
import {
  RHYME_ROUTES_CONTENT_VERSION,
  RHYME_ROUTES_LESSON_KEYS,
  RHYME_ROUTES_PACK_ID,
  RHYME_ROUTES_PACK_TITLE,
  RHYME_ROUTES_POEM_KEYS,
} from './ids'
import { rhymeRoutesCheckpointQuestions } from './questionsCheckpoint'
import { rhymeRoutesGuidedQuestions } from './questionsGuided'
import { rhymeRoutesBuildingBlockQuestions } from './questionsBuildingBlock'

const rhymeRoutesQuestionIds = [
  ...rhymeRoutesBuildingBlockQuestions,
  ...rhymeRoutesGuidedQuestions,
  ...rhymeRoutesCheckpointQuestions,
].map((question) => question.questionIdentifier)

const rhymeRoutesLessonDefinitions = [
  {
    lessonId: `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.buildingBlockA}`,
    worldId: 'poetry-planet',
    unitId: 'pp-unit-1',
    activityId: 'activity-rhyme-routes-building-block-a',
    difficulty: 0,
    passageIdentifiers: [`${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.kiteDay}`],
    questionIdentifiers: rhymeRoutesBuildingBlockQuestions
      .filter((question) => question.lessonIdentifier === `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.buildingBlockA}`)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Rhyme Routes Guide: Hear the End Rhyme',
    lessonObjective: 'Listen to line-end words and hear when two lines rhyme.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Listen to the Last Word',
      explanation:
        'The end word is the last word in a poem line. We listen to the ending sounds of the line-end words to decide whether the lines rhyme.',
      examples: [
        'day and play rhyme because their ending sounds match.',
        'A line can get the same letter when it rhymes with another line.',
        'A different ending sound needs a new letter.',
      ],
      contrast: 'We use sound, not spelling alone, to hear the rhyme.',
      learnerCue: 'Listen to the line endings first.',
    },
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.buildingBlockB}`,
    worldId: 'poetry-planet',
    unitId: 'pp-unit-1',
    activityId: 'activity-rhyme-routes-building-block-b',
    difficulty: 0,
    passageIdentifiers: [`${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.gardenCare}`],
    questionIdentifiers: rhymeRoutesBuildingBlockQuestions
      .filter((question) => question.lessonIdentifier === `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.buildingBlockB}`)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Rhyme Routes Guide: Give the Lines Letters',
    lessonObjective: 'Use letters to mark matching rhyme sounds in a poem.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Mark the First Rhyme A',
      explanation:
        'Mark the first line A. If the next line rhymes with it, give that line A too. If a line has a new rhyme sound, use the next letter.',
      examples: [
        'bare and care get the same letter.',
        'dirt and hurt get a new matching letter.',
        'near and clear get another matching letter.',
      ],
      contrast: 'The rhyme letters show groups of matching sounds from the poem.',
      learnerCue: 'Use one letter for each rhyme family.',
    },
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.guidedA}`,
    worldId: 'poetry-planet',
    unitId: 'pp-unit-1',
    activityId: 'activity-rhyme-routes-guided-a',
    difficulty: 1,
    passageIdentifiers: [`${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.recycleSpin}`],
    questionIdentifiers: rhymeRoutesGuidedQuestions
      .filter((question) => question.lessonIdentifier === `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.guidedA}`)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Rhyme Routes Practice: Rhyme Pairs and AABB',
    lessonObjective: 'Use end words to tell a rhyme scheme and match repeated rhyme sounds.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Find Matching End Words',
      explanation:
        'When two lines end with words that rhyme by sound, they get the same letter. We can read the letters in order to name the scheme.',
      examples: [
        'bin and tin rhyme together.',
        'grin and spin rhyme together.',
        'The scheme can show the poem pattern all the way through.',
      ],
      contrast: 'A rhyme scheme is a pattern of letters, not just a list of words.',
      learnerCue: 'Check the rhyme families and mark the letters.',
    },
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.guidedB}`,
    worldId: 'poetry-planet',
    unitId: 'pp-unit-1',
    activityId: 'activity-rhyme-routes-guided-b',
    difficulty: 1,
    passageIdentifiers: [`${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.bridgeTool}`],
    questionIdentifiers: rhymeRoutesGuidedQuestions
      .filter((question) => question.lessonIdentifier === `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.guidedB}`)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Rhyme Routes Practice: Alternating and Middle-Line Patterns',
    lessonObjective: 'Use a four-line poem to notice when a rhyme returns after a different line.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: {
      title: 'Watch the Pattern Return',
      explanation:
        'Some poems use a pattern where the first line has one letter, the second a new letter, the third another new letter, and the fourth returns to the second letter.',
      examples: [
        'school starts the pattern.',
        'tool gets one letter.',
        'row gets a new letter, then tool returns.',
      ],
      contrast: 'We look at the end sounds in order to name the full scheme.',
      learnerCue: 'Follow the letters from line to line.',
    },
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.checkpointA}`,
    worldId: 'poetry-planet',
    unitId: 'pp-unit-1',
    activityId: 'activity-rhyme-routes-checkpoint-a',
    difficulty: 1,
    passageIdentifiers: [
      `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.helpGate}`,
      `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.weatherNotes}`,
      `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.stagePage}`,
    ],
    questionIdentifiers: rhymeRoutesCheckpointQuestions
      .filter((question) => question.lessonIdentifier === `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.checkpointA}`)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Rhyme Routes Checkpoint A',
    lessonObjective: 'Show independent reading with rhyme scheme identification and notation.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.checkpointB}`,
    worldId: 'poetry-planet',
    unitId: 'pp-unit-1',
    activityId: 'activity-rhyme-routes-checkpoint-b',
    difficulty: 1,
    passageIdentifiers: [
      `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.weatherNotes}`,
      `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.stagePage}`,
      `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.helpGate}`,
    ],
    questionIdentifiers: rhymeRoutesCheckpointQuestions
      .filter((question) => question.lessonIdentifier === `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.checkpointB}`)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Rhyme Routes Checkpoint B',
    lessonObjective: 'Show independent reading with rhyme scheme identification and notation.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.checkpointC}`,
    worldId: 'poetry-planet',
    unitId: 'pp-unit-1',
    activityId: 'activity-rhyme-routes-checkpoint-c',
    difficulty: 1,
    passageIdentifiers: [
      `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.stagePage}`,
      `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.helpGate}`,
      `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.weatherNotes}`,
    ],
    questionIdentifiers: rhymeRoutesCheckpointQuestions
      .filter((question) => question.lessonIdentifier === `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.checkpointC}`)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Rhyme Routes Checkpoint C',
    lessonObjective: 'Show independent reading with rhyme scheme identification and notation.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: RHYME_ROUTES_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
] satisfies ContentPackLesson[]

export const grade2PoetryPlanetRhymeRoutesManifest: ContentPackManifest = {
  packId: RHYME_ROUTES_PACK_ID,
  packTitle: RHYME_ROUTES_PACK_TITLE,
  gradeBand: 2,
  worldId: 'poetry-planet',
  unitId: 'pp-unit-1',
  primarySkillId: 'g2-poetry-planet-poetry',
  benchmarkReferences: ['ELA.2.R.1.4'],
  partialBenchmarkCoverage: 'Grade 2 identification and marking of rhyme schemes using capital-letter notation',
  difficultyRange: [0, 1],
  contentVersion: RHYME_ROUTES_CONTENT_VERSION,
  reviewStatus: 'DRAFT',
  coverageKind: 'benchmark',
  coveredPatterns: [
    'rhyme-scheme-identification',
    'rhyme-scheme-notation',
    'line-end-word-identification',
    'end-rhyme-identification',
    'rhyme-by-sound',
    'notation-starts-with-a',
    'same-rhyme-same-letter',
    'new-rhyme-next-letter',
    'uppercase-rhyme-labels',
    'whole-poem-scheme',
    'scheme-supported-by-end-words',
  ],
  passageIds: [
    `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.kiteDay}`,
    `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.gardenCare}`,
    `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.recycleSpin}`,
    `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.bridgeTool}`,
    `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.helpGate}`,
    `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.weatherNotes}`,
    `${RHYME_ROUTES_PACK_ID}-passage-${RHYME_ROUTES_POEM_KEYS.stagePage}`,
  ],
  questionIds: rhymeRoutesQuestionIds,
  lessonIds: [
    `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.buildingBlockA}`,
    `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.buildingBlockB}`,
    `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.guidedA}`,
    `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.guidedB}`,
    `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.checkpointA}`,
    `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.checkpointB}`,
    `${RHYME_ROUTES_PACK_ID}-lesson-${RHYME_ROUTES_LESSON_KEYS.checkpointC}`,
  ],
}

export const rhymeRoutesLessons = rhymeRoutesLessonDefinitions
