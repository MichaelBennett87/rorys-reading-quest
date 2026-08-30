import { act, cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { useQuestProgress } from '../src/app/useQuestProgress'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { createInitialSkillProgress } from '../src/domain/progression'
import { createDefaultQuestProgress, QUEST_PROGRESS_STORAGE_KEY } from '../src/persistence'
import { resolveFriendlySkillName } from '../src/screens/parent/parentDashboardView'

const NOW = '2026-08-30T15:30:00.000Z'
const SKILL_ID = 'g3-context-cavern-vocabulary'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

function stateReadyForAcademicWordWorkshop() {
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
  return state
}

describe('Phase 7D4 integration and reconciled one-button journey', () => {
  test('keeps Academic Word Workshop registered after the bounded Unit 2 release', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(18)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-context-cavern-academic-word-workshop')).toHaveLength(1)
    expect(packs.some((pack) => pack.manifest.packId.includes('root-meaning-vault'))).toBe(true)
    expect(packs.some((pack) => pack.manifest.packId.includes('meaning-maze'))).toBe(true)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40,
      activeLessonCount: 280,
      activePassageCount: 294,
      activeQuestionCount: 1614,
      activeSupportTargetCount: 1111,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    const row = snapshot.rows.find((entry) => entry.benchmarkReference === 'ELA.3.V.1.1')
    expect(row).toMatchObject({
      coverageStatus: 'supportive_practice',
      reviewStatus: 'DRAFT',
      missingPatterns: [],
      contributingPackIds: ['g3-context-cavern-academic-word-workshop'],
      coveredPatterns: [
        'grade-level-academic-vocabulary',
        'appropriate-use',
        'speaking-writing-support',
        'no-open-response-scoring',
      ],
    })
    expect(row?.notes.join(' ')).toMatch(/does not score open responses.*claim productive speaking or writing mastery/i)
    expect(snapshot.rows.filter((entry) => entry.coverageStatus === 'implemented')).toHaveLength(14)
    expect(snapshot.rows.filter((entry) => entry.coverageStatus === 'supportive_practice')).toHaveLength(2)
    expect(snapshot.rows.filter((entry) => entry.coverageStatus === 'planned')).toHaveLength(0)
  })

  test('retires stale no-content, initializes once, and resumes one authoritative Unit 1 session', () => {
    const state = stateReadyForAcademicWordWorkshop()
    state.plannedNextQuest = {
      status: 'content_needed',
      purpose: 'progression',
      skillId: SKILL_ID,
      difficulty: 1,
      reason: 'Old Grade 3 Context Cavern boundary.',
    }
    state.totalXp = 1600
    state.totalStars = 52
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))

    const journey = renderHook(() => useQuestProgress())
    let first!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    let repeated!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    act(() => { first = journey.result.current.prepareJourneyLaunch() })
    act(() => { repeated = journey.result.current.prepareJourneyLaunch() })

    expect(first).toMatchObject({ status: 'start', lesson: { skillId: SKILL_ID, unitId: 'g3-cc-unit-1', difficulty: 1 } })
    expect(repeated).toMatchObject({ status: 'resume', lesson: { skillId: SKILL_ID, unitId: 'g3-cc-unit-1', difficulty: 1 } })
    if (first.status === 'start' && repeated.status === 'resume') expect(repeated.session.sessionId).toBe(first.session.sessionId)
    expect(journey.result.current.progress).toMatchObject({
      totalXp: 1600,
      totalStars: 52,
      skillProgress: { [SKILL_ID]: { currentDifficulty: 1, lastMasteredDifficulty: 0 } },
    })
    expect(Object.keys(journey.result.current.progress.skillProgress).filter((skillId) => skillId === SKILL_ID)).toHaveLength(1)
    journey.unmount()
  })

  test('does not initialize Grade 3 Context Cavern before the Grade 2 prerequisite', () => {
    const state = stateReadyForAcademicWordWorkshop()
    state.skillProgress['g2-context-cavern-vocabulary'] = createInitialSkillProgress('g2-context-cavern-vocabulary', 3, 2)
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))

    const journey = renderHook(() => useQuestProgress())
    expect(journey.result.current.progress.skillProgress[SKILL_ID]).toBeUndefined()
    let launch!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    act(() => { launch = journey.result.current.prepareJourneyLaunch() })
    if (launch.status === 'start' || launch.status === 'resume') {
      expect(launch.lesson.skillId).not.toBe(SKILL_ID)
    }
    expect(journey.result.current.progress.skillProgress[SKILL_ID]).toBeUndefined()
    journey.unmount()
  })

  test('keeps Home at two controls, world cards display-only, and launches without a manual selector', async () => {
    const state = stateReadyForAcademicWordWorkshop()
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))
    render(<App />)

    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
    const map = screen.getByRole('region', { name: 'Your Reading Journey' })
    expect(within(map).queryAllByRole('button')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(await screen.findByText(/Academic Word Workshop Checkpoint:/)).toBeTruthy()
    expect(screen.queryByText(/choose a world|choose a unit|choose a word|another lesson is already open/i)).toBeNull()
  })

  test('keeps reporting friendly and guide, response, answer, and planner diagnostics out of persistence', () => {
    expect(resolveFriendlySkillName(SKILL_ID)).toBe('Grade 3 Context Cavern')
    const serialized = JSON.stringify(createDefaultQuestProgress(NOW))
    for (const forbidden of [
      'grade3AcademicVocabularyGuides',
      'speakingFrame',
      'writingFrame',
      'inappropriateUseExample',
      'correctAnswers',
      'selectionMode',
    ]) {
      expect(serialized).not.toContain(forbidden)
    }
    expect(containsExactOwnProperty(JSON.parse(serialized), 'reasonCode')).toBe(false)
  })

  test('keeps parent and print copy supportive while excluding raw target identifiers from print', () => {
    const dashboardSource = readFileSync('src/screens/parent/ParentDashboardScreen.tsx', 'utf8')
    const printSource = readFileSync('src/screens/parent/ParentPrintSummaryView.tsx', 'utf8')

    expect(dashboardSource).toContain("summary.benchmarkReference === 'ELA.3.V.1.1'")
    expect(dashboardSource).toContain('SUPPORTIVE_PRACTICE / DRAFT')
    expect(dashboardSource).toContain('does not establish productive vocabulary mastery')
    expect(printSource).toContain("skill.benchmarkReferences.includes('ELA.3.V.1.1')")
    expect(printSource).toContain('SUPPORTIVE_PRACTICE / DRAFT')
    expect(printSource).not.toContain('Target ID:')
    expect(printSource).not.toContain('Target: {item.relatedTargetId}')
  })
})

function containsExactOwnProperty(value: unknown, propertyName: string): boolean {
  if (Array.isArray(value)) return value.some((entry) => containsExactOwnProperty(entry, propertyName))
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return Object.prototype.hasOwnProperty.call(record, propertyName)
    || Object.values(record).some((entry) => containsExactOwnProperty(entry, propertyName))
}
