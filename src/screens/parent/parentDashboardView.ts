import type { DashboardDataAvailability, DashboardRecentAttemptSummary, DashboardSnapshot } from '../../domain/dashboard'
import type { QuestProgressV1 } from '../../persistence'

export type ParentDashboardView = 'overview' | 'progress' | 'sessions' | 'reviews' | 'word-help' | 'assessments'

export const parentDashboardViews: readonly ParentDashboardView[] = [
  'overview',
  'progress',
  'sessions',
  'reviews',
  'word-help',
  'assessments',
] as const

const FRIENDLY_SKILL_NAMES: Record<string, string> = {
  'g2-word-forge-word-practice': 'Word Forge',
}

export function formatPercent(value: number | null): string {
  return value === null ? 'No practice data yet' : `${value}%`
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
      return 'Blended the parts'
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
  return FRIENDLY_SKILL_NAMES[skillId] ?? 'Archived skill'
}

export function resolveCurrentTrailLabel(progress: QuestProgressV1, dashboard: DashboardSnapshot): string {
  const plannedNextQuest = progress.plannedNextQuest
  const selectedSkillId = plannedNextQuest && 'skillId' in plannedNextQuest
    ? plannedNextQuest.skillId
    : dashboard.skillSummaries[0]?.skillId ?? null
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
