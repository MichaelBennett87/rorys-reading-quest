import { describe, expect, test } from 'vitest'

import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import { contentPackAudit, contentPacks, sampleContent, validateContent } from '../../src/domain/content'
import { getLessonCandidates } from '../../src/domain/lesson'

describe('grade 2 common-suffix pack', () => {
  test('the new pack is registered and remains internally coherent', () => {
    const pack = contentPacks.find((entry) => entry.manifest.packId === 'g2-word-forge-common-suffixes')

    expect(pack).toBeDefined()
    expect(pack?.manifest).toEqual(expect.objectContaining({
      packId: 'g2-word-forge-common-suffixes',
      packTitle: 'Grade 2 Word Forge: Common Suffixes',
      worldId: 'word-forge',
      unitId: 'wg-unit-4',
      primarySkillId: 'g2-word-forge-word-practice',
      benchmarkReferences: ['ELA.2.F.1.3d'],
      partialBenchmarkCoverage: 'Common suffixes completing the DRAFT prefix-and-suffix benchmark coverage.',
      difficultyRange: [5, 6],
      contentVersion: 'g2-wf-common-suffixes-r0.1.0',
      reviewStatus: 'DRAFT',
      coveredPatterns: [
        'common-suffixes',
        'suffix-s-es',
        'suffix-ed',
        'suffix-ing',
        'suffix-er-est',
        'suffix-ful-less',
        'suffix-ly',
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
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3d')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3d',
      expectedPatterns: ['common-prefixes', 'common-suffixes'],
      coveredPatterns: ['common-prefixes', 'common-suffixes'],
      missingPatterns: [],
      contributingPackIds: [
        'g2-word-forge-common-prefixes',
        'g2-word-forge-common-suffixes',
      ],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('the common-suffix pack adds the expected active lesson mix', () => {
    const activeLessons = getLessonCandidates().filter((candidate) => candidate.lessonId.startsWith('lesson-word-forge-common-suffixes-'))

    expect(activeLessons).toHaveLength(7)
    expect(activeLessons.filter((candidate) => candidate.difficulty === 5)).toHaveLength(2)
    expect(activeLessons.filter((candidate) => candidate.difficulty === 6)).toHaveLength(5)
    expect(activeLessons.map((candidate) => candidate.lessonId)).toEqual([
      'lesson-word-forge-common-suffixes-guided-base-and-ending',
      'lesson-word-forge-common-suffixes-guided-ending-sound',
      'lesson-word-forge-common-suffixes-guided-action-endings',
      'lesson-word-forge-common-suffixes-guided-meaning-endings',
      'lesson-word-forge-common-suffixes-checkpoint-a',
      'lesson-word-forge-common-suffixes-checkpoint-b',
      'lesson-word-forge-common-suffixes-checkpoint-c',
    ])
  })
})
