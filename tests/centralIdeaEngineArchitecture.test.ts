import { describe, expect, test } from 'vitest'

import { buildCentralIdeaEngineGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { getSequentialWorldRoadmapByTrackId, getTrackBySkillId } from '../src/domain/curriculum'

describe('Central Idea Engine architecture', () => {
  test('reuses the active Grade 3 informational track at unit 2', () => {
    expect(getTrackBySkillId('g3-information-detectives-reading')).toMatchObject({
      trackId: 'g3-information-detectives-reading', worldId: 'information-detectives', gradeBand: 3,
      entryUnitId: 'g3-id-unit-1', completionDifficulty: 5, prerequisiteTrackIds: ['g2-information-detectives-reading'], status: 'active',
    })
    expect(getSequentialWorldRoadmapByTrackId('g3-information-detectives-reading')?.units[1]).toMatchObject({
      unitId: 'g3-id-unit-2', title: 'Central Idea Engine', activeDifficulty: 2, completionDifficulty: 3,
    })
    expect(getExpectedBenchmarkPatterns('ELA.3.R.2.2')).toEqual([
      'central-idea', 'relevant-details', 'details-support-central-idea', 'evidence-across-sections',
    ])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-information-detectives-central-idea-engine', contentVersion: 'g3-id-central-idea-r0.1.0' },
      passages: [], lessons: [],
    } as unknown as ContentPack
    expect(buildCentralIdeaEngineGuideAudit(pack)).toEqual([{
      code: 'missing_central_idea_guide', itemIdentifier: 'g3-information-detectives-central-idea-engine',
      message: 'Central Idea Engine requires authored central-idea guides.',
    }])
  })
})
