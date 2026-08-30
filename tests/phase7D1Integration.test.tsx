import { act, cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { useQuestProgress } from '../src/app/useQuestProgress'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { createInitialSkillProgress } from '../src/domain/progression'
import { createDefaultQuestProgress, QUEST_PROGRESS_STORAGE_KEY } from '../src/persistence'
import { resolveFriendlySkillName } from '../src/screens/parent/parentDashboardView'

const NOW = '2026-08-25T10:30:00.000Z'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('Phase 7D1 integration and reconciled one-button journey', () => {
  test('registers only Figurative Fortress and derives the Grade 3 coverage snapshot', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(16)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-compare-castle-figurative-fortress')).toHaveLength(1)
    expect(getActiveContentRegistryTotals()).toEqual({ activePackCount: 38, activeLessonCount: 266, activePassageCount: 280, activeQuestionCount: 1532, activeSupportTargetCount: 1055 })
    const row = buildGrade3CoverageSnapshot().rows.find((entry) => entry.benchmarkReference === 'ELA.3.R.3.1')
    expect(row).toMatchObject({
      coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [],
      contributingPackIds: ['g3-compare-castle-figurative-fortress'],
      coveredPatterns: ['metaphors', 'personification', 'hyperbole', 'figurative-meaning', 'literal-vs-nonliteral'],
    })
  })

  test('retires stale Phase 7C content-needed and launches Figurative Fortress without a child menu', async () => {
    const state = createDefaultQuestProgress(NOW)
    for (const [skillId, difficulty] of [
      ['g2-word-forge-word-practice', 8], ['g2-story-scouts-prose', 4], ['g2-poetry-planet-poetry', 2],
      ['g2-information-detectives-reading', 5], ['g2-context-cavern-vocabulary', 4], ['g2-across-genres-reading', 4],
      ['g3-word-forge-word-analysis', 5], ['g3-story-scouts-prose', 4], ['g3-poetry-planet-poetry', 2], ['g3-information-detectives-reading', 5], ['g3-context-cavern-vocabulary', 4],
    ] as const) state.skillProgress[skillId] = createInitialSkillProgress(skillId, difficulty, difficulty - 1)
    state.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: 'g3-information-detectives-reading', difficulty: 5, reason: 'Old Phase 7C boundary.' }
    state.totalXp = 960
    state.totalStars = 32
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))

    const journey = renderHook(() => useQuestProgress())
    let decision!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    act(() => { decision = journey.result.current.prepareJourneyLaunch() })
    expect(decision).toMatchObject({ status: 'start', lesson: { unitId: 'g3-cg-unit-1', difficulty: 1 } })
    expect(journey.result.current.progress).toMatchObject({ totalXp: 960, totalStars: 32 })
    expect(journey.result.current.progress.skillProgress['g3-context-cavern-vocabulary']).toMatchObject({ currentDifficulty: 4 })
    journey.unmount()

    render(<App />)
    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
    const map = screen.getByRole('region', { name: 'Your Reading Journey' })
    expect(within(map).queryAllByRole('button')).toHaveLength(0)
    expect(within(map).getByText('Grade 3 Across Genres: Figurative Fortress active')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(await screen.findByText('Figurative Fortress Checkpoint: Stormy Signals')).toBeTruthy()
    expect(screen.queryByText(/choose a world|choose a unit|another lesson is already open/i)).toBeNull()
  })

  test('uses friendly reporting identity and never persists authored figurative content', () => {
    expect(resolveFriendlySkillName('g3-across-genres-reading')).toBe('Grade 3 Across-Genre Reading')
    const serialized = JSON.stringify(createDefaultQuestProgress(NOW))
    expect(serialized).not.toContain('figurativeLanguageGuides')
    expect(serialized).not.toContain('figurativeMeaning')
    expect(serialized).not.toContain('correctAnswers')
    expect(serialized).not.toContain('The supply closet was a sleeping dragon.')
    expect(serialized).not.toContain('g3-cg-unit-1')
  })
})
