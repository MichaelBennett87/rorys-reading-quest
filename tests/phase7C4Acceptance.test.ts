import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

describe('Phase 7C4 acceptance documentation and boundary', () => {
  test('records Claim and Evidence Court and completes Phase 7C without starting Phase 7D', () => {
    const report = readFileSync('docs/PHASE_7C4_REPORT.md', 'utf8')
    const finalAudit = readFileSync('docs/content/GRADE_3_PHASE_7C_FINAL_AUDIT.md', 'utf8')
    const hotfix = readFileSync('docs/CONTINUE_JOURNEY_STATE_RECOVERY.md', 'utf8')
    const tasks = readFileSync('TASKS.md', 'utf8')
    expect(report).toContain('28a30619a83f25fd564ede2a86943870d678231c')
    expect(report).toContain('8a62ab7 feat: integrate claim evidence court progression')
    expect(finalAudit).toContain('Phase 7C is complete')
    expect(hotfix).toContain('Phase 7C4 boundary regression')
    expect(tasks).toContain('- [x] Phase 7C4: Claim and Evidence Court')
    expect(tasks).toContain('- [x] Phase 7C')
    expect(tasks).toContain('- [x] Phase 7D1: Figurative Fortress')
    expect(tasks).toContain('- [ ] Phase 7')
  })

  test('keeps R.2.4 implemented DRAFT with exact current totals and Phase 7D planned', () => {
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.2.4')).toMatchObject({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      missingPatterns: [],
    })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.3.1')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT' })
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(12)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(3)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 37,
      activeLessonCount: 259,
      activePassageCount: 273,
      activeQuestionCount: 1491,
      activeSupportTargetCount: 1027,
    })
  })
})
