import { describe, expect, test } from 'vitest'

import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import {
  contentPackAudit,
  contentPacks,
  sampleContent,
  validateContent,
} from '../../src/domain/content'
import { getLessonCandidates } from '../../src/domain/lesson'

describe('grade 2 silent-letter pack', () => {
  test('the new pack is registered and remains internally coherent', () => {
    const pack = contentPacks.find((entry) => entry.manifest.packId === 'g2-word-forge-silent-letter-combinations')

    expect(pack).toBeDefined()
    expect(pack?.manifest).toEqual(expect.objectContaining({
      packId: 'g2-word-forge-silent-letter-combinations',
      packTitle: 'Grade 2 Word Forge: Silent-Letter Combinations',
      worldId: 'word-forge',
      unitId: 'wg-unit-5',
      primarySkillId: 'g2-word-forge-word-practice',
      benchmarkReferences: ['ELA.2.F.1.3e'],
      partialBenchmarkCoverage: 'Bounded Grade 2 silent-letter set covering kn, wr, mb, gh, and the island-family silent-s pattern.',
      difficultyRange: [6, 7],
      contentVersion: 'g2-wf-silent-letter-combinations-r0.1.0',
      reviewStatus: 'DRAFT',
      coveredPatterns: [
        'silent-letter-combinations',
        'silent-kn',
        'silent-wr',
        'silent-mb',
        'silent-gh',
        'silent-s-island',
      ],
    }))
    expect(pack?.lessons).toHaveLength(7)
    expect(pack?.passages).toHaveLength(7)
    expect(pack?.questions).toHaveLength(41)
    expect(pack?.questions.filter((question) => question.questionType === 'multiple_choice')).toHaveLength(20)
    expect(pack?.questions.filter((question) => question.questionType === 'multi_select')).toHaveLength(7)
    expect(pack?.questions.filter((question) => question.questionType === 'hot_text')).toHaveLength(7)
    expect(pack?.questions.filter((question) => question.questionType === 'table_match')).toHaveLength(7)
    expect(pack?.passages.every((passage) => (passage.wordSupportTargets ?? []).length === 4)).toBe(true)
    expect(validateContent(sampleContent)).toEqual([])
    expect(contentPackAudit).toHaveLength(0)
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3e')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3e',
      expectedPatterns: ['silent-letter-combinations'],
      coveredPatterns: ['silent-letter-combinations'],
      missingPatterns: [],
      contributingPackIds: ['g2-word-forge-silent-letter-combinations'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('the silent-letter pack adds the expected active lesson mix', () => {
    const activeLessons = getLessonCandidates().filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-silent-letter-combinations-'))

    expect(activeLessons).toHaveLength(7)
    expect(activeLessons.filter((candidate) => candidate.difficulty === 6)).toHaveLength(2)
    expect(activeLessons.filter((candidate) => candidate.difficulty === 7)).toHaveLength(5)
    expect(activeLessons.map((candidate) => candidate.lessonId)).toEqual([
      'lesson-word-forge-silent-letter-combinations-guided-quiet-beginnings',
      'lesson-word-forge-silent-letter-combinations-guided-quiet-endings',
      'lesson-word-forge-silent-letter-combinations-guided-quiet-review',
      'lesson-word-forge-silent-letter-combinations-guided-quiet-families',
      'lesson-word-forge-silent-letter-combinations-checkpoint-a',
      'lesson-word-forge-silent-letter-combinations-checkpoint-b',
      'lesson-word-forge-silent-letter-combinations-checkpoint-c',
    ])
  })
})
