import type { LessonActivityCandidate } from './skillProgressTypes'
import type { CompletedLessonAttempt, ReviewQueueEntry, QuestProgressV1 } from '../../persistence'
import { getLessonCatalogMetadata } from '../lesson'

export interface ReviewQueueIdentity {
  skillId: string
  difficulty: number
  unitId: string | null
  contentVersion: string | null
}

export interface ReviewAffinityResolution {
  unitId: string | null
  contentVersion: string | null
  status: 'exact' | 'inferred' | 'single_unit' | 'ambiguous' | 'missing'
  note: string | null
}

export interface ResolvedReviewQueueIdentity extends ReviewQueueIdentity {
  unitId: string
  contentVersion: string
  reviewStep: number
  dueAt: string
}

export function buildReviewQueueIdentity(entry: Pick<ReviewQueueEntry, 'skillId' | 'difficulty'> & {
  unitId?: string | null
  contentVersion?: string | null
}): ReviewQueueIdentity {
  return {
    skillId: entry.skillId,
    difficulty: entry.difficulty,
    unitId: entry.unitId ?? null,
    contentVersion: entry.contentVersion ?? null,
  }
}

export function reviewQueueIdentityKey(identity: ReviewQueueIdentity): string {
  return [
    identity.skillId,
    identity.difficulty,
    identity.unitId ?? '',
    identity.contentVersion ?? '',
  ].join('::')
}

export function sameReviewQueueIdentity(
  left: ReviewQueueIdentity,
  right: ReviewQueueIdentity,
): boolean {
  return reviewQueueIdentityKey(left) === reviewQueueIdentityKey(right)
}

export function resolveReviewAffinity(
  entry: ReviewQueueEntry,
  input: {
    completedAttempts: readonly CompletedLessonAttempt[]
    availableLessons: readonly LessonActivityCandidate[]
  },
): ReviewAffinityResolution {
  if (entry.unitId && entry.contentVersion) {
    return {
      unitId: entry.unitId,
      contentVersion: entry.contentVersion,
      status: 'exact',
      note: null,
    }
  }

  const inferredFromAttempt = inferFromCompletedAttempt(entry, input.completedAttempts)
  if (inferredFromAttempt) {
    return {
      unitId: inferredFromAttempt.unitId,
      contentVersion: inferredFromAttempt.contentVersion,
      status: 'inferred',
      note: 'This review was matched from a completed lesson, so its unit details stay intact.',
    }
  }

  const unitCandidates = input.availableLessons.filter((lesson) => (
    lesson.skillId === entry.skillId
    && lesson.difficulty === entry.difficulty
    && lesson.eligiblePurposes.includes('review')
  ))
  const uniqueUnitIds = new Set(unitCandidates.map((lesson) => lesson.unitId))
  const uniqueContentVersions = new Set(unitCandidates.map((lesson) => lesson.contentVersion))

  if (uniqueUnitIds.size === 1 && uniqueContentVersions.size === 1) {
    const onlyLesson = unitCandidates[0] ?? null
    if (onlyLesson) {
      return {
        unitId: onlyLesson.unitId,
        contentVersion: onlyLesson.contentVersion,
        status: 'single_unit',
        note: 'This review matches the only current unit with eligible content.',
      }
    }
  }

  if (unitCandidates.length > 0) {
    return {
      unitId: null,
      contentVersion: null,
      status: 'ambiguous',
      note: 'An older review entry is missing unit details, so the app skips it for planning instead of guessing.',
    }
  }

  return {
    unitId: null,
    contentVersion: null,
    status: 'missing',
    note: 'A review entry has no matching active content right now.',
  }
}

export function buildReviewAffinityDataQualityNote(
  progress: QuestProgressV1,
  availableLessons: readonly LessonActivityCandidate[],
): string | null {
  for (const entry of progress.reviewQueue) {
    if (entry.unitId && entry.contentVersion) continue
    const resolution = resolveReviewAffinity(entry, {
      completedAttempts: progress.completedAttempts,
      availableLessons,
    })
    if (resolution.status === 'ambiguous' || resolution.status === 'missing') {
      return resolution.note
    }
  }
  return null
}

export function findReviewQueueEntryByResolvedIdentity(
  identity: ResolvedReviewQueueIdentity,
  input: {
    reviewQueue: readonly ReviewQueueEntry[]
    completedAttempts: readonly CompletedLessonAttempt[]
    availableLessons: readonly LessonActivityCandidate[]
  },
): ReviewQueueEntry | null {
  const matches = input.reviewQueue.filter((entry) => {
    if (
      entry.skillId !== identity.skillId
      || entry.difficulty !== identity.difficulty
      || entry.reviewStep !== identity.reviewStep
      || entry.dueAt !== identity.dueAt
    ) return false
    const affinity = resolveReviewAffinity(entry, input)
    return affinity.status !== 'ambiguous'
      && affinity.status !== 'missing'
      && affinity.unitId === identity.unitId
      && affinity.contentVersion === identity.contentVersion
  })
  return matches.length === 1 ? { ...matches[0] } : null
}

function inferFromCompletedAttempt(
  entry: ReviewQueueEntry,
  completedAttempts: readonly CompletedLessonAttempt[],
): { unitId: string; contentVersion: string } | null {
  const matchingAttempts = completedAttempts.filter((attempt) => (
    attempt.skillId === entry.skillId
    && attempt.nextReviewDate === entry.dueAt
  ))

  const inferred = matchingAttempts
    .map((attempt) => {
      const metadata = getLessonCatalogMetadata(attempt.lessonId)
      if (!metadata) return null
      return {
        unitId: metadata.unitId,
        contentVersion: metadata.contentVersion,
      }
    })
    .filter((candidate): candidate is { unitId: string; contentVersion: string } => Boolean(candidate))

  if (inferred.length === 0) return null

  const unique = new Map(inferred.map((candidate) => [`${candidate.unitId}::${candidate.contentVersion}`, candidate] as const))
  if (unique.size !== 1) return null

  return unique.values().next().value ?? null
}
