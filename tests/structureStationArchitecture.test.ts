import { describe, expect, test } from 'vitest'

import { buildInformationalStructureGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { getSequentialWorldRoadmapByTrackId, getTrackBySkillId } from '../src/domain/curriculum'

describe('Structure Station architecture', () => {
  test('activates only the authored Grade 3 informational track with its Grade 2 prerequisite', () => {
    expect(getTrackBySkillId('g3-information-detectives-reading')).toMatchObject({
      trackId: 'g3-information-detectives-reading', worldId: 'information-detectives', gradeBand: 3,
      entryUnitId: 'g3-id-unit-1', curriculumOrder: 140, worldChapterOrder: 2,
      initialDifficulty: 1, initialLastMasteredDifficulty: 0, completionDifficulty: 5,
      prerequisiteTrackIds: ['g2-information-detectives-reading'], status: 'active',
    })
    expect(getSequentialWorldRoadmapByTrackId('g3-information-detectives-reading')?.units[0]).toMatchObject({
      unitId: 'g3-id-unit-1', title: 'Structure Station', activeDifficulty: 1, completionDifficulty: 2,
    })
    expect(getExpectedBenchmarkPatterns('ELA.3.R.2.1')).toEqual([
      'text-features-contribute-to-meaning', 'chronology', 'comparison-structure', 'cause-effect-structure',
    ])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-information-detectives-structure-station', contentVersion: 'g3-id-structure-station-r0.1.0' },
      passages: [], lessons: [],
    } as unknown as ContentPack
    expect(buildInformationalStructureGuideAudit(pack)).toEqual([{
      code: 'missing_informational_structure_guide', itemIdentifier: 'g3-information-detectives-structure-station',
      message: 'Structure Station requires authored informational-structure guides.',
    }])
  })
})
