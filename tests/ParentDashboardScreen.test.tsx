import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { ParentDashboardScreen } from '../src/screens/parent/ParentDashboardScreen'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../src/persistence'
import type { ParentRecordsState } from '../src/persistence/parentRecordsStore'
import type { DashboardSnapshot } from '../src/domain/dashboard'

const now = '2026-08-20T12:00:00.000Z'

afterEach(() => {
  cleanup()
})

function createProgress(): QuestProgressV1 {
  const progress = createDefaultQuestProgress(now)
  progress.plannedNextQuest = {
    status: 'available',
    purpose: 'verification',
    lesson: {
      lessonId: 'lesson-word-forge-b',
      activityId: 'activity-word-forge-b',
      skillId: 'g2-word-forge-word-practice',
      difficulty: 1,
      eligiblePurposes: ['verification'],
      passageQuestionKeys: ['q-word-forge-vowel-voyage-a-1'],
      contentVersion: 'v1',
    },
  }
  return progress
}

function createDashboard(recentAverageAccuracy: number | null = 87): DashboardSnapshot {
  return {
    generatedAt: now,
    overview: {
      completedSessions: 4,
      totalXp: 120,
      totalStars: 8,
      recentAverageAccuracy,
      latestCompletedSessionDate: '2026-08-19T12:00:00.000Z',
      totalIndependentMasteryMilestones: 2,
      skillsRepresented: 2,
      reviewsCurrentlyDue: 1,
      activeRemediationRoutes: 1,
    },
    categorySummaries: [
      {
        reportingCategory: 'Reading Prose and Poetry',
        rawCategories: ['prose', 'poetry'],
        totalQuestionAttempts: 6,
        correctResponses: 5,
        firstAttemptCorrectResponses: 4,
        overallAccuracy: 83,
        firstAttemptAccuracy: 67,
        assistedSessionCount: 1,
        assistedSessionRate: 17,
        mostRecentActivityDate: '2026-08-18T12:00:00.000Z',
        dataAvailability: 'ready',
        unclassifiedQuestionCount: 0,
      },
      {
        reportingCategory: 'Reading Informational Text',
        rawCategories: ['informational'],
        totalQuestionAttempts: 0,
        correctResponses: 0,
        firstAttemptCorrectResponses: 0,
        overallAccuracy: null,
        firstAttemptAccuracy: null,
        assistedSessionCount: 0,
        assistedSessionRate: null,
        mostRecentActivityDate: null,
        dataAvailability: 'no_data',
        unclassifiedQuestionCount: 0,
      },
      {
        reportingCategory: 'Reading Across Genres and Vocabulary',
        rawCategories: ['vocabulary'],
        totalQuestionAttempts: 3,
        correctResponses: 3,
        firstAttemptCorrectResponses: 2,
        overallAccuracy: 100,
        firstAttemptAccuracy: 67,
        assistedSessionCount: 0,
        assistedSessionRate: 0,
        mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
        dataAvailability: 'ready',
        unclassifiedQuestionCount: 0,
      },
    ],
    benchmarkSummaries: [
      {
        benchmarkReference: 'BM-WORD-FORGE-1',
        skillIdentifier: 'g2-word-forge-word-practice',
        reportingCategory: 'Reading Across Genres and Vocabulary',
        gradeBand: 2,
        questionAttempts: 4,
        accuracy: 100,
        firstAttemptAccuracy: 100,
        assistedSessionRate: 0,
        mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
        currentDifficulty: 1,
        lastMasteredDifficulty: 0,
        distinctIndependentEvidenceCount: 2,
        currentLearningState: 'ADVANCE',
        nextReviewDate: '2026-08-21T12:00:00.000Z',
        activeRemediationTarget: null,
        parentStatusExplanation: 'This skill advanced one trail after two different activities were completed independently at the mastery threshold.',
        dataAvailability: 'ready',
      },
      {
        benchmarkReference: 'BM-ARCHIVED-9',
        skillIdentifier: 'archived-skill',
        reportingCategory: 'Reading Informational Text',
        gradeBand: null,
        questionAttempts: 0,
        accuracy: null,
        firstAttemptAccuracy: null,
        assistedSessionRate: null,
        mostRecentActivityDate: null,
        currentDifficulty: null,
        lastMasteredDifficulty: null,
        distinctIndependentEvidenceCount: 0,
        currentLearningState: null,
        nextReviewDate: null,
        activeRemediationTarget: null,
        parentStatusExplanation: 'No practice data yet.',
        dataAvailability: 'no_data',
      },
    ],
    skillSummaries: [
      {
        skillId: 'g2-word-forge-word-practice',
        benchmarkReference: 'BM-WORD-FORGE-1',
        reportingCategory: 'Reading Across Genres and Vocabulary',
        gradeBand: 2,
        questionAttempts: 4,
        accuracy: 100,
        firstAttemptAccuracy: 100,
        assistedSessionRate: 0,
        mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
        currentDifficulty: 1,
        lastMasteredDifficulty: 0,
        distinctIndependentEvidenceCount: 2,
        currentLearningState: 'ADVANCE',
        nextReviewDate: '2026-08-21T12:00:00.000Z',
        activeRemediationTarget: null,
        parentStatusExplanation: 'This skill advanced one trail after two different activities were completed independently at the mastery threshold.',
        dataAvailability: 'ready',
      },
      {
        skillId: 'archived-skill',
        benchmarkReference: 'BM-ARCHIVED-9',
        reportingCategory: 'Reading Informational Text',
        gradeBand: null,
        questionAttempts: 0,
        accuracy: null,
        firstAttemptAccuracy: null,
        assistedSessionRate: null,
        mostRecentActivityDate: null,
        currentDifficulty: 0,
        lastMasteredDifficulty: 0,
        distinctIndependentEvidenceCount: 0,
        currentLearningState: 'GUIDED_PRACTICE',
        nextReviewDate: null,
        activeRemediationTarget: null,
        parentStatusExplanation: 'No practice data yet.',
        dataAvailability: 'no_data',
      },
    ],
    recentAttempts: [
      {
        completionDate: '2026-08-20T12:00:00.000Z',
        lessonId: 'lesson-word-forge-b',
        lessonTitle: 'Word Forge: Trail Check',
        activityId: 'activity-word-forge-b',
        skillId: 'g2-word-forge-word-practice',
        difficulty: 1,
        accuracy: 100,
        firstAttemptAccuracy: 100,
        assistanceUsed: 0,
        supportedTargetCount: 0,
        maximumAssistanceLevel: 0,
        progressionDecision: 'ADVANCE',
        parentFriendlyExplanation: 'This skill advanced one trail after two different activities were completed independently at the mastery threshold.',
        nextReviewDate: '2026-08-21T12:00:00.000Z',
        classificationStatus: 'classified',
      },
      {
        completionDate: '2026-08-18T12:00:00.000Z',
        lessonId: 'lesson-word-forge-a',
        lessonTitle: 'Archived Quest',
        activityId: 'activity-word-forge-a',
        skillId: 'archived-skill',
        difficulty: 0,
        accuracy: 67,
        firstAttemptAccuracy: 67,
        assistanceUsed: 2,
        supportedTargetCount: 1,
        maximumAssistanceLevel: 4,
        progressionDecision: 'GUIDED_PRACTICE',
        parentFriendlyExplanation: 'The learner is close to mastery and will receive a fresh activity at the same difficulty.',
        nextReviewDate: null,
        classificationStatus: 'unclassified',
      },
      {
        completionDate: '2026-08-17T12:00:00.000Z',
        lessonId: 'lesson-word-forge-c',
        lessonTitle: 'Word Forge: Review',
        activityId: 'activity-word-forge-c',
        skillId: 'g2-word-forge-word-practice',
        difficulty: 1,
        accuracy: 83,
        firstAttemptAccuracy: 67,
        assistanceUsed: 1,
        supportedTargetCount: 1,
        maximumAssistanceLevel: 6,
        progressionDecision: 'SPACED_REVIEW',
        parentFriendlyExplanation: 'A successful review moved this skill to the next review interval.',
        nextReviewDate: '2026-08-25T12:00:00.000Z',
        classificationStatus: 'classified',
      },
    ],
    wordHelpSummaries: [
      {
        targetId: 'support-wind',
        displayWord: 'wind',
        sessionsWhereHelpUsed: 2,
        totalUniqueAssistanceActions: 3,
        maximumAssistanceLevel: 5,
        mostRecentUseDate: '2026-08-20T12:00:00.000Z',
      },
      {
        targetId: 'archived-target',
        displayWord: 'Archived word target',
        sessionsWhereHelpUsed: 1,
        totalUniqueAssistanceActions: 1,
        maximumAssistanceLevel: 2,
        mostRecentUseDate: '2026-08-18T12:00:00.000Z',
      },
    ],
    reviewSummary: {
      dueReviews: 2,
      upcomingReviews: 1,
      overdueReviews: 1,
      nextReviewDate: '2026-08-21T12:00:00.000Z',
      entries: [
        {
          skillId: 'g2-word-forge-word-practice',
          difficulty: 1,
          reviewStep: 0,
          dueAt: '2026-08-18T12:00:00.000Z',
          status: 'overdue',
        },
        {
          skillId: 'archived-skill',
          difficulty: 0,
          reviewStep: 1,
          dueAt: '2026-08-20T12:00:00.000Z',
          status: 'due_now',
        },
        {
          skillId: 'future-skill',
          difficulty: 1,
          reviewStep: 2,
          dueAt: '2026-08-25T12:00:00.000Z',
          status: 'upcoming',
        },
      ],
    },
    attentionItems: [
      {
        kind: 'REVIEW_DUE',
        severity: 'attention',
        title: 'Review is due',
        explanation: 'One skill is ready for a review quest.',
        relatedSkillId: 'g2-word-forge-word-practice',
        relatedTargetId: null,
        evidenceSummary: '1 overdue review entry',
      },
      {
        kind: 'REPEATED_SAME_SKILL_SUPPORT',
        severity: 'info',
        title: 'Repeated support on one target',
        explanation: 'The same target has been used more than once recently.',
        relatedSkillId: 'archived-skill',
        relatedTargetId: 'support-wind',
        evidenceSummary: '2 recent sessions used the same target',
      },
    ],
    nextQuestExplanation: 'Fresh verification is next for Word Forge.',
    dataQuality: {
      classifiedQuestionCount: 5,
      unclassifiedQuestionCount: 1,
      missingContentReferenceCount: 1,
    },
  }
}

function createNoDataDashboard(): DashboardSnapshot {
  return {
    generatedAt: now,
    overview: {
      completedSessions: 0,
      totalXp: 0,
      totalStars: 0,
      recentAverageAccuracy: null,
      latestCompletedSessionDate: null,
      totalIndependentMasteryMilestones: 0,
      skillsRepresented: 0,
      reviewsCurrentlyDue: 0,
      activeRemediationRoutes: 0,
    },
    categorySummaries: [],
    benchmarkSummaries: [],
    skillSummaries: [],
    recentAttempts: [],
    wordHelpSummaries: [],
    reviewSummary: {
      dueReviews: 0,
      upcomingReviews: 0,
      overdueReviews: 0,
      nextReviewDate: null,
      entries: [],
    },
    attentionItems: [],
    nextQuestExplanation: 'Fresh content is being prepared.',
    dataQuality: {
      classifiedQuestionCount: 0,
      unclassifiedQuestionCount: 0,
      missingContentReferenceCount: 0,
    },
  }
}

function createRecordsState(): ParentRecordsState {
  return {
    schemaVersion: 1,
    officialAssessments: [
      {
        assessmentId: 'assessment-1',
        assessmentWindow: 'PM1',
        gradeBand: 2,
        scaleScore: 350,
        testedOn: '2026-08-10',
        reportedAchievementLevel: 3,
        reportedPercentileRank: 72,
        createdAt: now,
        updatedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

function renderDashboard(recentAverageAccuracy: number | null = 87) {
  return render(
    <ParentDashboardScreen
      progress={createProgress()}
      dashboard={createDashboard(recentAverageAccuracy)}
      recordsState={createRecordsState()}
      storageNotice="Parent storage is ready."
      onLock={() => {}}
      onBackToQuest={() => {}}
    />,
  )
}

function getDetailButton(article: HTMLElement, name: RegExp) {
  return within(article).getByRole('button', { name })
}

describe('ParentDashboardScreen', () => {
  test('overview is the initial authenticated view and no-data sessions do not show 0 percent', () => {
    render(
      <ParentDashboardScreen
        progress={createProgress()}
        dashboard={createNoDataDashboard()}
        recordsState={createRecordsState()}
        storageNotice="Parent storage is ready."
        onLock={() => {}}
        onBackToQuest={() => {}}
      />,
    )

    expect(screen.getByRole('heading', { name: /Overview/i })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: /Parent dashboard views/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Overview/i }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByText(/No completed sessions yet/i)).toBeTruthy()
    expect(screen.queryByText('0%')).toBeNull()
    expect(screen.queryByText(/Some older activity details could not be matched to the current lesson catalog/i)).toBeNull()
    expect(screen.getByText(/No practice items need special attention right now/i)).toBeTruthy()
  })

  test('overview shows recent activity, review preview, and data quality notes', () => {
    renderDashboard()

    expect(screen.getByText(/3 recent sessions/i)).toBeTruthy()
    expect(screen.getByText(/Fresh verification is next for Word Forge/i)).toBeTruthy()
    expect(screen.getByText(/1 overdue · 2 due · 1 upcoming/i)).toBeTruthy()
    expect(screen.getByText(/Data quality note/i)).toBeTruthy()
  })

  test('progress view opens category cards, benchmark filtering, and skill drill-downs', () => {
    renderDashboard()

    fireEvent.click(screen.getByRole('button', { name: /Progress/i }))
    expect(screen.getByRole('heading', { name: /Progress/i })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 4, name: /Reading Prose and Poetry/i })).toBeTruthy()
    expect(screen.getAllByText(/No practice data yet/i).length).toBeGreaterThan(0)

    fireEvent.change(screen.getByLabelText(/Filter by category/i), { target: { value: 'Reading Informational Text' } })
    expect(screen.getByRole('heading', { level: 4, name: /BM-ARCHIVED-9/i })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /BM-WORD-FORGE-1/i })).toBeNull()

    const skillCard = screen.getByRole('heading', { name: /Word Forge/i }).closest('article')
    expect(skillCard).not.toBeNull()
    fireEvent.click(getDetailButton(skillCard!, /View Skill Details/i))
    expect(screen.getByRole('heading', { level: 2, name: /Word Forge/i })).toBeTruthy()
    expect(screen.getByText(/Distinct independent evidence count: 2/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Back to Progress/i })).toBeTruthy()
  })

  test('session detail remains privacy-safe and shows the unclassified history notice when needed', () => {
    renderDashboard()

    fireEvent.click(screen.getByRole('button', { name: /Sessions/i }))
    const archivedCard = screen.getByRole('heading', { name: /Archived Quest/i }).closest('article')
    expect(archivedCard).not.toBeNull()
    fireEvent.click(getDetailButton(archivedCard!, /Open Session Details/i))

    expect(screen.getByRole('heading', { level: 2, name: /Archived Quest/i })).toBeTruthy()
    expect(screen.getByText(/Privacy-safe details for one completed reading quest/i)).toBeTruthy()
    expect(screen.getByText(/Some details for this older activity are no longer available in the current lesson catalog/i)).toBeTruthy()
    expect(screen.queryByText(/passage text/i)).toBeNull()
    expect(screen.queryByText(/submitted answer/i)).toBeNull()
    expect(screen.queryByText(/correct answer/i)).toBeNull()
    expect(screen.getByRole('button', { name: /Back to Sessions/i })).toBeTruthy()
  })

  test('reviews, word help, and assessments remain readable and read-only', () => {
    renderDashboard()

    fireEvent.click(screen.getByRole('button', { name: /Reviews/i }))
    expect(screen.getAllByText(/Overdue/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Due now/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Upcoming/i).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Word Help/i }))
    expect(screen.getByText(/Words where clues have been useful/i)).toBeTruthy()
    expect(screen.getByText(/Heard the word/i)).toBeTruthy()
    expect(screen.getByText(/Archived word target/i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Assessments/i }))
    expect(screen.getByText(/Assessment entry and editing arrive in Phase 5B2/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Create/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /Edit/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull()
  })
})
