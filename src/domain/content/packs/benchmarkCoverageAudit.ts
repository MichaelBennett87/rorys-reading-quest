import type { ContentPack } from './contentPackTypes'
import { STANDARD_VARIABLE_VOWEL_PATTERNS, collectObservedStandardPatterns } from './patternCoverage'

export type BenchmarkCoverageStatus = 'partial' | 'implemented'

export interface BenchmarkCoverageAudit {
  benchmarkReference: string
  expectedPatterns: string[]
  coveredPatterns: string[]
  missingPatterns: string[]
  contributingPackIds: string[]
  coverageStatus: BenchmarkCoverageStatus
  reviewStatus: 'DRAFT' | 'REVIEWED' | 'APPROVED'
}

export function buildBenchmarkCoverageAudit(
  packs: readonly ContentPack[],
  benchmarkReference: string,
): BenchmarkCoverageAudit {
  const contributingPacks = packs.filter((pack) => pack.manifest.benchmarkReferences.includes(benchmarkReference))
  const expectedPatterns = [...STANDARD_VARIABLE_VOWEL_PATTERNS]
  const coveredPatterns = new Set<string>()
  const contributingPackIds: string[] = []
  let reviewStatus: BenchmarkCoverageAudit['reviewStatus'] = 'DRAFT'

  for (const pack of contributingPacks) {
    contributingPackIds.push(pack.manifest.packId)
    if (pack.manifest.reviewStatus === 'REVIEWED' || pack.manifest.reviewStatus === 'APPROVED') {
      reviewStatus = pack.manifest.reviewStatus
    }
    for (const pattern of collectObservedStandardPatterns(pack)) {
      coveredPatterns.add(pattern)
    }
  }

  const coveredPatternList = expectedPatterns.filter((pattern) => coveredPatterns.has(pattern))
  const missingPatterns = expectedPatterns.filter((pattern) => !coveredPatterns.has(pattern))

  return {
    benchmarkReference,
    expectedPatterns,
    coveredPatterns: coveredPatternList,
    missingPatterns,
    contributingPackIds,
    coverageStatus: missingPatterns.length === 0 ? 'implemented' : 'partial',
    reviewStatus,
  }
}
