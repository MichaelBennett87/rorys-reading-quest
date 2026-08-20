import type { GradeBand, ReadingQuestion } from '../../../../types'

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
  activityIdentifier: string
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

export function createMultipleChoiceQuestion(spec: BaseQuestionSpec & {
  choices: ChoiceLike[]
  correctChoiceIds: string[]
}): ReadingQuestion {
  return {
    ...baseQuestion(spec),
    questionType: 'multiple_choice',
    answerChoices: spec.choices.map((choice) => choice.text),
    correctAnswers: [...spec.correctChoiceIds],
    questionContent: {
      type: 'multiple_choice',
      choices: spec.choices,
      correctChoiceIds: [...spec.correctChoiceIds],
    },
  }
}

export function createMultiselectQuestion(spec: BaseQuestionSpec & {
  choices: ChoiceLike[]
  correctChoiceIds: string[]
  allowMultiple?: boolean
}): ReadingQuestion {
  return {
    ...baseQuestion(spec),
    questionType: 'multi_select',
    answerChoices: spec.choices.map((choice) => choice.text),
    correctAnswers: [...spec.correctChoiceIds],
    questionContent: {
      type: 'multi_select',
      choices: spec.choices,
      correctChoiceIds: [...spec.correctChoiceIds],
      allowMultiple: spec.allowMultiple,
    },
  }
}

export function createHotTextQuestion(spec: BaseQuestionSpec & {
  selectableSegments: ChoiceLike[]
  correctSegmentIds: string[]
}): ReadingQuestion {
  return {
    ...baseQuestion(spec),
    questionType: 'hot_text',
    answerChoices: spec.selectableSegments.map((segment) => segment.text),
    correctAnswers: [...spec.correctSegmentIds],
    questionContent: {
      type: 'hot_text',
      selectableSegments: spec.selectableSegments,
      correctSegmentIds: [...spec.correctSegmentIds],
    },
  }
}

export function createTableMatchQuestion(spec: BaseQuestionSpec & {
  rows: {
    id: string
    prompt: string
    correctChoiceId: string
    options: ChoiceLike[]
  }[]
}): ReadingQuestion {
  return {
    ...baseQuestion(spec),
    questionType: 'table_match',
    answerChoices: spec.rows.flatMap((row) => row.options.map((option) => option.text)),
    correctAnswers: spec.rows.map((row) => row.correctChoiceId),
    questionContent: {
      type: 'table_match',
      rows: spec.rows,
    },
  }
}

function baseQuestion(spec: BaseQuestionSpec): Omit<ReadingQuestion, 'questionType' | 'answerChoices' | 'correctAnswers' | 'questionContent'> {
  return {
    gradeBand: spec.gradeBand ?? 2,
    benchmarkReference: spec.benchmarkReference,
    skillIdentifier: spec.skillIdentifier,
    prerequisiteSkillIdentifiers: spec.prerequisiteSkillIdentifiers ?? [],
    reportingCategory: spec.reportingCategory,
    genre: spec.genre,
    difficulty: spec.difficulty,
    passageIdentifier: spec.passageIdentifier,
    activityIdentifier: spec.activityIdentifier,
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
