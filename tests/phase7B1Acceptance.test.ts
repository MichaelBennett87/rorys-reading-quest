import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

import { buildGrade3CoverageSnapshot, curriculumTracks } from '../src/domain/curriculum'
import { getActiveContentRegistryTotals } from '../src/domain/content/packs'

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

describe('Phase 7B1 acceptance documentation and coverage', () => {
  test('preserves the bounded Character Arc Camp checkpoint and reconciles its final synchronization', () => {
    const report = read('docs/PHASE_7B1_REPORT.md')
    const tasks = read('TASKS.md')
    expect(report).toContain('Starting local and remote SHA: `90d2afcd51efe19312e3acc0634f05b4ccb549d0`')
    expect(report).toContain('Phase 7B2 Theme Development Trail is next and remains unstarted.')
    expect(report).toContain('Final synchronized SHA: `6255b41bf5eece960331afca4678ebd1b5e87cea`')
    expect(tasks).toContain('- [x] Phase 7B1 - Character Arc Camp')
    expect(tasks).toContain('- [x] Phase 7B2 - Theme Development Trail')
  })

  test('keeps the final registry and Grade 3 coverage boundary exact', () => {
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 28,
      activeLessonCount: 196,
      activePassageCount: 203,
      activeQuestionCount: 1122,
      activeSupportTargetCount: 775,
    })
    const snapshot = buildGrade3CoverageSnapshot()
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'implemented')).toHaveLength(3)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'supportive_practice')).toHaveLength(1)
    expect(snapshot.rows.filter((row) => row.coverageStatus === 'planned')).toHaveLength(12)
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.1')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT' })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.2')).toMatchObject({ coverageStatus: 'implemented', reviewStatus: 'DRAFT' })
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.3')?.coverageStatus).toBe('planned')
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.3.R.1.4')?.coverageStatus).toBe('planned')
    expect(curriculumTracks.filter((track) => track.gradeBand === 3 && track.status === 'active').map((track) => track.trackId)).toEqual([
      'g3-word-forge-foundations', 'g3-story-scouts-prose',
    ])
  })
})
