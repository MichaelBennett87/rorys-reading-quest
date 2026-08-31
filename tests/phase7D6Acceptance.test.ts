import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('Phase 7D6 acceptance documentation and boundary', () => {
  test('records Meaning Maze complete while the final Grade 3 audit remains unstarted', () => {
    const tasks = read('TASKS.md')
    const report = read('docs/PHASE_7D6_REPORT.md')

    expect(tasks).toContain('    - [x] Phase 7D6: Meaning Maze')
    expect(tasks).toContain('    - [x] Phase 7D7: final Grade 3 audit')
    expect(report).toContain('8410b400a78de36895b8040e347e85e5b021a79b')
    expect(report).toContain('ELA.3.V.1.3 is `IMPLEMENTED / DRAFT`')
    expect(report).toContain('Phase 7D remains incomplete pending Phase 7D7')
  })

  test('binds current registry and Grade 3 coverage facts', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40,
      activeLessonCount: 280,
      activePassageCount: 294,
      activeQuestionCount: 1614,
      activeSupportTargetCount: 1111,
    })

    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(14)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(2)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(0)
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
    expect(snapshot.rows.filter((row) => row.reviewStatus === 'APPROVED')).toHaveLength(0)
  })

  test('records permanent truth, local-reference, privacy, and child-journey boundaries', () => {
    expect(read('docs/PRODUCT_SPEC.md')).toContain('Phase 7D6 Meaning Maze product boundary')
    expect(read('docs/ARCHITECTURE.md')).toContain('Phase 7D6 Meaning Maze architecture')
    expect(read('docs/ADAPTIVE_ENGINE.md')).toContain('Phase 7D6 Meaning Maze progression')
    expect(read('docs/PRIVACY_AND_SAFETY.md')).toContain('Phase 7D6 privacy and accessibility boundary')
    expect(read('docs/P0_PLANNER_LIVENESS_HOTFIX_REPORT.md')).toContain('Phase 7D6 preservation reconciliation')
    expect(read('docs/CONTINUE_JOURNEY_STATE_RECOVERY.md')).toContain('Phase 7D6 boundary regression')
  })

  test('records the final Phase 7D6 truth metrics without starting Phase 7D7 curriculum', () => {
    const audit = read('docs/content/ALL_ACTIVE_QUESTION_TRUTH_AUDIT.md')
    const progress = read('docs/content/question-truth-ledger/AUDIT_PROGRESS.md')
    const semantic = read('docs/content/GRADE_3_MEANING_MAZE_SEMANTIC_AUDIT.md')

    expect(audit).toContain('1,614 current PASS ledger records across 40 packs')
    expect(progress).toContain('- Active questions: 1614')
    expect(progress).toContain('- Grading-contract assertions: 26622')
    expect(semantic).toContain('False positives: 0')
    expect(semantic).toContain('Stale fingerprints: 0')
  })
})
