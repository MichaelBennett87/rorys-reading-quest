import { act, cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { useQuestProgress } from '../src/app/useQuestProgress'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { createInitialSkillProgress } from '../src/domain/progression'
import { createDefaultQuestProgress, QUEST_PROGRESS_STORAGE_KEY } from '../src/persistence'
import { resolveFriendlySkillName } from '../src/screens/parent/parentDashboardView'

const NOW = '2026-08-25T11:30:00.000Z'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('Phase 7D2 integration and reconciled one-button journey', () => {
  test('registers only Summary Stronghold and derives complete ELA.3.R.3.2 coverage', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(18)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-compare-castle-summary-stronghold')).toHaveLength(1)
    expect(getActiveContentRegistryTotals()).toEqual({ activePackCount: 40, activeLessonCount: 280, activePassageCount: 294, activeQuestionCount: 1614, activeSupportTargetCount: 1111 })
    const row = buildGrade3CoverageSnapshot().rows.find((entry) => entry.benchmarkReference === 'ELA.3.R.3.2')
    expect(row).toMatchObject({
      coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [],
      contributingPackIds: ['g3-compare-castle-summary-stronghold'],
      coveredPatterns: ['literary-summary', 'plot', 'theme', 'informational-summary', 'central-idea', 'relevant-details', 'important-vs-minor'],
    })
  })

  test('retires stale Unit 2 content-needed and resumes the one authoritative session', async () => {
    const state = createDefaultQuestProgress(NOW)
    for (const [skillId, difficulty] of [
      ['g2-word-forge-word-practice', 8], ['g2-story-scouts-prose', 4], ['g2-poetry-planet-poetry', 2],
      ['g2-information-detectives-reading', 5], ['g2-context-cavern-vocabulary', 4], ['g2-across-genres-reading', 4],
      ['g3-word-forge-word-analysis', 5], ['g3-story-scouts-prose', 4], ['g3-poetry-planet-poetry', 2], ['g3-information-detectives-reading', 5], ['g3-context-cavern-vocabulary', 4],
    ] as const) state.skillProgress[skillId] = createInitialSkillProgress(skillId, difficulty, difficulty - 1)
    state.skillProgress['g3-across-genres-reading'] = createInitialSkillProgress('g3-across-genres-reading', 2, 1)
    state.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: 'g3-across-genres-reading', difficulty: 2, reason: 'Old Unit 2 boundary.' }
    state.totalXp = 1040
    state.totalStars = 35
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))

    const journey = renderHook(() => useQuestProgress())
    let first!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    let repeated!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    act(() => { first = journey.result.current.prepareJourneyLaunch() })
    act(() => { repeated = journey.result.current.prepareJourneyLaunch() })
    expect(first).toMatchObject({ status: 'start', lesson: { unitId: 'g3-cg-unit-2', difficulty: 2 } })
    expect(repeated).toMatchObject({ status: 'resume', lesson: { unitId: 'g3-cg-unit-2', difficulty: 2 } })
    if (first.status === 'start' && repeated.status === 'resume') expect(repeated.session.sessionId).toBe(first.session.sessionId)
    expect(journey.result.current.progress).toMatchObject({ totalXp: 1040, totalStars: 35 })
    journey.unmount()

    render(<App />)
    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
    const map = screen.getByRole('region', { name: 'Your Reading Journey' })
    expect(within(map).queryAllByRole('button')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(await screen.findByText('Summary Stronghold Checkpoint: Plot in a Nutshell')).toBeTruthy()
    expect(screen.queryByText(/choose a world|choose a unit|another lesson is already open/i)).toBeNull()
  })

  test('uses friendly reporting identity and never persists authored summary content', () => {
    expect(resolveFriendlySkillName('g3-across-genres-reading')).toBe('Grade 3 Across-Genre Reading')
    const serialized = JSON.stringify(createDefaultQuestProgress(NOW))
    expect(serialized).not.toContain('summaryGuides')
    expect(serialized).not.toContain('modelSummary')
    expect(serialized).not.toContain('centralIdeaStatement')
    expect(serialized).not.toContain('correctAnswers')
    expect(serialized).not.toContain('g3-cg-unit-2')
  })
})
