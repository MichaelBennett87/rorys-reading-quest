import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

describe('Phase 7B4 acceptance documentation and boundary', () => {
  test('records Phase 7B complete while Phase 7C remains unstarted', () => {
    const report = readFileSync('docs/PHASE_7B4_REPORT.md', 'utf8')
    const tasks = readFileSync('TASKS.md', 'utf8')
    expect(report).toContain('Starting local and remote SHA: `e11414e67b8887b9420e6a12775bb687b23125a0`')
    expect(report).toContain('Phase 7C remains unstarted.')
    expect(tasks).toContain('- [x] Phase 7B4 - Poem Form Observatory')
    expect(tasks).toContain('- [x] Phase 7B')
    expect(tasks).toContain('- [ ] Phase 7C')
    expect(tasks).toContain('- [ ] Phase 7')
  })

  test('keeps every Grade 3 row DRAFT and makes only ELA.3.R.1.4 newly implemented', () => {
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.4')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT' })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.1')).toMatchObject({ coverageStatus: 'planned' })
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
  })
})
