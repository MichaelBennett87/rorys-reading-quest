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

    expect(readme).toContain('Phase 6.5 accepted')
    expect(readme).toContain('Phase 6.6 accepted')
    expect(readme).toContain('Grade 2 is frozen')
    expect(tasks).toContain('- [x] Phase 6.5: live UX, phonics, data, and content-integrity hardening')
    expect(tasks).toContain('- [x] Phase 6.6: dark experience, Sol Grade 2 audit, and final live acceptance')
    expect(tasks).toContain('- [ ] Phase 7: Grade 3 FAST-aligned content')
    expect(tasks).toContain('- [ ] Phase 7A1: Root Reactor')
    expect(phase66Report).toContain('PHASE 6.6 COMPLETE - LIVE ACCEPTANCE PASSED')
  })
})
