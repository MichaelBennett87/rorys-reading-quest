import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('Phase 7D4 acceptance documentation and boundary', () => {
  test('records Academic Word Workshop complete while later Context Cavern units remain unstarted', () => {
    const tasks = read('TASKS.md')
    const report = read('docs/PHASE_7D4_REPORT.md')
    const phase7D3 = read('docs/PHASE_7D3_REPORT.md')

    expect(tasks).toContain('    - [x] Phase 7D4: Academic Word Workshop Grade 3')
    expect(tasks).toContain('    - [x] Phase 7D5: Root Meaning Vault')
    expect(tasks).toContain('    - [x] Phase 7D6: Meaning Maze')
    expect(tasks).toContain('    - [ ] Phase 7D7: final Grade 3 audit')
    expect(tasks).toContain('  - [ ] Phase 7D: Grade 3 across genres and vocabulary')
    expect(report).toContain('Starting local SHA: `5045e2dc874d087c32ecbbe0a29ba866256611d1`')
    expect(report).toContain('Coverage: `SUPPORTIVE_PRACTICE / DRAFT`')
    expect(report).toContain('Vocabulary substitutions: zero')
    expect(report).toContain('Phase 7D5, Root Meaning Vault, Meaning Maze')
    expect(phase7D3).toContain('Final synchronized SHA: `5045e2dc874d087c32ecbbe0a29ba866256611d1`')
  })

  test('binds exact registry totals and the Grade 3 supportive-practice snapshot', () => {
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
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.V.1.1')).toMatchObject({
      coverageStatus: 'supportive_practice',
      reviewStatus: 'DRAFT',
      contributingPackIds: ['g3-context-cavern-academic-word-workshop'],
      missingPatterns: [],
    })
  })

  test('records the permanent truth and no-open-response boundary', () => {
    const truth = read('docs/content/ALL_ACTIVE_QUESTION_TRUTH_AUDIT.md')
    const coverage = read('docs/content/GRADE_3_V_1_1_SUPPORTIVE_PRACTICE_AUDIT.md')
    const semantic = read('docs/content/GRADE_3_ACADEMIC_WORD_WORKSHOP_SEMANTIC_AUDIT.md')

    expect(truth).toContain('1,532 current PASS ledger records across 38 packs')
    expect(truth).toContain('Adversarial grading rejects 20,154 submissions')
    expect(coverage).toContain('no-open-response-scoring')
    expect(coverage).toContain('cannot establish independent productive speaking or writing mastery')
    expect(semantic).toContain('Deterministic semantic audit issues remaining: zero')
  })

  test('preserves P0, privacy, and one-button journey documentation', () => {
    const privacy = read('docs/PRIVACY_AND_SAFETY.md')
    const journey = read('docs/CONTINUE_JOURNEY_STATE_RECOVERY.md')
    const p0 = read('docs/P0_PLANNER_LIVENESS_HOTFIX_REPORT.md')
    const agents = read('AGENTS.md')

    expect(privacy).toContain('Phase 7D4 privacy boundary')
    expect(journey).toContain('Phase 7D4 boundary regression')
    expect(p0).toContain('Phase 7D4 preservation reconciliation')
    expect(agents).toContain(
      'Substantial work should use three to four bounded subagents when useful, with explicit, non-overlapping scopes.',
    )
    expect(agents).toContain(
      'The primary agent owns integration decisions, production edits, Git operations, verification, pushes, and deployments.',
    )
  })
})
