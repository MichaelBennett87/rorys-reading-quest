export type AssistanceLevel = 1 | 2 | 3 | 4 | 5 | 6

export type AssistanceKind =
  | 'PATTERN_HIGHLIGHT'
  | 'SHOW_CHUNKS'
  | 'SPEAK_CHUNKS'
  | 'SPEAK_BLEND'
  | 'SPEAK_WORD'
  | 'SPEAK_SENTENCE'

export interface AssistanceEvent {
  eventId: string
  sessionId: string
  lessonId: string
  activityId: string
  questionId?: string
  targetId: string
  assistanceKind: AssistanceKind
  assistanceLevel: AssistanceLevel
  occurredAt: string
}

export interface AssistanceSummary {
  totalUniqueEvents: number
  targetsHelped: number
  maximumAssistanceLevel: AssistanceLevel | 0
  visualHintUsed: boolean
  spokenChunkHelpUsed: boolean
  spokenWordHelpUsed: boolean
  sentenceReadAloudUsed: boolean
}

export interface AssistanceInput {
  sessionId: string
  lessonId: string
  activityId: string
  questionId?: string
  targetId: string
  kind: AssistanceKind
  level: AssistanceLevel
  timestamp: string
  existingEvents: readonly AssistanceEvent[]
}

export interface AssistanceCheckpointInput {
  hintsUsed: number
  majorHintsUsed: number
  sentenceReadAloudUsed: boolean
}
