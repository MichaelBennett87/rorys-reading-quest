import { describe, expect, test } from 'vitest'

import {
  benchmarkCoverageAudit,
  contentPackAudit,
  contentPacks,
  sampleContent,
  validateContent,
} from '../../src/domain/content'
import { getLessonCandidates } from '../../src/domain/lesson'

describe('grade 2 trail 2 vowel pack', () => {
  test('the new pack is registered and remains internally coherent', () => {
    const pack = contentPacks.find((entry) => entry.manifest.packId === 'g2-word-forge-variable-vowels-ou-oi-oy-ow')

    expect(pack).toBeDefined()
    expect(pack?.manifest).toEqual(expect.objectContaining({
      packId: 'g2-word-forge-variable-vowels-ou-oi-oy-ow',
      packTitle: 'Grade 2 Word Forge: OU, OI, OY, and OW',
      worldId: 'word-forge',
      unitId: 'wg-unit-1',
      primarySkillId: 'g2-word-forge-word-practice',
      benchmarkReferences: ['ELA.2.F.1.3a'],
      partialBenchmarkCoverage: 'ou, oi, oy, and ow',
      difficultyRange: [1, 2],
      contentVersion: 'g2-wf-ou-oi-oy-ow-r0.1.0',
      reviewStatus: 'DRAFT',
      coveredPatterns: ['ou', 'oi', 'oy', 'ow'],
    }))
    expect(pack?.lessons).toHaveLength(7)
    expect(pack?.passages).toHaveLength(7)
    expect(pack?.questions).toHaveLength(41)
    expect(pack?.passages.every((passage) => (passage.wordSupportTargets ?? []).length === 4)).toBe(true)
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

  test('the Trail 2 pack adds the expected active lesson mix', () => {
    const activeTrail2Lessons = getLessonCandidates().filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-ou-oi-oy-ow-'))

    expect(activeTrail2Lessons).toHaveLength(7)
    expect(activeTrail2Lessons.filter((candidate) => candidate.difficulty === 1)).toHaveLength(2)
    expect(activeTrail2Lessons.filter((candidate) => candidate.difficulty === 2)).toHaveLength(5)
    expect(activeTrail2Lessons.map((candidate) => candidate.lessonId)).toEqual([
      'lesson-word-forge-ou-oi-oy-ow-guided-ou-ow-prereq',
      'lesson-word-forge-ou-oi-oy-ow-guided-oi-oy-prereq',
      'lesson-word-forge-ou-oi-oy-ow-guided-ou-ow-practice',
      'lesson-word-forge-ou-oi-oy-ow-guided-oi-oy-practice',
      'lesson-word-forge-ou-oi-oy-ow-checkpoint-a',
      'lesson-word-forge-ou-oi-oy-ow-checkpoint-b',
      'lesson-word-forge-ou-oi-oy-ow-checkpoint-c',
    ])
  })
})
