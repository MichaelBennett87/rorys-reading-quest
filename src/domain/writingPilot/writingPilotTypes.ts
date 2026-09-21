import type { GradeBand } from '../content/types'

export const WRITING_PILOT_SCHEMA_VERSION = 1 as const
export const WRITING_PILOT_NOTICE_VERSION = 'rrq-read-write-pilot-notice-v1' as const
export const WRITING_PILOT_RETENTION_DAYS = 30
export const WRITING_PILOT_RECORD_LIMIT = 18
export const WRITING_PILOT_MAX_STROKES = 200
export const WRITING_PILOT_MAX_POINTS = 4_000

export interface WritingPilotActivity {
  activityId: string
  title: string
  gradeBand: Extract<GradeBand, 2 | 3>
  triggerLessonId: string
  sourcePassageId: string
  sourceContentVersion: string
  prompt: string
  rubricVersion: string
  reviewStatus: 'DRAFT'
}

export interface InkPoint {
  x: number
  y: number
  pressure: number
  elapsedMs: number
}

export interface InkStroke {
  strokeId: string
  pointerType: 'pen' | 'touch' | 'mouse' | 'unknown'
  points: InkPoint[]
}

export interface RecognitionUncertainty {
  text: string
  reason: string
  affectsMeaning: boolean
}

export type WritingFeedbackStatus = 'meets' | 'developing' | 'needs_revision' | 'withheld'

export interface WritingFeedbackCategory {
  status: WritingFeedbackStatus
  message: string
  evidenceIds: string[]
}

export interface WritingImprovement {
  suggestionId: string
  category: 'comprehension' | 'evidence' | 'spelling' | 'grammar' | 'capitalization_punctuation'
  originalText: string | null
  replacementText: string | null
  explanation: string
}

export interface WritingFeedback {
  understood: string
  comprehension: WritingFeedbackCategory
  supportingEvidence: WritingFeedbackCategory
  spelling: WritingFeedbackCategory
  grammar: WritingFeedbackCategory
  capitalizationPunctuation: WritingFeedbackCategory
  improvements: WritingImprovement[]
  parentReviewRequired: boolean
  uncertaintyReason: string | null
}

export interface WritingPilotConsentRecord {
  noticeVersion: typeof WRITING_PILOT_NOTICE_VERSION
  acceptedAt: string
  disclosures: Array<
    | 'ink_and_confirmed_text_may_leave_device'
    | 'processor_and_purpose_disclosed'
    | 'retention_and_deletion_disclosed'
    | 'ai_feedback_can_be_wrong'
  >
}

export interface WritingServiceAuthority {
  status: 'authorized'
  installationId: string
  endpointId: string
  retentionControl: 'approved_zero_data_retention'
  approvedAt: string
  expiresAt: string
  budgetLimitMicros: number
  budgetRemainingMicros: number
}

export interface WritingPilotSettings {
  enabled: boolean
  consent: WritingPilotConsentRecord | null
  externalProcessingEnabled: boolean
  serviceAuthority: WritingServiceAuthority | null
}

export interface WritingProviderRequestRecord {
  requestId: string
  kind: 'recognition' | 'evaluation'
  inkRevision: number
  status: 'pending' | 'completed' | 'failed' | 'unknown' | 'superseded'
  startedAt: string
  resolvedAt: string | null
  outcomeCode: string | null
}

export interface WritingParentReviewEvent {
  eventId: string
  kind:
    | 'transcription_corrected'
    | 'suggestion_accepted'
    | 'suggestion_dismissed'
    | 'marked_reviewed'
  suggestionId: string | null
  occurredAt: string
}

export type WritingRecordStatus =
  | 'draft'
  | 'recognition_pending'
  | 'transcription_ready'
  | 'evaluation_pending'
  | 'feedback_ready'
  | 'parent_review_needed'
  | 'completed'

export interface WritingResponseRecord {
  recordId: string
  submissionId: string
  activityId: string
  sourcePassageId: string
  sourceContentVersion: string
  rubricVersion: string
  sourceCompletionId: string
  inputMode: 'handwriting' | 'typed' | 'mixed'
  status: WritingRecordStatus
  inkRevision: number
  strokes: InkStroke[]
  typedDraft: string
  rawTranscription: string | null
  recognitionUncertainties: RecognitionUncertainty[]
  confirmedTranscription: string | null
  transcriptionConfirmedBy: 'learner' | 'parent' | null
  spellingAssessmentSupportable: boolean
  feedback: WritingFeedback | null
  feedbackProvenance: 'openai' | 'mocked' | 'none'
  suggestionDispositions: Record<string, 'accepted' | 'dismissed'>
  requests: WritingProviderRequestRecord[]
  parentReviewEvents: WritingParentReviewEvent[]
  parentReviewedAt: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
  expiresAt: string
}

export interface WritingPilotStateV1 {
  schemaVersion: typeof WRITING_PILOT_SCHEMA_VERSION
  revision: number
  settings: WritingPilotSettings
  records: WritingResponseRecord[]
  pendingRecordId: string | null
  offeredActivityIds: string[]
  createdAt: string
  updatedAt: string
}

export interface WritingRecognitionResult {
  rawTranscription: string
  uncertainties: RecognitionUncertainty[]
  spellingAssessmentSupportable: boolean
  provider: 'openai' | 'mocked'
}

export interface WritingEvaluationResult {
  feedback: WritingFeedback
  provider: 'openai' | 'mocked'
}

export function createDefaultWritingPilotState(now: string): WritingPilotStateV1 {
  return {
    schemaVersion: WRITING_PILOT_SCHEMA_VERSION,
    revision: 0,
    settings: {
      enabled: false,
      consent: null,
      externalProcessingEnabled: false,
      serviceAuthority: null,
    },
    records: [],
    pendingRecordId: null,
    offeredActivityIds: [],
    createdAt: now,
    updatedAt: now,
  }
}
