import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

import { getSequentialWorldRoadmapByTrackId } from '../src/domain/curriculum'
import { buildThemeDevelopmentGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'

describe('Theme Development Trail architecture', () => {
  test('reconciles the final Phase 7B1 synchronized SHA before Phase 7B2', () => {
    const report = readFileSync(resolve(process.cwd(), 'docs/PHASE_7B1_REPORT.md'), 'utf8')
    expect(report).toContain('Final synchronized local and remote SHA: `6255b41bf5eece960331afca4678ebd1b5e87cea`')
    expect(report).toContain('`6255b41 docs: complete phase 7b1 review`')
  })

  test('preserves the Story Scouts unit boundary and registers the Grade 3 theme patterns', () => {
    expect(getSequentialWorldRoadmapByTrackId('g3-story-scouts-prose')?.units).toMatchObject([
      { unitId: 'g3-ss-unit-1', activeDifficulty: 1, completionDifficulty: 2 },
      { unitId: 'g3-ss-unit-2', activeDifficulty: 2, completionDifficulty: 3 },
      { unitId: 'g3-ss-unit-3', activeDifficulty: 3, completionDifficulty: 4 },
    ])
    expect(getExpectedBenchmarkPatterns('ELA.3.R.1.2')).toEqual([
      'theme', 'theme-development', 'supporting-details', 'plot-theme-connection',
    ])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-story-scouts-theme-development-trail', contentVersion: 'g3-ss-theme-development-r0.1.0' },
      passages: [],
      lessons: [],
    } as unknown as ContentPack
    expect(buildThemeDevelopmentGuideAudit(pack)).toEqual([{
      code: 'missing_theme_development_guide',
      itemIdentifier: 'g3-story-scouts-theme-development-trail',
      message: 'Theme Development Trail requires authored theme-development guides.',
    }])
  })
})
