import type { ContentSample, ContentValidationError, QuestionType } from './types'

const supportedQuestionTypes: QuestionType[] = [
  'multiple_choice',
  'multi_select',
  'hot_text',
  'two_part',
  'table_match',
  'chart_based',
]

function withError(
  errors: ContentValidationError[],
  code: ContentValidationError['code'],
  itemIdentifier: string,
  message: string,
) {
  errors.push({ code, itemIdentifier, message })
}

export function validateContent(sample: ContentSample): ContentValidationError[] {
  const errors: ContentValidationError[] = []
  const activityIds = new Set<string>()
  const questionIds = new Set<string>()
  const skillIds = new Set<string>()
  const passageIds = new Set(sample.passages.map((passage) => passage.passageIdentifier))

  for (const passage of sample.passages) {
    if (!passage.passageIdentifier.trim()) {
      withError(errors, 'missing_identifier', `passage:empty`, 'Passage identifier is required.')
    }
    if (!passage.passageText.trim()) {
      withError(errors, 'missing_identifier', passage.passageIdentifier, 'Passage text is required.')
    }
    if (!passage.contentVersion.trim()) {
      withError(errors, 'missing_identifier', passage.passageIdentifier, 'Passage content version is required.')
    }
  }

  for (const question of sample.questions) {
    if (!question.activityIdentifier.trim()) {
      withError(errors, 'missing_identifier', question.questionIdentifier, 'Activity identifier is required.')
    } else if (activityIds.has(question.activityIdentifier)) {
      withError(
        errors,
        'duplicate_activity_identifier',
        question.activityIdentifier,
        'Activity identifiers must be unique.',
      )
    } else {
      activityIds.add(question.activityIdentifier)
    }

    if (!question.questionIdentifier.trim()) {
      withError(errors, 'missing_identifier', `question:${question.activityIdentifier}`, 'Question identifier is required.')
    } else if (questionIds.has(question.questionIdentifier)) {
      withError(
        errors,
        'duplicate_question_identifier',
        question.questionIdentifier,
        'Question identifiers must be unique.',
      )
    } else {
      questionIds.add(question.questionIdentifier)
    }

    if (!question.gradeBand) {
      withError(errors, 'missing_identifier', question.questionIdentifier, 'Grade band is required.')
    }

    if (!question.benchmarkReference.trim()) {
      withError(errors, 'missing_identifier', question.questionIdentifier, 'Benchmark reference is required.')
    }

    if (!question.skillIdentifier.trim()) {
      withError(errors, 'missing_identifier', question.questionIdentifier, 'Skill identifier is required.')
    } else {
      skillIds.add(question.skillIdentifier)
    }

    if (!question.activityIdentifier.trim()) {
      withError(errors, 'missing_identifier', question.questionIdentifier, 'Activity identifier is required.')
    }

    if (!question.questionType.trim()) {
      withError(errors, 'missing_identifier', question.questionIdentifier, 'Question type is required.')
    } else if (!supportedQuestionTypes.includes(question.questionType)) {
      withError(
        errors,
        'unsupported_question_type',
        question.questionIdentifier,
        `Unsupported question type: ${question.questionType}`,
      )
    }

    if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
      withError(errors, 'missing_correct_answer', question.questionIdentifier, 'At least one correct answer is required.')
    }

    if (!question.reviewStatus) {
      withError(errors, 'missing_review_status', question.questionIdentifier, 'Review status is required.')
    }

    if (
      question.reviewStatus === 'APPROVED' &&
      (!question.explanation || !question.explanation.trim())
    ) {
      withError(
        errors,
        'approved_without_explanation',
        question.questionIdentifier,
        'Approved content requires explanation.',
      )
    }

    if (!question.contentVersion || !question.contentVersion.trim()) {
      withError(errors, 'missing_identifier', question.questionIdentifier, 'Content version is required.')
    }

    if (!passageIds.has(question.passageIdentifier)) {
      withError(
        errors,
        'missing_referenced_passage',
        question.questionIdentifier,
        `Question references unknown passage: ${question.passageIdentifier}`,
      )
    }
  }

  for (const question of sample.questions) {
    for (const prerequisite of question.prerequisiteSkillIdentifiers) {
      if (!skillIds.has(prerequisite)) {
        withError(
          errors,
          'unknown_prerequisite',
          question.questionIdentifier,
          `Unknown prerequisite skill: ${prerequisite}`,
        )
      }
    }
  }

  return errors
}
