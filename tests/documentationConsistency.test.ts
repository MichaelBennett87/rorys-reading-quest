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
    const phase6f0Report = readRepoFile('docs/PHASE_6F0_REPORT.md')
    const phase6e7Report = readRepoFile('docs/PHASE_6E7_REPORT.md')
    const baselineAudit = readRepoFile('docs/content/GRADE_2_PHASE_6_BASELINE_AUDIT.md')
    const review = readRepoFile('docs/content/GRADE_2_CONTEXT_CAVERN_MORPHOLOGY_MINE_REVIEW.md')
    const coverageAudit = readRepoFile('docs/content/GRADE_2_V_1_2_COVERAGE_AUDIT.md')
    const phase6e5Report = readRepoFile('docs/PHASE_6E5_REPORT.md')
    const phase6e6Report = readRepoFile('docs/PHASE_6E6_REPORT.md')

    expect(tasks).toContain('- [x] Phase 6D: Grade 2 prose and poetry')
    expect(tasks).toContain('  - [x] Phase 6E: informational reading and vocabulary')
    expect(tasks).toContain('  - [ ] Phase 6F: across-genres reading and final Grade 2 audit')
    expect(tasks).toContain('    - [x] Phase 6F0: Compare Castle and across-genres foundation')
    expect(tasks).toContain('    - [ ] Phase 6F1: similes, idioms, alliteration, and ELA.2.R.3.1')
    expect(tasks).toContain('    - [ ] Phase 6F2: literary and informational retelling for ELA.2.R.3.2')
    expect(tasks).toContain('    - [ ] Phase 6F3: paired-text comparison for ELA.2.R.3.3')
    expect(tasks).toContain('    - [ ] Phase 6F4: final Grade 2 audit and Phase 6 completion')
    expect(readme).toContain('Phase 6F0 complete')
    expect(readme).toContain('Phase 6F1 is next')
    expect(readme).toContain('Compare Castle has a roadmap but no production lessons yet')
    expect(architecture).toContain('nineteen registered packs, 133 lessons, 133 passages, 766 questions, and 530 support targets')
    expect(architecture).toContain('Phase 6F0 architecture boundary')
    expect(architecture).toContain('Compare Castle remains a planned sequential world shell')
    expect(contentModel).toContain('nineteen active Grade 2 bridge packs with 133 lessons, 133 passages, 766 scored questions, and 530 authored word-support targets')
    expect(contentModel).toContain('Phase 6F0 Grade 2 benchmark inventory and coverage snapshot')
    expect(curriculum).toContain('Information Detectives')
    expect(curriculum).toContain('Context Cavern')
    expect(curriculum).toContain('Text Feature Hunt')
    expect(curriculum).toContain('Central Idea Center')
    expect(curriculum).toContain('Opinion & Evidence Desk')
    expect(curriculum).toContain('Academic Word Workshop')
    expect(curriculum).toContain('Morphology Mine')
    expect(curriculum).toContain('Compare Castle')
    expect(curriculum).toContain('Wordplay Watchtower')
    expect(curriculum).toContain('Retell Hall')
    expect(curriculum).toContain('Compare Keep')
    expect(curriculum).not.toContain('Cross-Genre Lab')
    expect(review).toContain('Pack ID: `g2-context-cavern-morphology-mine`')
    expect(review).toContain('Benchmark alignment: `ELA.2.V.1.2`')
    expect(review).toContain('Approval status: `DRAFT - human approval pending`')
    expect(coverageAudit).toContain('Benchmark reference: `ELA.2.V.1.2`')
    expect(coverageAudit).toContain('g2-context-cavern-morphology-mine')
    expect(coverageAudit).toContain('Coverage status')
    expect(coverageAudit).toContain('implemented')
    expect(phase6e5Report).toContain('Final local HEAD: `c3b1c3a605fe6d2280856547eb52100cc8496836`')
    expect(phase6e5Report).toContain('Final remote HEAD: `c3b1c3a605fe6d2280856547eb52100cc8496836`')
    expect(phase6e5Report).not.toContain('Final local HEAD: `200948c342fc8b9e8e5c8eca3f21a814f7721d19`')
    expect(phase6e6Report).toContain('Starting local HEAD: `c3b1c3a605fe6d2280856547eb52100cc8496836`')
    expect(phase6e6Report).toContain('Morphology Mine remains the next-step Context Cavern unit while Meaning Clue Chamber stays deferred.')
    expect(phase6e6Report).toContain('Morphology Mine remains the next-step Context Cavern unit while Meaning Clue Chamber stays deferred.')
    expect(phase6e7Report).toContain('Final local HEAD: `c0a7f0ea539124fd645734879d8272a72c894e75`')
    expect(phase6e7Report).toContain('Final remote HEAD: `c0a7f0ea539124fd645734879d8272a72c894e75`')
    expect(phase6e7Report).toContain('Local and remote SHA match:')
    expect(phase6f0Report).toContain('Starting local HEAD: `c0a7f0ea539124fd645734879d8272a72c894e75`')
    expect(phase6f0Report).toContain('Phase 6F0 implementation checkpoint')
    expect(phase6f0Report).toContain('Compare Castle has a roadmap but no production lessons yet')
    expect(phase6f0Report).toContain('largest JavaScript asset: `dist/assets/index-C7LMCdQa.js`')
    expect(phase6f0Report).toContain('raw size: `1,763.43 kB`')
    expect(phase6f0Report).toContain('gzip size: `314.86 kB`')
    expect(phase6f0Report).not.toContain('Final local HEAD:')
    expect(baselineAudit).toContain('Grade 2 benchmark inventory count: 20')
    expect(baselineAudit).toContain('ELA.2.R.3.1 status: planned')
    expect(baselineAudit).toContain('Phase 6F0 architecture boundary')
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
      activePackCount: 19,
      activeLessonCount: 133,
      activePassageCount: 133,
      activeQuestionCount: 766,
      activeSupportTargetCount: 530,
    })
  })
})
