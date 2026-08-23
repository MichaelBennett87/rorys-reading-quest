import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

function readRepoFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('Phase 7A0 acceptance reconciliation', () => {
  test('records the accepted Grade 2 hardening gates without starting Grade 3 content', () => {
    const readme = readRepoFile('README.md')
    const tasks = readRepoFile('TASKS.md')
    const phase66Report = readRepoFile('docs/PHASE_6_6_REPORT.md')
    const phase7A0Report = readRepoFile('docs/PHASE_7A0_REPORT.md')
    const roadmap = readRepoFile('docs/GRADE_3_CURRICULUM_ROADMAP.md')
    const baselineAudit = readRepoFile('docs/content/GRADE_3_BASELINE_BENCHMARK_AUDIT.md')
    const fastAlignment = readRepoFile('docs/content/GRADE_3_FAST_BLUEPRINT_ALIGNMENT.md')

    expect(readme).toContain('Phase 6.5 accepted')
    expect(readme).toContain('Phase 6.6 accepted')
    expect(readme).toContain('Grade 2 is frozen')
    expect(tasks).toContain('- [x] Phase 6.5: live UX, phonics, data, and content-integrity hardening')
    expect(tasks).toContain('- [x] Phase 6.6: dark experience, Sol Grade 2 audit, and final live acceptance')
    expect(tasks).toContain('- [ ] Phase 7: Grade 3 FAST-aligned content')
    expect(tasks).toContain('- [x] Phase 7A0: Grade 3 architecture, standards map, FAST blueprint, and progression bridge')
    expect(tasks).toContain('- [ ] Phase 7A1: Root Reactor')
    expect(phase66Report).toContain('PHASE 6.6 COMPLETE - LIVE ACCEPTANCE PASSED')
    expect(readme).toContain('Phase 7A0 is complete')
    expect(readme).toContain('no Grade 3 production curriculum exists')
    expect(phase7A0Report).toContain('Active Grade 3 packs/lessons/texts/questions/support targets: `0 / 0 / 0 / 0 / 0`')
    expect(roadmap).toContain('The six tracks contain eighteen planned units.')
    expect(baselineAudit).toContain('- Planned: 16')
    expect(fastAlignment).toContain('Exactly thirteen benchmark references are represented.')
  })
})
