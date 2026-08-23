import type { ContentPack, ContentPackLesson } from '../../../contentPackTypes'
import {
  WORDPLAY_WATCHTOWER_LESSON_IDS,
  WORDPLAY_WATCHTOWER_CONTENT_VERSION,
  WORDPLAY_WATCHTOWER_UNIT_ID,
  WORDPLAY_WATCHTOWER_WORLD_ID,
} from './ids'
import { grade2CompareCastleWordplayWatchtowerManifest } from './manifest'
import { wordplayWatchtowerCheckpointQuestions } from './questionsCheckpoint'
import { wordplayWatchtowerGuidedQuestions } from './questionsGuided'
import { wordplayWatchtowerPrerequisiteQuestions } from './questionsPrerequisite'
import { wordplayWatchtowerPoemArtifacts } from './poems'
import { wordplayWatchtowerProseArtifacts } from './passages'
import { wordplayWatchtowerArtifacts, wordplayWatchtowerWordplayGuides } from './wordplayGuides'

const buildTeachingBlock = (title: string, explanation: string, examples: string[], contrast: string, learnerCue: string) => ({
  title,
  explanation,
  examples,
  contrast,
  learnerCue,
})

export const wordplayWatchtowerQuestions = [
  ...wordplayWatchtowerPrerequisiteQuestions,
  ...wordplayWatchtowerGuidedQuestions,
  ...wordplayWatchtowerCheckpointQuestions,
]

export const wordplayWatchtowerLessons: ContentPackLesson[] = [
  {
    lessonId: WORDPLAY_WATCHTOWER_LESSON_IDS.prereqSpotTheComparison,
    worldId: WORDPLAY_WATCHTOWER_WORLD_ID,
    unitId: WORDPLAY_WATCHTOWER_UNIT_ID,
    activityId: 'activity-cg-wordplay-prereq-spot-the-comparison',
    difficulty: 0,
    passageIdentifiers: [wordplayWatchtowerProseArtifacts[0].passage.passageIdentifier],
    questionIdentifiers: wordplayWatchtowerPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === WORDPLAY_WATCHTOWER_LESSON_IDS.prereqSpotTheComparison)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Spot the Comparison',
    lessonObjective: 'Notice when like or as compares two unlike things.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: buildTeachingBlock(
      'Look for like or as',
      'A simile compares two unlike things using like or as. Sometimes like or as is literal, so we check whether the sentence really compares two different things.',
      [
        'The kite tugged like a puppy on a leash.',
        'The hall was as quiet as a cloud.',
        'I like blue markers is not a simile because it tells what I enjoy.',
      ],
      'Not every like or as makes a simile. Sometimes like or as is used in a literal way, as in We cleaned up as the bell rang.',
      'Ask whether two unlike things are being compared.',
    ),
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: WORDPLAY_WATCHTOWER_LESSON_IDS.prereqMeaningBeyondWords,
    worldId: WORDPLAY_WATCHTOWER_WORLD_ID,
    unitId: WORDPLAY_WATCHTOWER_UNIT_ID,
    activityId: 'activity-cg-wordplay-prereq-meaning-beyond-the-words',
    difficulty: 0,
    passageIdentifiers: [wordplayWatchtowerProseArtifacts[1].passage.passageIdentifier],
    questionIdentifiers: wordplayWatchtowerPrerequisiteQuestions
      .filter((question) => question.lessonIdentifier === WORDPLAY_WATCHTOWER_LESSON_IDS.prereqMeaningBeyondWords)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Meaning Beyond the Words',
    lessonObjective: 'Notice when an idiom means something different from the literal words.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: buildTeachingBlock(
      'Idioms have intended meanings',
      'An idiom is a familiar phrase whose intended meaning is different from the literal words. We use the sentence and the nearby details to choose the meaning that fits.',
      [
        'Lend a hand means help someone.',
        'Put on our thinking caps means start thinking carefully.',
        'We cleaned up as the bell rang is a literal use of as, not an idiom.',
      ],
      'Not every unusual phrase is an idiom. Some phrases with like or as stay literal.',
      'Choose the meaning that fits the sentence, not just the words by themselves.',
    ),
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: WORDPLAY_WATCHTOWER_LESSON_IDS.guidedSimilesAndIdiomsInContext,
    worldId: WORDPLAY_WATCHTOWER_WORLD_ID,
    unitId: WORDPLAY_WATCHTOWER_UNIT_ID,
    activityId: 'activity-cg-wordplay-guided-similes-and-idioms-in-context',
    difficulty: 1,
    passageIdentifiers: [wordplayWatchtowerProseArtifacts[2].passage.passageIdentifier],
    questionIdentifiers: wordplayWatchtowerGuidedQuestions
      .filter((question) => question.lessonIdentifier === WORDPLAY_WATCHTOWER_LESSON_IDS.guidedSimilesAndIdiomsInContext)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Similes and Idioms in Context',
    lessonObjective: 'Use nearby words to explain similes and idioms.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: buildTeachingBlock(
      'Use the nearby clue',
      'When a simile or idiom appears in a sentence, the nearby words help explain the meaning. The clue should still fit the sentence when you read it again.',
      [
        'Like a tiny boat compares the seed tray to a boat.',
        'Get the ball rolling means start the work.',
        'Paper petals pushed uses alliteration because the words begin with the /p/ sound.',
      ],
      'A clue must fit the sentence. If it does not, choose a different meaning or strategy.',
      'Reread the sentence and check whether the meaning still makes sense.',
    ),
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: WORDPLAY_WATCHTOWER_LESSON_IDS.guidedSoundPatternsInAPoem,
    worldId: WORDPLAY_WATCHTOWER_WORLD_ID,
    unitId: WORDPLAY_WATCHTOWER_UNIT_ID,
    activityId: 'activity-cg-wordplay-guided-sound-patterns-in-a-poem',
    difficulty: 1,
    passageIdentifiers: [wordplayWatchtowerPoemArtifacts[0].passage.passageIdentifier],
    questionIdentifiers: wordplayWatchtowerGuidedQuestions
      .filter((question) => question.lessonIdentifier === WORDPLAY_WATCHTOWER_LESSON_IDS.guidedSoundPatternsInAPoem)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Sound Patterns in a Poem',
    lessonObjective: 'Listen for repeated beginning sounds and tell why the words make alliteration.',
    lessonRole: 'GUIDED_PRACTICE',
    selectionStatus: 'active',
    teachingBlock: buildTeachingBlock(
      'Listen for the beginning sound',
      'Alliteration is the repetition of beginning sounds in nearby words. It is about sound, not just the first letters on the page.',
      [
        'Tiny tools tapped uses alliteration because the /t/ sound repeats.',
        'A phrase with the same first letter but different sounds is not automatically alliteration.',
        'The poem can still have similes and idioms too.',
      ],
      'Same letters alone do not make alliteration. The sound has to repeat.',
      'Listen for the repeated beginning sound and say why it matches.',
    ),
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
    eligiblePurposes: ['remediation', 'review'],
  },
  {
    lessonId: WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointA,
    worldId: WORDPLAY_WATCHTOWER_WORLD_ID,
    unitId: WORDPLAY_WATCHTOWER_UNIT_ID,
    activityId: 'activity-cg-wordplay-checkpoint-a',
    difficulty: 1,
    passageIdentifiers: [
      wordplayWatchtowerProseArtifacts[3].passage.passageIdentifier,
      wordplayWatchtowerProseArtifacts[0].passage.passageIdentifier,
      wordplayWatchtowerPoemArtifacts[0].passage.passageIdentifier,
    ],
    questionIdentifiers: wordplayWatchtowerCheckpointQuestions
      .filter((question) => question.lessonIdentifier === WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointA)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Wordplay Watchtower Checkpoint A',
    lessonObjective: 'Show independent reading with similes, idioms, and alliteration.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointB,
    worldId: WORDPLAY_WATCHTOWER_WORLD_ID,
    unitId: WORDPLAY_WATCHTOWER_UNIT_ID,
    activityId: 'activity-cg-wordplay-checkpoint-b',
    difficulty: 1,
    passageIdentifiers: [
      wordplayWatchtowerProseArtifacts[4].passage.passageIdentifier,
      wordplayWatchtowerProseArtifacts[2].passage.passageIdentifier,
      wordplayWatchtowerPoemArtifacts[1].passage.passageIdentifier,
    ],
    questionIdentifiers: wordplayWatchtowerCheckpointQuestions
      .filter((question) => question.lessonIdentifier === WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointB)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Wordplay Watchtower Checkpoint B',
    lessonObjective: 'Show independent reading with similes, idioms, and alliteration.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
  {
    lessonId: WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointC,
    worldId: WORDPLAY_WATCHTOWER_WORLD_ID,
    unitId: WORDPLAY_WATCHTOWER_UNIT_ID,
    activityId: 'activity-cg-wordplay-checkpoint-c',
    difficulty: 1,
    passageIdentifiers: [
      wordplayWatchtowerPoemArtifacts[1].passage.passageIdentifier,
      wordplayWatchtowerProseArtifacts[3].passage.passageIdentifier,
      wordplayWatchtowerPoemArtifacts[0].passage.passageIdentifier,
    ],
    questionIdentifiers: wordplayWatchtowerCheckpointQuestions
      .filter((question) => question.lessonIdentifier === WORDPLAY_WATCHTOWER_LESSON_IDS.checkpointC)
      .map((question) => question.questionIdentifier),
    lessonTitle: 'Wordplay Watchtower Checkpoint C',
    lessonObjective: 'Show independent reading with similes, idioms, and alliteration.',
    lessonRole: 'CHECKPOINT',
    selectionStatus: 'active',
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
    eligiblePurposes: ['progression', 'verification', 'review'],
  },
]

export const grade2CompareCastleWordplayWatchtowerPack: ContentPack = {
  manifest: grade2CompareCastleWordplayWatchtowerManifest,
  passages: wordplayWatchtowerArtifacts.map((artifact) => ({
    ...artifact.passage,
  })),
  questions: wordplayWatchtowerQuestions,
  lessons: wordplayWatchtowerLessons,
  wordplayGuides: wordplayWatchtowerWordplayGuides,
}

export { wordplayWatchtowerCheckpointQuestions, wordplayWatchtowerGuidedQuestions, wordplayWatchtowerPrerequisiteQuestions }
