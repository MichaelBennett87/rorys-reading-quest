import type { GradeBand, ReadingQuestion } from '../../../../types'
import {
  createHotTextQuestion as createBaseHotTextQuestion,
  createMultipleChoiceQuestion as createBaseMultipleChoiceQuestion,
  createMultiselectQuestion as createBaseMultiselectQuestion,
  createTableMatchQuestion as createBaseTableMatchQuestion,
} from '../../wordForge/variableVowelsOoEa/questionFactories'

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
      partBPrompt: 'Which detail best supports that answer?',
      partBChoices: spec.partBChoices,
      partBCorrectChoiceId: spec.partBCorrectChoiceId,
    },
  }
}

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

export function createMultipleChoiceQuestion(spec: Omit<Parameters<typeof createBaseMultipleChoiceQuestion>[0], 'activityIdentifier'>) {
  return createBaseMultipleChoiceQuestion({
    ...spec,
    activityIdentifier: spec.questionIdentifier,
  })
}

export function createMultiselectQuestion(spec: Omit<Parameters<typeof createBaseMultiselectQuestion>[0], 'activityIdentifier'>) {
  return createBaseMultiselectQuestion({
    ...spec,
    activityIdentifier: spec.questionIdentifier,
  })
}

export function createHotTextQuestion(spec: Omit<Parameters<typeof createBaseHotTextQuestion>[0], 'activityIdentifier'>) {
  return createBaseHotTextQuestion({
    ...spec,
    activityIdentifier: spec.questionIdentifier,
  })
}

export function createTableMatchQuestion(spec: Omit<Parameters<typeof createBaseTableMatchQuestion>[0], 'activityIdentifier'>) {
  return createBaseTableMatchQuestion({
    ...spec,
    activityIdentifier: spec.questionIdentifier,
  })
}
