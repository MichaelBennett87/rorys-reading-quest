import type { ContentSample, ContentValidationError, QuestionType } from './types'
import type {
  HotTextQuestionData,
  MultipleChoiceQuestionData,
  TableMatchQuestionData,
  TwoPartQuestionData,
  MultiselectQuestionData,
  WordSupportChunk,
  WordSupportTarget,
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
  const passagesById = new Map(sample.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const supportTargetIds = new Set<string>()
  const sentenceIds = new Set<string>()
  const supportPlacements = new Set<string>()

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
    if (passage.sentences && passage.sentences.length > 0) {
      for (const sentence of passage.sentences) {
        if (!sentence.sentenceId.trim()) {
          withError(errors, 'missing_identifier', `${passage.passageIdentifier}:sentenceId`, 'Sentence identifier is required.')
        }
        if (sentence.text.trim() === '') {
          withError(errors, 'missing_identifier', `${passage.passageIdentifier}:${sentence.sentenceId}`, 'Sentence text is required.')
        }
        if (sentenceIds.has(`${passage.passageIdentifier}::${sentence.sentenceId}`)) {
          withError(
            errors,
            'duplicate_option_id',
            `${passage.passageIdentifier}:${sentence.sentenceId}`,
            'Sentence identifiers must be unique within a passage.',
          )
        } else {
          sentenceIds.add(`${passage.passageIdentifier}::${sentence.sentenceId}`)
        }
      }
    }

    if (Array.isArray(passage.wordSupportTargets)) {
      for (const target of passage.wordSupportTargets) {
        const targetErrors = validateSupportTarget(sample, passage, target, supportTargetIds, supportPlacements)
        errors.push(...targetErrors)
      }
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
        ...(passagesById.get(question.passageIdentifier)?.sentences?.map((sentence) => sentence.sentenceId) ?? []),
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

  if (passageIds.size === 0) {
    withError(errors, 'missing_referenced_passage', 'content', 'No passages are available.')
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

function normalizeWord(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim()
}

function concatDisplayParts(parts: { text: string }[]): string {
  return parts.map((part) => part.text).join('')
}

function normalizeChunks(chunks: WordSupportChunk[]): string {
  return chunks
    .map((chunk) => chunk.displayText ?? '')
    .join('')
}

function validateSupportTarget(
  sample: ContentSample,
  passage: ContentSample['passages'][number],
  target: WordSupportTarget,
  supportTargetIds: Set<string>,
  supportPlacements: Set<string>,
): ContentValidationError[] {
  const errors: ContentValidationError[] = []
  if (!target.targetId.trim()) {
    withError(errors, 'invalid_support_metadata', `passage:${passage.passageIdentifier}`, 'support targetId is required.')
    return errors
  }
  if (supportTargetIds.has(target.targetId)) {
    withError(errors, 'duplicate_support_target_id', target.targetId, `Duplicate support target ID: ${target.targetId}`)
    return errors
  }
  supportTargetIds.add(target.targetId)

  if (target.passageId !== passage.passageIdentifier) {
    withError(
      errors,
      'invalid_support_reference',
      target.targetId,
      'Support target must reference its owning passage.',
    )
  }
  if (!target.sentenceId.trim()) {
    withError(errors, 'missing_support_sentence', target.targetId, 'Support target sentenceId is required.')
  } else if (!passage.sentences || !passage.sentences.some((sentence) => sentence.sentenceId === target.sentenceId)) {
    withError(
      errors,
      'invalid_support_reference',
      target.targetId,
      `Support sentenceId is not available in passage ${target.passageId}.`,
    )
  }

  if (!target.surfaceWord.trim()) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'Support target surfaceWord is required.')
    return errors
  }
  if (!Array.isArray(target.focusParts) || target.focusParts.length === 0) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'Support target focus parts are required.')
  }
  if (target.focusParts.some((part) => !part.text.trim())) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'Focus parts must have non-empty text.')
  }
  if (!target.focusParts.some((part) => part.emphasis)) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'At least one focus part must be emphasized.')
  }

  if (!Array.isArray(target.displayChunks) || target.displayChunks.length < 2) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'Display chunks must contain at least two items.')
  }
  if (!Array.isArray(target.spokenChunks) || target.spokenChunks.length < 1) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'Spoken chunks are required.')
  }
  if (target.spokenChunks.some((chunk) => !chunk.speechText.trim())) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'Spoken chunk text is required.')
  }
  if (!target.blendSpeechText.trim()) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'blendSpeechText is required.')
  }
  if (!target.wholeWordSpeechText.trim()) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'wholeWordSpeechText is required.')
  }
  if (!target.sentenceSpeechText.trim()) {
    withError(errors, 'invalid_support_metadata', target.targetId, 'sentenceSpeechText is required.')
  }
  if (!target.reviewStatus) {
    withError(errors, 'missing_review_status', target.targetId, 'Support target review status is required.')
  }
  if (!target.contentVersion.trim()) {
    withError(errors, 'missing_identifier', target.targetId, 'Support target content version is required.')
  }

  if (target.focusParts.length > 0) {
    const reconstructed = normalizeWord(concatDisplayParts(target.focusParts))
    if (reconstructed !== normalizeWord(target.surfaceWord)) {
      withError(
        errors,
        'invalid_support_metadata',
        target.targetId,
        `Support focus parts do not reconstruct surface word: ${target.surfaceWord}`,
      )
    }
  }
  if (target.displayChunks.length >= 2) {
    const reconstructed = normalizeWord(normalizeChunks(target.displayChunks))
    if (reconstructed !== normalizeWord(target.surfaceWord)) {
      withError(
        errors,
        'invalid_support_metadata',
        target.targetId,
        `Display chunks do not reconstruct surface word: ${target.surfaceWord}`,
      )
    }
  }
  if (!passage.wordSupportTargets) {
    return errors
  }

  const passageWords = `${passage.passageText} ${passage.sentences?.map((entry) => entry.text).join(' ')}`.trim()
  if (!normalizeWord(passageWords).includes(normalizeWord(target.surfaceWord))) {
    withError(
      errors,
      'invalid_support_reference',
      target.targetId,
      `surfaceWord does not appear in the referenced passage: ${target.surfaceWord}`,
    )
  }

  const placement = `${target.passageId}::${target.sentenceId}::${normalizeWord(target.surfaceWord)}`
  if (supportPlacements.has(placement)) {
    withError(
      errors,
      'duplicate_support_placement',
      target.targetId,
      `Duplicate support target placement: ${target.sentenceId} in ${target.passageId}.`,
    )
  } else {
    supportPlacements.add(placement)
  }

  if (
    sample.questions.some((question) => question.reviewStatus === 'APPROVED' || target.reviewStatus === 'APPROVED')
    && (
      target.focusParts.length === 0
      || target.displayChunks.length === 0
      || !target.wholeWordSpeechText
      || !target.sentenceSpeechText
    )
  ) {
    withError(
      errors,
      'invalid_support_metadata',
      target.targetId,
      'Approved support metadata must be complete.',
    )
  }
  return errors
}
