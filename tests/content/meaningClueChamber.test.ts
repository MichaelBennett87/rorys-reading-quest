import { describe, expect, test } from 'vitest'

import { validateContent, resolvePassageEvidence, sampleContent } from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import {
  contentPackAudit,
  contentPacks,
  getActiveContentRegistryTotals,
} from '../../src/domain/content/packs/registry'
import { grade2ContextCavernMeaningClueChamberPack } from '../../src/domain/content/packs/grade2/contextCavern/meaningClueChamber'

const expectedContextClueKinds = new Set(['definition', 'restatement', 'example', 'contrast', 'cause-effect'])
const expectedRelationshipKinds = new Set(['synonym', 'antonym', 'category-member', 'part-whole', 'object-function'])

describe('grade 2 context cavern meaning clue chamber pack', () => {
  test('registers as the active final Context Cavern pack with the expected totals', () => {
    const pack = grade2ContextCavernMeaningClueChamberPack
    const activePackIds = contentPacks.filter((entry) => !entry.manifest.packId.startsWith('legacy-')).map((entry) => entry.manifest.packId)

    expect(pack.manifest.packId).toBe('g2-context-cavern-meaning-clue-chamber')
    expect(pack.manifest.packTitle).toBe('Grade 2 Context Cavern: Meaning Clue Chamber')
    expect(pack.manifest.worldId).toBe('context-cavern')
    expect(pack.manifest.unitId).toBe('cc-unit-3')
    expect(pack.manifest.primarySkillId).toBe('g2-context-cavern-vocabulary')
    expect(pack.manifest.reviewStatus).toBe('DRAFT')
    expect(pack.manifest.contentVersion).toBe('g2-cc-meaning-clues-r0.1.0')
    expect(pack.manifest.difficultyRange).toEqual([2, 3])
    expect(pack.manifest.coveredPatterns).toEqual([
      'context-clues',
      'word-relationships',
      'reference-materials',
      'background-knowledge',
      'context-definition',
      'context-restatement',
      'context-example',
      'context-contrast',
      'context-cause-effect',
      'relationship-synonym',
      'relationship-antonym',
      'relationship-category-member',
      'relationship-part-whole',
      'relationship-object-function',
      'glossary-reference',
      'reference-definition-selection',
      'background-knowledge-connection',
      'unknown-word-meaning',
      'strategy-selection',
      'meaning-confirmation',
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
    ])
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 35,
      activeLessonCount: 245,
      activePassageCount: 252,
      activeQuestionCount: 1409,
      activeSupportTargetCount: 971,
    })
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.V.1.3')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.V.1.3',
      expectedPatterns: ['context-clues', 'word-relationships', 'reference-materials', 'background-knowledge'],
      coveredPatterns: ['context-clues', 'word-relationships', 'reference-materials', 'background-knowledge'],
      missingPatterns: [],
      contributingPackIds: ['g2-context-cavern-meaning-clue-chamber'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(validateContent(sampleContent)).toHaveLength(0)
    expect(contentPackAudit).toHaveLength(0)
  })

  test('authors seven passages, seven guides, and forty-one questions with the expected meaning-strategy coverage', () => {
    const pack = grade2ContextCavernMeaningClueChamberPack
    const questionTypeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})
    const observedContextClueKinds = new Set<string>()
    const observedRelationshipKinds = new Set<string>()

    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(pack.meaningClueGuides).toHaveLength(7)
    expect(questionTypeCounts).toEqual({
      multiple_choice: 17,
      multi_select: 7,
      hot_text: 7,
      table_match: 7,
      two_part: 3,
    })
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(4)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 2)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 3)).toHaveLength(5)

    for (const passage of pack.passages) {
      expect(passage.contentKind).toBe('informational')
      expect(passage.reviewStatus).toBe('DRAFT')
      expect(passage.contentVersion).toBe('g2-cc-meaning-clues-r0.1.0')
      expect(passage.wordSupportTargets).toHaveLength(4)
      expect(passage.informationalStructure).toBeTruthy()

      const structure = passage.informationalStructure!
      const title = structure.features.find((feature) => feature.kind === 'title')
      const headings = structure.features.filter((feature) => feature.kind === 'heading')
      const glossary = structure.features.find((feature) => feature.kind === 'glossary')
      expect(title).toBeTruthy()
      expect(headings.length).toBeGreaterThanOrEqual(2)
      expect(glossary).toBeTruthy()
      expect(structure.sections.length).toBeGreaterThanOrEqual(2)
      expect(new Set(structure.features.map((feature) => feature.featureId)).size).toBe(structure.features.length)

      const guide = pack.meaningClueGuides!.find((entry) => entry.passageId === passage.passageIdentifier)
      expect(guide).toBeTruthy()
      expect(guide?.reviewStatus).toBe('DRAFT')
      expect(guide?.contentVersion).toBe('g2-cc-meaning-clues-r0.1.0')
      expect(guide?.targets).toHaveLength(4)
      expect(new Set((guide?.targets ?? []).map((target) => target.targetId)).size).toBe(4)

      const strategyKinds = new Set<string>()
      for (const target of guide?.targets ?? []) {
        expect(target.word).toMatch(/\S/)
        expect(target.childFriendlyMeaning).toMatch(/\S/)
        expect(target.sentenceId).toMatch(/\S/)
        expect(target.strategyExplanation).toMatch(/\S/)
        expect(target.clueEvidenceIds.length).toBeGreaterThan(0)
        expect(resolvePassageEvidence(passage, target.sentenceId)).toBeTruthy()
        expect(resolvePassageEvidence(passage, target.sentenceId)?.text.toLowerCase()).toContain(target.word.toLowerCase())

        strategyKinds.add(target.primaryStrategy)
        if (target.contextClueKind) observedContextClueKinds.add(target.contextClueKind)
        if (target.relationshipKind) observedRelationshipKinds.add(target.relationshipKind)

        if (target.primaryStrategy === 'reference-material') {
          expect(target.glossaryEntryId).toMatch(/\S/)
          expect(resolvePassageEvidence(passage, target.glossaryEntryId!)).toBeTruthy()
        }
        if (target.primaryStrategy === 'background-knowledge') {
          expect(target.backgroundKnowledgeStatement).toMatch(/\S/)
        }
      }

      expect(strategyKinds).toEqual(new Set(['context-clue', 'word-relationship', 'reference-material', 'background-knowledge']))

      for (const target of passage.wordSupportTargets ?? []) {
        expect(target.reviewStatus).toBe('DRAFT')
        expect(target.contentVersion).toBe('g2-cc-meaning-clues-r0.1.0')
        expect(passage.sentences?.some((sentence) => sentence.sentenceId === target.sentenceId)).toBe(true)
        expect(resolvePassageEvidence(passage, target.sentenceId)?.text).toMatch(/\S/)
      }
    }

    expect(observedContextClueKinds).toEqual(expectedContextClueKinds)
    expect(observedRelationshipKinds).toEqual(expectedRelationshipKinds)

    for (const question of pack.questions) {
      expect(question.gradeBand).toBe(2)
      expect(question.benchmarkReference).toBe('ELA.2.V.1.3')
      expect(question.skillIdentifier).toBe('g2-context-cavern-vocabulary')
      expect(question.reportingCategory).toBe('Vocabulary')
      expect(question.contentVersion).toBe('g2-cc-meaning-clues-r0.1.0')
      expect(question.reviewStatus).toBe('DRAFT')
      expect(question.explanation).toMatch(/\S/)
      const evidenceReferenceIds = question.evidenceReferenceIds ?? []
      expect(evidenceReferenceIds.length).toBeGreaterThan(0)
      const passage = pack.passages.find((entry) => entry.passageIdentifier === question.passageIdentifier)
      expect(passage).toBeTruthy()
      for (const evidenceId of evidenceReferenceIds) {
        expect(resolvePassageEvidence(passage!, evidenceId)).toBeTruthy()
      }
    }
  })
})
