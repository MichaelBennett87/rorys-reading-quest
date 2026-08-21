import type { AssistanceSummary } from '../assistance'
import type { ContentSample } from '../content'
import type { LearningState } from '../progression'
import type { QuestProgressV1 } from '../../persistence'

export type DashboardDataAvailability = 'no_data' | 'partial' | 'ready'
export type ParentAttentionSeverity = 'info' | 'attention'
export type ParentAttentionKind =
  | 'REVIEW_DUE'
  | 'ACTIVE_REMEDIATION'
  | 'FRESH_VERIFICATION_NEEDED'
  | 'REPEATED_SAME_SKILL_SUPPORT'
  | 'RECENT_ACCURACY_REINFORCEMENT'
  | 'CONTENT_NEEDED'
  | 'NO_RECENT_ACTIVITY'

export type ClassificationStatus = 'classified' | 'unclassified'

export interface DashboardOverview {
  completedSessions: number
  totalXp: number
  totalStars: number
  recentAverageAccuracy: number | null
  latestCompletedSessionDate: string | null
  totalIndependentMasteryMilestones: number
  skillsRepresented: number
  reviewsCurrentlyDue: number
  activeRemediationRoutes: number
}

export interface DashboardFluencyPracticeSummary {
  completedFluencyPracticeSessions: number
  distinctFluencyActivitiesCompleted: number
  modelReadSessions: number
  phrasePracticeSessions: number
  totalCompletedReads: number
  reflectionCounts: {
    smooth: number
    some_pauses: number
    try_again: number
  }
  lastFluencyPracticeDate: string | null
  practiceComplete: boolean
  oralReadingMeasured: false
}

export interface DashboardCategorySummary {
  reportingCategory: string
  rawCategories: string[]
  totalQuestionAttempts: number
  correctResponses: number
  firstAttemptCorrectResponses: number
  overallAccuracy: number | null
  firstAttemptAccuracy: number | null
  assistedSessionCount: number
  assistedSessionRate: number | null
  mostRecentActivityDate: string | null
  dataAvailability: DashboardDataAvailability
  unclassifiedQuestionCount: number
}

export interface DashboardBenchmarkSummary {
  benchmarkReference: string
  skillIdentifier: string
  reportingCategory: string
  gradeBand: number | null
  questionAttempts: number
  accuracy: number | null
  firstAttemptAccuracy: number | null
  assistedSessionRate: number | null
  mostRecentActivityDate: string | null
  currentDifficulty: number | null
  lastMasteredDifficulty: number | null
  distinctIndependentEvidenceCount: number
  currentLearningState: LearningState | null
  nextReviewDate: string | null
  activeRemediationTarget: string | null
  parentStatusExplanation: string
  dataAvailability: DashboardDataAvailability
}

export interface DashboardSkillSummary {
  skillId: string
  benchmarkReference: string | null
  benchmarkReferences: string[]
  reportingCategory: string
  gradeBand: number | null
  questionAttempts: number
  accuracy: number | null
  firstAttemptAccuracy: number | null
  assistedSessionRate: number | null
  mostRecentActivityDate: string | null
  currentDifficulty: number
  lastMasteredDifficulty: number
  distinctIndependentEvidenceCount: number
  currentLearningState: LearningState
  nextReviewDate: string | null
  activeRemediationTarget: string | null
  parentStatusExplanation: string
  dataAvailability: DashboardDataAvailability
}

export interface DashboardRecentAttemptSummary {
  completionDate: string
  lessonId: string
  lessonTitle: string
  activityId: string
  skillId: string
  difficulty: number
  accuracy: number
  firstAttemptAccuracy: number
  assistanceUsed: number
  supportedTargetCount: number
  maximumAssistanceLevel: number
  progressionDecision: LearningState
  parentFriendlyExplanation: string
  nextReviewDate: string | null
  classificationStatus: ClassificationStatus
}

export interface DashboardWordHelpSummary {
  targetId: string
  displayWord: string
  sessionsWhereHelpUsed: number
  totalUniqueAssistanceActions: number
  maximumAssistanceLevel: number
  mostRecentUseDate: string | null
}

export interface DashboardReviewEntry {
  skillId: string
  unitId: string | null
  unitLabel: string | null
  contentVersion: string | null
  difficulty: number
  reviewStep: number
  dueAt: string
  status: 'overdue' | 'due_now' | 'upcoming'
}

export interface DashboardReviewSummary {
  dueReviews: number
  upcomingReviews: number
  overdueReviews: number
  nextReviewDate: string | null
  entries: DashboardReviewEntry[]
  dataQualityNote: string | null
}

export interface DashboardAttentionItem {
  kind: ParentAttentionKind
  severity: ParentAttentionSeverity
  title: string
  explanation: string
  relatedSkillId: string | null
  relatedTargetId: string | null
  evidenceSummary: string
}

export interface DashboardDataQuality {
  classifiedQuestionCount: number
  unclassifiedQuestionCount: number
  missingContentReferenceCount: number
}

export interface DashboardSnapshot {
  generatedAt: string
  overview: DashboardOverview
  fluencyPracticeSummary: DashboardFluencyPracticeSummary
  categorySummaries: DashboardCategorySummary[]
  benchmarkSummaries: DashboardBenchmarkSummary[]
  skillSummaries: DashboardSkillSummary[]
  recentAttempts: DashboardRecentAttemptSummary[]
  wordHelpSummaries: DashboardWordHelpSummary[]
  reviewSummary: DashboardReviewSummary
  attentionItems: DashboardAttentionItem[]
  nextQuestExplanation: string
  dataQuality: DashboardDataQuality
}

export interface DashboardBuildInput {
  progress: QuestProgressV1
  now: string
  content?: ContentSample
}

export interface AttemptAggregate {
  lessonId: string
  activityId: string
  skillId: string
  difficulty: number
  completedAt: string
  accuracy: number
  firstAttemptAccuracy: number
  assistanceSummary: AssistanceSummary
  questionCount: number
}

export interface QuestionContext {
  questionId: string
  lessonTitle: string
  benchmarkReference: string | null
  reportingCategory: string | null
  rawReportingCategory: string | null
  gradeBand: number | null
  skillId: string
  difficulty: number
  passageId: string
  lessonId: string
}
