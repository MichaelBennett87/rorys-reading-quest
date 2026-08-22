import type {
  HotTextQuestionData,
  LessonChoice,
  MultipleChoiceQuestionData,
  MultiselectQuestionData,
  ReadingQuestion,
  TableMatchQuestionData,
  TwoPartQuestionData,
} from '../../../../types'

type BaseQuestionSpec = {
  benchmarkReference: 'ELA.2.R.2.3'
  skillIdentifier: 'g2-information-detectives-reading'
  reportingCategory: 'Reading Informational Text'
  genre: 'informational'
  gradeBand: 2
  estimatedReadingLevel: 'Grade 2'
  contentVersion: string
  reviewStatus: 'DRAFT'
  difficulty: 2 | 3
  passageIdentifier: string
  lessonIdentifier: string
  questionIdentifier: string
  prompt: string
  explanation: string
  evidenceReference: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  soundOutChunks: string[]
  tags: string[]
}

type MultipleChoiceSpec = BaseQuestionSpec & {
  choices: LessonChoice[]
  correctChoiceIds: string[]
}

type MultiselectSpec = BaseQuestionSpec & {
  choices: LessonChoice[]
  correctChoiceIds: string[]
}

type HotTextSpec = BaseQuestionSpec & {
  selectableSegments: { id: string; text: string }[]
  correctSegmentIds: string[]
}

type TableMatchSpec = BaseQuestionSpec & {
  rows: {
    id: string
    prompt: string
    correctChoiceId: string
    options: LessonChoice[]
  }[]
}

type TwoPartSpec = BaseQuestionSpec & {
  partAPrompt: string
  partAChoices: LessonChoice[]
  partACorrectChoiceId: string
  partBPrompt: string
  partBChoices: LessonChoice[]
  partBCorrectChoiceId: string
}

const choice = (id: string, text: string): LessonChoice => ({ id, text })
const copyChoices = (choices: LessonChoice[]) => choices.map((item) => ({ ...item }))

const baseQuestion = (spec: BaseQuestionSpec) => ({
  gradeBand: spec.gradeBand,
  benchmarkReference: spec.benchmarkReference,
  skillIdentifier: spec.skillIdentifier,
  prerequisiteSkillIdentifiers: [] as string[],
  reportingCategory: spec.reportingCategory,
  genre: spec.genre,
  difficulty: spec.difficulty,
  passageIdentifier: spec.passageIdentifier,
  activityIdentifier: `${spec.questionIdentifier}-activity`,
  questionIdentifier: spec.questionIdentifier,
  questionType: 'multiple_choice' as const,
  prompt: spec.prompt,
  answerChoices: [] as string[],
  correctAnswers: [] as string[],
  lessonIdentifier: spec.lessonIdentifier,
  explanation: spec.explanation,
  evidenceReference: spec.evidenceReference,
  evidenceReferenceIds: [...spec.evidenceReferenceIds],
  targetVocabulary: [...spec.targetVocabulary],
  soundOutChunks: [...spec.soundOutChunks],
  estimatedReadingLevel: spec.estimatedReadingLevel,
  reviewStatus: spec.reviewStatus,
  contentVersion: spec.contentVersion,
  tags: [...spec.tags],
})

export function createMultipleChoiceQuestion(spec: MultipleChoiceSpec): ReadingQuestion {
  const payload: MultipleChoiceQuestionData = {
    type: 'multiple_choice',
    choices: copyChoices(spec.choices),
    correctChoiceIds: [...spec.correctChoiceIds],
  }
  return {
    ...baseQuestion(spec),
    answerChoices: spec.choices.map((choice) => choice.text),
    correctAnswers: [...spec.correctChoiceIds],
    questionType: 'multiple_choice',
    questionContent: payload,
  }
}

export function createMultiselectQuestion(spec: MultiselectSpec): ReadingQuestion {
  const payload: MultiselectQuestionData = {
    type: 'multi_select',
    choices: copyChoices(spec.choices),
    correctChoiceIds: [...spec.correctChoiceIds],
  }
  return {
    ...baseQuestion(spec),
    answerChoices: spec.choices.map((choice) => choice.text),
    correctAnswers: [...spec.correctChoiceIds],
    questionType: 'multi_select',
    questionContent: payload,
  }
}

export function createHotTextQuestion(spec: HotTextSpec): ReadingQuestion {
  const payload: HotTextQuestionData = {
    type: 'hot_text',
    selectableSegments: spec.selectableSegments.map((segment) => ({ ...segment })),
    correctSegmentIds: [...spec.correctSegmentIds],
  }
  return {
    ...baseQuestion(spec),
    answerChoices: spec.selectableSegments.map((segment) => segment.text),
    correctAnswers: [...spec.correctSegmentIds],
    questionType: 'hot_text',
    questionContent: payload,
  }
}

export function createTableMatchQuestion(spec: TableMatchSpec): ReadingQuestion {
  const payload: TableMatchQuestionData = {
    type: 'table_match',
    rows: spec.rows.map((row) => ({
      id: row.id,
      prompt: row.prompt,
      correctChoiceId: row.correctChoiceId,
      options: copyChoices(row.options),
    })),
  }
  return {
    ...baseQuestion(spec),
    answerChoices: spec.rows.flatMap((row) => row.options.map((option) => option.text)),
    correctAnswers: spec.rows.map((row) => row.correctChoiceId),
    questionType: 'table_match',
    questionContent: payload,
  }
}

export function createEvidencePairQuestion(spec: TwoPartSpec): ReadingQuestion {
  return createTwoPartQuestion(spec)
}

export function createTwoPartQuestion(spec: TwoPartSpec): ReadingQuestion {
  const payload: TwoPartQuestionData = {
    type: 'two_part',
    partAPrompt: spec.partAPrompt,
    partAChoices: copyChoices(spec.partAChoices),
    partACorrectChoiceId: spec.partACorrectChoiceId,
    partBPrompt: spec.partBPrompt,
    partBChoices: copyChoices(spec.partBChoices),
    partBCorrectChoiceId: spec.partBCorrectChoiceId,
  }
  return {
    ...baseQuestion(spec),
    answerChoices: [
      ...spec.partAChoices.map((item) => item.text),
      ...spec.partBChoices.map((item) => item.text),
    ],
    correctAnswers: [spec.partACorrectChoiceId, spec.partBCorrectChoiceId],
    questionType: 'two_part',
    questionContent: payload,
  }
}

export const lessonChoice = choice




