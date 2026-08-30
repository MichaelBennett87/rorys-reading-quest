import { parseScopedEvidenceReference, resolveLessonEvidence } from '../evidence'
import type {
  ContentPack,
  ContentPackAuditIssue,
  Grade3AuthorComparisonGuide,
  PairedTextSet,
  PresentationDifference,
  PresentationSimilarity,
} from './contentPackTypes'

const PACK_ID = 'g3-compare-castle-author-lens-tower'
const EXPECTED_VERSION = 'g3-cg-author-lens-r0.1.0'
const FEATURES = new Set([
  'organization', 'detail-focus', 'examples', 'description', 'evidence-selection', 'event-emphasis',
  'character-action', 'dialogue', 'text-features', 'figurative-language', 'sequence', 'cause-effect', 'comparison',
])

export function buildGrade3AuthorComparisonGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.grade3AuthorComparisonGuides ?? []
  const pairs = pack.pairedTextSets ?? []
  const passagesById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))

  if (guides.length === 0) {
    add(issues, 'missing_author_comparison_guide', PACK_ID, 'Author Lens Tower requires authored Grade 3 author-comparison guides.')
    return issues
  }

  validatePackShape(pack, pairs, guides, issues)
  const pairById = new Map(pairs.map((pair) => [pair.pairId, pair] as const))
  const seenGuidePairs = new Set<string>()
  const seenPassages = new Set<string>()

  for (const pair of pairs) validatePair(pack, pair, passagesById, seenPassages, issues)
  for (const guide of guides) {
    const pair = pairById.get(guide.pairedTextSetId)
    if (!pair || seenGuidePairs.has(guide.pairedTextSetId)) {
      invalid(issues, guide.pairedTextSetId, 'Each guide must resolve to one unique paired-text set in this pack.')
      continue
    }
    seenGuidePairs.add(guide.pairedTextSetId)
    validateGuide(pack, pair, guide, passagesById, issues)
  }
  for (const pair of pairs) {
    if (!seenGuidePairs.has(pair.pairId)) add(issues, 'missing_author_comparison_guide', pair.pairId, 'Every Author Lens Tower pair requires exactly one guide.')
  }

  return issues
}

function validatePackShape(
  pack: ContentPack,
  pairs: readonly PairedTextSet[],
  guides: readonly Grade3AuthorComparisonGuide[],
  issues: ContentPackAuditIssue[],
) {
  const supportCount = pack.passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0)
  const typeCounts = new Map<string, number>()
  for (const question of pack.questions) typeCounts.set(question.questionType, (typeCounts.get(question.questionType) ?? 0) + 1)
  const expectedTypes = new Map([['multiple_choice', 17], ['multi_select', 7], ['hot_text', 7], ['table_match', 7], ['two_part', 3]])
  if (pack.manifest.contentVersion !== EXPECTED_VERSION || pack.manifest.unitId !== 'g3-cg-unit-3' || pack.manifest.gradeBand !== 3) {
    invalid(issues, PACK_ID, 'Pack identity must remain scoped to Grade 3 Compare Castle Unit 3 and the authored version.')
  }
  if (pack.lessons.length !== 7 || pairs.length !== 7 || pack.passages.length !== 14 || guides.length !== 7 || pack.questions.length !== 41 || supportCount !== 28) {
    invalid(issues, PACK_ID, 'Author Lens Tower requires exactly 7 lessons, 7 pairs, 14 texts, 7 guides, 41 questions, and 28 support targets.')
  }
  for (const [type, expected] of expectedTypes) {
    if ((typeCounts.get(type) ?? 0) !== expected) invalid(issues, PACK_ID, `Author Lens Tower requires exactly ${expected} ${type} questions.`)
  }
  const difficultyTwo = pack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'GUIDED_PRACTICE')
  const difficultyThreeGuided = pack.lessons.filter((lesson) => lesson.difficulty === 3 && lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = pack.lessons.filter((lesson) => lesson.difficulty === 3 && lesson.lessonRole === 'CHECKPOINT')
  if (difficultyTwo.length !== 2 || difficultyThreeGuided.length !== 2 || checkpoints.length !== 3) {
    invalid(issues, PACK_ID, 'Lesson roles must be two difficulty-2 power-ups, two difficulty-3 guided lessons, and three difficulty-3 checkpoints.')
  }
}

function validatePair(
  pack: ContentPack,
  pair: PairedTextSet,
  passagesById: ReadonlyMap<string, ContentPack['passages'][number]>,
  seenPassages: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  const [textA, textB] = pair.members
  if (textA.label !== 'Text A' || textB.label !== 'Text B' || pair.formatRelationship !== 'same-format') {
    invalid(issues, pair.pairId, 'Grade 3 pairs must use clear Text A/Text B labels and the same-format relationship.')
  }
  if (textA.passageId === textB.passageId || seenPassages.has(textA.passageId) || seenPassages.has(textB.passageId)) {
    invalid(issues, pair.pairId, 'Each source may belong to only one Author Lens Tower pair.')
  }
  seenPassages.add(textA.passageId)
  seenPassages.add(textB.passageId)
  for (const member of pair.members) {
    const passage = passagesById.get(member.passageId)
    if (!passage || passage.contentVersion !== pack.manifest.contentVersion) invalid(issues, member.passageId, 'Every pair member must resolve to a same-version source in the pack.')
    const expectedFormat = passage?.contentKind === 'informational' ? 'informational' : 'literary-prose'
    if (member.format !== expectedFormat) invalid(issues, member.passageId, 'Pair member format must match the learner-visible source type.')
  }
  if (pair.reviewStatus !== 'DRAFT' || pair.contentVersion !== pack.manifest.contentVersion) invalid(issues, pair.pairId, 'Paired sets must remain DRAFT and match the pack version.')
  const lesson = pack.lessons.find((candidate) => candidate.pairedTextSetId === pair.pairId)
  if (!lesson || lesson.passageIdentifiers.join('|') !== pair.members.map((member) => member.passageId).join('|')) {
    invalid(issues, pair.pairId, 'Each pair must belong to one lesson with the same ordered source IDs.')
  }
}

function validateGuide(
  pack: ContentPack,
  pair: PairedTextSet,
  guide: Grade3AuthorComparisonGuide,
  passagesById: ReadonlyMap<string, ContentPack['passages'][number]>,
  issues: ContentPackAuditIssue[],
) {
  const [textA, textB] = pair.members
  const passageA = passagesById.get(textA.passageId)
  const passageB = passagesById.get(textB.passageId)
  const expectedA = passageA?.contentKind === 'informational' ? 'informational' : 'literary'
  const expectedB = passageB?.contentKind === 'informational' ? 'informational' : 'literary'
  const basisStatement = guide.sharedBasis.kind === 'same-topic' ? guide.sharedBasis.topicStatement : guide.sharedBasis.themeStatement

  if (guide.sharedBasis.kind !== pair.relationshipKind || words(basisStatement).length < 4) {
    add(issues, pair.relationshipKind === 'same-topic' ? 'paired_topic_not_shared' : 'paired_theme_not_shared', pair.pairId, 'The pair needs a complete, meaningful shared topic or theme statement.')
  }
  if (guide.sharedBasis.kind === 'same-topic' && (expectedA !== 'informational' || expectedB !== 'informational')) {
    add(issues, 'paired_topic_not_shared', pair.pairId, 'Same-topic Author Lens pairs must use two informational texts.')
  }
  if (guide.sharedBasis.kind === 'same-theme' && (expectedA !== 'literary' || expectedB !== 'literary')) {
    add(issues, 'paired_theme_not_shared', pair.pairId, 'Same-theme Author Lens pairs must use two literary texts.')
  }
  if (guide.textAKind !== expectedA || guide.textBKind !== expectedB) invalid(issues, pair.pairId, 'Guide source kinds must match the paired learner-visible texts.')
  if (words(guide.textAFocusStatement).length < 4 || words(guide.textBFocusStatement).length < 4) invalid(issues, pair.pairId, 'Both author focus statements must be complete and specific.')
  if (guide.similarities.length < 2 || guide.differences.length < 2) invalid(issues, pair.pairId, 'Each guide requires at least two meaningful similarities and two meaningful differences.')
  if (guide.evidenceFromBothRequired !== true || guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) {
    invalid(issues, pair.pairId, 'Guides must require both-text evidence, remain DRAFT, and match the pack version.')
  }
  if (unsafe(basisStatement) || unsafe(guide.textAFocusStatement) || unsafe(guide.textBFocusStatement) || unsafe(guide.synthesisStatement)) {
    invalid(issues, pair.pairId, 'Guide content cannot contain raw HTML or remote URLs.')
  }
  if (words(guide.synthesisStatement).length < 8 || unsupportedIntent(guide.synthesisStatement)) {
    add(issues, unsupportedIntent(guide.synthesisStatement) ? 'unsupported_author_intent' : 'author_comparison_guide_invalid', pair.pairId, 'The synthesis must compare visible author choices without inferring private intent.')
  }

  const seenPoints = new Set<string>()
  for (const similarity of guide.similarities) {
    if (seenPoints.has(similarity.similarityId)) invalid(issues, similarity.similarityId, 'Comparison point IDs must be unique within a guide.')
    seenPoints.add(similarity.similarityId)
    validateSimilarity(similarity, textA.passageId, textB.passageId, passagesById, issues)
  }
  for (const difference of guide.differences) {
    if (seenPoints.has(difference.differenceId)) invalid(issues, difference.differenceId, 'Comparison point IDs must be unique within a guide.')
    seenPoints.add(difference.differenceId)
    validateDifference(difference, textA.passageId, textB.passageId, passagesById, issues)
  }
}

function validateSimilarity(
  point: PresentationSimilarity,
  passageA: string,
  passageB: string,
  passagesById: ReadonlyMap<string, ContentPack['passages'][number]>,
  issues: ContentPackAuditIssue[],
) {
  if (!point.similarityId.trim() || !FEATURES.has(point.feature) || words(point.statement).length < 5 || words(point.explanation).length < 5) {
    invalid(issues, point.similarityId, 'Similarity points require a valid feature, complete statement, and explanation.')
  }
  if (superficial(point.statement) || superficial(point.explanation)) add(issues, 'superficial_presentation_similarity', point.similarityId, 'A similarity must describe a meaningful author-presentation choice.')
  if (unsupportedIntent(point.statement) || unsupportedIntent(point.explanation)) add(issues, 'unsupported_author_intent', point.similarityId, 'Comparisons cannot infer private author intent.')
  validateEvidence(point.similarityId, point.textAEvidenceIds, passageA, 'a', passagesById, issues)
  validateEvidence(point.similarityId, point.textBEvidenceIds, passageB, 'b', passagesById, issues)
}

function validateDifference(
  point: PresentationDifference,
  passageA: string,
  passageB: string,
  passagesById: ReadonlyMap<string, ContentPack['passages'][number]>,
  issues: ContentPackAuditIssue[],
) {
  if (!point.differenceId.trim() || !FEATURES.has(point.feature) || words(point.textAStatement).length < 4 || words(point.textBStatement).length < 4 || words(point.explanation).length < 7) {
    invalid(issues, point.differenceId, 'Difference points require a valid feature, two specific source statements, and an explanation.')
  }
  if (normalize(point.textAStatement) === normalize(point.textBStatement) || superficial(point.explanation)) add(issues, 'superficial_presentation_difference', point.differenceId, 'A difference must describe more than wording variation.')
  if ([point.textAStatement, point.textBStatement, point.explanation].some(unsupportedIntent)) add(issues, 'unsupported_author_intent', point.differenceId, 'Comparisons cannot infer private author intent.')
  validateEvidence(point.differenceId, point.textAEvidenceIds, passageA, 'a', passagesById, issues)
  validateEvidence(point.differenceId, point.textBEvidenceIds, passageB, 'b', passagesById, issues)
}

function validateEvidence(
  pointId: string,
  references: readonly string[],
  expectedPassageId: string,
  side: 'a' | 'b',
  passagesById: ReadonlyMap<string, ContentPack['passages'][number]>,
  issues: ContentPackAuditIssue[],
) {
  if (references.length === 0) {
    add(issues, side === 'a' ? 'comparison_missing_text_a_evidence' : 'comparison_missing_text_b_evidence', pointId, `Comparison point ${pointId} requires Text ${side.toUpperCase()} evidence.`)
    return
  }
  for (const reference of references) {
    const scoped = parseScopedEvidenceReference(reference)
    const resolved = resolveLessonEvidence(passagesById, expectedPassageId, reference)
    if (!scoped || scoped.passageId !== expectedPassageId || !resolved || resolved.passageId !== expectedPassageId) {
      add(issues, 'cross_text_evidence_ownership_failure', pointId, `Evidence ${reference} must resolve inside Text ${side.toUpperCase()}.`)
    }
  }
}

function superficial(value: string) {
  const text = normalize(value)
  return ['both are texts', 'both have titles', 'both contain sentences', 'both mention nature', 'wording is different'].some((phrase) => text.includes(phrase))
}
function unsupportedIntent(value: string) { return /author (wanted|hoped|tried|intended)|make the reader feel|wanted the reader/i.test(value) }
function unsafe(value: string) { return /<[^>]+>/.test(value) || /https?:\/\//i.test(value) }
function words(value: string) { return value.trim().split(/\s+/).filter(Boolean) }
function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'author_comparison_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
