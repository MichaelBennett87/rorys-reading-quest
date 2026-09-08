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
  projectionVersion: 2
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
  presentation: {
    kind: 'single' | 'paired' | 'fluency'
    instructions?: string
    pairedText?: {
      pairId: string
      pairTitle: string
      members: Array<{
        passageId: string
        label: string
        displayTitle: string
      }>
    }
  }
  teachingBlock?: ContentPackLesson['teachingBlock']
  fluencyPractice?: {
    previewHeading: 'Passage Preview'
    practiceGoal: string
    passageTitle: string
    supportedWords: string[]
    safetyNotice: 'No score. No timer. No microphone.'
    practiceStepsHeading: 'Practice Steps'
    modelReading: {
      heading: 'Hear a Model Read'
      activeStatus: 'Voice is speaking'
      instructions: string
      actions: ['Hear a Model Read', 'Stop Voice']
    }
    phrasePractice: {
      heading: 'Practice by Phrases'
      instructions: string
      phraseGroups: Array<{ text: string; cue?: string }>
      action: 'I Practiced the Phrases'
    }
    repeatedReading: {
      heading: 'Repeated Reading'
      instructions: string
      dynamicProgressLabel: 'Completed reads: [current] / 3'
      actionLabels: ['Read It Once', 'Read It Again']
    }
    reflection: {
      heading: 'Reflection'
      instructions: string
      choices: ['That felt smooth.', 'I needed a few pauses.', 'I want another try.']
    }
    understandingCheck: {
      heading: 'Understanding Check'
      scopeNotice: string
      instructions: string
      action: 'Start Understanding Check'
      lockedMessage: string
    }
  }
  wordHelpAvailability: Array<{
    targetId: string
    passageId: string
    sentenceId: string
    surfaceWord: string
  }>
  trackedAssistance?: {
    kind: 'word_help'
    assistanceTracked: true
    targets: NonNullable<Passage['wordSupportTargets']>
  }
  displayedTexts: Array<{
    passageId: string
    heading: string
    contentKind: Passage['contentKind']
    passageText?: string
    sentences?: Passage['sentences']
    poemStructure?: Passage['poemStructure']
    informationalStructure?: Passage['informationalStructure']
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
    const question = pack?.questions.find((entry) => entry.questionIdentifier === record.questionId)
    const questionPayload = question?.questionContent
    const lesson = pack?.lessons.find((entry) => entry.lessonId === record.lessonIds[0])
    const pairedText = lesson?.pairedTextSetId
      ? pack?.pairedTextSets?.find((entry) => entry.pairId === lesson.pairedTextSetId)
      : undefined
    const displayedPassageIds = pairedText
      ? pairedText.members.map((member) => member.passageId)
      : question
        ? [question.passageIdentifier]
        : []
    const presentationKind = lesson?.fluencyPracticeBlock ? 'fluency' : pairedText ? 'paired' : 'single'
    return {
      projectionVersion: 2,
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
      presentation: {
        kind: presentationKind,
        instructions: pairedText
          ? 'Read both texts. Then compare the important details.'
          : undefined,
        pairedText: pairedText ? {
          pairId: pairedText.pairId,
          pairTitle: pairedText.pairTitle,
          members: pairedText.members.map((member) => ({
            passageId: member.passageId,
            label: member.label,
            displayTitle: member.displayTitle,
          })),
        } : undefined,
      },
      teachingBlock: lesson?.teachingBlock ? cloneLearnerVisible(lesson.teachingBlock) : undefined,
      fluencyPractice: lesson?.fluencyPracticeBlock ? {
        previewHeading: 'Passage Preview',
        practiceGoal: lesson.fluencyPracticeBlock.learnerCue,
        passageTitle: lesson.fluencyPracticeBlock.title ?? record.lessonTitle,
        supportedWords: displayedPassageIds.flatMap((passageId) => passageById.get(passageId)?.wordSupportTargets?.map((target) => target.surfaceWord) ?? []),
        safetyNotice: 'No score. No timer. No microphone.',
        practiceStepsHeading: 'Practice Steps',
        modelReading: {
          heading: 'Hear a Model Read',
          activeStatus: 'Voice is speaking',
          instructions: 'Choose this only when you want to hear the passage read aloud. It is optional.',
          actions: ['Hear a Model Read', 'Stop Voice'],
        },
        phrasePractice: {
          heading: 'Practice by Phrases',
          instructions: 'Read each phrase group smoothly. The cues can help you pause or show expression.',
          phraseGroups: lesson.fluencyPracticeBlock.phraseGroups.map(({ text, cue }) => cue ? { text, cue } : { text }),
          action: 'I Practiced the Phrases',
        },
        repeatedReading: {
          heading: 'Repeated Reading',
          instructions: 'Read the passage again when you are ready. You can do this more than once, up to the practice limit.',
          dynamicProgressLabel: 'Completed reads: [current] / 3',
          actionLabels: ['Read It Once', 'Read It Again'],
        },
        reflection: {
          heading: 'Reflection',
          instructions: 'Choose the one that fits how the reading felt. This is not a score.',
          choices: ['That felt smooth.', 'I needed a few pauses.', 'I want another try.'],
        },
        understandingCheck: {
          heading: 'Understanding Check',
          scopeNotice: 'These questions check what you noticed in the passage. They are not a speaking score.',
          instructions: 'When your practice steps are ready, start the understanding check.',
          action: 'Start Understanding Check',
          lockedMessage: 'Finish phrase practice, rereading, and reflection to unlock the questions. Model listening is optional.',
        },
      } : undefined,
      wordHelpAvailability: displayedPassageIds.flatMap((passageId) => passageById.get(passageId)?.wordSupportTargets?.map((target) => ({
        targetId: target.targetId,
        passageId: target.passageId,
        sentenceId: target.sentenceId,
        surfaceWord: target.surfaceWord,
      })) ?? []),
      trackedAssistance: {
        kind: 'word_help',
        assistanceTracked: true,
        targets: cloneLearnerVisible(
          displayedPassageIds.flatMap((passageId) => passageById.get(passageId)?.wordSupportTargets ?? []),
        ),
      },
      displayedTexts: displayedPassageIds.flatMap((passageId) => {
        const passage = passageById.get(passageId)
        if (!passage) return []
        const pairMember = pairedText?.members.find((member) => member.passageId === passageId)
        const usePlainPassage = presentationKind === 'fluency' || !passage.contentKind || passage.contentKind === 'prose'
        return [{
          passageId,
          heading: pairMember
            ? `${pairMember.label}: ${pairMember.displayTitle}`
            : lesson?.fluencyPracticeBlock?.title ?? 'Reading Passage',
          contentKind: passage.contentKind,
          passageText: usePlainPassage ? passage.passageText : undefined,
          sentences: (usePlainPassage || passage.contentKind === 'informational') && passage.sentences
            ? cloneLearnerVisible(passage.sentences)
            : undefined,
          poemStructure: presentationKind !== 'fluency' && passage.contentKind === 'poem' && passage.poemStructure
            ? cloneLearnerVisible(passage.poemStructure)
            : undefined,
          informationalStructure: presentationKind !== 'fluency' && passage.contentKind === 'informational' && passage.informationalStructure
            ? cloneLearnerVisible(passage.informationalStructure)
            : undefined,
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

function cloneLearnerVisible<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneLearnerVisible(entry)) as T
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !['selectedForContext', 'reviewStatus', 'contentVersion', 'sourceReference'].includes(key))
        .map(([key, entry]) => [key, cloneLearnerVisible(entry)]),
    ) as T
  }
  return value
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
