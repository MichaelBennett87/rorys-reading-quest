import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

function readRepoFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('Phase 7A0 acceptance reconciliation', () => {
  test('preserves the zero-content Phase 7A0 checkpoint while advancing project status to Root Reactor', () => {
    const readme = readRepoFile('README.md')
    const tasks = readRepoFile('TASKS.md')
    const phase66Report = readRepoFile('docs/PHASE_6_6_REPORT.md')
    const phase7A0Report = readRepoFile('docs/PHASE_7A0_REPORT.md')
    const roadmap = readRepoFile('docs/GRADE_3_CURRICULUM_ROADMAP.md')
    const baselineAudit = readRepoFile('docs/content/GRADE_3_BASELINE_BENCHMARK_AUDIT.md')
    const fastAlignment = readRepoFile('docs/content/GRADE_3_FAST_BLUEPRINT_ALIGNMENT.md')

    expect(readme).toContain('Phase 6 complete')
    expect(readme).toContain('Grade 2 frozen')
    expect(tasks).toContain('- [x] Phase 6.5: live UX, phonics, data, and content-integrity hardening')
    expect(tasks).toContain('- [x] Phase 6.6: dark experience, Sol Grade 2 audit, and final live acceptance')
    expect(tasks).toContain('- [x] Phase 7: Grade 3 FAST-aligned content')
    expect(tasks).toContain('- [x] Phase 7A0: Grade 3 architecture, standards map, FAST blueprint, and progression bridge')
    expect(tasks).toContain('- [x] Phase 7A1: Root Reactor')
    expect(phase66Report).toContain('PHASE 6.6 COMPLETE - LIVE ACCEPTANCE PASSED')
    expect(readme).toContain('Phase 7A0 complete')
    expect(readme).toContain('Root Reactor is the first Grade 3 production pack')
    expect(phase7A0Report).toContain('Active Grade 3 packs/lessons/texts/questions/support targets: `0 / 0 / 0 / 0 / 0`')
    expect(phase7A0Report).toContain('Final local and remote SHA: `3cfb43ebba6d9485e6161be57e59df910725f263`')
    expect(phase7A0Report).toContain('54 test files and 359 tests passed')
    expect(roadmap).toContain('The six tracks contain eighteen planned units.')
    expect(baselineAudit).toContain('- Planned: 16')
    expect(fastAlignment).toContain('Exactly thirteen benchmark references are represented.')
  })
})
