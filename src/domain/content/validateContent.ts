import type { ContentSample, ContentValidationError, QuestionType } from './types'
import type {
  HotTextQuestionData,
  MultipleChoiceQuestionData,
  TableMatchQuestionData,
  TwoPartQuestionData,
  MultiselectQuestionData,
} from './types'

const supportedQuestionTypes: QuestionType[] = [
  'multiple_choice',
  'multi_select',
  'hot_text',
  'two_part',
  'table_match',
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
      withError(errors, 'duplicate_question_identifier', question.questionIdentifier, 'Question identifiers must be unique.')
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

    if (!question.questionType.trim()) {
      withError(errors, 'missing_identifier', question.questionIdentifier, 'Question type is required.')
      continue
    }

    if (!supportedQuestionTypes.includes(question.questionType)) {
      withError(
        errors,
        'unsupported_question_type',
        question.questionIdentifier,
        `Unsupported question type: ${question.questionType}`,
      )
    }

    const payload = question.questionContent
    if (!payload) {
      withError(errors, 'malformed_question_payload', question.questionIdentifier, `${question.questionType} questions require questionContent.`)
      if (question.reviewStatus === 'APPROVED' && (!question.explanation || !question.explanation.trim())) {
        withError(
          errors,
          'approved_without_explanation',
          question.questionIdentifier,
          'Approved content requires explanation.',
        )
      }
    }

    if (payload) {
      if (question.questionType === 'multiple_choice') {
        const typedPayload = payload

        if (typedPayload.type !== 'multiple_choice') {
          withError(
            errors,
            'malformed_question_payload',
            question.questionIdentifier,
            `${question.questionType} requires matching questionContent.type multiple_choice.`,
          )
        } else {
          const typed = typedPayload as MultipleChoiceQuestionData
          validateChoices(typed, question.questionIdentifier, errors, 'multiple_choice')
        }
      }

      if (question.questionType === 'multi_select') {
        const typedPayload = payload

        if (typedPayload.type !== 'multi_select') {
          withError(
            errors,
            'malformed_question_payload',
            question.questionIdentifier,
            `${question.questionType} requires matching questionContent.type multi_select.`,
          )
        } else {
          const typed = typedPayload as MultiselectQuestionData
          validateChoices(typed, question.questionIdentifier, errors, 'multi_select')
        }
      }

      if (question.questionType === 'hot_text') {
        if (payload.type !== 'hot_text') {
          withError(
            errors,
            'malformed_question_payload',
            question.questionIdentifier,
            `${question.questionType} requires matching questionContent.type hot_text.`,
          )
        } else {
          const typed = payload as HotTextQuestionData

          if (!Array.isArray(typed.selectableSegments) || typed.selectableSegments.length === 0) {
            withError(
              errors,
              'missing_hot_text_segments',
              question.questionIdentifier,
              'Hot-text questions require selectable segments.',
            )
          } else {
            const segmentIds = typed.selectableSegments.map((segment: { id: string; text: string }) => segment.id)
            if (new Set(segmentIds).size !== segmentIds.length) {
              withError(
                errors,
                'duplicate_hot_text_segment_id',
                question.questionIdentifier,
                'Hot-text segment IDs must be unique.',
              )
            }
          }

          if (!typed.correctSegmentIds || typed.correctSegmentIds.length === 0) {
            withError(
              errors,
              'missing_correct_answer',
              question.questionIdentifier,
              'Hot-text questions require at least one correct segment.',
            )
          }
        }
      }

      if (question.questionType === 'two_part') {
        if (payload.type !== 'two_part') {
          withError(
            errors,
            'malformed_question_payload',
            question.questionIdentifier,
            `${question.questionType} requires matching questionContent.type two_part.`,
          )
        } else {
          const typed = payload as TwoPartQuestionData
          if (!typed.partAPrompt.trim() || !typed.partBPrompt.trim()) {
            withError(
              errors,
              'malformed_question_payload',
              question.questionIdentifier,
              'Two-part questions require prompt text for both parts.',
            )
          }
          const partAChoiceIds = typed.partAChoices.map((choice) => choice.id)
          const partBChoiceIds = typed.partBChoices.map((choice) => choice.id)
          if (partAChoiceIds.length === 0 || partBChoiceIds.length === 0) {
            withError(
              errors,
              'malformed_question_payload',
              question.questionIdentifier,
              'Both evidence prompts require answer choices.',
            )
          }
          if (!typed.partACorrectChoiceId || !partAChoiceIds.includes(typed.partACorrectChoiceId)) {
            withError(
              errors,
              'malformed_question_payload',
              question.questionIdentifier,
              'Evidence Part A must reference one listed answer choice.',
            )
          }
          if (!typed.partBCorrectChoiceId || !partBChoiceIds.includes(typed.partBCorrectChoiceId)) {
            withError(
              errors,
              'malformed_question_payload',
              question.questionIdentifier,
              'Evidence Part B must reference one listed answer choice.',
            )
          }
        }
      }

      if (question.questionType === 'table_match') {
        if (payload.type !== 'table_match') {
          withError(
            errors,
            'malformed_question_payload',
            question.questionIdentifier,
            `${question.questionType} requires matching questionContent.type table_match.`,
          )
        } else {
          const typed = payload as TableMatchQuestionData
          if (!Array.isArray(typed.rows) || typed.rows.length === 0) {
            withError(
              errors,
              'malformed_table_match_rows',
              question.questionIdentifier,
              'Table match questions require at least one row.',
            )
          } else {
            const rowIds = typed.rows.map((row) => row.id)
            if (new Set(rowIds).size !== rowIds.length) {
              withError(
                errors,
                'malformed_table_match_rows',
                question.questionIdentifier,
                'Table match rows must have unique IDs.',
              )
            }
            for (const row of typed.rows) {
              if (!row.prompt.trim() || !row.correctChoiceId || !Array.isArray(row.options) || row.options.length < 2) {
                withError(
                  errors,
                  'malformed_table_match_rows',
                  question.questionIdentifier,
                  'Each table match row requires a prompt and at least two options.',
                )
              }
              const optionIds = row.options.map((option) => option.id)
              if (new Set(optionIds).size !== optionIds.length) {
                withError(
                  errors,
                  'duplicate_option_id',
                  question.questionIdentifier,
                  'Table match options must have unique IDs.',
                )
              }
              if (!optionIds.includes(row.correctChoiceId)) {
                withError(
                  errors,
                  'malformed_table_match_rows',
                  question.questionIdentifier,
                  'Table match rows must point to one listed option.',
                )
              }
            }
          }
        }
      }
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

    if (Array.isArray(question.evidenceReferenceIds) && question.evidenceReferenceIds.length > 0) {
      const evidenceIds = question.evidenceReferenceIds
      const validEvidenceIds = new Set<string>([
        ...(payload ? getContentEvidenceIds(question.questionType, payload) : []),
      ])
      for (const evidenceId of evidenceIds) {
        if (evidenceId.trim() && !validEvidenceIds.has(evidenceId.trim())) {
          withError(
            errors,
            'invalid_evidence_reference',
            question.questionIdentifier,
            `Evidence reference does not match local question content: ${evidenceId}`,
          )
        }
      }
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

function validateChoices(
  payload: MultipleChoiceQuestionData | MultiselectQuestionData,
  questionIdentifier: string,
  errors: ContentValidationError[],
  questionType: 'multiple_choice' | 'multi_select',
) {
  const choices = payload.choices
  const correctAnswers = payload.correctChoiceIds

  if (!Array.isArray(choices) || choices.length < 2) {
    withError(errors, 'missing_choices', questionIdentifier, `${questionType} requires at least two answer choices.`)
  }

  const choiceIds = choices.map((choice: { id: string; text: string }) => choice.id)
  if (choiceIds.some((choiceId: string) => !choiceId)) {
    withError(errors, 'malformed_question_payload', questionIdentifier, 'Choice identifiers must be non-empty.')
  }
  if (new Set(choiceIds).size !== choiceIds.length) {
    withError(errors, 'duplicate_option_id', questionIdentifier, 'Choice identifiers must be unique.')
  }

  if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
    withError(errors, 'missing_correct_answer', questionIdentifier, 'At least one correct answer is required.')
  }
}

function getContentEvidenceIds(questionType: QuestionType, payload: NonNullable<ContentSample['questions'][number]['questionContent']>) {
  if (questionType === 'hot_text' && payload.type === 'hot_text') {
    return payload.selectableSegments.map((segment) => segment.id)
  }
  if (questionType === 'two_part' && payload.type === 'two_part') {
    return [...payload.partAChoices.map((choice) => choice.id), ...payload.partBChoices.map((choice) => choice.id)]
  }
  if (questionType === 'table_match' && payload.type === 'table_match') {
    return payload.rows.flatMap((row) => row.options.map((option) => option.id))
  }
  if (questionType === 'multiple_choice' && payload.type === 'multiple_choice') {
    return payload.choices.map((choice) => choice.id)
  }
  if (questionType === 'multi_select' && payload.type === 'multi_select') {
    return payload.choices.map((choice) => choice.id)
  }
  return []
}
