import { describe, expect, test } from 'vitest'

import { validateContent } from '../../src/domain/content'
import { buildContentPackAudit, buildFigurativeLanguageGuideAudit } from '../../src/domain/content/packs'
import { figurativeFortressPack } from '../../src/domain/content/packs/grade3/compareCastle/figurativeFortress'
import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'

describe('Figurative Fortress authored pack', () => {
  test('has the exact lesson, source, target, support, and question shape', () => {
    const pack = figurativeFortressPack
    const formats = pack.passages.map((passage) => passage.contentKind)
    const targets = pack.figurativeLanguageGuides!.flatMap((guide) => guide.targets)
    const typeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => ({ ...counts, [question.questionType]: (counts[question.questionType] ?? 0) + 1 }), {})
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.figurativeLanguageGuides).toHaveLength(7)
    expect(targets).toHaveLength(28)
    expect(pack.questions).toHaveLength(41)
    expect(pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(formats.filter((format) => format === 'prose')).toHaveLength(3)
    expect(formats.filter((format) => format === 'poem')).toHaveLength(2)
    expect(formats.filter((format) => format === 'informational')).toHaveLength(2)
    expect(targets.filter((target) => target.kind === 'metaphor')).toHaveLength(10)
    expect(targets.filter((target) => target.kind === 'personification')).toHaveLength(9)
    expect(targets.filter((target) => target.kind === 'hyperbole')).toHaveLength(9)
    expect(typeCounts).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
  })

  test('keeps every guide source-owned, DRAFT, versioned, and uniquely classified', () => {
    const pack = figurativeFortressPack
    const targets = pack.figurativeLanguageGuides!.flatMap((guide) => guide.targets)
    expect(new Set(targets.map((target) => target.targetId)).size).toBe(28)
    for (const guide of pack.figurativeLanguageGuides!) {
      const passage = pack.passages.find((entry) => entry.passageIdentifier === guide.passageId)!
      expect(guide.targets).toHaveLength(4)
      expect(guide).toMatchObject({ reviewStatus: 'DRAFT', contentVersion: 'g3-cg-figurative-fortress-r0.1.0' })
      for (const target of guide.targets) {
        expect(passage.passageText).toContain(target.expressionText)
        expect(target.literalReading).not.toBe(target.figurativeMeaning)
        expect(target.sourceEvidenceIds.length).toBeGreaterThan(0)
        expect(target.contextEvidenceIds.length).toBeGreaterThan(0)
      }
    }
    expect(buildFigurativeLanguageGuideAudit(pack)).toEqual([])
  })

  test('uses only the five accepted scored types with owned evidence and no deterministic semantic issue', () => {
    const pack = figurativeFortressPack
    expect(pack.questions.every((question) => question.gradeBand === 3 && question.benchmarkReference === 'ELA.3.R.3.1')).toBe(true)
    expect(pack.questions.every((question) => question.skillIdentifier === 'g3-across-genres-reading' && question.reportingCategory === 'Reading Across Genres and Vocabulary')).toBe(true)
    expect(pack.questions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === 'g3-cg-figurative-fortress-r0.1.0')).toBe(true)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(4)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 0)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE').every((lesson) => lesson.teachingBlock && !lesson.eligiblePurposes.includes('progression'))).toBe(true)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT').every((lesson) => !lesson.teachingBlock && !lesson.eligiblePurposes.includes('remediation'))).toBe(true)
    expect(validateContent({ passages: pack.passages, questions: pack.questions })).toEqual([])
    expect(buildContentPackAudit([pack])).toEqual([])
    expect(auditSemanticQuestionPacks([pack])).toMatchObject({ reviewedPackCount: 1, reviewedLessonCount: 7, reviewedCount: 41, issues: [] })
  })

  test('keeps informational figurative wording paired with literal factual explanation', () => {
    const informational = figurativeFortressPack.passages.filter((passage) => passage.contentKind === 'informational')
    expect(informational).toHaveLength(2)
    expect(informational.every((passage) => passage.informationalStructure && passage.informationalStructure.sections.length === 3)).toBe(true)
    expect(informational[0].passageText).toContain('In literal terms')
    expect(informational[1].passageText).toContain('using hyperbole')
    expect(informational[1].passageText).toContain('realistic explanations')
  })
})
