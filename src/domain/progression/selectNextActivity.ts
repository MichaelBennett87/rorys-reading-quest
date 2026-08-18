import type {
  DomainActivityCandidate,
  LearningActivitySequenceInput,
  LearningActivitySelectionResult,
} from './types'

function makePassageQuestionKey(activity: DomainActivityCandidate): string {
  return `${activity.passageIdentifier}::${activity.questionIdentifier}`
}

export function selectNextActivity(
  input: LearningActivitySequenceInput,
): LearningActivitySelectionResult {
  const candidates = input.availableActivities
    .filter((activity) => activity.skillIdentifier === input.skillIdentifier)
    .filter((activity) => activity.difficulty === input.difficulty)
    .sort((a, b) => a.activityIdentifier.localeCompare(b.activityIdentifier))

  if (candidates.length === 0) {
    return {
      status: 'unavailable',
      reason: `No activities exist for skill ${input.skillIdentifier} at difficulty ${input.difficulty}.`,
      availableCount: 0,
    }
  }

  const usedActivityIds = new Set(input.recentActivityUsage.map((entry) => entry.activityIdentifier))
  const recentPassageQuestion = input.recentActivityUsage.map(
    (entry) => makePassageQuestionKey(entry),
  )

  const lastAttemptKey = recentPassageQuestion.at(-1) ?? null

  const freshCandidates = candidates.filter((activity) => {
    if (usedActivityIds.has(activity.activityIdentifier)) {
      return false
    }

    const key = makePassageQuestionKey(activity)
    return key !== lastAttemptKey
  })

  if (freshCandidates.length === 0) {
    return {
      status: 'unavailable',
      reason:
        'No fresh eligible variant is available without repeating recently used activity or the same passage-question pair.',
      availableCount: candidates.length,
      nextDeterministicFallbackActivityIdentifier:
        candidates[0]?.activityIdentifier ?? null,
    }
  }

  return {
    status: 'selected',
    activity: freshCandidates[0],
    reason: 'Selected newest deterministic eligible activity variant.',
  }
}
