import type { ContentPack } from './contentPackTypes'
import {
  collectObservedBenchmarkPatterns,
  combineBenchmarkReviewStatus,
  getExpectedBenchmarkPatterns,
} from './benchmarkPatternCatalog'

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
  const contributingPacks = packs
    .filter((pack) => pack.manifest.benchmarkReferences.includes(benchmarkReference))
    .slice()
    .sort((left, right) => left.manifest.packId.localeCompare(right.manifest.packId))
  const expectedPatterns = getExpectedBenchmarkPatterns(benchmarkReference)
  const coveredPatterns = new Set<string>()
  const contributingPackIds = contributingPacks.map((pack) => pack.manifest.packId)
  const reviewStatus = combineBenchmarkReviewStatus(contributingPacks.map((pack) => pack.manifest.reviewStatus))

  for (const pack of contributingPacks) {
    for (const pattern of collectObservedBenchmarkPatterns(pack, benchmarkReference)) {
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
