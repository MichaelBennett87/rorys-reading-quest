import { act, cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { useQuestProgress } from '../src/app/useQuestProgress'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { createInitialSkillProgress } from '../src/domain/progression'
import { createDefaultQuestProgress, QUEST_PROGRESS_STORAGE_KEY } from '../src/persistence'
import { resolveFriendlySkillName } from '../src/screens/parent/parentDashboardView'

const NOW = '2026-08-30T13:30:00.000Z'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

function stateAtAuthorLens() {
  const state = createDefaultQuestProgress(NOW)
  for (const [skillId, difficulty] of [
    ['g2-word-forge-word-practice', 8], ['g2-story-scouts-prose', 4], ['g2-poetry-planet-poetry', 2],
    ['g2-information-detectives-reading', 5], ['g2-context-cavern-vocabulary', 4], ['g2-across-genres-reading', 4],
    ['g3-word-forge-word-analysis', 5], ['g3-story-scouts-prose', 4], ['g3-poetry-planet-poetry', 2], ['g3-information-detectives-reading', 5], ['g3-context-cavern-vocabulary', 4],
  ] as const) state.skillProgress[skillId] = createInitialSkillProgress(skillId, difficulty, difficulty - 1)
  state.skillProgress['g3-across-genres-reading'] = createInitialSkillProgress('g3-across-genres-reading', 3, 2)
  return state
}

describe('Phase 7D3 integration and reconciled one-button journey', () => {
  test('registers only Author Lens Tower and derives complete ELA.3.R.3.3 coverage', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(16)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-compare-castle-author-lens-tower')).toHaveLength(1)
    expect(getActiveContentRegistryTotals()).toEqual({ activePackCount: 38, activeLessonCount: 266, activePassageCount: 280, activeQuestionCount: 1532, activeSupportTargetCount: 1055 })
    const row = buildGrade3CoverageSnapshot().rows.find((entry) => entry.benchmarkReference === 'ELA.3.R.3.3')
    expect(row).toMatchObject({
      coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [],
      contributingPackIds: ['g3-compare-castle-author-lens-tower'],
      coveredPatterns: ['two-author-comparison', 'same-topic-or-theme', 'presentation-similarity', 'presentation-difference', 'evidence-from-both-texts'],
    })
  })

  test('retires stale Unit 3 content-needed, launches paired reading, and resumes one authoritative session', async () => {
    const state = stateAtAuthorLens()
    state.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: 'g3-across-genres-reading', difficulty: 3, reason: 'Old Unit 3 boundary.' }
    state.totalXp = 1491
    state.totalStars = 48
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))

    const journey = renderHook(() => useQuestProgress())
    let first!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    let repeated!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    act(() => { first = journey.result.current.prepareJourneyLaunch() })
    act(() => { repeated = journey.result.current.prepareJourneyLaunch() })
    expect(first).toMatchObject({ status: 'start', lesson: { unitId: 'g3-cg-unit-3', difficulty: 3 } })
    expect(repeated).toMatchObject({ status: 'resume', lesson: { unitId: 'g3-cg-unit-3', difficulty: 3 } })
    if (first.status === 'start' && repeated.status === 'resume') expect(repeated.session.sessionId).toBe(first.session.sessionId)
    expect(journey.result.current.progress).toMatchObject({ totalXp: 1491, totalStars: 48 })
    journey.unmount()

    render(<App />)
    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
    const map = screen.getByRole('region', { name: 'Your Reading Journey' })
    expect(within(map).queryAllByRole('button')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(await screen.findByText('Author Lens Tower Checkpoint: Pollinator Perspectives')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Text A: A Morning with Schoolyard Pollinators' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Text B: Planning Flowers for Pollinators' })).toBeTruthy()
    expect(screen.queryByText(/choose a world|choose a unit|choose a pair|another lesson is already open/i)).toBeNull()
  })

  test('keeps reporting friendly and all guide, source, answer, and P0 diagnostics out of persistence', () => {
    expect(resolveFriendlySkillName('g3-across-genres-reading')).toBe('Grade 3 Across-Genre Reading')
    const serialized = JSON.stringify(createDefaultQuestProgress(NOW))
    for (const forbidden of ['grade3AuthorComparisonGuides', 'synthesisStatement', 'textAEvidenceIds', 'correctAnswers', 'selectionMode', 'g3-cg-unit-3']) expect(serialized).not.toContain(forbidden)
  })
})
