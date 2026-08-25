import { act, cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../src/App'
import { useQuestProgress } from '../src/app/useQuestProgress'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { createInitialSkillProgress } from '../src/domain/progression'
import { createDefaultQuestProgress, QUEST_PROGRESS_STORAGE_KEY } from '../src/persistence'

const NOW = '2026-08-25T07:30:00.000Z'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('Phase 7C4 integration and reconciled one-button journey', () => {
  test('registers only Claim and Evidence Court and derives final Phase 7C coverage', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(12)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-information-detectives-claim-evidence-court')).toHaveLength(1)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 34, activeLessonCount: 238, activePassageCount: 245,
      activeQuestionCount: 1368, activeSupportTargetCount: 943,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.4')).toMatchObject({
      coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [],
      contributingPackIds: ['g3-information-detectives-claim-evidence-court'],
      coveredPatterns: ['author-claim', 'reasons', 'evidence', 'claim-evidence-connection'],
    })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(9)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(6)
  })

  test('releases a persisted Unit 4 content boundary through Start Journey with no child menu', async () => {
    const state = createDefaultQuestProgress(NOW)
    for (const [skillId, difficulty] of [
      ['g2-word-forge-word-practice', 8], ['g2-story-scouts-prose', 4], ['g2-poetry-planet-poetry', 2],
      ['g2-information-detectives-reading', 5], ['g2-context-cavern-vocabulary', 4], ['g2-across-genres-reading', 4],
      ['g3-word-forge-word-analysis', 5], ['g3-story-scouts-prose', 4], ['g3-poetry-planet-poetry', 2],
    ] as const) state.skillProgress[skillId] = createInitialSkillProgress(skillId, difficulty, difficulty - 1)
    state.skillProgress['g3-information-detectives-reading'] = createInitialSkillProgress('g3-information-detectives-reading', 4, 3)
    state.plannedNextQuest = { status: 'content_needed', purpose: 'progression', skillId: 'g3-information-detectives-reading', difficulty: 4, reason: 'Old phase boundary.' }
    state.totalXp = 900
    state.totalStars = 30
    window.localStorage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(state))

    const journey = renderHook(() => useQuestProgress())
    let decision!: ReturnType<typeof journey.result.current.prepareJourneyLaunch>
    act(() => { decision = journey.result.current.prepareJourneyLaunch() })
    expect(decision).toMatchObject({ status: 'start', lesson: { unitId: 'g3-id-unit-4', difficulty: 4 } })
    journey.unmount()

    render(<App />)
    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
    const map = screen.getByRole('region', { name: 'Your Reading Journey' })
    expect(within(map).queryAllByRole('button')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Start Journey' }))
    expect(await screen.findByText('Recycling Station Court Checkpoint')).toBeTruthy()
    expect(screen.queryByText(/choose a world|choose a unit|another lesson is already open/i)).toBeNull()
  })

  test('keeps claim guides, passage text, answers, and internal IDs outside persisted progress', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress(NOW))
    expect(serialized).not.toContain('authorClaimGuides')
    expect(serialized).not.toContain('claimStatement')
    expect(serialized).not.toContain('correctAnswers')
    expect(serialized).not.toContain('Make Recycling Directions Easier to Follow')
    expect(serialized).not.toContain('g3-id-unit-4')
  })
})
