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

  test('selects benchmark-specific expected patterns for 1.3e', () => {
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3e')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3e',
      expectedPatterns: ['silent-letter-combinations'],
      coveredPatterns: ['silent-letter-combinations'],
      missingPatterns: [],
      contributingPackIds: ['g2-word-forge-silent-letter-combinations'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('selects benchmark-specific expected patterns for 1.1', () => {
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.1.1')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.1.1',
      expectedPatterns: ['plot-structure', 'setting', 'characters', 'sequence-of-events'],
      coveredPatterns: ['plot-structure', 'setting', 'characters', 'sequence-of-events'],
      missingPatterns: [],
      contributingPackIds: ['g2-story-scouts-plot-structure-elements'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('reports implemented coverage for 1.3c across both consonant-le packs', () => {
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3c')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3c',
      expectedPatterns: ['open-syllable', 'closed-syllable', 'consonant-le'],
      coveredPatterns: ['open-syllable', 'closed-syllable', 'consonant-le'],
      missingPatterns: [],
      contributingPackIds: [
        'g2-word-forge-consonant-le-integrated',
        'g2-word-forge-two-syllable-open-closed',
      ],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('reports partial coverage for 1.3d and keeps the least mature review status', () => {
    const prefixPack = contentPacks.find((pack) => pack.manifest.packId === 'g2-word-forge-common-prefixes')
    expect(prefixPack).toBeDefined()

    const draftPack = structuredClone(prefixPack!)
    draftPack.manifest.packId = 'synthetic-common-prefixes-draft'
    draftPack.manifest.reviewStatus = 'DRAFT'

    const reviewedPack = structuredClone(prefixPack!)
    reviewedPack.manifest.packId = 'synthetic-common-prefixes-reviewed'
    reviewedPack.manifest.reviewStatus = 'REVIEWED'

    const approvedPack = structuredClone(prefixPack!)
    approvedPack.manifest.packId = 'synthetic-common-prefixes-approved'
    approvedPack.manifest.reviewStatus = 'APPROVED'

    expect(buildBenchmarkCoverageAudit([draftPack, approvedPack], 'ELA.2.F.1.3d')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3d',
      expectedPatterns: ['common-prefixes', 'common-suffixes'],
      coveredPatterns: ['common-prefixes'],
      missingPatterns: ['common-suffixes'],
      coverageStatus: 'partial',
      reviewStatus: 'DRAFT',
    }))

    expect(buildBenchmarkCoverageAudit([reviewedPack, approvedPack], 'ELA.2.F.1.3d')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3d',
      expectedPatterns: ['common-prefixes', 'common-suffixes'],
      coveredPatterns: ['common-prefixes'],
      missingPatterns: ['common-suffixes'],
      coverageStatus: 'partial',
      reviewStatus: 'REVIEWED',
    }))
  })
})
