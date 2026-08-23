import { getTrackBySkillId } from '../../domain/curriculum'
import type { DashboardDataAvailability, DashboardRecentAttemptSummary, DashboardSnapshot } from '../../domain/dashboard'
import type { QuestProgressV1 } from '../../persistence'

export type ParentDashboardView = 'overview' | 'progress' | 'sessions' | 'reviews' | 'word-help' | 'assessments' | 'print-summary'

export const parentDashboardViews: readonly ParentDashboardView[] = [
  'overview',
  'progress',
  'sessions',
  'reviews',
  'word-help',
  'assessments',
] as const

export const FOUNDATIONAL_SKILLS_BRIDGE_NOTE =
  'Foundational Skills Bridge is an internal practice category, not an official FAST reporting category.'

export const FLUENCY_PRACTICE_NOTE =
  'Fluency Flight supports practice only. The app does not record or score oral reading.'

export function formatPercent(value: number | null): string {
  return value === null ? 'No practice data yet' : `${formatPercentValue(value, 1)}%`
}

export function formatAccuracyPercent(value: number | null): string {
  return value === null ? 'No practice data yet' : `${formatPercentValue(value, 1)}%`
}

export function formatAccuracyPercentCompact(value: number | null): string {
  return value === null ? 'No practice data yet' : `${formatPercentValue(value, 0)}%`
}

export function formatParentDate(value: string | null): string {
  if (!value) return 'Not scheduled'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not scheduled'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatTrailLabel(difficulty: number | null): string {
  if (difficulty === null) return 'No trail available'
  return difficulty <= 0 ? 'Building Block Trail' : `Trail ${difficulty}`
}

export function formatAssistanceLevel(level: number): string {
  switch (level) {
    case 1:
      return 'Pattern clue'
    case 2:
      return 'Word chunks'
    case 3:
      return 'Heard the parts'
    case 4:
      return 'Blended word'
    case 5:
      return 'Heard the word'
    case 6:
      return 'Heard the sentence'
    default:
      return 'Unknown support level'
  }
}

export function formatDataAvailability(availability: DashboardDataAvailability): string {
  switch (availability) {
    case 'no_data':
      return 'No practice data yet'
    case 'partial':
      return 'Some details are missing'
    default:
      return 'Ready'
  }
}

export function resolveFriendlySkillName(skillId: string): string {
  return getTrackBySkillId(skillId)?.displayName ?? 'Archived skill'
}

export function formatBenchmarkReferences(references: readonly string[]): string {
  if (references.length === 0) return 'Archived benchmark'
  return [...new Set(references)].sort((left, right) => left.localeCompare(right)).join(' · ')
}

export function resolveCurrentTrailLabel(progress: QuestProgressV1, dashboard: DashboardSnapshot): string {
  const plannedNextQuest = progress.plannedNextQuest
  const selectedSkillId = progress.activeLessonSession?.skillId
    ?? (plannedNextQuest?.status === 'available' ? plannedNextQuest.lesson.skillId : null)
    ?? (plannedNextQuest?.status === 'content_needed' ? plannedNextQuest.skillId : null)
    ?? dashboard.recentAttempts[0]?.skillId
    ?? dashboard.skillSummaries
      .slice()
      .sort((left, right) => compareSkillSummariesByCurriculum(left.skillId, right.skillId))[0]?.skillId
    ?? null
  if (!selectedSkillId) return 'No trail available'
  const summary = dashboard.skillSummaries.find((entry) => entry.skillId === selectedSkillId)
  return formatTrailLabel(summary?.currentDifficulty ?? null)
}

export function describePlannedRoute(progress: QuestProgressV1): string {
  if (progress.plannedNextQuest?.status === 'content_needed') {
    return 'Fresh content is being prepared.'
  }
  switch (progress.plannedNextQuest?.purpose) {
    case 'verification':
      return 'Fresh verification'
    case 'remediation':
      return 'Guided practice or remediation'
    case 'review':
      return 'Review'
    case 'progression':
      return 'Normal progression'
    default:
      return 'Normal progression'
  }
}

export function summarizeRecentAttempts(attempts: readonly DashboardRecentAttemptSummary[]): string {
  if (attempts.length === 0) return 'No completed reading quests yet.'
  return `${attempts.length} recent session${attempts.length === 1 ? '' : 's'}`
}

function compareSkillSummariesByCurriculum(leftSkillId: string, rightSkillId: string): number {
  const leftTrack = getTrackBySkillId(leftSkillId)
  const rightTrack = getTrackBySkillId(rightSkillId)
  return (leftTrack?.curriculumOrder ?? Number.MAX_SAFE_INTEGER)
    - (rightTrack?.curriculumOrder ?? Number.MAX_SAFE_INTEGER)
    || leftSkillId.localeCompare(rightSkillId)
}

function formatPercentValue(value: number, maximumFractionDigits: 0 | 1): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value)
}
