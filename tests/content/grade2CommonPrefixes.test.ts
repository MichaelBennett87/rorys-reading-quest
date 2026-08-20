import { describe, expect, test } from 'vitest'

import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import {
  contentPackAudit,
  contentPacks,
  sampleContent,
  validateContent,
} from '../../src/domain/content'
import { getLessonCandidates } from '../../src/domain/lesson'

describe('grade 2 common-prefix pack', () => {
  test('the new pack is registered and remains internally coherent', () => {
    const pack = contentPacks.find((entry) => entry.manifest.packId === 'g2-word-forge-common-prefixes')

    expect(pack).toBeDefined()
    expect(pack?.manifest).toEqual(expect.objectContaining({
      packId: 'g2-word-forge-common-prefixes',
      packTitle: 'Grade 2 Word Forge: Common Prefixes',
      worldId: 'word-forge',
      unitId: 'wg-unit-3',
      primarySkillId: 'g2-word-forge-word-practice',
      benchmarkReferences: ['ELA.2.F.1.3d'],
      partialBenchmarkCoverage: 'Common prefixes only; common suffixes remain deferred to Phase 6C2.',
      difficultyRange: [4, 5],
      contentVersion: 'g2-wf-common-prefixes-r0.1.0',
      reviewStatus: 'DRAFT',
      coveredPatterns: [
        'common-prefixes',
        'prefix-un',
        'prefix-re',
        'prefix-pre',
        'prefix-dis',
        'prefix-mis',
      ],
    }))
    expect(pack?.lessons).toHaveLength(7)
    expect(pack?.passages).toHaveLength(7)
    expect(pack?.questions).toHaveLength(41)
    expect(pack?.passages.every((passage) => (passage.wordSupportTargets ?? []).length >= 3 && (passage.wordSupportTargets ?? []).length <= 5)).toBe(true)
    expect(validateContent(sampleContent)).toEqual([])
    expect(contentPackAudit).toHaveLength(0)
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3d')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3d',
      expectedPatterns: ['common-prefixes', 'common-suffixes'],
      coveredPatterns: ['common-prefixes', 'common-suffixes'],
      missingPatterns: [],
      contributingPackIds: [
        'g2-word-forge-common-prefixes',
        'g2-word-forge-common-suffixes',
      ],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('the common-prefix pack adds the expected active lesson mix', () => {
    const activeLessons = getLessonCandidates().filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-common-prefixes-'))

    expect(activeLessons).toHaveLength(7)
    expect(activeLessons.filter((candidate) => candidate.difficulty === 4)).toHaveLength(2)
    expect(activeLessons.filter((candidate) => candidate.difficulty === 5)).toHaveLength(5)
    expect(activeLessons.map((candidate) => candidate.lessonId)).toEqual([
      'lesson-word-forge-common-prefixes-guided-find-the-base',
      'lesson-word-forge-common-prefixes-guided-join-the-parts',
      'lesson-word-forge-common-prefixes-guided-un-re-pre',
      'lesson-word-forge-common-prefixes-guided-dis-mis',
      'lesson-word-forge-common-prefixes-checkpoint-a',
      'lesson-word-forge-common-prefixes-checkpoint-b',
      'lesson-word-forge-common-prefixes-checkpoint-c',
    ])
  })
})
