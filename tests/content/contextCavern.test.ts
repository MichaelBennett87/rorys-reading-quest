import { describe, expect, test } from 'vitest'

import { validateContent, resolvePassageEvidence, sampleContent } from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import {
  contentPackAudit,
  contentPacks,
  getActiveContentRegistryTotals,
} from '../../src/domain/content/packs/registry'
import { grade2ContextCavernAcademicWordWorkshopPack } from '../../src/domain/content/packs/grade2/contextCavern/academicWordWorkshop'

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
    ])
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 17,
      activeLessonCount: 119,
      activePassageCount: 119,
      activeQuestionCount: 684,
      activeSupportTargetCount: 474,
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
