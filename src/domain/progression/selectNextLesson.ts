import type {
  LessonActivityCandidate,
  NextQuestPlan,
  RecentLessonActivityUsage,
} from './skillProgressTypes'
import type { LessonPurpose } from '../lesson'

export interface SelectNextLessonInput {
  skillId: string
  difficulty: number
  purpose: LessonPurpose
  availableLessons: readonly LessonActivityCandidate[]
  recentActivityUsage: readonly RecentLessonActivityUsage[]
  preferredUnitId?: string | null
  preferredContentVersion?: string | null
}

export type LessonSelectionMode =
  | 'fresh'
  | 'fresh_with_overlap'
  | 'recycled'
  | 'sole_candidate_repeat'

export type LessonSelectionReasonCode =
  | 'fresh_activity_and_passage'
  | 'fresh_activity_with_passage_overlap'
  | 'least_recently_used_activity'
  | 'only_compatible_activity'

export interface LessonSelectionMetadata {
  selectionMode: LessonSelectionMode
  priorUseCount: number
  lastUsedAt: string | null
  overlapCount: number
  reasonCode: LessonSelectionReasonCode
}

export interface SelectNextLessonDiagnosticResult {
  plan: NextQuestPlan
  compatibleCandidateCount: number
  selection: LessonSelectionMetadata | null
}

interface RankedLessonCandidate {
  lesson: LessonActivityCandidate
  tier: number
  priorUseCount: number
  lastUsedAt: string | null
  lastUsedTimestamp: number
  overlapCount: number
  immediateRepeat: boolean
}

export function selectNextLesson(input: SelectNextLessonInput): NextQuestPlan {
  return selectNextLessonWithDiagnostics(input).plan
}

export function selectNextLessonWithDiagnostics(
  input: SelectNextLessonInput,
): SelectNextLessonDiagnosticResult {
  const purposeCandidates = input.availableLessons
    .filter((lesson) => lesson.skillId === input.skillId)
    .filter((lesson) => lesson.difficulty === input.difficulty)
    .filter((lesson) => lesson.eligiblePurposes.includes(input.purpose))

  const candidates = purposeCandidates
    .filter((lesson) => input.preferredUnitId ? lesson.unitId === input.preferredUnitId : true)
    .filter((lesson) => input.preferredContentVersion ? lesson.contentVersion === input.preferredContentVersion : true)

  if (candidates.length === 0) {
    const affinityRequired = Boolean(input.preferredUnitId || input.preferredContentVersion)
    return {
      plan: {
        status: 'content_needed',
        purpose: input.purpose,
        skillId: input.skillId,
        difficulty: input.difficulty,
        reason: purposeCandidates.length > 0 && affinityRequired
          ? 'Authored lessons exist, but none match the required unit and content-version affinity.'
          : 'No authored compatible lesson exists for this skill, difficulty, and purpose.',
      },
      compatibleCandidateCount: 0,
      selection: null,
    }
  }

  const compatibleVersions = new Set(candidates.map((candidate) => candidate.contentVersion))
  const relevantUsage = input.recentActivityUsage.filter((usage) => (
    usage.skillId === input.skillId
    && usage.difficulty === input.difficulty
    && compatibleVersions.has(usage.contentVersion)
  ))
  const lastUsage = relevantUsage.at(-1) ?? null
  const lastPassageQuestionKeys = new Set(lastUsage?.passageQuestionKeys ?? [])
  const ranked = candidates
    .map((candidate): RankedLessonCandidate => {
      const matchingUsage = relevantUsage.filter((usage) => (
        usage.activityId === candidate.activityId
        && usage.contentVersion === candidate.contentVersion
      ))
      const lastCandidateUsage = matchingUsage.at(-1) ?? null
      const overlapCount = new Set(
        candidate.passageQuestionKeys.filter((key) => lastPassageQuestionKeys.has(key)),
      ).size
      const immediateRepeat = lastUsage?.activityId === candidate.activityId
        && lastUsage.contentVersion === candidate.contentVersion
      const tier = matchingUsage.length === 0
        ? overlapCount === 0 ? 0 : 1
        : immediateRepeat ? 3 : 2
      return {
        lesson: candidate,
        tier,
        priorUseCount: matchingUsage.length,
        lastUsedAt: lastCandidateUsage?.completedAt ?? null,
        lastUsedTimestamp: parseLastUsedTimestamp(lastCandidateUsage?.completedAt ?? null),
        overlapCount,
        immediateRepeat,
      }
    })
    .sort(compareRankedCandidates)

  const selected = ranked[0]
  const selectionMode: LessonSelectionMode = selected.priorUseCount === 0
    ? selected.overlapCount === 0 ? 'fresh' : 'fresh_with_overlap'
    : candidates.length === 1 && selected.immediateRepeat
      ? 'sole_candidate_repeat'
      : 'recycled'
  const reasonCode: LessonSelectionReasonCode = selectionMode === 'fresh'
    ? 'fresh_activity_and_passage'
    : selectionMode === 'fresh_with_overlap'
      ? 'fresh_activity_with_passage_overlap'
      : selectionMode === 'sole_candidate_repeat'
        ? 'only_compatible_activity'
        : 'least_recently_used_activity'

  return {
    plan: { status: 'available', purpose: input.purpose, lesson: selected.lesson },
    compatibleCandidateCount: candidates.length,
    selection: {
      selectionMode,
      priorUseCount: selected.priorUseCount,
      lastUsedAt: selected.lastUsedAt,
      overlapCount: selected.overlapCount,
      reasonCode,
    },
  }
}

function compareRankedCandidates(left: RankedLessonCandidate, right: RankedLessonCandidate): number {
  return left.tier - right.tier
    || left.priorUseCount - right.priorUseCount
    || left.lastUsedTimestamp - right.lastUsedTimestamp
    || left.overlapCount - right.overlapCount
    || left.lesson.activityId.localeCompare(right.lesson.activityId)
    || left.lesson.lessonId.localeCompare(right.lesson.lessonId)
}

function parseLastUsedTimestamp(value: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}
