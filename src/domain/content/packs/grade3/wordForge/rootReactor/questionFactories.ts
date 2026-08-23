import type {
  HotTextQuestionData,
  LessonChoice,
  MultipleChoiceQuestionData,
  MultiselectQuestionData,
  ReadingQuestion,
  TableMatchQuestionData,
  TwoPartQuestionData,
} from '../../../../types'
import { rootReactorContentVersion, rootReactorSkillId } from './ids'

export interface RootQuestionBase {
  questionIdentifier: string
  lessonIdentifier: string
  passageIdentifier: string
  difficulty: 0 | 1
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
  targetVocabulary: string[]
  soundOutChunks: string[]
  tags: string[]
}

const base = (spec: RootQuestionBase) => ({
  gradeBand: 3 as const,
  benchmarkReference: 'ELA.3.F.1.3',
  skillIdentifier: rootReactorSkillId,
  prerequisiteSkillIdentifiers: [] as string[],
  reportingCategory: 'Foundational Skills Bridge',
  genre: 'informational',
  difficulty: spec.difficulty,
  passageIdentifier: spec.passageIdentifier,
  activityIdentifier: `${spec.questionIdentifier}-activity`,
  questionIdentifier: spec.questionIdentifier,
  prompt: spec.prompt,
  lessonIdentifier: spec.lessonIdentifier,
  explanation: spec.explanation,
  evidenceReference: spec.evidenceReferenceIds[0] ?? spec.passageIdentifier,
  evidenceReferenceIds: [...spec.evidenceReferenceIds],
  targetVocabulary: [...spec.targetVocabulary],
  soundOutChunks: [...spec.soundOutChunks],
  estimatedReadingLevel: 'Grade 3',
  reviewStatus: 'DRAFT' as const,
  contentVersion: rootReactorContentVersion,
  tags: [...spec.tags],
})

export function rootChoice(id: string, text: string): LessonChoice {
  return { id, text }
}

export function makeRootMultipleChoice(
  spec: RootQuestionBase & { choices: LessonChoice[]; correctChoiceId: string },
): ReadingQuestion {
  const questionContent: MultipleChoiceQuestionData = {
    type: 'multiple_choice',
    choices: spec.choices.map((choice) => ({ ...choice })),
    correctChoiceIds: [spec.correctChoiceId],
  }
  return {
    ...base(spec),
    questionType: 'multiple_choice',
    answerChoices: spec.choices.map((choice) => choice.text),
    correctAnswers: [spec.correctChoiceId],
    questionContent,
  }
}

export function makeRootMultiselect(
  spec: RootQuestionBase & { choices: LessonChoice[]; correctChoiceIds: string[] },
): ReadingQuestion {
  const questionContent: MultiselectQuestionData = {
    type: 'multi_select',
    choices: spec.choices.map((choice) => ({ ...choice })),
    correctChoiceIds: [...spec.correctChoiceIds],
    allowMultiple: true,
  }
  return {
    ...base(spec),
    questionType: 'multi_select',
    answerChoices: spec.choices.map((choice) => choice.text),
    correctAnswers: [...spec.correctChoiceIds],
    questionContent,
  }
}

export function makeRootHotText(
  spec: RootQuestionBase & { segments: LessonChoice[]; correctSegmentIds: string[] },
): ReadingQuestion {
  const questionContent: HotTextQuestionData = {
    type: 'hot_text',
    selectableSegments: spec.segments.map((segment) => ({ ...segment })),
    correctSegmentIds: [...spec.correctSegmentIds],
  }
  return {
    ...base(spec),
    questionType: 'hot_text',
    answerChoices: spec.segments.map((segment) => segment.text),
    correctAnswers: [...spec.correctSegmentIds],
    questionContent,
  }
}

export function makeRootTableMatch(
  spec: RootQuestionBase & { rows: TableMatchQuestionData['rows'] },
): ReadingQuestion {
  const questionContent: TableMatchQuestionData = {
    type: 'table_match',
    rows: spec.rows.map((row) => ({ ...row, options: row.options.map((option) => ({ ...option })) })),
  }
  return {
    ...base(spec),
    questionType: 'table_match',
    answerChoices: spec.rows.flatMap((row) => row.options.map((option) => option.text)),
    correctAnswers: spec.rows.map((row) => row.correctChoiceId),
    questionContent,
  }
}

export function makeRootTwoPart(
  spec: RootQuestionBase & Omit<TwoPartQuestionData, 'type'>,
): ReadingQuestion {
  const questionContent: TwoPartQuestionData = {
    type: 'two_part',
    partAPrompt: spec.partAPrompt,
    partAChoices: spec.partAChoices.map((choice) => ({ ...choice })),
    partACorrectChoiceId: spec.partACorrectChoiceId,
    partBPrompt: spec.partBPrompt,
    partBChoices: spec.partBChoices.map((choice) => ({ ...choice })),
    partBCorrectChoiceId: spec.partBCorrectChoiceId,
  }
  return {
    ...base(spec),
    questionType: 'two_part',
    answerChoices: [...spec.partAChoices, ...spec.partBChoices].map((choice) => choice.text),
    correctAnswers: [spec.partACorrectChoiceId, spec.partBCorrectChoiceId],
    questionContent,
  }
}
