import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { getActiveContentPacks, getActiveContentRegistryTotals } from '../src/domain/content/packs'
import { buildGrade3CoverageSnapshot } from '../src/domain/curriculum/grade3CoverageSnapshot'

const read = (path: string) => readFileSync(path, 'utf8')

describe('Phase 7B3 acceptance documentation and coverage', () => {
  test('records the bounded Perspective Portal release and keeps Phase 7B4 unstarted', () => {
    const report = read('docs/PHASE_7B3_REPORT.md')
    const tasks = read('TASKS.md')

    expect(report).toContain('Starting local and remote SHA: `c0d36e71b2543854069840c58e72fc8efcd8bbbb`')
    expect(report).toContain('Phase 7B4 Poem Form Observatory is next and remains unstarted.')
    expect(tasks).toContain('- [x] Phase 7B3 - Perspective Portal Grade 3')
    expect(tasks).toContain('- [x] Phase 7B4 - Poem Form Observatory')
    expect(tasks).toContain('- [x] Phase 7B')
    expect(tasks).toContain('- [ ] Phase 7')
  })

  test('reports the production inventory and implemented DRAFT benchmark without approval', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 36,
      activeLessonCount: 252,
      activePassageCount: 259,
      activeQuestionCount: 1450,
      activeSupportTargetCount: 999,
    })
    expect(getActiveContentPacks().filter((pack) => pack.manifest.packId === 'g3-story-scouts-perspective-portal')).toHaveLength(1)

    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(11)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(4)
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.3')).toMatchObject({
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      contributingPackIds: ['g3-story-scouts-perspective-portal'],
      coveredPatterns: [
        'character-perspective',
        'different-character-perspectives',
        'similar-character-perspectives',
        'perspective-evidence',
        'perspective-change',
      ],
      missingPatterns: [],
    })
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
  })
})
