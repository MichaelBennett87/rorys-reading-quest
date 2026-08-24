import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks, buildActiveQuestionTruthInventory, buildBlindQuestionTruthProjection } from '../../src/domain/content'
import {
  buildContentPackAudit,
  buildDerivationalSuffixGuideAudit,
  grade3WordForgeSuffixShifterPack,
  suffixShifterGuides,
  suffixShifterSupportTargets,
  suffixShifterTargets,
} from '../../src/domain/content/packs'
import { createDefaultQuestProgress } from '../../src/persistence'

const PACK_ID = 'g3-word-forge-suffix-shifter'
const VERSION = 'g3-wf-suffix-shifter-r0.1.0'

describe('Grade 3 Suffix Shifter authored pack', () => {
  test('keeps the exact lesson, passage, guide, target, support, and question shape', () => {
    const pack = grade3WordForgeSuffixShifterPack
    const typeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})
    expect(pack.manifest).toMatchObject({
      packId: PACK_ID,
      contentVersion: VERSION,
      gradeBand: 3,
      worldId: 'word-forge',
      unitId: 'g3-wg-unit-2',
      primarySkillId: 'g3-word-forge-word-analysis',
      benchmarkReferences: ['ELA.3.F.1.3'],
      reviewStatus: 'DRAFT',
    })
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(suffixShifterGuides).toHaveLength(7)
    expect(suffixShifterTargets).toHaveLength(28)
    expect(suffixShifterSupportTargets).toHaveLength(28)
    expect(pack.questions).toHaveLength(41)
    expect(typeCounts).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE' && lesson.difficulty === 1)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE' && lesson.difficulty === 2)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT' && lesson.difficulty === 2)).toHaveLength(3)
  })

  test('uses eight transparent suffix families with accurate role changes and Word Help ownership', () => {
    const expectedRoles = new Map([
      ['ness', 'adjective:noun'], ['ment', 'verb:noun'], ['er', 'verb:noun'], ['ful', 'noun:adjective'],
      ['less', 'noun:adjective'], ['ly', 'adjective:adverb'], ['able', 'verb:adjective'], ['y', 'noun:adjective'],
    ])
    expect(new Set(suffixShifterTargets.map((target) => target.suffix))).toEqual(new Set(expectedRoles.keys()))
    expect(suffixShifterTargets.every((target) => `${target.baseWord}${target.suffix}` === target.derivedWord)).toBe(true)
    expect(suffixShifterTargets.every((target) => (
      expectedRoles.get(target.suffix) === `${target.baseWordRole}:${target.derivedWordRole}`
    ))).toBe(true)
    expect(suffixShifterTargets.every((target) => target.morphologicalChunks.map((chunk) => chunk.text).join('') === target.derivedWord)).toBe(true)
    expect(suffixShifterTargets.every((target) => target.readingChunks.map((chunk) => chunk.displayText).join('') === target.derivedWord)).toBe(true)
    for (const target of suffixShifterTargets) {
      const support = suffixShifterSupportTargets.find((candidate) => candidate.targetId === target.targetId)
      expect(support).toBeDefined()
      expect(support?.surfaceWord).toBe(target.derivedWord)
      expect(support?.sentenceId).toBe(target.sentenceId)
      expect(support?.focusParts.filter((part) => part.emphasis).map((part) => part.text).join('')).toBe(target.suffix)
      expect(support?.displayChunks.map((chunk) => chunk.displayText)).toEqual(target.readingChunks.map((chunk) => chunk.displayText))
    }
    expect(suffixShifterTargets.some((target) => target.suffix === 'tion')).toBe(false)
  })

  test('passes pack, semantic, ownership, and blind-projection audits before registration', () => {
    const pack = grade3WordForgeSuffixShifterPack
    expect(buildDerivationalSuffixGuideAudit(pack)).toEqual([])
    expect(buildContentPackAudit([pack])).toEqual([])
    expect(auditSemanticQuestionPacks([pack])).toMatchObject({ reviewedPackCount: 1, reviewedLessonCount: 7, reviewedCount: 41, issues: [] })
    const inventory = buildActiveQuestionTruthInventory([pack])
    expect(inventory.issues).toEqual([])
    expect(inventory.records).toHaveLength(41)
    expect(buildBlindQuestionTruthProjection([pack])).toHaveLength(41)
    expect(pack.questions.every((question) => (
      question.gradeBand === 3
      && question.benchmarkReference === 'ELA.3.F.1.3'
      && question.skillIdentifier === 'g3-word-forge-word-analysis'
      && question.reportingCategory === 'Foundational Skills Bridge'
      && question.reviewStatus === 'DRAFT'
      && question.contentVersion === VERSION
      && (question.explanation ?? '').trim().length > 0
    ))).toBe(true)
  })

  test('makes every checkpoint visibly distinguish meaningful parts from reading chunks', () => {
    const checkpoints = grade3WordForgeSuffixShifterPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
    for (const checkpoint of checkpoints) {
      const question = grade3WordForgeSuffixShifterPack.questions.find((candidate) => (
        candidate.lessonIdentifier === checkpoint.lessonId && candidate.questionType === 'two_part'
      ))
      expect(question?.prompt).toContain('meaningful parts and reading chunks')
      expect(question?.tags).toContain('root-affix-vs-syllable-distinction')
      const content = question?.questionContent
      if (content?.type !== 'two_part') throw new Error(`Missing two-part analysis for ${checkpoint.lessonId}`)
      const partA = content.partAChoices.find((choice) => choice.id === content.partACorrectChoiceId)?.text
      const partB = content.partBChoices.find((choice) => choice.id === content.partBCorrectChoiceId)?.text
      expect(partA).toBeTruthy()
      expect(partB).toBeTruthy()
      expect(partA).not.toBe(partB)
    }
  })

  test('keeps systematic multisyllabic and vocabulary-meaning claims outside Phase 7A2', () => {
    const manifest = grade3WordForgeSuffixShifterPack.manifest
    expect(manifest.coveredPatterns).toEqual(expect.arrayContaining(['derivational-suffix-decoding', 'part-of-speech-change']))
    expect(manifest.coveredPatterns).not.toEqual(expect.arrayContaining(['multisyllabic-decoding', 'unfamiliar-word-meaning']))
    expect(manifest.benchmarkReferences).not.toContain('ELA.3.V.1.2')
    expect(manifest.supportingBenchmarkReferences ?? []).not.toContain('ELA.3.V.1.2')
  })

  test('keeps derivational guide and authored answer content out of learner persistence', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T12:00:00.000Z'))
    expect(serialized).not.toContain('derivationalSuffixGuides')
    expect(serialized).not.toContain('transformationExplanation')
    expect(serialized).not.toContain('kindness')
  })
})
