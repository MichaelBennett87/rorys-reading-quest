import { describe, expect, test } from 'vitest'

import {
  benchmarkCoverageAudit,
  contentPackAudit,
  contentPacks,
  sampleContent,
  validateContent,
} from '../../src/domain/content'
import { getLessonCandidates } from '../../src/domain/lesson'

describe('grade 2 consonant-le pack', () => {
  test('the new pack is registered and remains internally coherent', () => {
    const pack = contentPacks.find((entry) => entry.manifest.packId === 'g2-word-forge-consonant-le-integrated')

    expect(pack).toBeDefined()
    expect(pack?.manifest).toEqual(expect.objectContaining({
      packId: 'g2-word-forge-consonant-le-integrated',
      packTitle: 'Grade 2 Word Forge: Consonant-LE and Syllable Review',
      worldId: 'word-forge',
      unitId: 'wg-unit-2',
      primarySkillId: 'g2-word-forge-word-practice',
      benchmarkReferences: ['ELA.2.F.1.3c'],
      partialBenchmarkCoverage: 'consonant-le with integrated open and closed syllable review',
      difficultyRange: [3, 4],
      contentVersion: 'g2-wf-consonant-le-integrated-r0.1.0',
      reviewStatus: 'DRAFT',
      coveredPatterns: ['consonant-le'],
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

  test('the consonant-le pack adds the expected active lesson mix', () => {
    const activeLessons = getLessonCandidates().filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-consonant-le-'))

    expect(activeLessons).toHaveLength(7)
    expect(activeLessons.filter((candidate) => candidate.difficulty === 3)).toHaveLength(2)
    expect(activeLessons.filter((candidate) => candidate.difficulty === 4)).toHaveLength(5)
    expect(activeLessons.map((candidate) => candidate.lessonId)).toEqual([
      'lesson-word-forge-consonant-le-guided-final-beat',
      'lesson-word-forge-consonant-le-guided-split-before',
      'lesson-word-forge-consonant-le-guided-practice',
      'lesson-word-forge-consonant-le-guided-mixed',
      'lesson-word-forge-consonant-le-checkpoint-a',
      'lesson-word-forge-consonant-le-checkpoint-b',
      'lesson-word-forge-consonant-le-checkpoint-c',
    ])
  })
})
