import { describe, expect, test } from 'vitest'

import { contentPacks } from '../../src/domain/content'
import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import { grade2WordForgeVariableVowelsOoEaPack } from '../../src/domain/content/packs/grade2/wordForge/variableVowelsOoEa'
import { OO_EA_LESSON_IDS, OO_EA_PASSAGE_IDS } from '../../src/domain/content/packs/grade2/wordForge/variableVowelsOoEa/ids'

describe('semantic question audit', () => {
  test('reports no deterministic semantic-integrity issues in active Grade 2 content', () => {
    const report = auditSemanticQuestionPacks(contentPacks)

    expect(report.reviewedCount).toBe(1245)
    expect(report.reviewedPackCount).toBe(31)
    expect(report.reviewedLessonCount).toBe(217)
    expect(report.issues).toEqual([])
  })

  test('keeps every active question inside its owning lesson passage list', () => {
    for (const pack of contentPacks.filter((candidate) => !candidate.manifest.packId.startsWith('legacy-'))) {
      for (const lesson of pack.lessons.filter((candidate) => candidate.selectionStatus === 'active')) {
        for (const questionId of lesson.questionIdentifiers) {
          const question = pack.questions.find((candidate) => candidate.questionIdentifier === questionId)
          expect(question?.lessonIdentifier).toBe(lesson.lessonId)
          expect(lesson.passageIdentifiers).toContain(question?.passageIdentifier)
        }
      }
    }
  })

  test('aligns the two oo/ea checkpoints with their authored passage families', () => {
    const checkpointA = grade2WordForgeVariableVowelsOoEaPack.lessons.find((lesson) => lesson.lessonId === OO_EA_LESSON_IDS.checkpointA)
    const checkpointB = grade2WordForgeVariableVowelsOoEaPack.lessons.find((lesson) => lesson.lessonId === OO_EA_LESSON_IDS.checkpointB)

    expect(checkpointA?.passageIdentifiers).toEqual([OO_EA_PASSAGE_IDS.treeStudy])
    expect(checkpointB?.passageIdentifiers).toEqual([OO_EA_PASSAGE_IDS.poolParty])
    expect(grade2WordForgeVariableVowelsOoEaPack.questions
      .filter((question) => question.lessonIdentifier === OO_EA_LESSON_IDS.checkpointA)
      .every((question) => question.passageIdentifier === OO_EA_PASSAGE_IDS.treeStudy)).toBe(true)
    expect(grade2WordForgeVariableVowelsOoEaPack.questions
      .filter((question) => question.lessonIdentifier === OO_EA_LESSON_IDS.checkpointB)
      .every((question) => question.passageIdentifier === OO_EA_PASSAGE_IDS.poolParty)).toBe(true)
  })

  test('reports passage ownership and hot-text source defects in malformed fixtures', () => {
    const malformedPack = structuredClone(grade2WordForgeVariableVowelsOoEaPack)
    const hotTextQuestion = malformedPack.questions.find((question) => question.questionContent?.type === 'hot_text')

    expect(hotTextQuestion?.questionContent?.type).toBe('hot_text')
    if (!hotTextQuestion || hotTextQuestion.questionContent?.type !== 'hot_text') return

    const owningLesson = malformedPack.lessons.find((lesson) => lesson.lessonId === hotTextQuestion.lessonIdentifier)
    expect(owningLesson).toBeDefined()
    owningLesson?.passageIdentifiers.push('not-a-real-lesson-passage')
    hotTextQuestion.passageIdentifier = 'not-an-owned-passage'
    hotTextQuestion.questionContent.selectableSegments[0].text = 'This sentence is not in the lesson text.'

    const codes = auditSemanticQuestionPacks([malformedPack]).issues.map((issue) => issue.code)

    expect(codes).toContain('question_passage_ownership_mismatch')
    expect(codes).toContain('lesson_passage_ownership_mismatch')
    expect(codes).toContain('hot_text_source_mismatch')
  })

  test('reports missing keys, invalid cardinality, and stale ordinal explanations', () => {
    const malformedPack = structuredClone(grade2WordForgeVariableVowelsOoEaPack)
    const multipleChoice = malformedPack.questions.find((question) => question.questionContent?.type === 'multiple_choice')

    expect(multipleChoice?.questionContent?.type).toBe('multiple_choice')
    if (!multipleChoice || multipleChoice.questionContent?.type !== 'multiple_choice') return

    multipleChoice.questionContent.correctChoiceIds = [
      multipleChoice.questionContent.choices[0].id,
      'missing-choice',
    ]
    multipleChoice.correctAnswers = [...multipleChoice.questionContent.correctChoiceIds]
    multipleChoice.explanation = 'The first answer is correct.'

    const codes = auditSemanticQuestionPacks([malformedPack]).issues.map((issue) => issue.code)

    expect(codes).toContain('keyed_answer_missing')
    expect(codes).toContain('incorrect_selection_cardinality')
    expect(codes).toContain('stale_ordinal_explanation')
  })
})
