import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { useRef, useState } from 'react'

import { ParentDashboardScreen } from '../src/screens/parent/ParentDashboardScreen'
import { createDefaultQuestProgress, type QuestProgressV1 } from '../src/persistence'
import type { ParentRecordsState } from '../src/persistence/parentRecordsStore'
import type { DashboardSnapshot } from '../src/domain/dashboard'
import {
  createAssessmentRecord,
  deleteAssessmentRecord,
  parseAssessmentForm,
  updateAssessmentRecord,
} from '../src/domain/assessment'
import type { AssessmentFormValues } from '../src/domain/assessment'
import type { PrintService } from '../src/services/printing'
import type { ParentAssessmentMutationResult } from '../src/screens/parent/parentAssessmentActions'

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
        worldId: 'word-forge',
        unitId: 'wg-unit-1',
        packId: 'g2-word-forge-variable-vowels-oo-ea',
        benchmarkReferences: ['ELA.2.F.1.3a'],
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
        reportingCategory: 'Foundational Skills Bridge',
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
        reportingCategory: 'Foundational Skills Bridge',
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
        benchmarkReferences: ['BM-WORD-FORGE-1', 'BM-WORD-FORGE-2'],
        reportingCategory: 'Foundational Skills Bridge',
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
        benchmarkReferences: ['BM-ARCHIVED-9'],
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
      dataQualityNote: null,
      entries: [
        {
          skillId: 'g2-word-forge-word-practice',
          difficulty: 1,
          reviewStep: 0,
          dueAt: '2026-08-18T12:00:00.000Z',
          unitId: null,
          unitLabel: null,
          contentVersion: null,
          status: 'overdue',
        },
        {
          skillId: 'archived-skill',
          difficulty: 0,
          reviewStep: 1,
          dueAt: '2026-08-20T12:00:00.000Z',
          unitId: null,
          unitLabel: null,
          contentVersion: null,
          status: 'due_now',
        },
        {
          skillId: 'future-skill',
          difficulty: 1,
          reviewStep: 2,
          dueAt: '2026-08-25T12:00:00.000Z',
          unitId: null,
          unitLabel: null,
          contentVersion: null,
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
    fluencyPracticeSummary: {
      completedFluencyPracticeSessions: 2,
      distinctFluencyActivitiesCompleted: 2,
      modelReadSessions: 1,
      phrasePracticeSessions: 2,
      totalCompletedReads: 3,
      reflectionCounts: {
        smooth: 1,
        some_pauses: 1,
        try_again: 0,
      },
      lastFluencyPracticeDate: '2026-08-20T11:30:00.000Z',
      practiceComplete: false,
      oralReadingMeasured: false,
    },
    nextQuestExplanation: 'Fresh verification is next for Word Forge.',
    dataQuality: {
      classifiedQuestionCount: 5,
      unclassifiedQuestionCount: 1,
      missingContentReferenceCount: 1,
    },
  }
}

function createVocabularyDashboard(): DashboardSnapshot {
  const dashboard = createDashboard()
  dashboard.categorySummaries.push({
    reportingCategory: 'Vocabulary',
    rawCategories: ['vocabulary'],
    totalQuestionAttempts: 4,
    correctResponses: 4,
    firstAttemptCorrectResponses: 4,
    overallAccuracy: 100,
    firstAttemptAccuracy: 100,
    assistedSessionCount: 0,
    assistedSessionRate: 0,
    mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
    dataAvailability: 'ready',
    unclassifiedQuestionCount: 0,
  })
  dashboard.benchmarkSummaries.push(
    {
      benchmarkReference: 'ELA.2.V.1.1',
      skillIdentifier: 'g2-context-cavern-vocabulary',
      reportingCategory: 'Vocabulary',
      gradeBand: 2,
      questionAttempts: 2,
      accuracy: 100,
      firstAttemptAccuracy: 100,
      assistedSessionRate: 0,
      mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
      currentDifficulty: 1,
      lastMasteredDifficulty: 0,
      distinctIndependentEvidenceCount: 1,
      currentLearningState: 'ADVANCE',
      nextReviewDate: '2026-08-21T12:00:00.000Z',
      activeRemediationTarget: null,
      parentStatusExplanation: 'Context Cavern Academic Word Workshop is ready for the next vocabulary trail.',
      dataAvailability: 'ready',
    },
    {
      benchmarkReference: 'ELA.2.V.1.2',
      skillIdentifier: 'g2-context-cavern-vocabulary',
      reportingCategory: 'Vocabulary',
      gradeBand: 2,
      questionAttempts: 2,
      accuracy: 100,
      firstAttemptAccuracy: 100,
      assistedSessionRate: 0,
      mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
      currentDifficulty: 2,
      lastMasteredDifficulty: 1,
      distinctIndependentEvidenceCount: 2,
      currentLearningState: 'ADVANCE',
      nextReviewDate: '2026-08-21T12:00:00.000Z',
      activeRemediationTarget: null,
      parentStatusExplanation: 'Context Cavern Morphology Mine is ready for review and next-step practice.',
      dataAvailability: 'ready',
    },
  )
  dashboard.skillSummaries.push({
    skillId: 'g2-context-cavern-vocabulary',
    benchmarkReference: 'ELA.2.V.1.1',
    benchmarkReferences: ['ELA.2.V.1.1', 'ELA.2.V.1.2'],
    reportingCategory: 'Vocabulary',
    gradeBand: 2,
    questionAttempts: 4,
    accuracy: 100,
    firstAttemptAccuracy: 100,
    assistedSessionRate: 0,
    mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
    currentDifficulty: 2,
    lastMasteredDifficulty: 1,
    distinctIndependentEvidenceCount: 2,
    currentLearningState: 'ADVANCE',
    nextReviewDate: '2026-08-21T12:00:00.000Z',
    activeRemediationTarget: null,
    parentStatusExplanation: 'Context Cavern Morphology Mine is ready for review and next-step practice.',
    dataAvailability: 'ready',
  })
  dashboard.recentAttempts.unshift({
    completionDate: '2026-08-20T12:00:00.000Z',
    lessonId: 'lesson-context-cavern-morphology-mine-checkpoint-a',
    lessonTitle: 'Context Cavern: Morphology Mine',
    activityId: 'activity-context-cavern-morphology-mine-checkpoint-a',
    skillId: 'g2-context-cavern-vocabulary',
    difficulty: 2,
    accuracy: 100,
    firstAttemptAccuracy: 100,
    assistanceUsed: 0,
    supportedTargetCount: 0,
    maximumAssistanceLevel: 0,
    progressionDecision: 'ADVANCE',
    parentFriendlyExplanation: 'Context Cavern Morphology Mine is ready for review and next-step practice.',
    nextReviewDate: '2026-08-21T12:00:00.000Z',
    classificationStatus: 'classified',
  })
  dashboard.reviewSummary.entries.push({
    skillId: 'g2-context-cavern-vocabulary',
    difficulty: 2,
    reviewStep: 0,
    dueAt: '2026-08-21T12:00:00.000Z',
    unitId: 'cc-unit-2',
    unitLabel: 'Morphology Mine',
    contentVersion: 'g2-cc-morphology-r0.1.0',
    status: 'upcoming',
  })
  dashboard.reviewSummary.upcomingReviews = 2
  dashboard.overview.skillsRepresented = 3
  dashboard.overview.completedSessions = 5
  dashboard.overview.reviewsCurrentlyDue = 2
  return dashboard
}

function createCompareCastleDashboard(): DashboardSnapshot {
  const dashboard = createDashboard()
  dashboard.categorySummaries.push({
    reportingCategory: 'Reading Across Genres and Vocabulary',
    rawCategories: ['across_genres'],
    totalQuestionAttempts: 7,
    correctResponses: 6,
    firstAttemptCorrectResponses: 5,
    overallAccuracy: 86,
    firstAttemptAccuracy: 71,
    assistedSessionCount: 1,
    assistedSessionRate: 14,
    mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
    dataAvailability: 'ready',
    unclassifiedQuestionCount: 0,
  })
    dashboard.benchmarkSummaries.push(
      {
        benchmarkReference: 'ELA.2.R.3.1',
        skillIdentifier: 'g2-across-genres-reading',
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
      parentStatusExplanation: 'Wordplay Watchtower is ready for the next compare-castle trail.',
      dataAvailability: 'ready',
    },
      {
        benchmarkReference: 'ELA.2.R.3.2',
        skillIdentifier: 'g2-across-genres-reading',
        reportingCategory: 'Reading Across Genres and Vocabulary',
        gradeBand: 2,
      questionAttempts: 3,
      accuracy: 100,
      firstAttemptAccuracy: 100,
      assistedSessionRate: 0,
      mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
      currentDifficulty: 2,
      lastMasteredDifficulty: 1,
      distinctIndependentEvidenceCount: 2,
      currentLearningState: 'ADVANCE',
      nextReviewDate: '2026-08-21T12:00:00.000Z',
        activeRemediationTarget: null,
        parentStatusExplanation: 'Retell Hall uses structured authored retell choices rather than spontaneous oral or original written retells.',
        dataAvailability: 'ready',
      },
      {
        benchmarkReference: 'ELA.2.R.3.3',
        skillIdentifier: 'g2-across-genres-reading',
        reportingCategory: 'Reading Across Genres and Vocabulary',
        gradeBand: 2,
        questionAttempts: 3,
        accuracy: 100,
        firstAttemptAccuracy: 100,
        assistedSessionRate: 0,
        mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
        currentDifficulty: 3,
        lastMasteredDifficulty: 2,
        distinctIndependentEvidenceCount: 2,
        currentLearningState: 'ADVANCE',
        nextReviewDate: '2026-08-21T12:00:00.000Z',
        activeRemediationTarget: null,
        parentStatusExplanation: 'Compare Keep uses structured authored comparison choices rather than original written or oral comparison.',
        dataAvailability: 'ready',
      },
    )
    dashboard.skillSummaries.push({
      skillId: 'g2-across-genres-reading',
      benchmarkReference: 'ELA.2.R.3.1',
      benchmarkReferences: ['ELA.2.R.3.1', 'ELA.2.R.3.2', 'ELA.2.R.3.3'],
      reportingCategory: 'Reading Across Genres and Vocabulary',
      gradeBand: 2,
      questionAttempts: 10,
      accuracy: 100,
      firstAttemptAccuracy: 100,
      assistedSessionRate: 0,
      mostRecentActivityDate: '2026-08-20T12:00:00.000Z',
      currentDifficulty: 3,
      lastMasteredDifficulty: 2,
      distinctIndependentEvidenceCount: 2,
      currentLearningState: 'ADVANCE',
      nextReviewDate: '2026-08-21T12:00:00.000Z',
      activeRemediationTarget: null,
      parentStatusExplanation: 'Compare Keep uses structured authored comparison choices rather than original written or oral comparison.',
      dataAvailability: 'ready',
    })
    dashboard.recentAttempts.unshift({
      completionDate: '2026-08-20T12:00:00.000Z',
      lessonId: 'cg-compare-checkpoint-literary-a',
      lessonTitle: 'Compare Castle: Compare Keep',
      activityId: 'activity-compare-castle-compare-keep-checkpoint-a',
      skillId: 'g2-across-genres-reading',
      difficulty: 3,
      accuracy: 100,
      firstAttemptAccuracy: 100,
      assistanceUsed: 0,
      supportedTargetCount: 0,
      maximumAssistanceLevel: 0,
      progressionDecision: 'ADVANCE',
      parentFriendlyExplanation: 'Compare Keep uses structured authored comparison choices rather than original written or oral comparison.',
      nextReviewDate: '2026-08-21T12:00:00.000Z',
      classificationStatus: 'classified',
    })
    dashboard.reviewSummary.entries.push(
      {
        skillId: 'g2-across-genres-reading',
        difficulty: 2,
        reviewStep: 0,
        dueAt: '2026-08-21T12:00:00.000Z',
        unitId: 'cg-unit-2',
        unitLabel: 'Compare Castle: Retell Hall',
        contentVersion: 'g2-cg-retell-r0.1.0',
        status: 'due_now',
      },
      {
        skillId: 'g2-across-genres-reading',
        difficulty: 3,
        reviewStep: 1,
        dueAt: '2026-08-22T12:00:00.000Z',
        unitId: 'cg-unit-3',
        unitLabel: 'Compare Castle: Compare Keep',
        contentVersion: 'g2-cg-compare-r0.1.0',
        status: 'upcoming',
      },
    )
    dashboard.reviewSummary.dueReviews = 1
    dashboard.reviewSummary.upcomingReviews = 1
    dashboard.reviewSummary.overdueReviews = 0
    dashboard.reviewSummary.nextReviewDate = '2026-08-21T12:00:00.000Z'
    return dashboard
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
      dataQualityNote: null,
      entries: [],
    },
    attentionItems: [],
    fluencyPracticeSummary: {
      completedFluencyPracticeSessions: 0,
      distinctFluencyActivitiesCompleted: 0,
      modelReadSessions: 0,
      phrasePracticeSessions: 0,
      totalCompletedReads: 0,
      reflectionCounts: {
        smooth: 0,
        some_pauses: 0,
        try_again: 0,
      },
      lastFluencyPracticeDate: null,
      practiceComplete: false,
      oralReadingMeasured: false,
    },
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

function createUnavailablePrintService(): PrintService {
  return {
    isSupported: () => false,
    print: () => ({ status: 'unavailable', reason: 'Printing is not available in this browser.' }),
  }
}

function createNoopMutationResult(recordsState: ParentRecordsState, message: string): ParentAssessmentMutationResult {
  return {
    status: 'unavailable',
    message,
    fieldErrors: [],
    records: recordsState.officialAssessments,
  }
}

function renderDashboard(recentAverageAccuracy: number | null = 87) {
  const recordsState = createRecordsState()
  return render(
    <ParentDashboardScreen
      progress={createProgress()}
      dashboard={createDashboard(recentAverageAccuracy)}
      recordsState={recordsState}
      storageNotice="Parent storage is ready."
      printService={createUnavailablePrintService()}
      onCreateAssessment={() => createNoopMutationResult(recordsState, 'Assessment actions are not used in this test.')}
      onUpdateAssessment={() => createNoopMutationResult(recordsState, 'Assessment actions are not used in this test.')}
      onDeleteAssessment={() => createNoopMutationResult(recordsState, 'Assessment actions are not used in this test.')}
      onLock={() => {}}
      onBackToQuest={() => {}}
    />,
  )
}

function createSupportedPrintService() {
  const print = vi.fn(() => ({ status: 'printed' as const }))
  return {
    print,
    service: {
      isSupported: () => true,
      print,
    } as PrintService,
  }
}

function renderInteractiveDashboard(initialRecordsState = createRecordsState()) {
  const printService = createSupportedPrintService()

  function Harness() {
    const [recordsState, setRecordsState] = useState(initialRecordsState)
    const nextAssessmentId = useRef(2)

    const handleCreateAssessment = (values: AssessmentFormValues): ParentAssessmentMutationResult => {
      const parsed = parseAssessmentForm(values, now)
      if (parsed.status !== 'valid') {
        return {
          status: 'invalid',
          message: 'Please fix the highlighted fields.',
          fieldErrors: parsed.errors,
          records: recordsState.officialAssessments,
        }
      }

      const mutation = createAssessmentRecord({
        records: recordsState.officialAssessments,
        parsedForm: parsed.value,
        assessmentId: `assessment-${nextAssessmentId.current++}`,
        now,
      })
      if (mutation.status !== 'saved') {
        return {
          status: 'invalid',
          message: mutation.message,
          fieldErrors: [],
          records: recordsState.officialAssessments,
        }
      }

      const nextState: ParentRecordsState = {
        ...recordsState,
        officialAssessments: mutation.records,
        updatedAt: now,
      }
      setRecordsState(nextState)
      return {
        status: 'saved',
        message: 'Assessment saved.',
        fieldErrors: [],
        records: nextState.officialAssessments,
        record: mutation.record,
      }
    }

    const handleUpdateAssessment = (assessmentId: string, values: AssessmentFormValues): ParentAssessmentMutationResult => {
      const parsed = parseAssessmentForm(values, now)
      if (parsed.status !== 'valid') {
        return {
          status: 'invalid',
          message: 'Please fix the highlighted fields.',
          fieldErrors: parsed.errors,
          records: recordsState.officialAssessments,
        }
      }

      const mutation = updateAssessmentRecord({
        records: recordsState.officialAssessments,
        assessmentId,
        parsedForm: parsed.value,
        now,
      })
      if (mutation.status !== 'saved') {
        return {
          status: mutation.status,
          message: mutation.message,
          fieldErrors: [],
          records: recordsState.officialAssessments,
        }
      }

      const nextState: ParentRecordsState = {
        ...recordsState,
        officialAssessments: mutation.records,
        updatedAt: now,
      }
      setRecordsState(nextState)
      return {
        status: 'saved',
        message: 'Assessment updated.',
        fieldErrors: [],
        records: nextState.officialAssessments,
        record: mutation.record,
      }
    }

    const handleDeleteAssessment = (assessmentId: string): ParentAssessmentMutationResult => {
      const mutation = deleteAssessmentRecord({
        records: recordsState.officialAssessments,
        assessmentId,
        now,
      })
      if (mutation.status !== 'saved') {
        return {
          status: mutation.status,
          message: mutation.message,
          fieldErrors: [],
          records: recordsState.officialAssessments,
        }
      }

      const nextState: ParentRecordsState = {
        ...recordsState,
        officialAssessments: mutation.records,
        updatedAt: now,
      }
      setRecordsState(nextState)
      return {
        status: 'saved',
        message: 'Assessment deleted.',
        fieldErrors: [],
        records: nextState.officialAssessments,
        record: mutation.record,
      }
    }

    return (
      <ParentDashboardScreen
        progress={createProgress()}
        dashboard={createDashboard()}
        recordsState={recordsState}
        storageNotice="Parent storage is ready."
        printService={printService.service}
        onCreateAssessment={handleCreateAssessment}
        onUpdateAssessment={handleUpdateAssessment}
        onDeleteAssessment={handleDeleteAssessment}
        onLock={() => {}}
        onBackToQuest={() => {}}
      />
    )
  }

  return {
    ...render(<Harness />),
    printService,
  }
}

function getDetailButton(article: HTMLElement, name: RegExp) {
  return within(article).getByRole('button', { name })
}

describe('ParentDashboardScreen', () => {
  test('overview is the initial authenticated view and no-data sessions do not show 0 percent', () => {
    const recordsState = createRecordsState()
    render(
      <ParentDashboardScreen
        progress={createProgress()}
        dashboard={createNoDataDashboard()}
        recordsState={recordsState}
        storageNotice="Parent storage is ready."
        printService={createUnavailablePrintService()}
        onCreateAssessment={() => createNoopMutationResult(recordsState, 'Assessment actions are not used in this test.')}
        onUpdateAssessment={() => createNoopMutationResult(recordsState, 'Assessment actions are not used in this test.')}
        onDeleteAssessment={() => createNoopMutationResult(recordsState, 'Assessment actions are not used in this test.')}
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
    expect(screen.getByRole('heading', { name: /Fluency practice/i })).toBeTruthy()
    expect(screen.getByText(/Fluency Flight supports practice only/i)).toBeTruthy()
    expect(screen.getByText(/Data quality note/i)).toBeTruthy()
  })

  test('progress view opens category cards, benchmark filtering, and skill drill-downs', () => {
    renderDashboard()

    fireEvent.click(screen.getByRole('button', { name: /Progress/i }))
    expect(screen.getByRole('heading', { name: /Progress/i })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 4, name: /Foundational Skills Bridge/i })).toBeTruthy()
    expect(screen.getAllByText(/No practice data yet/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Foundational Skills Bridge is an internal practice category/i)).toBeTruthy()

    fireEvent.change(screen.getByLabelText(/Filter by category/i), { target: { value: 'Reading Informational Text' } })
    expect(screen.getByRole('heading', { level: 4, name: /BM-ARCHIVED-9/i })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /BM-WORD-FORGE-1/i })).toBeNull()

    const skillCard = screen.getByRole('heading', { name: /Word Forge/i }).closest('article')
    expect(skillCard).not.toBeNull()
    fireEvent.click(getDetailButton(skillCard!, /View Skill Details/i))
    expect(screen.getByRole('heading', { level: 2, name: /Word Forge/i })).toBeTruthy()
    expect(screen.getByText(/Benchmark references: BM-WORD-FORGE-1 · BM-WORD-FORGE-2/i)).toBeTruthy()
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

  test('reviews, word help, and assessments remain readable with assessment management controls', () => {
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
    expect(screen.getByRole('heading', { name: /Official Assessments/i })).toBeTruthy()
    expect(screen.getByText(/Assessment entry and editing arrive in Phase 5B2/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Add Assessment/i })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /Edit/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Delete/i }).length).toBeGreaterThan(0)
    expect(screen.queryByText(/upload report/i)).toBeNull()
  })

  test('assessment management can create, edit, and delete a local record', () => {
    const { printService } = renderInteractiveDashboard()

    fireEvent.click(screen.getByRole('button', { name: /Assessments/i }))
    fireEvent.click(screen.getByRole('button', { name: /Add Assessment/i }))

    fireEvent.change(screen.getByLabelText(/Assessment Window/i), { target: { value: 'PM2' } })
    fireEvent.change(screen.getByLabelText(/^Grade$/i), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/Scale Score/i), { target: { value: '415' } })
    fireEvent.change(screen.getByLabelText(/Tested On/i), { target: { value: '2026-08-19' } })
    fireEvent.change(screen.getByLabelText(/Reported Achievement Level/i), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/Reported Percentile Rank/i), { target: { value: '50' } })
    fireEvent.click(screen.getByRole('button', { name: /Save Assessment/i }))

    expect(screen.getByText(/Assessment saved/i)).toBeTruthy()
    expect(screen.getByRole('heading', { name: /PM2 · Grade 3/i })).toBeTruthy()
    expect(screen.getByText(/Scale score 415/i)).toBeTruthy()

    const createdCard = screen.getByRole('heading', { name: /PM2 · Grade 3/i }).closest('article')
    expect(createdCard).not.toBeNull()
    fireEvent.click(within(createdCard!).getByRole('button', { name: /Edit/i }))

    fireEvent.change(screen.getByLabelText(/Scale Score/i), { target: { value: '420' } })
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }))
    expect(screen.getByText(/Assessment updated/i)).toBeTruthy()
    expect(screen.getByText(/Scale score 420/i)).toBeTruthy()

    const updatedCard = screen.getByRole('heading', { name: /PM2 · Grade 3/i }).closest('article')
    expect(updatedCard).not.toBeNull()
    fireEvent.click(within(updatedCard!).getByRole('button', { name: /Delete/i }))
    expect(screen.getByRole('heading', { name: /Delete Assessment\?/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Delete Assessment/i }))
    expect(screen.getByText(/Assessment deleted/i)).toBeTruthy()
    expect(screen.queryByText(/Scale score 420/i)).toBeNull()
    expect(printService.print).toHaveBeenCalledTimes(0)
  })

  test('print summary opens a preview and uses the injected print service only on explicit print', () => {
    const { service: printService, print } = createSupportedPrintService()
    render(
      <ParentDashboardScreen
        progress={createProgress()}
        dashboard={createDashboard()}
        recordsState={createRecordsState()}
        storageNotice="Parent storage is ready."
        printService={printService}
        onCreateAssessment={(values) => createNoopMutationResult(createRecordsState(), values.assessmentWindow)}
        onUpdateAssessment={() => createNoopMutationResult(createRecordsState(), 'update')}
        onDeleteAssessment={() => createNoopMutationResult(createRecordsState(), 'delete')}
        onLock={() => {}}
        onBackToQuest={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Print Summary/i }))
    expect(screen.getByRole('heading', { name: /Parent Progress Summary/i })).toBeTruthy()
    expect(screen.getByText(/Foundational Skills Bridge is an internal practice category/i)).toBeTruthy()
    expect(screen.getByText(/Benchmark references: BM-WORD-FORGE-1 · BM-WORD-FORGE-2/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /^Print$/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^Print$/i }))
    expect(print).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: /Back to Dashboard/i }))
    expect(screen.getByRole('heading', { name: /Overview/i })).toBeTruthy()
  })

  test('vocabulary progress and print summary surface Context Cavern morphology details', () => {
    const { service: printService, print } = createSupportedPrintService()
    const progress = createProgress()
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

    render(
      <ParentDashboardScreen
        progress={progress}
        dashboard={createVocabularyDashboard()}
        recordsState={createRecordsState()}
        storageNotice="Parent storage is ready."
        printService={printService}
        onCreateAssessment={(values) => createNoopMutationResult(createRecordsState(), values.assessmentWindow)}
        onUpdateAssessment={() => createNoopMutationResult(createRecordsState(), 'update')}
        onDeleteAssessment={() => createNoopMutationResult(createRecordsState(), 'delete')}
        onLock={() => {}}
        onBackToQuest={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Progress/i }))
    fireEvent.change(screen.getByLabelText(/Filter by category/i), { target: { value: 'Vocabulary' } })
    expect(screen.getByRole('heading', { name: /ELA\.2\.V\.1\.1/i })).toBeTruthy()
    expect(screen.getAllByText(/Context Cavern Vocabulary/i).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('heading', { name: /Context Cavern Vocabulary/i }).closest('article')!.querySelector('button')!)
    expect(screen.getByRole('heading', { level: 2, name: /Context Cavern Vocabulary/i })).toBeTruthy()
    expect(screen.getByText(/Benchmark references: ELA\.2\.V\.1\.1 · ELA\.2\.V\.1\.2/i)).toBeTruthy()
    expect(screen.getByText(/Current trail: Trail 2/i)).toBeTruthy()
    expect(screen.getByText(/Distinct independent evidence count: 2/i)).toBeTruthy()
    expect(screen.getByText(/Context Cavern Morphology Mine is ready for review and next-step practice/i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Print Summary/i }))
    expect(screen.getByRole('heading', { name: /Parent Progress Summary/i })).toBeTruthy()
    expect(screen.getAllByText(/Context Cavern Vocabulary/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Benchmark references: ELA\.2\.V\.1\.1 · ELA\.2\.V\.1\.2/i)).toBeTruthy()
    expect(screen.getByText(/Context Cavern: Morphology Mine/i)).toBeTruthy()
    expect(screen.queryByText(/passage text/i)).toBeNull()
    expect(screen.queryByText(/MorphologyGuide/i)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^Print$/i }))
    expect(print).toHaveBeenCalledTimes(1)
  })

  test('compare castle progress and print summary use friendly across-genre labels', () => {
    const { service: printService, print } = createSupportedPrintService()

    render(
      <ParentDashboardScreen
        progress={createProgress()}
        dashboard={createCompareCastleDashboard()}
        recordsState={createRecordsState()}
        storageNotice="Parent storage is ready."
        printService={printService}
        onCreateAssessment={(values) => createNoopMutationResult(createRecordsState(), values.assessmentWindow)}
        onUpdateAssessment={() => createNoopMutationResult(createRecordsState(), 'update')}
        onDeleteAssessment={() => createNoopMutationResult(createRecordsState(), 'delete')}
        onLock={() => {}}
        onBackToQuest={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Progress/i }))
    fireEvent.change(screen.getByLabelText(/Filter by category/i), { target: { value: 'Reading Across Genres and Vocabulary' } })
    expect(screen.getByRole('heading', { name: /Across-Genre Reading/i })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /g2-across-genres-reading/i })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Print Summary/i }))

    expect(screen.getByRole('heading', { name: /Parent Progress Summary/i })).toBeTruthy()
    expect(screen.getAllByText(/Across-Genre Reading/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Compare Castle: Retell Hall/i)).toBeTruthy()
    expect(screen.getAllByText(/Compare Castle: Compare Keep/i).length).toBeGreaterThan(1)
    expect(screen.getAllByText(/Reading Across Genres and Vocabulary/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Compare Keep uses structured authored comparison choices rather than original written or oral comparison\./i).length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: /g2-across-genres-reading/i })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /^Print$/i }))
    expect(print).toHaveBeenCalledTimes(1)
  })
})
