import type { ContentSample, ReadingQuestion } from './types'

export type SemanticQuestionAuditIssueCode =
  | 'prompt_answer_leakage'
  | 'duplicate_visible_choice_text'

export interface SemanticQuestionAuditIssue {
  code: SemanticQuestionAuditIssueCode
  questionIdentifier: string
  message: string
}

export interface SemanticQuestionAuditReport {
  reviewedCount: number
  issues: SemanticQuestionAuditIssue[]
}

export function auditSemanticQuestionContent(content: ContentSample): SemanticQuestionAuditReport {
  const issues: SemanticQuestionAuditIssue[] = []

  for (const question of content.questions) {
    const duplicateChoiceIssue = findDuplicateVisibleChoiceIssue(question)
    if (duplicateChoiceIssue) {
      issues.push(duplicateChoiceIssue)
    }

    const leakageIssue = findPromptAnswerLeakageIssue(question)
    if (leakageIssue) {
      issues.push(leakageIssue)
    }
  }

  return {
    reviewedCount: content.questions.length,
    issues: issues.sort((left, right) => left.questionIdentifier.localeCompare(right.questionIdentifier) || left.code.localeCompare(right.code)),
  }
}

function findDuplicateVisibleChoiceIssue(question: ReadingQuestion): SemanticQuestionAuditIssue | null {
  if (question.questionType === 'table_match' || question.questionType === 'two_part') {
    return null
  }

  const visibleChoices = question.answerChoices.map((choice) => normalizeText(choice))
  const uniqueChoices = new Set(visibleChoices)
  if (uniqueChoices.size === visibleChoices.length) {
    return null
  }

  return {
    code: 'duplicate_visible_choice_text',
    questionIdentifier: question.questionIdentifier,
    message: 'Visible answer choices must be distinct for the learner.',
  }
}

function findPromptAnswerLeakageIssue(question: ReadingQuestion): SemanticQuestionAuditIssue | null {
  const promptExemplar = extractPromptExemplar(question.prompt)
  if (!promptExemplar) {
    return null
  }

  const normalizedExemplar = normalizeText(promptExemplar)
  const matchingAnswer = question.correctAnswers.find((answer) => normalizeText(answer) === normalizedExemplar)
  if (!matchingAnswer) {
    return null
  }

  return {
    code: 'prompt_answer_leakage',
    questionIdentifier: question.questionIdentifier,
    message: `Prompt exemplar "${promptExemplar}" repeats the keyed answer "${matchingAnswer}".`,
  }
}

function extractPromptExemplar(prompt: string): string | null {
  const patterns = [
    /^which word has (.+?) like (.+?)\?$/i,
    /^which word uses (.+?) like (.+?)\?$/i,
    /^which word has (.+?) making the same sound as in (.+?)\?$/i,
  ]

  for (const pattern of patterns) {
    const match = prompt.match(pattern)
    if (match) {
      return match[2].trim()
    }
  }

  return null
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}
