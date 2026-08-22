import { describe, expect, test } from 'vitest'

import {
  benchmarkCoverageAudit,
  contentPackAudit,
  contentPacks,
  fluencyPracticeAudit,
  sampleContent,
} from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import { getActiveContentRegistryTotals } from '../../src/domain/content/packs/registry'
import { getLessonById, getLessonCandidates, getLessonForUnit } from '../../src/domain/lesson'

describe('grade 2 content pack registry', () => {
  test('registered packs aggregate into the existing content export without mutating source packs', () => {
    const packsSnapshot = structuredClone(contentPacks)
    const sampleSnapshot = structuredClone(sampleContent)
    const activePacks = contentPacks.filter((pack) => pack.manifest.packId !== 'legacy-word-forge-development-pack')

    expect(new Set(contentPacks.map((pack) => pack.manifest.packId)).size).toBe(contentPacks.length)
    expect(contentPacks.map((pack) => pack.manifest.packId)).toEqual([
      'g2-word-forge-variable-vowels-oo-ea',
      'g2-word-forge-variable-vowels-ou-oi-oy-ow',
      'g2-word-forge-two-syllable-open-closed',
      'g2-word-forge-consonant-le-integrated',
      'g2-word-forge-common-prefixes',
      'g2-word-forge-common-suffixes',
      'g2-word-forge-silent-letter-combinations',
      'g2-word-forge-fluency-practice-foundations',
      'g2-story-scouts-plot-structure-elements',
      'g2-story-scouts-theme-trail',
      'g2-story-scouts-perspective-portal',
      'g2-poetry-planet-rhyme-routes',
      'g2-information-detectives-text-feature-hunt',
      'g2-information-detectives-central-idea-center',
      'g2-information-detectives-purpose-path',
      'g2-information-detectives-opinion-evidence-desk',
      'g2-context-cavern-academic-word-workshop',
      'g2-context-cavern-morphology-mine',
      'legacy-word-forge-development-pack',
    ])
    expect(activePacks).toHaveLength(18)
    expect(activePacks.reduce((sum, pack) => sum + pack.lessons.length, 0)).toBe(126)
    expect(activePacks.reduce((sum, pack) => sum + pack.passages.length, 0)).toBe(126)
    expect(activePacks.reduce((sum, pack) => sum + pack.questions.length, 0)).toBe(725)
    expect(activePacks.reduce((sum, pack) => sum + pack.passages.reduce((passageSum, passage) => passageSum + (passage.wordSupportTargets?.length ?? 0), 0), 0)).toBe(502)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 18,
      activeLessonCount: 126,
      activePassageCount: 126,
      activeQuestionCount: 725,
      activeSupportTargetCount: 502,
    })
    expect(contentPackAudit).toHaveLength(0)
    expect(benchmarkCoverageAudit).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3a',
      expectedPatterns: ['oo', 'ea', 'ou', 'oi', 'oy', 'ow'],
      coveredPatterns: ['oo', 'ea', 'ou', 'oi', 'oy', 'ow'],
      missingPatterns: [],
      contributingPackIds: [
        'g2-word-forge-variable-vowels-oo-ea',
        'g2-word-forge-variable-vowels-ou-oi-oy-ow',
      ],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
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
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3e')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.F.1.3e',
      expectedPatterns: ['silent-letter-combinations'],
      coveredPatterns: ['silent-letter-combinations'],
      missingPatterns: [],
      contributingPackIds: ['g2-word-forge-silent-letter-combinations'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.1.1')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.1.1',
      expectedPatterns: ['plot-structure', 'setting', 'characters', 'sequence-of-events'],
      coveredPatterns: ['plot-structure', 'setting', 'characters', 'sequence-of-events'],
      missingPatterns: [],
      contributingPackIds: ['g2-story-scouts-plot-structure-elements'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.1.4')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.1.4',
      expectedPatterns: ['rhyme-scheme-identification', 'rhyme-scheme-notation'],
      coveredPatterns: ['rhyme-scheme-identification', 'rhyme-scheme-notation'],
      missingPatterns: [],
      contributingPackIds: ['g2-poetry-planet-rhyme-routes'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.2.1')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.2.1',
      expectedPatterns: ['informational-text-features', 'feature-meaning'],
      coveredPatterns: ['informational-text-features', 'feature-meaning'],
      missingPatterns: [],
      contributingPackIds: ['g2-information-detectives-text-feature-hunt'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.2.2')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.2.2',
      expectedPatterns: ['central-idea', 'relevant-details'],
      coveredPatterns: ['central-idea', 'relevant-details'],
      missingPatterns: [],
      contributingPackIds: ['g2-information-detectives-central-idea-center'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.2.3')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.2.3',
      expectedPatterns: ['informational-author-purpose'],
      coveredPatterns: ['informational-author-purpose'],
      missingPatterns: [],
      contributingPackIds: ['g2-information-detectives-purpose-path'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.2.4')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.2.4',
      expectedPatterns: ['opinion', 'supporting-evidence'],
      coveredPatterns: ['opinion', 'supporting-evidence'],
      missingPatterns: [],
      contributingPackIds: ['g2-information-detectives-opinion-evidence-desk'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.V.1.2')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.V.1.2',
      expectedPatterns: ['base-words', 'affixes'],
      coveredPatterns: ['base-words', 'affixes'],
      missingPatterns: [],
      contributingPackIds: ['g2-context-cavern-morphology-mine'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(fluencyPracticeAudit).toEqual(expect.objectContaining({
      supportingBenchmarkReference: 'ELA.2.F.1.4',
      expectedSupportComponents: expect.arrayContaining([
        'model-reading',
        'phrase-cued-reading',
        'punctuation-pauses',
        'question-expression',
        'exclamation-expression',
        'dialogue-expression',
        'repeated-reading',
        'self-monitoring',
        'understanding-check',
      ]),
      missingSupportComponents: [],
      contributingPackIds: ['g2-word-forge-fluency-practice-foundations'],
      supportStatus: 'supportive_practice',
      reviewStatus: 'DRAFT',
      oralReadingMeasured: false,
      timerUsed: false,
      microphoneUsed: false,
    }))
    expect(contentPacks).toEqual(packsSnapshot)
    expect(sampleContent).toEqual(sampleSnapshot)
  })

  test('legacy content remains resolvable but is excluded from fresh selection', () => {
    expect(getLessonById('lesson-word-forge-vowel-voyage-a').lesson?.selectionStatus).toBe('legacy')
    expect(getLessonCandidates().map((candidate) => candidate.lessonId)).not.toEqual(expect.arrayContaining([
      'lesson-word-forge-vowel-voyage-a',
      'lesson-word-forge-vowel-voyage-b',
      'lesson-word-forge-vowel-voyage-c',
      'lesson-word-forge-building-block',
    ]))
  })

  test('the active unit resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-1')

    expect(result.lesson?.lessonId).toBe('lesson-word-forge-oo-ea-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })

  test('the new syllable summit unit resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-2')

    expect(result.lesson?.lessonId).toBe('lesson-word-forge-syllable-summit-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })

  test('the prefix power unit resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-3')

    expect(result.lesson?.lessonId).toBe('lesson-word-forge-common-prefixes-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })

  test('the suffix station unit resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-4')

    expect(result.lesson?.lessonId).toBe('lesson-word-forge-common-suffixes-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })

  test('the quiet letter quest unit resolves to the new checkpoint lesson', () => {
    const result = getLessonForUnit('wg-unit-5')

    expect(result.lesson?.lessonId).toBe('lesson-word-forge-silent-letter-combinations-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })

  test('the story scouts unit resolves to the story map checkpoint lesson', () => {
    const result = getLessonForUnit('ss-unit-1')

    expect(result.lesson?.lessonId).toBe('g2-story-scouts-plot-structure-elements-lesson-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })

  test('the poetry planet unit resolves to the rhyme routes checkpoint lesson', () => {
    const result = getLessonForUnit('pp-unit-1')

    expect(result.lesson?.lessonId).toBe('g2-poetry-planet-rhyme-routes-lesson-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })
})
