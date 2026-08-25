import { resolvePassageEvidence } from '../evidence'
import type { ContentPack, ContentPackAuditIssue, FigurativeLanguageGuide } from './contentPackTypes'

const PACK_ID = 'g3-compare-castle-figurative-fortress'
const VALID_KINDS = new Set(['metaphor', 'personification', 'hyperbole'])
const VALID_FORMATS = new Set(['literary-prose', 'poem', 'informational'])

export function buildFigurativeLanguageGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.figurativeLanguageGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))

  if (guides.length === 0) {
    add(issues, 'missing_figurative_language_guide', PACK_ID, 'Figurative Fortress requires authored figurative-language guides.')
    return issues
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'figurative_language_guide_count_mismatch', PACK_ID, 'Figurative Fortress requires one guide for each of seven source texts.')
  }

  const passageIds = new Set<string>()
  const targetIds = new Set<string>()
  for (const guide of guides) {
    const passage = passageById.get(guide.passageId)
    if (!passage || passageIds.has(guide.passageId)) {
      invalid(issues, guide.passageId, 'Guide passage IDs must resolve uniquely inside the pack.')
      continue
    }
    passageIds.add(guide.passageId)
    validateGuide(pack, guide, passage, targetIds, issues)
  }
  for (const passage of pack.passages) {
    if (!passageIds.has(passage.passageIdentifier)) add(issues, 'missing_figurative_language_guide', passage.passageIdentifier, 'Every Figurative Fortress source requires exactly one guide.')
  }
  validatePackShape(pack, guides, targetIds, issues)
  return issues
}

function validateGuide(
  pack: ContentPack,
  guide: FigurativeLanguageGuide,
  passage: ContentPack['passages'][number],
  targetIds: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  const expectedFormat = passage.contentKind === 'poem' ? 'poem' : passage.contentKind === 'informational' ? 'informational' : 'literary-prose'
  if (guide.targets.length !== 4) invalid(issues, guide.passageId, `Each source requires exactly four figurative targets; found ${guide.targets.length}.`)
  if (!guide.literalVsNonliteralSummary.trim()) invalid(issues, guide.passageId, 'A literal-versus-nonliteral summary is required.')
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) invalid(issues, guide.passageId, 'Guide status and version must match the DRAFT pack.')
  if (containsUnsafe(guide.literalVsNonliteralSummary)) invalid(issues, guide.passageId, 'Guide text cannot contain raw HTML or remote URLs.')

  for (const target of guide.targets) {
    if (!target.targetId.trim() || targetIds.has(target.targetId)) invalid(issues, target.targetId || guide.passageId, 'Target IDs must be nonempty and globally unique.')
    targetIds.add(target.targetId)
    if (!VALID_KINDS.has(target.kind) || !VALID_FORMATS.has(target.sourceFormat) || target.sourceFormat !== expectedFormat) invalid(issues, target.targetId, 'Target kind and source format must be valid and match the source text.')
    if (!target.expressionText.trim() || !passage.passageText.includes(target.expressionText)) invalid(issues, target.targetId, 'The exact expression must appear in learner-visible source text.')
    if (!evidenceResolves(passage, target.sourceEvidenceIds) || !evidenceResolves(passage, target.contextEvidenceIds)) invalid(issues, target.targetId, 'Source and context evidence IDs must resolve in the owning source.')
    if (!target.literalReading.trim() || !target.figurativeMeaning.trim() || normalize(target.literalReading) === normalize(target.figurativeMeaning)) add(issues, 'figurative_meaning_not_supported', target.targetId, 'Literal and figurative meanings must both exist and differ meaningfully.')
    if (!target.explanationStatement.trim() || containsUnsafe([target.expressionText, target.literalReading, target.figurativeMeaning, target.explanationStatement].join(' '))) invalid(issues, target.targetId, 'Targets require a safe, child-readable explanation.')

    if (target.kind === 'metaphor') {
      if (!target.directComparison || !target.comparisonSubject.trim() || !target.comparisonObject.trim() || !target.sharedQuality.trim()) invalid(issues, target.targetId, 'Metaphors require a direct comparison and a context-supported shared quality.')
      if (/\b(like|as)\b/i.test(target.expressionText)) add(issues, 'metaphor_is_simile', target.targetId, 'A primary metaphor target cannot use like or as as its comparison signal.')
    } else if (target.kind === 'personification') {
      if (!target.humanQualityAssigned || !target.nonhumanSubject.trim() || !target.humanActionOrQuality.trim() || !target.intendedMeaning.trim()) invalid(issues, target.targetId, 'Personification requires a nonhuman subject and a genuinely human action or quality.')
      if (/\b(owl|dog|cat|bird|bee|ant|horse|fish|fox|rabbit|squirrel)\b/i.test(target.nonhumanSubject)) add(issues, 'personification_is_normal_behavior', target.targetId, 'Animal subjects require a manual proof that the target is not ordinary behavior.')
    } else if (!target.deliberateExaggeration || !target.exaggeratedStatement.trim() || !target.realisticMeaning.trim() || !['emphasis', 'humor', 'intensity'].includes(target.exaggerationPurpose)) {
      add(issues, 'hyperbole_is_literal_or_unclear', target.targetId, 'Hyperbole requires an obvious deliberate exaggeration and a realistic context-supported meaning.')
    }
  }
}

function validatePackShape(
  pack: ContentPack,
  guides: readonly FigurativeLanguageGuide[],
  targetIds: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  const active = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const guided = active.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = active.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const targets = guides.flatMap((guide) => guide.targets)
  const supports = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const questionCounts = new Map<string, number>()
  const formatCounts = new Map<string, number>()
  const kindCounts = new Map<string, number>()
  for (const question of pack.questions) questionCounts.set(question.questionType, (questionCounts.get(question.questionType) ?? 0) + 1)
  for (const passage of pack.passages) {
    const format = passage.contentKind === 'poem' ? 'poem' : passage.contentKind === 'informational' ? 'informational' : 'literary-prose'
    formatCounts.set(format, (formatCounts.get(format) ?? 0) + 1)
  }
  for (const target of targets) kindCounts.set(target.kind, (kindCounts.get(target.kind) ?? 0) + 1)
  const exact: Array<[number, number, string]> = [
    [active.length, 7, 'active lessons'], [pack.passages.length, 7, 'source texts'], [guides.length, 7, 'guides'], [targetIds.size, 28, 'unique figurative targets'], [pack.questions.length, 41, 'questions'], [supports.length, 28, 'Word Help targets'],
    [guided.filter((lesson) => lesson.difficulty === 0).length, 2, 'difficulty-0 remediation lessons'], [guided.filter((lesson) => lesson.difficulty === 1).length, 2, 'difficulty-1 guided lessons'], [checkpoints.filter((lesson) => lesson.difficulty === 1).length, 3, 'difficulty-1 checkpoints'],
    [formatCounts.get('literary-prose') ?? 0, 3, 'literary prose texts'], [formatCounts.get('poem') ?? 0, 2, 'poems'], [formatCounts.get('informational') ?? 0, 2, 'informational texts'],
    [kindCounts.get('metaphor') ?? 0, 10, 'metaphors'], [kindCounts.get('personification') ?? 0, 9, 'personification targets'], [kindCounts.get('hyperbole') ?? 0, 9, 'hyperboles'],
    [questionCounts.get('multiple_choice') ?? 0, 17, 'multiple-choice questions'], [questionCounts.get('multi_select') ?? 0, 7, 'multiselect questions'], [questionCounts.get('hot_text') ?? 0, 7, 'hot-text questions'], [questionCounts.get('table_match') ?? 0, 7, 'table-match questions'], [questionCounts.get('two_part') ?? 0, 3, 'two-part questions'],
  ]
  for (const [actual, expected, label] of exact) if (actual !== expected) invalid(issues, PACK_ID, `Figurative Fortress requires exactly ${expected} ${label}; found ${actual}.`)
  if (pack.passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) !== 4)) invalid(issues, PACK_ID, 'Every source requires exactly four Word Help targets.')
  if (guided.some((lesson) => !lesson.teachingBlock || lesson.eligiblePurposes.includes('progression') || lesson.eligiblePurposes.includes('verification'))) invalid(issues, PACK_ID, 'Guided lessons require teaching and cannot provide progression or verification evidence.')
  if (checkpoints.some((lesson) => lesson.teachingBlock || lesson.eligiblePurposes.includes('remediation'))) invalid(issues, PACK_ID, 'Checkpoints cannot include teaching or remediation eligibility.')
  for (const lesson of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags ?? []))
    for (const tag of ['figurative-device-identification', 'figurative-meaning', 'literal-vs-nonliteral', 'context-evidence', 'figurative-transfer']) {
      if (!tags.has(tag)) invalid(issues, lesson.lessonId, `Checkpoint coverage is missing ${tag}.`)
    }
    if (new Set(guides.find((guide) => lesson.passageIdentifiers.includes(guide.passageId))?.targets.map((target) => target.kind) ?? []).size < 2) invalid(issues, lesson.lessonId, 'Every checkpoint source requires at least two figurative-language kinds.')
    if (!questions.some((question) => question.questionType === 'table_match') || !questions.some((question) => question.questionType === 'two_part')) invalid(issues, lesson.lessonId, 'Every checkpoint requires a table and a two-part item.')
  }
}

function evidenceResolves(passage: ContentPack['passages'][number], ids: readonly string[]) {
  return ids.length > 0 && ids.every((id) => Boolean(resolvePassageEvidence(passage, id)))
}
function containsUnsafe(value: string) { return /<[^>]+>/.test(value) || /https?:\/\//i.test(value) }
function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'figurative_language_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
