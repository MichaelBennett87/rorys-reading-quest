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
  grade3MeaningMazeContentVersion,
  grade3MeaningMazePrimarySkillId,
} from './ids'

type QuestionGenre = 'informational' | 'literary' | 'poetry'

type BaseQuestionSpec = {
  difficulty: 2 | 3
  genre: QuestionGenre
  passageIdentifier: string
  lessonIdentifier: string
  questionIdentifier: string
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  tags: string[]
}

type MultipleChoiceSpec = BaseQuestionSpec & { choices: LessonChoice[]; correctChoiceIds: string[] }
type MultiselectSpec = BaseQuestionSpec & { choices: LessonChoice[]; correctChoiceIds: string[] }
type HotTextSpec = BaseQuestionSpec & { selectableSegments: { id: string; text: string }[]; correctSegmentIds: string[] }
type TableMatchSpec = BaseQuestionSpec & {
  rows: { id: string; prompt: string; correctChoiceId: string; options: LessonChoice[] }[]
  selectionMode?: 'independent' | 'use_each_once'
}
type TwoPartSpec = BaseQuestionSpec & {
  partAPrompt: string
  partAChoices: LessonChoice[]
  partACorrectChoiceId: string
  partBPrompt: string
  partBChoices: LessonChoice[]
  partBCorrectChoiceId: string
}

const copyChoices = (choices: LessonChoice[]) => choices.map((choice) => ({ ...choice }))
const baseQuestion = (spec: BaseQuestionSpec) => ({
  gradeBand: 3 as const,
  benchmarkReference: 'ELA.3.V.1.3',
  skillIdentifier: grade3MeaningMazePrimarySkillId,
  prerequisiteSkillIdentifiers: [] as string[],
  reportingCategory: 'Reading Across Genres and Vocabulary',
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
  evidenceReference: spec.evidenceReferenceIds[0],
  evidenceReferenceIds: [...spec.evidenceReferenceIds],
  targetVocabulary: [...spec.targetVocabulary],
  soundOutChunks: [...spec.targetVocabulary],
  estimatedReadingLevel: 'Grade 3' as const,
  reviewStatus: 'DRAFT' as const,
  contentVersion: grade3MeaningMazeContentVersion,
  tags: [...spec.tags],
})

export const lessonChoice = (id: string, text: string): LessonChoice => ({ id, text })

export function createMultipleChoiceQuestion(spec: MultipleChoiceSpec): ReadingQuestion {
  const questionContent: MultipleChoiceQuestionData = {
    type: 'multiple_choice', choices: copyChoices(spec.choices), correctChoiceIds: [...spec.correctChoiceIds],
  }
  return { ...baseQuestion(spec), answerChoices: spec.choices.map((choice) => choice.text), correctAnswers: [...spec.correctChoiceIds], questionType: 'multiple_choice', questionContent }
}

export function createMultiselectQuestion(spec: MultiselectSpec): ReadingQuestion {
  const questionContent: MultiselectQuestionData = {
    type: 'multi_select', choices: copyChoices(spec.choices), correctChoiceIds: [...spec.correctChoiceIds],
  }
  return { ...baseQuestion(spec), answerChoices: spec.choices.map((choice) => choice.text), correctAnswers: [...spec.correctChoiceIds], questionType: 'multi_select', questionContent }
}

export function createHotTextQuestion(spec: HotTextSpec): ReadingQuestion {
  const questionContent: HotTextQuestionData = {
    type: 'hot_text', selectableSegments: spec.selectableSegments.map((segment) => ({ ...segment })), correctSegmentIds: [...spec.correctSegmentIds],
  }
  return { ...baseQuestion(spec), answerChoices: spec.selectableSegments.map((segment) => segment.text), correctAnswers: [...spec.correctSegmentIds], questionType: 'hot_text', questionContent }
}

export function createTableMatchQuestion(spec: TableMatchSpec): ReadingQuestion {
  const questionContent: TableMatchQuestionData = {
    type: 'table_match',
    selectionMode: spec.selectionMode,
    rows: spec.rows.map((row) => ({ ...row, options: copyChoices(row.options) })),
  }
  return { ...baseQuestion(spec), answerChoices: spec.rows.flatMap((row) => row.options.map((option) => option.text)), correctAnswers: spec.rows.map((row) => row.correctChoiceId), questionType: 'table_match', questionContent }
}

export function createTwoPartQuestion(spec: TwoPartSpec): ReadingQuestion {
  const questionContent: TwoPartQuestionData = {
    type: 'two_part',
    partAPrompt: spec.partAPrompt,
    partAChoices: copyChoices(spec.partAChoices),
    partACorrectChoiceId: spec.partACorrectChoiceId,
    partBPrompt: spec.partBPrompt,
    partBChoices: copyChoices(spec.partBChoices),
    partBCorrectChoiceId: spec.partBCorrectChoiceId,
  }
  return { ...baseQuestion(spec), answerChoices: [...spec.partAChoices, ...spec.partBChoices].map((choice) => choice.text), correctAnswers: [spec.partACorrectChoiceId, spec.partBCorrectChoiceId], questionType: 'two_part', questionContent }
}
