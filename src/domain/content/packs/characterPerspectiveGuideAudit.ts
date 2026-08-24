import type {
  CharacterPerspectiveGuide,
  ContentPack,
  ContentPackAuditIssue,
  PerspectiveEvidenceKind,
} from './contentPackTypes'

const PACK_ID = 'g3-story-scouts-perspective-portal'
const EVIDENCE_KINDS: readonly PerspectiveEvidenceKind[] = [
  'dialogue', 'thought', 'action', 'feeling', 'noticing', 'choice',
]
const RELATIONSHIPS = ['different', 'partly-similar', 'similar'] as const

export function buildCharacterPerspectiveGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []

  const issues: ContentPackAuditIssue[] = []
  const guides = pack.characterPerspectiveGuides ?? []
  const passageIds = new Set(pack.passages.map((passage) => passage.passageIdentifier))
  const evidenceByPassage = new Map(pack.passages.map((passage) => [
    passage.passageIdentifier,
    new Set(passage.sentences?.map((sentence) => sentence.sentenceId) ?? []),
  ] as const))
  const checkpointPassageIds = new Set(pack.lessons
    .filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
    .flatMap((lesson) => lesson.passageIdentifiers))

  if (guides.length === 0) {
    add(issues, 'missing_character_perspective_guide', PACK_ID, 'Perspective Portal requires authored character-perspective guides.')
    return issues
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'character_perspective_guide_count_mismatch', PACK_ID, 'Perspective Portal requires exactly one guide for each of seven passages.')
  }

  const seenPassageIds = new Set<string>()
  for (const guide of guides) {
    const evidenceIds = evidenceByPassage.get(guide.passageId) ?? new Set<string>()
    if (!passageIds.has(guide.passageId) || seenPassageIds.has(guide.passageId)) {
      invalid(issues, guide.passageId, 'Guide passage IDs must resolve uniquely inside the pack.')
    }
    seenPassageIds.add(guide.passageId)
    validateGuide(pack, guide, evidenceIds, checkpointPassageIds.has(guide.passageId), issues)
  }

  validatePackShape(pack, guides, issues)
  return issues
}

function validateGuide(
  pack: ContentPack,
  guide: CharacterPerspectiveGuide,
  evidenceIds: Set<string>,
  checkpoint: boolean,
  issues: ContentPackAuditIssue[],
) {
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) {
    invalid(issues, guide.passageId, 'Guide review status and version must match the DRAFT pack.')
  }
  if (guide.characters.length < 2) invalid(issues, guide.passageId, 'Every guide requires at least two tracked characters.')

  const characters = new Map<string, CharacterPerspectiveGuide['characters'][number]>()
  for (const character of guide.characters) {
    if (!character.characterId.trim() || characters.has(character.characterId) || !character.characterName.trim()) {
      invalid(issues, guide.passageId, 'Character IDs must be unique and character names must be nonempty.')
    }
    characters.set(character.characterId, character)
    if (!character.situationId.trim() || wordCount(character.perspectiveStatement) < 6 || !character.motivationStatement.trim()) {
      invalid(issues, character.characterId, 'A character perspective requires a shared situation, complete viewpoint, and motivation.')
    }
    if (character.evidenceIds.length < 2 || character.evidenceIds.some((id) => !evidenceIds.has(id))) {
      invalid(issues, character.characterId, 'Every character requires at least two resolved evidence references.')
    }
    if (new Set(character.evidenceKinds).size < 2 || character.evidenceKinds.some((kind) => !EVIDENCE_KINDS.includes(kind))) {
      invalid(issues, character.characterId, 'Every character requires at least two valid evidence kinds.')
    }
    if (checkpoint && (!character.evidenceKinds.includes('dialogue') || (!character.evidenceKinds.includes('action') && !character.evidenceKinds.includes('thought')))) {
      invalid(issues, character.characterId, 'Checkpoint characters require dialogue plus action or thought evidence.')
    }
    if (isNarratorOrAuthorView(character.perspectiveStatement) || isFeelingOrTraitOnly(character.characterName, character.perspectiveStatement)) {
      invalid(issues, character.characterId, 'Character perspective cannot be narrator point of view, author perspective, a feeling alone, or a trait alone.')
    }
    validateSafeText(issues, character.characterId, [character.characterName, character.situationId, character.perspectiveStatement, character.motivationStatement])
  }

  if (guide.comparisons.length === 0) invalid(issues, guide.passageId, 'Every guide requires a character-perspective comparison.')
  const comparisonIds = new Set<string>()
  for (const comparison of guide.comparisons) {
    const characterA = characters.get(comparison.characterAId)
    const characterB = characters.get(comparison.characterBId)
    if (!comparison.comparisonId.trim() || comparisonIds.has(comparison.comparisonId) || !characterA || !characterB || characterA === characterB) {
      invalid(issues, guide.passageId, 'Comparison IDs and both distinct character references must resolve.')
    }
    comparisonIds.add(comparison.comparisonId)
    if (!RELATIONSHIPS.includes(comparison.relationship) || !comparison.situationId.trim() || wordCount(comparison.comparisonStatement) < 6) {
      invalid(issues, comparison.comparisonId, 'A comparison requires a valid relationship, shared situation, and complete statement.')
    }
    if (characterA && comparison.situationId !== characterA.situationId || characterB && comparison.situationId !== characterB.situationId) {
      invalid(issues, comparison.comparisonId, 'Comparison and character records must reference the same shared situation.')
    }
    if (!resolves(comparison.characterAEvidenceIds, evidenceIds) || !resolves(comparison.characterBEvidenceIds, evidenceIds)) {
      invalid(issues, comparison.comparisonId, 'Comparison evidence must resolve for both characters.')
    }
    validateSafeText(issues, comparison.comparisonId, [comparison.situationId, comparison.comparisonStatement])
  }

  for (const change of guide.perspectiveChanges) {
    if (!characters.has(change.characterId) || normalize(change.earlierPerspectiveStatement) === normalize(change.laterPerspectiveStatement)) {
      invalid(issues, change.characterId, 'Perspective changes require a tracked character and meaningfully different earlier and later viewpoints.')
    }
    if (!resolves(change.changeEvidenceIds, evidenceIds) || !change.causeStatement.trim()) {
      invalid(issues, change.characterId, 'Perspective changes require resolved evidence and a cause statement.')
    }
    validateSafeText(issues, change.characterId, [change.earlierPerspectiveStatement, change.laterPerspectiveStatement, change.causeStatement])
  }

  if (!resolves(guide.importantEvidenceIds, evidenceIds)) {
    invalid(issues, guide.passageId, 'Important perspective evidence must resolve in the source passage.')
  }
}

function validatePackShape(pack: ContentPack, guides: readonly CharacterPerspectiveGuide[], issues: ContentPackAuditIssue[]) {
  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const guided = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const supportTargets = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const questionCounts = new Map<string, number>()
  for (const question of pack.questions) questionCounts.set(question.questionType, (questionCounts.get(question.questionType) ?? 0) + 1)
  const exactCounts: Array<[number, number, string]> = [
    [activeLessons.length, 7, 'active lessons'], [pack.passages.length, 7, 'passages'], [guides.length, 7, 'guides'],
    [pack.questions.length, 41, 'questions'], [supportTargets.length, 28, 'Word Help targets'],
    [guided.filter((lesson) => lesson.difficulty === 2).length, 2, 'difficulty-2 remediation lessons'],
    [guided.filter((lesson) => lesson.difficulty === 3).length, 2, 'difficulty-3 guided lessons'],
    [checkpoints.filter((lesson) => lesson.difficulty === 3).length, 3, 'difficulty-3 checkpoints'],
    [questionCounts.get('multiple_choice') ?? 0, 17, 'multiple-choice questions'],
    [questionCounts.get('multi_select') ?? 0, 7, 'multiselect questions'],
    [questionCounts.get('hot_text') ?? 0, 7, 'hot-text questions'],
    [questionCounts.get('table_match') ?? 0, 7, 'table-match questions'],
    [questionCounts.get('two_part') ?? 0, 3, 'two-part questions'],
  ]
  for (const [actual, expected, label] of exactCounts) {
    if (actual !== expected) invalid(issues, PACK_ID, `Perspective Portal requires exactly ${expected} ${label}; found ${actual}.`)
  }
  if (pack.passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) !== 4)) {
    invalid(issues, PACK_ID, 'Every Perspective Portal passage requires exactly four Word Help targets.')
  }
  if (guided.some((lesson) => !lesson.teachingBlock || lesson.eligiblePurposes.includes('progression') || lesson.eligiblePurposes.includes('verification'))) {
    invalid(issues, PACK_ID, 'Guided lessons require teaching and cannot provide progression or verification evidence.')
  }
  if (checkpoints.some((lesson) => lesson.teachingBlock || lesson.eligiblePurposes.includes('remediation'))) {
    invalid(issues, PACK_ID, 'Checkpoints cannot include teaching or remediation eligibility.')
  }

  const requiredCheckpointTags = [
    'character-a-perspective', 'character-b-perspective', 'perspective-evidence-a', 'perspective-evidence-b',
    'perspective-comparison', 'similarity-or-difference', 'evidence-from-both', 'character-perspective-table',
    'perspective-boundary',
  ]
  for (const lesson of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags))
    if (requiredCheckpointTags.some((tag) => !tags.has(tag))) {
      invalid(issues, lesson.lessonId, 'Every checkpoint must assess both perspectives, both evidence sets, comparison, boundaries, and a perspective table.')
    }
    if (questions.filter((question) => question.questionType === 'two_part').length !== 1) {
      invalid(issues, lesson.lessonId, 'Every checkpoint requires one two-part perspective-and-evidence question.')
    }
  }

  const relationships = guides.flatMap((guide) => guide.comparisons.map((comparison) => comparison.relationship))
  if (relationships.filter((value) => value === 'different').length < 4
    || relationships.filter((value) => value === 'partly-similar').length < 2
    || relationships.filter((value) => value === 'similar').length < 1) {
    invalid(issues, PACK_ID, 'The pack requires at least four different, two partly-similar, and one similar comparison.')
  }
  if (guides.reduce((sum, guide) => sum + guide.perspectiveChanges.length, 0) < 3) {
    invalid(issues, PACK_ID, 'The pack requires at least three supported perspective-change records.')
  }
}

function resolves(ids: readonly string[], available: Set<string>): boolean {
  return ids.length > 0 && ids.every((id) => available.has(id))
}

function isNarratorOrAuthorView(value: string): boolean {
  return /\b(first|second|third)[ -]person narrator\b|\bnarrator (tells|uses|speaks)\b|\bauthor (believes|thinks|feels|argues)\b/i.test(value)
}

function isFeelingOrTraitOnly(characterName: string, value: string): boolean {
  const normalized = normalize(value)
  const name = normalize(characterName)
  return new RegExp(`^${escapeRegExp(name)} (is|feels) [a-z]+$`).test(normalized)
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function validateSafeText(issues: ContentPackAuditIssue[], id: string, values: readonly string[]) {
  if (values.some((value) => /<[^>]+>/.test(value) || /https?:\/\//i.test(value))) {
    invalid(issues, id, 'Character-perspective guide text cannot contain raw HTML or remote URLs.')
  }
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) {
  add(issues, 'character_perspective_guide_invalid', itemIdentifier, message)
}

function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) {
  issues.push({ code, itemIdentifier, message })
}
