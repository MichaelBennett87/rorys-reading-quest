import { resolvePassageEvidence } from '../evidence'
import type {
  ContentPack,
  ContentPackAuditIssue,
  MultisyllableDecodingTarget,
  MultisyllablePatternLabel,
} from './contentPackTypes'

export const MULTISYLLABLE_MOUNTAIN_PACK_ID = 'g3-word-forge-multisyllable-mountain'

const REQUIRED_PATTERNS = new Set<MultisyllablePatternLabel>([
  'closed',
  'open',
  'vowel-consonant-e',
  'vowel-team',
  'r-controlled',
  'consonant-le',
])

const VALID_HINT_KINDS = new Set(['compound-part', 'prefix', 'base', 'suffix'])

export function buildMultisyllableDecodingGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== MULTISYLLABLE_MOUNTAIN_PACK_ID) return []

  const issues: ContentPackAuditIssue[] = []
  const guides = pack.multisyllableDecodingGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const supportById = new Map(
    pack.passages
      .flatMap((passage) => passage.wordSupportTargets ?? [])
      .map((target) => [target.targetId, target] as const),
  )
  const guidePassageIds = new Set<string>()
  const targetIds = new Set<string>()
  const targetWords = new Set<string>()
  const observedPatterns = new Set<MultisyllablePatternLabel>()
  const allTargets = guides.flatMap((guide) => guide.targets)

  if (guides.length === 0) {
    add(issues, 'missing_multisyllable_decoding_guide', pack.manifest.packId, 'Multisyllable Mountain requires authored decoding guides.')
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'multisyllable_decoding_guide_count_mismatch', pack.manifest.packId, `Expected 7 guides for 7 passages, found ${guides.length}.`)
  }

  for (const guide of guides) {
    const passage = passageById.get(guide.passageId)
    if (!passage) add(issues, 'missing_multisyllable_decoding_guide', guide.passageId, 'Guide passage must resolve inside Multisyllable Mountain.')
    if (guidePassageIds.has(guide.passageId)) add(issues, 'multisyllable_decoding_guide_invalid', guide.passageId, 'Each passage may have only one multisyllable guide.')
    guidePassageIds.add(guide.passageId)
    if (guide.targets.length !== 4) add(issues, 'multisyllable_decoding_guide_invalid', guide.passageId, 'Each guide must contain exactly four targets.')
    if (guide.reviewStatus !== 'DRAFT') add(issues, 'multisyllable_decoding_guide_invalid', guide.passageId, 'Multisyllable guides must remain DRAFT.')
    if (guide.contentVersion !== pack.manifest.contentVersion) add(issues, 'multisyllable_decoding_guide_invalid', guide.passageId, 'Guide version must match the pack.')

    for (const target of guide.targets) {
      validateTarget(target, guide.passageId, passage, supportById, targetIds, targetWords, observedPatterns, pack, issues)
    }
  }

  for (const passage of pack.passages) {
    if (!guidePassageIds.has(passage.passageIdentifier)) {
      add(issues, 'missing_multisyllable_decoding_guide', passage.passageIdentifier, 'Every Multisyllable Mountain passage needs one guide.')
    }
  }
  if (allTargets.length !== 28) {
    add(issues, 'multisyllable_decoding_guide_count_mismatch', pack.manifest.packId, `Expected 28 targets, found ${allTargets.length}.`)
  }
  for (const pattern of REQUIRED_PATTERNS) {
    if (!observedPatterns.has(pattern)) add(issues, 'multisyllable_decoding_guide_invalid', pattern, `Required syllable pattern ${pattern} is absent.`)
  }

  validatePackShape(pack, issues)
  return issues
}

function validateTarget(
  target: MultisyllableDecodingTarget,
  passageId: string,
  passage: ContentPack['passages'][number] | undefined,
  supportById: Map<string, NonNullable<ContentPack['passages'][number]['wordSupportTargets']>[number]>,
  targetIds: Set<string>,
  targetWords: Set<string>,
  observedPatterns: Set<MultisyllablePatternLabel>,
  pack: ContentPack,
  issues: ContentPackAuditIssue[],
) {
  if (targetIds.has(target.targetId)) add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Target IDs must be unique across the pack.')
  targetIds.add(target.targetId)
  const normalizedWord = normalize(target.surfaceWord)
  if (!normalizedWord) add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'A nonempty surface word is required.')
  if (targetWords.has(normalizedWord)) add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Target words must be unique across the pack.')
  targetWords.add(normalizedWord)
  if (!Number.isInteger(target.syllableCount) || target.syllableCount < 2 || target.syllableCount !== target.pronunciationChunks.length) {
    add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Syllable count must be a defensible integer matching the authored reading chunks.')
  }
  if (target.pronunciationChunks.map((chunk) => chunk.displayText).join('') !== target.surfaceWord
    || target.pronunciationChunks.some((chunk) => !chunk.displayText.trim() || !chunk.speechText.trim())) {
    add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Authored reading chunks must reconstruct the word and include pronounceable speech text.')
  }
  if (target.syllablePatterns.length !== target.pronunciationChunks.length) {
    add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Each reading chunk needs one syllable-pattern label.')
  }
  target.syllablePatterns.forEach((pattern) => observedPatterns.add(pattern))
  if (target.morphologicalHints.some((hint) => (
    !hint.text.trim() || !VALID_HINT_KINDS.has(hint.kind) || !normalizedWord.includes(normalize(hint.text))
  ))) {
    add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Morphological hints must name valid contiguous parts of the target word.')
  }
  if (target.decodingSteps.length === 0 || target.decodingSteps.some((step) => !step.trim())) {
    add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Every target needs nonempty decoding steps.')
  }
  if (!target.wholeWordSpeechText.trim()) add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Whole-word speech text is required.')
  if (target.reviewStatus !== 'DRAFT' || target.contentVersion !== pack.manifest.contentVersion) {
    add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Target status and version must match the DRAFT pack.')
  }

  const evidence = passage ? resolvePassageEvidence(passage, target.sourceSentenceId) : null
  if (!evidence || !containsCompleteWord(evidence.text, target.surfaceWord)) {
    add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'The source sentence must resolve and contain the complete target word.')
  }
  const support = supportById.get(target.targetId)
  if (!support) {
    add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Every decoding target needs one matching Word Help target.')
  } else {
    if (support.passageId !== passageId || support.sentenceId !== target.sourceSentenceId || normalize(support.surfaceWord) !== normalizedWord) {
      add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Word Help ownership must match the decoding target.')
    }
    if (support.displayChunks.map((chunk) => chunk.displayText).join('|') !== target.pronunciationChunks.map((chunk) => chunk.displayText).join('|')) {
      add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Word Help chunks must match the authored reading chunks.')
    }
    const highlighted = support.focusParts.filter((part) => part.emphasis).map((part) => part.text).join('')
    const usefulClues = [
      ...target.morphologicalHints.map((hint) => normalize(hint.text)),
      ...target.pronunciationChunks.map((chunk) => normalize(chunk.displayText)),
    ]
    if (!highlighted || !usefulClues.includes(normalize(highlighted))) {
      add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Word Help must highlight an authored syllable or morphological clue.')
    }
  }

  const authoredText = [
    target.targetId,
    target.surfaceWord,
    target.sourceSentenceId,
    target.wholeWordSpeechText,
    ...target.pronunciationChunks.flatMap((chunk) => [chunk.displayText, chunk.speechText]),
    ...target.morphologicalHints.map((hint) => hint.text),
    ...target.decodingSteps,
  ]
  if (authoredText.some((value) => /https?:\/\/|www\.|<[^>]+>/i.test(value))) {
    add(issues, 'multisyllable_decoding_guide_invalid', target.targetId, 'Multisyllable guide text must not contain raw HTML or remote URLs.')
  }
}

function validatePackShape(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const guided = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const supportCount = pack.passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0)
  if (activeLessons.length !== 7 || guided.length !== 4 || checkpoints.length !== 3) {
    add(issues, 'multisyllable_decoding_guide_invalid', pack.manifest.packId, 'Multisyllable Mountain requires four guided lessons and three checkpoints.')
  }
  if (guided.filter((lesson) => lesson.difficulty === 2).length !== 2 || guided.filter((lesson) => lesson.difficulty === 3).length !== 2) {
    add(issues, 'multisyllable_decoding_guide_invalid', pack.manifest.packId, 'Guided lessons require a 2/2 difficulty split.')
  }
  if (checkpoints.some((lesson) => lesson.difficulty !== 3)) add(issues, 'multisyllable_decoding_guide_invalid', pack.manifest.packId, 'All checkpoints must use difficulty 3.')
  if (pack.passages.length !== 7 || pack.questions.length !== 41 || supportCount !== 28) {
    add(issues, 'multisyllable_decoding_guide_count_mismatch', pack.manifest.packId, 'Pack totals must be 7 passages, 41 questions, and 28 support targets.')
  }
  const counts = new Map<string, number>()
  for (const question of pack.questions) counts.set(question.questionType, (counts.get(question.questionType) ?? 0) + 1)
  const expected: Record<string, number> = { multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 }
  for (const [type, count] of Object.entries(expected)) {
    if ((counts.get(type) ?? 0) !== count) add(issues, 'multisyllable_decoding_guide_invalid', pack.manifest.packId, `Expected ${count} ${type} questions.`)
  }
  const checkpointRequirements = [
    'open-closed-contrast',
    'vowel-team-or-vce-transfer',
    'r-controlled-or-consonant-le-transfer',
    'morphology-assisted-decoding',
    'full-word-chunking',
    'transfer-decoding',
    'morphology-vs-reading-chunks',
  ]
  for (const checkpoint of checkpoints) {
    const tags = new Set(pack.questions.filter((question) => question.lessonIdentifier === checkpoint.lessonId).flatMap((question) => question.tags))
    for (const required of checkpointRequirements) {
      if (!tags.has(required)) add(issues, 'multisyllable_decoding_guide_invalid', checkpoint.lessonId, `Checkpoint is missing ${required}.`)
    }
  }
  if (!pack.manifest.coveredPatterns.includes('multisyllabic-decoding')) {
    add(issues, 'multisyllable_decoding_guide_invalid', pack.manifest.packId, 'Multisyllable Mountain must claim multisyllabic-decoding.')
  }
  for (const forbidden of ['oral-fluency', 'wcpm', 'prosody-mastery', 'unfamiliar-word-meaning', 'grade-4-morphology']) {
    if (pack.manifest.coveredPatterns.includes(forbidden)) add(issues, 'multisyllable_decoding_guide_invalid', pack.manifest.packId, `Pack must not claim ${forbidden}.`)
  }
}

function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) {
  issues.push({ code, itemIdentifier, message })
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z]/g, '')
}

function containsCompleteWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
}
