import type { ContentPack } from '../content/packs/contentPackTypes'
import { contentPacks, fluencyPracticeAudit } from '../content'
import type { ContentReviewStatus } from '../content'
import { buildBenchmarkCoverageAudit, type BenchmarkCoverageAudit } from '../content/packs/benchmarkCoverageAudit'
import { grade2BenchmarkInventory, type Grade2BenchmarkInventoryEntry } from './grade2BenchmarkInventory'

export type Grade2CoverageStatus = 'implemented' | 'partial' | 'supportive_practice' | 'planned' | 'missing'

export interface Grade2CoverageSnapshotRow {
  benchmarkReference: string
  domain: string
  worldId: string
  unitId: string
  coverageKind: Grade2BenchmarkInventoryEntry['intendedCoverageKind']
  coverageStatus: Grade2CoverageStatus
  reviewStatus: ContentReviewStatus
  contributingPackIds: string[]
  missingPatterns: string[]
  notes: string[]
}

export interface Grade2CoverageSnapshot {
  rows: readonly Grade2CoverageSnapshotRow[]
}

export function buildGrade2CoverageSnapshot(
  inventory: readonly Grade2BenchmarkInventoryEntry[] = grade2BenchmarkInventory,
  packs: readonly ContentPack[] = contentPacks,
): Grade2CoverageSnapshot {
  return {
    rows: inventory.map((entry) => buildRow(entry, packs)),
  }
}

function buildRow(
  entry: Grade2BenchmarkInventoryEntry,
  packs: readonly ContentPack[],
): Grade2CoverageSnapshotRow {
  if (entry.intendedCoverageKind === 'supportive_practice') {
    return {
      benchmarkReference: entry.benchmarkReference,
      domain: entry.domain,
      worldId: entry.worldId,
      unitId: entry.unitId,
      coverageKind: entry.intendedCoverageKind,
      coverageStatus: fluencyPracticeAudit.supportStatus === 'supportive_practice' ? 'supportive_practice' : 'partial',
      reviewStatus: fluencyPracticeAudit.reviewStatus,
      contributingPackIds: [...fluencyPracticeAudit.contributingPackIds],
      missingPatterns: [...fluencyPracticeAudit.missingSupportComponents],
      notes: fluencyPracticeAudit.supportStatus === 'supportive_practice'
        ? ['Supportive practice only; no oral measurement.']
        : ['Supportive practice is incomplete.'],
    }
  }

  const audit: BenchmarkCoverageAudit = buildBenchmarkCoverageAudit(packs, entry.benchmarkReference)
  const hasContributingPacks = audit.contributingPackIds.length > 0
  const coverageStatus: Grade2CoverageStatus = audit.coverageStatus === 'implemented'
    ? 'implemented'
    : hasContributingPacks
      ? 'partial'
      : entry.plannedPhase.startsWith('6F')
        ? 'planned'
        : 'missing'

  return {
    benchmarkReference: entry.benchmarkReference,
    domain: entry.domain,
    worldId: entry.worldId,
    unitId: entry.unitId,
    coverageKind: entry.intendedCoverageKind,
    coverageStatus,
    reviewStatus: hasContributingPacks ? audit.reviewStatus : 'DRAFT',
    contributingPackIds: [...audit.contributingPackIds],
    missingPatterns: [...audit.missingPatterns],
    notes: coverageStatus === 'implemented'
      ? ['Implemented in DRAFT content packs.']
      : coverageStatus === 'partial'
        ? ['Some benchmark patterns remain uncovered.']
        : coverageStatus === 'planned'
          ? ['Roadmap only; no active content yet.']
          : ['No active content or roadmap coverage yet.'],
  }
}
