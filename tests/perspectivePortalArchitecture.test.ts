import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

import { getSequentialWorldRoadmapByTrackId } from '../src/domain/curriculum'
import { buildCharacterPerspectiveGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'

describe('Perspective Portal Grade 3 architecture', () => {
  test('reconciles the final Phase 7B2 synchronized SHA before Phase 7B3', () => {
    const report = readFileSync(resolve(process.cwd(), 'docs/PHASE_7B2_REPORT.md'), 'utf8')
    expect(report).toContain('Final synchronized local and remote SHA: `c0d36e71b2543854069840c58e72fc8efcd8bbbb`')
    expect(report).toContain('`c0d36e7` - `docs: complete phase 7b2 review`')
  })

  test('preserves the Story Scouts boundary and registers the complete perspective pattern contract', () => {
    expect(getSequentialWorldRoadmapByTrackId('g3-story-scouts-prose')?.units).toMatchObject([
      { unitId: 'g3-ss-unit-1', activeDifficulty: 1, completionDifficulty: 2 },
      { unitId: 'g3-ss-unit-2', activeDifficulty: 2, completionDifficulty: 3 },
      { unitId: 'g3-ss-unit-3', activeDifficulty: 3, completionDifficulty: 4, lockedMessage: 'Complete Theme Development Trail to unlock Perspective Portal Grade 3.' },
    ])
    expect(getExpectedBenchmarkPatterns('ELA.3.R.1.3')).toEqual([
      'character-perspective', 'different-character-perspectives', 'similar-character-perspectives', 'perspective-evidence', 'perspective-change',
    ])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-story-scouts-perspective-portal', contentVersion: 'g3-ss-perspective-r0.1.0' },
      passages: [], lessons: [],
    } as unknown as ContentPack
    expect(buildCharacterPerspectiveGuideAudit(pack)).toEqual([{
      code: 'missing_character_perspective_guide',
      itemIdentifier: 'g3-story-scouts-perspective-portal',
      message: 'Perspective Portal requires authored character-perspective guides.',
    }])
  })
})
