import { describe, expect, test } from 'vitest'

import { contentPacks } from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'

describe('benchmark coverage audit', () => {
  test('selects benchmark-specific expected patterns for 1.3a', () => {
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3a')).toEqual(expect.objectContaining({
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
  })

  test('selects benchmark-specific expected patterns for 1.3b', () => {
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3b')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3b',
      expectedPatterns: ['two-syllable-short-vowels', 'two-syllable-long-vowels'],
      coveredPatterns: ['two-syllable-short-vowels', 'two-syllable-long-vowels'],
      missingPatterns: [],
      contributingPackIds: ['g2-word-forge-two-syllable-open-closed'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('reports partial coverage for 1.3c without inheriting 1.3a patterns', () => {
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3c')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3c',
      expectedPatterns: ['open-syllable', 'closed-syllable', 'consonant-le'],
      coveredPatterns: ['open-syllable', 'closed-syllable'],
      missingPatterns: ['consonant-le'],
      contributingPackIds: ['g2-word-forge-two-syllable-open-closed'],
      coverageStatus: 'partial',
      reviewStatus: 'DRAFT',
    }))
  })
})
