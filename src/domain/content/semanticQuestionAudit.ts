import { parseScopedEvidenceReference, resolveLessonEvidence } from './evidence'
import type { ContentPack } from './packs/contentPackTypes'
import type { ContentSample, Passage, QuestionContentPayload, ReadingQuestion } from './types'

export type SemanticQuestionAuditIssueCode =
  | 'lesson_question_ownership_mismatch'
  | 'lesson_passage_ownership_mismatch'
  | 'question_passage_ownership_mismatch'
  | 'hot_text_source_mismatch'
  | 'evidence_passage_mismatch'
  | 'unresolved_evidence_reference'
  | 'keyed_answer_missing'
  | 'incorrect_selection_cardinality'
  | 'explanation_answer_mismatch'
  | 'explanation_evidence_mismatch'
  | 'stale_ordinal_explanation'
  | 'paired_text_scope_mismatch'
  | 'retell_piece_ownership_mismatch'
  | 'duplicate_visible_choice_text'
  | 'prompt_answer_leakage'

export interface SemanticQuestionAuditIssue {
  code: SemanticQuestionAuditIssueCode
  questionIdentifier: string
  message: string
}

export interface SemanticQuestionAuditReport {
  reviewedCount: number
  reviewedPackCount: number
  reviewedLessonCount: number
  issues: SemanticQuestionAuditIssue[]
}

export function auditSemanticQuestionPacks(packs: readonly ContentPack[]): SemanticQuestionAuditReport {
  const activePacks = packs.filter((pack) => !pack.manifest.packId.startsWith('legacy-'))
  const issues: SemanticQuestionAuditIssue[] = []

  for (const pack of activePacks) {
    auditPack(pack, issues)
  }

  return buildReport(
    activePacks.reduce((count, pack) => count + pack.questions.length, 0),
    activePacks.length,
    activePacks.reduce((count, pack) => count + pack.lessons.length, 0),
    issues,
  )
}

export function auditSemanticQuestionContent(content: ContentSample): SemanticQuestionAuditReport {
  const issues: SemanticQuestionAuditIssue[] = []
  const passagesById = new Map(content.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  for (const question of content.questions) {
    auditQuestion(question, [], passagesById, false, issues)
  }
  return buildReport(content.questions.length, 0, 0, issues)
}

function auditPack(pack: ContentPack, issues: SemanticQuestionAuditIssue[]) {
  const passagesById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const questionsById = new Map(pack.questions.map((question) => [question.questionIdentifier, question] as const))
  const lessonsById = new Map(pack.lessons.map((lesson) => [lesson.lessonId, lesson] as const))
  const pairedSetsById = new Map((pack.pairedTextSets ?? []).map((pair) => [pair.pairId, pair] as const))

  for (const lesson of pack.lessons) {
    const missingPassageIds = lesson.passageIdentifiers.filter((passageId) => !passagesById.has(passageId))
    if (missingPassageIds.length > 0) {
      issues.push(issue(
        'lesson_passage_ownership_mismatch',
        lesson.lessonId,
        `Lesson references passage(s) outside its pack: ${missingPassageIds.join(', ')}.`,
      ))
    }

    if (lesson.pairedTextSetId) {
      const pair = pairedSetsById.get(lesson.pairedTextSetId)
      const memberIds = pair?.members.map((member) => member.passageId) ?? []
      if (!pair || !sameOrderedValues(memberIds, lesson.passageIdentifiers)) {
        issues.push(issue(
          'lesson_passage_ownership_mismatch',
          lesson.lessonId,
          'Paired lesson passage ownership must match its paired-text members in order.',
        ))
      }
    }

    for (const questionId of lesson.questionIdentifiers) {
      const question = questionsById.get(questionId)
      if (!question || question.lessonIdentifier !== lesson.lessonId) {
        issues.push(issue(
          'lesson_question_ownership_mismatch',
          questionId,
          `Question must identify owning lesson ${lesson.lessonId}.`,
        ))
        continue
      }
      auditQuestion(question, lesson.passageIdentifiers, passagesById, Boolean(lesson.pairedTextSetId), issues)
    }
  }

  for (const question of pack.questions) {
    const lesson = question.lessonIdentifier ? lessonsById.get(question.lessonIdentifier) : undefined
    if (!lesson || !lesson.questionIdentifiers.includes(question.questionIdentifier)) {
      issues.push(issue(
        'lesson_question_ownership_mismatch',
        question.questionIdentifier,
        'Question is not listed by its declared owning lesson.',
      ))
    }
  }

  for (const guide of pack.retellGuides ?? []) {
    const passage = passagesById.get(guide.passageId)
    for (const piece of guide.retellPieces) {
      const evidenceResolves = passage && piece.evidenceReferenceIds.every((evidenceId) => (
        Boolean(resolveLessonEvidence(passagesById, guide.passageId, evidenceId))
      ))
      if (!passage || !evidenceResolves) {
        issues.push(issue(
          'retell_piece_ownership_mismatch',
          piece.pieceId,
          `Retell piece must resolve entirely inside passage ${guide.passageId}.`,
        ))
      }
    }
  }
}

function auditQuestion(
  question: ReadingQuestion,
  lessonPassageIds: readonly string[],
  passagesById: ReadonlyMap<string, Passage>,
  pairedLesson: boolean,
  issues: SemanticQuestionAuditIssue[],
) {
  if (lessonPassageIds.length > 0 && !lessonPassageIds.includes(question.passageIdentifier)) {
    issues.push(issue(
      'question_passage_ownership_mismatch',
      question.questionIdentifier,
      `Question passage ${question.passageIdentifier} is not owned by its lesson.`,
    ))
  }

  const duplicateChoiceIssue = findDuplicateVisibleChoiceIssue(question)
  if (duplicateChoiceIssue) issues.push(duplicateChoiceIssue)

  const leakageIssue = findPromptAnswerLeakageIssue(question)
  if (leakageIssue) issues.push(leakageIssue)

  const payload = question.questionContent
  if (payload) {
    auditAnswerKeys(question, payload, issues)
    auditExplanationAgainstAnswers(question, payload, issues)
  }

  const lessonPassages = lessonPassageIds
    .map((passageId) => passagesById.get(passageId))
    .filter((passage): passage is Passage => Boolean(passage))
  auditHotTextSource(question, lessonPassages, issues)
  auditEvidence(question, lessonPassageIds, passagesById, pairedLesson, issues)
  auditExplanationEvidence(question, lessonPassages, issues)
  auditOrdinalExplanation(question, lessonPassages, issues)
}

function auditAnswerKeys(
  question: ReadingQuestion,
  payload: QuestionContentPayload,
  issues: SemanticQuestionAuditIssue[],
) {
  const missingKeys: string[] = []

  if (payload.type === 'multiple_choice') {
    const choiceIds = new Set(payload.choices.map((choice) => choice.id))
    missingKeys.push(...payload.correctChoiceIds.filter((choiceId) => !choiceIds.has(choiceId)))
    if (payload.correctChoiceIds.length !== 1 || new Set(payload.correctChoiceIds).size !== payload.correctChoiceIds.length) {
      issues.push(issue('incorrect_selection_cardinality', question.questionIdentifier, 'Multiple-choice questions require one unique keyed answer.'))
    }
  }

  if (payload.type === 'multi_select') {
    const choiceIds = new Set(payload.choices.map((choice) => choice.id))
    missingKeys.push(...payload.correctChoiceIds.filter((choiceId) => !choiceIds.has(choiceId)))
    const expectedCount = extractExpectedSelectionCount(question.prompt)
    if (
      payload.correctChoiceIds.length === 0
      || new Set(payload.correctChoiceIds).size !== payload.correctChoiceIds.length
      || (payload.allowMultiple === false && payload.correctChoiceIds.length > 1)
      || (expectedCount !== null && expectedCount !== payload.correctChoiceIds.length)
    ) {
      issues.push(issue('incorrect_selection_cardinality', question.questionIdentifier, 'Multiselect instructions and keyed-answer count must agree.'))
    }
  }

  if (payload.type === 'hot_text') {
    const segmentIds = new Set(payload.selectableSegments.map((segment) => segment.id))
    missingKeys.push(...payload.correctSegmentIds.filter((segmentId) => !segmentIds.has(segmentId)))
    if (payload.correctSegmentIds.length === 0 || new Set(payload.correctSegmentIds).size !== payload.correctSegmentIds.length) {
      issues.push(issue('incorrect_selection_cardinality', question.questionIdentifier, 'Hot-text questions require at least one unique keyed segment.'))
    }
  }

  if (payload.type === 'two_part') {
    if (!payload.partAChoices.some((choice) => choice.id === payload.partACorrectChoiceId)) missingKeys.push(payload.partACorrectChoiceId)
    if (!payload.partBChoices.some((choice) => choice.id === payload.partBCorrectChoiceId)) missingKeys.push(payload.partBCorrectChoiceId)
  }

  if (payload.type === 'table_match') {
    for (const row of payload.rows) {
      if (!row.options.some((option) => option.id === row.correctChoiceId)) missingKeys.push(`${row.id}:${row.correctChoiceId}`)
    }
    if (payload.selectionMode === 'use_each_once') {
      const correctIds = payload.rows.map((row) => row.correctChoiceId)
      if (new Set(correctIds).size !== correctIds.length) {
        issues.push(issue('incorrect_selection_cardinality', question.questionIdentifier, 'Use-each-once table rows require unique keyed choices.'))
      }
    }
  }

  if (missingKeys.length > 0) {
    issues.push(issue('keyed_answer_missing', question.questionIdentifier, `Keyed answer(s) do not resolve: ${missingKeys.join(', ')}.`))
  }
}

function auditHotTextSource(
  question: ReadingQuestion,
  lessonPassages: readonly Passage[],
  issues: SemanticQuestionAuditIssue[],
) {
  if (question.questionContent?.type !== 'hot_text' || !/\b(sentence|line)\b/i.test(question.prompt)) return
  const sourceTexts = lessonPassages.flatMap((passage) => collectPassageSourceText(passage))
  const foreignSegments = question.questionContent.selectableSegments.filter((segment) => (
    !sourceTexts.some((sourceText) => containsNormalizedText(sourceText, stripTextMemberLabel(segment.text)))
  ))
  if (foreignSegments.length > 0) {
    issues.push(issue(
      'hot_text_source_mismatch',
      question.questionIdentifier,
      `Hot-text segment(s) are absent from the owning lesson text: ${foreignSegments.map((segment) => segment.id).join(', ')}.`,
    ))
  }
}

function auditEvidence(
  question: ReadingQuestion,
  lessonPassageIds: readonly string[],
  passagesById: ReadonlyMap<string, Passage>,
  pairedLesson: boolean,
  issues: SemanticQuestionAuditIssue[],
) {
  const localIds = new Set(getQuestionContentIds(question.questionContent))
  for (const evidenceId of question.evidenceReferenceIds ?? []) {
    const scoped = parseScopedEvidenceReference(evidenceId)
    if (scoped) {
      if (lessonPassageIds.length > 0 && !lessonPassageIds.includes(scoped.passageId)) {
        issues.push(issue('evidence_passage_mismatch', question.questionIdentifier, `Scoped evidence points outside the lesson: ${evidenceId}.`))
        continue
      }
      if (!resolveLessonEvidence(passagesById, question.passageIdentifier, evidenceId)) {
        issues.push(issue('unresolved_evidence_reference', question.questionIdentifier, `Scoped evidence does not resolve: ${evidenceId}.`))
      }
      continue
    }

    const resolved = resolveLessonEvidence(passagesById, question.passageIdentifier, evidenceId)
    if (pairedLesson && resolved) {
      issues.push(issue('paired_text_scope_mismatch', question.questionIdentifier, `Paired-text passage evidence must be scoped: ${evidenceId}.`))
    }
    if (!resolved && !localIds.has(evidenceId)) {
      const owningPassage = lessonPassageIds.find((passageId) => (
        Boolean(resolveLessonEvidence(passagesById, passageId, evidenceId))
      ))
      if (owningPassage) {
        issues.push(issue('evidence_passage_mismatch', question.questionIdentifier, `Evidence ${evidenceId} belongs to ${owningPassage}, not the question passage.`))
      } else {
        issues.push(issue('unresolved_evidence_reference', question.questionIdentifier, `Evidence does not resolve in question content or lesson text: ${evidenceId}.`))
      }
    }
  }
}

function auditExplanationAgainstAnswers(
  question: ReadingQuestion,
  payload: QuestionContentPayload,
  issues: SemanticQuestionAuditIssue[],
) {
  if (!question.explanation || payload.type === 'table_match') return
  const choices = getQuestionChoices(payload)
  const correctIds = new Set(getCorrectIds(payload))
  const mentioned = choices.filter((choice) => containsWholePhrase(question.explanation ?? '', choice.text))
  if (mentioned.length > 0 && mentioned.every((choice) => !correctIds.has(choice.id))) {
    issues.push(issue(
      'explanation_answer_mismatch',
      question.questionIdentifier,
      'Explanation names an answer choice, but none of the named choices is keyed correct.',
    ))
  }
}

function auditExplanationEvidence(
  question: ReadingQuestion,
  lessonPassages: readonly Passage[],
  issues: SemanticQuestionAuditIssue[],
) {
  const explanation = question.explanation ?? ''
  const quotedPhrases = [...explanation.matchAll(/["“]([^"”]{8,})["”]/g)].map((match) => match[1])
  if (quotedPhrases.length === 0) return
  const authoredContext = [
    ...lessonPassages.flatMap((passage) => collectPassageSourceText(passage)),
    ...question.answerChoices,
  ]
  const foreignPhrase = quotedPhrases.find((phrase) => !authoredContext.some((text) => containsNormalizedText(text, phrase)))
  if (foreignPhrase) {
    issues.push(issue(
      'explanation_evidence_mismatch',
      question.questionIdentifier,
      `Quoted explanation text is absent from the lesson context: "${foreignPhrase}".`,
    ))
  }
}

function auditOrdinalExplanation(
  question: ReadingQuestion,
  lessonPassages: readonly Passage[],
  issues: SemanticQuestionAuditIssue[],
) {
  const explanation = question.explanation ?? ''
  if (/\b(first|second|third|fourth)\s+(choice|answer|option)\b/i.test(explanation)) {
    issues.push(issue('stale_ordinal_explanation', question.questionIdentifier, 'Explanation must not depend on answer-choice position.'))
    return
  }

  const ordinalMatch = /\b(first|second|third|fourth)\s+(sentence|line)\b/i.exec(explanation)
  if (!ordinalMatch || question.questionContent?.type !== 'hot_text') return
  const expectedIndex = ordinalToIndex(ordinalMatch[1])
  const correctTexts = question.questionContent.selectableSegments
    .filter((segment) => question.questionContent?.type === 'hot_text' && question.questionContent.correctSegmentIds.includes(segment.id))
    .map((segment) => stripTextMemberLabel(segment.text))
  const matchesSourceOrder = lessonPassages.some((passage) => {
    const source = passage.sentences?.map((sentence) => sentence.text) ?? []
    return correctTexts.some((text) => source.findIndex((sentence) => containsNormalizedText(sentence, text)) === expectedIndex)
  })
  if (!matchesSourceOrder) {
    issues.push(issue('stale_ordinal_explanation', question.questionIdentifier, 'Explanation ordinal does not match the keyed sentence or line in source order.'))
  }
}

function findDuplicateVisibleChoiceIssue(question: ReadingQuestion): SemanticQuestionAuditIssue | null {
  if (question.questionType === 'table_match' || question.questionType === 'two_part') return null
  const visibleChoices = question.answerChoices.map((choice) => normalizeText(choice))
  if (new Set(visibleChoices).size === visibleChoices.length) return null
  return issue('duplicate_visible_choice_text', question.questionIdentifier, 'Visible answer choices must be distinct for the learner.')
}

function findPromptAnswerLeakageIssue(question: ReadingQuestion): SemanticQuestionAuditIssue | null {
  const promptExemplar = extractPromptExemplar(question.prompt)
  if (!promptExemplar || !question.questionContent) return null
  const correctIds = new Set(getCorrectIds(question.questionContent))
  const correctTexts = getQuestionChoices(question.questionContent)
    .filter((choice) => correctIds.has(choice.id))
    .map((choice) => choice.text)
  const matchingAnswer = correctTexts.find((answer) => normalizeText(answer) === normalizeText(promptExemplar))
  if (!matchingAnswer) return null
  return issue(
    'prompt_answer_leakage',
    question.questionIdentifier,
    `Prompt exemplar "${promptExemplar}" repeats the keyed answer "${matchingAnswer}".`,
  )
}

function extractPromptExemplar(prompt: string): string | null {
  const patterns = [
    /^which word has (.+?) like (.+?)\?$/i,
    /^which word uses (.+?) like (.+?)\?$/i,
    /^which word has (.+?) making the same sound as in (.+?)\?$/i,
  ]
  for (const pattern of patterns) {
    const match = prompt.match(pattern)
    if (match) return match[2].trim()
  }
  return null
}

function getQuestionContentIds(payload?: QuestionContentPayload): string[] {
  if (!payload) return []
  if (payload.type === 'multiple_choice' || payload.type === 'multi_select') return payload.choices.map((choice) => choice.id)
  if (payload.type === 'hot_text') return payload.selectableSegments.map((segment) => segment.id)
  if (payload.type === 'two_part') return [...payload.partAChoices, ...payload.partBChoices].map((choice) => choice.id)
  return payload.rows.flatMap((row) => [row.id, ...row.options.map((option) => option.id)])
}

function getQuestionChoices(payload: QuestionContentPayload): Array<{ id: string; text: string }> {
  if (payload.type === 'multiple_choice' || payload.type === 'multi_select') return payload.choices
  if (payload.type === 'hot_text') return payload.selectableSegments
  if (payload.type === 'two_part') return [...payload.partAChoices, ...payload.partBChoices]
  return payload.rows.flatMap((row) => row.options)
}

function getCorrectIds(payload: QuestionContentPayload): string[] {
  if (payload.type === 'multiple_choice' || payload.type === 'multi_select') return payload.correctChoiceIds
  if (payload.type === 'hot_text') return payload.correctSegmentIds
  if (payload.type === 'two_part') return [payload.partACorrectChoiceId, payload.partBCorrectChoiceId]
  return payload.rows.map((row) => row.correctChoiceId)
}

function extractExpectedSelectionCount(prompt: string): number | null {
  const match = /\b(?:choose|select)\s+(one|two|three|four|1|2|3|4)\b/i.exec(prompt)
  if (!match) return null
  const values: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 }
  return values[match[1].toLowerCase()] ?? Number(match[1])
}

function collectPassageSourceText(passage: Passage): string[] {
  return [passage.passageText, ...(passage.sentences?.map((sentence) => sentence.text) ?? [])]
}

function stripTextMemberLabel(value: string): string {
  return value.replace(/^Text\s+[12]\s*(?:evidence)?\s*[:-]\s*/i, '').trim()
}

function containsWholePhrase(haystack: string, needle: string): boolean {
  const normalizedHaystack = ` ${normalizeText(haystack)} `
  const normalizedNeedle = normalizeText(needle)
  return Boolean(normalizedNeedle) && normalizedHaystack.includes(` ${normalizedNeedle} `)
}

function containsNormalizedText(haystack: string, needle: string): boolean {
  const normalizedNeedle = normalizeText(needle)
  return Boolean(normalizedNeedle) && normalizeText(haystack).includes(normalizedNeedle)
}

function ordinalToIndex(ordinal: string): number {
  return ['first', 'second', 'third', 'fourth'].indexOf(ordinal.toLowerCase())
}

function sameOrderedValues(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
}

function issue(
  code: SemanticQuestionAuditIssueCode,
  questionIdentifier: string,
  message: string,
): SemanticQuestionAuditIssue {
  return { code, questionIdentifier, message }
}

function buildReport(
  reviewedCount: number,
  reviewedPackCount: number,
  reviewedLessonCount: number,
  issues: SemanticQuestionAuditIssue[],
): SemanticQuestionAuditReport {
  const uniqueIssues = new Map(issues.map((entry) => [
    `${entry.questionIdentifier}::${entry.code}::${entry.message}`,
    entry,
  ] as const))
  return {
    reviewedCount,
    reviewedPackCount,
    reviewedLessonCount,
    issues: [...uniqueIssues.values()].sort((left, right) => (
      left.questionIdentifier.localeCompare(right.questionIdentifier) || left.code.localeCompare(right.code)
    )),
  }
}
