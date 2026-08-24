import type { ContentPack, ContentPackAuditIssue, PoemFormGuide } from './contentPackTypes'

const PACK_ID = 'g3-poetry-planet-poem-form-observatory'
const FORMS = ['free-verse', 'rhymed-verse', 'haiku', 'limerick'] as const
const FEATURE_KINDS = [
  'line-count', 'stanza-structure', 'rhyme', 'rhyme-pattern', 'syllable-pattern',
  'free-lineation', 'nature-observation', 'playful-tone',
] as const

export function buildPoemFormGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []

  const issues: ContentPackAuditIssue[] = []
  const guides = pack.poemFormGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))

  if (guides.length === 0) {
    add(issues, 'missing_poem_form_guide', PACK_ID, 'Poem Form Observatory requires authored poem-form guides.')
    return issues
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'poem_form_guide_count_mismatch', PACK_ID, 'Poem Form Observatory requires one guide for each of seven poems.')
  }

  const seenPoemIds = new Set<string>()
  for (const guide of guides) {
    const passage = passageById.get(guide.poemId)
    if (!passage || seenPoemIds.has(guide.poemId)) {
      invalid(issues, guide.poemId, 'Guide poem IDs must resolve uniquely inside the pack.')
      continue
    }
    seenPoemIds.add(guide.poemId)
    validateGuide(pack, guide, passage, issues)
  }

  for (const passage of pack.passages) {
    if (!seenPoemIds.has(passage.passageIdentifier)) {
      add(issues, 'missing_poem_form_guide', passage.passageIdentifier, 'Every poem requires exactly one poem-form guide.')
    }
  }
  validatePackShape(pack, guides, issues)
  return issues
}

function validateGuide(
  pack: ContentPack,
  guide: PoemFormGuide,
  passage: ContentPack['passages'][number],
  issues: ContentPackAuditIssue[],
) {
  const structure = passage.poemStructure
  const lines = structure?.lines ?? []
  const lineById = new Map(lines.map((line) => [line.lineId, line] as const))
  if (passage.contentKind !== 'poem' || !structure) invalid(issues, guide.poemId, 'Guides must resolve to structured poem passages.')
  if (!FORMS.includes(guide.form)) invalid(issues, guide.poemId, 'Guide form must be one of the four Grade 3 target forms.')
  if (guide.lineCount !== lines.length || guide.stanzaCount !== (structure?.stanzas.length ?? 0)) {
    invalid(issues, guide.poemId, 'Authored line and stanza counts must match the poem structure.')
  }
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) {
    invalid(issues, guide.poemId, 'Guide review status and version must match the DRAFT pack.')
  }
  if (!guide.formExplanation.trim() || !guide.comparisonNotes.trim() || guide.definingFeatures.length < 2) {
    invalid(issues, guide.poemId, 'Every guide needs multiple defining clues, an explanation, and comparison notes.')
  }
  for (const feature of guide.definingFeatures) {
    if (!feature.featureId.trim() || !FEATURE_KINDS.includes(feature.kind) || !feature.statement.trim()) {
      invalid(issues, guide.poemId, 'Defining features require an ID, valid kind, and statement.')
    }
    if (feature.evidenceLineIds.length === 0 || feature.evidenceLineIds.some((id) => !lineById.has(id))) {
      invalid(issues, feature.featureId, 'Defining-feature evidence must resolve to authored poem lines.')
    }
  }
  validateSafeText(issues, guide)

  if (guide.form === 'free-verse') {
    if (!guide.definingFeatures.some((feature) => feature.kind === 'free-lineation')) {
      invalid(issues, guide.poemId, 'Free verse requires an intentional free-lineation clue.')
    }
    if (guide.rhymeScheme || /free verse never rhymes/i.test(`${guide.formExplanation} ${guide.comparisonNotes}`)) {
      invalid(issues, guide.poemId, 'Free verse cannot be defined by a fixed scheme or the false rule that it never rhymes.')
    }
  }
  if (guide.form === 'rhymed-verse') {
    validateRhymeMetadata(guide, lines, issues)
    if (/all rhymed verse (uses|has) aabb/i.test(`${guide.formExplanation} ${guide.comparisonNotes}`)) {
      invalid(issues, guide.poemId, 'Rhymed verse cannot be limited to AABB.')
    }
  }
  if (guide.form === 'haiku') {
    if (guide.lineCount !== 3 || guide.classroomSyllablePattern?.join('-') !== '5-7-5') {
      invalid(issues, guide.poemId, 'This classroom haiku requires three lines and the audited 5-7-5 example pattern.')
    }
    const qualification = `${guide.formExplanation} ${guide.comparisonNotes}`
    if (!/classroom/i.test(qualification) || !/not (a )?universal/i.test(qualification)) {
      invalid(issues, guide.poemId, 'The classroom 5-7-5 example must be qualified as non-universal.')
    }
  }
  if (guide.form === 'limerick') {
    if (guide.lineCount !== 5 || guide.rhymeScheme !== 'AABBA') {
      invalid(issues, guide.poemId, 'Limericks require exactly five lines and the audited AABBA rhyme relationship.')
    }
    validateRhymeMetadata(guide, lines, issues)
  }
}

function validateRhymeMetadata(
  guide: PoemFormGuide,
  lines: NonNullable<ContentPack['passages'][number]['poemStructure']>['lines'],
  issues: ContentPackAuditIssue[],
) {
  const rhymeLines = guide.rhymeLines ?? []
  if (!guide.rhymeScheme || rhymeLines.length !== lines.length || rhymeLines.map((line) => line.rhymeLabel).join('') !== guide.rhymeScheme) {
    invalid(issues, guide.poemId, 'Rhyme metadata must cover every line and reconstruct the stated scheme.')
    return
  }
  const lineById = new Map(lines.map((line) => [line.lineId, line] as const))
  const keyToLabel = new Map<string, string>()
  const labelToKey = new Map<string, string>()
  for (const rhymeLine of rhymeLines) {
    const line = lineById.get(rhymeLine.lineId)
    if (!line || extractEndWord(line.text).toLowerCase() !== rhymeLine.endWord.toLowerCase() || !/^[A-Z]$/.test(rhymeLine.rhymeLabel)) {
      invalid(issues, guide.poemId, 'Rhyme line IDs, end words, and uppercase labels must match the poem.')
      continue
    }
    if (keyToLabel.has(rhymeLine.rhymeKey) && keyToLabel.get(rhymeLine.rhymeKey) !== rhymeLine.rhymeLabel) {
      invalid(issues, guide.poemId, 'One rhyme family must reuse one label.')
    }
    if (labelToKey.has(rhymeLine.rhymeLabel) && labelToKey.get(rhymeLine.rhymeLabel) !== rhymeLine.rhymeKey) {
      invalid(issues, guide.poemId, 'Different rhyme families cannot share a label.')
    }
    keyToLabel.set(rhymeLine.rhymeKey, rhymeLine.rhymeLabel)
    labelToKey.set(rhymeLine.rhymeLabel, rhymeLine.rhymeKey)
  }
}

function validatePackShape(pack: ContentPack, guides: readonly PoemFormGuide[], issues: ContentPackAuditIssue[]) {
  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const guided = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const supportTargets = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const counts = new Map<string, number>()
  for (const question of pack.questions) counts.set(question.questionType, (counts.get(question.questionType) ?? 0) + 1)
  const exact: Array<[number, number, string]> = [
    [activeLessons.length, 7, 'active lessons'], [pack.passages.length, 7, 'poems'], [guides.length, 7, 'guides'],
    [pack.questions.length, 41, 'questions'], [supportTargets.length, 28, 'Word Help targets'],
    [guided.filter((lesson) => lesson.difficulty === 0).length, 2, 'difficulty-0 remediation lessons'],
    [guided.filter((lesson) => lesson.difficulty === 1).length, 2, 'difficulty-1 guided lessons'],
    [checkpoints.filter((lesson) => lesson.difficulty === 1).length, 3, 'difficulty-1 checkpoints'],
    [counts.get('multiple_choice') ?? 0, 17, 'multiple-choice questions'],
    [counts.get('multi_select') ?? 0, 7, 'multiselect questions'],
    [counts.get('hot_text') ?? 0, 7, 'hot-text questions'],
    [counts.get('table_match') ?? 0, 7, 'table-match questions'],
    [counts.get('two_part') ?? 0, 3, 'two-part questions'],
  ]
  for (const [actual, expected, label] of exact) {
    if (actual !== expected) invalid(issues, PACK_ID, `Poem Form Observatory requires exactly ${expected} ${label}; found ${actual}.`)
  }
  const formCounts = new Map<string, number>()
  for (const guide of guides) formCounts.set(guide.form, (formCounts.get(guide.form) ?? 0) + 1)
  if (formCounts.get('free-verse') !== 2 || formCounts.get('rhymed-verse') !== 2 || formCounts.get('haiku') !== 1 || formCounts.get('limerick') !== 2) {
    invalid(issues, PACK_ID, 'The pack requires two free verse, two rhymed verse, one haiku, and two limericks.')
  }
  if (pack.passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) !== 4)) {
    invalid(issues, PACK_ID, 'Every poem requires exactly four Word Help targets.')
  }
  if (guided.some((lesson) => !lesson.teachingBlock || lesson.eligiblePurposes.includes('progression') || lesson.eligiblePurposes.includes('verification'))) {
    invalid(issues, PACK_ID, 'Guided lessons require teaching and cannot provide progression or verification evidence.')
  }
  if (checkpoints.some((lesson) => lesson.teachingBlock || lesson.eligiblePurposes.includes('remediation'))) {
    invalid(issues, PACK_ID, 'Checkpoints cannot include teaching or remediation eligibility.')
  }
  for (const lesson of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags ?? []))
    if (!tags.has('structural-evidence') || !tags.has('poem-form-transfer') || !tags.has('poem-form-table') || !questions.some((question) => question.questionType === 'two_part')) {
      invalid(issues, lesson.lessonId, 'Every checkpoint requires structural evidence, transfer, a table, and a two-part evidence item.')
    }
  }
  const forbidden = /figurative-language|metaphor|personification|hyperbole|poetry-theme|poetry-composition/
  if (pack.questions.some((question) => (question.tags ?? []).some((tag) => forbidden.test(tag)))) {
    invalid(issues, PACK_ID, 'Poem Form Observatory cannot drift into later poetry constructs.')
  }
}

function validateSafeText(issues: ContentPackAuditIssue[], guide: PoemFormGuide) {
  const values = [
    guide.formExplanation, guide.comparisonNotes, ...guide.nonDefiningFeatures,
    ...guide.definingFeatures.map((feature) => feature.statement),
  ]
  if (values.some((value) => /<[^>]+>/.test(value) || /https?:\/\//i.test(value))) {
    invalid(issues, guide.poemId, 'Poem-form guide text cannot contain raw HTML or remote URLs.')
  }
}

function extractEndWord(value: string): string {
  return value.trim().match(/[A-Za-z']+/g)?.at(-1) ?? ''
}

function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) {
  add(issues, 'poem_form_guide_invalid', itemIdentifier, message)
}

function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) {
  issues.push({ code, itemIdentifier, message })
}
