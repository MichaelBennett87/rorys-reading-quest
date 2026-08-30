import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('Phase 7D3 acceptance documentation and boundary', () => {
  test('records Author Lens Tower complete while Grade 3 Context Cavern remains unstarted', () => {
    const tasks = read('TASKS.md')
    const report = read('docs/PHASE_7D3_REPORT.md')
    const phase7D2 = read('docs/PHASE_7D2_REPORT.md')

    expect(tasks).toContain('    - [x] Phase 7D3: Author Lens Tower')
    expect(tasks).toContain('    - [ ] Phase 7D4: Academic Word Workshop Grade 3')
    expect(tasks).toContain('  - [ ] Phase 7D: Grade 3 across genres and vocabulary')
    expect(report).toContain('Starting local SHA: `5fb733b0010b63e9b8b92d37c7e24cf04ab07426`')
    expect(report).toContain('Phase 7D4 Grade 3 Context Cavern: unstarted')
    expect(phase7D2).toContain('Final synchronized Phase 7D2 SHA: `61c67932fd38f5130950768c058e41c4905590ef`')
    expect(phase7D2).toContain('Final synchronized P0 SHA: `5fb733b0010b63e9b8b92d37c7e24cf04ab07426`')
  })

  test('binds the exact registry and Grade 3 coverage snapshot', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 37,
      activeLessonCount: 259,
      activePassageCount: 273,
      activeQuestionCount: 1491,
      activeSupportTargetCount: 1027,
    })

    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(12)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(3)
    expect(snapshot.rows.filter((row) => row.reviewStatus === 'APPROVED')).toHaveLength(0)
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.3.3')).toMatchObject({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      contributingPackIds: ['g3-compare-castle-author-lens-tower'],
      missingPatterns: [],
    })
  })

  test('binds truth, privacy, and protected journey documentation', () => {
    const truth = read('docs/content/ALL_ACTIVE_QUESTION_TRUTH_AUDIT.md')
    const privacy = read('docs/PRIVACY_AND_SAFETY.md')
    const journey = read('docs/CONTINUE_JOURNEY_STATE_RECOVERY.md')
    const p0 = read('docs/P0_PLANNER_LIVENESS_HOTFIX_REPORT.md')

    expect(truth).toContain('1,491 current PASS ledger records across 37 packs')
    expect(truth).toContain('18,135 adversarial submissions')
    expect(privacy).toContain('Schema version 1')
    expect(privacy).toContain('Phase 7D3 privacy boundary')
    expect(journey).toContain('Phase 7D3 boundary regression')
    expect(p0).toContain('Phase 7D3 preservation reconciliation')
  })
})
