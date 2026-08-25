import { describe, expect, test } from 'vitest'

import { buildContentPackAudit, buildGrade3SummaryGuideAudit } from '../../src/domain/content/packs'
import {
  SUMMARY_STRONGHOLD_BENCHMARK, SUMMARY_STRONGHOLD_PACK_ID, SUMMARY_STRONGHOLD_VERSION,
  summaryGuides, summaryStrongholdPack, summaryTextRecords,
} from '../../src/domain/content/packs/grade3/compareCastle/summaryStronghold'

describe('Grade 3 Compare Castle: Summary Stronghold', () => {
  test('has the exact active lesson, text, guide, question, and support inventory', () => {
    expect(summaryStrongholdPack.manifest).toMatchObject({ packId: SUMMARY_STRONGHOLD_PACK_ID, contentVersion: SUMMARY_STRONGHOLD_VERSION, benchmarkReferences: [SUMMARY_STRONGHOLD_BENCHMARK], unitId: 'g3-cg-unit-2', primarySkillId: 'g3-across-genres-reading', gradeBand: 3, reviewStatus: 'DRAFT' })
    expect(summaryStrongholdPack.lessons).toHaveLength(7)
    expect(summaryStrongholdPack.passages).toHaveLength(7)
    expect(summaryGuides).toHaveLength(7)
    expect(summaryStrongholdPack.questions).toHaveLength(41)
    expect(summaryStrongholdPack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(summaryTextRecords.filter((record) => record.kind === 'literary')).toHaveLength(4)
    expect(summaryTextRecords.filter((record) => record.kind === 'informational')).toHaveLength(3)
  })

  test('preserves the exact lesson-role and question-type distribution', () => {
    expect(summaryStrongholdPack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(summaryStrongholdPack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(summaryStrongholdPack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(Object.fromEntries(['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].map((type) => [type, summaryStrongholdPack.questions.filter((question) => question.questionType === type).length]))).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
  })

  test('keeps literary and informational summary reasoning bounded and source-owned', () => {
    for (const [index, guide] of summaryGuides.entries()) {
      const record = summaryTextRecords[index]
      const important = guide.textKind === 'literary' ? guide.importantPlotEvents : guide.importantDetails
      expect(important.length).toBeGreaterThanOrEqual(index >= 4 ? 4 : 3)
      expect(guide.minorDetails.length).toBeGreaterThanOrEqual(index >= 4 ? 3 : 2)
      expect(guide.modelSummary.split(/\s+/).length).toBeLessThan(record.sentences.join(' ').split(/\s+/).length * 0.8)
      expect(important.every((detail) => detail.evidenceIds.every((id) => record.sentences.some((_, sentenceIndex) => summaryStrongholdPack.passages[index].sentences?.[sentenceIndex]?.sentenceId === id)))).toBe(true)
      if (guide.textKind === 'literary') {
        expect(guide.problemOrGoalStatement).toBeTruthy()
        expect(guide.resolutionStatement).toBeTruthy()
        expect(guide.supportedThemeStatement.split(' ').length).toBeGreaterThan(3)
      } else {
        expect(guide.centralIdeaStatement).not.toBe(guide.topicLabel)
      }
    }
  })

  test('passes the summary-specific and complete pack audits with no deterministic issues', () => {
    expect(buildGrade3SummaryGuideAudit(summaryStrongholdPack)).toEqual([])
    expect(buildContentPackAudit([summaryStrongholdPack])).toEqual([])
  })
})
