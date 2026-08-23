import type { GradeBand } from '../content/types'

export type BenchmarkCoverageKind = 'benchmark' | 'supportive_practice'
export type AssessmentScope = 'fast_reading' | 'instructional_only'

export interface GradeBandBenchmarkInventoryEntry {
  benchmarkReference: string
  gradeBand: GradeBand
  domain: string
  worldId: string
  unitIds: readonly string[]
  plannedPhase: string
  intendedCoverageKind: BenchmarkCoverageKind
  assessmentScope: AssessmentScope
  fastReportingCategory: string | null
  expectedPatterns: readonly string[]
}

export function freezeBenchmarkInventory(
  entries: readonly GradeBandBenchmarkInventoryEntry[],
): readonly GradeBandBenchmarkInventoryEntry[] {
  return Object.freeze(entries.map((entry) => Object.freeze({
    ...entry,
    unitIds: Object.freeze([...entry.unitIds]),
    expectedPatterns: Object.freeze([...entry.expectedPatterns]),
  })))
}
