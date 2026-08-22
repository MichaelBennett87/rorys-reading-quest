import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { getActiveContentRegistryTotals } from '../src/domain/content/packs/registry'

function readRepoFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('documentation consistency', () => {
  test('keeps the phase milestone tree and roadmap wording aligned', () => {
    const tasks = readRepoFile('TASKS.md')
    const readme = readRepoFile('README.md')
    const architecture = readRepoFile('docs/ARCHITECTURE.md')
    const contentModel = readRepoFile('docs/CONTENT_MODEL.md')
    const curriculum = readRepoFile('docs/GRADE_2_BRIDGE_CURRICULUM.md')
    const review = readRepoFile('docs/content/GRADE_2_CONTEXT_CAVERN_ACADEMIC_WORD_WORKSHOP_REVIEW.md')
    const coverageAudit = readRepoFile('docs/content/GRADE_2_R_2_4_COVERAGE_AUDIT.md')
    const finalAudit = readRepoFile('docs/content/GRADE_2_CONTEXT_CAVERN_FINAL_AUDIT.md')

    expect(tasks).toContain('- [x] Phase 6D: Grade 2 prose and poetry')
    expect(tasks).toContain('  - [ ] Phase 6E: informational reading and vocabulary')
    expect(tasks).toContain('    - [x] Phase 6E0: Information Detectives and vocabulary-world foundation')
    expect(tasks).toContain('    - [x] Phase 6E1: text features and ELA.2.R.2.1')
    expect(tasks).toContain('    - [x] Phase 6E2: central idea and relevant details for ELA.2.R.2.2')
    expect(tasks).toContain("    - [x] Phase 6E3: author's purpose for ELA.2.R.2.3")
    expect(tasks).toContain('    - [x] Phase 6E4: opinion and supporting evidence for ELA.2.R.2.4')
    expect(tasks).toContain('    - [x] Phase 6E5: academic-vocabulary practice and Context Cavern foundation')
    expect(tasks).toContain('    - [ ] Phase 6E6: morphology and ELA.2.V.1.2')
    expect(tasks).toContain('    - [ ] Phase 6E7: context, word relationships, reference materials, background knowledge, and final Phase 6E audit')
    expect(readme).toContain('Phase 6D complete; Phase 6E0 through Phase 6E5 complete; Information Detectives informational-reading sequence complete; Phase 6 remains in progress; Phase 6E6 is next; Context Cavern is active')
    expect(architecture).toContain('seventeen registered packs, 119 lessons, 119 passages, 684 questions, and 474 support targets')
    expect(contentModel).toContain('seventeen active Grade 2 bridge packs with 119 lessons, 119 passages, 684 scored questions, and 474 authored word-support targets')
    expect(curriculum).toContain('Information Detectives')
    expect(curriculum).toContain('Context Cavern')
    expect(curriculum).toContain('Text Feature Hunt')
    expect(curriculum).toContain('Central Idea Center')
    expect(curriculum).toContain('Opinion & Evidence Desk')
    expect(curriculum).toContain('Academic Word Workshop')
    expect(curriculum).not.toContain('Info Lab')
    expect(curriculum).not.toContain('Vocabulary Lab')
    expect(review).toContain('Pack ID: `g2-context-cavern-academic-word-workshop`')
    expect(review).toContain('Benchmark alignment: `ELA.2.V.1.1`')
    expect(review).toContain('Review status: `DRAFT`')
    expect(coverageAudit).toContain('Contributing pack')
    expect(coverageAudit).toContain('g2-context-cavern-academic-word-workshop')
    expect(coverageAudit).toContain('Coverage status')
    expect(coverageAudit).toContain('implemented')
    expect(finalAudit).toContain('Context Cavern is the fifth playable curriculum track.')
    expect(finalAudit).toContain('`ELA.2.V.1.1`: implemented, DRAFT.')
    expect(finalAudit).toContain('Morphology Mine remains next.')
  })

  test('keeps the Phase 6D4 reconciliation report synchronized with the final repository state', () => {
    const report = readRepoFile('docs/PHASE_6D4_REPORT.md')

    expect(report).toContain('Starting local HEAD: `081db216af5c7c16093c59e6d2052ddbf62adaa6`')
    expect(report).toContain('Starting remote HEAD: `081db216af5c7c16093c59e6d2052ddbf62adaa6`')
    expect(report).toContain('Final local HEAD: `dee575d6bfbe5928ddb4f212b27090dcb96b6f41`')
    expect(report).toContain('Final remote HEAD: `dee575d6bfbe5928ddb4f212b27090dcb96b6f41`')
    expect(report).not.toContain('Final local HEAD: `97fb8e4b024323c43a1d419d3a891da2ce3aead1`')
    expect(report).toContain('Phase 6D completion remains complete.')
  })

  test('keeps the Phase 6E0 reconciliation report synchronized with the documented completion facts', () => {
    const report = readRepoFile('docs/PHASE_6E0_REPORT.md')

    expect(report).toContain('Starting local HEAD: `dee575d6bfbe5928ddb4f212b27090dcb96b6f41`')
    expect(report).toContain('Starting remote HEAD: `dee575d6bfbe5928ddb4f212b27090dcb96b6f41`')
    expect(report).toContain('Implementation commit: `623343c feat: add phase 6e curriculum roadmap`')
    expect(report).toContain('Documentation commit: `d5eba85 docs: complete phase 6e0 foundation`')
    expect(report).toContain('Final local HEAD: `d5eba859d6292a830d3acc7472e9ecd5f18e67fb`')
    expect(report).toContain('Final remote HEAD: `d5eba859d6292a830d3acc7472e9ecd5f18e67fb`')
    expect(report).toContain('Local and remote SHA match: yes')
  })

  test('keeps the Phase 6E1 reconciliation report synchronized with the documented completion facts', () => {
    const report = readRepoFile('docs/PHASE_6E1_REPORT.md')

    expect(report).toContain('Starting local HEAD: `d5eba859d6292a830d3acc7472e9ecd5f18e67fb`')
    expect(report).toContain('Starting remote HEAD: `d5eba859d6292a830d3acc7472e9ecd5f18e67fb`')
    expect(report).toContain('Combined Phase 6E1 implementation and documentation commit: `4edae57 docs: complete phase 6e1 review`')
    expect(report).toContain('Final local HEAD: `4edae570d5609013f3d28aa62c64e4dc462364c4`')
    expect(report).toContain('Final remote HEAD: `4edae570d5609013f3d28aa62c64e4dc462364c4`')
    expect(report).toContain('Local and remote SHA match: yes')
    expect(report).not.toContain('Implementation checkpoint: `623343c feat: add phase 6e curriculum roadmap`')
    expect(report).not.toContain('623343c feat: add phase 6e curriculum roadmap')
  })

  test('keeps the Phase 6E2 reconciliation report synchronized with the documented completion facts', () => {
    const report = readRepoFile('docs/PHASE_6E2_REPORT.md')

    expect(report).toContain('Starting local HEAD: `4edae570d5609013f3d28aa62c64e4dc462364c4`')
    expect(report).toContain('Starting remote HEAD: `4edae570d5609013f3d28aa62c64e4dc462364c4`')
    expect(report).toContain('Implementation checkpoint: `94d97e9` `feat: integrate central idea center progression`')
    expect(report).toContain('Documentation commit: `917003c` `docs: complete phase 6e2 review`')
    expect(report).toContain('Final local HEAD: `917003cda255cf3a7169b97aee929392c8c076ef`')
    expect(report).toContain('Final remote HEAD: `917003cda255cf3a7169b97aee929392c8c076ef`')
    expect(report).toContain('Local and remote SHA match: yes')
  })

  test('keeps the Phase 6E3 reconciliation report synchronized with the documented completion facts', () => {
    const report = readRepoFile('docs/PHASE_6E3_REPORT.md')

    expect(report).toContain('Starting local HEAD: `917003cda255cf3a7169b97aee929392c8c076ef`')
    expect(report).toContain('Starting remote HEAD: `917003cda255cf3a7169b97aee929392c8c076ef`')
    expect(report).toContain('Implementation checkpoint: `706e129cb13b512b5280eb827636c827550184db`')
    expect(report).toContain('Documentation checkpoint: `b00bd01` `docs: complete phase 6e3 review`')
    expect(report).toContain('Final local HEAD: `dd914ea8d568b7467f80f51b39141f5e2adf336c`')
    expect(report).toContain('Final remote HEAD: `dd914ea8d568b7467f80f51b39141f5e2adf336c`')
    expect(report).toContain('Local and remote SHA match: yes')
    expect(report).not.toContain('Final local HEAD: `b00bd01`')
  })

  test('keeps the Phase 6E4 reconciliation report synchronized with the documented completion facts', () => {
    const report = readRepoFile('docs/PHASE_6E4_REPORT.md')

    expect(report).toContain('Starting local HEAD: `dd914ea8d568b7467f80f51b39141f5e2adf336c`')
    expect(report).toContain('Starting remote HEAD: `dd914ea8d568b7467f80f51b39141f5e2adf336c`')
    expect(report).toContain('Implementation checkpoint: `706e129cb13b512b5280eb827636c827550184db`')
    expect(report).toContain('Documentation checkpoint: `b00bd01` `docs: complete phase 6e3 review`')
    expect(report).toContain('Verification facts')
    expect(report).toContain('The `src/domain/content/packs/grade2/informationDetectives/opinionEvidenceDesk/passages.ts` import block was corrected during the Phase 6E4 continuation, and no authored curriculum content changed.')
    expect(report).not.toContain('Final local HEAD:')
    expect(report).not.toContain('Final remote HEAD:')
  })

  test('keeps active curriculum totals aligned with the registry helper', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 17,
      activeLessonCount: 119,
      activePassageCount: 119,
      activeQuestionCount: 684,
      activeSupportTargetCount: 474,
    })
  })
})
