import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum'
import { createDefaultQuestProgress } from '../src/persistence'

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('Phase 7B2 acceptance documentation and coverage', () => {
  test('preserves the bounded historical Phase 7B2 report after Phase 7B3 lands', () => {
    const report = read('docs/PHASE_7B2_REPORT.md')
    const tasks = read('TASKS.md')
    expect(report).toContain('Starting local and remote SHA: `6255b41bf5eece960331afca4678ebd1b5e87cea`')
    expect(report).toContain('Phase 7B3 Perspective Portal Grade 3 is next and remains unstarted.')
    expect(tasks).toContain('- [x] Phase 7B1 - Character Arc Camp')
    expect(tasks).toContain('- [x] Phase 7B2 - Theme Development Trail')
    expect(tasks).toContain('- [x] Phase 7B3 - Perspective Portal Grade 3')
    expect(tasks).toContain('- [ ] Phase 7B4 - Poem Form Observatory')
    expect(tasks).toContain('- [ ] Phase 7B')
    expect(tasks).toContain('- [ ] Phase 7')
  })

  test('keeps registry totals and Grade 3 coverage exact', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 29,
      activeLessonCount: 203,
      activePassageCount: 210,
      activeQuestionCount: 1163,
      activeSupportTargetCount: 803,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows).toHaveLength(16)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(4)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(11)
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.2')).toMatchObject({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      contributingPackIds: ['g3-story-scouts-theme-development-trail'],
      coveredPatterns: ['theme', 'theme-development', 'supporting-details', 'plot-theme-connection'],
      missingPatterns: [],
    })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.3')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT' })
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
  })

  test('preserves frozen content, persistence, parent-print privacy, and Pages boundaries', () => {
    const activePacks = getActiveContentPacks()
    expect(activePacks.filter((pack) => pack.manifest.gradeBand === 2)).toHaveLength(22)
    expect(activePacks.filter((pack) => pack.manifest.gradeBand === 3)).toHaveLength(7)
    expect(activePacks.filter((pack) => pack.manifest.packId === 'g3-story-scouts-theme-development-trail')).toHaveLength(1)
    expect(activePacks.some((pack) => pack.manifest.packId === 'g3-story-scouts-perspective-portal')).toBe(true)

    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T12:00:00.000Z'))
    expect(serialized).not.toContain('themeDevelopmentGuides')
    expect(serialized).not.toContain('supportedTheme')

    const parentSource = read('src/screens/parent/ParentDashboardScreen.tsx')
    expect(parentSource).toContain("ELA.3.R.1.2")
    expect(parentSource).toContain('Theme Development Trail')
    expect(parentSource).not.toContain('themeDevelopmentGuides')
    expect(parentSource).not.toContain('submittedAnswer')
    expect(parentSource).not.toContain('correctAnswer')

    const viteConfig = read('vite.config.ts')
    expect(viteConfig).toContain("base: '/rorys-reading-quest/'")
  })
})
