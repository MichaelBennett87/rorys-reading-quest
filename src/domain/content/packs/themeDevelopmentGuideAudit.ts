import type {
  ContentPack,
  ContentPackAuditIssue,
  ThemeDevelopmentGuide,
  ThemeDevelopmentStageKind,
} from './contentPackTypes'

const PACK_ID = 'g3-story-scouts-theme-development-trail'
const STAGE_ORDER: readonly ThemeDevelopmentStageKind[] = ['beginning', 'middle', 'end']
const DISTRACTOR_KINDS = ['topic', 'summary', 'unsupported-theme', 'moral-command'] as const

export function buildThemeDevelopmentGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []

  const issues: ContentPackAuditIssue[] = []
  const guides = pack.themeDevelopmentGuides ?? []
  const passageIds = new Set(pack.passages.map((passage) => passage.passageIdentifier))
  const evidenceByPassage = new Map(pack.passages.map((passage) => [
    passage.passageIdentifier,
    new Set(passage.sentences?.map((sentence) => sentence.sentenceId) ?? []),
  ] as const))

  if (guides.length === 0) {
    add(issues, 'missing_theme_development_guide', PACK_ID, 'Theme Development Trail requires authored theme-development guides.')
    return issues
  }
  if (guides.length !== pack.passages.length || guides.length !== 7) {
    add(issues, 'theme_development_guide_count_mismatch', PACK_ID, 'Theme Development Trail requires exactly one guide for each of seven passages.')
  }

  const guidePassageIds = new Set<string>()
  const globalStageIds = new Set<string>()
  for (const guide of guides) {
    const evidenceIds = evidenceByPassage.get(guide.passageId) ?? new Set<string>()
    if (!passageIds.has(guide.passageId) || guidePassageIds.has(guide.passageId)) {
      invalid(issues, guide.passageId, 'Guide passage IDs must resolve uniquely inside the pack.')
    }
    guidePassageIds.add(guide.passageId)
    validateGuide(pack, guide, evidenceIds, globalStageIds, issues)
  }

  validatePackShape(pack, guides, issues)
  return issues
}

function validateGuide(
  pack: ContentPack,
  guide: ThemeDevelopmentGuide,
  evidenceIds: Set<string>,
  globalStageIds: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  if (!guide.topicLabel.trim()) invalid(issues, guide.passageId, 'Every guide requires a topic label.')
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) {
    invalid(issues, guide.passageId, 'Guide review status and version must match the DRAFT pack.')
  }

  validateSupportedTheme(guide, issues)
  validateDistractors(guide, issues)

  if (guide.stages.length !== 3 || guide.stages.some((stage, index) => stage.stage !== STAGE_ORDER[index])) {
    invalid(issues, guide.passageId, 'Every guide requires beginning, middle, and end stages in order.')
  }
  for (const stage of guide.stages) {
    if (!stage.stageId.trim() || globalStageIds.has(stage.stageId)) {
      invalid(issues, guide.passageId, 'Stage IDs must be nonempty and unique across the pack.')
    }
    globalStageIds.add(stage.stageId)
    if (!stage.developmentStatement.trim()) {
      invalid(issues, stage.stageId, 'Every stage requires a theme-development statement.')
    }
    if (!stage.evidenceIds.length || stage.evidenceIds.some((id) => !evidenceIds.has(id))) {
      invalid(issues, stage.stageId, 'Every stage requires evidence from its source passage.')
    }
    validateSafeText(issues, stage.stageId, [stage.developmentStatement])
  }

  if (!guide.turningPointEvidenceIds.length || guide.turningPointEvidenceIds.some((id) => !evidenceIds.has(id))) {
    invalid(issues, guide.passageId, 'Turning-point evidence must resolve in the source passage.')
  }
  if (!guide.characterConnectionStatement.trim() || !guide.conflictConnectionStatement.trim()) {
    invalid(issues, guide.passageId, 'Character and conflict connections must be nonempty.')
  }
  if (!guide.developmentSummary.trim() || countStageMarkers(guide.developmentSummary) < 3) {
    invalid(issues, guide.passageId, 'The development summary must explain how the theme grows across beginning, middle, and end.')
  }
  validateSafeText(issues, guide.passageId, [
    guide.topicLabel,
    guide.characterConnectionStatement,
    guide.conflictConnectionStatement,
    guide.developmentSummary,
    guide.supportedTheme.statement,
    guide.supportedTheme.supportReason,
    ...guide.plausibleDistractorThemes.flatMap((candidate) => [candidate.statement, candidate.supportReason]),
  ])
}

function validateSupportedTheme(guide: ThemeDevelopmentGuide, issues: ContentPackAuditIssue[]) {
  const candidate = guide.supportedTheme
  if (!candidate.themeId.trim() || !candidate.statement.trim() || !candidate.supportReason.trim()) {
    invalid(issues, guide.passageId, 'The supported theme requires an ID, statement, and support reason.')
  }
  if (!candidate.supported || candidate.candidateKind !== 'theme') {
    add(issues, 'ambiguous_supported_theme', guide.passageId, 'Exactly one authored candidate must be the supported theme.')
  }
  if (wordCount(candidate.statement) < 6 || normalize(candidate.statement) === normalize(guide.topicLabel)) {
    add(issues, 'theme_is_topic_only', candidate.themeId, 'The supported theme must be a complete thought rather than a topic label.')
  }
  if (/^(in|this) (story|passage)\b/i.test(candidate.statement) || /\bthen\b.*\bfinally\b/i.test(candidate.statement)) {
    add(issues, 'theme_is_summary_only', candidate.themeId, 'The supported theme cannot merely retell the plot.')
  }
  if (isMoralCommand(candidate.statement)) {
    invalid(issues, candidate.themeId, 'The supported theme cannot be a command disguised as a moral.')
  }
}

function validateDistractors(guide: ThemeDevelopmentGuide, issues: ContentPackAuditIssue[]) {
  const ids = new Set<string>([guide.supportedTheme.themeId])
  const statements = new Set<string>([normalize(guide.supportedTheme.statement)])
  if (guide.plausibleDistractorThemes.length < 3) {
    invalid(issues, guide.passageId, 'Each guide requires topic, summary, and plausible unsupported-theme distractors.')
  }
  for (const candidate of guide.plausibleDistractorThemes) {
    if (!candidate.themeId.trim() || ids.has(candidate.themeId) || !candidate.statement.trim() || !candidate.supportReason.trim()) {
      invalid(issues, guide.passageId, 'Distractor candidates require unique IDs, statements, and support reasons.')
    }
    ids.add(candidate.themeId)
    const normalized = normalize(candidate.statement)
    if (statements.has(normalized)) invalid(issues, candidate.themeId, 'Theme candidate statements must be visibly unique.')
    statements.add(normalized)
    if (candidate.supported || !DISTRACTOR_KINDS.includes(candidate.candidateKind as typeof DISTRACTOR_KINDS[number])) {
      add(issues, 'ambiguous_supported_theme', candidate.themeId, 'A distractor cannot be marked as an equally supported theme.')
    }
  }
}

function validatePackShape(
  pack: ContentPack,
  guides: readonly ThemeDevelopmentGuide[],
  issues: ContentPackAuditIssue[],
) {
  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const checkpoints = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const guided = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const supportTargets = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const questionCounts = new Map<string, number>()
  for (const question of pack.questions) {
    questionCounts.set(question.questionType, (questionCounts.get(question.questionType) ?? 0) + 1)
  }

  const exactCounts: Array<[number, number, string]> = [
    [activeLessons.length, 7, 'active lessons'],
    [pack.passages.length, 7, 'passages'],
    [guides.length, 7, 'guides'],
    [pack.questions.length, 41, 'questions'],
    [supportTargets.length, 28, 'Word Help targets'],
    [guided.filter((lesson) => lesson.difficulty === 1).length, 2, 'difficulty-1 remediation lessons'],
    [guided.filter((lesson) => lesson.difficulty === 2).length, 2, 'difficulty-2 guided lessons'],
    [checkpoints.filter((lesson) => lesson.difficulty === 2).length, 3, 'difficulty-2 checkpoints'],
    [questionCounts.get('multiple_choice') ?? 0, 17, 'multiple-choice questions'],
    [questionCounts.get('multi_select') ?? 0, 7, 'multiselect questions'],
    [questionCounts.get('hot_text') ?? 0, 7, 'hot-text questions'],
    [questionCounts.get('table_match') ?? 0, 7, 'table-match questions'],
    [questionCounts.get('two_part') ?? 0, 3, 'two-part questions'],
  ]
  for (const [actual, expected, label] of exactCounts) {
    if (actual !== expected) invalid(issues, PACK_ID, `Theme Development Trail requires exactly ${expected} ${label}; found ${actual}.`)
  }

  if (pack.passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) !== 4)) {
    invalid(issues, PACK_ID, 'Every Theme Development Trail passage requires exactly four Word Help targets.')
  }
  if (guided.some((lesson) => !lesson.teachingBlock || lesson.eligiblePurposes.includes('progression') || lesson.eligiblePurposes.includes('verification'))) {
    invalid(issues, PACK_ID, 'Guided lessons require teaching and cannot provide progression or verification evidence.')
  }
  if (checkpoints.some((lesson) => lesson.teachingBlock || lesson.eligiblePurposes.includes('remediation'))) {
    invalid(issues, PACK_ID, 'Checkpoints cannot include teaching or remediation eligibility.')
  }

  const requiredCheckpointTags = [
    'theme', 'theme-topic-summary-distinction', 'beginning-theme-evidence', 'middle-theme-evidence',
    'ending-theme-evidence', 'theme-development', 'supporting-details', 'plot-theme-connection',
    'beginning-middle-end-table', 'all-three-stage-evidence',
  ]
  for (const lesson of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags))
    if (requiredCheckpointTags.some((tag) => !tags.has(tag))) {
      invalid(issues, lesson.lessonId, 'Every checkpoint must assess theme, distinctions, all plot stages, multi-stage development, and a beginning-middle-end table.')
    }
    if (questions.filter((question) => question.questionType === 'two_part').length !== 1) {
      invalid(issues, lesson.lessonId, 'Every checkpoint requires one two-part theme-and-evidence question.')
    }
  }

  const forbidden = /character perspective|narrator point of view|poem form/i
  for (const question of pack.questions) {
    if (question.gradeBand !== 3
      || question.benchmarkReference !== 'ELA.3.R.1.2'
      || question.skillIdentifier !== 'g3-story-scouts-prose'
      || question.reportingCategory !== 'Reading Prose and Poetry'
      || question.reviewStatus !== 'DRAFT'
      || question.contentVersion !== pack.manifest.contentVersion) {
      invalid(issues, question.questionIdentifier, 'Question grade, benchmark, skill, reporting category, review status, and version must match the pack.')
    }
    if (!question.explanation?.trim() || !question.evidenceReferenceIds?.length) {
      invalid(issues, question.questionIdentifier, 'Every question requires an explanation and evidence references.')
    }
    if (forbidden.test(`${question.prompt} ${question.explanation}`)) {
      invalid(issues, question.questionIdentifier, 'Theme Development Trail cannot score perspective, narrator, or poetry constructs.')
    }
  }
}

function isMoralCommand(value: string): boolean {
  return /^(always|never|you should|people should|everyone should|remember to|do not)\b/i.test(value.trim())
}

function countStageMarkers(value: string): number {
  const normalized = value.toLowerCase()
  return [/beginning|at first/, /\bmiddle\b|turning point|after/, /\bend\b|finally|by the end/]
    .filter((pattern) => pattern.test(normalized)).length
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function validateSafeText(issues: ContentPackAuditIssue[], id: string, values: readonly string[]) {
  if (values.some((value) => /<[^>]+>/.test(value) || /https?:\/\//i.test(value))) {
    invalid(issues, id, 'Theme-development guide text cannot contain raw HTML or remote URLs.')
  }
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) {
  add(issues, 'theme_development_guide_invalid', itemIdentifier, message)
}

function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) {
  issues.push({ code, itemIdentifier, message })
}
