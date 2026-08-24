import type { ContentPack, ContentPackLesson } from '../../../contentPackTypes'
import {
  multisyllableMountainContentVersion,
  multisyllableMountainLessonIds,
  multisyllableMountainPackId,
  multisyllableMountainPassageIds,
  multisyllableMountainQuestionIds,
  multisyllableMountainSkillId,
  multisyllableMountainUnitId,
  multisyllableMountainWorldId,
} from './ids'
import {
  multisyllableMountainGuides,
  multisyllableMountainPassages,
  multisyllableMountainSupportTargets,
  multisyllableMountainTargets,
} from './multisyllableDecodingGuides'
import { multisyllableMountainQuestions } from './questions'

const guidedPurposes = ['remediation', 'review'] as const
const checkpointPurposes = ['progression', 'verification', 'review'] as const

export const multisyllableMountainLessons: ContentPackLesson[] = [
  guidedLesson(
    multisyllableMountainLessonIds.powerUpCompounds,
    'activity-g3-multisyllable-mountain-power-up-compounds',
    multisyllableMountainPassageIds.trailStation,
    multisyllableMountainQuestionIds.powerUpCompounds,
    2,
    'Multisyllable Mountain Power-Up: Compound Trails',
    'Use compound boundaries plus open, closed, and silent-e syllable clues to decode longer words.',
    {
      title: 'Known parts can open a path through a longer word',
      explanation: 'A compound boundary can reveal familiar words. Syllable chunks show how to pronounce the complete word. Use both kinds of clues when they help, but do not force one split on every word.',
      examples: ['sun | shine shows two familiar compound parts.', 'sun | shine also gives two comfortable reading chunks.', 'ro | bot combines an open chunk with a closed chunk.'],
      contrast: 'Meaningful boundaries and syllable boundaries can match, but they do not have to match.',
      learnerCue: 'Find a useful clue, read each chunk, blend, and check the sentence.',
    },
  ),
  guidedLesson(
    multisyllableMountainLessonIds.powerUpVowels,
    'activity-g3-multisyllable-mountain-power-up-vowels',
    multisyllableMountainPassageIds.weatherTrip,
    multisyllableMountainQuestionIds.powerUpVowels,
    2,
    'Multisyllable Mountain Power-Up: Vowel Clues',
    'Use vowel teams, r-controlled chunks, silent-e chunks, and meaningful endings to decode longer words.',
    {
      title: 'Vowel patterns help each chunk sound right',
      explanation: 'Look for a familiar vowel team, an r-controlled vowel, or a silent-e pattern. Read the chunks flexibly and use the whole sentence to confirm the result.',
      examples: ['rain | coat has two vowel-team chunks.', 'pa | per begins with an open chunk and ends with an r-controlled chunk.', 'hope | ful uses a silent-e chunk plus a familiar ending.'],
      contrast: 'A pattern is a strategy, not an unbreakable rule for every English word.',
      learnerCue: 'Mark the vowel clues, read the chunks, and confirm the word in context.',
    },
  ),
  guidedLesson(
    multisyllableMountainLessonIds.labGarden,
    'activity-g3-multisyllable-mountain-lab-garden',
    multisyllableMountainPassageIds.gardenProject,
    multisyllableMountainQuestionIds.labGarden,
    3,
    'Multisyllable Mountain Lab: Garden Reading Routes',
    'Combine syllable patterns with prefixes, suffixes, bases, and compound boundaries to decode Grade 3 words.',
    {
      title: 'Meaning clues and reading chunks can work together',
      explanation: 'A prefix, base, suffix, or compound part can help you enter a word. Pronunciation chunks may place their boundaries differently. Read every chunk and test the whole word in its sentence.',
      examples: ['re | plant | ing works as both a meaningful analysis and reading chunks.', 'garden | er shows meaning, while gar | den | er supports pronunciation.', 'sun | flower shows compound parts, while sun | flow | er shows reading chunks.'],
      contrast: 'Do not pretend every root or affix boundary is automatically a syllable boundary.',
      learnerCue: 'Use the boundary that fits the job: meaning first, pronunciation next.',
    },
  ),
  guidedLesson(
    multisyllableMountainLessonIds.labWildlife,
    'activity-g3-multisyllable-mountain-lab-wildlife',
    multisyllableMountainPassageIds.wildlifeCenter,
    multisyllableMountainQuestionIds.labWildlife,
    3,
    'Multisyllable Mountain Lab: Flexible Word Paths',
    'Decode two-, three-, and selected transparent longer words using several syllable-pattern strategies.',
    {
      title: 'Flexible readers test and adjust their chunks',
      explanation: 'Start with likely chunks, notice their vowel patterns, blend the word, and reread the sentence. If the result does not sound like a word that fits, adjust the chunks.',
      examples: ['ra | ven combines an open chunk with a closed chunk.', 'fear | less uses a vowel-team chunk and a familiar suffix.', 'hi | ber | nate ends with a silent-e chunk.'],
      contrast: 'Syllable patterns are useful clues; English does not follow one mechanical division rule in every word.',
      learnerCue: 'Chunk, blend, check, and adjust when needed.',
    },
  ),
  checkpointLesson(multisyllableMountainLessonIds.checkpointMuseum, 'activity-g3-multisyllable-mountain-checkpoint-museum', multisyllableMountainPassageIds.museumExpedition, multisyllableMountainQuestionIds.checkpointMuseum, 'Multisyllable Mountain Checkpoint: Museum Expedition'),
  checkpointLesson(multisyllableMountainLessonIds.checkpointEngineering, 'activity-g3-multisyllable-mountain-checkpoint-engineering', multisyllableMountainPassageIds.engineeringChallenge, multisyllableMountainQuestionIds.checkpointEngineering, 'Multisyllable Mountain Checkpoint: Engineering Challenge'),
  checkpointLesson(multisyllableMountainLessonIds.checkpointAdventure, 'activity-g3-multisyllable-mountain-checkpoint-adventure', multisyllableMountainPassageIds.adventureClub, multisyllableMountainQuestionIds.checkpointAdventure, 'Multisyllable Mountain Checkpoint: Adventure Club'),
]

export const grade3WordForgeMultisyllableMountainPack: ContentPack = {
  manifest: {
    packId: multisyllableMountainPackId,
    packTitle: 'Grade 3 Word Forge: Multisyllable Mountain',
    gradeBand: 3,
    worldId: multisyllableMountainWorldId,
    unitId: multisyllableMountainUnitId,
    primarySkillId: multisyllableMountainSkillId,
    benchmarkReferences: ['ELA.3.F.1.3'],
    coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Systematic Grade 3 multisyllabic decoding only. Root Reactor and Suffix Shifter supply the other ELA.3.F.1.3 branches; no oral fluency, vocabulary mastery, or Grade 4 morphology is claimed.',
    difficultyRange: [2, 3],
    contentVersion: multisyllableMountainContentVersion,
    reviewStatus: 'DRAFT',
    coveredPatterns: [
      'multisyllabic-decoding',
      'closed-syllable-decoding',
      'open-syllable-decoding',
      'vowel-consonant-e-decoding',
      'vowel-team-syllable-decoding',
      'r-controlled-syllable-decoding',
      'consonant-le-syllable-decoding',
      'compound-boundary-decoding',
      'prefix-boundary-decoding',
      'suffix-boundary-decoding',
      'base-word-boundary-decoding',
      'flexible-syllable-chunking',
      'sentence-context-confirmation',
    ],
    passageIds: multisyllableMountainPassages.map((passage) => passage.passageIdentifier),
    questionIds: multisyllableMountainQuestions.map((question) => question.questionIdentifier),
    lessonIds: multisyllableMountainLessons.map((lesson) => lesson.lessonId),
  },
  passages: multisyllableMountainPassages,
  questions: multisyllableMountainQuestions,
  lessons: multisyllableMountainLessons,
  multisyllableDecodingGuides: multisyllableMountainGuides,
}

function guidedLesson(
  lessonId: string,
  activityId: string,
  passageId: string,
  questionIdentifiers: readonly string[],
  difficulty: 2 | 3,
  lessonTitle: string,
  lessonObjective: string,
  teachingBlock: NonNullable<ContentPackLesson['teachingBlock']>,
): ContentPackLesson {
  return {
    lessonId, worldId: multisyllableMountainWorldId, unitId: multisyllableMountainUnitId, activityId, difficulty,
    passageIdentifiers: [passageId], questionIdentifiers: [...questionIdentifiers], lessonTitle, lessonObjective,
    lessonRole: 'GUIDED_PRACTICE', selectionStatus: 'active', teachingBlock,
    contentVersion: multisyllableMountainContentVersion, eligiblePurposes: [...guidedPurposes],
  }
}

function checkpointLesson(
  lessonId: string,
  activityId: string,
  passageId: string,
  questionIdentifiers: readonly string[],
  lessonTitle: string,
): ContentPackLesson {
  return {
    lessonId, worldId: multisyllableMountainWorldId, unitId: multisyllableMountainUnitId, activityId, difficulty: 3,
    passageIdentifiers: [passageId], questionIdentifiers: [...questionIdentifiers], lessonTitle,
    lessonObjective: 'Use syllable patterns and useful morphological boundaries to decode multisyllabic Grade 3 words in connected text.',
    lessonRole: 'CHECKPOINT', selectionStatus: 'active', contentVersion: multisyllableMountainContentVersion,
    eligiblePurposes: [...checkpointPurposes],
  }
}

export {
  multisyllableMountainGuides,
  multisyllableMountainPassages,
  multisyllableMountainQuestions,
  multisyllableMountainSupportTargets,
  multisyllableMountainTargets,
}
