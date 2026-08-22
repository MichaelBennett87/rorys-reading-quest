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

    expect(tasks).toContain('- [x] Phase 6D: Grade 2 prose and poetry')
    expect(tasks).toContain('  - [ ] Phase 6E: informational reading and vocabulary')
    expect(tasks).toContain('    - [x] Phase 6E0: Information Detectives and vocabulary-world foundation')
    expect(tasks).toContain('    - [x] Phase 6E1: text features and ELA.2.R.2.1')
    expect(tasks).toContain('    - [ ] Phase 6E7: context, word relationships, reference materials, background knowledge, and final Phase 6E audit')
    expect(readme).toContain('Phase 6D complete; Phase 6E0 complete; Phase 6E1 complete; Phase 6 remains in progress; Phase 6E2 is next')
    expect(architecture).toContain('thirteen registered packs, 91 lessons, 91 passages, 520 questions, and 362 support targets')
    expect(contentModel).toContain('thirteen active Grade 2 bridge packs with 91 lessons, 91 passages, 520 scored questions, and 362 authored word-support targets')
    expect(curriculum).toContain('Information Detectives')
    expect(curriculum).toContain('Context Cavern')
    expect(curriculum).toContain('Text Feature Hunt')
    expect(curriculum).not.toContain('Info Lab')
    expect(curriculum).not.toContain('Vocabulary Lab')
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

  test('keeps active curriculum totals aligned with the registry helper', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 13,
      activeLessonCount: 91,
      activePassageCount: 91,
      activeQuestionCount: 520,
      activeSupportTargetCount: 362,
    })
  })
})
