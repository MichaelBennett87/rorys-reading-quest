import { describe, expect, test } from 'vitest'

import {
  benchmarkCoverageAudit,
  contentPackAudit,
  contentPacks,
  fluencyPracticeAudit,
  grade3FluencyPracticeAudit,
  sampleContent,
} from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import { getActiveContentRegistryTotals } from '../../src/domain/content/packs/registry'
import { buildGrade2CoverageSnapshot, grade2BenchmarkInventory } from '../../src/domain/curriculum'
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
      'g2-context-cavern-meaning-clue-chamber',
      'g2-compare-castle-wordplay-watchtower',
      'g2-compare-castle-retell-hall',
      'g2-compare-castle-compare-keep',
      'g3-word-forge-root-reactor',
      'g3-word-forge-suffix-shifter',
      'g3-word-forge-multisyllable-mountain',
      'g3-word-forge-fluency-flight',
      'g3-story-scouts-character-arc-camp',
      'g3-story-scouts-theme-development-trail',
      'g3-story-scouts-perspective-portal',
      'g3-poetry-planet-poem-form-observatory',
      'g3-information-detectives-structure-station',
      'g3-information-detectives-central-idea-engine',
      'g3-information-detectives-purpose-development-path',
      'g3-information-detectives-claim-evidence-court',
      'legacy-word-forge-development-pack',
    ])
    expect(activePacks).toHaveLength(34)
    expect(activePacks.reduce((sum, pack) => sum + pack.lessons.length, 0)).toBe(238)
    expect(activePacks.reduce((sum, pack) => sum + pack.passages.length, 0)).toBe(245)
    expect(activePacks.reduce((sum, pack) => sum + pack.questions.length, 0)).toBe(1368)
    expect(activePacks.reduce((sum, pack) => sum + pack.passages.reduce((passageSum, passage) => passageSum + (passage.wordSupportTargets?.length ?? 0), 0), 0)).toBe(943)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 34,
      activeLessonCount: 238,
      activePassageCount: 245,
      activeQuestionCount: 1368,
      activeSupportTargetCount: 943,
    })
    expect(contentPackAudit, JSON.stringify(contentPackAudit, null, 2)).toHaveLength(0)
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
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.3.2')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.3.2',
      expectedPatterns: ['literary-retell', 'informational-retell'],
      coveredPatterns: ['literary-retell', 'informational-retell'],
      missingPatterns: [],
      contributingPackIds: ['g2-compare-castle-retell-hall'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.3.3')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.3.3',
      expectedPatterns: ['compare-contrast-important-details', 'same-topic-or-theme'],
      coveredPatterns: ['compare-contrast-important-details', 'same-topic-or-theme'],
      missingPatterns: [],
      contributingPackIds: ['g2-compare-castle-compare-keep'],
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
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.V.1.3')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.V.1.3',
      expectedPatterns: ['context-clues', 'word-relationships', 'reference-materials', 'background-knowledge'],
      coveredPatterns: ['context-clues', 'word-relationships', 'reference-materials', 'background-knowledge'],
      missingPatterns: [],
      contributingPackIds: ['g2-context-cavern-meaning-clue-chamber'],
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
    expect(grade3FluencyPracticeAudit).toEqual(expect.objectContaining({
      supportingBenchmarkReference: 'ELA.3.F.1.4',
      missingSupportComponents: [],
      contributingPackIds: ['g3-word-forge-fluency-flight'],
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

  test('keeps the Grade 2 benchmark inventory immutable and complete', () => {
    expect(Object.isFrozen(grade2BenchmarkInventory)).toBe(true)
    expect(grade2BenchmarkInventory.every((entry) => Object.isFrozen(entry))).toBe(true)
    expect(grade2BenchmarkInventory).toHaveLength(20)
    expect(new Set(grade2BenchmarkInventory.map((entry) => entry.benchmarkReference)).size).toBe(20)
    expect(grade2BenchmarkInventory.map((entry) => entry.benchmarkReference)).toEqual([
      'ELA.2.F.1.3a',
      'ELA.2.F.1.3b',
      'ELA.2.F.1.3c',
      'ELA.2.F.1.3d',
      'ELA.2.F.1.3e',
      'ELA.2.F.1.4',
      'ELA.2.R.1.1',
      'ELA.2.R.1.2',
      'ELA.2.R.1.3',
      'ELA.2.R.1.4',
      'ELA.2.R.2.1',
      'ELA.2.R.2.2',
      'ELA.2.R.2.3',
      'ELA.2.R.2.4',
      'ELA.2.R.3.1',
      'ELA.2.R.3.2',
      'ELA.2.R.3.3',
      'ELA.2.V.1.1',
      'ELA.2.V.1.2',
      'ELA.2.V.1.3',
    ])
    expect(grade2BenchmarkInventory.find((entry) => entry.benchmarkReference === 'ELA.2.F.1.4')?.intendedCoverageKind).toBe('supportive_practice')
    expect(grade2BenchmarkInventory.filter((entry) => entry.intendedCoverageKind === 'benchmark')).toHaveLength(19)
  })

  test('builds the Grade 2 coverage snapshot without mutating the registry or the inventory', () => {
    const packsSnapshot = structuredClone(contentPacks)
    const inventorySnapshot = structuredClone(grade2BenchmarkInventory)
    const snapshot = buildGrade2CoverageSnapshot()

    expect(snapshot.rows).toHaveLength(20)
    expect(snapshot.rows.map((row) => row.benchmarkReference)).toEqual(grade2BenchmarkInventory.map((entry) => entry.benchmarkReference))
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.2.F.1.4')).toEqual(expect.objectContaining({
      coverageKind: 'supportive_practice',
      coverageStatus: 'supportive_practice',
      reviewStatus: 'DRAFT',
    }))
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.2.R.3.1')).toEqual(expect.objectContaining({
      coverageKind: 'benchmark',
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
      contributingPackIds: ['g2-compare-castle-wordplay-watchtower'],
      missingPatterns: [],
    }))
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.2.R.3.2')).toEqual(expect.objectContaining({
      coverageStatus: 'implemented',
      contributingPackIds: ['g2-compare-castle-retell-hall'],
      missingPatterns: [],
    }))
    expect(snapshot.rows.find((row) => row.benchmarkReference === 'ELA.2.R.3.3')).toEqual(expect.objectContaining({
      coverageKind: 'benchmark',
      coverageStatus: 'implemented',
      contributingPackIds: ['g2-compare-castle-compare-keep'],
      missingPatterns: [],
    }))
    expect(snapshot.rows.every((row) => row.reviewStatus === 'DRAFT')).toBe(true)
    expect(contentPacks).toEqual(packsSnapshot)
    expect(grade2BenchmarkInventory).toEqual(inventorySnapshot)
  })

  test('keeps the Compare Keep pack aligned with paired-text expectations', () => {
    const compareKeepPack = contentPacks.find((pack) => pack.manifest.packId === 'g2-compare-castle-compare-keep')
    expect(compareKeepPack).toBeDefined()
    expect(compareKeepPack?.manifest).toEqual(expect.objectContaining({
      packTitle: 'Grade 2 Compare Castle: Compare Keep',
      worldId: 'compare-castle',
      unitId: 'cg-unit-3',
      primarySkillId: 'g2-across-genres-reading',
      benchmarkReferences: ['ELA.2.R.3.3'],
      reviewStatus: 'DRAFT',
      difficultyRange: [2, 3],
      coverageKind: 'benchmark',
    }))
    expect(compareKeepPack?.passages).toHaveLength(14)
    expect(compareKeepPack?.passages.filter((passage) => passage.contentKind === 'prose')).toHaveLength(6)
    expect(compareKeepPack?.passages.filter((passage) => passage.contentKind === 'poem')).toHaveLength(2)
    expect(compareKeepPack?.passages.filter((passage) => passage.contentKind === 'informational')).toHaveLength(6)
    expect(compareKeepPack?.lessons).toHaveLength(7)
    expect(compareKeepPack?.questions).toHaveLength(41)
    expect(compareKeepPack?.pairedTextSets).toHaveLength(7)
    expect(compareKeepPack?.pairedTextComparisonGuides).toHaveLength(7)
    expect(compareKeepPack?.questions.filter((question) => question.questionType === 'multiple_choice')).toHaveLength(17)
    expect(compareKeepPack?.questions.filter((question) => question.questionType === 'multi_select')).toHaveLength(7)
    expect(compareKeepPack?.questions.filter((question) => question.questionType === 'hot_text')).toHaveLength(7)
    expect(compareKeepPack?.questions.filter((question) => question.questionType === 'table_match')).toHaveLength(7)
    expect(compareKeepPack?.questions.filter((question) => question.questionType === 'two_part')).toHaveLength(3)
    expect(compareKeepPack?.passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0)).toBe(28)
    expect(compareKeepPack?.lessons.every((lesson) => lesson.pairedTextSetId)).toBe(true)
    expect(compareKeepPack?.lessons.every((lesson) => lesson.contentVersion === 'g2-cg-compare-r0.1.0')).toBe(true)
    expect(compareKeepPack?.questions.every((question) => question.contentVersion === 'g2-cg-compare-r0.1.0')).toBe(true)
    expect(compareKeepPack?.questions.every((question) => question.benchmarkReference === 'ELA.2.R.3.3')).toBe(true)
  })
})
