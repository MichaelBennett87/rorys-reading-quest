import { render, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import App from '../src/App'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { createDefaultQuestProgress } from '../src/persistence'

describe('Phase 7C3 integration and protected child journey', () => {
  test('registers only Purpose Development Path and derives the Grade 3 coverage snapshot', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(18)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-information-detectives-purpose-development-path')).toHaveLength(1)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40, activeLessonCount: 280, activePassageCount: 294,
      activeQuestionCount: 1614, activeSupportTargetCount: 1111,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.3')).toMatchObject({
      coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [],
      contributingPackIds: ['g3-information-detectives-purpose-development-path'],
      coveredPatterns: ['author-purpose', 'purpose-development', 'supporting-details', 'text-evidence'],
    })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(14)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(2)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(0)
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.4')).toMatchObject({ coverageStatus: 'implemented' })
  })

  test('keeps Home at exactly two controls with a display-only journey map', () => {
    render(<App />)
    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Start Journey', 'Parent Area'])
    const map = screen.getByRole('region', { name: 'Your Reading Journey' })
    expect(within(map).queryAllByRole('button')).toHaveLength(0)
    expect(within(map).queryAllByRole('link')).toHaveLength(0)
    expect(within(map).getAllByRole('article').every((article) => article.getAttribute('tabindex') === null)).toBe(true)
  })

  test('keeps guides, texts, precise purposes, and answers outside persisted progress', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T20:00:00.000Z'))
    expect(serialized).not.toContain('authorPurposeGuides')
    expect(serialized).not.toContain('precisePurposeStatement')
    expect(serialized).not.toContain('correctAnswers')
    expect(serialized).not.toContain('Water Waiting High Above Town')
  })
})
