export type Grade2CoverageKind = 'benchmark' | 'supportive_practice'

export interface Grade2BenchmarkInventoryEntry {
  benchmarkReference: string
  domain: string
  worldId: string
  unitId: string
  plannedPhase: string
  intendedCoverageKind: Grade2CoverageKind
}

const grade2BenchmarkInventoryEntries: Grade2BenchmarkInventoryEntry[] = [
  { benchmarkReference: 'ELA.2.F.1.3a', domain: 'Foundations', worldId: 'word-forge', unitId: 'wg-unit-1', plannedPhase: '6A1-6A2', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.F.1.3b', domain: 'Foundations', worldId: 'word-forge', unitId: 'wg-unit-2', plannedPhase: '6B1', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.F.1.3c', domain: 'Foundations', worldId: 'word-forge', unitId: 'wg-unit-2', plannedPhase: '6B1-6B2', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.F.1.3d', domain: 'Foundations', worldId: 'word-forge', unitId: 'wg-unit-3', plannedPhase: '6C1-6C2', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.F.1.3e', domain: 'Foundations', worldId: 'word-forge', unitId: 'wg-unit-5', plannedPhase: '6C3', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.F.1.4', domain: 'Foundations', worldId: 'word-forge', unitId: 'wg-unit-6', plannedPhase: '6C4', intendedCoverageKind: 'supportive_practice' },
  { benchmarkReference: 'ELA.2.R.1.1', domain: 'Reading Prose and Poetry', worldId: 'story-scouts', unitId: 'ss-unit-1', plannedPhase: '6D1', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.1.2', domain: 'Reading Prose and Poetry', worldId: 'story-scouts', unitId: 'ss-unit-2', plannedPhase: '6D2', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.1.3', domain: 'Reading Prose and Poetry', worldId: 'story-scouts', unitId: 'ss-unit-3', plannedPhase: '6D3', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.1.4', domain: 'Reading Prose and Poetry', worldId: 'poetry-planet', unitId: 'pp-unit-1', plannedPhase: '6D4', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.2.1', domain: 'Reading Informational Text', worldId: 'information-detectives', unitId: 'id-unit-1', plannedPhase: '6E1', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.2.2', domain: 'Reading Informational Text', worldId: 'information-detectives', unitId: 'id-unit-2', plannedPhase: '6E2', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.2.3', domain: 'Reading Informational Text', worldId: 'information-detectives', unitId: 'id-unit-3', plannedPhase: '6E3', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.2.4', domain: 'Reading Informational Text', worldId: 'information-detectives', unitId: 'id-unit-4', plannedPhase: '6E4', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.3.1', domain: 'Reading Across Genres', worldId: 'compare-castle', unitId: 'cg-unit-1', plannedPhase: '6F1', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.3.2', domain: 'Reading Across Genres', worldId: 'compare-castle', unitId: 'cg-unit-2', plannedPhase: '6F2', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.R.3.3', domain: 'Reading Across Genres', worldId: 'compare-castle', unitId: 'cg-unit-3', plannedPhase: '6F3', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.V.1.1', domain: 'Vocabulary', worldId: 'context-cavern', unitId: 'cc-unit-1', plannedPhase: '6E5', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.V.1.2', domain: 'Vocabulary', worldId: 'context-cavern', unitId: 'cc-unit-2', plannedPhase: '6E6', intendedCoverageKind: 'benchmark' },
  { benchmarkReference: 'ELA.2.V.1.3', domain: 'Vocabulary', worldId: 'context-cavern', unitId: 'cc-unit-3', plannedPhase: '6E7', intendedCoverageKind: 'benchmark' },
]

export const grade2BenchmarkInventory: readonly Grade2BenchmarkInventoryEntry[] = Object.freeze(
  grade2BenchmarkInventoryEntries.map((entry) => Object.freeze({ ...entry })),
)
