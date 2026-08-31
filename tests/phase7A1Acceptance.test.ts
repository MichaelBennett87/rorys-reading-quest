import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

function readRepoFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('Phase 7A documentation acceptance', () => {
  test('preserves Root Reactor history while project status advances through Phase 7A4', () => {
    const readme = readRepoFile('README.md')
    const tasks = readRepoFile('TASKS.md')
    const report = readRepoFile('docs/PHASE_7A1_REPORT.md')
    const review = readRepoFile('docs/content/GRADE_3_WORD_FORGE_ROOT_REACTOR_REVIEW.md')
    const coverage = readRepoFile('docs/content/GRADE_3_F_1_3_PARTIAL_COVERAGE_AUDIT.md')
    const semantic = readRepoFile('docs/content/GRADE_3_ROOT_REACTOR_SEMANTIC_AUDIT.md')
    const phase7A4Report = readRepoFile('docs/PHASE_7A4_REPORT.md')
    const phase7AFinalAudit = readRepoFile('docs/content/GRADE_3_PHASE_7A_FINAL_AUDIT.md')
    const fluencyAudit = readRepoFile('docs/content/GRADE_3_F_1_4_FLUENCY_SUPPORT_AUDIT.md')

    expect(readme).toContain('Phase 7A1 complete')
    expect(readme).toContain('ELA.3.F.1.3 has partial authored DRAFT coverage')
    expect(readme).toContain('no Grade 3 benchmark is fully implemented or APPROVED')
    expect(tasks).toContain('- [x] Phase 7A1: Root Reactor')
    expect(tasks).toContain('- [x] Phase 7A2: Suffix Shifter')
    expect(tasks).toContain('- [x] Phase 7A3: Multisyllable Mountain')
    expect(tasks).toContain('- [x] Phase 7A4: Fluency Flight Grade 3')
    expect(tasks).toContain('- [x] Phase 7A: Grade 3 foundations and transition')
    expect(tasks).toContain('- [x] Phase 7: Grade 3 FAST-aligned content')
    expect(report).toContain('Starting local SHA: `3cfb43ebba6d9485e6161be57e59df910725f263`')
    expect(report).toContain('`41e90f3` `feat: add root reactor architecture`')
    expect(report).toContain('`4215aec` `feat: add grade 3 root reactor pack`')
    expect(report).toContain('`41f0c73` `feat: integrate grade 3 root reactor progression`')
    expect(report).toContain('57 files, 372 tests passed')
    expect(review).toContain('DRAFT - human educational approval pending')
    expect(review).toContain('Greek-primary targets (12)')
    expect(review).toContain('Latin-primary targets (8)')
    expect(review).toContain('Affix-primary targets (8)')
    expect(coverage).toContain('Coverage status: `partial`')
    expect(coverage).toContain('`ELA.3.V.1.2` claim; that benchmark remains planned')
    expect(semantic).toContain('Questions reviewed: 41')
    expect(semantic).toContain('Deterministic issues after correction: 0')
    expect(phase7A4Report).toContain('Coverage result: SUPPORTIVE_PRACTICE / DRAFT')
    expect(phase7A4Report).toContain('1,040')
    expect(phase7AFinalAudit).toContain('Phase 7A: COMPLETE')
    expect(phase7AFinalAudit).toContain('Phase 7B: UNSTARTED')
    expect(fluencyAudit).toContain('Learner oral mastery claim: none')
    expect(report).not.toContain('Final synchronized SHA:')
  })
})
