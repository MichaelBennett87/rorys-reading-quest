import { render, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import App from '../src/App'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { createDefaultQuestProgress } from '../src/persistence'

describe('Phase 7C1 integration and protected child journey', () => {
  test('registers only Structure Station and derives the Grade 3 coverage snapshot', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(15)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-information-detectives-structure-station')).toHaveLength(1)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 37, activeLessonCount: 259, activePassageCount: 273,
      activeQuestionCount: 1491, activeSupportTargetCount: 1027,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.1')).toMatchObject({
      coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [],
      contributingPackIds: ['g3-information-detectives-structure-station'],
      coveredPatterns: ['text-features-contribute-to-meaning', 'chronology', 'comparison-structure', 'cause-effect-structure'],
    })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(12)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(3)
  })

  test('keeps Home at exactly two controls with a display-only journey map', () => {
    render(<App />)
    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
    const map = screen.getByRole('region', { name: 'Your Reading Journey' })
    expect(within(map).queryAllByRole('button')).toHaveLength(0)
    expect(within(map).queryAllByRole('link')).toHaveLength(0)
    expect(within(map).getAllByRole('article').every((article) => article.getAttribute('tabindex') === null)).toBe(true)
  })

  test('keeps guides, full texts, and answers outside persisted progress', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T16:00:00.000Z'))
    expect(serialized).not.toContain('informationalStructureGuides')
    expect(serialized).not.toContain('organizationalSummary')
    expect(serialized).not.toContain('correctAnswers')
    expect(serialized).not.toContain('A Day at the Weather Station')
  })
})
