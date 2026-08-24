import { describe, expect, test } from 'vitest'

import { buildPoemFormGuideAudit, type ContentPack } from '../src/domain/content/packs'
import { getExpectedBenchmarkPatterns } from '../src/domain/content/packs/benchmarkPatternCatalog'
import { getSequentialWorldRoadmapByTrackId, getTrackBySkillId } from '../src/domain/curriculum'

describe('Poem Form Observatory architecture', () => {
  test('activates only the planned Grade 3 poetry track and retains its Grade 2 prerequisite', () => {
    expect(getTrackBySkillId('g3-poetry-planet-poetry')).toMatchObject({
      trackId: 'g3-poetry-planet', worldId: 'poetry-planet', gradeBand: 3,
      entryUnitId: 'g3-pp-unit-1', curriculumOrder: 130, worldChapterOrder: 2,
      initialDifficulty: 1, initialLastMasteredDifficulty: 0, completionDifficulty: 2,
      prerequisiteTrackIds: ['g2-poetry-planet'], status: 'active',
    })
    expect(getSequentialWorldRoadmapByTrackId('g3-poetry-planet')?.units).toMatchObject([
      { unitId: 'g3-pp-unit-1', title: 'Poem Form Observatory', activeDifficulty: 1, completionDifficulty: 2 },
    ])
    expect(getExpectedBenchmarkPatterns('ELA.3.R.1.4')).toEqual(['free-verse', 'rhymed-verse', 'haiku', 'limerick'])
  })

  test('returns a structured missing-guide issue without throwing', () => {
    const pack = {
      manifest: { packId: 'g3-poetry-planet-poem-form-observatory', contentVersion: 'g3-pp-poem-form-r0.1.0' },
      passages: [], lessons: [],
    } as unknown as ContentPack
    expect(buildPoemFormGuideAudit(pack)).toEqual([{
      code: 'missing_poem_form_guide', itemIdentifier: 'g3-poetry-planet-poem-form-observatory',
      message: 'Poem Form Observatory requires authored poem-form guides.',
    }])
  })
})
