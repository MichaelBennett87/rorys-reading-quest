import type {
  LessonActivityCandidate,
  NextQuestPlan,
  RecentLessonActivityUsage,
  SkillProgressState,
} from '../domain/progression'
import type { LearningState } from '../domain/progression'
import type { AssistanceEvent, AssistanceSummary } from '../domain/assistance'
import type { ActiveFluencyPracticeState, FluencyPracticeSummary, LessonRole } from '../domain/lesson'

export const QUEST_PROGRESS_SCHEMA_VERSION = 1 as const
export const QUEST_PROGRESS_STORAGE_KEY = 'rorys-reading-quest.progress.v1'
export const COMPLETED_ATTEMPT_LIMIT = 250
export const RECENT_ACTIVITY_LIMIT_PER_TRAIL = 12

export type PersistedAnswer = string | string[] | Record<string, string>

export interface PersistedQuestionSummary {
  questionId: string
  isCorrect: boolean
  isFirstAttemptCorrect: boolean
}

export interface CompletedLessonAttempt {
  attemptId: string
  completionId: string
  lessonId: string
  lessonRole?: LessonRole
  activityId: string
  skillId: string
  difficulty: number
  questionResults: PersistedQuestionSummary[]
  accuracy: number
  assistanceCount: number
  assistanceSummary: AssistanceSummary
  fluencyPracticeSummary?: FluencyPracticeSummary | null
  assistanceEvents: PersistedAssistanceEvent[]
  completedAt: string
  progressionDecisionState: LearningState
  reasonCodes: string[]
  nextReviewDate: string | null
}

export interface PersistedSubmittedQuestion extends PersistedQuestionSummary {
  submittedAnswer: PersistedAnswer
}

export interface ActiveLessonSession {
  sessionId: string
  lessonId: string
  lessonRole?: LessonRole
  activityId: string
  contentVersion: string
  skillId: string
  difficulty: number
  currentQuestionIndex: number
  submittedQuestions: PersistedSubmittedQuestion[]
  assistanceEvents: PersistedAssistanceEvent[]
  fluencyPracticeState?: ActiveFluencyPracticeState | null
  startedAt: string
  updatedAt: string
}

export interface PersistedAssistanceEvent extends Pick<
  AssistanceEvent,
  | 'eventId'
  | 'sessionId'
  | 'lessonId'
  | 'activityId'
  | 'questionId'
  | 'targetId'
  | 'assistanceKind'
  | 'assistanceLevel'
  | 'occurredAt'
> {}

export interface ReviewQueueEntry {
  skillId: string
  difficulty: number
  reviewStep: number
  dueAt: string
  unitId?: string
  contentVersion?: string
}

export interface LastProgressionOutcome {
  completionId: string
  decisionState: LearningState
  reasonCodes: string[]
  earnedXp: number
  earnedStars: number
  completedAt: string
  lessonRole?: LessonRole
}

export interface QuestProgressMetadata {
  createdAt: string
  updatedAt: string
}

export interface QuestProgressV1 {
  schemaVersion: typeof QUEST_PROGRESS_SCHEMA_VERSION
  learnerId: 'local-learner'
  totalXp: number
  totalStars: number
  completedSessionCount: number
  skillProgress: Record<string, SkillProgressState>
  completedAttempts: CompletedLessonAttempt[]
  recentActivityUsage: Record<string, RecentLessonActivityUsage[]>
  reviewQueue: ReviewQueueEntry[]
  activeLessonSession: ActiveLessonSession | null
  plannedNextQuest: NextQuestPlan | null
  lastProgressionOutcome: LastProgressionOutcome | null
  metadata: QuestProgressMetadata
}

export type QuestProgressStorageStatus =
  | 'loaded'
  | 'empty'
  | 'unavailable'
  | 'invalid_json'
  | 'unsupported_version'
  | 'invalid_state'
  | 'storage_error'

export interface QuestProgressLoadResult {
  state: QuestProgressV1
  status: QuestProgressStorageStatus
  technicalDetail?: string
}

export interface QuestProgressSaveResult {
  state: QuestProgressV1
  status: 'saved' | 'unavailable' | 'storage_error'
  technicalDetail?: string
}

export interface ActiveSessionRecoveryResult {
  state: QuestProgressV1
  status: 'none' | 'resumable' | 'discarded_incompatible'
  technicalDetail?: string
}

export interface QuestProgressStore {
  load(): QuestProgressLoadResult
  save(state: QuestProgressV1): QuestProgressSaveResult
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface ActiveSessionCompatibilityInput {
  state: QuestProgressV1
  availableLessons: readonly LessonActivityCandidate[]
}
