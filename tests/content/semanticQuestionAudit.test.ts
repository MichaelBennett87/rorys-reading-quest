import { describe, expect, test } from 'vitest'

import { contentPacks } from '../../src/domain/content'
import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import { grade2WordForgeVariableVowelsOoEaPack } from '../../src/domain/content/packs/grade2/wordForge/variableVowelsOoEa'
import { OO_EA_LESSON_IDS, OO_EA_PASSAGE_IDS } from '../../src/domain/content/packs/grade2/wordForge/variableVowelsOoEa/ids'

describe('semantic question audit', () => {
  test('reports no deterministic semantic-integrity issues in active Grade 2 content', () => {
    const report = auditSemanticQuestionPacks(contentPacks)

    expect(report.reviewedCount).toBe(889)
    expect(report.reviewedPackCount).toBe(22)
    expect(report.reviewedLessonCount).toBe(154)
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
})
