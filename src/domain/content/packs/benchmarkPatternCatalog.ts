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
  'ELA.2.R.1.1': ['plot-structure', 'setting', 'characters', 'sequence-of-events'],
  'ELA.2.R.1.2': ['theme-identification', 'theme-explanation'],
  'ELA.2.R.1.3': ['character-perspective-identification', 'different-character-perspectives'],
  'ELA.2.R.1.4': ['rhyme-scheme-identification', 'rhyme-scheme-notation'],
  'ELA.2.R.2.1': ['informational-text-features', 'feature-meaning'],
  'ELA.2.R.2.2': ['central-idea', 'relevant-details'],
  'ELA.2.R.2.3': ['informational-author-purpose'],
  'ELA.2.R.2.4': ['opinion', 'supporting-evidence'],
  'ELA.2.R.3.1': ['similes', 'idioms', 'alliteration'],
  'ELA.2.R.3.2': ['literary-retell', 'informational-retell'],
  'ELA.2.R.3.3': ['compare-contrast-important-details', 'same-topic-or-theme'],
  'ELA.2.V.1.1': ['academic-vocabulary-use'],
  'ELA.2.V.1.2': ['base-words', 'affixes'],
  'ELA.2.V.1.3': ['context-clues', 'word-relationships', 'reference-materials', 'background-knowledge'],
  'ELA.3.F.1.3': ['greek-latin-root-decoding', 'affix-decoding', 'derivational-suffix-decoding', 'part-of-speech-change', 'multisyllabic-decoding'],
  'ELA.3.R.1.1': ['character-development', 'plot-linked-change', 'actions-dialogue-thoughts', 'beginning-middle-end-development', 'text-evidence'],
  'ELA.3.R.1.2': ['theme', 'theme-development', 'supporting-details', 'plot-theme-connection'],
  'ELA.3.R.1.3': ['character-perspective', 'different-character-perspectives', 'similar-character-perspectives', 'perspective-evidence', 'perspective-change'],
  'ELA.3.R.1.4': ['free-verse', 'rhymed-verse', 'haiku', 'limerick'],
  'ELA.3.R.2.1': ['text-features-contribute-to-meaning', 'chronology', 'comparison-structure', 'cause-effect-structure'],
  'ELA.3.R.2.2': ['central-idea', 'relevant-details', 'details-support-central-idea', 'evidence-across-sections'],
  'ELA.3.R.2.3': ['author-purpose', 'purpose-development', 'supporting-details', 'text-evidence'],
  'ELA.3.R.2.4': ['author-claim', 'reasons', 'evidence', 'claim-evidence-connection'],
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
