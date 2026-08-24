import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import { buildContentPackAudit, buildThemeDevelopmentGuideAudit } from '../../src/domain/content/packs'
import {
  themeDevelopmentGuides,
  themeDevelopmentPassages,
  themeDevelopmentQuestions,
  themeDevelopmentStories,
  themeDevelopmentTrailPack,
} from '../../src/domain/content/packs/grade3/storyScouts/themeDevelopmentTrail'
import { createDefaultQuestProgress } from '../../src/persistence'

describe('Grade 3 Theme Development Trail production pack', () => {
  test('keeps the exact lesson, passage, guide, question, and support inventories', () => {
    expect(themeDevelopmentTrailPack.lessons).toHaveLength(7)
    expect(themeDevelopmentPassages).toHaveLength(7)
    expect(themeDevelopmentGuides).toHaveLength(7)
    expect(themeDevelopmentQuestions).toHaveLength(41)
    expect(themeDevelopmentPassages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(themeDevelopmentPassages.every((passage) => passage.wordSupportTargets?.length === 4)).toBe(true)
  })

  test('keeps the exact lesson roles and question distribution', () => {
    expect(themeDevelopmentTrailPack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(themeDevelopmentTrailPack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(themeDevelopmentTrailPack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(Object.fromEntries(['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].map((type) => [
      type,
      themeDevelopmentQuestions.filter((question) => question.questionType === type).length,
    ]))).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
    expect(themeDevelopmentTrailPack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE').every((lesson) => Boolean(lesson.teachingBlock))).toBe(true)
    expect(themeDevelopmentTrailPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT').every((lesson) => !lesson.teachingBlock)).toBe(true)
  })

  test('keeps seven distinct and unambiguous supported-theme families', () => {
    expect(new Set(themeDevelopmentStories.map((story) => story.themeFamily)).size).toBe(7)
    for (const guide of themeDevelopmentGuides) {
      expect(guide.supportedTheme).toMatchObject({ candidateKind: 'theme', supported: true })
      expect(guide.supportedTheme.statement.trim().split(/\s+/).length).toBeGreaterThanOrEqual(6)
      expect(guide.plausibleDistractorThemes).toHaveLength(3)
      expect(guide.plausibleDistractorThemes.every((candidate) => !candidate.supported)).toBe(true)
      expect(guide.plausibleDistractorThemes.map((candidate) => candidate.candidateKind)).toEqual(['topic', 'summary', 'unsupported-theme'])
      expect(new Set([guide.supportedTheme.statement, ...guide.plausibleDistractorThemes.map((candidate) => candidate.statement)]).size).toBe(4)
    }
  })

  test('traces each theme through beginning, middle, turning point, and end evidence', () => {
    for (const guide of themeDevelopmentGuides) {
      const passage = themeDevelopmentPassages.find((entry) => entry.passageIdentifier === guide.passageId)!
      const evidenceIds = new Set(passage.sentences?.map((sentence) => sentence.sentenceId))
      expect(guide.stages.map((stage) => stage.stage)).toEqual(['beginning', 'middle', 'end'])
      expect(guide.stages.every((stage) => stage.evidenceIds.length > 0 && stage.evidenceIds.every((id) => evidenceIds.has(id)))).toBe(true)
      expect(guide.turningPointEvidenceIds.every((id) => evidenceIds.has(id))).toBe(true)
      expect(guide.developmentSummary).toMatch(/beginning/i)
      expect(guide.developmentSummary).toMatch(/middle/i)
      expect(guide.developmentSummary).toMatch(/end/i)
    }
  })

  test('keeps Word Help aligned without leaking keyed themes', () => {
    const themes = themeDevelopmentStories.map((story) => story.supportedTheme.toLowerCase())
    for (const passage of themeDevelopmentPassages) {
      for (const target of passage.wordSupportTargets ?? []) {
        const sentence = passage.sentences?.find((entry) => entry.sentenceId === target.sentenceId)
        expect(sentence?.text).toMatch(new RegExp(`\\b${target.surfaceWord}\\b`, 'i'))
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
        expect(target.spokenChunks.every((chunk) => chunk.speechText.trim().length > 0)).toBe(true)
        expect(target.focusParts.map((part) => part.text).join('')).toBe(target.surfaceWord)
        expect(themes.some((theme) => theme === target.surfaceWord.toLowerCase())).toBe(false)
      }
    }
  })

  test('passes pack-specific, global content, and semantic audits before registration', () => {
    expect(buildThemeDevelopmentGuideAudit(themeDevelopmentTrailPack)).toEqual([])
    expect(buildContentPackAudit([themeDevelopmentTrailPack])).toEqual([])
    expect(auditSemanticQuestionPacks([themeDevelopmentTrailPack])).toMatchObject({
      reviewedPackCount: 1,
      reviewedLessonCount: 7,
      reviewedCount: 41,
      issues: [],
    })
  })

  test('keeps every question inside the ELA.3.R.1.2 boundary', () => {
    expect(themeDevelopmentQuestions.every((question) => question.gradeBand === 3)).toBe(true)
    expect(themeDevelopmentQuestions.every((question) => question.benchmarkReference === 'ELA.3.R.1.2')).toBe(true)
    expect(themeDevelopmentQuestions.every((question) => question.skillIdentifier === 'g3-story-scouts-prose')).toBe(true)
    expect(themeDevelopmentQuestions.every((question) => question.reportingCategory === 'Reading Prose and Poetry')).toBe(true)
    expect(themeDevelopmentQuestions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === 'g3-ss-theme-development-r0.1.0')).toBe(true)
    expect(themeDevelopmentQuestions.every((question) => !/perspective|narrator point of view|poem form/i.test(question.prompt))).toBe(true)
  })

  test('does not persist authored theme-development curriculum', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T12:00:00.000Z'))
    expect(serialized).not.toContain('themeDevelopmentGuides')
    expect(serialized).not.toContain('supportedTheme')
    expect(serialized).not.toContain('developmentSummary')
    expect(serialized).not.toContain('The Two Bridge Models')
  })
})
