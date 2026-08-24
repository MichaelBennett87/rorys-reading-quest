import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

describe('Phase 7A3 parent and print reporting boundary', () => {
  test('reports implemented DRAFT curriculum coverage separately from learner mastery', () => {
    const row = buildGrade3CoverageSnapshot().rows.find((entry) => entry.benchmarkReference === 'ELA.3.F.1.3')
    expect(row).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [] })
    expect(row?.notes.join(' ')).toContain('does not claim learner mastery')
    expect(buildGrade3CoverageSnapshot().rows.find((entry) => entry.benchmarkReference === 'ELA.3.F.1.4')?.coverageStatus).toBe('planned')
    expect(buildGrade3CoverageSnapshot().rows.find((entry) => entry.benchmarkReference === 'ELA.3.V.1.2')?.coverageStatus).toBe('planned')
  })

  test('keeps the parent and print copy explicit and privacy-safe', () => {
    const dashboardSource = readFileSync('src/screens/parent/ParentDashboardScreen.tsx', 'utf8')
    const printSource = readFileSync('src/screens/parent/ParentPrintSummaryView.tsx', 'utf8')
    expect(dashboardSource).toContain('Curriculum coverage implemented')
    expect(dashboardSource).toContain('separate from learner mastery')
    expect(printSource).toContain('Curriculum coverage: Implemented. Review status: DRAFT.')
    expect(printSource).toContain('not learner mastery')
    for (const forbidden of ['predicted FAST score', 'oral decoding score', 'global grade diagnosis']) {
      expect(`${dashboardSource}\n${printSource}`).not.toContain(forbidden)
    }
  })
})
