import { resolvePassageEvidence } from '../evidence'
import type { AuthorPurposeGuide, ContentPack, ContentPackAuditIssue } from './contentPackTypes'

const PACK_ID = 'g3-information-detectives-purpose-development-path'
const VALID_PURPOSE_KINDS = new Set([
  'explain-how', 'describe', 'teach-about', 'explain-process', 'explain-why', 'provide-facts', 'compare', 'explain-change',
])

export function buildPurposeDevelopmentGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.authorPurposeGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  if (guides.length === 0) {
    add(issues, 'missing_author_purpose_guide', PACK_ID, 'Purpose Development Path requires authored purpose-development guides.')
    return issues
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'author_purpose_guide_count_mismatch', PACK_ID, 'Purpose Development Path requires one guide for each of seven informational texts.')
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
    if (!seen.has(passage.passageIdentifier)) add(issues, 'missing_author_purpose_guide', passage.passageIdentifier, 'Every text requires one purpose guide.')
  }
  validatePackShape(pack, guides, issues)
  return issues
}

function validateGuide(
  pack: ContentPack,
  guide: AuthorPurposeGuide,
  passage: ContentPack['passages'][number],
  issues: ContentPackAuditIssue[],
) {
  const structure = passage.informationalStructure
  const sections = structure?.sections ?? []
  const sectionById = new Map(sections.map((section) => [section.sectionId, section] as const))
  const title = (structure?.features ?? []).find((feature) => feature.kind === 'title')
  if (passage.contentKind !== 'informational' || !structure || !title || sections.length < 2) invalid(issues, guide.passageId, 'Guides require a titled informational text with multiple sections.')

  const purpose = guide.specificPurposeStatement.trim()
  if (!guide.topicLabel.trim() || !purpose) invalid(issues, guide.passageId, 'Topic and precise purpose are required.')
  if (!/^to\s+/i.test(purpose) || purpose.split(/\s+/).length < 6 || !/[.!?]$/.test(purpose)) invalid(issues, guide.passageId, 'Purpose must be a complete, precise author-goal statement beginning with to.')
  if (/^to (inform|entertain|persuade)\.?$/i.test(purpose)) invalid(issues, guide.passageId, 'Purpose must be more precise than a generic PIE label.')
  if (normalize(purpose) === normalize(guide.topicLabel) || normalize(purpose) === normalize(title?.text ?? '')) invalid(issues, guide.passageId, 'Purpose must differ from the topic and title.')
  if (/persuad|convinc|argu|\bshould\b/i.test(purpose)) invalid(issues, guide.passageId, 'Purpose Development Path cannot key an argumentative claim purpose.')
  if (!VALID_PURPOSE_KINDS.has(guide.purposeKind)) invalid(issues, guide.passageId, 'Purpose kind is not supported by this guide model.')

  const supporting = guide.supportingDetails ?? []
  const weak = guide.weakOrNonDiagnosticDetails ?? []
  const sectionContributions = guide.sectionContributions ?? []
  if (supporting.length < 3 || supporting.filter((detail) => detail.strength === 'strong').length < 2) invalid(issues, guide.passageId, 'Each guide requires at least three supporting details, including two strong details.')
  if (weak.length < 1) invalid(issues, guide.passageId, 'Each guide requires a true but weakly diagnostic detail.')
  if (sectionContributions.length < 2) invalid(issues, guide.passageId, 'Purpose development must explain contributions from at least two sections.')

  const detailIds = [...supporting.map((detail) => detail.detailId), ...weak.map((detail) => detail.detailId)]
  if (new Set(detailIds).size !== detailIds.length) invalid(issues, guide.passageId, 'Purpose detail IDs must be unique.')
  for (const detail of supporting) {
    if (!detail.contributionStatement.trim() || !['strong', 'secondary'].includes(detail.strength)) invalid(issues, detail.detailId, 'Supporting details require a contribution and valid strength.')
    validateOwnedEvidence(passage, sectionById, detail.sectionId, detail.evidenceIds, detail.detailId, issues)
  }
  for (const detail of weak) {
    if (!detail.explanation.trim()) invalid(issues, detail.detailId, 'Weak details require an explanation of why they are less diagnostic.')
    validateOwnedEvidence(passage, sectionById, detail.sectionId, detail.evidenceIds, detail.detailId, issues)
  }
  for (const contribution of sectionContributions) {
    if (!contribution.contributionStatement.trim()) invalid(issues, guide.passageId, 'Section contribution statements are required.')
    validateOwnedEvidence(passage, sectionById, contribution.sectionId, contribution.evidenceIds, guide.passageId, issues)
  }

  const purposeIds = new Set(supporting.flatMap((detail) => detail.evidenceIds))
  if (guide.purposeEvidenceIds.some((id) => !purposeIds.has(id)) || purposeIds.size !== guide.purposeEvidenceIds.length) invalid(issues, guide.passageId, 'Purpose evidence IDs must match the structured supporting details.')
  const weakIds = new Set(weak.flatMap((detail) => detail.evidenceIds))
  if (guide.secondaryDetailIds.some((id) => !weakIds.has(id)) || weakIds.size !== guide.secondaryDetailIds.length) invalid(issues, guide.passageId, 'Secondary detail IDs must match the weak-detail records.')
  if (!guide.synthesisStatement?.trim() || !/purpose|section|detail|together|across/i.test(guide.synthesisStatement)) invalid(issues, guide.passageId, 'A synthesis statement must explain how selected content develops the purpose.')

  const guideText = [guide.topicLabel, purpose, guide.synthesisStatement ?? '', ...supporting.map((detail) => detail.contributionStatement), ...weak.map((detail) => detail.explanation), ...sectionContributions.map((entry) => entry.contributionStatement)]
  if (guideText.some((text) => /<[^>]+>/.test(text) || /https?:\/\//i.test(text))) invalid(issues, guide.passageId, 'Guide text cannot contain raw HTML or remote URLs.')
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) invalid(issues, guide.passageId, 'Guide status and version must match the DRAFT pack.')
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
    invalid(issues, itemIdentifier, 'Purpose evidence must resolve inside its declared section.')
  }
}

function validatePackShape(pack: ContentPack, guides: readonly AuthorPurposeGuide[], issues: ContentPackAuditIssue[]) {
  const active = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const guided = active.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = active.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const supports = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const counts = new Map<string, number>()
  for (const question of pack.questions) counts.set(question.questionType, (counts.get(question.questionType) ?? 0) + 1)
  const exact: Array<[number, number, string]> = [
    [active.length, 7, 'active lessons'], [pack.passages.length, 7, 'texts'], [guides.length, 7, 'guides'], [pack.questions.length, 41, 'questions'], [supports.length, 28, 'Word Help targets'],
    [guided.filter((lesson) => lesson.difficulty === 2).length, 2, 'difficulty-2 remediation lessons'], [guided.filter((lesson) => lesson.difficulty === 3).length, 2, 'difficulty-3 guided lessons'], [checkpoints.filter((lesson) => lesson.difficulty === 3).length, 3, 'difficulty-3 checkpoints'],
    [counts.get('multiple_choice') ?? 0, 17, 'multiple-choice questions'], [counts.get('multi_select') ?? 0, 7, 'multiselect questions'], [counts.get('hot_text') ?? 0, 7, 'hot-text questions'], [counts.get('table_match') ?? 0, 7, 'table-match questions'], [counts.get('two_part') ?? 0, 3, 'two-part questions'],
  ]
  for (const [actual, expected, label] of exact) if (actual !== expected) invalid(issues, PACK_ID, `Purpose Development Path requires exactly ${expected} ${label}; found ${actual}.`)
  if (pack.passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) !== 4)) invalid(issues, PACK_ID, 'Every text requires exactly four Word Help targets.')
  if (new Set(guides.map((guide) => guide.purposeKind)).size < 5) invalid(issues, PACK_ID, 'The pack requires at least five distinct precise purpose kinds.')
  if (guided.some((lesson) => !lesson.teachingBlock || lesson.eligiblePurposes.includes('progression') || lesson.eligiblePurposes.includes('verification'))) invalid(issues, PACK_ID, 'Guided lessons require teaching and cannot provide progression or verification evidence.')
  if (checkpoints.some((lesson) => lesson.teachingBlock || lesson.eligiblePurposes.includes('remediation'))) invalid(issues, PACK_ID, 'Checkpoints cannot include teaching or remediation eligibility.')
  for (const lesson of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags ?? []))
    for (const tag of ['author-purpose', 'topic-purpose-distinction', 'central-idea-purpose-distinction', 'supporting-details', 'purpose-development', 'text-evidence', 'section-contribution', 'purpose-transfer']) {
      if (!tags.has(tag)) invalid(issues, lesson.lessonId, `Checkpoint coverage is missing ${tag}.`)
    }
    if (!questions.some((question) => question.questionType === 'table_match') || !questions.some((question) => question.questionType === 'two_part')) invalid(issues, lesson.lessonId, 'Every checkpoint requires a table and a two-part evidence item.')
  }
  if (pack.questions.some((question) => (question.tags ?? []).some((tag) => /claim-evidence|argument/.test(tag)))) invalid(issues, PACK_ID, 'Purpose Development Path cannot drift into claim-and-evidence instruction.')
}

function normalize(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'author_purpose_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
