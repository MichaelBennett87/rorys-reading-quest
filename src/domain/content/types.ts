export type GradeBand = 2 | 3 | 4

export type ContentReviewStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'RETIRED'

export type QuestionType =
  | 'multiple_choice'
  | 'multi_select'
  | 'hot_text'
  | 'two_part'
  | 'table_match'
  | 'chart_based'

export interface LessonChoice {
  id: string
  text: string
}

export interface MultipleChoiceQuestionData {
  type: 'multiple_choice'
  choices: LessonChoice[]
  correctChoiceIds: string[]
}

export interface MultiselectQuestionData {
  type: 'multi_select'
  choices: LessonChoice[]
  correctChoiceIds: string[]
  allowMultiple?: boolean
}

export interface HotTextQuestionData {
  type: 'hot_text'
  selectableSegments: {
    id: string
    text: string
  }[]
  correctSegmentIds: string[]
}

export interface TwoPartQuestionData {
  type: 'two_part'
  partAPrompt: string
  partAChoices: LessonChoice[]
  partACorrectChoiceId: string
  partBPrompt: string
  partBChoices: LessonChoice[]
  partBCorrectChoiceId: string
}

export interface TableMatchQuestionData {
  type: 'table_match'
  rows: {
    id: string
    prompt: string
    correctChoiceId: string
    options: LessonChoice[]
  }[]
}

export type QuestionContentPayload =
  | MultipleChoiceQuestionData
  | MultiselectQuestionData
  | HotTextQuestionData
  | TwoPartQuestionData
  | TableMatchQuestionData

export interface Passage {
  passageIdentifier: string
  gradeBand: GradeBand
  passageText: string
  sentences?: {
    sentenceId: string
    text: string
  }[]
  readingContext: string
  sourceReference?: string
  contentVersion: string
  reviewStatus?: ContentReviewStatus
  wordSupportTargets?: WordSupportTarget[]
}

export interface WordSupportPart {
  text: string
  emphasis: boolean
}

export interface WordSupportChunk {
  displayText: string
  speechText: string
}

export interface WordSupportTarget {
  targetId: string
  passageId: string
  sentenceId: string
  surfaceWord: string
  focusParts: WordSupportPart[]
  displayChunks: WordSupportChunk[]
  spokenChunks: WordSupportChunk[]
  blendSpeechText: string
  wholeWordSpeechText: string
  sentenceSpeechText: string
  reviewStatus: ContentReviewStatus
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
  lessonIdentifier?: string
  explanation?: string
  evidenceReference: string
  evidenceReferenceIds?: string[]
  targetVocabulary: string[]
  soundOutChunks: string[]
  estimatedReadingLevel: string
  reviewStatus: ContentReviewStatus
  contentVersion: string
  tags: string[]
  questionContent?: QuestionContentPayload
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
    | 'missing_choices'
    | 'malformed_question_payload'
    | 'malformed_table_match_rows'
    | 'duplicate_option_id'
    | 'duplicate_hot_text_segment_id'
    | 'missing_hot_text_segments'
  | 'invalid_evidence_reference'
  | 'duplicate_activity_identifier'
  | 'duplicate_question_identifier'
  | 'invalid_support_reference'
  | 'unknown_prerequisite'
  | 'missing_review_status'
  | 'approved_without_explanation'
  | 'missing_referenced_passage'
  | 'duplicate_support_target_id'
  | 'duplicate_support_placement'
  | 'duplicate_target_placement'
  | 'invalid_support_metadata'
  | 'missing_support_sentence'
  | 'duplicate_support_reference'
  message: string
  itemIdentifier: string
}
