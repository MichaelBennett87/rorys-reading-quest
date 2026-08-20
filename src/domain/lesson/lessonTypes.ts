import type { QuestionType } from '../content/types'
import type { AssistanceSummary } from '../assistance'

export type LessonQuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTISELECT'
  | 'HOT_TEXT'
  | 'EVIDENCE_PAIR'
  | 'TABLE_MATCH'

export interface LessonChoice {
  id: string
  text: string
}

interface LessonQuestionBase {
  questionId: string
  questionType: LessonQuestionType
  lessonId: string
  activityId: string
  passageId: string
  skillId: string
  difficulty: number
  prompt: string
  explanation: string
  evidenceReferenceIds: string[]
}

export interface MultipleChoiceLessonQuestion extends LessonQuestionBase {
  questionType: 'MULTIPLE_CHOICE'
  choices: LessonChoice[]
  correctChoiceIds: string[]
}

export interface MultiselectLessonQuestion extends LessonQuestionBase {
  questionType: 'MULTISELECT'
  choices: LessonChoice[]
  correctChoiceIds: string[]
}

export interface HotTextLessonQuestion extends LessonQuestionBase {
  questionType: 'HOT_TEXT'
  segments: LessonChoice[]
  correctSegmentIds: string[]
  allowMultiple: boolean
}

export interface EvidencePairLessonQuestion extends LessonQuestionBase {
  questionType: 'EVIDENCE_PAIR'
  partAPrompt: string
  partAChoices: LessonChoice[]
  partACorrectChoiceId: string
  partBPrompt: string
  partBChoices: LessonChoice[]
  partBCorrectChoiceId: string
}

export interface TableMatchLessonQuestion extends LessonQuestionBase {
  questionType: 'TABLE_MATCH'
  rows: {
    id: string
    prompt: string
    correctChoiceId: string
    options: LessonChoice[]
  }[]
}

export type LessonQuestion =
  | MultipleChoiceLessonQuestion
  | MultiselectLessonQuestion
  | HotTextLessonQuestion
  | EvidencePairLessonQuestion
  | TableMatchLessonQuestion

export interface LessonDefinition {
  lessonId: string
  activityId: string
  passageId: string
  skillId: string
  difficulty: number
  unitId: string
  worldId: string
  lessonTitle: string
  lessonObjective: string
  questionCount: number
  questions: LessonQuestion[]
  contentVersion: string
  eligiblePurposes: LessonPurpose[]
}

export type LessonPurpose = 'progression' | 'verification' | 'remediation' | 'review'

export interface LessonQuestionState {
  questionId: string
  questionType: LessonQuestionType
  firstAttemptCorrect: boolean
  isLocked: boolean
  isSubmitted: boolean
  submittedAnswer: unknown
  evaluationResult: QuestionEvaluationResult | null
}

export interface QuestionEvaluationResult {
  questionId: string
  questionType: LessonQuestionType
  submittedAnswer: unknown
  correctAnswer: unknown
  isCorrect: boolean
  explanation: string
  evidenceReference: string[]
}

export interface LessonQuestionSubmission {
  questionType: LessonQuestionType
  payload:
    | { selectedChoiceId: string }
    | { selectedChoiceIds: string[]; allowMultiple?: boolean }
    | { selectedSegmentIds: string[] }
    | { partAChoiceId: string; partBChoiceId: string }
    | { selectedMappings: Record<string, string> }
}

export interface LessonResultQuestion {
  questionId: string
  isCorrect: boolean
  isFirstAttemptCorrect: boolean
  submittedAnswer: unknown
  correctAnswer: unknown
  explanation: string
  evidenceReference: string[]
}

export interface LessonResult {
  lessonId: string
  activityId: string
  skillId: string
  difficulty: number
  totalQuestions: number
  correctAnswers: number
  firstAttemptCorrect: number
  accuracy: number
  assistanceUsed: number
  assistanceSummary: AssistanceSummary
  questionResults: LessonResultQuestion[]
  completed: boolean
}

export interface LessonFlowState {
  lessonId: string
  activityId: string
  passageId: string
  skillId: string
  difficulty: number
  currentQuestionIndex: number
  questionStates: Record<string, LessonQuestionState>
  submittedCount: number
}

export interface LessonCatalogEntry {
  lessonId: string
  worldId: string
  unitId: string
  activityId: string
  passageIdentifier: string[]
  questionIdentifiers: string[]
  lessonTitle: string
  lessonObjective: string
  contentVersion: string
  eligiblePurposes: LessonPurpose[]
}

export interface QuestionTypeMap {
  sourceType: QuestionType
  lessonType: LessonQuestionType
}
