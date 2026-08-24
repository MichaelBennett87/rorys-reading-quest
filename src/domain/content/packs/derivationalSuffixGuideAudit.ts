import { resolvePassageEvidence } from '../evidence'
import type {
  ContentPack,
  ContentPackAuditIssue,
  DerivationalSuffixTarget,
  DerivationalWordRole,
} from './contentPackTypes'

export const SUFFIX_SHIFTER_PACK_ID = 'g3-word-forge-suffix-shifter'

const REQUIRED_SUFFIXES = new Set(['ness', 'ment', 'er', 'ful', 'less', 'ly', 'able', 'y'])
const VALID_TRANSFORMATIONS = new Map<string, readonly [DerivationalWordRole, DerivationalWordRole]>([
  ['ness', ['adjective', 'noun']],
  ['ment', ['verb', 'noun']],
  ['er', ['verb', 'noun']],
  ['ful', ['noun', 'adjective']],
  ['less', ['noun', 'adjective']],
  ['ly', ['adjective', 'adverb']],
  ['able', ['verb', 'adjective']],
  ['y', ['noun', 'adjective']],
])

export function buildDerivationalSuffixGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== SUFFIX_SHIFTER_PACK_ID) return []

  const issues: ContentPackAuditIssue[] = []
  const guides = pack.derivationalSuffixGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const supportById = new Map(
    pack.passages
      .flatMap((passage) => passage.wordSupportTargets ?? [])
      .map((target) => [target.targetId, target] as const),
  )
  const guidePassageIds = new Set<string>()
  const targetIds = new Set<string>()
  const derivedWords = new Set<string>()
  const allTargets = guides.flatMap((guide) => guide.targets)

  if (guides.length === 0) {
    add(issues, 'missing_derivational_suffix_guide', pack.manifest.packId, 'Suffix Shifter requires authored derivational-suffix guides.')
  }
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'derivational_suffix_guide_count_mismatch', pack.manifest.packId, `Expected 7 guides for 7 passages, found ${guides.length}.`)
  }

  for (const guide of guides) {
    const passage = passageById.get(guide.passageId)
    if (!passage) add(issues, 'missing_derivational_suffix_guide', guide.passageId, 'Guide passage must resolve inside Suffix Shifter.')
    if (guidePassageIds.has(guide.passageId)) add(issues, 'derivational_suffix_guide_invalid', guide.passageId, 'Each passage may have only one suffix guide.')
    guidePassageIds.add(guide.passageId)
    if (guide.targets.length !== 4) add(issues, 'derivational_suffix_guide_invalid', guide.passageId, 'Each guide must contain exactly four targets.')
    if (guide.reviewStatus !== 'DRAFT') add(issues, 'derivational_suffix_guide_invalid', guide.passageId, 'Suffix guides must remain DRAFT.')
    if (guide.contentVersion !== pack.manifest.contentVersion) add(issues, 'derivational_suffix_guide_invalid', guide.passageId, 'Guide version must match the pack.')

    for (const target of guide.targets) validateTarget(target, guide.passageId, passage, supportById, targetIds, derivedWords, issues)
  }

  for (const passage of pack.passages) {
    if (!guidePassageIds.has(passage.passageIdentifier)) {
      add(issues, 'missing_derivational_suffix_guide', passage.passageIdentifier, 'Every Suffix Shifter passage needs one guide.')
    }
  }
  if (allTargets.length !== 28) {
    add(issues, 'derivational_suffix_guide_count_mismatch', pack.manifest.packId, `Expected 28 targets, found ${allTargets.length}.`)
  }
  const observedSuffixes = new Set(allTargets.map((target) => normalize(target.suffix)))
  if (!sameSet(observedSuffixes, REQUIRED_SUFFIXES)) {
    add(issues, 'derivational_suffix_guide_invalid', pack.manifest.packId, 'The exact bounded suffix set must be -ness, -ment, -er, -ful, -less, -ly, -able, and -y.')
  }
  for (const suffix of REQUIRED_SUFFIXES) {
    if (allTargets.filter((target) => normalize(target.suffix) === suffix).length < 3) {
      add(issues, 'derivational_suffix_guide_invalid', suffix, `Suffix -${suffix} must appear in at least three targets.`)
    }
  }

  validatePackShape(pack, issues)
  return issues
}

function validateTarget(
  target: DerivationalSuffixTarget,
  passageId: string,
  passage: ContentPack['passages'][number] | undefined,
  supportById: Map<string, NonNullable<ContentPack['passages'][number]['wordSupportTargets']>[number]>,
  targetIds: Set<string>,
  derivedWords: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  if (targetIds.has(target.targetId)) add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Target IDs must be unique across the pack.')
  targetIds.add(target.targetId)
  const base = normalize(target.baseWord)
  const derived = normalize(target.derivedWord)
  const suffix = normalize(target.suffix)
  if (!base || !derived || !suffix) add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Base word, derived word, and suffix are required.')
  if (derivedWords.has(derived)) add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Derived target words must be unique.')
  derivedWords.add(derived)
  if (`${base}${suffix}` !== derived || !derived.endsWith(suffix)) {
    add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'This phase requires a transparent base-plus-suffix spelling boundary.')
  }
  const expectedRoles = VALID_TRANSFORMATIONS.get(suffix)
  if (!expectedRoles || expectedRoles[0] !== target.baseWordRole || expectedRoles[1] !== target.derivedWordRole) {
    add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'The authored part-of-speech transformation must match the bounded suffix contract.')
  }
  if (target.morphologicalChunks.map((chunk) => chunk.text).join('') !== target.derivedWord) {
    add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Morphological chunks must reconstruct the derived word.')
  }
  if (target.morphologicalChunks.length !== 2
    || target.morphologicalChunks[0]?.role !== 'base'
    || target.morphologicalChunks[1]?.role !== 'suffix'
    || normalize(target.morphologicalChunks[0]?.text ?? '') !== base
    || normalize(target.morphologicalChunks[1]?.text ?? '') !== suffix) {
    add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Morphological chunks must identify the exact base and suffix.')
  }
  if (target.readingChunks.map((chunk) => chunk.displayText).join('') !== target.derivedWord
    || target.readingChunks.some((chunk) => !chunk.displayText.trim() || !chunk.speechText.trim())) {
    add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Authored reading chunks must reconstruct the word and include pronounceable speech text.')
  }
  if (!target.transformationExplanation.trim()
    || !target.transformationExplanation.toLowerCase().includes(target.baseWordRole)
    || !target.transformationExplanation.toLowerCase().includes(target.derivedWordRole)) {
    add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'The transformation explanation must name both authored word roles.')
  }

  const evidence = passage ? resolvePassageEvidence(passage, target.sentenceId) : null
  if (!evidence || !containsCompleteWord(evidence.text, target.derivedWord)) {
    add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'The source sentence must resolve and contain the complete derived word.')
  }
  const support = supportById.get(target.targetId)
  if (!support) {
    add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Every derivational target needs one matching Word Help target.')
  } else {
    if (support.passageId !== passageId || support.sentenceId !== target.sentenceId || normalize(support.surfaceWord) !== derived) {
      add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Word Help ownership must match the derivational target.')
    }
    if (support.displayChunks.map((chunk) => chunk.displayText).join('|') !== target.readingChunks.map((chunk) => chunk.displayText).join('|')) {
      add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Word Help chunks must match the authored reading chunks.')
    }
    const highlighted = support.focusParts.filter((part) => part.emphasis).map((part) => part.text).join('')
    if (normalize(highlighted) !== suffix) add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Word Help must highlight the suffix.')
  }

  const authoredText = [
    target.targetId, target.sentenceId, target.baseWord, target.derivedWord, target.suffix,
    target.transformationExplanation, ...target.morphologicalChunks.map((chunk) => chunk.text),
    ...target.readingChunks.flatMap((chunk) => [chunk.displayText, chunk.speechText]),
  ]
  if (authoredText.some((value) => /https?:\/\/|www\.|<[^>]+>/i.test(value))) {
    add(issues, 'derivational_suffix_guide_invalid', target.targetId, 'Suffix guide text must not contain raw HTML or remote URLs.')
  }
}

function validatePackShape(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const guided = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const supportCount = pack.passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0)
  if (activeLessons.length !== 7 || guided.length !== 4 || checkpoints.length !== 3) {
    add(issues, 'derivational_suffix_guide_invalid', pack.manifest.packId, 'Suffix Shifter requires four guided lessons and three checkpoints.')
  }
  if (guided.filter((lesson) => lesson.difficulty === 1).length !== 2 || guided.filter((lesson) => lesson.difficulty === 2).length !== 2) {
    add(issues, 'derivational_suffix_guide_invalid', pack.manifest.packId, 'Suffix Shifter guided lessons require a 2/2 difficulty split.')
  }
  if (checkpoints.some((lesson) => lesson.difficulty !== 2)) add(issues, 'derivational_suffix_guide_invalid', pack.manifest.packId, 'All Suffix Shifter checkpoints must use difficulty 2.')
  if (pack.passages.length !== 7 || pack.questions.length !== 41 || supportCount !== 28) {
    add(issues, 'derivational_suffix_guide_count_mismatch', pack.manifest.packId, 'Suffix Shifter totals must be 7 passages, 41 questions, and 28 support targets.')
  }
  const counts = new Map<string, number>()
  for (const question of pack.questions) counts.set(question.questionType, (counts.get(question.questionType) ?? 0) + 1)
  const expected: Record<string, number> = { multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 }
  for (const [type, count] of Object.entries(expected)) {
    if ((counts.get(type) ?? 0) !== count) add(issues, 'derivational_suffix_guide_invalid', pack.manifest.packId, `Expected ${count} ${type} questions.`)
  }
  for (const checkpoint of checkpoints) {
    const questions = pack.questions.filter((question) => question.lessonIdentifier === checkpoint.lessonId)
    const tags = new Set(questions.flatMap((question) => question.tags))
    for (const required of ['derivational-suffix-decoding', 'part-of-speech-change', 'morphological-segmentation', 'reading-chunk-decoding']) {
      if (!tags.has(required)) add(issues, 'derivational_suffix_guide_invalid', checkpoint.lessonId, `Checkpoint is missing ${required}.`)
    }
  }
  if (!pack.manifest.coveredPatterns.includes('derivational-suffix-decoding') || !pack.manifest.coveredPatterns.includes('part-of-speech-change')) {
    add(issues, 'derivational_suffix_guide_invalid', pack.manifest.packId, 'Suffix Shifter must claim both intended Phase 7A2 patterns.')
  }
  for (const forbidden of ['multisyllabic-decoding', 'unfamiliar-word-meaning']) {
    if (pack.manifest.coveredPatterns.includes(forbidden)) add(issues, 'derivational_suffix_guide_invalid', pack.manifest.packId, `Suffix Shifter must not claim ${forbidden}.`)
  }
  if (pack.manifest.benchmarkReferences.includes('ELA.3.V.1.2') || pack.manifest.supportingBenchmarkReferences?.includes('ELA.3.V.1.2')) {
    add(issues, 'derivational_suffix_guide_invalid', pack.manifest.packId, 'Suffix Shifter must not claim ELA.3.V.1.2 coverage.')
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

function sameSet(left: Set<string>, right: Set<string>): boolean {
  return left.size === right.size && [...left].every((value) => right.has(value))
}
