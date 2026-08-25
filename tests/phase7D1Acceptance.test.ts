import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { getActiveContentRegistryTotals } from '../src/domain/content/packs/registry'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

describe('Phase 7D1 acceptance documentation', () => {
  test('records the bounded Figurative Fortress completion without starting Phase 7D2', () => {
    const tasks = readFileSync('TASKS.md', 'utf8')
    const report = readFileSync('docs/PHASE_7D1_REPORT.md', 'utf8')
    const audit = readFileSync('docs/content/GRADE_3_R_3_1_COVERAGE_AUDIT.md', 'utf8')

    expect(tasks).toContain('- [x] Phase 7D1: Figurative Fortress')
    expect(tasks).toContain('- [ ] Phase 7D2: Summary Stronghold')
    expect(report).toContain('Phase 7D remains incomplete')
    expect(report).toContain('The next bounded scope is Phase 7D2 Summary Stronghold')
    expect(audit).toContain('`ELA.3.R.3.1` is `IMPLEMENTED / DRAFT`')
  })

  test('binds current registry and coverage facts to the documented snapshot', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 35,
      activeLessonCount: 245,
      activePassageCount: 252,
      activeQuestionCount: 1409,
      activeSupportTargetCount: 971,
    })

    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(10)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(5)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'partial')).toHaveLength(0)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'missing')).toHaveLength(0)
    expect(snapshot.rows.filter((row) => row.reviewStatus === 'APPROVED')).toHaveLength(0)
  })
})
