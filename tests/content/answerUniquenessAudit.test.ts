import { describe, expect, it } from 'vitest'
import {
  auditAnswerUniqueness,
  resolveReviewedAnswerTruthDecision,
  type AnswerUniquenessContract,
  type AnswerUniquenessRecord,
} from '../../src/domain/content/answerUniquenessAudit'

function fixture() {
  const contract: AnswerUniquenessContract = {
    questionId: 'q', packId: 'pack', contentVersion: 'draft-1', contentFingerprint: 'fingerprint',
    questionType: 'multiple_choice', evidenceIds: ['sentence'],
    slots: [{ slotId: 'response', prompt: 'Which action removes litter?', requestedSelectionCount: 1, keyedAnswerIds: ['pick-up-trash'], answerIds: ['pick-up-trash', 'arrive'] }],
  }
  const record: AnswerUniquenessRecord = {
    ...contract,
    blindReview: { projectionSha256: 'a'.repeat(64), conclusionsSha256: 'b'.repeat(64), reviewer: 'blind-reviewer', frozenBeforeKeyComparison: true },
    keyComparisonComplete: true, distractorChallengeComplete: true, independentFinalReviewComplete: false,
    finalReview: {
      completed: true,
      independent: false,
      reviewer: 'primary-agent-current-conversation',
      method: 'PRIMARY_PASS_C_RECONCILIATION',
      receiptPath: 'docs/content/answer-uniqueness-ledger/blind/v2/batch.pass-a.json',
      receiptSha256: 'c'.repeat(64),
      currentFingerprintVerified: true,
    },
    partBSupportsPartA: null, correctionApplied: false, correctionSummary: '', finalStatus: 'PASS',
    slots: [{ ...contract.slots[0], independentlyDefensibleAnswerIds: ['pick-up-trash'], ambiguity: '', uniquenessStatus: 'PASS', optionJudgments: [
      { answerId: 'pick-up-trash', verdict: 'DEFENSIBLE', rationale: 'Picking up trash removes litter.', evidenceIds: ['sentence'] },
      { answerId: 'arrive', verdict: 'INCORRECT', rationale: 'Arriving does not remove litter.', evidenceIds: ['sentence'] },
    ] }],
  }
  return { contract, record }
}

describe('semantic answer-uniqueness gate, not evaluator key agreement', () => {
  it('accepts a fully reviewed, fingerprint-current unique answer without mutation', () => {
    const { contract, record } = fixture()
    const before = JSON.stringify({ contract, record })
    expect(auditAnswerUniqueness([contract], [record])).toEqual([])
    expect(JSON.stringify({ contract, record })).toBe(before)
  })

  it('rejects a second defensible answer even when the authored key has one ID', () => {
    const { contract, record } = fixture()
    record.slots[0].optionJudgments[1].verdict = 'DEFENSIBLE'
    record.slots[0].independentlyDefensibleAnswerIds.push('arrive')
    expect(auditAnswerUniqueness([contract], [record]).map((issue) => issue.code)).toContain('answer_multiple_defensible')
  })

  it('does not let an equivalent distractor disappear from the defensible set', () => {
    const { contract, record } = fixture()
    record.slots[0].optionJudgments[1].verdict = 'EQUIVALENT_TO_KEY'
    expect(auditAnswerUniqueness([contract], [record]).map((issue) => issue.code)).toContain('answer_defensible_set_mismatch')
  })

  it('rejects a key that does not equal the independent solution', () => {
    const { contract, record } = fixture()
    contract.slots[0].keyedAnswerIds = ['arrive']
    record.slots[0].keyedAnswerIds = ['arrive']
    expect(auditAnswerUniqueness([contract], [record]).map((issue) => issue.code)).toContain('answer_key_not_defensible')
  })

  it('requires the complete defensible multiselect set and exact requested count', () => {
    const { contract, record } = fixture()
    contract.questionType = record.questionType = 'multi_select'
    contract.slots[0].requestedSelectionCount = 2
    record.slots[0].requestedSelectionCount = 2
    expect(auditAnswerUniqueness([contract], [record]).map((issue) => issue.code)).toContain('answer_selection_count_mismatch')
  })

  it('validates every table row independently', () => {
    const { contract, record } = fixture()
    contract.questionType = record.questionType = 'table_match'
    contract.slots.push({ ...contract.slots[0], slotId: 'row-2' })
    expect(auditAnswerUniqueness([contract], [record]).map((issue) => issue.code)).toContain('answer_slot_inventory_mismatch')
  })

  it('requires the direct Part B dependency as well as both unique slots', () => {
    const { contract, record } = fixture()
    contract.questionType = record.questionType = 'two_part'
    contract.slots[0].slotId = record.slots[0].slotId = 'part_a'
    contract.slots.push({ ...contract.slots[0], slotId: 'part_b' })
    record.slots.push({ ...record.slots[0], slotId: 'part_b' })
    expect(auditAnswerUniqueness([contract], [record]).map((issue) => issue.code)).toContain('answer_part_dependency_unreviewed')
  })

  it('requires complete judgments for single-select Hot Text too', () => {
    const { contract, record } = fixture()
    contract.questionType = record.questionType = 'hot_text'
    record.slots[0].optionJudgments.pop()
    expect(auditAnswerUniqueness([contract], [record]).map((issue) => issue.code)).toContain('answer_option_inventory_mismatch')
  })

  it('rejects ambiguity, stale fingerprints, missing reviews, and copied PASS labels', () => {
    const { contract, record } = fixture()
    record.contentFingerprint = 'old'
    record.blindReview = null
    record.distractorChallengeComplete = false
    record.finalReview = null
    record.slots[0].ambiguity = 'The prompt has two ordinary readings.'
    const codes = auditAnswerUniqueness([contract], [record]).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['stale_answer_audit', 'blind_answer_review_missing', 'answer_distractor_challenge_missing', 'answer_final_review_missing', 'answer_ambiguous', 'answer_status_mismatch']))
  })

  it('accepts truthful primary review provenance without claiming an independent reviewer', () => {
    const { contract, record } = fixture()
    expect(record.independentFinalReviewComplete).toBe(false)
    expect(record.finalReview?.independent).toBe(false)
    expect(auditAnswerUniqueness([contract], [record])).toEqual([])
  })

  it('rejects duplicate records, orphan records, and foreign evidence', () => {
    const { contract, record } = fixture()
    expect(auditAnswerUniqueness([contract], [record, record]).map((issue) => issue.code)).toContain('duplicate_answer_audit')
    expect(auditAnswerUniqueness([], [record]).map((issue) => issue.code)).toContain('orphan_answer_audit')
    record.slots[0].optionJudgments[0].evidenceIds = ['another-packs-sentence']
    expect(auditAnswerUniqueness([contract], [record]).map((issue) => issue.code)).toContain('answer_option_judgment_invalid')
  })

  it('keeps every unreviewed question visible instead of manufacturing semantic approval', () => {
    const { contract } = fixture()
    expect(auditAnswerUniqueness([contract], []).map((issue) => issue.code)).toEqual(['missing_answer_audit'])
  })

  it('refreshes a changed truth decision only from a current complete semantic PASS', () => {
    const { record } = fixture()
    expect(resolveReviewedAnswerTruthDecision({
      questionId: record.questionId,
      packId: record.packId,
      contentVersion: record.contentVersion,
      contentFingerprint: record.contentFingerprint,
      questionType: record.questionType,
      visibleAnswerChoices: [{ id: 'pick-up-trash' }, { id: 'arrive' }],
      authoredCorrectAnswerRepresentation: { kind: 'choice_ids', ids: ['pick-up-trash'] },
    }, record)).toMatchObject({
      answerIds: ['pick-up-trash'],
      finalReviewMethod: 'PRIMARY_PASS_C_RECONCILIATION',
    })
  })

  it('refuses a stale semantic record instead of copying a PASS label into truth ledgers', () => {
    const { record } = fixture()
    expect(() => resolveReviewedAnswerTruthDecision({
      questionId: record.questionId,
      packId: record.packId,
      contentVersion: record.contentVersion,
      contentFingerprint: 'new-fingerprint',
      questionType: record.questionType,
      visibleAnswerChoices: [{ id: 'pick-up-trash' }, { id: 'arrive' }],
      authoredCorrectAnswerRepresentation: { kind: 'choice_ids', ids: ['pick-up-trash'] },
    }, record)).toThrow('the semantic fingerprint is stale')
  })
})
