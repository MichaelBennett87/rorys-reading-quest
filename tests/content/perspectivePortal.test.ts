import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import { buildCharacterPerspectiveGuideAudit, buildContentPackAudit } from '../../src/domain/content/packs'
import {
  characterPerspectiveGuides,
  perspectivePortalPack,
  perspectivePortalPassages,
  perspectivePortalQuestions,
  perspectivePortalStories,
} from '../../src/domain/content/packs/grade3/storyScouts/perspectivePortal'
import { createDefaultQuestProgress } from '../../src/persistence'

describe('Grade 3 Perspective Portal production pack', () => {
  test('keeps the exact lesson, passage, guide, question, and support inventories', () => {
    expect(perspectivePortalPack.lessons).toHaveLength(7)
    expect(perspectivePortalPassages).toHaveLength(7)
    expect(characterPerspectiveGuides).toHaveLength(7)
    expect(perspectivePortalQuestions).toHaveLength(41)
    expect(perspectivePortalPassages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(perspectivePortalPassages.every((passage) => passage.wordSupportTargets?.length === 4)).toBe(true)
  })

  test('keeps exact lesson roles and question distribution', () => {
    expect(perspectivePortalPack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(perspectivePortalPack.lessons.filter((lesson) => lesson.difficulty === 3 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(perspectivePortalPack.lessons.filter((lesson) => lesson.difficulty === 3 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(Object.fromEntries(['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].map((type) => [
      type, perspectivePortalQuestions.filter((question) => question.questionType === type).length,
    ]))).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
    expect(perspectivePortalPack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE').every((lesson) => Boolean(lesson.teachingBlock))).toBe(true)
    expect(perspectivePortalPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT').every((lesson) => !lesson.teachingBlock)).toBe(true)
  })

  test('uses four different, two partly-similar, one similar, and three changed perspective records', () => {
    const relationships = characterPerspectiveGuides.flatMap((guide) => guide.comparisons.map((comparison) => comparison.relationship))
    expect(relationships.filter((value) => value === 'different')).toHaveLength(4)
    expect(relationships.filter((value) => value === 'partly-similar')).toHaveLength(2)
    expect(relationships.filter((value) => value === 'similar')).toHaveLength(1)
    expect(characterPerspectiveGuides.flatMap((guide) => guide.perspectiveChanges)).toHaveLength(3)
  })

  test('gives both characters resolved, varied evidence and keeps perspective distinct from feelings, traits, and narrator view', () => {
    for (const guide of characterPerspectiveGuides) {
      const passage = perspectivePortalPassages.find((entry) => entry.passageIdentifier === guide.passageId)!
      const ids = new Set(passage.sentences?.map((sentence) => sentence.sentenceId))
      expect(guide.characters).toHaveLength(2)
      for (const character of guide.characters) {
        expect(character.perspectiveStatement.trim().split(/\s+/).length).toBeGreaterThanOrEqual(6)
        expect(character.evidenceIds.length).toBeGreaterThanOrEqual(2)
        expect(character.evidenceIds.every((id) => ids.has(id))).toBe(true)
        expect(new Set(character.evidenceKinds).size).toBeGreaterThanOrEqual(2)
        expect(character.perspectiveStatement).not.toMatch(/third-person narrator|author believes|^[A-Z][a-z]+ (feels|is) [a-z]+\.?$/i)
      }
      expect(guide.comparisons.every((comparison) => comparison.characterAEvidenceIds.every((id) => ids.has(id)) && comparison.characterBEvidenceIds.every((id) => ids.has(id)))).toBe(true)
    }
  })

  test('keeps Word Help aligned and unrelated to keyed perspective statements', () => {
    const perspectiveWords = perspectivePortalStories.flatMap((story) => [story.characterA.perspective, story.characterB.perspective]).join(' ').toLowerCase()
    for (const passage of perspectivePortalPassages) {
      for (const target of passage.wordSupportTargets ?? []) {
        const source = passage.sentences?.find((entry) => entry.sentenceId === target.sentenceId)?.text ?? ''
        expect(source).toMatch(new RegExp(`\\b${target.surfaceWord}\\b`, 'i'))
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
        expect(target.spokenChunks.every((chunk) => chunk.speechText.trim().length > 0)).toBe(true)
        expect(target.focusParts.map((part) => part.text).join('')).toBe(target.surfaceWord)
        expect(perspectiveWords).not.toBe(target.surfaceWord.toLowerCase())
      }
    }
  })

  test('passes pack-specific, global content, and semantic audits before registration', () => {
    expect(buildCharacterPerspectiveGuideAudit(perspectivePortalPack)).toEqual([])
    expect(buildContentPackAudit([perspectivePortalPack])).toEqual([])
    expect(auditSemanticQuestionPacks([perspectivePortalPack])).toMatchObject({
      reviewedPackCount: 1, reviewedLessonCount: 7, reviewedCount: 41, issues: [],
    })
  })

  test('keeps every question inside the ELA.3.R.1.3 boundary', () => {
    expect(perspectivePortalQuestions.every((question) => question.gradeBand === 3)).toBe(true)
    expect(perspectivePortalQuestions.every((question) => question.benchmarkReference === 'ELA.3.R.1.3')).toBe(true)
    expect(perspectivePortalQuestions.every((question) => question.skillIdentifier === 'g3-story-scouts-prose')).toBe(true)
    expect(perspectivePortalQuestions.every((question) => question.reportingCategory === 'Reading Prose and Poetry')).toBe(true)
    expect(perspectivePortalQuestions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === 'g3-ss-perspective-r0.1.0')).toBe(true)
    expect(perspectivePortalQuestions.every((question) => !/theme of|poem form|author's perspective/i.test(question.prompt))).toBe(true)
  })

  test('does not persist authored character-perspective curriculum', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T12:00:00.000Z'))
    expect(serialized).not.toContain('characterPerspectiveGuides')
    expect(serialized).not.toContain('perspectiveStatement')
    expect(serialized).not.toContain('comparisonStatement')
    expect(serialized).not.toContain('The Rain Barrel Base')
  })
})
