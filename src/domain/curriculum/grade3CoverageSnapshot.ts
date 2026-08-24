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
            ? ['Root Reactor covers Greek and Latin root and affix decoding. Suffix Shifter covers transparent derivational suffix decoding and part-of-speech change. Multisyllable Mountain remains required before ELA.3.F.1.3 can become implemented.']
            : status === 'implemented' && entry.benchmarkReference === 'ELA.3.F.1.3'
              ? ['Root Reactor, Suffix Shifter, and Multisyllable Mountain cover all five required ELA.3.F.1.3 patterns. Curriculum coverage is implemented at DRAFT review status; this does not claim learner mastery.']
              : status === 'implemented' && entry.benchmarkReference === 'ELA.3.R.1.1'
                ? ['Character Arc Camp covers plot-linked character development across beginning, middle, and end using actions, dialogue, thoughts, turning points, and text evidence. Curriculum coverage is implemented at DRAFT review status; this does not claim learner mastery.']
                : status === 'implemented' && entry.benchmarkReference === 'ELA.3.R.1.2'
                  ? ['Theme Development Trail covers theme development across beginning, middle, and end using plot details, choices, consequences, turning points, and text evidence. Curriculum coverage is implemented at DRAFT review status; this does not claim learner mastery.']
                  : status === 'implemented' && entry.benchmarkReference === 'ELA.3.R.1.3'
                    ? ['Perspective Portal covers different, partly similar, and similar character perspectives, evidence from both characters, and evidence-supported perspective change. Curriculum coverage is implemented at DRAFT review status; this does not claim learner mastery or narrator point-of-view mastery.']
                    : status === 'implemented' && entry.benchmarkReference === 'ELA.3.R.1.4'
                      ? ['Poem Form Observatory covers free verse, rhymed verse, haiku, and limerick using multiple structural clues. Curriculum coverage is implemented at DRAFT review status; this does not claim learner mastery, poetry composition, or figurative-language mastery.']
                      : status === 'implemented' && entry.benchmarkReference === 'ELA.3.R.2.1'
                        ? ['Structure Station covers text-feature contributions plus chronology, comparison, and cause-and-effect organization. Curriculum coverage is implemented at DRAFT review status; this does not claim learner mastery, central-idea, author-purpose, or claim-and-evidence mastery.']
                        : status === 'implemented' && entry.benchmarkReference === 'ELA.3.R.2.2'
                          ? ['Central Idea Engine covers stated and implied central ideas, relevant versus minor details, and support across informational sections. Curriculum coverage is implemented at DRAFT review status; this does not claim learner mastery, author-purpose, or claim-and-evidence mastery.']
                          : status === 'implemented' && entry.benchmarkReference === 'ELA.3.R.2.3'
                            ? ['Purpose Development Path covers precise author purpose, purpose development, supporting details, and text evidence across informational sections. Curriculum coverage is implemented at DRAFT review status; this does not claim learner mastery or claim-and-evidence mastery.']
              : status === 'supportive_practice' && entry.benchmarkReference === 'ELA.3.F.1.4'
                ? ['Fluency Flight provides DRAFT visual and question-based support for accuracy, automaticity, phrasing, and expression. The app does not record audio or measure oral fluency, pronunciation, prosody, or reading rate.']
            : ['Active Grade 3 content contributes to this inventory row.']),
      })
    })),
  })
}
