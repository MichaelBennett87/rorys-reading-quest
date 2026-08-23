import type { ContentPack } from '../content/packs/contentPackTypes'
import { getActiveContentPacks } from '../content/packs/registry'
import type { ContentReviewStatus } from '../content/types'
import { grade3BenchmarkInventory } from './grade3BenchmarkInventory'
import type { GradeBandBenchmarkInventoryEntry } from './gradeBandBenchmarkInventory'

export type Grade3CoverageStatus = 'implemented' | 'supportive_practice' | 'partial' | 'planned' | 'missing'

export interface Grade3CoverageSnapshotRow extends GradeBandBenchmarkInventoryEntry {
  coverageStatus: Grade3CoverageStatus
  reviewStatus: ContentReviewStatus
  contributingPackIds: readonly string[]
  coveredPatterns: readonly string[]
  missingPatterns: readonly string[]
  notes: readonly string[]
}

export interface Grade3CoverageSnapshot {
  rows: readonly Grade3CoverageSnapshotRow[]
}

export function buildGrade3CoverageSnapshot(
  inventory: readonly GradeBandBenchmarkInventoryEntry[] = grade3BenchmarkInventory,
  grade3Packs: readonly ContentPack[] = getActiveContentPacks().filter((pack) => pack.manifest.gradeBand === 3),
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
      const contributingPacks = grade3Packs.filter((pack) => contributingPackIds.includes(pack.manifest.packId))
      const coveredPatterns = new Set(contributingPacks.flatMap((pack) => pack.manifest.coveredPatterns))
      const missingPatterns = entry.expectedPatterns.filter((pattern) => !coveredPatterns.has(pattern))
      const status: Grade3CoverageStatus = contributingPackIds.length === 0
        ? 'planned'
        : missingPatterns.length > 0
          ? 'partial'
          : entry.intendedCoverageKind === 'supportive_practice'
            ? 'supportive_practice'
            : 'implemented'
      return Object.freeze({
        ...entry,
        unitIds: Object.freeze([...entry.unitIds]),
        expectedPatterns: Object.freeze([...entry.expectedPatterns]),
        coverageStatus: status,
        reviewStatus: 'DRAFT' as const,
        contributingPackIds: Object.freeze(contributingPackIds),
        coveredPatterns: Object.freeze(entry.expectedPatterns.filter((pattern) => coveredPatterns.has(pattern))),
        missingPatterns: Object.freeze([...missingPatterns]),
        notes: Object.freeze(status === 'planned'
          ? ['Roadmap only; no active Grade 3 content yet.']
          : status === 'partial' && entry.benchmarkReference === 'ELA.3.F.1.3'
            ? ['Root Reactor provides authored decoding and word-analysis practice for common Greek and Latin roots and affixes. Suffix Shifter and Multisyllable Mountain remain required before ELA.3.F.1.3 can become implemented.']
            : ['Active Grade 3 content contributes to this inventory row.']),
      })
    })),
  })
}
