import type { ContentSample, ContentValidationError, QuestionType } from './types'
import { buildPassageEvidenceIndex, parseScopedEvidenceReference, resolveLessonEvidence } from './evidence'
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

    if (passage.contentKind === 'poem') {
      validatePoemStructure(passage, errors)
    }

    if (passage.contentKind === 'informational') {
      validateInformationalStructure(passage, errors)
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
          const selectionMode = typed.selectionMode ?? 'independent'
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

            if (selectionMode !== 'independent' && selectionMode !== 'use_each_once') {
              withError(
                errors,
                'malformed_question_payload',
                question.questionIdentifier,
                `Unsupported table match selection mode: ${selectionMode}.`,
              )
            }

            if (selectionMode === 'use_each_once') {
              const normalizedPools = typed.rows.map((row) => normalizeTableMatchPool(row.options))
              const expectedPool = normalizedPools[0] ?? []
              if (expectedPool.length !== typed.rows.length + 1) {
                withError(
                  errors,
                  'malformed_table_match_rows',
                  question.questionIdentifier,
                  'Use-each-once table match questions need one extra distractor option.',
                )
              }
              for (const pool of normalizedPools.slice(1)) {
                if (!sameStringList(expectedPool, pool)) {
                  withError(
                    errors,
                    'malformed_table_match_rows',
                    question.questionIdentifier,
                    'Use-each-once table match rows must share the same option pool.',
                  )
                  break
                }
              }

              const correctChoiceIds = new Set<string>()
              for (const row of typed.rows) {
                if (correctChoiceIds.has(row.correctChoiceId)) {
                  withError(
                    errors,
                    'malformed_table_match_rows',
                    question.questionIdentifier,
                    'Use-each-once table match correct choices must be unique across rows.',
                  )
                  break
                }
                correctChoiceIds.add(row.correctChoiceId)
              }
              if (correctChoiceIds.size > 0 && correctChoiceIds.size >= expectedPool.length) {
                withError(
                  errors,
                  'malformed_table_match_rows',
                  question.questionIdentifier,
                  'Use-each-once table match questions need at least one unused distractor.',
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
      const referencedPassage = passagesById.get(question.passageIdentifier)
      const evidenceIds = question.evidenceReferenceIds
      const validEvidenceIds = new Set<string>([
        ...(payload ? getContentEvidenceIds(question.questionType, payload) : []),
        ...(referencedPassage ? [...buildPassageEvidenceIndex(referencedPassage).keys()] : []),
      ])
      for (const evidenceId of evidenceIds) {
        const trimmedEvidenceId = evidenceId.trim()
        if (!trimmedEvidenceId) {
          continue
        }
        if (parseScopedEvidenceReference(trimmedEvidenceId)) {
          if (!resolveLessonEvidence(passagesById, question.passageIdentifier, trimmedEvidenceId)) {
            withError(
              errors,
              'invalid_evidence_reference',
              question.questionIdentifier,
              `Evidence reference does not resolve across the lesson passages: ${evidenceId}`,
            )
          }
          continue
        }
        if (!validEvidenceIds.has(trimmedEvidenceId)) {
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

function normalizePoemText(text: string): string {
  return text.replace(/\r\n?/g, '\n').trim()
}

function normalizeInformationalText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

function containsUnsafeFeatureText(text: string): boolean {
  return /https?:\/\/|www\.|<[^>]+>/i.test(text)
}

function concatDisplayParts(parts: { text: string }[]): string {
  return parts.map((part) => part.text).join('')
}

function normalizeChunks(chunks: WordSupportChunk[]): string {
  return chunks
    .map((chunk) => chunk.displayText ?? '')
    .join('')
}

function normalizeTableMatchPool(options: { id: string; text: string }[]): string[] {
  return options
    .map((option) => `${option.id.trim()}::${option.text.trim().replace(/\s+/g, ' ')}`)
    .sort((left, right) => left.localeCompare(right))
}

function sameStringList(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false
  return left.every((value, index) => value === right[index])
}

function validatePoemStructure(
  passage: ContentSample['passages'][number],
  errors: ContentValidationError[],
) {
  const structure = passage.poemStructure
  if (!structure) {
    withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem passages require poemStructure.')
    return
  }

  const lines = structure.lines ?? []
  const stanzas = structure.stanzas ?? []
  const minimumLineCount = passage.gradeBand === 3 ? 3 : 4
  if (lines.length < minimumLineCount || lines.length > 12) {
    withError(errors, 'invalid_support_metadata', passage.passageIdentifier, `Grade ${passage.gradeBand} poem passages must contain ${minimumLineCount} to 12 lines.`)
  }
  if (stanzas.length < 1 || stanzas.length > 2) {
    withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem passages must contain 1 or 2 stanzas.')
  }

  const sentenceById = new Map((passage.sentences ?? []).map((sentence) => [sentence.sentenceId, sentence] as const))
  const stanzaById = new Map<string, { stanzaId: string; lineIds: string[] }>()
  const seenLineIds = new Set<string>()
  const expectedText = normalizePoemText(lines.map((line) => line.text).join('\n'))
  const actualText = normalizePoemText(passage.passageText)

  if (expectedText !== actualText) {
    withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem passage text must match the authored line structure.')
  }

  for (const stanza of stanzas) {
    if (!stanza.stanzaId.trim()) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem stanza identifiers are required.')
      continue
    }
    if (stanzaById.has(stanza.stanzaId)) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem stanza identifiers must be unique.')
      continue
    }
    stanzaById.set(stanza.stanzaId, stanza)
    if (!Array.isArray(stanza.lineIds) || stanza.lineIds.length === 0) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Each poem stanza must reference at least one line.')
      continue
    }
    if (new Set(stanza.lineIds).size !== stanza.lineIds.length) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem stanzas must not repeat line IDs.')
    }
    for (const lineId of stanza.lineIds) {
      const line = lines.find((candidate) => candidate.lineId === lineId)
      if (!line) {
        withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem stanza line IDs must resolve to authored lines.')
        continue
      }
      if (line.stanzaId !== stanza.stanzaId) {
        withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem line stanza IDs must match their stanza.')
      }
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const sentence = sentenceById.get(line.lineId)

    if (!line.lineId.trim()) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem line identifiers are required.')
      continue
    }
    if (seenLineIds.has(line.lineId)) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem line identifiers must be unique.')
    } else {
      seenLineIds.add(line.lineId)
    }
    if (line.lineNumber !== index + 1) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem line numbers must be contiguous starting at 1.')
    }
    if (!line.stanzaId.trim() || !stanzaById.has(line.stanzaId)) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem lines must belong to a real stanza.')
    }
    if (!sentence) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem line IDs must resolve to passage sentences.')
      continue
    }
    if (sentence.text !== line.text) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem sentences must match their authored lines.')
    }
    if (sentence.lineNumber !== line.lineNumber) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem sentence line numbers must match the poem structure.')
    }
    if (sentence.stanzaId !== line.stanzaId) {
      withError(errors, 'invalid_support_metadata', passage.passageIdentifier, 'Poem sentence stanza IDs must match the poem structure.')
    }
  }
}

function validateInformationalStructure(
  passage: ContentSample['passages'][number],
  errors: ContentValidationError[],
) {
  const structure = passage.informationalStructure
  if (!structure) {
    withError(errors, 'missing_informational_structure', passage.passageIdentifier, 'Informational passages require informationalStructure.')
    return
  }

  const features = structure.features ?? []
  const sections = structure.sections ?? []
  const featureById = new Map<string, (typeof features)[number]>()
  const seenFeatureIds = new Set<string>()
  const seenSectionIds = new Set<string>()
  const sentenceById = new Map((passage.sentences ?? []).map((sentence) => [sentence.sentenceId, sentence] as const))
  const sentenceOwners = new Map<string, string>()
  const titleFeatures = features.filter((feature) => feature.kind === 'title')

  if (!structure.titleFeatureId.trim()) {
    withError(errors, 'informational_structure_invalid', passage.passageIdentifier, 'Informational passages require a titleFeatureId.')
  }
  if (features.length === 0) {
    withError(errors, 'informational_structure_invalid', passage.passageIdentifier, 'Informational passages require structured features.')
  }
  if (titleFeatures.length !== 1) {
    withError(errors, 'informational_structure_invalid', passage.passageIdentifier, 'Informational passages need exactly one title feature.')
  }
  if (sections.length < 2) {
    withError(errors, 'informational_structure_invalid', passage.passageIdentifier, 'Informational passages need at least two sections.')
  }

  for (const feature of features) {
    if (!feature.featureId.trim()) {
      withError(errors, 'invalid_informational_feature', passage.passageIdentifier, 'Informational feature IDs are required.')
      continue
    }
    if (seenFeatureIds.has(feature.featureId)) {
      withError(errors, 'invalid_informational_feature', passage.passageIdentifier, 'Informational feature IDs must be unique.')
      continue
    }
    seenFeatureIds.add(feature.featureId)
    featureById.set(feature.featureId, feature)

    if (containsUnsafeFeatureText(JSON.stringify(feature))) {
      withError(errors, 'invalid_informational_feature', feature.featureId, 'Informational feature text must not contain remote URLs or raw HTML.')
    }

    if (feature.kind === 'title') {
      if (!feature.text.trim()) {
        withError(errors, 'invalid_informational_feature', feature.featureId, 'Title text is required.')
      }
    }
    if (feature.kind === 'heading') {
      if (!feature.sectionId.trim()) {
        withError(errors, 'invalid_informational_feature_reference', feature.featureId, 'Heading features require a section ID.')
      }
      if (!feature.text.trim()) {
        withError(errors, 'invalid_informational_feature', feature.featureId, 'Heading text is required.')
      }
    }
    if (feature.kind === 'caption') {
      if (!feature.targetFeatureId.trim()) {
        withError(errors, 'invalid_informational_feature_reference', feature.featureId, 'Caption features require a target feature ID.')
      }
      if (!feature.text.trim()) {
        withError(errors, 'invalid_informational_feature', feature.featureId, 'Caption text is required.')
      }
    }
    if (feature.kind === 'graph') {
      if (!feature.title.trim() || !feature.valueLabel.trim()) {
        withError(errors, 'invalid_informational_feature', feature.featureId, 'Graph features require a title and value label.')
      }
      const seenPointIds = new Set<string>()
      for (const point of feature.dataPoints ?? []) {
        if (!point.dataPointId.trim()) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Graph data-point IDs are required.')
          continue
        }
        if (seenPointIds.has(point.dataPointId)) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Graph data-point IDs must be unique.')
          continue
        }
        seenPointIds.add(point.dataPointId)
        if (!point.label.trim()) {
          withError(errors, 'invalid_informational_feature', point.dataPointId, 'Graph data-point labels are required.')
        }
        if (!Number.isInteger(point.value) || point.value < 0) {
          withError(errors, 'invalid_informational_feature', point.dataPointId, 'Graph data-point values must be nonnegative integers.')
        }
        if (containsUnsafeFeatureText(point.label) || containsUnsafeFeatureText(point.unitText ?? '')) {
          withError(errors, 'invalid_informational_feature', point.dataPointId, 'Graph data-point text must not contain remote URLs or raw HTML.')
        }
      }
    }
    if (feature.kind === 'map') {
      if (!feature.title.trim()) {
        withError(errors, 'invalid_informational_feature', feature.featureId, 'Map features require a title.')
      }
      if (!Number.isInteger(feature.rows) || feature.rows < 1 || !Number.isInteger(feature.columns) || feature.columns < 1) {
        withError(errors, 'invalid_informational_feature', feature.featureId, 'Map features require positive authored bounds.')
      }
      const seenLocationIds = new Set<string>()
      for (const location of feature.locations ?? []) {
        if (!location.locationId.trim()) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Map location IDs are required.')
          continue
        }
        if (seenLocationIds.has(location.locationId)) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Map location IDs must be unique.')
          continue
        }
        seenLocationIds.add(location.locationId)
        if (!location.label.trim() || !location.description.trim()) {
          withError(errors, 'invalid_informational_feature', location.locationId, 'Map locations require labels and descriptions.')
        }
        if (!Number.isInteger(location.order) || location.order < 1) {
          withError(errors, 'invalid_informational_feature', location.locationId, 'Map locations require a positive authored order.')
        }
        if (location.position) {
          if (!Number.isInteger(location.position.row) || !Number.isInteger(location.position.column)) {
            withError(errors, 'invalid_informational_feature', location.locationId, 'Map positions must use integer rows and columns.')
          }
          if (
            Number.isInteger(location.position.row)
            && Number.isInteger(location.position.column)
            && (
              location.position.row < 1
              || location.position.row > feature.rows
              || location.position.column < 1
              || location.position.column > feature.columns
            )
          ) {
            withError(errors, 'invalid_informational_feature', location.locationId, 'Map positions must fall within the authored bounds.')
          }
        }
      }
      const seenLegendIds = new Set<string>()
      for (const legend of feature.legendEntries ?? []) {
        if (!legend.legendId.trim()) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Map legend IDs are required.')
          continue
        }
        if (seenLegendIds.has(legend.legendId)) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Map legend IDs must be unique.')
          continue
        }
        seenLegendIds.add(legend.legendId)
        if (!legend.label.trim() || !legend.description.trim()) {
          withError(errors, 'invalid_informational_feature', legend.legendId, 'Map legend entries require labels and descriptions.')
        }
      }
      for (const connection of feature.connections ?? []) {
        if (!seenLocationIds.has(connection.fromLocationId) || !seenLocationIds.has(connection.toLocationId)) {
          withError(errors, 'invalid_informational_feature_reference', feature.featureId, 'Map connections must reference authored locations.')
        }
      }
    }
    if (feature.kind === 'glossary') {
      const seenTerms = new Set<string>()
      for (const entry of feature.entries ?? []) {
        if (!entry.entryId.trim()) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Glossary entry IDs are required.')
          continue
        }
        const normalizedTerm = normalizeInformationalText(entry.term)
        if (seenTerms.has(normalizedTerm)) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Glossary terms must be unique.')
          continue
        }
        seenTerms.add(normalizedTerm)
        if (!entry.definition.trim()) {
          withError(errors, 'invalid_informational_feature', entry.entryId, 'Glossary definitions are required.')
        }
      }
    }
    if (feature.kind === 'illustration') {
      if (!feature.title.trim() || !feature.accessibleDescription.trim()) {
        withError(errors, 'invalid_informational_feature', feature.featureId, 'Illustrations require a title and accessible description.')
      }
      const seenLabelIds = new Set<string>()
      for (const label of feature.labels ?? []) {
        if (!label.labelId.trim()) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Illustration label IDs are required.')
          continue
        }
        if (seenLabelIds.has(label.labelId)) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Illustration label IDs must be unique.')
          continue
        }
        seenLabelIds.add(label.labelId)
        if (!label.text.trim() || !label.description.trim()) {
          withError(errors, 'invalid_informational_feature', label.labelId, 'Illustration labels require text and descriptions.')
        }
      }
    }
    if (feature.kind === 'timeline') {
      if (!feature.title.trim() || (feature.items ?? []).length < 2) {
        withError(errors, 'invalid_informational_feature', feature.featureId, 'Timeline features require a title and at least two ordered items.')
      }
      const seenItemIds = new Set<string>()
      const seenOrders = new Set<number>()
      for (const item of feature.items ?? []) {
        if (!item.itemId.trim() || seenItemIds.has(item.itemId)) {
          withError(errors, 'invalid_informational_feature', feature.featureId, 'Timeline item IDs must be present and unique.')
          continue
        }
        seenItemIds.add(item.itemId)
        if (!item.label.trim() || !item.description.trim()) {
          withError(errors, 'invalid_informational_feature', item.itemId, 'Timeline items require labels and descriptions.')
        }
        if (!Number.isInteger(item.order) || item.order < 1 || seenOrders.has(item.order)) {
          withError(errors, 'invalid_informational_feature', item.itemId, 'Timeline items require unique positive integer order values.')
        }
        seenOrders.add(item.order)
      }
    }
    if (feature.kind === 'sidebar') {
      if (!feature.title.trim() || !feature.text.trim()) {
        withError(errors, 'invalid_informational_feature', feature.featureId, 'Sidebar features require a title and explanatory text.')
      }
    }
  }

  const titleFeature = featureById.get(structure.titleFeatureId)
  if (!titleFeature || titleFeature.kind !== 'title') {
    withError(errors, 'informational_structure_invalid', passage.passageIdentifier, 'titleFeatureId must point to a title feature.')
  }

  for (const section of sections) {
    if (!section.sectionId.trim()) {
      withError(errors, 'informational_structure_invalid', passage.passageIdentifier, 'Section IDs are required.')
      continue
    }
    if (seenSectionIds.has(section.sectionId)) {
      withError(errors, 'informational_structure_invalid', passage.passageIdentifier, 'Section IDs must be unique.')
      continue
    }
    seenSectionIds.add(section.sectionId)

    const heading = featureById.get(section.headingFeatureId)
    if (!heading || heading.kind !== 'heading' || heading.sectionId !== section.sectionId) {
      withError(errors, 'invalid_informational_feature_reference', section.headingFeatureId, 'Section headings must resolve to a matching heading feature.')
    }

    if (!Array.isArray(section.sentenceIds) || section.sentenceIds.length === 0) {
      withError(errors, 'informational_structure_invalid', section.sectionId, 'Each section requires at least one sentence.')
    }

    if (!Array.isArray(section.featureIds)) {
      withError(errors, 'informational_structure_invalid', section.sectionId, 'Section feature references are required.')
    } else {
      for (const featureId of section.featureIds) {
        const referencedFeature = featureById.get(featureId)
        if (!referencedFeature) {
          withError(errors, 'invalid_informational_feature_reference', featureId, 'Section feature references must resolve to a feature.')
          continue
        }
        if (referencedFeature.kind === 'title') {
          withError(errors, 'informational_structure_invalid', featureId, 'Title features must not be repeated in sections.')
        }
      }
    }

    for (const sentenceId of section.sentenceIds ?? []) {
      const sentence = sentenceById.get(sentenceId)
      if (!sentence) {
        withError(errors, 'invalid_informational_feature_reference', sentenceId, 'Section sentence IDs must resolve to passage sentences.')
        continue
      }
      const existingOwner = sentenceOwners.get(sentenceId)
      if (existingOwner && existingOwner !== section.sectionId) {
        withError(errors, 'informational_structure_invalid', sentenceId, 'Each informational sentence must belong to exactly one section.')
        continue
      }
      sentenceOwners.set(sentenceId, section.sectionId)
    }
  }

  for (const sentence of passage.sentences ?? []) {
    if (!sentenceOwners.has(sentence.sentenceId)) {
      withError(errors, 'informational_structure_invalid', sentence.sentenceId, 'Every informational sentence must belong to exactly one section.')
    }
  }

  const normalizedPassageText = normalizeInformationalText(
    (passage.sentences ?? []).map((sentence) => sentence.text).join(' '),
  )
  if (normalizedPassageText !== normalizeInformationalText(passage.passageText)) {
    withError(errors, 'informational_structure_invalid', passage.passageIdentifier, 'Informational passage text must match the authored sentence structure.')
  }
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
