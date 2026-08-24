import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import { buildCentralIdeaEngineGuideAudit, buildContentPackAudit } from '../../src/domain/content/packs'
import {
  centralIdeaEngineGuides, centralIdeaEnginePack, centralIdeaEnginePassages,
  centralIdeaEngineQuestions, centralIdeaEngineRecords,
} from '../../src/domain/content/packs/grade3/informationDetectives/centralIdeaEngine'
import { createDefaultQuestProgress } from '../../src/persistence'

describe('Grade 3 Central Idea Engine production pack', () => {
  test('keeps the exact lesson, text, guide, question, and support shape', () => {
    expect(centralIdeaEnginePack.lessons).toHaveLength(7)
    expect(centralIdeaEnginePassages).toHaveLength(7)
    expect(centralIdeaEngineGuides).toHaveLength(7)
    expect(centralIdeaEngineQuestions).toHaveLength(41)
    expect(centralIdeaEnginePassages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(centralIdeaEnginePack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(centralIdeaEnginePack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(centralIdeaEnginePack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(Object.fromEntries(['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].map((type) => [
      type, centralIdeaEngineQuestions.filter((question) => question.questionType === type).length,
    ]))).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
  })

  test('balances stated and inferred ideas with two inferred checkpoints', () => {
    expect(centralIdeaEngineRecords.filter((record) => record.mode === 'stated')).toHaveLength(3)
    expect(centralIdeaEngineRecords.filter((record) => record.mode === 'inferred')).toHaveLength(4)
    expect(centralIdeaEngineRecords.slice(4).filter((record) => record.mode === 'inferred')).toHaveLength(2)
  })

  test('binds relevant and minor details to their real sections', () => {
    for (const passage of centralIdeaEnginePassages) {
      const guide = centralIdeaEngineGuides.find((entry) => entry.passageId === passage.passageIdentifier)!
      expect(passage.informationalStructure?.sections).toHaveLength(3)
      expect(guide.relevantDetails?.length).toBeGreaterThanOrEqual(4)
      expect(guide.irrelevantOrMinorDetails?.length).toBeGreaterThanOrEqual(2)
      expect(guide.sectionSupport).toHaveLength(3)
      expect(new Set(guide.relevantDetails?.map((detail) => detail.sectionId)).size).toBeGreaterThanOrEqual(2)
      expect(guide.synthesisStatement).toMatch(/section|detail|together|across|support/i)
    }
  })

  test('keeps topic, summary, relevant-detail, and minor-detail boundaries explicit', () => {
    for (const record of centralIdeaEngineRecords) {
      expect(record.centralIdea).not.toBe(record.topic)
      expect(record.centralIdea).not.toBe(record.summaryDistractor)
      expect(record.relevantDetails.every((detail) => !record.minorDetails.some((minor) => minor.sentence === detail.sentence))).toBe(true)
      expect(record.sectionContributions.every((statement) => statement.length > 20)).toBe(true)
    }
  })

  test('aligns four five-stage Word Help targets per text without leaking the central idea', () => {
    for (const passage of centralIdeaEnginePassages) {
      expect(passage.wordSupportTargets).toHaveLength(4)
      for (const target of passage.wordSupportTargets ?? []) {
        const source = passage.sentences?.find((sentence) => sentence.sentenceId === target.sentenceId)?.text ?? ''
        expect(source).toContain(target.surfaceWord)
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
        expect(target.focusParts.map((part) => part.text).join('')).toBe(target.surfaceWord)
        expect(target.surfaceWord).not.toMatch(/central|relevant|minor|implied|stated/i)
      }
    }
  })

  test('passes pack-specific, global content, and semantic audits', () => {
    expect(buildCentralIdeaEngineGuideAudit(centralIdeaEnginePack)).toEqual([])
    expect(buildContentPackAudit([centralIdeaEnginePack])).toEqual([])
    expect(auditSemanticQuestionPacks([centralIdeaEnginePack])).toMatchObject({ reviewedPackCount: 1, reviewedLessonCount: 7, reviewedCount: 41, issues: [] })
  })

  test('keeps all items inside ELA.3.R.2.2 and guide content outside persistence', () => {
    expect(centralIdeaEngineQuestions.every((question) => question.gradeBand === 3 && question.benchmarkReference === 'ELA.3.R.2.2')).toBe(true)
    expect(centralIdeaEngineQuestions.every((question) => question.skillIdentifier === 'g3-information-detectives-reading' && question.reportingCategory === 'Reading Informational Text')).toBe(true)
    expect(centralIdeaEngineQuestions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === 'g3-id-central-idea-r0.1.0')).toBe(true)
    expect(centralIdeaEngineQuestions.every((question) => !/why did the author|author(?:'s)? purpose|claim and evidence/i.test(question.prompt))).toBe(true)
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T20:00:00.000Z'))
    expect(serialized).not.toContain('centralIdeaGuides')
    expect(serialized).not.toContain('centralIdeaStatement')
    expect(serialized).not.toContain('How Beach Grass Builds a Dune')
  })
})
