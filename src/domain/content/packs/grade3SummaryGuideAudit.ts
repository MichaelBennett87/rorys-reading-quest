import { resolvePassageEvidence } from '../evidence'
import type { ContentPack, ContentPackAuditIssue, Grade3SummaryGuide, SummaryImportantDetail, SummaryMinorDetail } from './contentPackTypes'

const PACK_ID = 'g3-compare-castle-summary-stronghold'

export function buildGrade3SummaryGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.summaryGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))

  if (guides.length === 0) {
    add(issues, 'missing_grade3_summary_guide', PACK_ID, 'Summary Stronghold requires authored Grade 3 summary guides.')
    return issues
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'summary_guide_count_mismatch', PACK_ID, 'Summary Stronghold requires one guide for each of seven source texts.')
  }

  const seenPassages = new Set<string>()
  for (const guide of guides) {
    const passage = passageById.get(guide.passageId)
    if (!passage || seenPassages.has(guide.passageId)) {
      invalid(issues, guide.passageId, 'Guide passage IDs must resolve uniquely inside the pack.')
      continue
    }
    seenPassages.add(guide.passageId)
    validateGuide(pack, guide, passage, issues)
  }
  for (const passage of pack.passages) {
    if (!seenPassages.has(passage.passageIdentifier)) {
      add(issues, 'missing_grade3_summary_guide', passage.passageIdentifier, 'Every Summary Stronghold source requires exactly one guide.')
    }
  }
  return issues
}

function validateGuide(
  pack: ContentPack,
  guide: Grade3SummaryGuide,
  passage: ContentPack['passages'][number],
  issues: ContentPackAuditIssue[],
) {
  const expectedKind = passage.contentKind === 'informational' ? 'informational' : 'literary'
  if (guide.textKind !== expectedKind) invalid(issues, guide.passageId, 'Guide text kind must match its learner-visible source.')
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== pack.manifest.contentVersion) invalid(issues, guide.passageId, 'Guide status and version must match the DRAFT pack.')
  if (!guide.modelSummary.trim() || !guide.summaryRationale.trim()) invalid(issues, guide.passageId, 'A model summary and summary rationale are required.')
  if (unsafe(guide.modelSummary) || unsafe(guide.summaryRationale)) invalid(issues, guide.passageId, 'Guide text cannot contain raw HTML or remote URLs.')

  const sourceWords = words(passage.passageText)
  const summaryWords = words(guide.modelSummary)
  if (summaryWords.length < 8 || summaryWords.length >= sourceWords.length * 0.8) {
    add(issues, 'summary_distorts_source', guide.passageId, 'The model summary must be meaningfully shorter than the source while remaining complete.')
  }
  if (normalize(guide.modelSummary) === normalize(passage.passageText)) {
    add(issues, 'summary_distorts_source', guide.passageId, 'The model summary cannot copy the source wholesale.')
  }

  const important = guide.textKind === 'literary' ? guide.importantPlotEvents : guide.importantDetails
  const checkpoint = pack.lessons.some((lesson) => lesson.lessonRole === 'CHECKPOINT' && lesson.passageIdentifiers.includes(guide.passageId))
  validateDetailSets(passage, guide, important, guide.minorDetails, checkpoint, issues)

  if (guide.textKind === 'literary') {
    if (!guide.mainCharacterNames.length || !guide.problemOrGoalStatement.trim() || !guide.resolutionStatement.trim()) {
      add(issues, 'literary_summary_missing_plot', guide.passageId, 'Literary guides require characters, a problem or goal, and a resolution.')
    }
    if (important.length < 3) add(issues, 'summary_missing_essential_detail', guide.passageId, 'Literary guides require at least three important plot events.')
    if (words(guide.supportedThemeStatement).length < 4 || !evidenceResolves(passage, guide.themeEvidenceIds)) {
      add(issues, 'literary_summary_theme_unsupported', guide.passageId, 'The literary theme must be a complete thought with resolved evidence.')
    }
    if (normalize(guide.supportedThemeStatement) === normalize(guide.modelSummary)) {
      add(issues, 'summary_distorts_source', guide.passageId, 'A literary summary cannot be only a theme statement.')
    }
  } else {
    if (!guide.topicLabel.trim() || words(guide.centralIdeaStatement).length < 5 || normalize(guide.topicLabel) === normalize(guide.centralIdeaStatement)) {
      add(issues, 'informational_summary_central_idea_invalid', guide.passageId, 'The central idea must be a complete thought distinct from the topic.')
    }
    if (important.length < 3) add(issues, 'summary_missing_essential_detail', guide.passageId, 'Informational guides require at least three relevant details.')
  }
}

function validateDetailSets(
  passage: ContentPack['passages'][number],
  guide: Grade3SummaryGuide,
  important: readonly SummaryImportantDetail[],
  minor: readonly SummaryMinorDetail[],
  checkpoint: boolean,
  issues: ContentPackAuditIssue[],
) {
  if (minor.length < 2) add(issues, 'summary_missing_essential_detail', guide.passageId, 'Each guide requires at least two defensible minor details.')
  if (checkpoint && (important.length < 4 || minor.length < 3)) add(issues, 'summary_missing_essential_detail', guide.passageId, 'Checkpoint guides require at least four important and three minor details.')
  const importantIds = new Set(important.map((detail) => detail.detailId))
  const minorIds = new Set(minor.map((detail) => detail.detailId))
  if (importantIds.size !== important.length || minorIds.size !== minor.length || [...importantIds].some((id) => minorIds.has(id))) {
    add(issues, 'summary_important_minor_overlap', guide.passageId, 'Important and minor detail IDs must be unique and nonoverlapping.')
  }
  for (const detail of important) {
    if (!validImportant(passage, detail)) invalid(issues, detail.detailId, 'Important details require a statement, reason, and resolved source evidence.')
  }
  for (const detail of minor) {
    if (!validMinor(passage, detail)) invalid(issues, detail.detailId, 'Minor details require a statement, omission reason, and resolved source evidence.')
    if (normalize(guide.modelSummary).includes(normalize(detail.statement))) {
      add(issues, 'summary_contains_minor_detail', detail.detailId, 'The model summary must omit declared minor details.')
    }
  }
}

function validImportant(passage: ContentPack['passages'][number], detail: SummaryImportantDetail) {
  return Boolean(detail.detailId.trim() && detail.statement.trim() && detail.importanceReason.trim() && evidenceResolves(passage, detail.evidenceIds) && !unsafe(detail.statement) && !unsafe(detail.importanceReason))
}
function validMinor(passage: ContentPack['passages'][number], detail: SummaryMinorDetail) {
  return Boolean(detail.detailId.trim() && detail.statement.trim() && detail.omissionReason.trim() && evidenceResolves(passage, detail.evidenceIds) && !unsafe(detail.statement) && !unsafe(detail.omissionReason))
}
function evidenceResolves(passage: ContentPack['passages'][number], ids: readonly string[]) { return ids.length > 0 && ids.every((id) => Boolean(resolvePassageEvidence(passage, id))) }
function words(value: string) { return value.trim().split(/\s+/).filter(Boolean) }
function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
function unsafe(value: string) { return /<[^>]+>/.test(value) || /https?:\/\//i.test(value) }
function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'summary_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
