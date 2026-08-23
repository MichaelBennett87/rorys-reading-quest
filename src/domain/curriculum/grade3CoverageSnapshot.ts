import type { ContentPack } from '../content/packs/contentPackTypes'
import type { ContentReviewStatus } from '../content/types'
import { grade3BenchmarkInventory } from './grade3BenchmarkInventory'
import type { GradeBandBenchmarkInventoryEntry } from './gradeBandBenchmarkInventory'

export type Grade3CoverageStatus = 'implemented' | 'supportive_practice' | 'partial' | 'planned' | 'missing'

export interface Grade3CoverageSnapshotRow extends GradeBandBenchmarkInventoryEntry {
  coverageStatus: Grade3CoverageStatus
  reviewStatus: ContentReviewStatus
  contributingPackIds: readonly string[]
  missingPatterns: readonly string[]
  notes: readonly string[]
}

export interface Grade3CoverageSnapshot {
  rows: readonly Grade3CoverageSnapshotRow[]
}

export function buildGrade3CoverageSnapshot(
  inventory: readonly GradeBandBenchmarkInventoryEntry[] = grade3BenchmarkInventory,
  grade3Packs: readonly ContentPack[] = [],
): Grade3CoverageSnapshot {
  return Object.freeze({
    rows: Object.freeze(inventory.map((entry) => {
      const contributingPackIds = grade3Packs
        .filter((pack) => pack.manifest.gradeBand === 3 && (
          pack.manifest.benchmarkReferences.includes(entry.benchmarkReference)
          || pack.manifest.supportingBenchmarkReferences?.includes(entry.benchmarkReference)
        ))
        .map((pack) => pack.manifest.packId)
        .sort()
      const status: Grade3CoverageStatus = contributingPackIds.length > 0 ? 'partial' : 'planned'
      return Object.freeze({
        ...entry,
        unitIds: Object.freeze([...entry.unitIds]),
        expectedPatterns: Object.freeze([...entry.expectedPatterns]),
        coverageStatus: status,
        reviewStatus: 'DRAFT' as const,
        contributingPackIds: Object.freeze(contributingPackIds),
        missingPatterns: Object.freeze(status === 'planned' ? [] : [...entry.expectedPatterns]),
        notes: Object.freeze(status === 'planned'
          ? ['Roadmap only; no active Grade 3 content yet.']
          : ['Active Grade 3 content is incomplete.']),
      })
    })),
  })
}
