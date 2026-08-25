import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

describe('Phase 7C2 acceptance documentation and boundary', () => {
  test('records Central Idea Engine complete while Phase 7C3 remains unstarted', () => {
    const report = readFileSync('docs/PHASE_7C2_REPORT.md', 'utf8')
    const tasks = readFileSync('TASKS.md', 'utf8')
    expect(report).toContain('Starting local and remote SHA: `6ce92f0200eb689435febc03d57d6be7e99dd2a6`')
    expect(report).toContain('Phase 7C3 remains unstarted')
    expect(tasks).toContain('- [x] Phase 7C1: Structure Station')
    expect(tasks).toContain('- [x] Phase 7C2: Central Idea Engine')
    expect(tasks).toContain('- [x] Phase 7C3: Purpose Development Path')
    expect(tasks).toContain('- [x] Phase 7C')
    expect(tasks).toContain('- [ ] Phase 7D')
    expect(tasks).toContain('- [ ] Phase 7')
  })

  test('records implemented DRAFT R.2.2 coverage without approving later rows', () => {
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.2')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [] })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.3')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [] })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.4')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT' })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(10)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(5)
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
  })
})
