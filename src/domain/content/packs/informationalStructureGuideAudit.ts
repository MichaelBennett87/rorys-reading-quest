import { resolvePassageEvidence } from '../evidence'
import type { ContentPack, ContentPackAuditIssue, InformationalStructureGuide } from './contentPackTypes'

const PACK_ID = 'g3-information-detectives-structure-station'
const STRUCTURES = ['chronology', 'comparison', 'cause-effect'] as const
const REQUIRED_FEATURES = ['title', 'heading', 'caption', 'illustration', 'glossary', 'timeline', 'sidebar'] as const

export function buildInformationalStructureGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.informationalStructureGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  if (guides.length === 0) {
    add(issues, 'missing_informational_structure_guide', PACK_ID, 'Structure Station requires authored informational-structure guides.')
    return issues
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'informational_structure_guide_count_mismatch', PACK_ID, 'Structure Station requires one guide for each of seven informational texts.')
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
  for (const passage of pack.passages) if (!seen.has(passage.passageIdentifier)) add(issues, 'missing_informational_structure_guide', passage.passageIdentifier, 'Every text requires one guide.')
  validateShape(pack, guides, issues)
  return issues
}

function validateGuide(pack: ContentPack, guide: InformationalStructureGuide, passage: ContentPack['passages'][number], issues: ContentPackAuditIssue[]) {
  const structure = passage.informationalStructure
  const featureById = new Map((structure?.features ?? []).map((feature) => [feature.featureId, feature] as const))
  if (passage.contentKind !== 'informational' || !structure) invalid(issues, guide.passageId, 'Guides must resolve to structured informational texts.')
  if (!STRUCTURES.includes(guide.primaryStructure)) invalid(issues, guide.passageId, 'Primary structure must be chronology, comparison, or cause-effect.')
  if (guide.featureContributions.length < 2) invalid(issues, guide.passageId, 'Every text requires at least two meaningful feature contributions.')
  for (const contribution of guide.featureContributions) {
    const feature = featureById.get(contribution.featureId)
    if (!feature || feature.kind !== contribution.featureKind || !contribution.contributionStatement.trim()) invalid(issues, contribution.featureId, 'Feature contributions must resolve and explain a matching feature.')
    if (!/help|make|clarif|explain|show|connect|trace|signal|add|prepare|group|condense/i.test(contribution.contributionStatement)) invalid(issues, contribution.featureId, 'A feature contribution must explain how the feature supports meaning or navigation.')
    if (contribution.evidenceIds.length === 0 || contribution.evidenceIds.some((id) => !resolvePassageEvidence(passage, id))) invalid(issues, contribution.featureId, 'Feature evidence must resolve in the passage.')
  }
  if (guide.structureEvidence.length < 2 || guide.structureEvidence.some((entry) => entry.structure !== guide.primaryStructure || !entry.explanation.trim() || entry.evidenceIds.length === 0 || entry.evidenceIds.some((id) => !resolvePassageEvidence(passage, id)))) {
    invalid(issues, guide.passageId, 'Structure evidence must agree with the primary organization and resolve to learner-visible text.')
  }
  if (!guide.organizationalSummary.trim()) invalid(issues, guide.passageId, 'An organizational summary is required.')
  if (guide.primaryStructure === 'chronology' && !/order|sequence|step|first|morning/i.test(guide.organizationalSummary)) invalid(issues, guide.passageId, 'Chronology requires a genuine ordered progression.')
  if (guide.primaryStructure === 'comparison' && !/similar|differ|compare|share|both/i.test(guide.organizationalSummary)) invalid(issues, guide.passageId, 'Comparison requires meaningful similarities or differences.')
  if (guide.primaryStructure === 'cause-effect' && !/cause|result|why|because|changes/i.test(guide.organizationalSummary)) invalid(issues, guide.passageId, 'Cause and effect requires a genuine causal relationship.')
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) invalid(issues, guide.passageId, 'Guide status and version must match the DRAFT pack.')
  const guideText = [guide.organizationalSummary, ...guide.featureContributions.map((entry) => entry.contributionStatement), ...guide.structureEvidence.map((entry) => entry.explanation)]
  if (guideText.some((text) => /<[^>]+>/.test(text) || /https?:\/\//i.test(text))) invalid(issues, guide.passageId, 'Guide text cannot contain raw HTML or remote URLs.')
}

function validateShape(pack: ContentPack, guides: readonly InformationalStructureGuide[], issues: ContentPackAuditIssue[]) {
  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const guided = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const supports = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const counts = new Map<string, number>()
  for (const question of pack.questions) counts.set(question.questionType, (counts.get(question.questionType) ?? 0) + 1)
  const exact: Array<[number, number, string]> = [
    [activeLessons.length, 7, 'active lessons'], [pack.passages.length, 7, 'texts'], [guides.length, 7, 'guides'], [pack.questions.length, 41, 'questions'], [supports.length, 28, 'Word Help targets'],
    [guided.filter((lesson) => lesson.difficulty === 0).length, 2, 'difficulty-0 lessons'], [guided.filter((lesson) => lesson.difficulty === 1).length, 2, 'difficulty-1 guided lessons'], [checkpoints.filter((lesson) => lesson.difficulty === 1).length, 3, 'difficulty-1 checkpoints'],
    [counts.get('multiple_choice') ?? 0, 17, 'multiple-choice questions'], [counts.get('multi_select') ?? 0, 7, 'multiselect questions'], [counts.get('hot_text') ?? 0, 7, 'hot-text questions'], [counts.get('table_match') ?? 0, 7, 'table-match questions'], [counts.get('two_part') ?? 0, 3, 'two-part questions'],
  ]
  for (const [actual, expected, label] of exact) if (actual !== expected) invalid(issues, PACK_ID, `Structure Station requires exactly ${expected} ${label}; found ${actual}.`)
  if (pack.passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) !== 4)) invalid(issues, PACK_ID, 'Every text requires exactly four Word Help targets.')
  const structureCounts = new Map<string, number>()
  const featureKinds = new Set<string>()
  for (const guide of guides) {
    structureCounts.set(guide.primaryStructure, (structureCounts.get(guide.primaryStructure) ?? 0) + 1)
    guide.featureContributions.forEach((entry) => featureKinds.add(entry.featureKind))
  }
  if ((structureCounts.get('chronology') ?? 0) < 2 || (structureCounts.get('comparison') ?? 0) < 2 || (structureCounts.get('cause-effect') ?? 0) < 2) invalid(issues, PACK_ID, 'Chronology, comparison, and cause-effect each require at least two texts.')
  for (const kind of REQUIRED_FEATURES) if (!pack.passages.some((passage) => passage.informationalStructure?.features.some((feature) => feature.kind === kind))) invalid(issues, PACK_ID, `Required feature kind is missing: ${kind}.`)
  if (guided.some((lesson) => !lesson.teachingBlock || lesson.eligiblePurposes.includes('progression') || lesson.eligiblePurposes.includes('verification'))) invalid(issues, PACK_ID, 'Guided lessons require teaching and cannot provide progression or verification evidence.')
  if (checkpoints.some((lesson) => lesson.teachingBlock || lesson.eligiblePurposes.includes('remediation'))) invalid(issues, PACK_ID, 'Checkpoints cannot include teaching or remediation eligibility.')
  for (const lesson of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags ?? []))
    if (!tags.has('text-features-contribute-to-meaning') || !tags.has('structure-identification') || !tags.has('structure-evidence') || !tags.has('structure-transfer') || !tags.has('structure-feature-table') || !questions.some((question) => question.questionType === 'two_part')) invalid(issues, lesson.lessonId, 'Every checkpoint requires feature contribution, structure, evidence, transfer, table, and two-part work.')
  }
  const forbidden = /central-idea|author-purpose|claim-evidence|informational-summary/
  if (pack.questions.some((question) => (question.tags ?? []).some((tag) => forbidden.test(tag)))) invalid(issues, PACK_ID, 'Structure Station cannot drift into later informational constructs.')
}

function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'informational_structure_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
