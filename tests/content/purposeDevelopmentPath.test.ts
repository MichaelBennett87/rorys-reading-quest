import { describe, expect, test } from 'vitest'

import { resolvePassageEvidence } from '../../src/domain/content/evidence'
import { buildContentPackAudit, buildPurposeDevelopmentGuideAudit } from '../../src/domain/content/packs'
import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import {
  purposeDevelopmentGuides, purposeDevelopmentPack, purposeDevelopmentPassages,
  purposeDevelopmentQuestions, purposeDevelopmentRecords,
} from '../../src/domain/content/packs/grade3/informationDetectives/purposeDevelopmentPath'

describe('Grade 3 Purpose Development Path pack', () => {
  test('has the exact authored inventory and question distribution', () => {
    expect(purposeDevelopmentPack.lessons).toHaveLength(7)
    expect(purposeDevelopmentPassages).toHaveLength(7)
    expect(purposeDevelopmentGuides).toHaveLength(7)
    expect(purposeDevelopmentQuestions).toHaveLength(41)
    expect(purposeDevelopmentPassages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(purposeDevelopmentPack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(purposeDevelopmentPack.lessons.filter((lesson) => lesson.difficulty === 3 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(purposeDevelopmentPack.lessons.filter((lesson) => lesson.difficulty === 3 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].map((type) => [
      type, purposeDevelopmentQuestions.filter((question) => question.questionType === type).length,
    ])).toEqual([['multiple_choice', 17], ['multi_select', 7], ['hot_text', 7], ['table_match', 7], ['two_part', 3]])
  })

  test('uses seven distinct precise purpose kinds and keeps purpose separate from topic and central idea', () => {
    expect(new Set(purposeDevelopmentRecords.map((record) => record.purposeKind)).size).toBe(7)
    for (const record of purposeDevelopmentRecords) {
      expect(record.purpose).toMatch(/^To /)
      expect(record.purpose.toLowerCase()).not.toBe(record.topic.toLowerCase())
      expect(record.purpose.toLowerCase()).not.toBe(record.centralIdea.toLowerCase())
      expect(record.purpose).not.toMatch(/persuad|convinc|\bshould\b/i)
      expect(record.supportingDetails.length).toBeGreaterThanOrEqual(3)
      expect(new Set(record.supportingDetails.map((detail) => detail.sentence <= record.sectionEnds[0] ? 1 : detail.sentence <= record.sectionEnds[1] ? 2 : 3)).size).toBeGreaterThanOrEqual(2)
    }
  })

  test('resolves every guide and question evidence reference', () => {
    for (const guide of purposeDevelopmentGuides) {
      const passage = purposeDevelopmentPassages.find((entry) => entry.passageIdentifier === guide.passageId)!
      expect(guide.purposeEvidenceIds.every((id) => resolvePassageEvidence(passage, id))).toBe(true)
      expect(guide.secondaryDetailIds.every((id) => resolvePassageEvidence(passage, id))).toBe(true)
      expect(guide.sectionContributions).toHaveLength(3)
    }
    for (const question of purposeDevelopmentQuestions) {
      const passage = purposeDevelopmentPassages.find((entry) => entry.passageIdentifier === question.passageIdentifier)!
      expect((question.evidenceReferenceIds ?? []).every((id) => resolvePassageEvidence(passage, id))).toBe(true)
    }
  })

  test('keeps Word Help source-bound and free of purpose-answer leakage', () => {
    for (const passage of purposeDevelopmentPassages) {
      const targets = passage.wordSupportTargets ?? []
      expect(targets).toHaveLength(4)
      for (const target of targets) {
        const sentence = passage.sentences?.find((entry) => entry.sentenceId === target.sentenceId)?.text ?? ''
        expect(sentence.toLowerCase()).toContain(target.surfaceWord.toLowerCase())
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('').toLowerCase()).toBe(target.surfaceWord.toLowerCase())
        expect(target.surfaceWord).not.toMatch(/purpose|inform|explain|describe|compare|teach/i)
      }
    }
  })

  test('passes pack, guide, and semantic audits with no claim-evidence drift', () => {
    expect(buildPurposeDevelopmentGuideAudit(purposeDevelopmentPack)).toEqual([])
    expect(buildContentPackAudit([purposeDevelopmentPack])).toEqual([])
    expect(auditSemanticQuestionPacks([purposeDevelopmentPack])).toMatchObject({ reviewedPackCount: 1, reviewedLessonCount: 7, reviewedCount: 41, issues: [] })
    expect(purposeDevelopmentQuestions.every((question) => question.gradeBand === 3 && question.benchmarkReference === 'ELA.3.R.2.3')).toBe(true)
    expect(purposeDevelopmentQuestions.every((question) => question.skillIdentifier === 'g3-information-detectives-reading' && question.reportingCategory === 'Reading Informational Text')).toBe(true)
    expect(purposeDevelopmentQuestions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === 'g3-id-purpose-development-r0.1.0')).toBe(true)
    expect(purposeDevelopmentQuestions.every((question) => !(question.tags ?? []).some((tag) => /claim-evidence|argument/.test(tag)))).toBe(true)
  })

  test('keeps every checkpoint complete and cross-section evidence based', () => {
    for (const lesson of purposeDevelopmentPack.lessons.filter((entry) => entry.lessonRole === 'CHECKPOINT')) {
      const questions = purposeDevelopmentQuestions.filter((question) => question.lessonIdentifier === lesson.lessonId)
      expect(questions).toHaveLength(7)
      expect(questions.some((question) => question.questionType === 'table_match')).toBe(true)
      expect(questions.some((question) => question.questionType === 'two_part')).toBe(true)
      for (const tag of ['author-purpose', 'topic-purpose-distinction', 'central-idea-purpose-distinction', 'supporting-details', 'purpose-development', 'text-evidence', 'section-contribution', 'purpose-transfer']) {
        expect(questions.some((question) => (question.tags ?? []).includes(tag))).toBe(true)
      }
    }
  })
})
