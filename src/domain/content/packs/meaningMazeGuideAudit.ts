import { resolvePassageEvidence } from '../evidence'
import type { InformationalGlossaryFeature, InformationalReferenceFeature } from '../informationalTypes'
import type {
  ContentPack,
  ContentPackAuditIssue,
  MeaningMazeGuide,
  MeaningMazeReferenceEntry,
  MeaningMazeTarget,
} from './contentPackTypes'

const PACK_ID = 'g3-context-cavern-meaning-maze'
const VERSION = 'g3-cc-meaning-maze-r0.1.0'
const EXPECTED_PATTERNS = new Set([
  'context-clues', 'figurative-language', 'word-relationships', 'reference-materials',
  'background-knowledge', 'multiple-meaning-words', 'unknown-words', 'unknown-phrases',
])
const EXPECTED_STRATEGIES: Record<MeaningMazeTarget['primaryStrategy'], number> = {
  'context-clue': 6,
  'word-relationship': 5,
  'reference-material': 5,
  'background-knowledge': 4,
  combined: 8,
}

export function buildMeaningMazeGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const guides = pack.meaningMazeGuides
  if (!guides?.length) {
    return [{
      code: 'missing_meaning_maze_guide',
      itemIdentifier: PACK_ID,
      message: 'Meaning Maze requires authored meaning-strategy guides.',
    }]
  }

  const issues: ContentPackAuditIssue[] = []
  validatePackShape(pack, guides, issues)
  for (const guide of guides) validateGuide(pack, guide, issues)
  validateGlobalDistribution(pack, guides, issues)
  return issues
}

function validatePackShape(pack: ContentPack, guides: readonly MeaningMazeGuide[], issues: ContentPackAuditIssue[]) {
  if (pack.manifest.contentVersion !== VERSION || pack.manifest.unitId !== 'g3-cc-unit-3') invalid(issues, PACK_ID, 'Meaning Maze must use its exact Unit 3 identity and version.')
  if (pack.manifest.gradeBand !== 3 || pack.manifest.primarySkillId !== 'g3-context-cavern-vocabulary') invalid(issues, PACK_ID, 'Meaning Maze must remain Grade 3 Context Cavern content.')
  if (pack.manifest.coverageKind !== 'benchmark' || !pack.manifest.benchmarkReferences.includes('ELA.3.V.1.3')) invalid(issues, PACK_ID, 'Meaning Maze must provide benchmark coverage for ELA.3.V.1.3.')
  if (pack.manifest.coveredPatterns.length !== EXPECTED_PATTERNS.size || pack.manifest.coveredPatterns.some((pattern) => !EXPECTED_PATTERNS.has(pattern))) invalid(issues, PACK_ID, 'Meaning Maze must claim exactly the eight ELA.3.V.1.3 patterns.')
  if (pack.passages.length !== 7 || guides.length !== 7) invalid(issues, PACK_ID, 'Meaning Maze requires exactly seven sources and seven guides.')
  if (pack.lessons.length !== 7 || pack.questions.length !== 41) invalid(issues, PACK_ID, 'Meaning Maze requires exactly seven lessons and 41 questions.')
  if (pack.passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0) !== 28) invalid(issues, PACK_ID, 'Meaning Maze requires exactly 28 Word Help targets.')
}

function validateGuide(pack: ContentPack, guide: MeaningMazeGuide, issues: ContentPackAuditIssue[]) {
  const passage = pack.passages.find((candidate) => candidate.passageIdentifier === guide.passageId)
  if (!passage) {
    invalid(issues, guide.passageId, 'The guide passage ID must resolve to an authored source.')
    return
  }
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== VERSION || guide.targets.length !== 4) invalid(issues, guide.passageId, 'Each guide needs four DRAFT targets at the pack version.')
  if (!complete(guide.strategySummary) || unsafe(guide.strategySummary)) invalid(issues, guide.passageId, 'The guide needs safe, complete strategy language.')

  const referenceIds = new Set<string>()
  for (const entry of guide.referenceEntries) {
    if (referenceIds.has(entry.referenceId)) add(issues, 'reference_entry_invalid', entry.referenceId, 'Reference IDs must be unique within a source.')
    referenceIds.add(entry.referenceId)
    validateReferenceEntry(passage, entry, issues)
  }

  for (const target of guide.targets) validateTarget(passage, guide, target, issues)
}

function validateReferenceEntry(
  passage: ContentPack['passages'][number],
  entry: MeaningMazeReferenceEntry,
  issues: ContentPackAuditIssue[],
) {
  if (!entry.referenceId.trim() || !entry.headword.trim() || !entry.senses.length || unsafe(JSON.stringify(entry))) {
    add(issues, 'reference_entry_invalid', entry.referenceId || passage.passageIdentifier, 'Reference entries need stable local IDs, a headword, safe senses, and no remote content.')
    return
  }
  if (entry.senses.some((sense) => !sense.senseId.trim() || !sense.meaning.trim() || !sense.evidenceIds.length || sense.evidenceIds.some((id) => !resolvePassageEvidence(passage, id)))) add(issues, 'reference_entry_invalid', entry.referenceId, 'Every reference sense needs accurate source-owned evidence.')
  if (entry.kind === 'thesaurus' && !(entry.relatedWords?.length)) add(issues, 'reference_entry_invalid', entry.referenceId, 'Thesaurus entries require authored related words.')

  if (entry.kind === 'glossary') {
    const glossary = passage.informationalStructure?.features.find((feature): feature is InformationalGlossaryFeature => feature.kind === 'glossary')
    const visible = glossary?.entries.find((candidate) => candidate.entryId === entry.referenceId)
    if (!visible || normalize(visible.term) !== normalize(entry.headword)) add(issues, 'reference_entry_missing', entry.referenceId, 'Glossary references must resolve to a learner-visible glossary entry.')
    return
  }

  const feature = passage.informationalStructure?.features.find((candidate): candidate is InformationalReferenceFeature => candidate.kind === 'reference' && candidate.featureId === entry.referenceId)
  if (!feature || feature.referenceKind !== entry.kind || normalize(feature.headword) !== normalize(entry.headword)) add(issues, 'reference_entry_missing', entry.referenceId, 'Dictionary and thesaurus references must resolve to a matching learner-visible card.')
}

function validateTarget(
  passage: ContentPack['passages'][number],
  guide: MeaningMazeGuide,
  target: MeaningMazeTarget,
  issues: ContentPackAuditIssue[],
) {
  const source = passage.passageText
  const appears = target.targetForm === 'phrase' ? normalize(source).includes(normalize(target.targetText)) : containsWord(source, target.targetText)
  if (!appears) add(issues, target.targetForm === 'phrase' ? 'meaning_phrase_not_contiguous' : 'meaning_target_not_in_source', target.targetId, 'The target must appear exactly in learner-visible source text.')
  if (!target.sourceEvidenceIds.length || !target.contextEvidenceIds.length || [...target.sourceEvidenceIds, ...target.contextEvidenceIds].some((id) => !resolvePassageEvidence(passage, id))) add(issues, target.targetForm === 'phrase' ? 'unknown_phrase_meaning_unsupported' : 'unknown_word_meaning_unsupported', target.targetId, 'Every target needs resolvable source and context evidence.')
  if (!target.targetId.trim() || !target.intendedMeaning.trim() || !complete(target.strategyExplanation) || !complete(target.confirmationStatement) || unsafe(JSON.stringify(target))) invalid(issues, target.targetId, 'Targets need stable IDs, accurate meanings, safe explanations, and complete confirmation statements.')
  if (new Set(target.secondaryStrategies).size !== target.secondaryStrategies.length || target.secondaryStrategies.includes(target.primaryStrategy)) invalid(issues, target.targetId, 'Secondary strategies must be distinct from one another and from the primary strategy.')
  if (target.primaryStrategy === 'combined' && target.secondaryStrategies.length < 2) add(issues, 'combined_strategy_incomplete', target.targetId, 'Combined targets require at least two explicit supporting strategies.')
  if (target.contextClueKind && !['definition', 'restatement', 'example', 'contrast', 'cause-effect'].includes(target.contextClueKind)) add(issues, 'context_clue_kind_mismatch', target.targetId, 'Context clue kinds must use the bounded Grade 3 set.')
  if (target.relationshipKind && (!(target.relatedWords?.length) || !['synonym', 'antonym', 'category-member', 'part-whole', 'object-function'].includes(target.relationshipKind))) add(issues, 'word_relationship_mismatch', target.targetId, 'Relationship targets need a bounded kind and useful related words.')
  if (target.referenceEntryIds?.some((id) => !guide.referenceEntries.some((entry) => entry.referenceId === id))) add(issues, 'reference_entry_missing', target.targetId, 'Every target reference ID must resolve inside its guide.')
  if (target.primaryStrategy === 'reference-material' && !target.referenceEntryIds?.length) add(issues, 'reference_entry_missing', target.targetId, 'Reference-material targets require a local learner-visible entry.')
  if (target.primaryStrategy === 'background-knowledge' && !complete(target.backgroundKnowledgeStatement ?? '')) add(issues, 'background_knowledge_unsupported', target.targetId, 'Background knowledge must be explicit and context-supported.')
  if (target.challengeKind === 'multiple-meaning') {
    const senses = target.alternateMeanings ?? []
    if (senses.length < 2 || senses.filter((sense) => sense.selectedForContext).length !== 1) add(issues, 'multiple_meaning_sense_ambiguous', target.targetId, 'Multiple-meaning targets need at least two genuine senses and exactly one contextual selection.')
  }
  if (target.challengeKind === 'figurative') {
    if (target.targetForm !== 'phrase' || !target.literalReading?.trim()) add(issues, 'figurative_phrase_meaning_ambiguous', target.targetId, 'Figurative targets require a contiguous phrase plus literal and intended readings.')
    if (/metaphor|personification|hyperbole|simile/i.test(target.strategyExplanation)) add(issues, 'figurative_phrase_scope_drift', target.targetId, 'Meaning Maze must interpret the phrase rather than identify a device label.')
  } else if (target.literalReading) {
    add(issues, 'figurative_phrase_scope_drift', target.targetId, 'Nonfigurative targets must not carry a figurative literal-reading field.')
  }
  if (/prefix|suffix|root|morphem/i.test(target.strategyExplanation)) add(issues, 'root_meaning_scope_drift', target.targetId, 'Meaning Maze cannot make morphemic analysis the primary strategy.')
}

function validateGlobalDistribution(pack: ContentPack, guides: readonly MeaningMazeGuide[], issues: ContentPackAuditIssue[]) {
  const targets = guides.flatMap((guide) => guide.targets)
  const uniqueIds = new Set(targets.map((target) => target.targetId))
  if (targets.length !== 28 || uniqueIds.size !== 28) invalid(issues, PACK_ID, 'Meaning Maze requires exactly 28 unique targets.')
  const count = (predicate: (target: MeaningMazeTarget) => boolean) => targets.filter(predicate).length
  if (count((target) => target.targetForm === 'word') !== 20 || count((target) => target.targetForm === 'phrase') !== 8) invalid(issues, PACK_ID, 'Target forms must total 20 words and eight phrases.')
  if (count((target) => target.challengeKind === 'unfamiliar' && target.targetForm === 'word') !== 14 || count((target) => target.challengeKind === 'multiple-meaning') !== 6 || count((target) => target.challengeKind === 'figurative') !== 5 || count((target) => target.challengeKind === 'unfamiliar' && target.targetForm === 'phrase') !== 3) invalid(issues, PACK_ID, 'Target challenge distribution must be 14 unfamiliar words, six multiple-meaning words, five figurative phrases, and three unfamiliar phrases.')
  for (const [strategy, expected] of Object.entries(EXPECTED_STRATEGIES)) if (count((target) => target.primaryStrategy === strategy) !== expected) invalid(issues, PACK_ID, `Primary strategy ${strategy} must appear ${expected} times.`)
  for (const clueKind of ['definition', 'restatement', 'example', 'contrast', 'cause-effect'] as const) if (!targets.some((target) => target.contextClueKind === clueKind)) add(issues, 'context_clue_kind_mismatch', PACK_ID, `The pack must represent the ${clueKind} context clue.`)
  for (const relationshipKind of ['synonym', 'antonym', 'category-member', 'part-whole', 'object-function'] as const) if (!targets.some((target) => target.relationshipKind === relationshipKind)) add(issues, 'word_relationship_mismatch', PACK_ID, `The pack must represent the ${relationshipKind} relationship.`)
  const primaryReferenceKinds = targets.filter((target) => target.primaryStrategy === 'reference-material').map((target) => guides.flatMap((guide) => guide.referenceEntries).find((entry) => target.referenceEntryIds?.includes(entry.referenceId))?.kind)
  if (primaryReferenceKinds.filter((kind) => kind === 'glossary').length !== 2 || primaryReferenceKinds.filter((kind) => kind === 'dictionary').length !== 2 || primaryReferenceKinds.filter((kind) => kind === 'thesaurus').length !== 1) add(issues, 'reference_entry_invalid', PACK_ID, 'Primary reference targets must use two glossary, two dictionary, and one thesaurus entry.')
  const kinds = pack.passages.reduce<Record<string, number>>((counts, passage) => ({ ...counts, [passage.contentKind ?? 'prose']: (counts[passage.contentKind ?? 'prose'] ?? 0) + 1 }), {})
  if (kinds.informational !== 4 || kinds.prose !== 2 || kinds.poem !== 1) invalid(issues, PACK_ID, 'Sources must include four informational texts, two literary prose texts, and one poem.')
}

function containsWord(value: string, word: string): boolean {
  return new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(value)
}

function normalize(value: string): string { return value.toLowerCase().trim().replace(/\s+/g, ' ') }
function complete(value: string): boolean { return value.trim().split(/\s+/).length >= 3 }
function unsafe(value: string): boolean { return /<[^>]+>/.test(value) || /https?:\/\//i.test(value) }
function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'meaning_maze_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
