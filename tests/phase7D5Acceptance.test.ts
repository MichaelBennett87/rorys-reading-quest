import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('Phase 7D5 acceptance documentation and boundary', () => {
  test('records Root Meaning Vault complete while Meaning Maze remains unstarted', () => {
    const tasks = read('TASKS.md')
    const report = read('docs/PHASE_7D5_REPORT.md')
    const phase7D4 = read('docs/PHASE_7D4_REPORT.md')

    expect(tasks).toContain('    - [x] Phase 7D5: Root Meaning Vault')
    expect(tasks).toContain('    - [x] Phase 7D6: Meaning Maze')
    expect(tasks).toContain('    - [x] Phase 7D7: final Grade 3 audit')
    expect(tasks).toContain('  - [x] Phase 7D: Grade 3 across genres and vocabulary')
    expect(report).toContain('Starting local SHA: `5dc0f670d170ed4691891cab1a2e0ffe9378084e`')
    expect(report).toContain('Coverage: `IMPLEMENTED / DRAFT`')
    expect(report).toContain('Vocabulary substitutions: zero')
    expect(report).toContain('Phase 7D6 Meaning Maze remains unstarted')
    expect(phase7D4).toContain('Final synchronized SHA: `5dc0f670d170ed4691891cab1a2e0ffe9378084e`')
  })

  test('binds exact registry totals and the Grade 3 coverage snapshot', () => {
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
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.V.1.2')).toMatchObject({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      contributingPackIds: ['g3-context-cavern-root-meaning-vault'],
      missingPatterns: [],
    })
  })

  test('records the permanent morpheme, truth, and scope gates', () => {
    const truth = read('docs/content/ALL_ACTIVE_QUESTION_TRUTH_AUDIT.md')
    const coverage = read('docs/content/GRADE_3_V_1_2_COVERAGE_AUDIT.md')
    const semantic = read('docs/content/GRADE_3_ROOT_MEANING_VAULT_SEMANTIC_AUDIT.md')

    expect(truth).toContain('1,614 active questions and 1,614 current PASS ledger records across 40 packs')
    expect(truth).toContain('rejects 20,682 adversarial submissions')
    for (const pattern of ['greek-roots', 'latin-roots', 'base-words', 'affixes', 'unfamiliar-word-meaning']) {
      expect(coverage).toContain(`\`${pattern}\``)
    }
    expect(semantic).toContain('Deterministic semantic audit issues remaining: zero')
    expect(semantic).toContain('surface `aque`, canonical `aqua`')
    expect(semantic).toContain('Meaning Maze drift: zero')
  })

  test('preserves P0, privacy, and one-button journey documentation', () => {
    const privacy = read('docs/PRIVACY_AND_SAFETY.md')
    const journey = read('docs/CONTINUE_JOURNEY_STATE_RECOVERY.md')
    const p0 = read('docs/P0_PLANNER_LIVENESS_HOTFIX_REPORT.md')

    expect(privacy).toContain('Phase 7D5 privacy and accessibility boundary')
    expect(journey).toContain('Phase 7D5 boundary regression')
    expect(p0).toContain('Phase 7D5 preservation reconciliation')
    expect(p0).toContain('174 active-track skill/difficulty/purpose combinations')
    expect(`${privacy}\n${journey}`).toContain('Home still has exactly Start Journey and Parent Area')
    expect(`${privacy}\n${journey}`).not.toContain('Meaning Maze production content')
  })
})
