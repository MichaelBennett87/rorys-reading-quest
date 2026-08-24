import { describe, expect, test } from 'vitest'

import { buildPurposeDevelopmentGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { getSequentialWorldRoadmapByTrackId, getTrackBySkillId } from '../src/domain/curriculum'
import { buildReviewQueueIdentity, sameReviewQueueIdentity } from '../src/domain/progression/reviewQueueAffinity'

describe('Purpose Development Path architecture', () => {
  test('reuses Grade 3 Information Detectives at unit 3 without activating unit 4', () => {
    expect(getTrackBySkillId('g3-information-detectives-reading')).toMatchObject({
      trackId: 'g3-information-detectives-reading', worldId: 'information-detectives', gradeBand: 3,
      entryUnitId: 'g3-id-unit-1', completionDifficulty: 5, prerequisiteTrackIds: ['g2-information-detectives-reading'], status: 'active',
    })
    const units = getSequentialWorldRoadmapByTrackId('g3-information-detectives-reading')?.units ?? []
    expect(units[2]).toMatchObject({ unitId: 'g3-id-unit-3', title: 'Purpose Development Path', activeDifficulty: 3, completionDifficulty: 4 })
    expect(units[3]).toMatchObject({ unitId: 'g3-id-unit-4', title: 'Claim and Evidence Court', plannedPhase: '7C4' })
    expect(getExpectedBenchmarkPatterns('ELA.3.R.2.3')).toEqual(['author-purpose', 'purpose-development', 'supporting-details', 'text-evidence'])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-information-detectives-purpose-development-path', contentVersion: 'g3-id-purpose-development-r0.1.0' },
      passages: [], lessons: [],
    } as unknown as ContentPack
    expect(buildPurposeDevelopmentGuideAudit(pack)).toEqual([{
      code: 'missing_author_purpose_guide', itemIdentifier: 'g3-information-detectives-purpose-development-path',
      message: 'Purpose Development Path requires authored purpose-development guides.',
    }])
  })

  test('keeps all informational review identities unit and version affine', () => {
    const structure = buildReviewQueueIdentity({ skillId: 'g3-information-detectives-reading', difficulty: 1, unitId: 'g3-id-unit-1', contentVersion: 'g3-id-structure-station-r0.1.0' })
    const central = buildReviewQueueIdentity({ skillId: 'g3-information-detectives-reading', difficulty: 2, unitId: 'g3-id-unit-2', contentVersion: 'g3-id-central-idea-r0.1.0' })
    const purpose = buildReviewQueueIdentity({ skillId: 'g3-information-detectives-reading', difficulty: 3, unitId: 'g3-id-unit-3', contentVersion: 'g3-id-purpose-development-r0.1.0' })
    const grade2 = buildReviewQueueIdentity({ skillId: 'g2-information-detectives-reading', difficulty: 3, unitId: 'id-unit-3', contentVersion: 'g2-id-purpose-path-r0.1.0' })
    expect(sameReviewQueueIdentity(structure, purpose)).toBe(false)
    expect(sameReviewQueueIdentity(central, purpose)).toBe(false)
    expect(sameReviewQueueIdentity(grade2, purpose)).toBe(false)
  })
})
