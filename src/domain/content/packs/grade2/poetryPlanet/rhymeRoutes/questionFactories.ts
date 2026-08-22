import type { GradeBand, ReadingQuestion } from '../../../../types'
import {
  createHotTextQuestion as createBaseHotTextQuestion,
  createMultipleChoiceQuestion as createBaseMultipleChoiceQuestion,
  createMultiselectQuestion as createBaseMultiselectQuestion,
  createTableMatchQuestion as createBaseTableMatchQuestion,
} from '../../storyScouts/themeTrail/questionFactories'

interface BaseQuestionSpec {
  gradeBand?: GradeBand
  benchmarkReference: string
  skillIdentifier: string
  prerequisiteSkillIdentifiers?: string[]
  reportingCategory: string
  genre: string
  difficulty: number
  passageIdentifier: string
  lessonIdentifier: string
  questionIdentifier: string
  prompt: string
  explanation: string
  evidenceReference: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  soundOutChunks: string[]
  estimatedReadingLevel: string
  reviewStatus?: ReadingQuestion['reviewStatus']
  contentVersion: string
  tags: string[]
}

interface ChoiceLike {
  id: string
  text: string
}

export const RHYME_ROUTES_QUESTION_TAGS = [
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
] as const

function baseQuestion(spec: BaseQuestionSpec): Omit<
  ReadingQuestion,
  'questionType' | 'answerChoices' | 'correctAnswers' | 'questionContent'
> {
  return {
    gradeBand: spec.gradeBand ?? 2,
    benchmarkReference: spec.benchmarkReference,
    skillIdentifier: spec.skillIdentifier,
    prerequisiteSkillIdentifiers: spec.prerequisiteSkillIdentifiers ?? [],
    reportingCategory: spec.reportingCategory,
    genre: spec.genre,
    difficulty: spec.difficulty,
    passageIdentifier: spec.passageIdentifier,
    activityIdentifier: spec.questionIdentifier,
    questionIdentifier: spec.questionIdentifier,
    lessonIdentifier: spec.lessonIdentifier,
    prompt: spec.prompt,
    explanation: spec.explanation,
    evidenceReference: spec.evidenceReference,
    evidenceReferenceIds: [...spec.evidenceReferenceIds],
    targetVocabulary: [...spec.targetVocabulary],
    soundOutChunks: [...spec.soundOutChunks],
    estimatedReadingLevel: spec.estimatedReadingLevel,
    reviewStatus: spec.reviewStatus ?? 'DRAFT',
    contentVersion: spec.contentVersion,
    tags: [...spec.tags],
  }
}

export function createMultipleChoiceQuestion(spec: Parameters<typeof createBaseMultipleChoiceQuestion>[0]) {
  return createBaseMultipleChoiceQuestion(spec)
}

export function createMultiselectQuestion(spec: Parameters<typeof createBaseMultiselectQuestion>[0]) {
  return createBaseMultiselectQuestion(spec)
}

export function createHotTextQuestion(spec: Parameters<typeof createBaseHotTextQuestion>[0]) {
  return createBaseHotTextQuestion(spec)
}

export function createTableMatchQuestion(spec: Parameters<typeof createBaseTableMatchQuestion>[0]) {
  return createBaseTableMatchQuestion(spec)
}

export function createEvidencePairQuestion(
  spec: BaseQuestionSpec & {
    partAChoices: ChoiceLike[]
    partACorrectChoiceId: string
    partBChoices: ChoiceLike[]
    partBCorrectChoiceId: string
  },
): ReadingQuestion {
  return {
    ...baseQuestion(spec),
    questionType: 'two_part',
    answerChoices: [
      ...spec.partAChoices.map((choice) => choice.text),
      ...spec.partBChoices.map((choice) => choice.text),
    ],
    correctAnswers: [spec.partACorrectChoiceId, spec.partBCorrectChoiceId],
    questionContent: {
      type: 'two_part',
      partAPrompt: spec.prompt,
      partAChoices: spec.partAChoices,
      partACorrectChoiceId: spec.partACorrectChoiceId,
      partBPrompt: 'Which choice best supports that answer?',
      partBChoices: spec.partBChoices,
      partBCorrectChoiceId: spec.partBCorrectChoiceId,
    },
  }
}
