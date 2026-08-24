import type {
  CharacterDevelopmentEvidenceKind,
  CharacterDevelopmentStageKind,
  ContentPack,
  ContentPackAuditIssue,
} from './contentPackTypes'

const PACK_ID = 'g3-story-scouts-character-arc-camp'
const STAGE_ORDER: readonly CharacterDevelopmentStageKind[] = ['beginning', 'middle', 'end']
const EVIDENCE_KINDS: readonly CharacterDevelopmentEvidenceKind[] = [
  'action', 'dialogue', 'thought', 'feeling', 'choice', 'response-to-event',
]

export function buildCharacterDevelopmentGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []

  const issues: ContentPackAuditIssue[] = []
  const guides = pack.characterDevelopmentGuides ?? []
  const passageIds = new Set(pack.passages.map((passage) => passage.passageIdentifier))
  const evidenceByPassage = new Map(pack.passages.map((passage) => [
    passage.passageIdentifier,
    new Set(passage.sentences?.map((sentence) => sentence.sentenceId) ?? []),
  ] as const))

  if (guides.length === 0) {
    add(issues, 'missing_character_development_guide', PACK_ID, 'Character Arc Camp requires authored character-development guides.')
    return issues
  }
  if (guides.length !== pack.passages.length || guides.length !== 7) {
    add(issues, 'character_development_guide_count_mismatch', PACK_ID, 'Character Arc Camp requires exactly one guide for each of seven passages.')
  }

  const guidePassageIds = new Set<string>()
  const globalStageIds = new Set<string>()
  for (const guide of guides) {
    const evidenceIds = evidenceByPassage.get(guide.passageId) ?? new Set<string>()
    if (!passageIds.has(guide.passageId) || guidePassageIds.has(guide.passageId)) {
      invalid(issues, guide.passageId, 'Guide passage IDs must resolve uniquely inside the pack.')
    }
    guidePassageIds.add(guide.passageId)
    if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) {
      invalid(issues, guide.passageId, 'Guide review status and version must match the DRAFT pack.')
    }
    if (guide.arcs.length < 1 || guide.arcs.length > 2) {
      invalid(issues, guide.passageId, 'Each guide requires one or two character arcs.')
    }
    if (!guide.importantPlotEvidenceIds.length || guide.importantPlotEvidenceIds.some((id) => !evidenceIds.has(id))) {
      invalid(issues, guide.passageId, 'Important plot evidence must resolve in the guide passage.')
    }

    const characterIds = new Set<string>()
    for (const arc of guide.arcs) {
      const label = `${guide.passageId}:${arc.characterId}`
      if (!arc.characterId.trim() || characterIds.has(arc.characterId) || !arc.characterName.trim()) {
        invalid(issues, label, 'Character IDs must be unique in a guide and character names must be nonempty.')
      }
      characterIds.add(arc.characterId)
      if (arc.stages.length !== 3 || arc.stages.some((stage, index) => stage.stage !== STAGE_ORDER[index])) {
        invalid(issues, label, 'Every arc must contain beginning, middle, and end stages in order.')
      }

      const observedKinds = new Set<CharacterDevelopmentEvidenceKind>()
      for (const stage of arc.stages) {
        if (!stage.stageId.trim() || globalStageIds.has(stage.stageId)) {
          invalid(issues, label, 'Stage IDs must be nonempty and unique across the pack.')
        }
        globalStageIds.add(stage.stageId)
        if (!stage.stateStatement.trim() || !stage.plotEventStatement.trim()) {
          invalid(issues, stage.stageId, 'Stage state and plot-event statements must be nonempty.')
        }
        if (!stage.evidenceIds.length || stage.evidenceIds.some((id) => !evidenceIds.has(id))) {
          invalid(issues, stage.stageId, 'Every stage requires evidence from its source passage.')
        }
        if (!stage.evidenceKinds.length || stage.evidenceKinds.some((kind) => !EVIDENCE_KINDS.includes(kind))) {
          invalid(issues, stage.stageId, 'Every stage requires valid evidence-kind metadata.')
        }
        stage.evidenceKinds.forEach((kind) => observedKinds.add(kind))
        validateSafeText(issues, stage.stageId, [stage.stateStatement, stage.plotEventStatement])
      }

      if (!observedKinds.has('action') || (!observedKinds.has('dialogue') && !observedKinds.has('thought'))) {
        invalid(issues, label, 'Every arc requires action evidence plus dialogue or thought evidence.')
      }
      if (pack.lessons.some((lesson) => lesson.passageIdentifiers.includes(guide.passageId) && lesson.lessonRole === 'CHECKPOINT')
        && (!observedKinds.has('action') || !observedKinds.has('dialogue') || !observedKinds.has('thought'))) {
        invalid(issues, label, 'Every checkpoint arc requires action, dialogue, and thought evidence.')
      }
      if (!arc.turningPointEvidenceIds.length || arc.turningPointEvidenceIds.some((id) => !evidenceIds.has(id))) {
        invalid(issues, label, 'Turning-point evidence must resolve in the source passage.')
      }
      if (!arc.plotCauseStatement.trim() || !arc.developmentSummary.trim()) {
        invalid(issues, label, 'Plot-cause and development-summary statements must be nonempty.')
      }
      if (normalize(arc.stages[0]?.stateStatement ?? '') === normalize(arc.stages[2]?.stateStatement ?? '')) {
        invalid(issues, label, 'Beginning and ending states must differ.')
      }
      if (countStageMarkers(arc.developmentSummary) < 2) {
        invalid(issues, label, 'A development summary must connect at least two plot stages rather than name a static trait.')
      }
      validateSafeText(issues, label, [arc.characterName, arc.plotCauseStatement, arc.developmentSummary])
    }
  }

  validatePackShape(pack, guides, issues)

  return issues
}

function validatePackShape(
  pack: ContentPack,
  guides: NonNullable<ContentPack['characterDevelopmentGuides']>,
  issues: ContentPackAuditIssue[],
) {
  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const checkpoints = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const guided = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const supportTargets = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  const arcs = guides.flatMap((guide) => guide.arcs)
  const questionCounts = new Map<string, number>()
  for (const question of pack.questions) {
    questionCounts.set(question.questionType, (questionCounts.get(question.questionType) ?? 0) + 1)
  }

  const exactCounts: Array<[number, number, string]> = [
    [activeLessons.length, 7, 'active lessons'],
    [pack.passages.length, 7, 'passages'],
    [guides.length, 7, 'guides'],
    [arcs.length, 9, 'character arcs'],
    [pack.questions.length, 41, 'questions'],
    [supportTargets.length, 28, 'Word Help targets'],
    [guided.filter((lesson) => lesson.difficulty === 0).length, 2, 'difficulty-0 guided lessons'],
    [guided.filter((lesson) => lesson.difficulty === 1).length, 2, 'difficulty-1 guided lessons'],
    [checkpoints.filter((lesson) => lesson.difficulty === 1).length, 3, 'difficulty-1 checkpoints'],
    [questionCounts.get('multiple_choice') ?? 0, 17, 'multiple-choice questions'],
    [questionCounts.get('multi_select') ?? 0, 7, 'multiselect questions'],
    [questionCounts.get('hot_text') ?? 0, 7, 'hot-text questions'],
    [questionCounts.get('table_match') ?? 0, 7, 'table-match questions'],
    [questionCounts.get('two_part') ?? 0, 3, 'two-part questions'],
    [guides.filter((guide) => guide.arcs.length === 1).length, 5, 'single-arc passages'],
    [guides.filter((guide) => guide.arcs.length === 2).length, 2, 'dual-arc passages'],
  ]
  for (const [actual, expected, label] of exactCounts) {
    if (actual !== expected) invalid(issues, PACK_ID, `Character Arc Camp requires exactly ${expected} ${label}; found ${actual}.`)
  }

  if (pack.passages.some((passage) => (passage.wordSupportTargets?.length ?? 0) !== 4)) {
    invalid(issues, PACK_ID, 'Every Character Arc Camp passage requires exactly four Word Help targets.')
  }
  if (guided.some((lesson) => !lesson.teachingBlock || lesson.eligiblePurposes.includes('progression') || lesson.eligiblePurposes.includes('verification'))) {
    invalid(issues, PACK_ID, 'Guided lessons require teaching and cannot provide progression or verification evidence.')
  }
  if (checkpoints.some((lesson) => lesson.teachingBlock || lesson.eligiblePurposes.includes('remediation'))) {
    invalid(issues, PACK_ID, 'Checkpoints cannot include teaching or remediation eligibility.')
  }

  const requiredCheckpointTags = [
    'beginning-state', 'turning-point', 'ending-state', 'plot-development-link',
    'static-trait-distinction', 'beginning-middle-end-table',
  ]
  for (const lesson of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags))
    if (requiredCheckpointTags.some((tag) => !tags.has(tag))) {
      invalid(issues, lesson.lessonId, 'Every checkpoint must assess beginning, turning point, end, plot-linked change, trait distinction, and a beginning-middle-end table.')
    }
    if (questions.filter((question) => question.questionType === 'two_part').length !== 1) {
      invalid(issues, lesson.lessonId, 'Every checkpoint requires one two-part development-and-evidence question.')
    }
  }

  const forbidden = /theme development|character perspective|narrator point of view|poem form/i
  for (const question of pack.questions) {
    if (question.gradeBand !== 3
      || question.benchmarkReference !== 'ELA.3.R.1.1'
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
      invalid(issues, question.questionIdentifier, 'Character Arc Camp cannot score theme, perspective, narrator, or poetry constructs.')
    }
  }
}

function countStageMarkers(value: string): number {
  const normalized = value.toLowerCase()
  return [/\bat first\b|\bbeginning\b/, /after|later|\bmiddle\b/, /\bby the end\b|\bat the end\b|\bend\b/]
    .filter((pattern) => pattern.test(normalized)).length
}

function validateSafeText(issues: ContentPackAuditIssue[], id: string, values: readonly string[]) {
  if (values.some((value) => /<[^>]+>/.test(value) || /https?:\/\//i.test(value))) {
    invalid(issues, id, 'Character-development guide text cannot contain raw HTML or remote URLs.')
  }
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) {
  add(issues, 'character_development_guide_invalid', itemIdentifier, message)
}

function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) {
  issues.push({ code, itemIdentifier, message })
}
