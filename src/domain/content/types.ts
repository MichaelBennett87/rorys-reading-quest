export type GradeBand = 2 | 3 | 4

export type ContentReviewStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'RETIRED'

export type QuestionType =
  | 'multiple_choice'
  | 'multi_select'
  | 'hot_text'
  | 'two_part'
  | 'table_match'
  | 'chart_based'

export interface Passage {
  passageIdentifier: string
  gradeBand: GradeBand
  passageText: string
  readingContext: string
  sourceReference?: string
  contentVersion: string
}

export interface ReadingQuestion {
  gradeBand: GradeBand
  benchmarkReference: string
  skillIdentifier: string
  prerequisiteSkillIdentifiers: string[]
  reportingCategory: string
  genre: string
  difficulty: number
  passageIdentifier: string
  activityIdentifier: string
  questionIdentifier: string
  questionType: QuestionType
  prompt: string
  answerChoices: string[]
  correctAnswers: string[]
  explanation?: string
  evidenceReference: string
  targetVocabulary: string[]
  soundOutChunks: string[]
  estimatedReadingLevel: string
  reviewStatus: ContentReviewStatus
  contentVersion: string
  tags: string[]
}

export interface ContentSample {
  passages: Passage[]
  questions: ReadingQuestion[]
}

export interface ContentValidationError {
  code:
    | 'missing_identifier'
    | 'unsupported_question_type'
    | 'missing_correct_answer'
    | 'duplicate_activity_identifier'
    | 'duplicate_question_identifier'
    | 'unknown_prerequisite'
    | 'missing_review_status'
    | 'approved_without_explanation'
    | 'missing_referenced_passage'
  message: string
  itemIdentifier: string
}
