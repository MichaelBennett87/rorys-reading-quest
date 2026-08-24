import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import {
  contentPackAudit,
  contentPacks,
  sampleContent,
  validateContent,
} from '../src/domain/content'
import {
  buildGrade2CoverageSnapshot,
  type Grade2CoverageSnapshotRow,
} from '../src/domain/curriculum/grade2CoverageSnapshot'
import {
  grade2BenchmarkInventory,
  type Grade2BenchmarkInventoryEntry,
} from '../src/domain/curriculum/grade2BenchmarkInventory'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs/registry'

function readRepoFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('final grade 2 audit', () => {
  test('keeps the Grade 2 inventory, coverage snapshot, and registry totals complete', () => {
    const activePacks = getActiveContentPacks()
    const grade2Packs = activePacks.filter((pack) => pack.manifest.gradeBand === 2)
    const snapshot = buildGrade2CoverageSnapshot()
    const statuses = snapshot.rows.reduce<Record<'implemented' | 'supportive_practice' | 'partial' | 'planned' | 'missing', number>>(
      (acc, row: Grade2CoverageSnapshotRow) => {
        acc[row.coverageStatus] += 1
        return acc
      },
      {
        implemented: 0,
        supportive_practice: 0,
        partial: 0,
        planned: 0,
        missing: 0,
      },
    )

    expect(contentPacks).toHaveLength(27)
    expect(new Set(contentPacks.map((pack) => pack.manifest.packId)).size).toBe(27)
    expect(grade2Packs).toHaveLength(22)
    expect(new Set(grade2Packs.map((pack) => pack.manifest.packId)).size).toBe(22)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 26,
      activeLessonCount: 182,
      activePassageCount: 189,
      activeQuestionCount: 1040,
      activeSupportTargetCount: 719,
    })
    expect(contentPackAudit).toHaveLength(0)
    expect(validateContent(sampleContent)).toHaveLength(0)
    expect(grade2BenchmarkInventory).toHaveLength(20)
    expect(new Set(grade2BenchmarkInventory.map((entry: Grade2BenchmarkInventoryEntry) => entry.benchmarkReference)).size).toBe(20)
    expect(grade2BenchmarkInventory.filter((entry: Grade2BenchmarkInventoryEntry) => entry.intendedCoverageKind === 'benchmark')).toHaveLength(19)
    expect(grade2BenchmarkInventory.find((entry: Grade2BenchmarkInventoryEntry) => entry.benchmarkReference === 'ELA.2.F.1.4')?.intendedCoverageKind).toBe('supportive_practice')
    expect(snapshot.rows).toHaveLength(20)
    expect(snapshot.rows.map((row: Grade2CoverageSnapshotRow) => row.benchmarkReference)).toEqual(grade2BenchmarkInventory.map((entry: Grade2BenchmarkInventoryEntry) => entry.benchmarkReference))
    expect(statuses).toEqual({
      implemented: 19,
      supportive_practice: 1,
      partial: 0,
      planned: 0,
      missing: 0,
    })
    expect(snapshot.rows.every((row: Grade2CoverageSnapshotRow) => row.reviewStatus === 'DRAFT')).toBe(true)
    expect(snapshot.rows.every((row: Grade2CoverageSnapshotRow) => row.missingPatterns.length === 0)).toBe(true)
    expect(snapshot.rows.find((row: Grade2CoverageSnapshotRow) => row.benchmarkReference === 'ELA.2.F.1.4')).toEqual(expect.objectContaining({
      coverageKind: 'supportive_practice',
      coverageStatus: 'supportive_practice',
      reviewStatus: 'DRAFT',
    }))
    expect(snapshot.rows.find((row: Grade2CoverageSnapshotRow) => row.benchmarkReference === 'ELA.2.R.3.3')).toEqual(expect.objectContaining({
      coverageKind: 'benchmark',
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      contributingPackIds: ['g2-compare-castle-compare-keep'],
    }))
  })

  test('keeps the final audit documentation synchronized with the final repository state', () => {
    const readme = readRepoFile('README.md')
    const tasks = readRepoFile('TASKS.md')
    const phase6f3Report = readRepoFile('docs/PHASE_6F3_REPORT.md')
    const phase6f4Report = readRepoFile('docs/PHASE_6F4_REPORT.md')
    const phase6FinalReport = readRepoFile('docs/PHASE_6_FINAL_REPORT.md')
    const finalCoverage = readRepoFile('docs/content/GRADE_2_FINAL_BENCHMARK_COVERAGE.md')
    const finalAudit = readRepoFile('docs/content/GRADE_2_PHASE_6_FINAL_AUDIT.md')

    expect(readme).toContain('Phase 6 complete')
    expect(readme).toContain('Grade 2 curriculum coverage complete')
    expect(readme).toContain('the final Grade 2 audit is complete')
    expect(readme).toContain('Phase 7 remains in progress')
    expect(tasks).toContain('    - [x] Phase 6F4: final Grade 2 audit and Phase 6 completion')
    expect(tasks).toContain('- [x] Phase 6: Grade 2 bridge content')
    expect(tasks).toContain('  - [x] Phase 6F: across-genres reading and final Grade 2 audit')
    expect(phase6f3Report).toContain('Implementation and documentation commit: `8454a7b053ca4ba5dbbd9eb57552d09c2aa488e6`')
    expect(phase6f3Report).toContain('Commit message: `feat: integrate compare castle compare keep`')
    expect(phase6f3Report).toContain('Final local HEAD: `8454a7b053ca4ba5dbbd9eb57552d09c2aa488e6`')
    expect(phase6f3Report).toContain('Final remote HEAD: `8454a7b053ca4ba5dbbd9eb57552d09c2aa488e6`')
    expect(phase6f3Report).toContain('Local and remote SHA match: yes')
    expect(phase6f3Report).not.toContain('pending final commit')
    expect(phase6f4Report).toContain('Starting SHA: `8454a7b053ca4ba5dbbd9eb57552d09c2aa488e6`')
    expect(phase6f4Report).toContain('Defects found: none')
    expect(phase6f4Report).toContain('Active packs: 22')
    expect(phase6f4Report).toContain('Phase 6F3 baseline: `dist/assets/index-BtTa3mBa.js`, `2,046.69 kB` raw, `361.26 kB` gzip')
    expect(phase6FinalReport).toContain('Phase 6 complete')
    expect(phase6FinalReport).toContain('Phase 6F4 completed the final Grade 2 audit and Phase 6 completion.')
    expect(phase6FinalReport).toContain('Phase 7 remains incomplete and will begin Grade 3 content only after this completed Phase 6 checkpoint.')
    expect(finalCoverage).toContain('Inventory entries: 20')
    expect(finalCoverage).toContain('Implemented: 19')
    expect(finalCoverage).toContain('Supportive practice: 1')
    expect(finalCoverage).toContain('ELA.2.F.1.4')
    expect(finalCoverage).toContain('supportive practice only; no oral measurement')
    expect(finalAudit).toContain('The repository contains complete authored DRAFT or supportive-practice coverage for every Grade 2 benchmark in the project\'s twenty-benchmark inventory.')
    expect(finalAudit).toContain('Phase 6 curriculum construction and repository-level audit are complete.')
    expect(finalAudit).toContain('This does not mean Rory has mastered Grade 2')
    expect(finalAudit).toContain('no official FAST prediction')
  })
})
