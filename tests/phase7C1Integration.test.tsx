import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import App from '../src/App'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { createDefaultQuestProgress } from '../src/persistence'

describe('Phase 7C1 integration and protected child journey', () => {
  test('registers only Structure Station and derives the Grade 3 coverage snapshot', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(18)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-information-detectives-structure-station')).toHaveLength(1)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40, activeLessonCount: 280, activePassageCount: 294,
      activeQuestionCount: 1611, activeSupportTargetCount: 1111,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.1')).toMatchObject({
      coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [],
      contributingPackIds: ['g3-information-detectives-structure-station'],
      coveredPatterns: ['text-features-contribute-to-meaning', 'chronology', 'comparison-structure', 'cause-effect-structure'],
    })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(14)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(2)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(0)
  })

  test('opens directly into one current question without child navigation', () => {
    render(<App />)
    expect(screen.getByText(/Question 1 of/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Start Journey|Parent Area/i })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Your Reading Journey' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Question action' }).querySelectorAll('button')).toHaveLength(1)
  })

  test('keeps guides, full texts, and answers outside persisted progress', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T16:00:00.000Z'))
    expect(serialized).not.toContain('informationalStructureGuides')
    expect(serialized).not.toContain('organizationalSummary')
    expect(serialized).not.toContain('correctAnswers')
    expect(serialized).not.toContain('A Day at the Weather Station')
  })
})
