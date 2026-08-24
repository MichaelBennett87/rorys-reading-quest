import type { ContentPack, ContentPackLesson } from '../../../contentPackTypes'
import {
  suffixShifterContentVersion,
  suffixShifterLessonIds,
  suffixShifterPackId,
  suffixShifterPassageIds,
  suffixShifterQuestionIds,
  suffixShifterSkillId,
  suffixShifterUnitId,
  suffixShifterWorldId,
} from './ids'
import {
  suffixShifterGuides,
  suffixShifterPassages,
  suffixShifterSupportTargets,
  suffixShifterTargets,
} from './derivationalSuffixGuides'
import { suffixShifterQuestions } from './questions'

const guidedPurposes = ['remediation', 'review'] as const
const checkpointPurposes = ['progression', 'verification', 'review'] as const

export const suffixShifterLessons: ContentPackLesson[] = [
  guidedLesson(
    suffixShifterLessonIds.powerUpNames,
    'activity-g3-suffix-shifter-power-up-names',
    suffixShifterPassageIds.workshopTeam,
    suffixShifterQuestionIds.powerUpNames,
    1,
    'Suffix Shifter Power-Up: Names and Descriptions',
    'Use transparent suffixes to decode words that name or describe.',
    {
      title: 'A suffix can shift how a word works',
      explanation: 'A noun names a person, place, thing, or idea. An adjective describes a noun. Find the base word, mark the suffix, read the chunks, and use the sentence to check the new word job.',
      examples: ['kind + -ness builds kindness, a noun.', 'help + -ful builds helpful, an adjective.', 'help | ful gives comfortable reading chunks.'],
      contrast: 'A suffix can change a word job, but no suffix makes one absolute rule for every English word.',
      learnerCue: 'Find the base, mark the suffix, read the parts, and check the sentence.',
    },
  ),
  guidedLesson(
    suffixShifterLessonIds.powerUpDescriptions,
    'activity-g3-suffix-shifter-power-up-descriptions',
    suffixShifterPassageIds.natureCenter,
    suffixShifterQuestionIds.powerUpDescriptions,
    1,
    'Suffix Shifter Power-Up: Actions into Names',
    'Decode transparent derived words and notice when an action base becomes a naming word.',
    {
      title: 'Some suffixes can turn actions into naming words',
      explanation: 'A verb shows an action or state. In these words, -ment or -er can build a noun. Mark the meaningful boundary before choosing pronounceable reading chunks.',
      examples: ['treat + -ment builds treatment.', 'help + -er builds helper.', 'The sentence shows whether the new word names a person, thing, or idea.'],
      contrast: 'Say this suffix can make the change in this word, not that it always does so.',
      learnerCue: 'Build the word, read it, then name its job in the sentence.',
    },
  ),
  guidedLesson(
    suffixShifterLessonIds.labWordJobs,
    'activity-g3-suffix-shifter-lab-word-jobs',
    suffixShifterPassageIds.artProject,
    suffixShifterQuestionIds.labWordJobs,
    2,
    'Suffix Shifter Lab: Word Jobs',
    'Analyze how -ment, -er, -ful, and -ly support decoding and word-function changes.',
    {
      title: 'Connect the word parts to the sentence job',
      explanation: 'A derived word can name, describe, or tell how an action happens. First separate the transparent base and suffix. Then read the chunks and check the sentence.',
      examples: ['paint + -er builds painter, a noun.', 'color + -ful builds colorful, an adjective.', 'soft + -ly builds softly, an adverb in this sentence.'],
      contrast: 'Not every word ending in -ly is an adverb. The sentence confirms the role of softly here.',
      learnerCue: 'Analyze the parts and verify the job with context.',
    },
  ),
  guidedLesson(
    suffixShifterLessonIds.labSentenceFit,
    'activity-g3-suffix-shifter-lab-sentence-fit',
    suffixShifterPassageIds.schoolNewsroom,
    suffixShifterQuestionIds.labSentenceFit,
    2,
    'Suffix Shifter Lab: Sentence Fit',
    'Decode suffix words and use connected text to confirm how each word functions.',
    {
      title: 'Use the whole sentence as a final check',
      explanation: 'The suffix is a useful clue, but the complete sentence confirms the word job. A noun names, an adjective describes, and an adverb often tells how an action happens.',
      examples: ['enjoy + -ment builds enjoyment, a noun.', 'fold + -able builds foldable, an adjective.', 'cloud + -y builds cloudy, an adjective in this sentence.'],
      contrast: 'The suffix clue supports analysis; it does not replace reading the full word and sentence.',
      learnerCue: 'Mark, chunk, read, and confirm.',
    },
  ),
  checkpointLesson(suffixShifterLessonIds.checkpointMaker, 'activity-g3-suffix-shifter-checkpoint-maker', suffixShifterPassageIds.makerShowcase, suffixShifterQuestionIds.checkpointMaker, 'Suffix Shifter Checkpoint: Maker Showcase'),
  checkpointLesson(suffixShifterLessonIds.checkpointNature, 'activity-g3-suffix-shifter-checkpoint-nature', suffixShifterPassageIds.natureNight, suffixShifterQuestionIds.checkpointNature, 'Suffix Shifter Checkpoint: Nature Night'),
  checkpointLesson(suffixShifterLessonIds.checkpointWeather, 'activity-g3-suffix-shifter-checkpoint-weather', suffixShifterPassageIds.weatherGarden, suffixShifterQuestionIds.checkpointWeather, 'Suffix Shifter Checkpoint: Weather Garden'),
]

export const grade3WordForgeSuffixShifterPack: ContentPack = {
  manifest: {
    packId: suffixShifterPackId,
    packTitle: 'Grade 3 Word Forge: Suffix Shifter',
    gradeBand: 3,
    worldId: suffixShifterWorldId,
    unitId: suffixShifterUnitId,
    primarySkillId: suffixShifterSkillId,
    benchmarkReferences: ['ELA.3.F.1.3'],
    coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Derivational-suffix decoding and part-of-speech change only. Root Reactor supplies root and affix decoding; systematic multisyllabic decoding remains deferred to Phase 7A3.',
    difficultyRange: [1, 2],
    contentVersion: suffixShifterContentVersion,
    reviewStatus: 'DRAFT',
    coveredPatterns: [
      'derivational-suffix-decoding',
      'part-of-speech-change',
      'suffix-identification',
      'base-suffix-segmentation',
      'word-function-analysis',
      'reading-chunk-decoding',
      'connected-text-decoding',
      'suffix-pattern-highlight',
      'grade-3-word-help',
    ],
    passageIds: suffixShifterPassages.map((passage) => passage.passageIdentifier),
    questionIds: suffixShifterQuestions.map((question) => question.questionIdentifier),
    lessonIds: suffixShifterLessons.map((lesson) => lesson.lessonId),
  },
  passages: suffixShifterPassages,
  questions: suffixShifterQuestions,
  lessons: suffixShifterLessons,
  derivationalSuffixGuides: suffixShifterGuides,
}

function guidedLesson(
  lessonId: string,
  activityId: string,
  passageId: string,
  questionIdentifiers: readonly string[],
  difficulty: 1 | 2,
  lessonTitle: string,
  lessonObjective: string,
  teachingBlock: NonNullable<ContentPackLesson['teachingBlock']>,
): ContentPackLesson {
  return {
    lessonId, worldId: suffixShifterWorldId, unitId: suffixShifterUnitId, activityId, difficulty,
    passageIdentifiers: [passageId], questionIdentifiers: [...questionIdentifiers], lessonTitle, lessonObjective,
    lessonRole: 'GUIDED_PRACTICE', selectionStatus: 'active', teachingBlock,
    contentVersion: suffixShifterContentVersion, eligiblePurposes: [...guidedPurposes],
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
    lessonId, worldId: suffixShifterWorldId, unitId: suffixShifterUnitId, activityId, difficulty: 2,
    passageIdentifiers: [passageId], questionIdentifiers: [...questionIdentifiers], lessonTitle,
    lessonObjective: 'Decode transparent derivational suffix words and explain how each suffix changes the word function in connected text.',
    lessonRole: 'CHECKPOINT', selectionStatus: 'active', contentVersion: suffixShifterContentVersion,
    eligiblePurposes: [...checkpointPurposes],
  }
}

export {
  suffixShifterGuides,
  suffixShifterPassages,
  suffixShifterQuestions,
  suffixShifterSupportTargets,
  suffixShifterTargets,
}
