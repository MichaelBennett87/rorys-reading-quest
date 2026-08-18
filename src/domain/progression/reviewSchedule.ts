export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const

export interface ReviewProgressionResult {
  nextStep: number
  nextIntervalDays: number
}

export function getReviewIntervalForStep(step: number): number {
  const safeStep = Number.isFinite(step) ? Math.max(0, Math.floor(step)) : 0
  const lastIndex = REVIEW_INTERVAL_DAYS.length - 1
  return REVIEW_INTERVAL_DAYS[Math.min(safeStep, lastIndex)]
}

export function nextReviewInterval(step: number, passedReview: boolean): ReviewProgressionResult {
  const safeStep = Number.isFinite(step) ? Math.max(0, Math.floor(step)) : 0
  const maxIndex = REVIEW_INTERVAL_DAYS.length - 1

  const nextStep = passedReview
    ? Math.min(maxIndex, safeStep + 1)
    : Math.max(0, safeStep - 1)

  return {
    nextStep,
    nextIntervalDays: REVIEW_INTERVAL_DAYS[nextStep] ?? REVIEW_INTERVAL_DAYS[maxIndex],
  }
}
