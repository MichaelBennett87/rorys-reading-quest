import { describe, expect, test } from 'vitest'

import { benchmarkCoverageAudit, contentPackAudit, contentPacks, sampleContent } from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import { getLessonById, getLessonCandidates, getLessonForUnit } from '../../src/domain/lesson'

describe('grade 2 content pack registry', () => {
  test('registered packs aggregate into the existing content export without mutating source packs', () => {
    const packsSnapshot = structuredClone(contentPacks)
    const sampleSnapshot = structuredClone(sampleContent)

    expect(new Set(contentPacks.map((pack) => pack.manifest.packId)).size).toBe(contentPacks.length)
    expect(contentPacks.map((pack) => pack.manifest.packId)).toEqual([
      'g2-word-forge-variable-vowels-oo-ea',
      'g2-word-forge-variable-vowels-ou-oi-oy-ow',
      'g2-word-forge-two-syllable-open-closed',
      'g2-word-forge-consonant-le-integrated',
      'g2-word-forge-common-prefixes',
      'legacy-word-forge-development-pack',
    ])
    expect(contentPackAudit).toHaveLength(0)
    expect(benchmarkCoverageAudit).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3a',
      expectedPatterns: ['oo', 'ea', 'ou', 'oi', 'oy', 'ow'],
      coveredPatterns: ['oo', 'ea', 'ou', 'oi', 'oy', 'ow'],
      missingPatterns: [],
      contributingPackIds: [
        'g2-word-forge-variable-vowels-oo-ea',
        'g2-word-forge-variable-vowels-ou-oi-oy-ow',
      ],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3d')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3d',
      expectedPatterns: ['common-prefixes', 'common-suffixes'],
      coveredPatterns: ['common-prefixes'],
      missingPatterns: ['common-suffixes'],
      contributingPackIds: ['g2-word-forge-common-prefixes'],
      coverageStatus: 'partial',
      reviewStatus: 'DRAFT',
    }))
    expect(contentPacks).toEqual(packsSnapshot)
    expect(sampleContent).toEqual(sampleSnapshot)
  })

  test('legacy content remains resolvable but is excluded from fresh selection', () => {
    expect(getLessonById('lesson-word-forge-vowel-voyage-a').lesson?.selectionStatus).toBe('legacy')
    expect(getLessonCandidates().map((candidate) => candidate.lessonId)).not.toEqual(expect.arrayContaining([
      'lesson-word-forge-vowel-voyage-a',
      'lesson-word-forge-vowel-voyage-b',
      'lesson-word-forge-vowel-voyage-c',
      'lesson-word-forge-building-block',
    ]))
  })

  test('the active unit resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-1')

    expect(result.lesson?.lessonId).toBe('lesson-word-forge-oo-ea-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })

  test('the new syllable summit unit resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-2')

    expect(result.lesson?.lessonId).toBe('lesson-word-forge-syllable-summit-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })

  test('the prefix power unit resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-3')

    expect(result.lesson?.lessonId).toBe('lesson-word-forge-common-prefixes-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })
})
