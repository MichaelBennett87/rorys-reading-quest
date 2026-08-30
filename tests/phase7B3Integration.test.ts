import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs/registry'
import { createDefaultQuestProgress } from '../src/persistence'

describe('Phase 7B3 production integration', () => {
  test('registers only Perspective Portal and derives the required totals and coverage state', () => {
    const packs = getActiveContentPacks()
    expect(packs.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(packs.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(18)
    expect(packs.filter((pack) => pack.manifest.packId === 'g3-story-scouts-perspective-portal')).toHaveLength(1)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40, activeLessonCount: 280, activePassageCount: 294,
      activeQuestionCount: 1614, activeSupportTargetCount: 1111,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.3')).toMatchObject({
      coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [],
      contributingPackIds: ['g3-story-scouts-perspective-portal'],
    })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.4')).toMatchObject({ coverageStatus: 'implemented' })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(14)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(2)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(0)
  })

  test('keeps parent and print wording honest and authored guide data out of persistence', () => {
    const parentSource = readFileSync('src/screens/parent/ParentDashboardScreen.tsx', 'utf8')
    expect(parentSource).toContain('ELA.3.R.1.3 has authored DRAFT Perspective Portal content')
    expect(parentSource).toContain('Learner mastery remains separate')
    expect(parentSource).toContain('does not claim narrator point-of-view mastery')
    expect(parentSource).not.toContain('FAST prediction')

    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T12:00:00.000Z'))
    expect(serialized).not.toContain('characterPerspectiveGuides')
    expect(serialized).not.toContain('perspectiveStatement')
    expect(serialized).not.toContain('correctAnswers')
    expect(serialized).not.toContain('The Marsh Platform')
  })
})
