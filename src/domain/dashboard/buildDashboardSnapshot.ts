import { lessonCatalog } from '../lesson'
import { sampleContent, type ContentSample, type ReadingQuestion } from '../content'
import type { QuestProgressV1 } from '../../persistence'
import type {
  DashboardAttentionItem,
  DashboardBenchmarkSummary,
  DashboardBuildInput,
  DashboardCategorySummary,
  DashboardFluencyPracticeSummary,
  DashboardDataAvailability,
  DashboardDataQuality,
  DashboardOverview,
  DashboardRecentAttemptSummary,
  DashboardReviewEntry,
  DashboardReviewSummary,
  DashboardSnapshot,
  DashboardSkillSummary,
  DashboardWordHelpSummary,
} from './dashboardTypes'
import { explainProgressionDecision } from './explainProgressionDecision'

const FIXED_CATEGORY_ORDER = [
  'Foundational Skills Bridge',
  'Reading Prose and Poetry',
  'Reading Informational Text',
  'Reading Across Genres and Vocabulary',
] as const

const CATEGORY_MAP: Record<string, string> = {
  'Word Forge': 'Foundational Skills Bridge',
  'Foundational Skills Bridge': 'Foundational Skills Bridge',
  'Reading Prose and Poetry': 'Reading Prose and Poetry',
  'Reading Informational Text': 'Reading Informational Text',
  'Reading Across Genres and Vocabulary': 'Reading Across Genres and Vocabulary',
}

const RECENT_WINDOW = 10
const PAST_7_DAYS_MS = 7 * 24 * 60 * 60 * 1000

interface CategoryBucket {
  rawCategories: Set<string>
  totalQuestionAttempts: number
  correctResponses: number
  firstAttemptCorrectResponses: number
  assistedSessionCount: number
  mostRecentActivityDate: string | null
}

interface BenchmarkBucket {
  benchmarkReference: string
  skillIdentifier: string
  reportingCategory: string
  gradeBand: number | null
  questionAttempts: number
  completedAttempts: number
  correctResponses: number
  firstAttemptCorrectResponses: number
  assistedSessionCount: number
  mostRecentActivityDate: string | null
}

export function buildDashboardSnapshot(input: DashboardBuildInput): DashboardSnapshot {
  const content = input.content ?? sampleContent
  const questionIndex = indexQuestions(content)
  const supportTargets = indexSupportTargets(content)
  const progress = input.progress
  const recentAttempts = buildRecentAttemptSummaries({ progress, questionIndex })
  const reviewSummary = buildReviewSummary(progress, input.now)
  const wordHelpSummaries = buildWordHelpSummaries({ progress, supportTargets })
  const categorySummaries = buildCategorySummaries({ progress, questionIndex })
  const benchmarkSummaries = buildBenchmarkSummaries({ progress, questionIndex })
  const skillSummaries = buildSkillSummaries({ progress, questionIndex })
  const attentionItems = buildAttentionItems({
    progress,
    now: input.now,
    reviewSummary,
    wordHelpSummaries,
  })

  return {
    generatedAt: input.now,
    overview: buildOverview(progress, reviewSummary),
    fluencyPracticeSummary: buildFluencyPracticeSummary(progress),
    categorySummaries,
    benchmarkSummaries,
    skillSummaries,
    recentAttempts,
    wordHelpSummaries,
    reviewSummary,
    attentionItems,
    nextQuestExplanation: explainProgressionDecision({
      decisionState: progress.lastProgressionOutcome?.decisionState
        ?? (progress.plannedNextQuest?.status === 'content_needed' ? 'CONTENT_NEEDED' : null),
      nextQuest: progress.plannedNextQuest,
      assistanceSummary: progress.completedAttempts.at(-1)?.assistanceSummary ?? null,
    }),
    dataQuality: buildDataQuality(progress, questionIndex),
  }
}

export function buildCategorySummaries(input: {
  progress: QuestProgressV1
  questionIndex?: Map<string, ReadingQuestion>
}): DashboardCategorySummary[] {
  const questionIndex = input.questionIndex ?? indexQuestions(sampleContent)
  const buckets = new Map<string, CategoryBucket>()
  for (const category of FIXED_CATEGORY_ORDER) {
    buckets.set(category, emptyCategoryBucket())
  }

  for (const attempt of input.progress.completedAttempts) {
    const seenCategories = new Set<string>()
    for (const result of attempt.questionResults) {
      const question = questionIndex.get(result.questionId)
      if (!question) continue
      const category = normalizeCategory(question.reportingCategory)
      const bucket = buckets.get(category) ?? emptyCategoryBucket()
      bucket.rawCategories.add(question.reportingCategory)
      bucket.totalQuestionAttempts += 1
      bucket.correctResponses += result.isCorrect ? 1 : 0
      bucket.firstAttemptCorrectResponses += result.isFirstAttemptCorrect ? 1 : 0
      bucket.mostRecentActivityDate = latestDate(bucket.mostRecentActivityDate, attempt.completedAt)
      if (attempt.assistanceSummary.totalUniqueEvents > 0 && !seenCategories.has(category)) {
        bucket.assistedSessionCount += 1
        seenCategories.add(category)
      }
      buckets.set(category, bucket)
    }
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, bucket]) => ({
      reportingCategory: category,
      rawCategories: [...bucket.rawCategories].sort(),
      totalQuestionAttempts: bucket.totalQuestionAttempts,
      correctResponses: bucket.correctResponses,
      firstAttemptCorrectResponses: bucket.firstAttemptCorrectResponses,
      overallAccuracy: bucket.totalQuestionAttempts === 0 ? null : roundPercent(ratio(bucket.correctResponses, bucket.totalQuestionAttempts)),
      firstAttemptAccuracy: bucket.totalQuestionAttempts === 0 ? null : roundPercent(ratio(bucket.firstAttemptCorrectResponses, bucket.totalQuestionAttempts)),
      assistedSessionCount: bucket.assistedSessionCount,
      assistedSessionRate: bucket.totalQuestionAttempts === 0 ? null : roundPercent(ratio(bucket.assistedSessionCount, bucket.totalQuestionAttempts)),
      mostRecentActivityDate: bucket.mostRecentActivityDate,
      dataAvailability: bucket.totalQuestionAttempts === 0 ? 'no_data' : 'ready',
      unclassifiedQuestionCount: 0,
    }))
}

export function buildBenchmarkSummaries(input: {
  progress: QuestProgressV1
  questionIndex?: Map<string, ReadingQuestion>
}): DashboardBenchmarkSummary[] {
  const questionIndex = input.questionIndex ?? indexQuestions(sampleContent)
  const buckets = new Map<string, BenchmarkBucket>()

  for (const attempt of input.progress.completedAttempts) {
    const seenBuckets = new Set<string>()
    for (const result of attempt.questionResults) {
      const question = questionIndex.get(result.questionId)
      if (!question) continue
      const key = `${question.benchmarkReference}::${question.skillIdentifier}::${normalizeCategory(question.reportingCategory)}`
      const bucket = buckets.get(key) ?? {
        benchmarkReference: question.benchmarkReference,
        skillIdentifier: question.skillIdentifier,
        reportingCategory: normalizeCategory(question.reportingCategory),
        gradeBand: question.gradeBand,
        questionAttempts: 0,
        completedAttempts: 0,
        correctResponses: 0,
        firstAttemptCorrectResponses: 0,
        assistedSessionCount: 0,
        mostRecentActivityDate: null,
      }
      bucket.questionAttempts += 1
      bucket.correctResponses += result.isCorrect ? 1 : 0
      bucket.firstAttemptCorrectResponses += result.isFirstAttemptCorrect ? 1 : 0
      bucket.mostRecentActivityDate = latestDate(bucket.mostRecentActivityDate, attempt.completedAt)
      if (!seenBuckets.has(key)) {
        bucket.completedAttempts += 1
        if (attempt.assistanceSummary.totalUniqueEvents > 0) bucket.assistedSessionCount += 1
        seenBuckets.add(key)
      }
      buckets.set(key, bucket)
    }
  }

  return [...buckets.values()]
    .sort((left, right) => (
      left.benchmarkReference.localeCompare(right.benchmarkReference)
      || left.skillIdentifier.localeCompare(right.skillIdentifier)
      || left.reportingCategory.localeCompare(right.reportingCategory)
    ))
    .map((bucket) => {
      const skillProgress = input.progress.skillProgress[bucket.skillIdentifier]
      return {
        benchmarkReference: bucket.benchmarkReference,
        benchmarkReferences: findBenchmarkReferencesForSkill(questionIndex, bucket.skillIdentifier),
        skillIdentifier: bucket.skillIdentifier,
        reportingCategory: bucket.reportingCategory,
        gradeBand: bucket.gradeBand,
        questionAttempts: bucket.questionAttempts,
        accuracy: bucket.questionAttempts === 0 ? null : roundPercent(ratio(bucket.correctResponses, bucket.questionAttempts)),
        firstAttemptAccuracy: bucket.questionAttempts === 0 ? null : roundPercent(ratio(bucket.firstAttemptCorrectResponses, bucket.questionAttempts)),
        assistedSessionRate: bucket.completedAttempts === 0 ? null : roundPercent(ratio(bucket.assistedSessionCount, bucket.completedAttempts)),
        mostRecentActivityDate: bucket.mostRecentActivityDate,
        currentDifficulty: skillProgress?.currentDifficulty ?? null,
        lastMasteredDifficulty: skillProgress?.lastMasteredDifficulty ?? null,
        distinctIndependentEvidenceCount: skillProgress?.qualifyingIndependentActivityIds.length ?? 0,
        currentLearningState: skillProgress?.currentLearningState ?? null,
        nextReviewDate: skillProgress?.nextReviewDate ?? null,
        activeRemediationTarget: skillProgress?.remediationContext
          ? `${skillProgress.remediationContext.remediationSkillId}::${skillProgress.remediationContext.remediationDifficulty}`
          : null,
        parentStatusExplanation: explainProgressionDecision({
          decisionState: skillProgress?.currentLearningState ?? null,
          nextQuest: input.progress.plannedNextQuest,
          assistanceSummary: input.progress.completedAttempts.at(-1)?.assistanceSummary ?? null,
        }),
        dataAvailability: bucket.questionAttempts === 0 ? 'no_data' : 'ready',
      }
    })
}

export function buildSkillSummaries(input: {
  progress: QuestProgressV1
  questionIndex?: Map<string, ReadingQuestion>
}): DashboardSkillSummary[] {
  const questionIndex = input.questionIndex ?? indexQuestions(sampleContent)
  return Object.values(input.progress.skillProgress)
    .map((skillProgress) => {
      const attempts = input.progress.completedAttempts.filter((attempt) => attempt.skillId === skillProgress.skillId)
      const questionAttempts = attempts.reduce((sum, attempt) => sum + attempt.questionResults.length, 0)
      const correctResponses = attempts.reduce((sum, attempt) => sum + attempt.questionResults.filter((result) => result.isCorrect).length, 0)
      const firstAttemptCorrectResponses = attempts.reduce((sum, attempt) => sum + attempt.questionResults.filter((result) => result.isFirstAttemptCorrect).length, 0)
      const assistedSessions = attempts.filter((attempt) => attempt.assistanceSummary.totalUniqueEvents > 0).length
      const benchmarkReferences = findBenchmarkReferencesForSkill(questionIndex, skillProgress.skillId)
      const firstQuestion = findFirstQuestionForSkill(questionIndex, skillProgress.skillId)
      return {
        skillId: skillProgress.skillId,
        benchmarkReference: firstQuestion?.benchmarkReference ?? null,
        benchmarkReferences,
        reportingCategory: firstQuestion ? normalizeCategory(firstQuestion.reportingCategory) : 'Unclassified',
        gradeBand: firstQuestion?.gradeBand ?? null,
        questionAttempts,
        accuracy: questionAttempts === 0 ? null : roundPercent(ratio(correctResponses, questionAttempts)),
        firstAttemptAccuracy: questionAttempts === 0 ? null : roundPercent(ratio(firstAttemptCorrectResponses, questionAttempts)),
        assistedSessionRate: attempts.length === 0 ? null : roundPercent(ratio(assistedSessions, attempts.length)),
        mostRecentActivityDate: latestAttemptDate(attempts),
        currentDifficulty: skillProgress.currentDifficulty,
        lastMasteredDifficulty: skillProgress.lastMasteredDifficulty,
        distinctIndependentEvidenceCount: skillProgress.qualifyingIndependentActivityIds.length,
        currentLearningState: skillProgress.currentLearningState,
        nextReviewDate: skillProgress.nextReviewDate,
        activeRemediationTarget: skillProgress.remediationContext
          ? `${skillProgress.remediationContext.remediationSkillId}::${skillProgress.remediationContext.remediationDifficulty}`
          : null,
        parentStatusExplanation: explainProgressionDecision({
          decisionState: skillProgress.currentLearningState,
          nextQuest: input.progress.plannedNextQuest,
          assistanceSummary: attempts.at(-1)?.assistanceSummary ?? null,
        }),
        dataAvailability: (questionAttempts === 0 ? 'no_data' : 'ready') as DashboardDataAvailability,
      }
    })
    .sort((left, right) => left.skillId.localeCompare(right.skillId))
}

export function buildRecentAttemptSummaries(input: {
  progress: QuestProgressV1
  questionIndex?: Map<string, ReadingQuestion>
}): DashboardRecentAttemptSummary[] {
  const questionIndex = input.questionIndex ?? indexQuestions(sampleContent)
  return sortDescending(input.progress.completedAttempts)
    .slice(0, RECENT_WINDOW)
    .map((attempt) => ({
      completionDate: attempt.completedAt,
      lessonId: attempt.lessonId,
      lessonTitle: lessonCatalog.find((lesson) => lesson.lessonId === attempt.lessonId)?.lessonTitle ?? 'Archived activity',
      activityId: attempt.activityId,
      skillId: attempt.skillId,
      difficulty: attempt.difficulty,
      accuracy: roundPercent(attempt.accuracy),
      firstAttemptAccuracy: roundPercent(firstAttemptRatio(attempt)),
      assistanceUsed: attempt.assistanceSummary.totalUniqueEvents,
      supportedTargetCount: attempt.assistanceSummary.targetsHelped,
      maximumAssistanceLevel: attempt.assistanceSummary.maximumAssistanceLevel,
      progressionDecision: attempt.progressionDecisionState,
      parentFriendlyExplanation: explainProgressionDecision({
        decisionState: attempt.progressionDecisionState,
        nextQuest: input.progress.plannedNextQuest,
        assistanceSummary: attempt.assistanceSummary,
      }),
      nextReviewDate: attempt.nextReviewDate,
      classificationStatus: attempt.questionResults.every((result) => questionIndex.has(result.questionId)) ? 'classified' : 'unclassified',
    }))
}

export function buildWordHelpSummaries(input: {
  progress: QuestProgressV1
  supportTargets?: Map<string, { surfaceWord: string }>
}): DashboardWordHelpSummary[] {
  const supportTargets = input.supportTargets ?? indexSupportTargets(sampleContent)
  const grouped = new Map<string, {
    targetId: string
    displayWord: string
    sessions: Set<string>
    totalUniqueAssistanceActions: number
    maximumAssistanceLevel: number
    mostRecentUseDate: string | null
  }>()

  for (const attempt of input.progress.completedAttempts) {
    const seenTargets = new Set<string>()
    for (const event of attempt.assistanceEvents) {
      const bucket = grouped.get(event.targetId) ?? {
        targetId: event.targetId,
        displayWord: supportTargets.get(event.targetId)?.surfaceWord ?? 'Archived word target',
        sessions: new Set<string>(),
        totalUniqueAssistanceActions: 0,
        maximumAssistanceLevel: 0,
        mostRecentUseDate: null,
      }
      bucket.totalUniqueAssistanceActions += 1
      bucket.maximumAssistanceLevel = Math.max(bucket.maximumAssistanceLevel, event.assistanceLevel)
      bucket.mostRecentUseDate = latestDate(bucket.mostRecentUseDate, event.occurredAt)
      if (!seenTargets.has(event.targetId)) {
        bucket.sessions.add(attempt.completionId)
        seenTargets.add(event.targetId)
      }
      grouped.set(event.targetId, bucket)
    }
  }

  return [...grouped.values()]
    .sort((left, right) => left.targetId.localeCompare(right.targetId))
    .map((entry) => ({
      targetId: entry.targetId,
      displayWord: entry.displayWord,
      sessionsWhereHelpUsed: entry.sessions.size,
      totalUniqueAssistanceActions: entry.totalUniqueAssistanceActions,
      maximumAssistanceLevel: entry.maximumAssistanceLevel,
      mostRecentUseDate: entry.mostRecentUseDate,
    }))
}

export function buildReviewSummary(progress: QuestProgressV1, now: string): DashboardReviewSummary {
  const entries = [...progress.reviewQueue]
    .map((entry) => ({
      ...entry,
      status: reviewStatus(entry.dueAt, now),
    }))
    .sort((left, right) => reviewSort(left.status) - reviewSort(right.status)
      || new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()
      || left.skillId.localeCompare(right.skillId))

  return {
    dueReviews: entries.filter((entry) => entry.status !== 'upcoming').length,
    upcomingReviews: entries.filter((entry) => entry.status === 'upcoming').length,
    overdueReviews: entries.filter((entry) => entry.status === 'overdue').length,
    nextReviewDate: entries[0]?.dueAt ?? null,
    entries,
  }
}

export function buildAttentionItems(input: {
  progress: QuestProgressV1
  now: string
  reviewSummary?: DashboardReviewSummary
  wordHelpSummaries?: DashboardWordHelpSummary[]
}): DashboardAttentionItem[] {
  const reviewSummary = input.reviewSummary ?? buildReviewSummary(input.progress, input.now)
  const wordHelpSummaries = input.wordHelpSummaries ?? buildWordHelpSummaries({ progress: input.progress })
  const items: DashboardAttentionItem[] = []

  const dueReviews = reviewSummary.entries.filter((entry) => entry.status !== 'upcoming')
  if (dueReviews.length > 0) {
    items.push({
      kind: 'REVIEW_DUE',
      severity: 'attention',
      title: 'Review quests are ready',
      explanation: `${dueReviews.length} review quest${dueReviews.length === 1 ? '' : 's'} are due or overdue.`,
      relatedSkillId: dueReviews[0]?.skillId ?? null,
      relatedTargetId: null,
      evidenceSummary: `${reviewSummary.overdueReviews} overdue, ${reviewSummary.dueReviews - reviewSummary.overdueReviews} due now`,
    })
  }

  const remediation = Object.values(input.progress.skillProgress).find((skill) => skill.remediationContext)
  if (remediation?.remediationContext) {
    items.push({
      kind: 'ACTIVE_REMEDIATION',
      severity: 'attention',
      title: 'A prerequisite route is active',
      explanation: 'One skill is currently rebuilding a building block before returning to the original trail.',
      relatedSkillId: remediation.skillId,
      relatedTargetId: null,
      evidenceSummary: `${remediation.remediationContext.remediationSkillId} -> ${remediation.remediationContext.originalSkillId}`,
    })
  }

  const verification = Object.values(input.progress.skillProgress).find((skill) => skill.currentLearningState === 'VERIFY_MASTERY' && skill.qualifyingIndependentActivityIds.length < 2)
  if (verification) {
    items.push({
      kind: 'FRESH_VERIFICATION_NEEDED',
      severity: 'info',
      title: 'Fresh verification needed',
      explanation: 'One strong independent activity has been recorded, and a different activity is needed to confirm mastery.',
      relatedSkillId: verification.skillId,
      relatedTargetId: null,
      evidenceSummary: `${verification.qualifyingIndependentActivityIds.length} distinct mastery activity`,
    })
  }

  const repeatedSupport = findRepeatedSupportTarget(input.progress)
  if (repeatedSupport) {
    items.push({
      kind: 'REPEATED_SAME_SKILL_SUPPORT',
      severity: 'info',
      title: 'Helpful clues were used more than once',
      explanation: 'The same support target has appeared in more than one recent completed session.',
      relatedSkillId: repeatedSupport.skillId,
      relatedTargetId: repeatedSupport.targetId,
      evidenceSummary: `${repeatedSupport.targetId} appears in ${repeatedSupport.count} recent sessions`,
    })
  }

  const reinforcement = findRecentAccuracyReinforcement(input.progress, input.now)
  if (reinforcement) {
    items.push({
      kind: 'RECENT_ACCURACY_REINFORCEMENT',
      severity: 'info',
      title: 'Recent practice could use reinforcement',
      explanation: 'Three or more recent attempts for one skill are averaging below the strong-practice threshold.',
      relatedSkillId: reinforcement.skillId,
      relatedTargetId: null,
      evidenceSummary: `${reinforcement.sampleCount} attempts averaging ${reinforcement.averageAccuracy}%`,
    })
  }

  if (input.progress.plannedNextQuest?.status === 'content_needed') {
    items.push({
      kind: 'CONTENT_NEEDED',
      severity: 'attention',
      title: 'More fresh quests are being prepared',
      explanation: 'The current trail has no fresh eligible activity right now.',
      relatedSkillId: input.progress.plannedNextQuest.skillId,
      relatedTargetId: null,
      evidenceSummary: input.progress.plannedNextQuest.reason,
    })
  }

  if (hasNoRecentActivity(input.progress, input.now)) {
    items.push({
      kind: 'NO_RECENT_ACTIVITY',
      severity: 'info',
      title: 'No recent activity',
      explanation: 'The child has history in the app, but nothing has been completed in the last seven days.',
      relatedSkillId: input.progress.completedAttempts.at(-1)?.skillId ?? null,
      relatedTargetId: null,
      evidenceSummary: 'No completed attempt in the last 7 days',
    })
  }

  void wordHelpSummaries
  return items
}

export function buildDataQuality(progress: QuestProgressV1, questionIndex: Map<string, ReadingQuestion>): DashboardDataQuality {
  let classifiedQuestionCount = 0
  let unclassifiedQuestionCount = 0
  for (const attempt of progress.completedAttempts) {
    for (const result of attempt.questionResults) {
      if (questionIndex.has(result.questionId)) classifiedQuestionCount += 1
      else unclassifiedQuestionCount += 1
    }
  }
  return {
    classifiedQuestionCount,
    unclassifiedQuestionCount,
    missingContentReferenceCount: unclassifiedQuestionCount,
  }
}

function buildFluencyPracticeSummary(progress: QuestProgressV1): DashboardFluencyPracticeSummary {
  const fluencyAttempts = progress.completedAttempts.filter((attempt) => attempt.lessonRole === 'FLUENCY_PRACTICE')
  const reflectionCounts = fluencyAttempts.reduce((counts, attempt) => {
    const reflection = attempt.fluencyPracticeSummary?.reflection ?? null
    if (reflection === 'smooth') counts.smooth += 1
    else if (reflection === 'some_pauses') counts.some_pauses += 1
    else if (reflection === 'try_again') counts.try_again += 1
    return counts
  }, {
    smooth: 0,
    some_pauses: 0,
    try_again: 0,
  })

  return {
    completedFluencyPracticeSessions: fluencyAttempts.length,
    distinctFluencyActivitiesCompleted: new Set(fluencyAttempts.map((attempt) => attempt.activityId)).size,
    modelReadSessions: fluencyAttempts.filter((attempt) => attempt.fluencyPracticeSummary?.modelReadUsed).length,
    phrasePracticeSessions: fluencyAttempts.filter((attempt) => attempt.fluencyPracticeSummary?.phrasePracticeCompleted).length,
    totalCompletedReads: fluencyAttempts.reduce((sum, attempt) => sum + (attempt.fluencyPracticeSummary?.completedReadCount ?? 0), 0),
    reflectionCounts,
    lastFluencyPracticeDate: latestAttemptDate(fluencyAttempts),
    practiceComplete: new Set(fluencyAttempts.map((attempt) => attempt.activityId)).size >= 7,
    oralReadingMeasured: false,
  }
}

function buildOverview(progress: QuestProgressV1, reviewSummary: DashboardReviewSummary): DashboardOverview {
  const sortedAttempts = sortAscending(progress.completedAttempts)
  const recentWindow = sortedAttempts.slice(-RECENT_WINDOW)
  return {
    completedSessions: progress.completedSessionCount,
    totalXp: progress.totalXp,
    totalStars: progress.totalStars,
    recentAverageAccuracy: recentWindow.length === 0
      ? null
      : roundPercent(recentWindow.reduce((sum, attempt) => sum + attempt.accuracy, 0) / recentWindow.length),
    latestCompletedSessionDate: sortedAttempts.at(-1)?.completedAt ?? null,
    totalIndependentMasteryMilestones: progress.completedAttempts.filter((attempt) => attempt.progressionDecisionState === 'ADVANCE').length,
    skillsRepresented: Object.keys(progress.skillProgress).length,
    reviewsCurrentlyDue: reviewSummary.dueReviews,
    activeRemediationRoutes: Object.values(progress.skillProgress).filter((skill) => skill.remediationContext).length,
  }
}

function indexQuestions(content: ContentSample): Map<string, ReadingQuestion> {
  return new Map(content.questions.map((question) => [question.questionIdentifier, question]))
}

function indexSupportTargets(content: ContentSample): Map<string, { surfaceWord: string }> {
  const map = new Map<string, { surfaceWord: string }>()
  for (const passage of content.passages) {
    for (const target of passage.wordSupportTargets ?? []) {
      map.set(target.targetId, { surfaceWord: target.surfaceWord })
    }
  }
  return map
}

function normalizeCategory(category: string): string {
  return CATEGORY_MAP[category] ?? category
}

function emptyCategoryBucket(): CategoryBucket {
  return {
    rawCategories: new Set<string>(),
    totalQuestionAttempts: 0,
    correctResponses: 0,
    firstAttemptCorrectResponses: 0,
    assistedSessionCount: 0,
    mostRecentActivityDate: null,
  }
}

function findFirstQuestionForSkill(questionIndex: Map<string, ReadingQuestion>, skillId: string): ReadingQuestion | null {
  for (const question of questionIndex.values()) {
    if (question.skillIdentifier === skillId) return question
  }
  return null
}

function findBenchmarkReferencesForSkill(questionIndex: Map<string, ReadingQuestion>, skillId: string): string[] {
  const benchmarkReferences = new Set<string>()
  for (const question of questionIndex.values()) {
    if (question.skillIdentifier === skillId) benchmarkReferences.add(question.benchmarkReference)
  }
  return [...benchmarkReferences].sort((left, right) => left.localeCompare(right))
}

function latestAttemptDate(attempts: { completedAt: string }[]): string | null {
  return attempts.reduce<string | null>((latest, attempt) => latestDate(latest, attempt.completedAt), null)
}

function latestDate(current: string | null, candidate: string): string {
  if (!current) return candidate
  return new Date(candidate).getTime() >= new Date(current).getTime() ? candidate : current
}

function sortAscending<T extends { completedAt: string }>(attempts: readonly T[]): T[] {
  return [...attempts].sort((left, right) => new Date(left.completedAt).getTime() - new Date(right.completedAt).getTime())
}

function sortDescending<T extends { completedAt: string }>(attempts: readonly T[]): T[] {
  return [...attempts].sort((left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime())
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

function roundPercent(value: number): number {
  return Math.round(value * 1000) / 10
}

function firstAttemptRatio(attempt: { questionResults: { isFirstAttemptCorrect: boolean }[] }): number {
  if (attempt.questionResults.length === 0) return 0
  return attempt.questionResults.filter((result) => result.isFirstAttemptCorrect).length / attempt.questionResults.length
}

function reviewStatus(dueAt: string, now: string): DashboardReviewEntry['status'] {
  const dueMs = new Date(dueAt).getTime()
  const nowMs = new Date(now).getTime()
  if (Number.isNaN(dueMs)) return 'upcoming'
  if (dueMs < nowMs) return 'overdue'
  if (dueMs === nowMs) return 'due_now'
  return 'upcoming'
}

function reviewSort(status: DashboardReviewEntry['status']): number {
  if (status === 'overdue') return 0
  if (status === 'due_now') return 1
  return 2
}

function findRepeatedSupportTarget(progress: QuestProgressV1): { targetId: string; skillId: string; count: number } | null {
  const counts = new Map<string, { skillId: string; count: number }>()
  for (const attempt of sortDescending(progress.completedAttempts).slice(0, RECENT_WINDOW)) {
    const seen = new Set(attempt.assistanceEvents.map((event) => event.targetId))
    for (const targetId of seen) {
      const existing = counts.get(targetId) ?? { skillId: attempt.skillId, count: 0 }
      existing.count += 1
      existing.skillId = attempt.skillId
      counts.set(targetId, existing)
    }
  }
  for (const [targetId, value] of counts.entries()) {
    if (value.count >= 2) return { targetId, skillId: value.skillId, count: value.count }
  }
  return null
}

function findRecentAccuracyReinforcement(progress: QuestProgressV1, now: string): { skillId: string; sampleCount: number; averageAccuracy: number } | null {
  const cutoff = new Date(now).getTime() - PAST_7_DAYS_MS
  const attemptsBySkill = new Map<string, { accuracy: number; completedAt: string }[]>()
  for (const attempt of progress.completedAttempts) {
    const bucket = attemptsBySkill.get(attempt.skillId) ?? []
    bucket.push({ accuracy: attempt.accuracy, completedAt: attempt.completedAt })
    attemptsBySkill.set(attempt.skillId, bucket)
  }
  for (const [skillId, attempts] of attemptsBySkill.entries()) {
    const recent = attempts.filter((attempt) => new Date(attempt.completedAt).getTime() >= cutoff)
    if (recent.length >= 3) {
      const averageAccuracy = recent.reduce((sum, attempt) => sum + attempt.accuracy, 0) / recent.length
      if (averageAccuracy < 70) {
        return { skillId, sampleCount: recent.length, averageAccuracy: roundPercent(averageAccuracy) }
      }
    }
  }
  return null
}

function hasNoRecentActivity(progress: QuestProgressV1, now: string): boolean {
  if (progress.completedAttempts.length === 0) return false
  const cutoff = new Date(now).getTime() - PAST_7_DAYS_MS
  return !progress.completedAttempts.some((attempt) => new Date(attempt.completedAt).getTime() >= cutoff)
}
