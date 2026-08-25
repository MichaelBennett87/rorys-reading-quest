import { resolvePassageEvidence } from '../evidence'
import type { AuthorClaimGuide, ContentPack, ContentPackAuditIssue } from './contentPackTypes'

const PACK_ID = 'g3-information-detectives-claim-evidence-court'
const VALID_CLAIM_KINDS = new Set(['recommendation', 'best-choice', 'evaluation', 'priority', 'proposed-action'])
const VALID_EVIDENCE_KINDS = new Set(['fact', 'example', 'observation', 'measurement', 'result', 'comparison'])

export function buildAuthorClaimGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.authorClaimGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  if (guides.length === 0) {
    add(issues, 'missing_author_claim_guide', PACK_ID, 'Claim and Evidence Court requires authored claim-and-evidence guides.')
    return issues
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'author_claim_guide_count_mismatch', PACK_ID, 'Claim and Evidence Court requires one guide for each of seven informational argument texts.')
  }

  const seen = new Set<string>()
  for (const guide of guides) {
    const passage = passageById.get(guide.passageId)
    if (!passage || seen.has(guide.passageId)) {
      invalid(issues, guide.passageId, 'Guide passage IDs must resolve uniquely inside the pack.')
      continue
    }
    seen.add(guide.passageId)
    validateGuide(pack, guide, passage, issues)
  }
  for (const passage of pack.passages) {
    if (!seen.has(passage.passageIdentifier)) add(issues, 'missing_author_claim_guide', passage.passageIdentifier, 'Every text requires exactly one author claim guide.')
  }
  validatePackShape(pack, guides, issues)
  return issues
}

function validateGuide(
  pack: ContentPack,
  guide: AuthorClaimGuide,
  passage: ContentPack['passages'][number],
  issues: ContentPackAuditIssue[],
) {
  const structure = passage.informationalStructure
  const sections = structure?.sections ?? []
  const sectionById = new Map(sections.map((section) => [section.sectionId, section] as const))
  const title = (structure?.features ?? []).find((feature) => feature.kind === 'title')
  const visibleSentences = new Map((passage.sentences ?? []).map((sentence) => [sentence.sentenceId, sentence.text] as const))
  if (passage.contentKind !== 'informational' || !structure || !title || sections.length < 2) invalid(issues, guide.passageId, 'Guides require a titled informational text with multiple sections.')
  if (!guide.topic.trim()) invalid(issues, guide.passageId, 'A topic is required.')
  if (!VALID_CLAIM_KINDS.has(guide.claimKind)) invalid(issues, guide.passageId, 'The claim kind is not supported by this guide model.')

  const claim = guide.claimStatement.trim()
  if (!claim || claim.split(/\s+/).length < 6 || !/[.!?]$/.test(claim)) invalid(issues, guide.passageId, 'The author claim must be a complete thought.')
  if (normalize(claim) === normalize(guide.topic) || normalize(claim) === normalize(title?.text ?? '')) add(issues, 'claim_is_topic_only', guide.passageId, 'The author claim must differ from the topic and title.')
  if (/^to\s+/i.test(claim)) add(issues, 'claim_is_purpose_only', guide.passageId, 'An author-purpose statement cannot serve as the author claim.')
  if (/\?$/.test(claim)) add(issues, 'claim_is_fact_only', guide.passageId, 'The author claim cannot be a question.')
  if (!/\b(should|better|best|practical|priority|needs?|recommended|useful choice)\b/i.test(claim)) add(issues, 'claim_is_fact_only', guide.passageId, 'The claim must express a supportable position, recommendation, evaluation, priority, or proposed action.')

  if (guide.claimEvidenceIds.length === 0 || guide.claimEvidenceIds.some((id) => !resolvePassageEvidence(passage, id))) invalid(issues, guide.passageId, 'Claim evidence IDs must resolve to learner-visible passage evidence.')
  if (!guide.claimEvidenceIds.some((id) => normalize(visibleSentences.get(id) ?? '') === normalize(claim))) add(issues, 'unsupported_author_claim', guide.passageId, 'The explicit claim must appear in learner-visible text.')

  const reasonIds = new Set(guide.reasons.map((reason) => reason.reasonId))
  if (guide.reasons.length < 2 || reasonIds.size !== guide.reasons.length) add(issues, 'unsupported_author_claim', guide.passageId, 'Each guide requires at least two unique reasons.')
  if (guide.evidence.length < 3) add(issues, 'unsupported_author_claim', guide.passageId, 'Each guide requires at least three evidence records.')
  if (guide.weakOrIrrelevantDetails.length < 1) invalid(issues, guide.passageId, 'Each guide requires a true but weak or irrelevant detail.')

  for (const reason of guide.reasons) {
    if (!reason.reasonStatement.trim() || !reason.connectionStatement.trim()) add(issues, 'weak_claim_evidence_connection', reason.reasonId, 'Reasons require a statement and an explanation connecting them to the claim.')
    if (!sectionById.has(reason.sectionId) || reason.evidenceIds.length === 0 || reason.evidenceIds.some((id) => !resolvePassageEvidence(passage, id))) {
      invalid(issues, reason.reasonId, 'Reason evidence must resolve in the passage, and the reason must own a valid section.')
    }
    if (reason.evidenceIds.length === 0 || !guide.evidence.some((entry) => entry.supportsReasonIds.includes(reason.reasonId))) add(issues, 'reason_without_evidence', reason.reasonId, 'Every reason requires declared supporting evidence.')
    if (normalize(reason.reasonStatement) === normalize(claim)) add(issues, 'circular_claim_evidence', reason.reasonId, 'A reason cannot merely repeat the claim.')
  }

  for (const evidence of guide.evidence) {
    if (!VALID_EVIDENCE_KINDS.has(evidence.evidenceKind)) invalid(issues, evidence.evidenceId, 'Evidence kind is not supported by this guide model.')
    if (!evidence.evidenceStatement.trim() || !evidence.claimConnectionStatement.trim() || !['strong', 'secondary'].includes(evidence.strength)) add(issues, 'weak_claim_evidence_connection', evidence.evidenceId, 'Evidence requires a statement, strength, and logical claim connection.')
    validateOwnedEvidence(passage, sectionById, evidence.sectionId, evidence.sourceEvidenceIds, evidence.evidenceId, issues)
    if (evidence.supportsReasonIds.length === 0 || evidence.supportsReasonIds.some((id) => !reasonIds.has(id))) add(issues, 'evidence_without_reason', evidence.evidenceId, 'Evidence must support at least one declared reason.')
    if (!evidence.sourceEvidenceIds.some((id) => normalize(visibleSentences.get(id) ?? '') === normalize(evidence.evidenceStatement))) invalid(issues, evidence.evidenceId, 'Evidence statements must match learner-visible source text.')
    if (normalize(evidence.evidenceStatement) === normalize(claim) || guide.reasons.some((reason) => normalize(evidence.evidenceStatement) === normalize(reason.reasonStatement))) add(issues, 'circular_claim_evidence', evidence.evidenceId, 'Evidence cannot merely repeat the claim or a reason.')
  }

  for (const detail of guide.weakOrIrrelevantDetails) {
    if (!detail.explanation.trim()) add(issues, 'weak_claim_evidence_connection', detail.detailId, 'Weak details require an explanation of why they do not strongly support the claim.')
    validateOwnedEvidence(passage, sectionById, detail.sectionId, detail.evidenceIds, detail.detailId, issues)
  }

  if (!guide.synthesisStatement.trim() || !/claim/i.test(guide.synthesisStatement) || !/reason/i.test(guide.synthesisStatement) || !/evidence/i.test(guide.synthesisStatement)) add(issues, 'weak_claim_evidence_connection', guide.passageId, 'The synthesis must connect the claim, reasons, and evidence.')
  const guideText = [guide.topic, claim, guide.synthesisStatement, ...guide.reasons.flatMap((reason) => [reason.reasonStatement, reason.connectionStatement]), ...guide.evidence.flatMap((entry) => [entry.evidenceStatement, entry.claimConnectionStatement]), ...guide.weakOrIrrelevantDetails.map((detail) => detail.explanation)]
  if (guideText.some((text) => /<[^>]+>/.test(text) || /https?:\/\//i.test(text))) invalid(issues, guide.passageId, 'Guide text cannot contain raw HTML or remote URLs.')
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) invalid(issues, guide.passageId, 'Guide status and version must match the DRAFT pack.')

  const checkpoint = pack.lessons.some((lesson) => lesson.lessonRole === 'CHECKPOINT' && lesson.passageIdentifiers.includes(guide.passageId))
  if (checkpoint) {
    if (new Set(guide.evidence.map((entry) => entry.sectionId)).size < 2) invalid(issues, guide.passageId, 'Checkpoint evidence must come from at least two sections.')
    if (new Set(guide.evidence.map((entry) => entry.evidenceKind)).size < 2) invalid(issues, guide.passageId, 'Checkpoint guides require at least two evidence kinds.')
  }
}

function validateOwnedEvidence(
  passage: ContentPack['passages'][number],
  sectionById: Map<string, NonNullable<ContentPack['passages'][number]['informationalStructure']>['sections'][number]>,
  sectionId: string,
  evidenceIds: readonly string[],
  itemIdentifier: string,
  issues: ContentPackAuditIssue[],
) {
  const section = sectionById.get(sectionId)
  if (!section || evidenceIds.length === 0 || evidenceIds.some((id) => !resolvePassageEvidence(passage, id) || (!section.sentenceIds.includes(id) && !section.featureIds.includes(id)))) {
    invalid(issues, itemIdentifier, 'Claim evidence must resolve inside its declared section.')
  }
}

function validatePackShape(pack: ContentPack, guides: readonly AuthorClaimGuide[], issues: ContentPackAuditIssue[]) {
  const active = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const guided = active.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = active.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const supports = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const counts = new Map<string, number>()
  for (const question of pack.questions) counts.set(question.questionType, (counts.get(question.questionType) ?? 0) + 1)
  const exact: Array<[number, number, string]> = [
    [active.length, 7, 'active lessons'], [pack.passages.length, 7, 'texts'], [guides.length, 7, 'guides'], [pack.questions.length, 41, 'questions'], [supports.length, 28, 'Word Help targets'],
    [guided.filter((lesson) => lesson.difficulty === 3).length, 2, 'difficulty-3 remediation lessons'], [guided.filter((lesson) => lesson.difficulty === 4).length, 2, 'difficulty-4 guided lessons'], [checkpoints.filter((lesson) => lesson.difficulty === 4).length, 3, 'difficulty-4 checkpoints'],
    [counts.get('multiple_choice') ?? 0, 17, 'multiple-choice questions'], [counts.get('multi_select') ?? 0, 7, 'multiselect questions'], [counts.get('hot_text') ?? 0, 7, 'hot-text questions'], [counts.get('table_match') ?? 0, 7, 'table-match questions'], [counts.get('two_part') ?? 0, 3, 'two-part questions'],
  ]
  for (const [actual, expected, label] of exact) if (actual !== expected) invalid(issues, PACK_ID, `Claim and Evidence Court requires exactly ${expected} ${label}; found ${actual}.`)
  if (pack.passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) !== 4)) invalid(issues, PACK_ID, 'Every text requires exactly four Word Help targets.')
  if (new Set(guides.map((guide) => guide.claimKind)).size < 4) invalid(issues, PACK_ID, 'The pack requires at least four distinct claim kinds.')
  if (new Set(guides.flatMap((guide) => guide.evidence.map((entry) => entry.evidenceKind))).size < 4) invalid(issues, PACK_ID, 'The pack requires at least four evidence kinds.')
  if (guided.some((lesson) => !lesson.teachingBlock || lesson.eligiblePurposes.includes('progression') || lesson.eligiblePurposes.includes('verification'))) invalid(issues, PACK_ID, 'Guided lessons require teaching and cannot provide progression or verification evidence.')
  if (checkpoints.some((lesson) => lesson.teachingBlock || lesson.eligiblePurposes.includes('remediation'))) invalid(issues, PACK_ID, 'Checkpoints cannot include teaching or remediation eligibility.')
  for (const lesson of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags ?? []))
    for (const tag of ['author-claim', 'reasons', 'evidence', 'claim-evidence-connection', 'claim-topic-distinction', 'claim-central-idea-distinction', 'claim-purpose-distinction', 'claim-fact-distinction', 'reason-evidence-distinction', 'strong-weak-evidence', 'cross-section-evidence', 'claim-transfer']) {
      if (!tags.has(tag)) invalid(issues, lesson.lessonId, `Checkpoint coverage is missing ${tag}.`)
    }
    if (!questions.some((question) => question.questionType === 'table_match') || !questions.some((question) => question.questionType === 'two_part')) invalid(issues, lesson.lessonId, 'Every checkpoint requires a table and a two-part evidence item.')
  }
}

function normalize(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'author_claim_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
