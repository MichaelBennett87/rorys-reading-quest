import type { ContentPack, ContentPackLesson } from './packs/contentPackTypes'
import type { Passage, QuestionContentPayload, ReadingQuestion } from './types'

export interface QuestionTruthVisibleChoice {
  id: string
  text: string
  context: 'choice' | 'segment' | 'part_a' | 'part_b' | 'table_option'
  rowId?: string
}

export type AuthoredCorrectAnswerRepresentation =
  | { kind: 'choice_ids'; ids: string[] }
  | { kind: 'segment_ids'; ids: string[] }
  | { kind: 'evidence_pair'; partAChoiceId: string; partBChoiceId: string }
  | { kind: 'table_mapping'; mappings: Record<string, string> }

export interface ActiveQuestionTruthRecord {
  packId: string
  contentVersion: string
  gradeBand: number
  benchmarkReferences: string[]
  questionBenchmarkReference: string
  worldId: string
  unitId: string
  skillId: string
  lessonIds: string[]
  lessonTitle: string
  lessonObjective: string
  lessonRole: string
  difficulty: number
  passageIds: string[]
  questionId: string
  questionType: string
  prompt: string
  visibleAnswerChoices: QuestionTruthVisibleChoice[]
  evidenceReferenceIds: string[]
  explanation: string
  authoredCorrectAnswerRepresentation: AuthoredCorrectAnswerRepresentation
  evaluatorPayloadContract: string
  contentFingerprint: string
}

export interface QuestionTruthInventoryIssue {
  code:
    | 'duplicate_question_id'
    | 'question_owner_count_mismatch'
    | 'question_lesson_declaration_mismatch'
    | 'question_passage_ownership_mismatch'
    | 'question_content_version_mismatch'
    | 'missing_question_payload'
  packId: string
  questionId: string
  message: string
}

export interface ActiveQuestionTruthInventory {
  records: ActiveQuestionTruthRecord[]
  issues: QuestionTruthInventoryIssue[]
}

export interface BlindQuestionTruthProjection {
  packId: string
  contentVersion: string
  gradeBand: number
  benchmarkReferences: string[]
  worldId: string
  unitId: string
  skillId: string
  lessonIds: string[]
  lessonTitle: string
  lessonObjective: string
  lessonRole: string
  difficulty: number
  displayedTexts: Array<{
    passageId: string
    readingContext: string
    contentKind: Passage['contentKind']
    passageText: string
    sentences: Passage['sentences']
    poemStructure: Passage['poemStructure']
    informationalStructure: Passage['informationalStructure']
  }>
  questionId: string
  questionType: string
  prompt: string
  visibleSubprompts: string[]
  visibleAnswerChoices: QuestionTruthVisibleChoice[]
}

export function buildActiveQuestionTruthInventory(packs: readonly ContentPack[]): ActiveQuestionTruthInventory {
  const activePacks = packs.filter((pack) => !pack.manifest.packId.startsWith('legacy-'))
  const records: ActiveQuestionTruthRecord[] = []
  const issues: QuestionTruthInventoryIssue[] = []
  const globalQuestionIds = new Set<string>()

  for (const pack of activePacks) {
    const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
    const passagesById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
    for (const question of pack.questions) {
      if (globalQuestionIds.has(question.questionIdentifier)) {
        issues.push(inventoryIssue(pack, question, 'duplicate_question_id', 'Active question ID is not globally unique.'))
      }
      globalQuestionIds.add(question.questionIdentifier)

      const owners = activeLessons.filter((lesson) => lesson.questionIdentifiers.includes(question.questionIdentifier))
      if (owners.length !== 1) {
        issues.push(inventoryIssue(
          pack,
          question,
          'question_owner_count_mismatch',
          `Expected exactly one active owning lesson; found ${owners.length}.`,
        ))
      }
      const owner = owners[0]
      if (!owner || !question.questionContent) {
        if (!question.questionContent) {
          issues.push(inventoryIssue(pack, question, 'missing_question_payload', 'Active question has no evaluator payload.'))
        }
        continue
      }
      if (question.lessonIdentifier !== owner.lessonId) {
        issues.push(inventoryIssue(pack, question, 'question_lesson_declaration_mismatch', 'Declared lesson does not match registry ownership.'))
      }
      if (!owner.passageIdentifiers.includes(question.passageIdentifier)) {
        issues.push(inventoryIssue(pack, question, 'question_passage_ownership_mismatch', 'Question passage is outside the owning lesson.'))
      }
      if (question.contentVersion !== owner.contentVersion || question.contentVersion !== pack.manifest.contentVersion) {
        issues.push(inventoryIssue(pack, question, 'question_content_version_mismatch', 'Question, lesson, and pack versions must match.'))
      }

      const passageRecords = owner.passageIdentifiers
        .map((passageId) => passagesById.get(passageId))
        .filter((passage): passage is Passage => Boolean(passage))
      records.push(buildRecord(pack, owner, passageRecords, question, question.questionContent))
    }
  }

  return { records, issues }
}

export function buildBlindQuestionTruthProjection(packs: readonly ContentPack[]): BlindQuestionTruthProjection[] {
  const inventory = buildActiveQuestionTruthInventory(packs)
  const packsById = new Map(packs.map((pack) => [pack.manifest.packId, pack] as const))
  return inventory.records.map((record) => {
    const pack = packsById.get(record.packId)
    const passageById = new Map(pack?.passages.map((passage) => [passage.passageIdentifier, passage] as const) ?? [])
    const questionPayload = pack?.questions.find((question) => question.questionIdentifier === record.questionId)?.questionContent
    return {
      packId: record.packId,
      contentVersion: record.contentVersion,
      gradeBand: record.gradeBand,
      benchmarkReferences: [...record.benchmarkReferences],
      worldId: record.worldId,
      unitId: record.unitId,
      skillId: record.skillId,
      lessonIds: [...record.lessonIds],
      lessonTitle: record.lessonTitle,
      lessonObjective: record.lessonObjective,
      lessonRole: record.lessonRole,
      difficulty: record.difficulty,
      displayedTexts: record.passageIds.flatMap((passageId) => {
        const passage = passageById.get(passageId)
        if (!passage) return []
        return [{
          passageId,
          readingContext: passage.readingContext,
          contentKind: passage.contentKind,
          passageText: passage.passageText,
          sentences: passage.sentences ? structuredClone(passage.sentences) : undefined,
          poemStructure: passage.poemStructure ? structuredClone(passage.poemStructure) : undefined,
          informationalStructure: passage.informationalStructure ? structuredClone(passage.informationalStructure) : undefined,
        }]
      }),
      questionId: record.questionId,
      questionType: record.questionType,
      prompt: record.prompt,
      visibleSubprompts: getVisibleSubprompts(questionPayload),
      visibleAnswerChoices: structuredClone(record.visibleAnswerChoices),
    }
  })
}

function getVisibleSubprompts(payload: QuestionContentPayload | undefined): string[] {
  if (!payload) return []
  if (payload.type === 'two_part') return [payload.partAPrompt, payload.partBPrompt]
  if (payload.type === 'table_match') return payload.rows.map((row) => row.prompt)
  return []
}

export function buildQuestionContentFingerprint(input: {
  pack: ContentPack
  lesson: ContentPackLesson
  passages: readonly Passage[]
  question: ReadingQuestion
}): string {
  const serialized = stableStringify({
    pack: {
      packId: input.pack.manifest.packId,
      contentVersion: input.pack.manifest.contentVersion,
      gradeBand: input.pack.manifest.gradeBand,
      benchmarkReferences: input.pack.manifest.benchmarkReferences,
    },
    lesson: input.lesson,
    passages: input.passages,
    question: input.question,
  })
  return `qta-v1-${fnv1a(serialized, 0x811c9dc5)}${fnv1a(serialized, 0x9e3779b9)}`
}

function buildRecord(
  pack: ContentPack,
  owner: ContentPackLesson,
  passages: Passage[],
  question: ReadingQuestion,
  payload: QuestionContentPayload,
): ActiveQuestionTruthRecord {
  return {
    packId: pack.manifest.packId,
    contentVersion: question.contentVersion,
    gradeBand: question.gradeBand,
    benchmarkReferences: [...pack.manifest.benchmarkReferences],
    questionBenchmarkReference: question.benchmarkReference,
    worldId: pack.manifest.worldId,
    unitId: owner.unitId,
    skillId: question.skillIdentifier,
    lessonIds: [owner.lessonId],
    lessonTitle: owner.lessonTitle,
    lessonObjective: owner.lessonObjective,
    lessonRole: owner.lessonRole,
    difficulty: question.difficulty,
    passageIds: [...owner.passageIdentifiers],
    questionId: question.questionIdentifier,
    questionType: question.questionType,
    prompt: question.prompt,
    visibleAnswerChoices: getVisibleChoices(payload),
    evidenceReferenceIds: [...(question.evidenceReferenceIds ?? [])],
    explanation: question.explanation ?? '',
    authoredCorrectAnswerRepresentation: getCorrectAnswerRepresentation(payload),
    evaluatorPayloadContract: getEvaluatorPayloadContract(payload),
    contentFingerprint: buildQuestionContentFingerprint({ pack, lesson: owner, passages, question }),
  }
}

function getVisibleChoices(payload: QuestionContentPayload): QuestionTruthVisibleChoice[] {
  if (payload.type === 'multiple_choice' || payload.type === 'multi_select') {
    return payload.choices.map((choice) => ({ ...choice, context: 'choice' }))
  }
  if (payload.type === 'hot_text') {
    return payload.selectableSegments.map((segment) => ({ ...segment, context: 'segment' }))
  }
  if (payload.type === 'two_part') {
    return [
      ...payload.partAChoices.map((choice) => ({ ...choice, context: 'part_a' as const })),
      ...payload.partBChoices.map((choice) => ({ ...choice, context: 'part_b' as const })),
    ]
  }
  return payload.rows.flatMap((row) => row.options.map((option) => ({
    ...option,
    context: 'table_option' as const,
    rowId: row.id,
  })))
}

function getCorrectAnswerRepresentation(payload: QuestionContentPayload): AuthoredCorrectAnswerRepresentation {
  if (payload.type === 'multiple_choice' || payload.type === 'multi_select') {
    return { kind: 'choice_ids', ids: [...payload.correctChoiceIds] }
  }
  if (payload.type === 'hot_text') return { kind: 'segment_ids', ids: [...payload.correctSegmentIds] }
  if (payload.type === 'two_part') {
    return {
      kind: 'evidence_pair',
      partAChoiceId: payload.partACorrectChoiceId,
      partBChoiceId: payload.partBCorrectChoiceId,
    }
  }
  return {
    kind: 'table_mapping',
    mappings: Object.fromEntries(payload.rows.map((row) => [row.id, row.correctChoiceId])),
  }
}

function getEvaluatorPayloadContract(payload: QuestionContentPayload): string {
  switch (payload.type) {
    case 'multiple_choice': return '{ selectedChoiceId: string }'
    case 'multi_select': return '{ selectedChoiceIds: string[] } exact unordered set'
    case 'hot_text': return '{ selectedSegmentIds: string[] } exact unordered set'
    case 'two_part': return '{ partAChoiceId: string, partBChoiceId: string } both required'
    case 'table_match': return '{ selectedMappings: Record<rowId, choiceId> } exact complete mapping'
  }
}

function inventoryIssue(
  pack: ContentPack,
  question: ReadingQuestion,
  code: QuestionTruthInventoryIssue['code'],
  message: string,
): QuestionTruthInventoryIssue {
  return { code, packId: pack.manifest.packId, questionId: question.questionIdentifier, message }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function fnv1a(value: string, seed: number): string {
  let hash = seed >>> 0
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
