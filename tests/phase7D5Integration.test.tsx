import { act, cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { useQuestProgress } from '../src/app/useQuestProgress'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { getLessonById, getLessonCandidates } from '../src/domain/lesson'
import { createInitialSkillProgress, type LessonActivityCandidate } from '../src/domain/progression'
import {
  PARENT_ACCESS_STORAGE_KEY,
  PARENT_RECORDS_STORAGE_KEY,
  QUEST_PROGRESS_STORAGE_KEY,
  createActiveLessonSession,
  createDefaultQuestProgress,
  type CompletedLessonAttempt,
} from '../src/persistence'
import { resolveFriendlySkillName } from '../src/screens/parent/parentDashboardView'

const NOW = '2026-08-30T18:30:00.000Z'
const SKILL_ID = 'g3-context-cavern-vocabulary'
const UNIT_ID = 'g3-cc-unit-2'
const VERSION = 'g3-cc-root-meaning-r0.1.0'
const candidates = getLessonCandidates()
const unit1Checkpoint = candidates.find((candidate) => (
  candidate.skillId === SKILL_ID
  && candidate.unitId === 'g3-cc-unit-1'
  && candidate.eligiblePurposes.includes('progression')
))!

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

function stateReadyForRootMeaningVault() {
  const state = createDefaultQuestProgress(NOW)
  for (const [skillId, difficulty] of [
    ['g2-word-forge-word-practice', 8],
    ['g2-story-scouts-prose', 4],
    ['g2-poetry-planet-poetry', 2],
    ['g2-information-detectives-reading', 5],
    ['g2-context-cavern-vocabulary', 4],
    ['g2-across-genres-reading', 4],
    ['g3-word-forge-word-analysis', 5],
    ['g3-story-scouts-prose', 4],
    ['g3-poetry-planet-poetry', 2],
    ['g3-information-detectives-reading', 5],
    ['g3-across-genres-reading', 4],
  ] as const) {
    state.skillProgress[skillId] = createInitialSkillProgress(skillId, difficulty, difficulty - 1)
  }
  state.skillProgress[SKILL_ID] = createInitialSkillProgress(SKILL_ID, 2, 1)
  return state
}

function completedAttempt(candidate: LessonActivityCandidate, completionId: string): CompletedLessonAttempt {
  return {
    attemptId: completionId,
    completionId,
    lessonId: candidate.lessonId,
    lessonRole: 'CHECKPOINT',
    activityId: candidate.activityId,
    skillId: candidate.skillId,
    difficulty: candidate.difficulty,
    questionResults: Array.from({ length: 7 }, (_, index) => ({
      questionId: `${completionId}-question-${index + 1}`,
      isCorrect: true,
      isFirstAttemptCorrect: true,
      submittedAnswer: 'correct',
      correctAnswer: 'correct',
      explanation: 'Fixture explanation.',
      evidenceReference: [],
    })),
    accuracy: 100,
    assistanceCount: 0,
    assistanceSummary: {
      totalUniqueEvents: 0,
      targetsHelped: 0,
      maximumAssistanceLevel: 0,
      visualHintUsed: false,
      spokenChunkHelpUsed: false,
      spokenWordHelpUsed: false,
      sentenceReadAloudUsed: false,
    },
    assistanceEvents: [],
    completedAt: NOW,
    progressionDecisionState: 'VERIFY_MASTERY',
    reasonCodes: ['independent_evidence'],
    nextReviewDate: null,
  }
}

describe('Phase 7D5 integration and reconciled one-button journey', () => {
  test('keeps Root Meaning Vault registered while later Unit 3 coverage coexists', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(18)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-context-cavern-root-meaning-vault')).toHaveLength(1)
    expect(packs.some((pack) => pack.manifest.packId.includes('meaning-maze'))).toBe(true)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40,
      activeLessonCount: 280,
      activePassageCount: 294,
      activeQuestionCount: 1614,
      activeSupportTargetCount: 1111,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((entry) => entry.benchmarkReference === 'ELA.3.V.1.2')).toMatchObject({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      missingPatterns: [],
      contributingPackIds: ['g3-context-cavern-root-meaning-vault'],
      coveredPatterns: ['greek-roots', 'latin-roots', 'base-words', 'affixes', 'unfamiliar-word-meaning'],
    })
    expect(snapshot.rows.filter((entry) => entry.coverageStatus === 'implemented')).toHaveLength(14)
    expect(snapshot.rows.filter((entry) => entry.coverageStatus === 'supportive_practice')).toHaveLength(2)
    expect(snapshot.rows.filter((entry) => entry.coverageStatus === 'planned')).toHaveLength(0)
  })

  test('retires stale Unit 2 no-content, preserves local records, and resumes one authoritative session', () => {
    const state = stateReadyForRootMeaningVault()
    state.plannedNextQuest = {
      status: 'content_needed',
      purpose: 'progression',
      skillId: SKILL_ID,
      difficulty: 2,
      reason: 'Old Root Meaning Vault boundary.',
    }
    state.totalXp = 1720
    state.totalStars = 57
    state.reviewQueue = [{ skillId: SKILL_ID, difficulty: 1, reviewStep: 1, dueAt: NOW }]
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
    window.localStorage.setItem(PARENT_ACCESS_STORAGE_KEY, '{"protected":"parent-access"}')
    window.localStorage.setItem(PARENT_RECORDS_STORAGE_KEY, '{"protected":"parent-records-and-assessments"}')

    const journey = renderHook(() => useQuestProgress())
    let first!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    let repeated!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    act(() => { first = journey.result.current.prepareJourneyLaunch() })
    act(() => { repeated = journey.result.current.prepareJourneyLaunch() })

    expect(first).toMatchObject({
      status: 'start',
      lesson: { skillId: SKILL_ID, unitId: UNIT_ID, difficulty: 2, contentVersion: VERSION },
    })
    expect(repeated).toMatchObject({ status: 'resume', lesson: { skillId: SKILL_ID, unitId: UNIT_ID, difficulty: 2 } })
    if (first.status === 'start' && repeated.status === 'resume') expect(repeated.session.sessionId).toBe(first.session.sessionId)
    expect(journey.result.current.progress).toMatchObject({
      totalXp: 1720,
      totalStars: 57,
      reviewQueue: [{ skillId: SKILL_ID, difficulty: 1, reviewStep: 1, dueAt: NOW }],
      skillProgress: { [SKILL_ID]: { currentDifficulty: 2, lastMasteredDifficulty: 1 } },
    })
    expect(window.localStorage.getItem(PARENT_ACCESS_STORAGE_KEY)).toBe('{"protected":"parent-access"}')
    expect(window.localStorage.getItem(PARENT_RECORDS_STORAGE_KEY)).toBe('{"protected":"parent-records-and-assessments"}')
    journey.unmount()
  })

  test('rejects a completed stale Unit 1 session before launching Unit 2', () => {
    const state = stateReadyForRootMeaningVault()
    const unit1Lesson = getLessonById(unit1Checkpoint.lessonId).lesson!
    const staleSession = createActiveLessonSession(unit1Lesson, 'completed-unit-1-session', NOW)
    state.activeLessonSession = staleSession
    state.completedAttempts = [completedAttempt(unit1Checkpoint, staleSession.sessionId)]
    state.completedSessionCount = 1
    state.totalXp = 100
    state.totalStars = 3
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))

    const journey = renderHook(() => useQuestProgress())
    let launch!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    act(() => { launch = journey.result.current.prepareJourneyLaunch() })

    expect(launch).toMatchObject({ status: 'start', lesson: { unitId: UNIT_ID, difficulty: 2 } })
    if (launch.status === 'start') expect(launch.session.sessionId).not.toBe(staleSession.sessionId)
    expect(journey.result.current.progress.completedAttempts).toHaveLength(1)
    expect(journey.result.current.progress).toMatchObject({ totalXp: 100, totalStars: 3 })
    journey.unmount()
  })

  test('keeps Home at two controls, world cards display-only, and launches without a selector', async () => {
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(stateReadyForRootMeaningVault()))
    render(<App />)

    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
    const map = screen.getByRole('region', { name: 'Your Reading Journey' })
    expect(within(map).queryAllByRole('button')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(await screen.findByText(/Root Meaning Vault Checkpoint:/)).toBeTruthy()
    expect(screen.queryByText(/choose a world|choose a unit|choose a word|choose a lesson|another lesson is already open/i)).toBeNull()
  })

  test('keeps reporting friendly and guide, answer, and planner diagnostics out of persistence', () => {
    expect(resolveFriendlySkillName(SKILL_ID)).toBe('Grade 3 Context Cavern')
    const serialized = JSON.stringify(createDefaultQuestProgress(NOW))
    for (const forbidden of [
      'rootMeaningGuides',
      'combinedPartClue',
      'inferredMeaning',
      'contextConfirmationStatement',
      'correctAnswers',
      'selectionMode',
    ]) {
      expect(serialized).not.toContain(forbidden)
    }
    // A substring search would incorrectly reject the legitimate persisted reasonCodes array.
    expect(containsExactOwnProperty(JSON.parse(serialized), 'reasonCode')).toBe(false)
  })

  test('keeps parent and print copy honest while excluding guide metadata', () => {
    const dashboardSource = readFileSync('src/screens/parent/ParentDashboardScreen.tsx', 'utf8')
    const printSource = readFileSync('src/screens/parent/ParentPrintSummaryView.tsx', 'utf8')

    expect(dashboardSource).toContain("summary.benchmarkReference === 'ELA.3.V.1.2'")
    expect(dashboardSource).toContain('IMPLEMENTED / DRAFT')
    expect(dashboardSource).toContain('does not claim pronunciation or decoding mastery')
    expect(printSource).toContain("skill.benchmarkReferences.includes('ELA.3.V.1.2')")
    expect(printSource).toContain('Root-and-affix meaning curriculum coverage: IMPLEMENTED / DRAFT')
    for (const forbidden of ['combinedPartClue', 'inferredMeaning', 'contextConfirmationStatement', 'Correct answer:']) {
      expect(printSource).not.toContain(forbidden)
    }
  })
})

function containsExactOwnProperty(value: unknown, propertyName: string): boolean {
  if (Array.isArray(value)) return value.some((entry) => containsExactOwnProperty(entry, propertyName))
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return Object.prototype.hasOwnProperty.call(record, propertyName)
    || Object.values(record).some((entry) => containsExactOwnProperty(entry, propertyName))
}
