import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import { buildContentPackAudit, buildInformationalStructureGuideAudit } from '../../src/domain/content/packs'
import {
  informationalStructureGuides, structureStationPack, structureStationPassages,
  structureStationQuestions, structureStationRecords,
} from '../../src/domain/content/packs/grade3/informationDetectives/structureStation'
import { createDefaultQuestProgress } from '../../src/persistence'

describe('Grade 3 Structure Station production pack', () => {
  test('keeps the exact lesson, text, guide, question, and support shape', () => {
    expect(structureStationPack.lessons).toHaveLength(7)
    expect(structureStationPassages).toHaveLength(7)
    expect(informationalStructureGuides).toHaveLength(7)
    expect(structureStationQuestions).toHaveLength(41)
    expect(structureStationPassages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(structureStationPack.lessons.filter((lesson) => lesson.difficulty === 0 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(structureStationPack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(structureStationPack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(Object.fromEntries(['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].map((type) => [
      type, structureStationQuestions.filter((question) => question.questionType === type).length,
    ]))).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
  })

  test('uses three chronology, two comparison, and two cause-effect texts', () => {
    expect(structureStationRecords.map((record) => record.structure)).toEqual([
      'chronology', 'comparison', 'cause-effect', 'chronology', 'comparison', 'cause-effect', 'chronology',
    ])
  })

  test('uses meaningful, accessible feature contributions with resolved evidence', () => {
    const featureKinds = new Set(structureStationPassages.flatMap((passage) => passage.informationalStructure?.features.map((feature) => feature.kind) ?? []))
    expect(featureKinds).toEqual(new Set(['title', 'heading', 'timeline', 'glossary', 'illustration', 'caption', 'sidebar']))
    for (const passage of structureStationPassages) {
      const guide = informationalStructureGuides.find((entry) => entry.passageId === passage.passageIdentifier)!
      expect(guide.featureContributions.length).toBeGreaterThanOrEqual(2)
      expect(guide.structureEvidence).toHaveLength(2)
      expect(passage.informationalStructure?.features.filter((feature) => feature.kind === 'illustration').every((feature) => feature.kind !== 'illustration' || (feature.accessibleDescription.length > 0 && feature.labels.length > 0))).toBe(true)
    }
  })

  test('aligns exactly four five-stage Word Help targets to every source text without answer leakage', () => {
    for (const passage of structureStationPassages) {
      expect(passage.wordSupportTargets).toHaveLength(4)
      for (const target of passage.wordSupportTargets ?? []) {
        const source = passage.sentences?.find((sentence) => sentence.sentenceId === target.sentenceId)?.text ?? ''
        expect(source).toContain(target.surfaceWord)
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
        expect(target.focusParts.map((part) => part.text).join('')).toBe(target.surfaceWord)
        expect(target.surfaceWord).not.toMatch(/chronology|comparison|cause|effect/i)
      }
    }
  })

  test('passes pack-specific, global content, and semantic audits', () => {
    expect(buildInformationalStructureGuideAudit(structureStationPack)).toEqual([])
    expect(buildContentPackAudit([structureStationPack])).toEqual([])
    expect(auditSemanticQuestionPacks([structureStationPack])).toMatchObject({
      reviewedPackCount: 1, reviewedLessonCount: 7, reviewedCount: 41, issues: [],
    })
  })

  test('keeps all items inside ELA.3.R.2.1 and guide content outside persistence', () => {
    expect(structureStationQuestions.every((question) => question.gradeBand === 3 && question.benchmarkReference === 'ELA.3.R.2.1')).toBe(true)
    expect(structureStationQuestions.every((question) => question.skillIdentifier === 'g3-information-detectives-reading')).toBe(true)
    expect(structureStationQuestions.every((question) => question.reportingCategory === 'Reading Informational Text')).toBe(true)
    expect(structureStationQuestions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === 'g3-id-structure-station-r0.1.0')).toBe(true)
    expect(structureStationQuestions.every((question) => !/central idea|author(?:'s)? purpose|claim and evidence/i.test(question.prompt))).toBe(true)
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T16:00:00.000Z'))
    expect(serialized).not.toContain('informationalStructureGuides')
    expect(serialized).not.toContain('organizationalSummary')
    expect(serialized).not.toContain('A Day at the Weather Station')
  })
})
