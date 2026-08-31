import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

describe('Phase 7C3 acceptance documentation and boundary', () => {
  test('records the P0 journey fix and Purpose Development Path while Phase 7C4 stays unstarted', () => {
    const report = readFileSync('docs/PHASE_7C3_REPORT.md', 'utf8')
    const hotfix = readFileSync('docs/CONTINUE_JOURNEY_STATE_RECOVERY.md', 'utf8')
    const tasks = readFileSync('TASKS.md', 'utf8')
    expect(report).toContain('af65679e9ea19072b51e59e3e36673d41b366345')
    expect(report).toContain('613d5fb fix: reconcile continue journey state')
    expect(hotfix).toContain('Five failed against the starting implementation')
    expect(tasks).toContain('- [x] Phase 7C3: Purpose Development Path')
    expect(tasks).toContain('- [x] Phase 7C4: Claim and Evidence Court')
    expect(tasks).toContain('- [x] Phase 7C')
    expect(tasks).toContain('- [x] Phase 7D')
    expect(tasks).toContain('- [x] Phase 7')
  })

  test('keeps R.2.3 implemented DRAFT, R.2.4 planned, and current totals exact', () => {
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.3')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT', missingPatterns: [] })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.4')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT' })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(14)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(2)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(0)
    expect(getActiveContentRegistryTotals()).toEqual({ activePackCount: 40, activeLessonCount: 280, activePassageCount: 294, activeQuestionCount: 1614, activeSupportTargetCount: 1111 })
  })
})
