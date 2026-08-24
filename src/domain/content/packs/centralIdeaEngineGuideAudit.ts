import { resolvePassageEvidence } from '../evidence'
import type { CentralIdeaDetail, CentralIdeaGuide, ContentPack, ContentPackAuditIssue } from './contentPackTypes'

const PACK_ID = 'g3-information-detectives-central-idea-engine'

export function buildCentralIdeaEngineGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.centralIdeaGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  if (guides.length === 0) {
    add(issues, 'missing_central_idea_guide', PACK_ID, 'Central Idea Engine requires authored central-idea guides.')
    return issues
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'central_idea_guide_count_mismatch', PACK_ID, 'Central Idea Engine requires one guide for each of seven informational texts.')
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
    if (!seen.has(passage.passageIdentifier)) add(issues, 'missing_central_idea_guide', passage.passageIdentifier, 'Every text requires one guide.')
  }
  validateShape(pack, guides, issues)
  return issues
}

function validateGuide(pack: ContentPack, guide: CentralIdeaGuide, passage: ContentPack['passages'][number], issues: ContentPackAuditIssue[]) {
  const structure = passage.informationalStructure
  const sections = structure?.sections ?? []
  const sectionById = new Map(sections.map((section) => [section.sectionId, section] as const))
  const title = (structure?.features ?? []).find((feature) => feature.kind === 'title')
  if (passage.contentKind !== 'informational' || !structure || !title || sections.length < 2) invalid(issues, guide.passageId, 'Guides require a structured informational text with a title and multiple sections.')
  if (!guide.topicLabel.trim() || !guide.centralIdeaStatement.trim()) invalid(issues, guide.passageId, 'Topic and central idea are required.')
  if (normalize(guide.centralIdeaStatement) === normalize(guide.topicLabel) || normalize(guide.centralIdeaStatement) === normalize(title?.text ?? '')) invalid(issues, guide.passageId, 'The central idea must differ from the topic and title.')
  if (guide.centralIdeaStatement.trim().split(/\s+/).length < 6 || !/[.!?]$/.test(guide.centralIdeaStatement.trim())) invalid(issues, guide.passageId, 'The central idea must be a complete, explanatory thought.')
  if (!['stated', 'inferred'].includes(guide.centralIdeaMode)) invalid(issues, guide.passageId, 'The central idea mode must be stated or inferred.')
  if (guide.centralIdeaMode === 'stated' && (!guide.explicitCentralIdeaSentenceId || !resolvePassageEvidence(passage, guide.explicitCentralIdeaSentenceId))) invalid(issues, guide.passageId, 'A stated central idea requires resolved explicit evidence.')
  if (guide.centralIdeaMode === 'inferred' && guide.explicitCentralIdeaSentenceId) invalid(issues, guide.passageId, 'An inferred central idea cannot claim one explicit statement.')

  const relevant = guide.relevantDetails ?? []
  const minor = guide.irrelevantOrMinorDetails ?? []
  if (relevant.length < 4) invalid(issues, guide.passageId, 'Every guide requires at least four relevant supporting details.')
  if (minor.length < 2) invalid(issues, guide.passageId, 'Every guide requires at least two true minor or irrelevant details.')
  validateDetails(relevant, true, passage, sectionById, issues)
  validateDetails(minor, false, passage, sectionById, issues)
  const detailIds = [...relevant, ...minor].map((detail) => detail.detailId)
  if (new Set(detailIds).size !== detailIds.length) invalid(issues, guide.passageId, 'Detail IDs must be unique within a guide.')

  const sectionSupport = guide.sectionSupport ?? []
  if (sectionSupport.length < 2) invalid(issues, guide.passageId, 'Central idea support must connect at least two sections.')
  for (const support of sectionSupport) {
    if (!sectionById.has(support.sectionId) || !support.contributionStatement.trim() || support.evidenceIds.length === 0 || support.evidenceIds.some((id) => !resolvePassageEvidence(passage, id))) invalid(issues, guide.passageId, 'Section support must resolve and explain its contribution.')
  }
  if (!guide.synthesisStatement?.trim() || !/section|detail|together|across|support/i.test(guide.synthesisStatement)) invalid(issues, guide.passageId, 'A synthesis statement must connect details across sections to the central idea.')

  const relevantSections = new Set(relevant.map((detail) => detail.sectionId))
  if (relevantSections.size < 2) invalid(issues, guide.passageId, 'Relevant details must support the central idea across sections.')
  const guideText = [guide.topicLabel, guide.centralIdeaStatement, guide.synthesisStatement ?? '', ...relevant.map((detail) => detail.contributionStatement), ...minor.map((detail) => detail.contributionStatement), ...sectionSupport.map((support) => support.contributionStatement)]
  if (guideText.some((text) => /<[^>]+>/.test(text) || /https?:\/\//i.test(text))) invalid(issues, guide.passageId, 'Guide text cannot contain raw HTML or remote URLs.')
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) invalid(issues, guide.passageId, 'Guide status and version must match the DRAFT pack.')
}

function validateDetails(details: readonly CentralIdeaDetail[], expectedRelevant: boolean, passage: ContentPack['passages'][number], sectionById: Map<string, NonNullable<ContentPack['passages'][number]['informationalStructure']>['sections'][number]>, issues: ContentPackAuditIssue[]) {
  for (const detail of details) {
    const section = sectionById.get(detail.sectionId)
    if (detail.relevant !== expectedRelevant || !detail.contributionStatement.trim() || !section || detail.evidenceIds.length === 0) {
      invalid(issues, detail.detailId, 'Each detail must declare accurate relevance, section ownership, evidence, and contribution.')
      continue
    }
    if (detail.evidenceIds.some((id) => !resolvePassageEvidence(passage, id) || (!section.sentenceIds.includes(id) && !section.featureIds.includes(id)))) invalid(issues, detail.detailId, 'Detail evidence must resolve inside its declared section.')
  }
}

function validateShape(pack: ContentPack, guides: readonly CentralIdeaGuide[], issues: ContentPackAuditIssue[]) {
  const active = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const guided = active.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = active.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const supports = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const counts = new Map<string, number>()
  for (const question of pack.questions) counts.set(question.questionType, (counts.get(question.questionType) ?? 0) + 1)
  const exact: Array<[number, number, string]> = [
    [active.length, 7, 'active lessons'], [pack.passages.length, 7, 'texts'], [guides.length, 7, 'guides'], [pack.questions.length, 41, 'questions'], [supports.length, 28, 'Word Help targets'],
    [guided.filter((lesson) => lesson.difficulty === 1).length, 2, 'difficulty-1 remediation lessons'], [guided.filter((lesson) => lesson.difficulty === 2).length, 2, 'difficulty-2 guided lessons'], [checkpoints.filter((lesson) => lesson.difficulty === 2).length, 3, 'difficulty-2 checkpoints'],
    [counts.get('multiple_choice') ?? 0, 17, 'multiple-choice questions'], [counts.get('multi_select') ?? 0, 7, 'multiselect questions'], [counts.get('hot_text') ?? 0, 7, 'hot-text questions'], [counts.get('table_match') ?? 0, 7, 'table-match questions'], [counts.get('two_part') ?? 0, 3, 'two-part questions'],
  ]
  for (const [actual, expected, label] of exact) if (actual !== expected) invalid(issues, PACK_ID, `Central Idea Engine requires exactly ${expected} ${label}; found ${actual}.`)
  if (pack.passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) !== 4)) invalid(issues, PACK_ID, 'Every text requires exactly four Word Help targets.')
  if (guides.filter((guide) => guide.centralIdeaMode === 'stated').length < 3 || guides.filter((guide) => guide.centralIdeaMode === 'inferred').length < 3) invalid(issues, PACK_ID, 'The pack requires at least three stated and three inferred central ideas.')
  const checkpointPassageIds = new Set(checkpoints.flatMap((lesson) => lesson.passageIdentifiers))
  if (guides.filter((guide) => checkpointPassageIds.has(guide.passageId) && guide.centralIdeaMode === 'inferred').length < 2) invalid(issues, PACK_ID, 'At least two checkpoints require inferred central ideas.')
  if (guided.some((lesson) => !lesson.teachingBlock || lesson.eligiblePurposes.includes('progression') || lesson.eligiblePurposes.includes('verification'))) invalid(issues, PACK_ID, 'Guided lessons require teaching and cannot provide progression or verification evidence.')
  if (checkpoints.some((lesson) => lesson.teachingBlock || lesson.eligiblePurposes.includes('remediation'))) invalid(issues, PACK_ID, 'Checkpoints cannot include teaching or remediation eligibility.')
  for (const lesson of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags ?? []))
    for (const tag of ['central-idea', 'topic-central-idea-distinction', 'relevant-details', 'minor-detail-distinction', 'details-support-central-idea', 'evidence-across-sections', 'section-contribution', 'central-idea-transfer']) {
      if (!tags.has(tag)) invalid(issues, lesson.lessonId, `Checkpoint coverage is missing ${tag}.`)
    }
    if (!questions.some((question) => question.questionType === 'table_match') || !questions.some((question) => question.questionType === 'two_part')) invalid(issues, lesson.lessonId, 'Every checkpoint requires a table and a two-part evidence item.')
  }
  if (pack.questions.some((question) => (question.tags ?? []).some((tag) => /author-purpose|claim-evidence/.test(tag)))) invalid(issues, PACK_ID, 'Central Idea Engine cannot drift into later informational constructs.')
}

function normalize(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'central_idea_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
