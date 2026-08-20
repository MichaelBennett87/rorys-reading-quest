import { describe, expect, test } from 'vitest'

import {
  benchmarkCoverageAudit,
  contentPackAudit,
  contentPacks,
  sampleContent,
  validateContent,
} from '../../src/domain/content'
import { getLessonCandidates } from '../../src/domain/lesson'

describe('grade 2 syllable summit pack', () => {
  test('the new pack is registered and remains internally coherent', () => {
    const pack = contentPacks.find((entry) => entry.manifest.packId === 'g2-word-forge-two-syllable-open-closed')

    expect(pack).toBeDefined()
    expect(pack?.manifest).toEqual(expect.objectContaining({
      packId: 'g2-word-forge-two-syllable-open-closed',
      packTitle: 'Grade 2 Word Forge: Two-Syllable, Open, and Closed Words',
      worldId: 'word-forge',
      unitId: 'wg-unit-2',
      primarySkillId: 'g2-word-forge-word-practice',
      benchmarkReferences: ['ELA.2.F.1.3b', 'ELA.2.F.1.3c'],
      partialBenchmarkCoverage: 'two-syllable words plus open and closed syllables; consonant-le deferred',
      difficultyRange: [2, 3],
      contentVersion: 'g2-wf-two-syllable-open-closed-r0.1.0',
      reviewStatus: 'DRAFT',
      coveredPatterns: ['two-syllable-short-vowels', 'two-syllable-long-vowels', 'open-syllable', 'closed-syllable'],
    }))
    expect(pack?.lessons).toHaveLength(7)
    expect(pack?.passages).toHaveLength(7)
    expect(pack?.questions).toHaveLength(41)
    expect(pack?.passages.every((passage) => (passage.wordSupportTargets ?? []).length >= 3 && (passage.wordSupportTargets ?? []).length <= 5)).toBe(true)
    expect(validateContent(sampleContent)).toEqual([])
    expect(contentPackAudit).toHaveLength(0)
    expect(benchmarkCoverageAudit).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3a',
      coveredPatterns: ['oo', 'ea', 'ou', 'oi', 'oy', 'ow'],
      missingPatterns: [],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('the Syllable Summit pack adds the expected active lesson mix', () => {
    const activeSyllableSummitLessons = getLessonCandidates().filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-syllable-summit-'))

    expect(activeSyllableSummitLessons).toHaveLength(7)
    expect(activeSyllableSummitLessons.filter((candidate) => candidate.difficulty === 2)).toHaveLength(2)
    expect(activeSyllableSummitLessons.filter((candidate) => candidate.difficulty === 3)).toHaveLength(5)
    expect(activeSyllableSummitLessons.map((candidate) => candidate.lessonId)).toEqual([
      'lesson-word-forge-syllable-summit-guided-closed',
      'lesson-word-forge-syllable-summit-guided-open',
      'lesson-word-forge-syllable-summit-guided-short-vowels',
      'lesson-word-forge-syllable-summit-guided-long-vowels',
      'lesson-word-forge-syllable-summit-checkpoint-a',
      'lesson-word-forge-syllable-summit-checkpoint-b',
      'lesson-word-forge-syllable-summit-checkpoint-c',
    ])
  })
})
