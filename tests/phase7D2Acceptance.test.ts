import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('Phase 7D2 acceptance documentation and boundary', () => {
  test('preserves the historical Summary Stronghold boundary while current Phase 7D work continues', () => {
    const tasks = read('TASKS.md')
    const report = read('docs/PHASE_7D2_REPORT.md')
    const phase7D1 = read('docs/PHASE_7D1_REPORT.md')
    expect(tasks).toContain('    - [x] Phase 7D2: Summary Stronghold')
    expect(tasks).toContain('    - [x] Phase 7D3: Author Lens Tower')
    expect(report).toContain('Starting local SHA: `e48e2e381889ef4d1eb971f6d51a570a33a04a81`')
    expect(report).toContain('Phase 7D3 Author Lens Tower: unstarted')
    expect(phase7D1).toContain('Final synchronized SHA: `e48e2e381889ef4d1eb971f6d51a570a33a04a81`')
  })

  test('binds exact current registry, coverage, truth, and privacy facts', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 38,
      activeLessonCount: 266,
      activePassageCount: 280,
      activeQuestionCount: 1532,
      activeSupportTargetCount: 1055,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(12)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(2)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(2)
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.3.2')).toMatchObject({
      coverageStatus: 'implemented', reviewStatus: 'DRAFT',
      contributingPackIds: ['g3-compare-castle-summary-stronghold'], missingPatterns: [],
    })
    const truth = read('docs/content/ALL_ACTIVE_QUESTION_TRUTH_AUDIT.md')
    expect(truth).toContain('1,450 current PASS ledger records across 36 packs')
    expect(read('docs/PRIVACY_AND_SAFETY.md')).toContain('Schema version 1')
    expect(read('docs/CONTINUE_JOURNEY_STATE_RECOVERY.md')).toContain('Phase 7D2 boundary regression')
  })
})
