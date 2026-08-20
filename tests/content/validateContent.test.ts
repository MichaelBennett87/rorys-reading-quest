import { describe, expect, test } from 'vitest'

import type { ContentSample } from '../../src/domain/content'
import { sampleContent, validateContent } from '../../src/domain/content'

describe('validateContent', () => {
  test('accepts the phase 0 sample', () => {
    const errors = validateContent(sampleContent)
    expect(errors).toHaveLength(0)
  })

  test('detects duplicate and missing identifiers', () => {
    const errors = validateContent({
      passages: [
        {
          passageIdentifier: 'dup',
          gradeBand: 2,
          passageText: 'Alpha cat sat.',
          readingContext: 'sample',
          contentVersion: 'r0',
        },
      ],
      questions: [
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'missing-passage',
          activityIdentifier: 'act1',
          questionIdentifier: '',
          questionType: 'two_part',
          prompt: 'Which sounds?',
          answerChoices: ['a'],
          correctAnswers: ['a'],
          explanation: '',
          evidenceReference: 'e',
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
        },
      ],
    })

    const codes = errors.map((error) => error.code)
    expect(codes).toContain('missing_identifier')
    expect(codes).toContain('missing_referenced_passage')
  })

  test('detects duplicate activity and question identifiers', () => {
    const errors = validateContent({
      passages: [
        {
          passageIdentifier: 'p1',
          gradeBand: 2,
          passageText: 'Quick text.',
          readingContext: 'sample',
          contentVersion: 'r0',
        },
      ],
      questions: [
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p1',
          activityIdentifier: 'dup',
          questionIdentifier: 'q1',
          questionType: 'multiple_choice',
          prompt: 'A?',
          answerChoices: ['A', 'B'],
          correctAnswers: ['A'],
          explanation: 'x',
          evidenceReference: 'e',
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
        },
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p1',
          activityIdentifier: 'dup',
          questionIdentifier: 'q2',
          questionType: 'multiple_choice',
          prompt: 'B?',
          answerChoices: ['A', 'B'],
          correctAnswers: ['A'],
          explanation: 'x',
          evidenceReference: 'e',
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
        },
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p1',
          activityIdentifier: 'act2',
          questionIdentifier: 'q1',
          questionType: 'multiple_choice',
          prompt: 'C?',
          answerChoices: ['A', 'B'],
          correctAnswers: ['A'],
          explanation: 'x',
          evidenceReference: 'e',
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
        },
      ],
    })

    const codes = errors.map((error) => error.code)
    expect(codes).toContain('duplicate_activity_identifier')
    expect(codes).toContain('duplicate_question_identifier')
  })

  test('flags unsupported question type and approved missing explanation', () => {
    const errors = validateContent({
      passages: [
        {
          passageIdentifier: 'p2',
          gradeBand: 2,
          passageText: 'Beta text.',
          readingContext: 'sample',
          contentVersion: 'r0',
        },
      ],
      questions: [
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p2',
          activityIdentifier: 'actX',
          questionIdentifier: 'qX',
          questionType: 'unsupported_type' as never,
          prompt: 'Which word?',
          answerChoices: ['A'],
          correctAnswers: ['A'],
          explanation: '',
          evidenceReference: 'e',
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'APPROVED',
          contentVersion: 'r0',
          tags: [],
        },
      ],
    })

    const codes = errors.map((error) => error.code)
    expect(codes).toContain('unsupported_question_type')
    expect(codes).toContain('approved_without_explanation')
  })

  test('flags unknown prerequisite references', () => {
    const errors = validateContent({
      passages: [
        {
          passageIdentifier: 'p3',
          gradeBand: 2,
          passageText: 'Gamma text.',
          readingContext: 'sample',
          contentVersion: 'r0',
        },
      ],
      questions: [
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: ['missing'],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p3',
          activityIdentifier: 'actY',
          questionIdentifier: 'qY',
          questionType: 'multiple_choice',
          prompt: 'A?',
          answerChoices: ['A'],
          correctAnswers: ['A'],
          explanation: 'x',
          evidenceReference: 'e',
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
        },
      ],
    })

    const codes = errors.map((error) => error.code)
    expect(codes).toContain('unknown_prerequisite')
  })

  test('flags missing choices and missing correct answer for multiple choice payload', () => {
    const errors = validateContent({
      passages: [
        {
          passageIdentifier: 'p4',
          gradeBand: 2,
          passageText: 'Delta text.',
          readingContext: 'sample',
          contentVersion: 'r0',
        },
      ],
      questions: [
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p4',
          activityIdentifier: 'act-z',
          questionIdentifier: 'qz',
          questionType: 'multiple_choice',
          prompt: 'Choose one',
          answerChoices: [],
          correctAnswers: [],
          explanation: 'x',
          evidenceReference: 'e',
          evidenceReferenceIds: [],
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
          questionContent: {
            type: 'multiple_choice',
            choices: [],
            correctChoiceIds: [],
          },
        },
      ],
    })

    const codes = errors.map((error) => error.code)
    expect(codes).toContain('missing_choices')
    expect(codes).toContain('missing_correct_answer')
  })

  test('flags duplicate option and hot-text segment IDs', () => {
    const errors = validateContent({
      passages: [
        {
          passageIdentifier: 'p5',
          gradeBand: 2,
          passageText: 'Echo text.',
          readingContext: 'sample',
          contentVersion: 'r0',
        },
      ],
      questions: [
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p5',
          activityIdentifier: 'act-y',
          questionIdentifier: 'qdup1',
          questionType: 'multi_select',
          prompt: 'Pick all',
          answerChoices: ['A', 'A'],
          correctAnswers: ['A'],
          explanation: 'x',
          evidenceReference: 'e',
          evidenceReferenceIds: ['dup-a'],
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
          questionContent: {
            type: 'multi_select',
            choices: [
              { id: 'dup', text: 'Option one' },
              { id: 'dup', text: 'Option two' },
            ],
            correctChoiceIds: ['dup'],
          },
        },
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p5',
          activityIdentifier: 'act-h',
          questionIdentifier: 'qdup2',
          questionType: 'hot_text',
          prompt: 'Highlight segment',
          answerChoices: ['x'],
          correctAnswers: ['x'],
          explanation: 'x',
          evidenceReference: 'e',
          evidenceReferenceIds: ['seg-a', 'seg-a'],
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
          questionContent: {
            type: 'hot_text',
            selectableSegments: [
              { id: 'seg-a', text: 'Sentence one.' },
              { id: 'seg-a', text: 'Sentence two.' },
            ],
            correctSegmentIds: ['seg-a'],
          },
        },
      ],
    })

    const codes = errors.map((error) => error.code)
    expect(codes).toContain('duplicate_option_id')
    expect(codes).toContain('duplicate_hot_text_segment_id')
  })

  test('flags table-match row problems and invalid evidence references', () => {
    const errors = validateContent({
      passages: [
        {
          passageIdentifier: 'p6',
          gradeBand: 2,
          passageText: 'Foxtrot text.',
          readingContext: 'sample',
          contentVersion: 'r0',
        },
      ],
      questions: [
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p6',
          activityIdentifier: 'act-t',
          questionIdentifier: 'qtable',
          questionType: 'table_match',
          prompt: 'Match row',
          answerChoices: [],
          correctAnswers: [],
          explanation: 'x',
          evidenceReference: 'e',
          evidenceReferenceIds: ['missing'],
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
          questionContent: {
            type: 'table_match',
            rows: [
              {
                id: 'row',
                prompt: 'Action',
                correctChoiceId: 'missing-choice',
                options: [{ id: 'choice-1', text: 'A' }],
              },
            ],
          },
        },
      ],
    })

    const codes = errors.map((error) => error.code)
    expect(codes).toContain('malformed_table_match_rows')
    expect(codes).toContain('invalid_evidence_reference')
  })

  test('flags missing evidence references in two-part questions', () => {
    const errors = validateContent({
      passages: [
        {
          passageIdentifier: 'p7',
          gradeBand: 2,
          passageText: 'Golf text.',
          readingContext: 'sample',
          contentVersion: 'r0',
        },
      ],
      questions: [
        {
          gradeBand: 2,
          benchmarkReference: 'x',
          skillIdentifier: 's',
          prerequisiteSkillIdentifiers: [],
          reportingCategory: 'Word Forge',
          genre: 'sentence',
          difficulty: 1,
          passageIdentifier: 'p7',
          activityIdentifier: 'act-two',
          questionIdentifier: 'qtwo',
          questionType: 'two_part',
          prompt: 'Pair lesson and proof',
          answerChoices: [],
          correctAnswers: [],
          explanation: 'x',
          evidenceReference: 'e',
          evidenceReferenceIds: ['missing-part'],
          targetVocabulary: ['a'],
          soundOutChunks: ['a'],
          estimatedReadingLevel: 'g2',
          reviewStatus: 'DRAFT',
          contentVersion: 'r0',
          tags: [],
          questionContent: {
            type: 'two_part',
            partAPrompt: 'What did she do?',
            partAChoices: [{ id: 'a', text: 'Plan' }],
            partACorrectChoiceId: 'a',
            partBPrompt: 'What supports it?',
            partBChoices: [{ id: 'b', text: 'Line text' }],
            partBCorrectChoiceId: 'b',
          },
        },
      ],
    })

    const codes = errors.map((error) => error.code)
    expect(codes).toContain('invalid_evidence_reference')
  })

  test('valid support metadata passes and duplicate support target IDs fail', () => {
    const supportedSample: ContentSample = {
      passages: [
        {
          passageIdentifier: 'passage-support',
          gradeBand: 2,
          passageText: 'Helpful words guide the learner.',
          sentences: [
            {
              sentenceId: 'sentence-support',
              text: 'Helpful words guide the learner.',
            },
          ],
          readingContext: 'sample',
          contentVersion: 'r0',
          wordSupportTargets: [
            {
              targetId: 'target-support',
              passageId: 'passage-support',
              sentenceId: 'sentence-support',
              surfaceWord: 'Helpful',
              focusParts: [
                { text: 'Help', emphasis: false },
                { text: 'ful', emphasis: true },
              ],
              displayChunks: [
                { displayText: 'Help', speechText: 'help' },
                { displayText: 'ful', speechText: 'ful' },
              ],
              spokenChunks: [
                { displayText: 'Help', speechText: 'help' },
                { displayText: 'ful', speechText: 'ful' },
              ],
              blendSpeechText: 'help-ful',
              wholeWordSpeechText: 'helpful',
              sentenceSpeechText: 'Helpful words guide the learner.',
              reviewStatus: 'DRAFT',
              contentVersion: 'r0',
            },
          ],
        },
      ],
      questions: [],
    }

    expect(validateContent(supportedSample)).toHaveLength(0)

    const duplicateTargetSample: ContentSample = {
      ...supportedSample,
      passages: [
        {
          ...supportedSample.passages[0],
          wordSupportTargets: [
            ...supportedSample.passages[0].wordSupportTargets!,
            {
              ...supportedSample.passages[0].wordSupportTargets![0],
              targetId: 'target-support',
            },
          ],
        },
      ],
    }

    expect(validateContent(duplicateTargetSample).some((error) => error.code === 'duplicate_support_target_id')).toBe(true)
  })
})
