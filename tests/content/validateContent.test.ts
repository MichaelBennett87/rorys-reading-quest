import { describe, expect, test } from 'vitest'

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
})
