import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { curriculumTracks, getSequentialWorldRoadmapByTrackId } from '../src/domain/curriculum'
import { buildCharacterDevelopmentGuideAudit, type ContentPack } from '../src/domain/content/packs'

describe('Character Arc Camp architecture', () => {
  test('reconciles the final Phase 7A4 synchronized SHA before Phase 7B1', () => {
    const report = readFileSync(resolve(process.cwd(), 'docs/PHASE_7A4_REPORT.md'), 'utf8')
    expect(report).toContain('Final synchronized local and remote SHA: `90d2afcd51efe19312e3acc0634f05b4ccb549d0`')
    expect(report).toContain('`90d2afc docs: fix phase 7a4 report formatting`')
  })

  test('activates only the existing Grade 3 Story Scouts track and preserves the roadmap boundary', () => {
    expect(curriculumTracks.find((track) => track.trackId === 'g3-story-scouts-prose')).toMatchObject({
      status: 'active',
      skillId: 'g3-story-scouts-prose',
      worldId: 'story-scouts',
      entryUnitId: 'g3-ss-unit-1',
      completionDifficulty: 4,
      prerequisiteTrackIds: ['g2-story-scouts-prose'],
    })
    expect(curriculumTracks.filter((track) => track.gradeBand === 3 && track.status === 'active').map((track) => track.trackId)).toEqual([
      'g3-word-forge-foundations',
      'g3-story-scouts-prose',
      'g3-poetry-planet',
      'g3-information-detectives-reading',
    ])
    expect(getSequentialWorldRoadmapByTrackId('g3-story-scouts-prose')?.units.map((unit) => unit.unitId)).toEqual([
      'g3-ss-unit-1', 'g3-ss-unit-2', 'g3-ss-unit-3',
    ])
  })

  test('returns structured guide issues without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-story-scouts-character-arc-camp', contentVersion: 'g3-ss-character-arc-r0.1.0' },
      passages: [],
      lessons: [],
    } as unknown as ContentPack
    expect(buildCharacterDevelopmentGuideAudit(pack)).toEqual([{
      code: 'missing_character_development_guide',
      itemIdentifier: 'g3-story-scouts-character-arc-camp',
      message: 'Character Arc Camp requires authored character-development guides.',
    }])
  })
})
