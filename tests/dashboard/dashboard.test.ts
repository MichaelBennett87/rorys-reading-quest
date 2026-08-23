import { describe, expect, test } from 'vitest'

import { createAssistanceEvent } from '../../src/domain/assistance'
import { sampleContent } from '../../src/domain/content'
import { grade2ContextCavernAcademicWordWorkshopPack } from '../../src/domain/content/packs/grade2/contextCavern/academicWordWorkshop'
import { grade2ContextCavernMorphologyMinePack } from '../../src/domain/content/packs/grade2/contextCavern/morphologyMine'
import {
  buildAttentionItems,
  buildBenchmarkSummaries,
  buildCategorySummaries,
  buildDashboardSnapshot,
  buildRecentAttemptSummaries,
  buildReviewSummary,
  buildSkillSummaries,
  buildWordHelpSummaries,
} from '../../src/domain/dashboard'
import { getLessonCandidates } from '../../src/domain/lesson'
import { createDefaultQuestProgress, type CompletedLessonAttempt, type QuestProgressV1 } from '../../src/persistence'

const now = '2026-08-20T12:00:00.000Z'
const old = '2026-08-10T12:00:00.000Z'
const candidates = getLessonCandidates()
const strongCandidate = candidates.find((candidate) => candidate.difficulty === 1)!
const remediationCandidate = candidates.find((candidate) => candidate.difficulty === 0)!

function buildAttempt(params: {
  completionId: string
  completedAt: string
  accuracy: number
  questionIds: string[]
  targetId?: string
  decisionState: CompletedLessonAttempt['progressionDecisionState']
  assistanceSummary?: CompletedLessonAttempt['assistanceSummary']
  skillId?: string
  difficulty?: number
  lessonId?: string
  activityId?: string
  lessonRole?: CompletedLessonAttempt['lessonRole']
  fluencyPracticeSummary?: CompletedLessonAttempt['fluencyPracticeSummary']
}): CompletedLessonAttempt {
  const questionResults = params.questionIds.map((questionId, index) => ({
    questionId,
    isCorrect: index < Math.max(1, Math.round(params.accuracy / 100 * params.questionIds.length)),
    isFirstAttemptCorrect: index < Math.max(1, Math.round(params.accuracy / 100 * params.questionIds.length)),
  }))
  const assistanceEvent = params.targetId
    ? createAssistanceEvent({
        sessionId: params.completionId,
        lessonId: params.lessonId ?? strongCandidate.lessonId,
        activityId: params.activityId ?? strongCandidate.activityId,
        questionId: params.questionIds[0],
        targetId: params.targetId,
        kind: 'PATTERN_HIGHLIGHT',
        level: 1,
        timestamp: params.completedAt,
        existingEvents: [],
      }).event!
    : null

  return {
    attemptId: params.completionId,
    completionId: params.completionId,
    lessonId: params.lessonId ?? strongCandidate.lessonId,
    activityId: params.activityId ?? strongCandidate.activityId,
    skillId: params.skillId ?? strongCandidate.skillId,
    difficulty: params.difficulty ?? strongCandidate.difficulty,
    lessonRole: params.lessonRole,
    questionResults,
    accuracy: params.accuracy,
    assistanceCount: params.assistanceSummary?.totalUniqueEvents ?? (assistanceEvent ? 1 : 0),
    assistanceSummary: params.assistanceSummary ?? {
      totalUniqueEvents: assistanceEvent ? 1 : 0,
      targetsHelped: assistanceEvent ? 1 : 0,
      maximumAssistanceLevel: assistanceEvent ? 1 : 0,
      visualHintUsed: Boolean(assistanceEvent),
      spokenChunkHelpUsed: false,
      spokenWordHelpUsed: false,
      sentenceReadAloudUsed: false,
    },
    fluencyPracticeSummary: params.fluencyPracticeSummary ?? null,
    assistanceEvents: assistanceEvent ? [assistanceEvent] : [],
    completedAt: params.completedAt,
    progressionDecisionState: params.decisionState,
    reasonCodes: ['independent_evidence'],
    nextReviewDate: null,
  }
}

function createProgress(attempts: CompletedLessonAttempt[]): QuestProgressV1 {
  const progress = createDefaultQuestProgress(now)
  progress.completedAttempts = attempts
  progress.completedSessionCount = attempts.length
  progress.totalXp = attempts.reduce((sum, attempt) => sum + attempt.assistanceCount * 5 + attempt.questionResults.length * 10, 0)
  progress.totalStars = attempts.reduce((sum, attempt) => sum + (attempt.accuracy >= 90 ? 3 : attempt.accuracy >= 70 ? 2 : 1), 0)
  progress.skillProgress = {
    [strongCandidate.skillId]: {
      skillId: strongCandidate.skillId,
      currentDifficulty: 1,
      lastMasteredDifficulty: 0,
      currentLearningState: 'VERIFY_MASTERY',
      qualifyingIndependentActivityIds: ['act-word-forge-vowel-voyage-a-1'],
      consecutiveUnsuccessfulAtCurrentDifficulty: 0,
      lastCompletedActivityId: strongCandidate.activityId,
      recentActivityUsage: [],
      reviewStep: 0,
      nextReviewDate: '2026-08-21T12:00:00.000Z',
      lastDecisionReasonCodes: ['independent_evidence'],
      remediationContext: null,
    },
    'remediation-skill': {
      skillId: 'remediation-skill',
      currentDifficulty: 0,
      lastMasteredDifficulty: 1,
      currentLearningState: 'REMEDIATE_PREREQUISITE',
      qualifyingIndependentActivityIds: [],
      consecutiveUnsuccessfulAtCurrentDifficulty: 1,
      lastCompletedActivityId: remediationCandidate.activityId,
      recentActivityUsage: [],
      reviewStep: 0,
      nextReviewDate: null,
      lastDecisionReasonCodes: ['consecutive_failures'],
      remediationContext: {
        originalSkillId: strongCandidate.skillId,
        originalDifficulty: 1,
        remediationSkillId: 'remediation-skill',
        remediationDifficulty: 0,
        reason: 'explicit_prerequisite',
      },
    },
  }
  progress.reviewQueue = [
    { skillId: strongCandidate.skillId, difficulty: 1, reviewStep: 0, dueAt: '2026-08-19T12:00:00.000Z' },
    { skillId: remediationCandidate.skillId, difficulty: 0, reviewStep: 1, dueAt: '2026-08-20T12:00:00.000Z' },
    { skillId: 'future-skill', difficulty: 1, reviewStep: 0, dueAt: '2026-08-25T12:00:00.000Z' },
  ]
  progress.plannedNextQuest = {
    status: 'content_needed',
    purpose: 'progression',
    skillId: strongCandidate.skillId,
    difficulty: 1,
    reason: 'No fresh content is currently available.',
  }
  progress.lastProgressionOutcome = {
    completionId: attempts.at(-1)?.completionId ?? 'none',
    decisionState: attempts.at(-1)?.progressionDecisionState ?? 'VERIFY_MASTERY',
    reasonCodes: ['independent_evidence'],
    earnedXp: progress.totalXp,
    earnedStars: progress.totalStars,
    completedAt: attempts.at(-1)?.completedAt ?? now,
  }
  return progress
}

describe('dashboard analytics', () => {
  test('empty progress produces explicit no-data summaries and does not mutate input', () => {
    const progress = createDefaultQuestProgress(now)
    const snapshot = buildDashboardSnapshot({ progress, now })

    expect(snapshot.overview.completedSessions).toBe(0)
    expect(snapshot.overview.recentAverageAccuracy).toBeNull()
    expect(snapshot.categorySummaries.every((summary) => summary.dataAvailability === 'no_data')).toBe(true)
    expect(snapshot.dataQuality).toEqual({
      classifiedQuestionCount: 0,
      unclassifiedQuestionCount: 0,
      missingContentReferenceCount: 0,
    })
    expect((snapshot as { fastScore?: unknown }).fastScore).toBeUndefined()
    expect((snapshot as { predictedGradeLevel?: unknown }).predictedGradeLevel).toBeUndefined()
    expect(progress.completedSessionCount).toBe(0)
  })

  test('category, benchmark, and skill summaries classify known question ids', () => {
    const progress = createProgress([
      buildAttempt({
        completionId: 'completion-a',
        completedAt: now,
        accuracy: 100,
        questionIds: ['q-word-forge-vowel-voyage-a-1', 'q-word-forge-vowel-voyage-a-2'],
        targetId: 'support-passage-a-wind',
        decisionState: 'VERIFY_MASTERY',
      }),
    ])

    const categories = buildCategorySummaries({ progress })
    const category = categories.find((entry) => entry.reportingCategory === 'Foundational Skills Bridge')!
    expect(category.totalQuestionAttempts).toBe(2)
    expect(category.overallAccuracy).toBe(100)
    expect(category.firstAttemptAccuracy).toBe(100)
    expect(category.assistedSessionCount).toBe(1)

    const benchmark = buildBenchmarkSummaries({ progress }).find((entry) => entry.skillIdentifier === strongCandidate.skillId)!
    expect(benchmark.reportingCategory).toBe('Foundational Skills Bridge')
    expect(benchmark.accuracy).toBe(100)
    expect(benchmark.firstAttemptAccuracy).toBe(100)
    expect(benchmark.assistedSessionRate).toBe(100)
    expect(benchmark.currentDifficulty).toBe(1)

    const skill = buildSkillSummaries({ progress }).find((entry) => entry.skillId === strongCandidate.skillId)!
    expect(skill.reportingCategory).toBe('Foundational Skills Bridge')
    expect(skill.currentDifficulty).toBe(1)
    expect(skill.lastMasteredDifficulty).toBe(0)
    expect(skill.distinctIndependentEvidenceCount).toBe(1)
    expect(skill.activeRemediationTarget).toBeNull()
  })

  test('vocabulary summaries include Context Cavern academic-word and morphology benchmarks', () => {
    const academicQuestionIds = grade2ContextCavernAcademicWordWorkshopPack.questions.slice(0, 2).map((question) => question.questionIdentifier)
    const morphologyQuestionIds = grade2ContextCavernMorphologyMinePack.questions.slice(0, 2).map((question) => question.questionIdentifier)
    const progress = createDefaultQuestProgress(now)
    progress.completedAttempts = [
      buildAttempt({
        completionId: 'completion-context-academic',
        completedAt: now,
        accuracy: 100,
        questionIds: academicQuestionIds,
        decisionState: 'ADVANCE',
        skillId: 'g2-context-cavern-vocabulary',
        difficulty: 1,
        lessonId: 'lesson-context-cavern-academic-word-workshop-checkpoint-a',
        activityId: 'activity-context-cavern-academic-word-workshop-checkpoint-a',
      }),
      buildAttempt({
        completionId: 'completion-context-morphology',
        completedAt: now,
        accuracy: 100,
        questionIds: morphologyQuestionIds,
        decisionState: 'ADVANCE',
        skillId: 'g2-context-cavern-vocabulary',
        difficulty: 2,
        lessonId: 'lesson-context-cavern-morphology-mine-checkpoint-a',
        activityId: 'activity-context-cavern-morphology-mine-checkpoint-a',
      }),
    ]
    progress.completedSessionCount = progress.completedAttempts.length
    progress.skillProgress['g2-context-cavern-vocabulary'] = {
      skillId: 'g2-context-cavern-vocabulary',
      currentDifficulty: 2,
      lastMasteredDifficulty: 1,
      currentLearningState: 'ADVANCE',
      qualifyingIndependentActivityIds: ['activity-context-cavern-academic-word-workshop-checkpoint-a', 'activity-context-cavern-morphology-mine-checkpoint-a'],
      consecutiveUnsuccessfulAtCurrentDifficulty: 0,
      lastCompletedActivityId: 'activity-context-cavern-morphology-mine-checkpoint-a',
      recentActivityUsage: [],
      reviewStep: 0,
      nextReviewDate: '2026-08-21T12:00:00.000Z',
      lastDecisionReasonCodes: ['independent_evidence'],
      remediationContext: null,
    }

    const category = buildCategorySummaries({ progress }).find((entry) => entry.reportingCategory === 'Vocabulary')!
    expect(category.totalQuestionAttempts).toBe(4)
    expect(category.correctResponses).toBe(4)
    expect(category.firstAttemptCorrectResponses).toBe(4)
    expect(category.assistedSessionCount).toBe(0)

    const benchmarkSummaries = buildBenchmarkSummaries({ progress }).filter((entry) => entry.skillIdentifier === 'g2-context-cavern-vocabulary')
    expect(benchmarkSummaries.map((entry) => entry.benchmarkReference)).toEqual(['ELA.2.V.1.1', 'ELA.2.V.1.2'])
    expect(benchmarkSummaries).toHaveLength(2)

    const skill = buildSkillSummaries({ progress }).find((entry) => entry.skillId === 'g2-context-cavern-vocabulary')!
    expect(skill.reportingCategory).toBe('Vocabulary')
    expect(skill.benchmarkReference).toBe('ELA.2.V.1.1')
    expect(skill.benchmarkReferences).toEqual(['ELA.2.V.1.1', 'ELA.2.V.1.2', 'ELA.2.V.1.3'])
    expect(skill.currentDifficulty).toBe(2)
    expect(skill.lastMasteredDifficulty).toBe(1)
    expect(skill.distinctIndependentEvidenceCount).toBe(2)
    expect(skill.currentLearningState).toBe('ADVANCE')
  })

  test('review summaries sort deterministically and use injected time', () => {
    const progress = createProgress([buildAttempt({
      completionId: 'completion-a',
      completedAt: now,
      accuracy: 100,
      questionIds: ['q-word-forge-vowel-voyage-a-1'],
      decisionState: 'VERIFY_MASTERY',
    })])

    const reviewSummary = buildReviewSummary(progress, now)
    expect(reviewSummary.overdueReviews).toBe(1)
    expect(reviewSummary.dueReviews).toBe(2)
    expect(reviewSummary.upcomingReviews).toBe(1)
    expect(reviewSummary.entries[0].status).toBe('overdue')
    expect(reviewSummary.entries[1].status).toBe('due_now')
    expect(reviewSummary.entries[2].status).toBe('upcoming')
  })

  test('review summaries preserve Story Map and Theme Trail unit affinity labels', () => {
    const progress = createProgress([])
    progress.reviewQueue = [
      {
        skillId: 'g2-story-scouts-prose',
        difficulty: 1,
        reviewStep: 0,
        dueAt: '2026-08-21T08:00:00.000Z',
        unitId: 'ss-unit-1',
        contentVersion: 'g2-ss-plot-elements-r0.1.0',
      },
      {
        skillId: 'g2-story-scouts-prose',
        difficulty: 2,
        reviewStep: 0,
        dueAt: '2026-08-21T09:00:00.000Z',
        unitId: 'ss-unit-2',
        contentVersion: 'g2-ss-theme-r0.1.0',
      },
    ] as never

    const reviewSummary = buildReviewSummary(progress, now)

    expect(reviewSummary.entries).toHaveLength(2)
    expect(reviewSummary.entries[0].unitLabel).toMatch(/Story Map/i)
    expect(reviewSummary.entries[1].unitLabel).toMatch(/Theme Trail/i)
    expect(reviewSummary.entries[0].contentVersion).toBe('g2-ss-plot-elements-r0.1.0')
    expect(reviewSummary.entries[1].contentVersion).toBe('g2-ss-theme-r0.1.0')
  })

  test('recent attempts are newest first and capped at ten entries', () => {
    const attempts = Array.from({ length: 12 }, (_, index) => buildAttempt({
      completionId: `completion-${index}`,
      completedAt: new Date(Date.parse(now) + index * 60_000).toISOString(),
      accuracy: index % 2 === 0 ? 100 : 60,
      questionIds: ['q-word-forge-vowel-voyage-a-1'],
      decisionState: 'VERIFY_MASTERY',
    }))
    const progress = createProgress(attempts)

    const recent = buildRecentAttemptSummaries({ progress })
    expect(recent).toHaveLength(10)
    expect(recent[0].completionDate).toBe(new Date(Date.parse(now) + 11 * 60_000).toISOString())
    expect(recent[9].completionDate).toBe(new Date(Date.parse(now) + 2 * 60_000).toISOString())
  })

  test('word-help summaries aggregate by target and archive missing targets', () => {
    const attemptOne = buildAttempt({
      completionId: 'completion-a',
      completedAt: old,
      accuracy: 100,
      questionIds: ['q-word-forge-vowel-voyage-a-1'],
      targetId: 'support-passage-a-wind',
      decisionState: 'VERIFY_MASTERY',
    })
    const attemptTwo = buildAttempt({
      completionId: 'completion-b',
      completedAt: now,
      accuracy: 100,
      questionIds: ['q-word-forge-vowel-voyage-a-2'],
      targetId: 'missing-target',
      decisionState: 'ADVANCE',
    })
    const progress = createProgress([attemptOne, attemptTwo])

    const summaries = buildWordHelpSummaries({ progress })
    expect(summaries.find((entry) => entry.targetId === 'support-passage-a-wind')?.displayWord).toBe('wind')
    expect(summaries.find((entry) => entry.targetId === 'missing-target')?.displayWord).toBe('Archived word target')
    expect(summaries.find((entry) => entry.targetId === 'support-passage-a-wind')?.sessionsWhereHelpUsed).toBe(1)
  })

  test('attention items include repeated support, content-needed, and no recent activity signals', () => {
    const attemptOne = buildAttempt({
      completionId: 'completion-a',
      completedAt: old,
      accuracy: 60,
      questionIds: ['q-word-forge-vowel-voyage-a-1'],
      targetId: 'support-passage-a-wind',
      decisionState: 'GUIDED_PRACTICE',
    })
    const attemptTwo = buildAttempt({
      completionId: 'completion-b',
      completedAt: old,
      accuracy: 60,
      questionIds: ['q-word-forge-vowel-voyage-a-2'],
      targetId: 'support-passage-a-wind',
      decisionState: 'GUIDED_PRACTICE',
    })
    const progress = createProgress([attemptOne, attemptTwo])
    progress.plannedNextQuest = {
      status: 'content_needed',
      purpose: 'progression',
      skillId: strongCandidate.skillId,
      difficulty: 1,
      reason: 'No fresh eligible activity exists.',
    }

    const items = buildAttentionItems({ progress, now })
    expect(items.map((item) => item.kind)).toContain('REPEATED_SAME_SKILL_SUPPORT')
    expect(items.map((item) => item.kind)).toContain('CONTENT_NEEDED')
    expect(items.map((item) => item.kind)).toContain('NO_RECENT_ACTIVITY')
  })

  test('dashboard analytics do not mutate progress or content', () => {
    const progress = createProgress([
      buildAttempt({
        completionId: 'completion-a',
        completedAt: now,
        accuracy: 100,
        questionIds: ['q-word-forge-vowel-voyage-a-1'],
        targetId: 'support-passage-a-wind',
        decisionState: 'VERIFY_MASTERY',
      }),
    ])
    const progressSnapshot = structuredClone(progress)
    const contentSnapshot = structuredClone(sampleContent)

    buildDashboardSnapshot({ progress, now, content: sampleContent })

    expect(progress).toEqual(progressSnapshot)
    expect(sampleContent).toEqual(contentSnapshot)
  })

  test('fluency practice summary aggregates practice-only sessions without oral measurement', () => {
    const progress = createProgress([
      buildAttempt({
        completionId: 'fluency-completion-a',
        completedAt: now,
        accuracy: 100,
        questionIds: ['q-word-forge-fluency-practice-punctuation-pauses-1'],
        decisionState: 'FLUENCY_PRACTICE',
        lessonId: 'lesson-word-forge-fluency-practice-punctuation-pauses',
        activityId: 'activity-word-forge-fluency-practice-punctuation-pauses',
        lessonRole: 'FLUENCY_PRACTICE',
        fluencyPracticeSummary: {
          modelReadUsed: true,
          phrasePracticeCompleted: true,
          completedReadCount: 2,
          reflection: 'smooth',
          oralReadingMeasured: false,
          timerUsed: false,
          microphoneUsed: false,
        },
      }),
      buildAttempt({
        completionId: 'fluency-completion-b',
        completedAt: old,
        accuracy: 75,
        questionIds: ['q-word-forge-fluency-practice-phrase-groups-1'],
        decisionState: 'FLUENCY_PRACTICE',
        lessonId: 'lesson-word-forge-fluency-practice-phrase-groups',
        activityId: 'activity-word-forge-fluency-practice-phrase-groups',
        lessonRole: 'FLUENCY_PRACTICE',
        fluencyPracticeSummary: {
          modelReadUsed: false,
          phrasePracticeCompleted: true,
          completedReadCount: 1,
          reflection: 'some_pauses',
          oralReadingMeasured: false,
          timerUsed: false,
          microphoneUsed: false,
        },
      }),
    ])

    const snapshot = buildDashboardSnapshot({ progress, now })
    expect(snapshot.fluencyPracticeSummary).toEqual(expect.objectContaining({
      completedFluencyPracticeSessions: 2,
      distinctFluencyActivitiesCompleted: 2,
      modelReadSessions: 1,
      phrasePracticeSessions: 2,
      totalCompletedReads: 3,
      lastFluencyPracticeDate: now,
      practiceComplete: false,
      oralReadingMeasured: false,
    }))
    expect(snapshot.fluencyPracticeSummary.reflectionCounts).toEqual({
      smooth: 1,
      some_pauses: 1,
      try_again: 0,
    })
  })
})
