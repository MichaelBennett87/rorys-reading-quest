import { resolvePassageEvidence } from '../evidence'
import type {
  AcademicSubjectContext,
  ContentPack,
  ContentPackAuditIssue,
  Grade3AcademicPartOfSpeech,
  Grade3AcademicVocabularyGuide,
  Grade3AcademicVocabularyTarget,
} from './contentPackTypes'

const PACK_ID = 'g3-context-cavern-academic-word-workshop'
const VERSION = 'g3-cc-academic-word-r0.1.0'
const BENCHMARK = 'ELA.3.V.1.1'
const EXPECTED_PATTERNS = new Set([
  'grade-level-academic-vocabulary',
  'appropriate-use',
  'speaking-writing-support',
  'no-open-response-scoring',
])
const EXPECTED_WORD_PARTS = new Map<string, Grade3AcademicPartOfSpeech>([
  ['analyze', 'verb'], ['evidence', 'noun'], ['conclude', 'verb'], ['accurate', 'adjective'],
  ['estimate', 'verb'], ['represent', 'verb'], ['determine', 'verb'], ['justify', 'verb'],
  ['infer', 'verb'], ['interpret', 'verb'], ['summarize', 'verb'], ['support', 'verb'],
  ['revise', 'verb'], ['clarify', 'verb'], ['organize', 'verb'], ['structure', 'noun'],
  ['contrast', 'verb'], ['relationship', 'noun'], ['relevant', 'adjective'], ['respond', 'verb'],
  ['investigate', 'verb'], ['method', 'noun'], ['process', 'noun'], ['factor', 'noun'],
  ['classify', 'verb'], ['select', 'verb'], ['demonstrate', 'verb'], ['outcome', 'noun'],
])
const SUBJECTS = new Set<AcademicSubjectContext>([
  'reading', 'writing', 'science', 'mathematics', 'social-studies', 'engineering', 'project-presentation',
])

export function buildGrade3AcademicVocabularyGuideAudit(pack: ContentPack): ContentPackAuditIssue[] {
  if (pack.manifest.packId !== PACK_ID) return []
  const issues: ContentPackAuditIssue[] = []
  const guides = pack.grade3AcademicVocabularyGuides ?? []
  if (guides.length === 0) {
    add(issues, 'missing_grade3_academic_vocabulary_guide', PACK_ID, 'Academic Word Workshop Grade 3 requires authored Grade 3 academic-vocabulary guides.')
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
      add(issues, 'missing_grade3_academic_vocabulary_guide', guide.passageId, 'Each guide must resolve to one unique passage in this pack.')
      continue
    }
    seenPassages.add(guide.passageId)
    validateGuide(pack, guide, passage, seenTargetIds, seenWords, issues)
  }

  for (const passage of pack.passages) {
    if (!seenPassages.has(passage.passageIdentifier)) {
      add(issues, 'missing_grade3_academic_vocabulary_guide', passage.passageIdentifier, 'Every Academic Word Workshop passage requires exactly one Grade 3 guide.')
    }
  }
  if (seenWords.size !== 28 || [...EXPECTED_WORD_PARTS.keys()].some((word) => !seenWords.has(word))) {
    invalid(issues, PACK_ID, 'The pack must use the exact 28-word Grade 3 academic vocabulary inventory once each.')
  }
  return issues
}

function validatePackShape(
  pack: ContentPack,
  guides: readonly Grade3AcademicVocabularyGuide[],
  issues: ContentPackAuditIssue[],
) {
  const supportCount = pack.passages.reduce((sum, passage) => sum + (passage.wordSupportTargets?.length ?? 0), 0)
  const questionTypeCounts = new Map<string, number>()
  for (const question of pack.questions) questionTypeCounts.set(question.questionType, (questionTypeCounts.get(question.questionType) ?? 0) + 1)
  const expectedQuestionTypes = new Map([
    ['multiple_choice', 17], ['multi_select', 7], ['hot_text', 7], ['table_match', 7], ['two_part', 3],
  ])
  const identityIsValid = pack.manifest.gradeBand === 3
    && pack.manifest.worldId === 'context-cavern'
    && pack.manifest.unitId === 'g3-cc-unit-1'
    && pack.manifest.primarySkillId === 'g3-context-cavern-vocabulary'
    && pack.manifest.contentVersion === VERSION
    && pack.manifest.coverageKind === 'supportive_practice'
    && pack.manifest.benchmarkReferences.length === 0
    && pack.manifest.supportingBenchmarkReferences?.includes(BENCHMARK) === true
  if (!identityIsValid) invalid(issues, PACK_ID, 'Pack identity must remain Grade 3 Context Cavern Unit 1 supportive practice for ELA.3.V.1.1.')
  if (pack.manifest.coveredPatterns.length !== EXPECTED_PATTERNS.size || pack.manifest.coveredPatterns.some((pattern) => !EXPECTED_PATTERNS.has(pattern))) {
    add(issues, 'academic_vocabulary_scope_drift', PACK_ID, 'The pack must cover only the four bounded ELA.3.V.1.1 supportive-practice patterns.')
  }
  if (pack.lessons.length !== 7 || pack.passages.length !== 7 || guides.length !== 7 || pack.questions.length !== 41 || supportCount !== 28) {
    invalid(issues, PACK_ID, 'The pack requires exactly 7 lessons, 7 passages, 7 guides, 41 questions, and 28 support targets.')
  }
  for (const [type, expected] of expectedQuestionTypes) {
    if ((questionTypeCounts.get(type) ?? 0) !== expected) invalid(issues, PACK_ID, `The pack requires exactly ${expected} ${type} questions.`)
  }
  const powerUps = pack.lessons.filter((lesson) => lesson.difficulty === 0 && lesson.lessonRole === 'GUIDED_PRACTICE')
  const guided = pack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')
  const checkpoints = pack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'CHECKPOINT')
  if (powerUps.length !== 2 || guided.length !== 2 || checkpoints.length !== 3) {
    invalid(issues, PACK_ID, 'Lesson roles must be two difficulty-0 power-ups, two difficulty-1 guided lessons, and three difficulty-1 checkpoints.')
  }
}

function validateGuide(
  pack: ContentPack,
  guide: Grade3AcademicVocabularyGuide,
  passage: ContentPack['passages'][number],
  seenTargetIds: Set<string>,
  seenWords: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  if (guide.targets.length !== 4 || (passage.wordSupportTargets?.length ?? 0) !== 4) {
    invalid(issues, guide.passageId, 'Each passage requires exactly four guide targets and four Word Help targets.')
  }
  if (guide.supportivePracticeOnly !== true || guide.openResponseScoring !== false || guide.oralScoring !== false) {
    add(issues, 'academic_open_response_scope_violation', guide.passageId, 'The guide must remain supportive practice with open-response and oral scoring disabled.')
  }
  if (guide.reviewStatus !== 'DRAFT' || guide.contentVersion !== VERSION || guide.contentVersion !== pack.manifest.contentVersion) {
    invalid(issues, guide.passageId, 'Guides must remain DRAFT and match the pack content version.')
  }
  for (const target of guide.targets) validateTarget(target, passage, seenTargetIds, seenWords, issues)
}

function validateTarget(
  target: Grade3AcademicVocabularyTarget,
  passage: ContentPack['passages'][number],
  seenTargetIds: Set<string>,
  seenWords: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  const word = target.word.toLowerCase().trim()
  if (!target.targetId.trim() || seenTargetIds.has(target.targetId) || seenWords.has(word)) {
    invalid(issues, target.targetId || word, 'Target IDs and target words must be globally unique in the pack.')
  }
  seenTargetIds.add(target.targetId)
  seenWords.add(word)
  const expectedPart = EXPECTED_WORD_PARTS.get(word)
  if (!expectedPart || target.partOfSpeech !== expectedPart) {
    add(issues, 'academic_part_of_speech_mismatch', target.targetId, 'The target part of speech must match its authored Grade 3 source use.')
  }
  if (new Set(target.subjectContexts.filter((context) => SUBJECTS.has(context))).size < 2) {
    add(issues, 'academic_subject_context_insufficient', target.targetId, 'Each target needs at least two approved academic subject contexts.')
  }
  if (!complete(target.childFriendlyMeaning) || unsafe(target.childFriendlyMeaning)) invalid(issues, target.targetId, 'Each target needs a safe, complete child-friendly meaning.')
  if (target.sourceSentenceIds.length === 0) add(issues, 'academic_word_not_in_source', target.targetId, 'Each target needs source-sentence ownership.')
  for (const sentenceId of target.sourceSentenceIds) {
    const evidence = resolvePassageEvidence(passage, sentenceId)
    if (!evidence || !containsWord(evidence.text, word)) add(issues, 'academic_word_not_in_source', target.targetId, 'The complete target word must appear in every referenced learner-visible source sentence.')
  }
  const appropriate = [target.speakingFrame, target.writingFrame, ...target.appropriateUseExamples]
  if (target.appropriateUseExamples.length < 2 || appropriate.some((value) => !complete(value) || unsafe(value) || !containsWord(value, word))) {
    add(issues, 'academic_use_example_invalid', target.targetId, 'Speaking, writing, and appropriate-use examples must be safe, complete, and use the target word naturally.')
  }
  if (!complete(target.inappropriateUseExample) || !containsWord(target.inappropriateUseExample, word) || !complete(target.inappropriateUseReason) || unsafe(target.inappropriateUseExample) || unsafe(target.inappropriateUseReason)) {
    add(issues, 'academic_misuse_example_ambiguous', target.targetId, 'Each target needs one clearly explained semantic or grammatical misuse.')
  }
  if (!complete(target.precisionNote) || unsafe(target.precisionNote)) invalid(issues, target.targetId, 'Each target needs a safe precision note distinguishing its academic function.')
}

function containsWord(value: string, word: string): boolean {
  return new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(value)
}

function complete(value: string): boolean { return value.trim().split(/\s+/).length >= 3 }
function unsafe(value: string): boolean { return /<[^>]+>/.test(value) || /https?:\/\//i.test(value) }
function invalid(issues: ContentPackAuditIssue[], itemIdentifier: string, message: string) { add(issues, 'grade3_academic_vocabulary_guide_invalid', itemIdentifier, message) }
function add(issues: ContentPackAuditIssue[], code: ContentPackAuditIssue['code'], itemIdentifier: string, message: string) { issues.push({ code, itemIdentifier, message }) }
