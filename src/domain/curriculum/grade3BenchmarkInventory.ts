import { freezeBenchmarkInventory, type GradeBandBenchmarkInventoryEntry } from './gradeBandBenchmarkInventory'

const PROSE = 'Reading Prose and Poetry'
const INFORMATIONAL = 'Reading Informational Text'
const ACROSS = 'Reading Across Genres and Vocabulary'

const entries: GradeBandBenchmarkInventoryEntry[] = [
  entry('ELA.3.F.1.3', 'Foundational Skills', 'word-forge', ['g3-wg-unit-1', 'g3-wg-unit-2', 'g3-wg-unit-3'], '7A1-7A3', 'benchmark', 'instructional_only', null,
    ['greek-latin-root-decoding', 'affix-decoding', 'derivational-suffix-decoding', 'part-of-speech-change', 'multisyllabic-decoding']),
  entry('ELA.3.F.1.4', 'Foundational Skills', 'word-forge', ['g3-wg-unit-4'], '7A4', 'supportive_practice', 'instructional_only', null,
    ['accuracy-practice', 'automaticity-practice', 'phrasing-practice', 'expression-practice', 'no-oral-measurement']),
  entry('ELA.3.R.1.1', PROSE, 'story-scouts', ['g3-ss-unit-1'], '7B1', 'benchmark', 'fast_reading', PROSE,
    ['character-development', 'plot-linked-change', 'actions-dialogue-thoughts', 'beginning-middle-end-development', 'text-evidence']),
  entry('ELA.3.R.1.2', PROSE, 'story-scouts', ['g3-ss-unit-2'], '7B2', 'benchmark', 'fast_reading', PROSE,
    ['theme', 'theme-development', 'supporting-details', 'plot-theme-connection']),
  entry('ELA.3.R.1.3', PROSE, 'story-scouts', ['g3-ss-unit-3'], '7B3', 'benchmark', 'fast_reading', PROSE,
    ['character-perspective', 'different-character-perspectives', 'similar-character-perspectives', 'perspective-evidence', 'perspective-change']),
  entry('ELA.3.R.1.4', PROSE, 'poetry-planet', ['g3-pp-unit-1'], '7B4', 'benchmark', 'fast_reading', PROSE,
    ['free-verse', 'rhymed-verse', 'haiku', 'limerick']),
  entry('ELA.3.R.2.1', INFORMATIONAL, 'information-detectives', ['g3-id-unit-1'], '7C1', 'benchmark', 'fast_reading', INFORMATIONAL,
    ['text-features-contribute-to-meaning', 'chronology', 'comparison-structure', 'cause-effect-structure']),
  entry('ELA.3.R.2.2', INFORMATIONAL, 'information-detectives', ['g3-id-unit-2'], '7C2', 'benchmark', 'fast_reading', INFORMATIONAL,
    ['central-idea', 'relevant-details', 'details-support-central-idea', 'evidence-across-sections']),
  entry('ELA.3.R.2.3', INFORMATIONAL, 'information-detectives', ['g3-id-unit-3'], '7C3', 'benchmark', 'fast_reading', INFORMATIONAL,
    ['author-purpose', 'purpose-development', 'supporting-details', 'text-evidence']),
  entry('ELA.3.R.2.4', INFORMATIONAL, 'information-detectives', ['g3-id-unit-4'], '7C4', 'benchmark', 'fast_reading', INFORMATIONAL,
    ['author-claim', 'reasons', 'evidence', 'claim-evidence-connection']),
  entry('ELA.3.R.3.1', 'Reading Across Genres', 'compare-castle', ['g3-cg-unit-1'], '7D1', 'benchmark', 'fast_reading', ACROSS,
    ['metaphors', 'personification', 'hyperbole', 'figurative-meaning', 'literal-vs-nonliteral']),
  entry('ELA.3.R.3.2', 'Reading Across Genres', 'compare-castle', ['g3-cg-unit-2'], '7D2', 'benchmark', 'fast_reading', ACROSS,
    ['literary-summary', 'plot', 'theme', 'informational-summary', 'central-idea', 'relevant-details', 'important-vs-minor']),
  entry('ELA.3.R.3.3', 'Reading Across Genres', 'compare-castle', ['g3-cg-unit-3'], '7D3', 'benchmark', 'fast_reading', ACROSS,
    ['two-author-comparison', 'same-topic-or-theme', 'presentation-similarity', 'presentation-difference', 'evidence-from-both-texts']),
  entry('ELA.3.V.1.1', 'Vocabulary', 'context-cavern', ['g3-cc-unit-1'], '7D4', 'supportive_practice', 'instructional_only', null,
    ['grade-level-academic-vocabulary', 'appropriate-use', 'speaking-writing-support', 'no-open-response-scoring']),
  entry('ELA.3.V.1.2', 'Vocabulary', 'context-cavern', ['g3-cc-unit-2'], '7D5', 'benchmark', 'fast_reading', ACROSS,
    ['greek-roots', 'latin-roots', 'base-words', 'affixes', 'unfamiliar-word-meaning']),
  entry('ELA.3.V.1.3', 'Vocabulary', 'context-cavern', ['g3-cc-unit-3'], '7D6', 'benchmark', 'fast_reading', ACROSS,
    ['context-clues', 'figurative-language', 'word-relationships', 'reference-materials', 'background-knowledge', 'multiple-meaning-words', 'unknown-words', 'unknown-phrases']),
]

export const grade3BenchmarkInventory = freezeBenchmarkInventory(entries)

function entry(
  benchmarkReference: string,
  domain: string,
  worldId: string,
  unitIds: readonly string[],
  plannedPhase: string,
  intendedCoverageKind: GradeBandBenchmarkInventoryEntry['intendedCoverageKind'],
  assessmentScope: GradeBandBenchmarkInventoryEntry['assessmentScope'],
  fastReportingCategory: string | null,
  expectedPatterns: readonly string[],
): GradeBandBenchmarkInventoryEntry {
  return { benchmarkReference, gradeBand: 3, domain, worldId, unitIds, plannedPhase, intendedCoverageKind, assessmentScope, fastReportingCategory, expectedPatterns }
}
