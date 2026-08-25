import { describe, expect, test } from 'vitest'

import { resolvePassageEvidence } from '../../src/domain/content/evidence'
import { buildAuthorClaimGuideAudit, buildContentPackAudit } from '../../src/domain/content/packs'
import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import {
  authorClaimGuides, claimEvidenceCourtPack, claimEvidencePassages,
  claimEvidenceQuestions, claimEvidenceRecords,
} from '../../src/domain/content/packs/grade3/informationDetectives/claimEvidenceCourt'

describe('Grade 3 Claim and Evidence Court pack', () => {
  test('has the exact authored inventory and question distribution', () => {
    expect(claimEvidenceCourtPack.lessons).toHaveLength(7)
    expect(claimEvidencePassages).toHaveLength(7)
    expect(authorClaimGuides).toHaveLength(7)
    expect(claimEvidenceQuestions).toHaveLength(41)
    expect(claimEvidencePassages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(claimEvidenceCourtPack.lessons.filter((lesson) => lesson.difficulty === 3 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(claimEvidenceCourtPack.lessons.filter((lesson) => lesson.difficulty === 4 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(claimEvidenceCourtPack.lessons.filter((lesson) => lesson.difficulty === 4 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].map((type) => [
      type, claimEvidenceQuestions.filter((question) => question.questionType === type).length,
    ])).toEqual([['multiple_choice', 17], ['multi_select', 7], ['hot_text', 7], ['table_match', 7], ['two_part', 3]])
  })

  test('uses diverse explicit claims and evidence while preserving conceptual boundaries', () => {
    expect(new Set(claimEvidenceRecords.map((record) => record.claimKind)).size).toBeGreaterThanOrEqual(4)
    expect(new Set(claimEvidenceRecords.flatMap((record) => record.evidence.map((entry) => entry.kind))).size).toBeGreaterThanOrEqual(4)
    for (const record of claimEvidenceRecords) {
      expect(record.claim).not.toBe(record.topic)
      expect(record.claim).not.toBe(record.centralIdea)
      expect(record.claim).not.toBe(record.purpose)
      expect(record.claim).toMatch(/should|better|best|practical|priority/i)
      expect(record.claimSentences.some((sentence) => record.sentences[sentence - 1] === record.claim)).toBe(true)
      expect(record.reasons.length).toBeGreaterThanOrEqual(2)
      expect(record.evidence.length).toBeGreaterThanOrEqual(3)
      expect(record.reasons.every((reason) => reason.evidenceSentences.length > 0)).toBe(true)
    }
  })

  test('resolves all guide and question evidence to learner-visible text', () => {
    for (const guide of authorClaimGuides) {
      const passage = claimEvidencePassages.find((entry) => entry.passageIdentifier === guide.passageId)!
      expect(guide.claimEvidenceIds.every((id) => resolvePassageEvidence(passage, id))).toBe(true)
      expect(guide.reasons.every((reason) => reason.evidenceIds.every((id) => resolvePassageEvidence(passage, id)))).toBe(true)
      expect(guide.evidence.every((entry) => entry.sourceEvidenceIds.every((id) => resolvePassageEvidence(passage, id)))).toBe(true)
    }
    for (const question of claimEvidenceQuestions) {
      const passage = claimEvidencePassages.find((entry) => entry.passageIdentifier === question.passageIdentifier)!
      expect((question.evidenceReferenceIds ?? []).every((id) => resolvePassageEvidence(passage, id))).toBe(true)
    }
  })

  test('keeps Word Help source-bound and answer-neutral', () => {
    for (const passage of claimEvidencePassages) {
      const targets = passage.wordSupportTargets ?? []
      expect(targets).toHaveLength(4)
      for (const target of targets) {
        const sentence = passage.sentences?.find((entry) => entry.sentenceId === target.sentenceId)?.text ?? ''
        expect(sentence.toLowerCase()).toContain(target.surfaceWord.toLowerCase())
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('').toLowerCase()).toBe(target.surfaceWord.toLowerCase())
        expect(target.surfaceWord).not.toMatch(/claim|reason|evidence|support|correct|answer/i)
      }
    }
  })

  test('passes pack, guide, and semantic audits', () => {
    expect(buildAuthorClaimGuideAudit(claimEvidenceCourtPack)).toEqual([])
    expect(buildContentPackAudit([claimEvidenceCourtPack])).toEqual([])
    expect(auditSemanticQuestionPacks([claimEvidenceCourtPack])).toMatchObject({ reviewedPackCount: 1, reviewedLessonCount: 7, reviewedCount: 41, issues: [] })
    expect(claimEvidenceQuestions.every((question) => question.gradeBand === 3 && question.benchmarkReference === 'ELA.3.R.2.4')).toBe(true)
    expect(claimEvidenceQuestions.every((question) => question.skillIdentifier === 'g3-information-detectives-reading' && question.reportingCategory === 'Reading Informational Text')).toBe(true)
    expect(claimEvidenceQuestions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === 'g3-id-claim-evidence-r0.1.0')).toBe(true)
  })

  test('keeps every checkpoint complete and cross-section evidence based', () => {
    for (const lesson of claimEvidenceCourtPack.lessons.filter((entry) => entry.lessonRole === 'CHECKPOINT')) {
      const questions = claimEvidenceQuestions.filter((question) => question.lessonIdentifier === lesson.lessonId)
      expect(questions).toHaveLength(7)
      expect(questions.some((question) => question.questionType === 'table_match')).toBe(true)
      expect(questions.some((question) => question.questionType === 'two_part')).toBe(true)
      for (const tag of ['author-claim', 'reasons', 'evidence', 'claim-evidence-connection', 'claim-topic-distinction', 'claim-central-idea-distinction', 'claim-purpose-distinction', 'claim-fact-distinction', 'reason-evidence-distinction', 'strong-weak-evidence', 'cross-section-evidence', 'claim-transfer']) {
        expect(questions.some((question) => (question.tags ?? []).includes(tag))).toBe(true)
      }
    }
  })
})
