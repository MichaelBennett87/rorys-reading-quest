import { describe, expect, test } from 'vitest'

import {
  contentPackAudit,
  contentPacks,
  getActiveContentRegistryTotals,
} from '../../src/domain/content/packs/registry'
import {
  grade2InformationDetectivesCentralIdeaCenterPack,
  centralIdeaCenterGuides,
} from '../../src/domain/content/packs/grade2/informationDetectives/centralIdeaCenter'
import { grade2InformationDetectivesTextFeatureHuntPack } from '../../src/domain/content/packs/grade2/informationDetectives/textFeatureHunt'
import {
  authorPurposeGuides,
  grade2InformationDetectivesPurposePathPack,
} from '../../src/domain/content/packs/grade2/informationDetectives/purposePath'
import {
  authorOpinionGuides as opinionEvidenceDeskGuides,
  grade2InformationDetectivesOpinionEvidenceDeskPack,
} from '../../src/domain/content/packs/grade2/informationDetectives/opinionEvidenceDesk'
import { resolvePassageEvidence, sampleContent, validateContent } from '../../src/domain/content'
import { buildBenchmarkCoverageAudit } from '../../src/domain/content/packs/benchmarkCoverageAudit'
import { getLessonForUnit } from '../../src/domain/lesson'

describe('grade 2 information detectives text feature hunt pack', () => {
  test('registers as a single active benchmark pack with the expected totals', () => {
    const pack = grade2InformationDetectivesTextFeatureHuntPack
    const activePackIds = contentPacks.filter((entry) => !entry.manifest.packId.startsWith('legacy-')).map((entry) => entry.manifest.packId)

    expect(pack.manifest.packId).toBe('g2-information-detectives-text-feature-hunt')
    expect(pack.manifest.packTitle).toBe('Grade 2 Information Detectives: Text Feature Hunt')
    expect(pack.manifest.worldId).toBe('information-detectives')
    expect(pack.manifest.unitId).toBe('id-unit-1')
    expect(pack.manifest.primarySkillId).toBe('g2-information-detectives-reading')
    expect(pack.manifest.reviewStatus).toBe('DRAFT')
    expect(pack.manifest.contentVersion).toBe('g2-id-text-features-r0.1.0')
    expect(pack.manifest.coveredPatterns).toEqual([
      'informational-text-features',
      'feature-meaning',
      'title-contribution',
      'heading-contribution',
      'caption-contribution',
      'graph-contribution',
      'map-contribution',
      'glossary-contribution',
      'illustration-contribution',
      'feature-body-connection',
      'feature-selection-for-purpose',
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
    ])
    expect(getActiveContentRegistryTotals()).toEqual({
      activePackCount: 28,
      activeLessonCount: 196,
      activePassageCount: 203,
      activeQuestionCount: 1122,
      activeSupportTargetCount: 775,
    })
    expect(contentPackAudit).toHaveLength(0)
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
  })

  test('authors seven informational passages, seven guides, and forty-one questions', () => {
    const pack = grade2InformationDetectivesTextFeatureHuntPack
    expect(pack.textFeatureGuides).toBeTruthy()
    const questionTypeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})

    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(pack.textFeatureGuides).toHaveLength(7)
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

  test('every informational passage has a valid structure, guide, and support targets', () => {
    const pack = grade2InformationDetectivesTextFeatureHuntPack

    for (const passage of pack.passages) {
      expect(passage.contentKind).toBe('informational')
      expect(passage.reviewStatus).toBe('DRAFT')
      expect(passage.contentVersion).toBe('g2-id-text-features-r0.1.0')
      expect(passage.wordSupportTargets).toHaveLength(4)
      expect(passage.informationalStructure).toBeTruthy()

      const structure = passage.informationalStructure!
      const title = structure.features.find((feature) => feature.kind === 'title')
      const headings = structure.features.filter((feature) => feature.kind === 'heading')
      const captions = structure.features.filter((feature) => feature.kind === 'caption')

      expect(title).toBeTruthy()
      expect(headings.length).toBeGreaterThanOrEqual(2)
      expect(captions).toHaveLength(1)
      expect(structure.sections.length).toBeGreaterThanOrEqual(2)
      expect(new Set(structure.features.map((feature) => feature.featureId)).size).toBe(structure.features.length)
      expect(structure.features.some((feature) => feature.kind === 'graph' || feature.kind === 'map' || feature.kind === 'illustration')).toBe(true)

      for (const section of structure.sections) {
        expect(section.sentenceIds.length).toBeGreaterThan(0)
        expect(section.featureIds.length).toBeGreaterThan(0)
        for (const sentenceId of section.sentenceIds) {
          expect(passage.sentences?.some((sentence) => sentence.sentenceId === sentenceId)).toBe(true)
        }
        for (const featureId of section.featureIds) {
          expect(structure.features.some((feature) => feature.featureId === featureId)).toBe(true)
        }
      }

      const guide = pack.textFeatureGuides!.find((entry) => entry.passageId === passage.passageIdentifier)
      expect(guide).toBeTruthy()
      expect(guide?.reviewStatus).toBe('DRAFT')
      expect(guide?.contentVersion).toBe('g2-id-text-features-r0.1.0')
      expect(guide?.featureContributions).toHaveLength(structure.features.length)
      expect(guide?.combinedFeatureExplanation).toMatch(/\S/)

      for (const contribution of guide?.featureContributions ?? []) {
        const authoredFeature = structure.features.find((feature) => feature.featureId === contribution.featureId)
        expect(authoredFeature).toBeTruthy()
        expect(authoredFeature?.kind).toBe(contribution.featureKind)
        expect(contribution.contributionStatement).toMatch(/\S/)
        expect(contribution.relatedSentenceIds.length).toBeGreaterThan(0)
        for (const sentenceId of contribution.relatedSentenceIds) {
          expect(passage.sentences?.some((sentence) => sentence.sentenceId === sentenceId)).toBe(true)
        }
      }

      for (const target of passage.wordSupportTargets ?? []) {
        expect(target.reviewStatus).toBe('DRAFT')
        expect(target.contentVersion).toBe('g2-id-text-features-r0.1.0')
        expect(passage.sentences?.some((sentence) => sentence.sentenceId === target.sentenceId)).toBe(true)
        expect(resolvePassageEvidence(passage, target.sentenceId)?.text).toMatch(/\S/)
      }
    }
  })

  test('every question uses the Phase 6E1 benchmark contract and resolves its evidence', () => {
    const pack = grade2InformationDetectivesTextFeatureHuntPack
    const visibleAnswerText = new Set<string>()

    for (const question of pack.questions) {
      expect(question.gradeBand).toBe(2)
      expect(question.benchmarkReference).toBe('ELA.2.R.2.1')
      expect(question.skillIdentifier).toBe('g2-information-detectives-reading')
      expect(question.reportingCategory).toBe('Reading Informational Text')
      expect(question.contentVersion).toBe('g2-id-text-features-r0.1.0')
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

  test('resolves informational feature evidence for authored titles, visuals, glossary entries, and labels', () => {
    const passage = grade2InformationDetectivesTextFeatureHuntPack.passages.find((entry) =>
      entry.informationalStructure?.features.some((feature) => feature.kind === 'graph' || feature.kind === 'map' || feature.kind === 'glossary' || feature.kind === 'illustration'),
    )

    expect(passage).toBeTruthy()
    const structure = passage!.informationalStructure!

    for (const feature of structure.features) {
      const featureEvidence = resolvePassageEvidence(passage!, feature.featureId)
      expect(featureEvidence).toBeTruthy()
      expect(featureEvidence?.text).toMatch(/\S/)

      if (feature.kind === 'graph') {
        for (const dataPoint of feature.dataPoints) {
          const dataPointEvidence = resolvePassageEvidence(passage!, dataPoint.dataPointId)
          expect(dataPointEvidence).toBeTruthy()
          expect(dataPointEvidence?.text).toMatch(/\S/)
        }
      }

      if (feature.kind === 'map') {
        for (const location of feature.locations) {
          const locationEvidence = resolvePassageEvidence(passage!, location.locationId)
          expect(locationEvidence).toBeTruthy()
          expect(locationEvidence?.text).toMatch(/\S/)
        }

        for (const legendEntry of feature.legendEntries) {
          const legendEvidence = resolvePassageEvidence(passage!, legendEntry.legendId)
          expect(legendEvidence).toBeTruthy()
          expect(legendEvidence?.text).toMatch(/\S/)
        }
      }

      if (feature.kind === 'glossary') {
        for (const glossaryEntry of feature.entries) {
          const glossaryEvidence = resolvePassageEvidence(passage!, glossaryEntry.entryId)
          expect(glossaryEvidence).toBeTruthy()
          expect(glossaryEvidence?.text).toMatch(/\S/)
        }
      }

      if (feature.kind === 'illustration') {
        for (const label of feature.labels) {
          const labelEvidence = resolvePassageEvidence(passage!, label.labelId)
          expect(labelEvidence).toBeTruthy()
          expect(labelEvidence?.text).toMatch(/\S/)
        }
      }
    }
  })
})

describe('grade 2 information detectives central idea center pack', () => {
  test('registers as the active central idea pack with the expected totals', () => {
    const pack = grade2InformationDetectivesCentralIdeaCenterPack

    expect(pack.manifest.packId).toBe('g2-information-detectives-central-idea-center')
    expect(pack.manifest.packTitle).toBe('Grade 2 Information Detectives: Central Idea Center')
    expect(pack.manifest.worldId).toBe('information-detectives')
    expect(pack.manifest.unitId).toBe('id-unit-2')
    expect(pack.manifest.primarySkillId).toBe('g2-information-detectives-reading')
    expect(pack.manifest.reviewStatus).toBe('DRAFT')
    expect(pack.manifest.contentVersion).toBe('g2-id-central-idea-r0.1.0')
    expect(pack.manifest.coveredPatterns).toEqual([
      'central-idea',
      'relevant-details',
      'topic-vs-central-idea',
      'central-idea-complete-thought',
      'stated-central-idea',
      'inferred-central-idea',
      'relevant-detail-identification',
      'most-relevant-details',
      'relevant-details-across-sections',
      'central-idea-from-details',
      'central-idea-and-evidence',
    ])
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(centralIdeaCenterGuides).toHaveLength(7)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(4)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 1)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 2)).toHaveLength(5)

    const questionTypeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})

    expect(questionTypeCounts).toEqual({
      multiple_choice: 17,
      multi_select: 7,
      hot_text: 7,
      table_match: 7,
      two_part: 3,
    })
    expect(validateContent(sampleContent)).toHaveLength(0)
    expect(contentPackAudit).toHaveLength(0)
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.2.2')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.2.2',
      expectedPatterns: ['central-idea', 'relevant-details'],
      coveredPatterns: ['central-idea', 'relevant-details'],
      missingPatterns: [],
      contributingPackIds: ['g2-information-detectives-central-idea-center'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
  })

  test('every informational passage has a valid structure, guide, and support targets', () => {
    const pack = grade2InformationDetectivesCentralIdeaCenterPack

    for (const passage of pack.passages) {
      expect(passage.contentKind).toBe('informational')
      expect(passage.reviewStatus).toBe('DRAFT')
      expect(passage.contentVersion).toBe('g2-id-central-idea-r0.1.0')
      expect(passage.wordSupportTargets).toHaveLength(4)
      expect(passage.informationalStructure).toBeTruthy()

      const structure = passage.informationalStructure!
      const title = structure.features.find((feature) => feature.kind === 'title')
      const headings = structure.features.filter((feature) => feature.kind === 'heading')
      const captions = structure.features.filter((feature) => feature.kind === 'caption')

      expect(title).toBeTruthy()
      expect(headings.length).toBeGreaterThanOrEqual(2)
      expect(captions).toHaveLength(1)
      expect(structure.sections.length).toBeGreaterThanOrEqual(2)
      expect(new Set(structure.features.map((feature) => feature.featureId)).size).toBe(structure.features.length)
      expect(structure.features.some((feature) => feature.kind === 'graph' || feature.kind === 'map' || feature.kind === 'illustration')).toBe(true)

      for (const section of structure.sections) {
        expect(section.sentenceIds.length).toBeGreaterThan(0)
        expect(section.featureIds.length).toBeGreaterThan(0)
        for (const sentenceId of section.sentenceIds) {
          expect(passage.sentences?.some((sentence) => sentence.sentenceId === sentenceId)).toBe(true)
        }
        for (const featureId of section.featureIds) {
          expect(structure.features.some((feature) => feature.featureId === featureId)).toBe(true)
        }
      }

      const guide = centralIdeaCenterGuides.find((entry) => entry.passageId === passage.passageIdentifier)
      expect(guide).toBeTruthy()
      expect(guide?.reviewStatus).toBe('DRAFT')
      expect(guide?.contentVersion).toBe('g2-id-central-idea-r0.1.0')
      expect(guide?.topicLabel).toMatch(/\S/)
      expect(guide?.centralIdeaStatement).toMatch(/\S/)
      expect(guide?.relevantEvidenceIds.length).toBeGreaterThanOrEqual(3)
      expect(guide?.otherEvidenceIds.length).toBeGreaterThanOrEqual(1)
      expect(new Set(guide?.relevantEvidenceIds ?? []).size).toBe(guide?.relevantEvidenceIds.length ?? 0)
      expect(new Set(guide?.otherEvidenceIds ?? []).size).toBe(guide?.otherEvidenceIds.length ?? 0)

      for (const evidenceId of [...(guide?.relevantEvidenceIds ?? []), ...(guide?.otherEvidenceIds ?? [])]) {
        expect(resolvePassageEvidence(passage, evidenceId)).toBeTruthy()
      }

      for (const target of passage.wordSupportTargets ?? []) {
        expect(target.reviewStatus).toBe('DRAFT')
        expect(target.contentVersion).toBe('g2-id-central-idea-r0.1.0')
        expect(passage.sentences?.some((sentence) => sentence.sentenceId === target.sentenceId)).toBe(true)
        expect(resolvePassageEvidence(passage, target.sentenceId)?.text).toMatch(/\S/)
      }
    }
  })

  test('every question uses the Phase 6E2 benchmark contract and resolves its evidence', () => {
    const pack = grade2InformationDetectivesCentralIdeaCenterPack
    const visibleAnswerText = new Set<string>()

    for (const question of pack.questions) {
      expect(question.gradeBand).toBe(2)
      expect(question.benchmarkReference).toBe('ELA.2.R.2.2')
      expect(question.skillIdentifier).toBe('g2-information-detectives-reading')
      expect(question.reportingCategory).toBe('Reading Informational Text')
      expect(question.contentVersion).toBe('g2-id-central-idea-r0.1.0')
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

  test('resolves the Central Idea Center unit to the new checkpoint lesson', () => {
    const result = getLessonForUnit('id-unit-2')

    expect(result.lesson?.lessonId).toBe('lesson-central-idea-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })
})

describe('grade 2 information detectives purpose path pack', () => {
  test('registers as the active purpose pack with the expected totals', () => {
    const pack = grade2InformationDetectivesPurposePathPack

    expect(pack.manifest.packId).toBe('g2-information-detectives-purpose-path')
    expect(pack.manifest.packTitle).toBe('Grade 2 Information Detectives: Purpose Path')
    expect(pack.manifest.worldId).toBe('information-detectives')
    expect(pack.manifest.unitId).toBe('id-unit-3')
    expect(pack.manifest.primarySkillId).toBe('g2-information-detectives-reading')
    expect(pack.manifest.reviewStatus).toBe('DRAFT')
    expect(pack.manifest.contentVersion).toBe('g2-id-purpose-r0.1.0')
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(authorPurposeGuides).toHaveLength(7)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(4)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 2)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 3)).toHaveLength(5)
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.2.3')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.2.3',
      expectedPatterns: ['informational-author-purpose'],
      coveredPatterns: ['informational-author-purpose'],
      missingPatterns: [],
      contributingPackIds: ['g2-information-detectives-purpose-path'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(validateContent(sampleContent)).toHaveLength(0)
    expect(contentPackAudit).toHaveLength(0)
  })

  test('every informational passage has a valid structure, guide, and support targets', () => {
    const pack = grade2InformationDetectivesPurposePathPack

    for (const passage of pack.passages) {
      expect(passage.contentKind).toBe('informational')
      expect(passage.reviewStatus).toBe('DRAFT')
      expect(passage.contentVersion).toBe('g2-id-purpose-r0.1.0')
      expect(passage.wordSupportTargets).toHaveLength(4)
      expect(passage.informationalStructure).toBeTruthy()

      const structure = passage.informationalStructure!
      const title = structure.features.find((feature) => feature.kind === 'title')
      const headings = structure.features.filter((feature) => feature.kind === 'heading')
      const visuals = structure.features.filter((feature) => feature.kind === 'graph' || feature.kind === 'map' || feature.kind === 'illustration')
      const captions = structure.features.filter((feature) => feature.kind === 'caption')

      expect(title).toBeTruthy()
      expect(headings.length).toBeGreaterThanOrEqual(2)
      expect(visuals.length).toBeGreaterThanOrEqual(1)
      expect(captions).toHaveLength(1)
      expect(structure.sections.length).toBeGreaterThanOrEqual(2)
      expect(new Set(structure.features.map((feature) => feature.featureId)).size).toBe(structure.features.length)

      const guide = authorPurposeGuides.find((entry) => entry.passageId === passage.passageIdentifier)
      expect(guide).toBeTruthy()
      expect(guide?.reviewStatus).toBe('DRAFT')
      expect(guide?.contentVersion).toBe('g2-id-purpose-r0.1.0')
      expect(guide?.topicLabel).toMatch(/\S/)
      expect(guide?.specificPurposeStatement).toMatch(/^To /)
      expect(guide?.purposeEvidenceIds.length).toBeGreaterThanOrEqual(3)
      expect(guide?.secondaryDetailIds.length).toBeGreaterThanOrEqual(1)

      for (const evidenceId of [...(guide?.purposeEvidenceIds ?? []), ...(guide?.secondaryDetailIds ?? [])]) {
        expect(resolvePassageEvidence(passage, evidenceId)).toBeTruthy()
      }

      for (const target of passage.wordSupportTargets ?? []) {
        expect(target.reviewStatus).toBe('DRAFT')
        expect(target.contentVersion).toBe('g2-id-purpose-r0.1.0')
        expect(passage.sentences?.some((sentence) => sentence.sentenceId === target.sentenceId)).toBe(true)
        expect(resolvePassageEvidence(passage, target.sentenceId)?.text).toMatch(/\S/)
      }
    }
  })

  test('every question uses the Phase 6E3 benchmark contract and resolves its evidence', () => {
    const pack = grade2InformationDetectivesPurposePathPack
    const visibleAnswerText = new Set<string>()

    for (const question of pack.questions) {
      expect(question.gradeBand).toBe(2)
      expect(question.benchmarkReference).toBe('ELA.2.R.2.3')
      expect(question.skillIdentifier).toBe('g2-information-detectives-reading')
      expect(question.reportingCategory).toBe('Reading Informational Text')
      expect(question.contentVersion).toBe('g2-id-purpose-r0.1.0')
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

  test('resolves the Purpose Path unit to the new checkpoint lesson', () => {
    const result = getLessonForUnit('id-unit-3')

    expect(result.lesson?.lessonId).toBe('lesson-purpose-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })
})

describe('grade 2 information detectives opinion evidence desk pack', () => {
  test('registers as the active opinion pack with the expected totals', () => {
    const pack = grade2InformationDetectivesOpinionEvidenceDeskPack

    expect(pack.manifest.packId).toBe('g2-information-detectives-opinion-evidence-desk')
    expect(pack.manifest.packTitle).toBe('Grade 2 Information Detectives: Opinion & Evidence Desk')
    expect(pack.manifest.worldId).toBe('information-detectives')
    expect(pack.manifest.unitId).toBe('id-unit-4')
    expect(pack.manifest.primarySkillId).toBe('g2-information-detectives-reading')
    expect(pack.manifest.reviewStatus).toBe('DRAFT')
    expect(pack.manifest.contentVersion).toBe('g2-id-opinion-evidence-r0.1.0')
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(opinionEvidenceDeskGuides).toHaveLength(7)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(4)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 3)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 4)).toHaveLength(5)
    expect(buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.R.2.4')).toEqual(expect.objectContaining({
      benchmarkReference: 'ELA.2.R.2.4',
      expectedPatterns: ['opinion', 'supporting-evidence'],
      coveredPatterns: ['opinion', 'supporting-evidence'],
      missingPatterns: [],
      contributingPackIds: ['g2-information-detectives-opinion-evidence-desk'],
      coverageStatus: 'implemented',
      reviewStatus: 'DRAFT',
    }))
    expect(validateContent(sampleContent)).toHaveLength(0)
    expect(contentPackAudit).toHaveLength(0)
  })

  test('every informational passage has a valid structure, guide, and support targets', () => {
    const pack = grade2InformationDetectivesOpinionEvidenceDeskPack
    let twoOpinionPassageCount = 0

    for (const passage of pack.passages) {
      expect(passage.contentKind).toBe('informational')
      expect(passage.reviewStatus).toBe('DRAFT')
      expect(passage.contentVersion).toBe('g2-id-opinion-evidence-r0.1.0')
      expect(passage.wordSupportTargets).toHaveLength(4)
      expect(passage.informationalStructure).toBeTruthy()

      const structure = passage.informationalStructure!
      const title = structure.features.find((feature) => feature.kind === 'title')
      const headings = structure.features.filter((feature) => feature.kind === 'heading')
      const visuals = structure.features.filter((feature) => feature.kind === 'graph' || feature.kind === 'map' || feature.kind === 'illustration')
      const captions = structure.features.filter((feature) => feature.kind === 'caption')

      expect(title).toBeTruthy()
      expect(headings.length).toBeGreaterThanOrEqual(2)
      expect(visuals.length).toBeGreaterThanOrEqual(1)
      expect(captions).toHaveLength(1)
      expect(structure.sections.length).toBeGreaterThanOrEqual(2)
      expect(new Set(structure.features.map((feature) => feature.featureId)).size).toBe(structure.features.length)

      const guide = opinionEvidenceDeskGuides.find((entry) => entry.passageId === passage.passageIdentifier)
      expect(guide).toBeTruthy()
      expect(guide?.reviewStatus).toBe('DRAFT')
      expect(guide?.contentVersion).toBe('g2-id-opinion-evidence-r0.1.0')
      expect(guide?.topicLabel).toMatch(/\S/)
      expect(guide?.opinions.length).toBeGreaterThanOrEqual(1)
      expect(guide?.factEvidenceIds.length).toBeGreaterThanOrEqual(1)
      expect(guide?.otherDetailIds.length).toBeGreaterThanOrEqual(1)
      expect(new Set((guide?.factEvidenceIds ?? [])).size).toBe(guide?.factEvidenceIds.length ?? 0)
      expect(new Set((guide?.otherDetailIds ?? [])).size).toBe(guide?.otherDetailIds.length ?? 0)
      if ((guide?.opinions.length ?? 0) === 2) {
        twoOpinionPassageCount += 1
      }

      for (const opinion of guide?.opinions ?? []) {
        expect(opinion.opinionStatement).toMatch(/\S/)
        expect(opinion.evidenceConnectionStatement).toMatch(/\S/)
        expect(opinion.supportingEvidenceIds.length).toBeGreaterThanOrEqual(2)
        expect(resolvePassageEvidence(passage, opinion.opinionSentenceId)).toBeTruthy()
        expect(resolvePassageEvidence(passage, opinion.opinionSentenceId)?.text).toMatch(/\S/)
        for (const evidenceId of opinion.supportingEvidenceIds) {
          expect(resolvePassageEvidence(passage, evidenceId)).toBeTruthy()
        }
      }

      for (const evidenceId of [...(guide?.factEvidenceIds ?? []), ...(guide?.otherDetailIds ?? [])]) {
        expect(resolvePassageEvidence(passage, evidenceId)).toBeTruthy()
      }

      for (const target of passage.wordSupportTargets ?? []) {
        expect(target.reviewStatus).toBe('DRAFT')
        expect(target.contentVersion).toBe('g2-id-opinion-evidence-r0.1.0')
        expect(passage.sentences?.some((sentence) => sentence.sentenceId === target.sentenceId)).toBe(true)
        expect(resolvePassageEvidence(passage, target.sentenceId)?.text).toMatch(/\S/)
      }
    }

    expect(twoOpinionPassageCount).toBeGreaterThanOrEqual(2)
  })

  test('every question uses the Phase 6E4 benchmark contract and resolves its evidence', () => {
    const pack = grade2InformationDetectivesOpinionEvidenceDeskPack
    const visibleAnswerText = new Set<string>()

    for (const question of pack.questions) {
      expect(question.gradeBand).toBe(2)
      expect(question.benchmarkReference).toBe('ELA.2.R.2.4')
      expect(question.skillIdentifier).toBe('g2-information-detectives-reading')
      expect(question.reportingCategory).toBe('Reading Informational Text')
      expect(question.contentVersion).toBe('g2-id-opinion-evidence-r0.1.0')
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

  test('resolves the Opinion & Evidence Desk unit to the new checkpoint lesson', () => {
    const result = getLessonForUnit('id-unit-4')

    expect(result.lesson?.lessonId).toBe('lesson-opinion-checkpoint-a')
    expect(result.lesson?.lessonRole).toBe('CHECKPOINT')
    expect(result.lesson?.selectionStatus).toBe('active')
    expect(result.lesson?.questionCount).toBe(7)
  })
})
