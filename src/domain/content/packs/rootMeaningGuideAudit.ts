import { resolvePassageEvidence } from '../evidence'
import type {
  ContentPack,
  ContentPackAuditIssue,
  MeaningPartKind,
  MeaningPartOrigin,
  RootMeaningGuide,
  RootMeaningPrimaryFamily,
  RootMeaningTarget,
} from './contentPackTypes'

const PACK_ID = 'g3-context-cavern-root-meaning-vault'
const VERSION = 'g3-cc-root-meaning-r0.1.0'
const BENCHMARK = 'ELA.3.V.1.2'
const EXPECTED_PATTERNS = new Set([
  'greek-roots',
  'latin-roots',
  'base-words',
  'affixes',
  'unfamiliar-word-meaning',
])

interface ExpectedPart {
  surface: string
  kind: MeaningPartKind
  origin: MeaningPartOrigin
  meaning: string
  contributes: boolean
}

interface ExpectedTarget {
  family: RootMeaningPrimaryFamily
  parts: ExpectedPart[]
}

const part = (
  surface: string,
  kind: MeaningPartKind,
  origin: MeaningPartOrigin,
  meaning: string,
  contributes = true,
): ExpectedPart => ({ surface, kind, origin, meaning, contributes })

const EXPECTED_TARGETS = new Map<string, ExpectedTarget>([
  ['thermometer', { family: 'greek-root', parts: [part('therm', 'root', 'Greek', 'heat'), part('o', 'connector', 'Greek', 'joins the roots', false), part('meter', 'root', 'Greek', 'measure')] }],
  ['thermal', { family: 'greek-root', parts: [part('therm', 'root', 'Greek', 'heat'), part('al', 'suffix', 'Latin', 'related to')] }],
  ['polygon', { family: 'greek-root', parts: [part('poly', 'root', 'Greek', 'many'), part('gon', 'root', 'Greek', 'angle')] }],
  ['monorail', { family: 'greek-root', parts: [part('mono', 'root', 'Greek', 'one'), part('rail', 'base', 'English', 'rail')] }],
  ['astronaut', { family: 'greek-root', parts: [part('astro', 'root', 'Greek', 'star'), part('naut', 'root', 'Greek', 'traveler or sailor')] }],
  ['biology', { family: 'greek-root', parts: [part('bio', 'root', 'Greek', 'life'), part('logy', 'root', 'Greek', 'study')] }],
  ['telegram', { family: 'greek-root', parts: [part('tele', 'root', 'Greek', 'far'), part('gram', 'root', 'Greek', 'written message')] }],
  ['portable', { family: 'latin-root', parts: [part('port', 'root', 'Latin', 'carry'), part('able', 'suffix', 'Latin', 'can be')] }],
  ['import', { family: 'latin-root', parts: [part('im', 'prefix', 'Latin', 'into'), part('port', 'root', 'Latin', 'carry')] }],
  ['predict', { family: 'latin-root', parts: [part('pre', 'prefix', 'Latin', 'before'), part('dict', 'root', 'Latin', 'say')] }],
  ['visible', { family: 'latin-root', parts: [part('vis', 'root', 'Latin', 'see'), part('ible', 'suffix', 'Latin', 'can be')] }],
  ['audible', { family: 'latin-root', parts: [part('aud', 'root', 'Latin', 'hear'), part('ible', 'suffix', 'Latin', 'can be')] }],
  ['inspect', { family: 'latin-root', parts: [part('in', 'prefix', 'Latin', 'into'), part('spect', 'root', 'Latin', 'look')] }],
  ['aqueduct', { family: 'latin-root', parts: [part('aqua', 'root', 'Latin', 'water'), part('duct', 'root', 'Latin', 'lead or carry')] }],
  ['preview', { family: 'english-prefix-base', parts: [part('pre', 'prefix', 'Latin', 'before'), part('view', 'base', 'English', 'look at')] }],
  ['reread', { family: 'english-prefix-base', parts: [part('re', 'prefix', 'Latin', 'again'), part('read', 'base', 'English', 'read')] }],
  ['miscount', { family: 'english-prefix-base', parts: [part('mis', 'prefix', 'English', 'wrongly'), part('count', 'base', 'English', 'count')] }],
  ['unclear', { family: 'english-prefix-base', parts: [part('un', 'prefix', 'English', 'not'), part('clear', 'base', 'English', 'easy to understand')] }],
  ['preheat', { family: 'english-prefix-base', parts: [part('pre', 'prefix', 'Latin', 'before'), part('heat', 'base', 'English', 'make hot')] }],
  ['disconnect', { family: 'english-prefix-base', parts: [part('dis', 'prefix', 'Latin', 'apart'), part('connect', 'base', 'English', 'join')] }],
  ['nonfiction', { family: 'english-prefix-base', parts: [part('non', 'prefix', 'Latin', 'not'), part('fiction', 'base', 'English', 'made-up writing')] }],
  ['hopeful', { family: 'english-base-suffix', parts: [part('hope', 'base', 'English', 'hope'), part('ful', 'suffix', 'English', 'full of or having')] }],
  ['careless', { family: 'english-base-suffix', parts: [part('care', 'base', 'English', 'care'), part('less', 'suffix', 'English', 'without')] }],
  ['washable', { family: 'english-base-suffix', parts: [part('wash', 'base', 'English', 'clean with water'), part('able', 'suffix', 'Latin', 'can be')] }],
  ['kindness', { family: 'english-base-suffix', parts: [part('kind', 'base', 'English', 'caring'), part('ness', 'suffix', 'English', 'state or quality')] }],
  ['agreement', { family: 'english-base-suffix', parts: [part('agree', 'base', 'English', 'share the same view'), part('ment', 'suffix', 'Latin', 'state, result, or action')] }],
  ['refillable', { family: 'english-base-suffix', parts: [part('refill', 'base', 'English', 'fill again'), part('able', 'suffix', 'Latin', 'can be')] }],
  ['readable', { family: 'english-base-suffix', parts: [part('read', 'base', 'English', 'read'), part('able', 'suffix', 'Latin', 'can be')] }],
])

export function buildRootMeaningGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.rootMeaningGuides ?? []
  if (guides.length === 0) {
    add(issues, 'missing_root_meaning_guide', PACK_ID, 'Root Meaning Vault requires authored root-meaning guides.')
    return issues
  }

  validatePackShape(pack, guides, issues)
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const seenPassages = new Set<string>()
  const seenTargetIds = new Set<string>()
  const seenWords = new Set<string>()

  for (const guide of guides) {
    const passage = passageById.get(guide.passageId)
    if (!passage || seenPassages.has(guide.passageId)) {
      add(issues, 'missing_root_meaning_guide', guide.passageId, 'Each root-meaning guide must resolve to one unique passage in this pack.')
      continue
    }
    seenPassages.add(guide.passageId)
    validateGuide(pack, guide, passage, seenTargetIds, seenWords, issues)
  }

  for (const passage of pack.passages) {
    if (!seenPassages.has(passage.passageIdentifier)) {
      add(issues, 'missing_root_meaning_guide', passage.passageIdentifier, 'Every Root Meaning Vault passage requires exactly one guide.')
    }
  }
  if (seenWords.size !== 28 || [...EXPECTED_TARGETS.keys()].some((word) => !seenWords.has(word))) {
    invalid(issues, PACK_ID, 'The pack must use the exact 28-word Root Meaning Vault inventory once each.')
  }
  const familyCounts = new Map<RootMeaningPrimaryFamily, number>()
  for (const guide of guides) for (const target of guide.targets) familyCounts.set(target.primaryFamily, (familyCounts.get(target.primaryFamily) ?? 0) + 1)
  for (const family of ['greek-root', 'latin-root', 'english-prefix-base', 'english-base-suffix'] as const) {
    if ((familyCounts.get(family) ?? 0) !== 7) invalid(issues, PACK_ID, `The pack requires exactly seven ${family} targets.`)
  }
  return issues
}

function validatePackShape(pack: ContentPack, guides: readonly RootMeaningGuide[], issues: ContentPackAuditIssue[]) {
  const supportCount = pack.passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0)
  const typeCounts = new Map<string, number>()
  for (const question of pack.questions) typeCounts.set(question.questionType, (typeCounts.get(question.questionType) ?? 0) + 1)
  const expectedTypes = new Map([['multiple_choice', 17], ['multi_select', 7], ['hot_text', 7], ['table_match', 7], ['two_part', 3]])
  const identityIsValid = pack.manifest.gradeBand === 3
    && pack.manifest.worldId === 'context-cavern'
    && pack.manifest.unitId === 'g3-cc-unit-2'
    && pack.manifest.primarySkillId === 'g3-context-cavern-vocabulary'
    && pack.manifest.contentVersion === VERSION
    && pack.manifest.coverageKind === 'benchmark'
    && pack.manifest.benchmarkReferences.includes(BENCHMARK)
  if (!identityIsValid) invalid(issues, PACK_ID, 'Pack identity must remain Grade 3 Context Cavern Unit 2 benchmark content for ELA.3.V.1.2.')
  if (pack.manifest.coveredPatterns.length !== EXPECTED_PATTERNS.size || pack.manifest.coveredPatterns.some((pattern) => !EXPECTED_PATTERNS.has(pattern))) {
    add(issues, 'root_meaning_scope_drift', PACK_ID, 'The pack must cover only the five bounded ELA.3.V.1.2 patterns.')
  }
  if (pack.lessons.length !== 7 || pack.passages.length !== 7 || guides.length !== 7 || pack.questions.length !== 41 || supportCount !== 28) {
    invalid(issues, PACK_ID, 'The pack requires exactly 7 lessons, 7 passages, 7 guides, 41 questions, and 28 support targets.')
  }
  for (const [type, expected] of expectedTypes) if ((typeCounts.get(type) ?? 0) !== expected) invalid(issues, PACK_ID, `The pack requires exactly ${expected} ${type} questions.`)
  const remediation = pack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')
  const guided = pack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = pack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'CHECKPOINT')
  if (remediation.length !== 2 || guided.length !== 2 || checkpoints.length !== 3) invalid(issues, PACK_ID, 'Lesson roles must be two difficulty-1 power-ups, two difficulty-2 guided lessons, and three difficulty-2 checkpoints.')
  const informational = pack.passages.filter((passage) => passage.contentKind === 'informational').length
  const literary = pack.passages.filter((passage) => passage.contentKind === 'prose').length
  if (informational !== 4 || literary !== 3) invalid(issues, PACK_ID, 'The pack requires four informational texts and three literary prose texts.')
}

function validateGuide(
  pack: ContentPack,
  guide: RootMeaningGuide,
  passage: ContentPack['passages'][number],
  seenTargetIds: Set<string>,
  seenWords: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  if (guide.targets.length !== 4 || (passage.wordSupportTargets?.length ?? 0) !== 4) invalid(issues, guide.passageId, 'Each passage requires exactly four meaning targets and four Word Help targets.')
  if (!complete(guide.wordPartStrategyStatement) || !complete(guide.contextConfirmationStatement) || unsafe(guide.wordPartStrategyStatement) || unsafe(guide.contextConfirmationStatement)) {
    add(issues, 'root_meaning_scope_drift', guide.passageId, 'Guide strategy language must safely describe word-part inference and context confirmation without universal claims.')
  }
  if (/always|every unfamiliar word|exact definition/i.test(`${guide.wordPartStrategyStatement} ${guide.contextConfirmationStatement}`)) {
    add(issues, 'root_meaning_scope_drift', guide.passageId, 'Root strategy language must not make universal claims.')
  }
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== VERSION || guide.contentVersion !== pack.manifest.contentVersion) invalid(issues, guide.passageId, 'Guides must remain DRAFT and match the pack version.')
  for (const target of guide.targets) validateTarget(target, passage, seenTargetIds, seenWords, issues)
}

function validateTarget(
  target: RootMeaningTarget,
  passage: ContentPack['passages'][number],
  seenTargetIds: Set<string>,
  seenWords: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  const word = target.surfaceWord.toLowerCase().trim()
  if (!target.targetId.trim() || seenTargetIds.has(target.targetId) || seenWords.has(word)) invalid(issues, target.targetId || word, 'Target IDs and surface words must be globally unique in the pack.')
  seenTargetIds.add(target.targetId)
  seenWords.add(word)
  const expected = EXPECTED_TARGETS.get(word)
  if (!expected || target.primaryFamily !== expected.family) add(issues, 'root_meaning_guide_invalid', target.targetId, 'The target primary family must match the approved inventory.')
  if (target.parts.length < 2) invalid(issues, target.targetId, 'Each target requires at least two authored parts.')
  if (target.parts.map((candidate) => candidate.surfaceForm).join('').toLowerCase() !== word) add(issues, 'root_word_part_reconstruction_failure', target.targetId, 'Authored part surface forms must reconstruct the written target exactly.')
  if (!target.transparentComposition) add(issues, 'root_target_not_transparent', target.targetId, 'Every target must remain transparently compositional for Grade 3 instruction.')
  if (!complete(target.combinedPartClue) || !complete(target.inferredMeaning) || unsafe(target.combinedPartClue) || unsafe(target.inferredMeaning)) add(issues, 'root_composed_meaning_invalid', target.targetId, 'Each target requires a safe, defensible combined clue and inferred meaning.')
  if (target.contextEvidenceIds.length === 0 || !complete(target.contextConfirmationStatement) || unsafe(target.contextConfirmationStatement)) add(issues, 'root_context_confirmation_invalid', target.targetId, 'Each target requires source-owned context evidence and an explicit confirmation statement.')

  const source = resolvePassageEvidence(passage, target.sourceSentenceId)
  if (!source || !containsWord(source.text, word)) add(issues, 'root_word_not_in_source', target.targetId, 'The complete target word must appear in its learner-visible source sentence.')
  for (const evidenceId of target.contextEvidenceIds) if (!resolvePassageEvidence(passage, evidenceId)) add(issues, 'root_context_confirmation_invalid', target.targetId, 'Every context evidence ID must resolve within the target passage.')

  if (expected) validateExpectedParts(target, expected.parts, issues)
  const support = passage.wordSupportTargets?.find((candidate) => candidate.surfaceWord.toLowerCase() === word)
  if (!support) add(issues, 'root_meaning_speech_chunk_confusion', target.targetId, 'Each meaning target requires one source-owned Word Help target.')
  else {
    const meaningSignature = target.parts.map((candidate) => candidate.surfaceForm.toLowerCase()).join('|')
    const speechSignature = support.spokenChunks.map((candidate) => candidate.speechText.toLowerCase()).join('|')
    if (meaningSignature === speechSignature && target.parts.some((candidate) => candidate.kind === 'connector')) add(issues, 'root_meaning_speech_chunk_confusion', target.targetId, 'Meaning parts with connectors must not be copied blindly into pronunciation chunks.')
  }
}

function validateExpectedParts(target: RootMeaningTarget, expected: readonly ExpectedPart[], issues: ContentPackAuditIssue[]) {
  if (target.parts.length !== expected.length) {
    add(issues, 'false_root_boundary', target.targetId, 'The target decomposition must use only its approved genuine meaning parts.')
    return
  }
  target.parts.forEach((candidate, index) => {
    const approved = expected[index]
    if (candidate.surfaceForm.toLowerCase() !== approved.surface || candidate.kind !== approved.kind) add(issues, 'false_root_boundary', candidate.partId, 'This boundary does not match the approved transparent decomposition.')
    if (candidate.origin !== approved.origin) add(issues, 'root_origin_mismatch', candidate.partId, 'The authored part origin must match the approved origin.')
    if (normalize(candidate.commonMeaning) !== normalize(approved.meaning)) add(issues, 'root_common_meaning_invalid', candidate.partId, 'The authored common meaning must match the approved Grade 3 meaning clue.')
    if (candidate.contributesMeaning !== approved.contributes || (candidate.kind === 'connector') === candidate.contributesMeaning) add(issues, 'false_root_boundary', candidate.partId, 'Connectors must be non-meaningful and all other authored parts must contribute meaning.')
    if (!candidate.partId.trim() || !candidate.surfaceForm || !candidate.contextualContribution || unsafe(candidate.contextualContribution)) invalid(issues, target.targetId, 'Every word part needs a stable ID, surface form, and safe contextual contribution.')
  })
}

function containsWord(value: string, word: string): boolean { return new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(value) }
function normalize(value: string): string { return value.toLowerCase().trim().replace(/[.]/g, '') }
function complete(value: string): boolean { return value.trim().split(/\s+/).length >= 3 }
function unsafe(value: string): boolean { return /<[^>]+>/.test(value) || /https?:\/\//i.test(value) }
function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'root_meaning_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
