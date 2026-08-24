import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import {
  buildCharacterDevelopmentGuideAudit,
  buildContentPackAudit,
  characterArcCampPack,
  characterArcPassages,
  characterArcQuestions,
  characterDevelopmentGuides,
} from '../../src/domain/content/packs'
import { createDefaultQuestProgress } from '../../src/persistence'

describe('Grade 3 Character Arc Camp production pack', () => {
  test('keeps the exact authored lesson, passage, guide, arc, question, and support inventories', () => {
    expect(characterArcCampPack.lessons).toHaveLength(7)
    expect(characterArcPassages).toHaveLength(7)
    expect(characterDevelopmentGuides).toHaveLength(7)
    expect(characterDevelopmentGuides.flatMap((guide) => guide.arcs)).toHaveLength(9)
    expect(characterDevelopmentGuides.filter((guide) => guide.arcs.length === 1)).toHaveLength(5)
    expect(characterDevelopmentGuides.filter((guide) => guide.arcs.length === 2)).toHaveLength(2)
    expect(characterArcQuestions).toHaveLength(41)
    expect(characterArcPassages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(characterArcPassages.every((passage) => passage.wordSupportTargets?.length === 4)).toBe(true)
  })

  test('keeps the exact lesson roles and question-type distribution', () => {
    expect(characterArcCampPack.lessons.filter((lesson) => lesson.difficulty === 0 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(characterArcCampPack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(characterArcCampPack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(Object.fromEntries(['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].map((type) => [
      type,
      characterArcQuestions.filter((question) => question.questionType === type).length,
    ]))).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
    expect(characterArcCampPack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE').every((lesson) => Boolean(lesson.teachingBlock))).toBe(true)
    expect(characterArcCampPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT').every((lesson) => !lesson.teachingBlock)).toBe(true)
  })

  test('keeps every arc ordered, plot-linked, and supported by action plus dialogue or thought', () => {
    for (const guide of characterDevelopmentGuides) {
      const sentenceIds = new Set(characterArcPassages.find((passage) => passage.passageIdentifier === guide.passageId)?.sentences?.map((sentence) => sentence.sentenceId))
      for (const arc of guide.arcs) {
        expect(arc.stages.map((stage) => stage.stage)).toEqual(['beginning', 'middle', 'end'])
        expect(arc.stages[0].stateStatement).not.toBe(arc.stages[2].stateStatement)
        expect(arc.stages.flatMap((stage) => stage.evidenceKinds)).toContain('action')
        expect(arc.stages.flatMap((stage) => stage.evidenceKinds).some((kind) => kind === 'dialogue' || kind === 'thought')).toBe(true)
        expect(arc.stages.flatMap((stage) => stage.evidenceIds).every((id) => sentenceIds.has(id))).toBe(true)
        expect(arc.turningPointEvidenceIds.every((id) => sentenceIds.has(id))).toBe(true)
        expect(arc.plotCauseStatement.length).toBeGreaterThan(0)
        expect(arc.developmentSummary).toMatch(/At first/i)
        expect(arc.developmentSummary).toMatch(/by the end/i)
      }
    }
  })

  test('keeps Word Help aligned without exposing a development answer', () => {
    for (const passage of characterArcPassages) {
      for (const target of passage.wordSupportTargets ?? []) {
        const sentence = passage.sentences?.find((entry) => entry.sentenceId === target.sentenceId)
        expect(sentence?.text).toMatch(new RegExp(`\\b${target.surfaceWord}\\b`, 'i'))
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
        expect(target.spokenChunks.every((chunk) => chunk.speechText.trim().length > 0)).toBe(true)
        expect(target.focusParts.map((part) => part.text).join('')).toBe(target.surfaceWord)
        expect(target.focusParts.some((part) => part.emphasis)).toBe(true)
        expect(JSON.stringify(target)).not.toMatch(/developmentSummary|turningPointEvidenceIds/)
      }
    }
  })

  test('passes pack-specific, global content, and semantic audits before registration', () => {
    expect(buildCharacterDevelopmentGuideAudit(characterArcCampPack)).toEqual([])
    expect(buildContentPackAudit([characterArcCampPack])).toEqual([])
    expect(auditSemanticQuestionPacks([characterArcCampPack])).toMatchObject({
      reviewedPackCount: 1,
      reviewedLessonCount: 7,
      reviewedCount: 41,
      issues: [],
    })
  })

  test('keeps every question inside the ELA.3.R.1.1 boundary', () => {
    expect(characterArcQuestions.every((question) => question.gradeBand === 3)).toBe(true)
    expect(characterArcQuestions.every((question) => question.benchmarkReference === 'ELA.3.R.1.1')).toBe(true)
    expect(characterArcQuestions.every((question) => question.skillIdentifier === 'g3-story-scouts-prose')).toBe(true)
    expect(characterArcQuestions.every((question) => question.reportingCategory === 'Reading Prose and Poetry')).toBe(true)
    expect(characterArcQuestions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === 'g3-ss-character-arc-r0.1.0')).toBe(true)
    expect(characterArcQuestions.every((question) => !/theme|perspective|narrator point of view|poem/i.test(question.prompt))).toBe(true)
  })

  test('does not persist authored character-development curriculum', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T12:00:00.000Z'))
    expect(serialized).not.toContain('characterDevelopmentGuides')
    expect(serialized).not.toContain('developmentSummary')
    expect(serialized).not.toContain('turningPointEvidenceIds')
    expect(serialized).not.toContain('The Quiet Map Maker')
  })
})
