import { resolvePassageEvidence } from '../evidence'
import type {
  ClassicalWordPart,
  ContentPack,
  ContentPackAuditIssue,
  RootDecodingTarget,
} from './contentPackTypes'

export const ROOT_REACTOR_PACK_ID = 'g3-word-forge-root-reactor'

const REQUIRED_WORDS = [
  'telephone', 'telescope', 'geography', 'geology', 'photograph', 'photocopy',
  'autograph', 'graphic', 'biology', 'biography', 'microscope', 'microphone',
  'transport', 'export', 'tractor', 'retract', 'erupt', 'disrupt', 'transform', 'uniform',
  'bicycle', 'biplane', 'triangle', 'tripod', 'submarine', 'subway', 'transfer', 'transplant',
] as const

const PRIMARY_FAMILIES = {
  Greek: ['tele', 'geo', 'photo', 'graph', 'bio', 'micro'],
  Latin: ['port', 'tract', 'rupt', 'form'],
  affix: ['bi', 'tri', 'sub', 'trans'],
} as const

const REQUIRED_ADDITIONAL_PARTS = ['scope', 'auto', 'graph', 'ex', 're', 'uni', 'trans'] as const
const VALID_ORIGINS = new Set(['Greek', 'Latin', 'Greek/Latin'])
const VALID_KINDS = new Set(['root', 'prefix', 'combining-form'])

export function buildRootDecodingGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== ROOT_REACTOR_PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.rootDecodingGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const supportById = new Map(pack.passages.flatMap((passage) => passage.wordSupportTargets ?? []).map((target) => [target.targetId, target] as const))
  const allTargets = guides.flatMap((guide) => guide.targets)

  if (guides.length === 0) add(issues, 'missing_root_decoding_guide', pack.manifest.packId, 'Root Reactor requires authored root-decoding guides.')
  if (guides.length !== 7 || guides.length !== pack.passages.length) {
    add(issues, 'root_decoding_guide_count_mismatch', pack.manifest.packId, `Expected 7 guides for 7 passages, found ${guides.length}.`)
  }

  const guidePassageIds = new Set<string>()
  const targetIds = new Set<string>()
  const targetWords = new Set<string>()
  for (const guide of guides) {
    const passage = passageById.get(guide.passageId)
    if (!passage) add(issues, 'missing_root_decoding_guide', guide.passageId, 'Guide passage must resolve inside Root Reactor.')
    if (guidePassageIds.has(guide.passageId)) add(issues, 'root_decoding_guide_invalid', guide.passageId, 'Each passage may have only one guide.')
    guidePassageIds.add(guide.passageId)
    if (guide.targets.length !== 4) add(issues, 'root_decoding_guide_invalid', guide.passageId, 'Each guide must contain exactly four targets.')
    if (guide.reviewStatus !== 'DRAFT') add(issues, 'root_decoding_guide_invalid', guide.passageId, 'Root decoding guides must remain DRAFT.')
    if (guide.contentVersion !== pack.manifest.contentVersion) add(issues, 'root_decoding_guide_invalid', guide.passageId, 'Guide version must match the pack.')

    for (const target of guide.targets) {
      if (targetIds.has(target.targetId)) add(issues, 'root_decoding_guide_invalid', target.targetId, 'Target IDs must be unique across the pack.')
      targetIds.add(target.targetId)
      const word = normalize(target.surfaceWord)
      if (!word) add(issues, 'root_decoding_guide_invalid', target.targetId, 'Target words must be nonempty.')
      if (targetWords.has(word)) add(issues, 'root_decoding_guide_invalid', target.targetId, 'Target words must be unique across the pack.')
      targetWords.add(word)
      validatePart(target.primaryPart, target, issues)
      for (const part of target.additionalParts) validatePart(part, target, issues)

      const allowedPartIds = new Set([target.primaryPart.partId, ...target.additionalParts.map((part) => part.partId)])
      const morphology = target.morphologicalChunks.map((chunk) => chunk.text).join('')
      const syllables = target.syllableChunks.map((chunk) => chunk.displayText).join('')
      if (normalize(morphology) !== word) add(issues, 'root_decoding_guide_invalid', target.targetId, 'Morphological chunks must reconstruct the word.')
      if (normalize(syllables) !== word) add(issues, 'root_decoding_guide_invalid', target.targetId, 'Reading chunks must reconstruct the word.')
      if (!target.morphologicalChunks.some((chunk) => chunk.partId === target.primaryPart.partId)) {
        add(issues, 'root_decoding_guide_invalid', target.targetId, 'Morphological chunks must identify the primary part.')
      }
      for (const chunk of target.morphologicalChunks) {
        if (chunk.partId && !allowedPartIds.has(chunk.partId)) add(issues, 'root_decoding_guide_invalid', target.targetId, `Unknown linked part: ${chunk.partId}.`)
      }
      if (target.syllableChunks.some((chunk) => !chunk.displayText.trim() || !chunk.speechText.trim())) {
        add(issues, 'root_decoding_guide_invalid', target.targetId, 'Every reading chunk needs display and authored speech text.')
      }
      if (!target.decodingStatement.trim() || !target.meaningSupportStatement.trim()) {
        add(issues, 'root_decoding_guide_invalid', target.targetId, 'Targets require decoding and meaning-support statements.')
      }

      const evidence = passage ? resolvePassageEvidence(passage, target.sentenceId) : null
      if (!evidence) add(issues, 'root_decoding_guide_invalid', target.targetId, 'Target sentence must resolve in the guide passage.')
      if (evidence && !containsCompleteWord(evidence.text, target.surfaceWord)) {
        add(issues, 'root_decoding_guide_invalid', target.targetId, 'Target word must appear as a complete word in its source sentence.')
      }

      const support = supportById.get(target.targetId)
      if (!support) {
        add(issues, 'root_decoding_guide_invalid', target.targetId, 'Every root target needs one matching Word Help target.')
      } else {
        if (support.passageId !== guide.passageId || support.sentenceId !== target.sentenceId || normalize(support.surfaceWord) !== word) {
          add(issues, 'root_decoding_guide_invalid', target.targetId, 'Word Help ownership must match the root target.')
        }
        if (support.displayChunks.map((chunk) => chunk.displayText).join('|') !== target.syllableChunks.map((chunk) => chunk.displayText).join('|')) {
          add(issues, 'root_decoding_guide_invalid', target.targetId, 'Word Help chunks must match the authored reading chunks.')
        }
        const highlighted = support.focusParts.filter((part) => part.emphasis).map((part) => part.text).join('')
        if (normalize(highlighted) !== normalize(target.primaryPart.surfaceForm)) {
          add(issues, 'root_decoding_guide_invalid', target.targetId, 'Word Help must highlight the primary root or affix.')
        }
      }

      const unsafe = [
        target.targetId, target.surfaceWord, target.sentenceId, target.decodingStatement, target.meaningSupportStatement,
        target.primaryPart.displayLabel, target.primaryPart.commonMeaning,
        ...target.additionalParts.flatMap((part) => [part.displayLabel, part.commonMeaning]),
      ].some((value) => /https?:\/\/|www\.|<[^>]+>/i.test(value))
      if (unsafe) add(issues, 'root_decoding_guide_invalid', target.targetId, 'Root guide text must not contain raw HTML or remote URLs.')
    }
  }

  for (const passage of pack.passages) {
    if (!guidePassageIds.has(passage.passageIdentifier)) add(issues, 'missing_root_decoding_guide', passage.passageIdentifier, 'Every Root Reactor passage needs one guide.')
  }
  if (allTargets.length !== 28) add(issues, 'root_decoding_guide_count_mismatch', pack.manifest.packId, `Expected 28 targets, found ${allTargets.length}.`)
  if (!sameSet(targetWords, new Set(REQUIRED_WORDS))) add(issues, 'root_decoding_guide_invalid', pack.manifest.packId, 'The exact 28-word Root Reactor target inventory is required.')

  for (const [category, families] of Object.entries(PRIMARY_FAMILIES)) {
    const expectedCount = category === 'Greek' ? 12 : 8
    const categoryTargets = allTargets.filter((target) => families.includes(normalize(target.primaryPart.surfaceForm) as never))
    if (categoryTargets.length !== expectedCount) add(issues, 'root_decoding_guide_invalid', pack.manifest.packId, `${category} primary distribution must contain ${expectedCount} targets.`)
    for (const family of families) {
      if (categoryTargets.filter((target) => normalize(target.primaryPart.surfaceForm) === family).length !== 2) {
        add(issues, 'root_decoding_guide_invalid', family, 'Every required primary family must own exactly two targets.')
      }
    }
  }

  const additionalParts = new Set(allTargets.flatMap((target) => target.additionalParts.map((part) => normalize(part.surfaceForm))))
  for (const required of REQUIRED_ADDITIONAL_PARTS) {
    if (!additionalParts.has(required)) add(issues, 'root_decoding_guide_invalid', required, `Required additional part ${required} is missing.`)
  }

  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const checkpoints = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
  const guided = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
  const supportCount = pack.passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0)
  const questionTypeCounts = countBy(pack.questions.map((question) => question.questionType))
  if (activeLessons.length !== 7 || guided.length !== 4 || checkpoints.length !== 3) add(issues, 'root_decoding_guide_invalid', pack.manifest.packId, 'Root Reactor requires four guided lessons and three checkpoints.')
  if (guided.filter((lesson) => lesson.difficulty === 0).length !== 2 || guided.filter((lesson) => lesson.difficulty === 1).length !== 2) add(issues, 'root_decoding_guide_invalid', pack.manifest.packId, 'Root Reactor guided lessons require a 2/2 difficulty split.')
  if (checkpoints.some((lesson) => lesson.difficulty !== 1)) add(issues, 'root_decoding_guide_invalid', pack.manifest.packId, 'All Root Reactor checkpoints must use difficulty 1.')
  if (pack.passages.length !== 7 || pack.questions.length !== 41 || supportCount !== 28) add(issues, 'root_decoding_guide_count_mismatch', pack.manifest.packId, 'Root Reactor totals must be 7 passages, 41 questions, and 28 support targets.')
  const expectedTypes: Record<string, number> = { multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 }
  for (const [type, count] of Object.entries(expectedTypes)) if ((questionTypeCounts.get(type) ?? 0) !== count) add(issues, 'root_decoding_guide_invalid', pack.manifest.packId, `Expected ${count} ${type} questions.`)

  for (const checkpoint of checkpoints) {
    const guideTargets = guides.filter((guide) => checkpoint.passageIdentifiers.includes(guide.passageId)).flatMap((guide) => guide.targets)
    const primaryFamilies = new Set(guideTargets.map((target) => normalize(target.primaryPart.surfaceForm)))
    if (![...PRIMARY_FAMILIES.Greek].some((family) => primaryFamilies.has(family))
      || ![...PRIMARY_FAMILIES.Latin].some((family) => primaryFamilies.has(family))
      || ![...PRIMARY_FAMILIES.affix].some((family) => primaryFamilies.has(family))) {
      add(issues, 'root_decoding_guide_invalid', checkpoint.lessonId, 'Every checkpoint must mix Greek, Latin, and affix primary work.')
    }
    const tags = new Set(pack.questions.filter((question) => question.lessonIdentifier === checkpoint.lessonId).flatMap((question) => question.tags))
    for (const requiredTag of ['morphological-segmentation', 'syllable-segmentation', 'root-affix-vs-syllable-distinction', 'word-family-decoding', 'connected-text-decoding']) {
      if (!tags.has(requiredTag)) add(issues, 'root_decoding_guide_invalid', checkpoint.lessonId, `Checkpoint is missing ${requiredTag}.`)
    }
  }

  const forbiddenClaims = ['derivational-suffix-decoding', 'part-of-speech-change', 'multisyllabic-decoding', 'unfamiliar-word-meaning']
  for (const claim of forbiddenClaims) if (pack.manifest.coveredPatterns.includes(claim)) add(issues, 'root_decoding_guide_invalid', pack.manifest.packId, `Root Reactor must not claim ${claim}.`)
  if (pack.manifest.benchmarkReferences.includes('ELA.3.V.1.2') || pack.manifest.supportingBenchmarkReferences?.includes('ELA.3.V.1.2')) add(issues, 'root_decoding_guide_invalid', pack.manifest.packId, 'Root Reactor must not claim ELA.3.V.1.2 coverage.')
  return issues
}

function validatePart(part: ClassicalWordPart, target: RootDecodingTarget, issues: ContentPackAuditIssue[]) {
  if (!part.partId.trim() || !part.surfaceForm.trim() || !part.displayLabel.trim() || !part.commonMeaning.trim()) add(issues, 'root_decoding_guide_invalid', target.targetId, 'Classical parts require complete authored metadata.')
  if (!VALID_ORIGINS.has(part.origin) || !VALID_KINDS.has(part.kind)) add(issues, 'root_decoding_guide_invalid', target.targetId, 'Classical part origin and kind must use supported values.')
  if (!normalize(target.surfaceWord).includes(normalize(part.surfaceForm))) add(issues, 'root_decoding_guide_invalid', target.targetId, `Part ${part.displayLabel} must occur contiguously in the word.`)
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

function countBy(values: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return counts
}
