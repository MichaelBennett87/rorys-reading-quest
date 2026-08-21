import type { ContentPack } from './contentPackTypes'
import type { ContentReviewStatus } from '../types'
import { collectObservedStandardPatterns } from './patternCoverage'

export type BenchmarkReviewStatus = Exclude<ContentReviewStatus, 'RETIRED'>

const BENCHMARK_PATTERN_CATALOG: Record<string, readonly string[]> = {
  'ELA.2.F.1.3a': ['oo', 'ea', 'ou', 'oi', 'oy', 'ow'],
  'ELA.2.F.1.3b': ['two-syllable-short-vowels', 'two-syllable-long-vowels'],
  'ELA.2.F.1.3c': ['open-syllable', 'closed-syllable', 'consonant-le'],
  'ELA.2.F.1.3d': ['common-prefixes', 'common-suffixes'],
  'ELA.2.F.1.3e': ['silent-letter-combinations'],
}

const REVIEW_ORDER: Record<BenchmarkReviewStatus, number> = {
  DRAFT: 0,
  REVIEWED: 1,
  APPROVED: 2,
}

export function getExpectedBenchmarkPatterns(benchmarkReference: string): string[] {
  return [...(BENCHMARK_PATTERN_CATALOG[benchmarkReference] ?? [])]
}

export function getClaimedBenchmarkPatterns(pack: ContentPack, benchmarkReference: string): string[] {
  const expected = new Set(getExpectedBenchmarkPatterns(benchmarkReference))
  return pack.manifest.coveredPatterns.filter((pattern) => expected.has(pattern)).sort(localeSort)
}

export function collectObservedBenchmarkPatterns(pack: ContentPack, benchmarkReference: string): string[] {
  const expected = new Set(getExpectedBenchmarkPatterns(benchmarkReference))
  if (expected.size === 0) return []

  const observed = new Set<string>()

  for (const pattern of pack.manifest.coveredPatterns) {
    if (expected.has(pattern)) observed.add(pattern)
  }

  if (benchmarkReference === 'ELA.2.F.1.3a') {
    for (const pattern of collectObservedStandardPatterns(pack)) {
      if (expected.has(pattern)) observed.add(pattern)
    }
  }

  for (const question of pack.questions) {
    for (const tag of question.tags ?? []) {
      if (expected.has(tag)) observed.add(tag)
    }
  }

  return [...observed].sort(localeSort)
}

export function combineBenchmarkReviewStatus(statuses: readonly ContentReviewStatus[]): BenchmarkReviewStatus {
  if (statuses.length === 0) return 'DRAFT'
  return [...statuses]
    .map(normalizeBenchmarkReviewStatus)
    .sort((left, right) => REVIEW_ORDER[left] - REVIEW_ORDER[right])[0] ?? 'DRAFT'
}

export function isKnownBenchmarkReference(benchmarkReference: string): boolean {
  return benchmarkReference in BENCHMARK_PATTERN_CATALOG
}

function localeSort(left: string, right: string): number {
  return left.localeCompare(right)
}

function normalizeBenchmarkReviewStatus(status: ContentReviewStatus): BenchmarkReviewStatus {
  return status === 'RETIRED' ? 'DRAFT' : status
}
