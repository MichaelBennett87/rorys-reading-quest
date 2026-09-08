/** Offline editorial gate. Evaluator agreement is not semantic approval. */
export type AnswerDefensibilityVerdict =
  | 'DEFENSIBLE'
  | 'INCORRECT'
  | 'PARTIALLY_TRUE_BUT_NONRESPONSIVE'
  | 'UNSUPPORTED'
  | 'CONTRADICTED'
  | 'EQUIVALENT_TO_KEY'
  | 'AMBIGUOUS'

export interface AnswerSlotContract {
  slotId: string
  prompt: string
  requestedSelectionCount: number
  keyedAnswerIds: string[]
  answerIds: string[]
}

export interface AnswerUniquenessContract {
  questionId: string
  packId: string
  contentVersion: string
  contentFingerprint: string
  questionType: string
  evidenceIds: string[]
  slots: AnswerSlotContract[]
}

export interface AnswerOptionJudgment {
  answerId: string
  verdict: AnswerDefensibilityVerdict
  rationale: string
  evidenceIds: string[]
}

export interface AnswerUniquenessSlot {
  slotId: string
  prompt: string
  requestedSelectionCount: number
  keyedAnswerIds: string[]
  independentlyDefensibleAnswerIds: string[]
  optionJudgments: AnswerOptionJudgment[]
  ambiguity: string
  uniquenessStatus:
    | 'PASS'
    | 'MULTIPLE_DEFENSIBLE'
    | 'KEY_NOT_DEFENSIBLE'
    | 'SELECTION_COUNT_MISMATCH'
    | 'AMBIGUOUS'
    | 'NOT_REVIEWED'
}

export interface AnswerUniquenessRecord {
  questionId: string
  packId: string
  contentVersion: string
  contentFingerprint: string
  questionType: string
  blindReview: {
    projectionSha256: string
    conclusionsSha256: string
    reviewer: string
    frozenBeforeKeyComparison: boolean
  } | null
  keyComparisonComplete: boolean
  distractorChallengeComplete: boolean
  /** Historical compatibility field. The current no-subagent policy keeps this false. */
  independentFinalReviewComplete: boolean
  finalReview: {
    completed: boolean
    independent: boolean
    reviewer: string
    method:
      | 'PRIMARY_PASS_C_RECONCILIATION'
      | 'PRIMARY_ADJUDICATION'
      | 'CORRECTION_REREVIEW'
      | 'STRATIFIED_SECOND_PASS'
    receiptPath: string
    receiptSha256: string
    currentFingerprintVerified: boolean
  } | null
  partBSupportsPartA: boolean | null
  slots: AnswerUniquenessSlot[]
  correctionApplied: boolean
  correctionSummary: string
  finalStatus: 'PASS' | 'FAIL'
}

export interface AnswerUniquenessIssue {
  code: string
  questionId: string
  slotId?: string
  detail: string
}

export type ReviewedAnswerRepresentation =
  | { kind: 'choice_ids'; ids: string[] }
  | { kind: 'segment_ids'; ids: string[] }
  | { kind: 'evidence_pair'; partAChoiceId: string; partBChoiceId: string }
  | { kind: 'table_mappings'; mappings: Record<string, string> }

export interface ReviewedAnswerTruthInput {
  questionId: string
  packId: string
  contentVersion: string
  contentFingerprint: string
  questionType: string
  visibleAnswerChoices: Array<{ id: string; context?: string; rowId?: string }>
  authoredCorrectAnswerRepresentation: ReviewedAnswerRepresentation
}

export interface ReviewedAnswerTruthDecision {
  answerIds: string[]
  correctionApplied: boolean
  correctionSummary: string
  blindReceiptSha256: string
  finalReceiptPath: string
  finalReceiptSha256: string
  finalReviewMethod: NonNullable<AnswerUniquenessRecord['finalReview']>['method']
}

const verdicts: AnswerDefensibilityVerdict[] = [
  'DEFENSIBLE', 'INCORRECT', 'PARTIALLY_TRUE_BUT_NONRESPONSIVE',
  'UNSUPPORTED', 'CONTRADICTED', 'EQUIVALENT_TO_KEY', 'AMBIGUOUS',
]
const defensibleVerdicts: AnswerDefensibilityVerdict[] = ['DEFENSIBLE', 'EQUIVALENT_TO_KEY']
const distinct = (values: string[]) => new Set(values).size === values.length
const sameSet = (left: string[], right: string[]) =>
  distinct(left) && distinct(right) && left.length === right.length && left.every((id) => right.includes(id))

/**
 * Bridges the semantic answer audit into truth-ledger regeneration. This is
 * deliberately stricter than checking finalStatus: every current response
 * slot and visible option must still carry a complete fingerprint-bound
 * judgment before a changed truth record can be refreshed.
 */
export function resolveReviewedAnswerTruthDecision(
  input: ReviewedAnswerTruthInput,
  record: AnswerUniquenessRecord | undefined,
): ReviewedAnswerTruthDecision {
  const fail = (detail: string): never => {
    throw new Error(`Semantic truth refresh rejected for ${input.questionId}: ${detail}`)
  }
  const reviewed = record ?? fail('no answer-uniqueness record exists')
  if (reviewed.questionId !== input.questionId
    || reviewed.packId !== input.packId
    || reviewed.contentVersion !== input.contentVersion
    || reviewed.questionType !== input.questionType) {
    fail('question, pack, version, or type identity does not match')
  }
  if (reviewed.contentFingerprint !== input.contentFingerprint) fail('the semantic fingerprint is stale')
  const blind = reviewed.blindReview ?? fail('a valid frozen key-free review receipt is required')
  if (!blind.frozenBeforeKeyComparison
    || !blind.reviewer.trim()
    || !/^[a-f0-9]{64}$/.test(blind.projectionSha256)
    || !/^[a-f0-9]{64}$/.test(blind.conclusionsSha256)) {
    fail('a valid frozen key-free review receipt is required')
  }
  const finalReview = reviewed.finalReview ?? fail('a truthful current-fingerprint final review is required')
  if (!reviewed.keyComparisonComplete
    || !reviewed.distractorChallengeComplete
    || reviewed.finalStatus !== 'PASS'
    || !finalReview.completed
    || finalReview.independent
    || !finalReview.reviewer.trim()
    || !finalReview.receiptPath.trim()
    || !/^[a-f0-9]{64}$/.test(finalReview.receiptSha256)
    || !finalReview.currentFingerprintVerified) {
    fail('the current key comparison, distractor challenge, and truthful final review must all pass')
  }

  const answer = input.authoredCorrectAnswerRepresentation
  const expectedSlots: Array<{ slotId: string; keyedAnswerIds: string[]; answerIds: string[] }> = []
  if (answer.kind === 'choice_ids' || answer.kind === 'segment_ids') {
    expectedSlots.push({
      slotId: 'response',
      keyedAnswerIds: answer.ids,
      answerIds: input.visibleAnswerChoices.map((choice) => choice.id),
    })
  } else if (answer.kind === 'evidence_pair') {
    expectedSlots.push({
      slotId: 'part_a',
      keyedAnswerIds: [answer.partAChoiceId],
      answerIds: input.visibleAnswerChoices.filter((choice) => choice.context === 'part_a').map((choice) => choice.id),
    }, {
      slotId: 'part_b',
      keyedAnswerIds: [answer.partBChoiceId],
      answerIds: input.visibleAnswerChoices.filter((choice) => choice.context === 'part_b').map((choice) => choice.id),
    })
  } else {
    for (const [rowId, choiceId] of Object.entries(answer.mappings)) {
      expectedSlots.push({
        slotId: rowId,
        keyedAnswerIds: [choiceId],
        answerIds: input.visibleAnswerChoices.filter((choice) => choice.rowId === rowId).map((choice) => choice.id),
      })
    }
  }
  if (!sameSet(reviewed.slots.map((slot) => slot.slotId), expectedSlots.map((slot) => slot.slotId))) {
    fail('the response-slot inventory does not match the current authored answer representation')
  }

  for (const expected of expectedSlots) {
    const slot = reviewed.slots.find((candidate) => candidate.slotId === expected.slotId)
      ?? fail(`slot ${expected.slotId} is missing`)
    if (!slot.prompt.trim()
      || slot.requestedSelectionCount !== expected.keyedAnswerIds.length
      || !sameSet(slot.keyedAnswerIds, expected.keyedAnswerIds)
      || !sameSet(slot.independentlyDefensibleAnswerIds, expected.keyedAnswerIds)
      || slot.uniquenessStatus !== 'PASS'
      || slot.ambiguity.trim()) {
      fail(`slot ${expected.slotId} does not have one complete, unambiguous keyed contract`)
    }
    if (!sameSet(slot.optionJudgments.map((judgment) => judgment.answerId), expected.answerIds)) {
      fail(`slot ${expected.slotId} does not judge every current visible option exactly once`)
    }
    const judgedDefensible = slot.optionJudgments
      .filter((judgment) => defensibleVerdicts.includes(judgment.verdict))
      .map((judgment) => judgment.answerId)
    if (!sameSet(judgedDefensible, slot.independentlyDefensibleAnswerIds)
      || slot.optionJudgments.some((judgment) => !judgment.rationale.trim() || !judgment.evidenceIds.length)) {
      fail(`slot ${expected.slotId} has incomplete or contradictory option judgments`)
    }
  }
  if (input.questionType === 'two_part' && reviewed.partBSupportsPartA !== true) {
    fail('Part B has not been confirmed to support Part A')
  }

  const answerIds = answer.kind === 'choice_ids' || answer.kind === 'segment_ids'
    ? [...reviewed.slots[0].independentlyDefensibleAnswerIds]
    : answer.kind === 'evidence_pair'
      ? [
          reviewed.slots.find((slot) => slot.slotId === 'part_a')!.independentlyDefensibleAnswerIds[0],
          reviewed.slots.find((slot) => slot.slotId === 'part_b')!.independentlyDefensibleAnswerIds[0],
        ]
      : Object.keys(answer.mappings).map((rowId) => {
          const choiceId = reviewed.slots.find((slot) => slot.slotId === rowId)!.independentlyDefensibleAnswerIds[0]
          return `${rowId}:${choiceId}`
        })

  return {
    answerIds,
    correctionApplied: reviewed.correctionApplied,
    correctionSummary: reviewed.correctionSummary,
    blindReceiptSha256: blind.conclusionsSha256,
    finalReceiptPath: finalReview.receiptPath,
    finalReceiptSha256: finalReview.receiptSha256,
    finalReviewMethod: finalReview.method,
  }
}

export function determineAnswerSlotStatus(
  contract: AnswerSlotContract,
  slot: Pick<AnswerUniquenessSlot, 'optionJudgments' | 'independentlyDefensibleAnswerIds' | 'ambiguity'>,
): AnswerUniquenessSlot['uniquenessStatus'] {
  if (!slot.optionJudgments.length) return 'NOT_REVIEWED'
  if (slot.ambiguity || slot.optionJudgments.some((judgment) => judgment.verdict === 'AMBIGUOUS')) return 'AMBIGUOUS'
  const defensible = slot.independentlyDefensibleAnswerIds
  if (contract.keyedAnswerIds.some((id) => !defensible.includes(id))) return 'KEY_NOT_DEFENSIBLE'
  if (defensible.some((id) => !contract.keyedAnswerIds.includes(id))) return 'MULTIPLE_DEFENSIBLE'
  if (!distinct(defensible) || defensible.length !== contract.requestedSelectionCount) return 'SELECTION_COUNT_MISMATCH'
  return 'PASS'
}

export function auditAnswerUniqueness(
  contracts: AnswerUniquenessContract[],
  records: AnswerUniquenessRecord[],
): AnswerUniquenessIssue[] {
  const issues: AnswerUniquenessIssue[] = []
  const contractIds = new Set(contracts.map((contract) => contract.questionId))
  const byQuestion = new Map<string, AnswerUniquenessRecord[]>()
  for (const record of records) {
    byQuestion.set(record.questionId, [...(byQuestion.get(record.questionId) ?? []), record])
    if (!contractIds.has(record.questionId)) issues.push({ code: 'orphan_answer_audit', questionId: record.questionId, detail: 'No active question owns this record.' })
  }
  for (const contract of contracts) {
    const add = (code: string, detail: string, slotId?: string) => issues.push({ code, questionId: contract.questionId, slotId, detail })
    const matches = byQuestion.get(contract.questionId) ?? []
    if (matches.length !== 1) {
      add(matches.length ? 'duplicate_answer_audit' : 'missing_answer_audit', 'Exactly one current record is required.')
      continue
    }
    const record = matches[0]
    if (record.packId !== contract.packId || record.contentVersion !== contract.contentVersion || record.questionType !== contract.questionType) add('answer_audit_identity_mismatch', 'Pack, version, and question type must match the registry.')
    if (record.contentFingerprint !== contract.contentFingerprint) add('stale_answer_audit', 'Content changed after the semantic review.')
    const blind = record.blindReview
    if (!blind || !blind.frozenBeforeKeyComparison || !blind.reviewer.trim() || !/^[a-f0-9]{64}$/.test(blind.projectionSha256) || !/^[a-f0-9]{64}$/.test(blind.conclusionsSha256)) add('blind_answer_review_missing', 'A frozen key-free projection and conclusion receipt are required.')
    if (!record.keyComparisonComplete) add('answer_key_comparison_missing', 'Pass B has not been completed.')
    if (!record.distractorChallengeComplete) add('answer_distractor_challenge_missing', 'Pass C has not been completed.')
    const finalReview = record.finalReview
    if (!finalReview?.completed
      || finalReview.independent
      || !finalReview.reviewer.trim()
      || !finalReview.receiptPath.trim()
      || !/^[a-f0-9]{64}$/.test(finalReview.receiptSha256)
      || !finalReview.currentFingerprintVerified) {
      add('answer_final_review_missing', 'A truthful, current-fingerprint final educational reconciliation is required.')
    }
    if (contract.questionType === 'two_part' && record.partBSupportsPartA !== true) add('answer_part_dependency_unreviewed', 'Part B must directly support the unique Part A answer.')
    if (!sameSet(record.slots.map((slot) => slot.slotId), contract.slots.map((slot) => slot.slotId))) add('answer_slot_inventory_mismatch', 'Every response slot must appear exactly once.')
    for (const expected of contract.slots) {
      const found = record.slots.filter((slot) => slot.slotId === expected.slotId)
      if (found.length !== 1) continue
      const slot = found[0]
      const slotIssue = (code: string, detail: string) => add(code, detail, expected.slotId)
      if (slot.prompt !== expected.prompt || slot.requestedSelectionCount !== expected.requestedSelectionCount || !sameSet(slot.keyedAnswerIds, expected.keyedAnswerIds)) slotIssue('answer_slot_contract_mismatch', 'Prompt, UI selection count, or key differs from the current contract.')
      if (!Number.isInteger(expected.requestedSelectionCount) || expected.requestedSelectionCount < 1 || expected.requestedSelectionCount !== expected.keyedAnswerIds.length || expected.keyedAnswerIds.some((id) => !expected.answerIds.includes(id)) || !distinct(expected.answerIds)) slotIssue('answer_contract_invalid', 'The authored slot itself has an invalid selection or answer identity contract.')
      if (!sameSet(slot.optionJudgments.map((judgment) => judgment.answerId), expected.answerIds)) slotIssue('answer_option_inventory_mismatch', 'Judge every visible option exactly once; no omitted, duplicate, or unknown options.')
      for (const judgment of slot.optionJudgments) {
        if (!verdicts.includes(judgment.verdict) || !judgment.rationale.trim() || !judgment.evidenceIds.length || judgment.evidenceIds.some((id) => !contract.evidenceIds.includes(id))) slotIssue('answer_option_judgment_invalid', `Option ${judgment.answerId} needs a valid verdict, concise rationale, and source-owned evidence.`)
      }
      const judgedDefensible = slot.optionJudgments.filter((judgment) => defensibleVerdicts.includes(judgment.verdict)).map((judgment) => judgment.answerId)
      if (!sameSet(judgedDefensible, slot.independentlyDefensibleAnswerIds)) slotIssue('answer_defensible_set_mismatch', 'The conclusion set must include every defensible or equivalent option, and only those options.')
      const computed = determineAnswerSlotStatus(expected, slot)
      if (computed !== 'PASS') slotIssue(`answer_${computed.toLowerCase()}`, 'The semantic answer contract has not passed.')
      if (computed !== slot.uniquenessStatus) slotIssue('answer_status_mismatch', 'A stored PASS cannot override the option-level conclusions.')
    }
    if (record.correctionApplied && !record.correctionSummary.trim()) add('answer_correction_summary_missing', 'A correction needs an explicit summary.')
    if (record.finalStatus !== 'PASS') add('answer_review_incomplete', 'This record is not approved for semantic release.')
  }
  return issues
}
