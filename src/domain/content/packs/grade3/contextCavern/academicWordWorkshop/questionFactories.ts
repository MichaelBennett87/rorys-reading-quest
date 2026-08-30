import type {
  HotTextQuestionData,
  LessonChoice,
  MultipleChoiceQuestionData,
  MultiselectQuestionData,
  ReadingQuestion,
  TableMatchQuestionData,
  TwoPartQuestionData,
} from '../../../../types'
import {
  grade3AcademicWordWorkshopContentVersion,
  grade3AcademicWordWorkshopPrimarySkillId,
} from './ids'

type BaseQuestionSpec = {
  difficulty: 0 | 1
  passageIdentifier: string
  lessonIdentifier: string
  questionIdentifier: string
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
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

const copyChoices = (choices: LessonChoice[]) => choices.map((item) => ({ ...item }))

const baseQuestion = (spec: BaseQuestionSpec) => ({
  gradeBand: 3 as const,
  benchmarkReference: 'ELA.3.V.1.1',
  skillIdentifier: grade3AcademicWordWorkshopPrimarySkillId,
  prerequisiteSkillIdentifiers: [] as string[],
  reportingCategory: 'Reading Across Genres and Vocabulary',
  genre: 'informational' as const,
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
  evidenceReference: spec.evidenceReferenceIds[0],
  evidenceReferenceIds: [...spec.evidenceReferenceIds],
  targetVocabulary: [...spec.targetVocabulary],
  soundOutChunks: [...spec.targetVocabulary],
  estimatedReadingLevel: 'Grade 3' as const,
  reviewStatus: 'DRAFT' as const,
  contentVersion: grade3AcademicWordWorkshopContentVersion,
  tags: [...spec.tags],
})

export const lessonChoice = (id: string, text: string): LessonChoice => ({ id, text })

export function createMultipleChoiceQuestion(spec: MultipleChoiceSpec): ReadingQuestion {
  const payload: MultipleChoiceQuestionData = {
    type: 'multiple_choice',
    choices: copyChoices(spec.choices),
    correctChoiceIds: [...spec.correctChoiceIds],
  }
  return {
    ...baseQuestion(spec),
    answerChoices: spec.choices.map((item) => item.text),
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
    answerChoices: spec.choices.map((item) => item.text),
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
