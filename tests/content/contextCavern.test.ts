import { describe, expect, test } from 'vitest'

import { validateContent, resolvePassageEvidence, sampleContent } from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import {
  contentPackAudit,
  contentPacks,
  getActiveContentRegistryTotals,
} from '../../src/domain/content/packs/registry'
import { grade2ContextCavernAcademicWordWorkshopPack } from '../../src/domain/content/packs/grade2/contextCavern/academicWordWorkshop'
import { grade2ContextCavernMorphologyMinePack } from '../../src/domain/content/packs/grade2/contextCavern/morphologyMine'

const approvedAcademicWords = new Set([
  'compare',
  'describe',
  'explain',
  'identify',
  'observe',
  'predict',
  'reason',
  'result',
  'example',
  'detail',
  'sequence',
  'measure',
  'record',
  'category',
])

const approvedMorphologyWords = new Set([
  'unpack',
  'rebuild',
  'preheat',
  'disagree',
  'miscount',
  'plants',
  'boxes',
  'helped',
  'helping',
  'faster',
  'tallest',
  'helpful',
  'careless',
  'slowly',
])

describe('grade 2 context cavern academic word workshop pack', () => {
  test('registers as the active Context Cavern pack with the expected totals', () => {
    const pack = grade2ContextCavernAcademicWordWorkshopPack
    const activePackIds = contentPacks.filter((entry) => !entry.manifest.packId.startsWith('legacy-')).map((entry) => entry.manifest.packId)

    expect(pack.manifest.packId).toBe('g2-context-cavern-academic-word-workshop')
    expect(pack.manifest.packTitle).toBe('Grade 2 Context Cavern: Academic Word Workshop')
    expect(pack.manifest.worldId).toBe('context-cavern')
    expect(pack.manifest.unitId).toBe('cc-unit-1')
    expect(pack.manifest.primarySkillId).toBe('g2-context-cavern-vocabulary')
    expect(pack.manifest.reviewStatus).toBe('DRAFT')
    expect(pack.manifest.contentVersion).toBe('g2-cc-academic-word-r0.1.0')
    expect(pack.manifest.partialBenchmarkCoverage).toContain('academic vocabulary use in speaking and writing contexts')
    expect(pack.manifest.coveredPatterns).toEqual([
      'academic-vocabulary-use',
      'speaking-vocabulary-use',
      'writing-vocabulary-use',
      'cross-subject-vocabulary-use',
    ])
    expect(activePackIds).toEqual([
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
      'g3-compare-castle-figurative-fortress',
      'g3-compare-castle-summary-stronghold',
      'g3-compare-castle-author-lens-tower',
      'g3-context-cavern-academic-word-workshop',
    'g3-context-cavern-root-meaning-vault',
    'g3-context-cavern-meaning-maze',
    ])
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40,
      activeLessonCount: 280,
      activePassageCount: 294,
      activeQuestionCount: 1614,
      activeSupportTargetCount: 1111,
    })
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.V.1.1')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.V.1.1',
      expectedPatterns: ['academic-vocabulary-use'],
      coveredPatterns: ['academic-vocabulary-use'],
      missingPatterns: [],
      contributingPackIds: ['g2-context-cavern-academic-word-workshop'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(validateContent(sampleContent)).toHaveLength(0)
    expect(contentPackAudit).toHaveLength(0)
  })

  test('authors seven passages, seven guides, and forty-one questions', () => {
    const pack = grade2ContextCavernAcademicWordWorkshopPack
    const questionTypeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})

    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(pack.academicVocabularyGuides).toHaveLength(7)
    expect(questionTypeCounts).toEqual({
      multiple_choice: 17,
      multi_select: 7,
      hot_text: 7,
      table_match: 7,
      two_part: 3,
    })
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(4)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 0)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 1)).toHaveLength(5)
  })

  test('every passage has a valid structure, guide, and support targets', () => {
    const pack = grade2ContextCavernAcademicWordWorkshopPack

    for (const passage of pack.passages) {
      expect(passage.contentKind).toBe('informational')
      expect(passage.reviewStatus).toBe('DRAFT')
      expect(passage.contentVersion).toBe('g2-cc-academic-word-r0.1.0')
      expect(passage.wordSupportTargets).toHaveLength(4)
      expect(passage.informationalStructure).toBeTruthy()

      const structure = passage.informationalStructure!
      const title = structure.features.find((feature) => feature.kind === 'title')
      const headings = structure.features.filter((feature) => feature.kind === 'heading')
      expect(title).toBeTruthy()
      expect(headings.length).toBeGreaterThanOrEqual(2)
      expect(structure.sections.length).toBeGreaterThanOrEqual(2)
      expect(new Set(structure.features.map((feature) => feature.featureId)).size).toBe(structure.features.length)

      const guide = pack.academicVocabularyGuides!.find((entry) => entry.passageId === passage.passageIdentifier)
      expect(guide).toBeTruthy()
      expect(guide?.reviewStatus).toBe('DRAFT')
      expect(guide?.contentVersion).toBe('g2-cc-academic-word-r0.1.0')
      expect(guide?.targets).toHaveLength(4)

      for (const target of guide?.targets ?? []) {
        expect(approvedAcademicWords.has(target.word)).toBe(true)
        expect(target.childFriendlyMeaning).toMatch(/\S/)
        expect(target.speakingExample).toMatch(/\S/)
        expect(target.writingExample).toMatch(/\S/)
        expect(target.speakingExample.toLowerCase()).toContain(target.word)
        expect(target.writingExample.toLowerCase()).toContain(target.word)
        expect(target.appropriateUseSentenceIds.length).toBeGreaterThan(0)
        expect(new Set(target.subjectContexts).size).toBeGreaterThanOrEqual(2)

        for (const sentenceId of target.appropriateUseSentenceIds) {
          expect(resolvePassageEvidence(passage, sentenceId)).toBeTruthy()
          expect(resolvePassageEvidence(passage, sentenceId)?.text).toMatch(/\S/)
        }
      }

      for (const target of passage.wordSupportTargets ?? []) {
        expect(target.reviewStatus).toBe('DRAFT')
        expect(target.contentVersion).toBe('g2-cc-academic-word-r0.1.0')
        expect(passage.sentences?.some((sentence) => sentence.sentenceId === target.sentenceId)).toBe(true)
        expect(resolvePassageEvidence(passage, target.sentenceId)?.text).toMatch(/\S/)
      }
    }
  })

  test('uses every approved academic word exactly twice across the pack', () => {
    const pack = grade2ContextCavernAcademicWordWorkshopPack
    const wordCounts = new Map<string, number>()

    for (const guide of pack.academicVocabularyGuides ?? []) {
      expect(guide.reviewStatus).toBe('DRAFT')
      expect(guide.contentVersion).toBe('g2-cc-academic-word-r0.1.0')

      for (const target of guide.targets) {
        wordCounts.set(target.word, (wordCounts.get(target.word) ?? 0) + 1)
      }
    }

    expect(new Set(wordCounts.keys())).toEqual(approvedAcademicWords)

    for (const word of approvedAcademicWords) {
      expect(wordCounts.get(word)).toBe(2)
    }
  })

  test('every question uses the Phase 6E5 benchmark contract and resolves its evidence', () => {
    const pack = grade2ContextCavernAcademicWordWorkshopPack
    const visibleAnswerText = new Set<string>()

    for (const question of pack.questions) {
      expect(question.gradeBand).toBe(2)
      expect(question.benchmarkReference).toBe('ELA.2.V.1.1')
      expect(question.skillIdentifier).toBe('g2-context-cavern-vocabulary')
      expect(question.reportingCategory).toBe('Vocabulary')
      expect(question.contentVersion).toBe('g2-cc-academic-word-r0.1.0')
      expect(question.reviewStatus).toBe('DRAFT')
      expect(question.explanation).toMatch(/\S/)
      const evidenceReferenceIds = question.evidenceReferenceIds ?? []
      expect(evidenceReferenceIds.length).toBeGreaterThan(0)

      const passage = pack.passages.find((entry) => entry.passageIdentifier === question.passageIdentifier)
      expect(passage).toBeTruthy()

      for (const evidenceId of evidenceReferenceIds) {
        expect(resolvePassageEvidence(passage!, evidenceId)).toBeTruthy()
      }

      if (question.questionContent && 'choices' in question.questionContent) {
        for (const choice of question.questionContent.choices) {
          visibleAnswerText.add(choice.text)
        }
      }
    }

    expect(visibleAnswerText.size).toBeGreaterThan(0)
  })
})

describe('grade 2 context cavern morphology mine pack', () => {
  test('registers as the active Morphology Mine pack with the expected totals', () => {
    const pack = grade2ContextCavernMorphologyMinePack

    expect(pack.manifest.packId).toBe('g2-context-cavern-morphology-mine')
    expect(pack.manifest.packTitle).toBe('Grade 2 Context Cavern: Morphology Mine')
    expect(pack.manifest.worldId).toBe('context-cavern')
    expect(pack.manifest.unitId).toBe('cc-unit-2')
    expect(pack.manifest.primarySkillId).toBe('g2-context-cavern-vocabulary')
    expect(pack.manifest.reviewStatus).toBe('DRAFT')
    expect(pack.manifest.contentVersion).toBe('g2-cc-morphology-r0.1.0')
    expect(pack.manifest.partialBenchmarkCoverage).toContain('transparent base-word and affix meaning work')
    expect(pack.manifest.coveredPatterns).toEqual([
      'base-words',
      'affixes',
      'base-word-identification',
      'base-word-meaning',
      'prefix-identification',
      'suffix-identification',
      'affix-meaning',
      'word-meaning-from-parts',
      'affix-changes-meaning',
      'word-building-for-meaning',
      'transparent-word-composition',
      'prefix-un',
      'prefix-re',
      'prefix-pre',
      'prefix-dis',
      'prefix-mis',
      'suffix-s-es',
      'suffix-ed',
      'suffix-ing',
      'suffix-er-est',
      'suffix-ful-less',
      'suffix-ly',
    ])
    expect(pack.morphologyGuides).toHaveLength(7)
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 40,
      activeLessonCount: 280,
      activePassageCount: 294,
      activeQuestionCount: 1614,
      activeSupportTargetCount: 1111,
    })
  })

  test('authors seven passages, seven guides, and forty-one questions', () => {
    const pack = grade2ContextCavernMorphologyMinePack
    const questionTypeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})

    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(pack.morphologyGuides).toHaveLength(7)
    expect(questionTypeCounts).toEqual({
      multiple_choice: 17,
      multi_select: 7,
      hot_text: 7,
      table_match: 7,
      two_part: 3,
    })
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(4)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 1)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 2)).toHaveLength(5)
  })

  test('every passage has a valid structure, guide, and support targets', () => {
    const pack = grade2ContextCavernMorphologyMinePack

    for (const passage of pack.passages) {
      expect(passage.contentKind).toBe('informational')
      expect(passage.reviewStatus).toBe('DRAFT')
      expect(passage.contentVersion).toBe('g2-cc-morphology-r0.1.0')
      expect(passage.wordSupportTargets).toHaveLength(4)
      expect(passage.informationalStructure).toBeTruthy()

      const structure = passage.informationalStructure!
      const title = structure.features.find((feature) => feature.kind === 'title')
      const headings = structure.features.filter((feature) => feature.kind === 'heading')
      expect(title).toBeTruthy()
      expect(headings.length).toBeGreaterThanOrEqual(2)
      expect(structure.sections.length).toBeGreaterThanOrEqual(2)
      expect(new Set(structure.features.map((feature) => feature.featureId)).size).toBe(structure.features.length)
      expect(new Set((passage.wordSupportTargets ?? []).map((target) => target.targetId)).size).toBe(4)

      const guide = pack.morphologyGuides!.find((entry) => entry.passageId === passage.passageIdentifier)
      expect(guide).toBeTruthy()
      expect(guide?.reviewStatus).toBe('DRAFT')
      expect(guide?.contentVersion).toBe('g2-cc-morphology-r0.1.0')
      expect(guide?.targets).toHaveLength(4)
      expect(new Set((guide?.targets ?? []).map((target) => target.targetId)).size).toBe(4)

      for (const target of guide?.targets ?? []) {
        expect(approvedMorphologyWords.has(target.surfaceWord)).toBe(true)
        expect(target.baseWord).toMatch(/\S/)
        expect(target.baseMeaning).toMatch(/\S/)
        expect(target.composedMeaning).toMatch(/\S/)
        expect(target.transparentComposition).toBe(true)
        expect(target.affixes).toHaveLength(1)
        expect(target.affixes[0].kind).toMatch(/prefix|suffix/)
        expect(target.affixes[0].surfaceForm).toMatch(/\S/)
        expect(target.affixes[0].displayLabel).toMatch(/\S/)
        expect(target.affixes[0].commonMeaning).toMatch(/\S/)

        const sentence = resolvePassageEvidence(passage, target.sentenceId)
        expect(sentence).toBeTruthy()
        expect(sentence?.text.toLowerCase()).toContain(target.surfaceWord)
      }

      for (const target of passage.wordSupportTargets ?? []) {
        expect(target.reviewStatus).toBe('DRAFT')
        expect(target.contentVersion).toBe('g2-cc-morphology-r0.1.0')
        expect(passage.sentences?.some((sentence) => sentence.sentenceId === target.sentenceId)).toBe(true)
        expect(resolvePassageEvidence(passage, target.sentenceId)?.text).toMatch(/\S/)
      }
    }
  })

  test('covers every required prefix and suffix family across the three checkpoint passages', () => {
    const pack = grade2ContextCavernMorphologyMinePack
    const requiredFamilies = new Set([
      'prefix-un',
      'prefix-re',
      'prefix-pre',
      'prefix-dis',
      'prefix-mis',
      'suffix-s-es',
      'suffix-ed',
      'suffix-ing',
      'suffix-er-est',
      'suffix-ful-less',
      'suffix-ly',
    ])
    const actualFamilies = new Set<string>()
    const checkpointPassages = pack.lessons
      .filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
      .map((lesson) => lesson.passageIdentifiers[0])
      .map((passageId) => pack.passages.find((passage) => passage.passageIdentifier === passageId))

    expect(checkpointPassages.every(Boolean)).toBe(true)
    expect(new Set(checkpointPassages.map((passage) => passage?.passageIdentifier)).size).toBe(3)

    const checkpointGuides = checkpointPassages.map((passage) => pack.morphologyGuides!.find((entry) => entry.passageId === passage!.passageIdentifier)!)

    for (const guide of checkpointGuides) {
      const prefixTargets = guide.targets.filter((target) => target.affixes[0].kind === 'prefix')
      const suffixTargets = guide.targets.filter((target) => target.affixes[0].kind === 'suffix')
      expect(prefixTargets.length).toBeGreaterThan(0)
      expect(suffixTargets.length).toBeGreaterThan(0)
    }

    for (const lesson of pack.lessons.filter((entry) => entry.lessonRole === 'CHECKPOINT')) {
      for (const questionId of lesson.questionIdentifiers) {
        const question = pack.questions.find((entry) => entry.questionIdentifier === questionId)
        for (const tag of question?.tags ?? []) {
          if (requiredFamilies.has(tag)) {
            actualFamilies.add(tag)
          }
        }
      }
    }

    expect(actualFamilies).toEqual(requiredFamilies)

    const prefixFamilyCounts = checkpointGuides.map((guide) => new Set(
      guide.targets
        .filter((target) => target.affixes[0].kind === 'prefix')
        .map((target) => target.affixes[0].surfaceForm),
    ).size)
    expect(prefixFamilyCounts[0]).toBeGreaterThanOrEqual(2)
    expect(prefixFamilyCounts[1]).toBeGreaterThanOrEqual(2)

    const suffixFamilyKinds = checkpointGuides.map((guide) => ({
      inflectional: guide.targets.some((target) => ['s', 'es', 'ed', 'ing', 'er', 'est'].includes(target.affixes[0].surfaceForm)),
      derivational: guide.targets.some((target) => ['ful', 'less', 'ly'].includes(target.affixes[0].surfaceForm)),
    }))
    expect(suffixFamilyKinds.filter((entry) => entry.inflectional && entry.derivational).length).toBeGreaterThanOrEqual(2)
  })

  test('uses every approved morphology word exactly twice across the pack', () => {
    const pack = grade2ContextCavernMorphologyMinePack
    const wordCounts = new Map<string, number>()

    for (const guide of pack.morphologyGuides ?? []) {
      expect(guide.reviewStatus).toBe('DRAFT')
      expect(guide.contentVersion).toBe('g2-cc-morphology-r0.1.0')

      for (const target of guide.targets) {
        wordCounts.set(target.surfaceWord, (wordCounts.get(target.surfaceWord) ?? 0) + 1)
      }
    }

    expect(new Set(wordCounts.keys())).toEqual(approvedMorphologyWords)

    for (const word of approvedMorphologyWords) {
      expect(wordCounts.get(word)).toBe(2)
    }
  })

  test('every question uses the Phase 6E6 benchmark contract and resolves its evidence', () => {
    const pack = grade2ContextCavernMorphologyMinePack
    const visibleAnswerText = new Set<string>()
    const correctAnswerPositions = new Map<number, number>()

    for (const question of pack.questions) {
      expect(question.gradeBand).toBe(2)
      expect(question.benchmarkReference).toBe('ELA.2.V.1.2')
      expect(question.skillIdentifier).toBe('g2-context-cavern-vocabulary')
      expect(question.reportingCategory).toBe('Vocabulary')
      expect(question.contentVersion).toBe('g2-cc-morphology-r0.1.0')
      expect(question.reviewStatus).toBe('DRAFT')
      expect(question.explanation).toMatch(/\S/)
      const evidenceReferenceIds = question.evidenceReferenceIds ?? []
      expect(evidenceReferenceIds.length).toBeGreaterThan(0)

      const passage = pack.passages.find((entry) => entry.passageIdentifier === question.passageIdentifier)
      expect(passage).toBeTruthy()

      for (const evidenceId of evidenceReferenceIds) {
        expect(resolvePassageEvidence(passage!, evidenceId)).toBeTruthy()
      }

      if (question.questionContent && 'choices' in question.questionContent) {
        expect(new Set(question.questionContent.choices.map((choice) => choice.text)).size).toBe(question.questionContent.choices.length)
        for (const choice of question.questionContent.choices) {
          visibleAnswerText.add(choice.text)
        }
      }

      if (question.questionContent && 'choices' in question.questionContent) {
        const correctChoiceIds = 'correctChoiceIds' in question.questionContent ? question.questionContent.correctChoiceIds : []
        const correctIndex = question.questionContent.choices.findIndex((choice) => correctChoiceIds.includes(choice.id))
        if (correctIndex >= 0) {
          correctAnswerPositions.set(correctIndex, (correctAnswerPositions.get(correctIndex) ?? 0) + 1)
        }
      } else if (question.questionContent && 'selectableSegments' in question.questionContent) {
        const correctSegmentIds = 'correctSegmentIds' in question.questionContent ? question.questionContent.correctSegmentIds : []
        const correctIndex = question.questionContent.selectableSegments.findIndex((segment) => correctSegmentIds.includes(segment.id))
        if (correctIndex >= 0) {
          correctAnswerPositions.set(correctIndex, (correctAnswerPositions.get(correctIndex) ?? 0) + 1)
        }
      } else if (question.questionContent && 'rows' in question.questionContent) {
        const correctIndex = question.questionContent.rows.findIndex((row) => row.options.findIndex((option) => option.id === row.correctChoiceId) >= 0)
        if (correctIndex >= 0) {
          correctAnswerPositions.set(correctIndex, (correctAnswerPositions.get(correctIndex) ?? 0) + 1)
        }
      } else if (question.questionContent && 'partAChoices' in question.questionContent) {
        const partContent = question.questionContent as {
          partAChoices: Array<{ id: string }>
          partBChoices: Array<{ id: string }>
          partACorrectChoiceId: string
          partBCorrectChoiceId: string
        }
        const partACorrectIndex = partContent.partAChoices.findIndex((choice) => choice.id === partContent.partACorrectChoiceId)
        const partBCorrectIndex = partContent.partBChoices.findIndex((choice) => choice.id === partContent.partBCorrectChoiceId)
        if (partACorrectIndex >= 0) {
          correctAnswerPositions.set(partACorrectIndex, (correctAnswerPositions.get(partACorrectIndex) ?? 0) + 1)
        }
        if (partBCorrectIndex >= 0) {
          correctAnswerPositions.set(partBCorrectIndex, (correctAnswerPositions.get(partBCorrectIndex) ?? 0) + 1)
        }
      }
    }

    expect(visibleAnswerText.size).toBeGreaterThan(0)
    expect(correctAnswerPositions.size).toBeGreaterThan(1)
  })
})
