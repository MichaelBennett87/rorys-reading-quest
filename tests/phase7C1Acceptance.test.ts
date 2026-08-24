import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

describe('Phase 7C1 acceptance documentation and boundary', () => {
  test('records Structure Station complete while Phase 7C2 remains unstarted', () => {
    const report = readFileSync('docs/PHASE_7C1_REPORT.md', 'utf8')
    const tasks = readFileSync('TASKS.md', 'utf8')
    expect(report).toContain('Starting local and remote SHA: `fe36b117f94d936ed1f1d24c8f24ab405ce6e17a`')
    expect(report).toContain('Phase 7C2 remains unstarted')
    expect(tasks).toContain('- [x] Phase 7C1: Structure Station')
    expect(tasks).toContain('- [ ] Phase 7C2: Central Idea Engine')
    expect(tasks).toContain('- [ ] Phase 7C')
    expect(tasks).toContain('- [ ] Phase 7')
  })

  test('records implemented DRAFT R.2.1 coverage without approving or advancing later rows', () => {
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.1')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [] })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.2')).toMatchObject({ coverageStatus: 'planned', reviewStatus: 'DRAFT' })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(6)
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
  })
})
