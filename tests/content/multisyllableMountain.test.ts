import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks, buildActiveQuestionTruthInventory, buildBlindQuestionTruthProjection } from '../../src/domain/content'
import {
  buildContentPackAudit,
  buildMultisyllableDecodingGuideAudit,
  grade3WordForgeMultisyllableMountainPack,
  multisyllableMountainGuides,
  multisyllableMountainSupportTargets,
  multisyllableMountainTargets,
} from '../../src/domain/content/packs'
import { createDefaultQuestProgress } from '../../src/persistence'

const PACK_ID = 'g3-word-forge-multisyllable-mountain'
const VERSION = 'g3-wf-multisyllable-mountain-r0.1.0'

describe('Grade 3 Multisyllable Mountain authored pack', () => {
  test('keeps the exact lesson, passage, guide, target, support, and question shape', () => {
    const pack = grade3WordForgeMultisyllableMountainPack
    const typeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => {
      counts[question.questionType] = (counts[question.questionType] ?? 0) + 1
      return counts
    }, {})
    expect(pack.manifest).toMatchObject({
      packId: PACK_ID,
      contentVersion: VERSION,
      gradeBand: 3,
      worldId: 'word-forge',
      unitId: 'g3-wg-unit-3',
      primarySkillId: 'g3-word-forge-word-analysis',
      benchmarkReferences: ['ELA.3.F.1.3'],
      reviewStatus: 'DRAFT',
    })
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(multisyllableMountainGuides).toHaveLength(7)
    expect(multisyllableMountainTargets).toHaveLength(28)
    expect(multisyllableMountainSupportTargets).toHaveLength(28)
    expect(pack.questions).toHaveLength(41)
    expect(typeCounts).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE' && lesson.difficulty === 2)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE' && lesson.difficulty === 3)).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT' && lesson.difficulty === 3)).toHaveLength(3)
  })

  test('uses all six bounded patterns with defensible chunks and Word Help ownership', () => {
    expect(new Set(multisyllableMountainTargets.flatMap((target) => target.syllablePatterns))).toEqual(new Set([
      'closed', 'open', 'vowel-consonant-e', 'vowel-team', 'r-controlled', 'consonant-le',
    ]))
    expect(new Set(multisyllableMountainTargets.map((target) => target.surfaceWord)).size).toBe(28)
    for (const target of multisyllableMountainTargets) {
      expect(target.syllableCount).toBe(target.pronunciationChunks.length)
      expect(target.syllablePatterns).toHaveLength(target.syllableCount)
      expect(target.pronunciationChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
      expect(target.morphologicalHints.every((entry) => target.surfaceWord.includes(entry.text))).toBe(true)
      const support = multisyllableMountainSupportTargets.find((candidate) => candidate.targetId === target.targetId)
      expect(support).toBeDefined()
      expect(support?.surfaceWord).toBe(target.surfaceWord)
      expect(support?.sentenceId).toBe(target.sourceSentenceId)
      expect(support?.displayChunks.map((chunk) => chunk.displayText)).toEqual(target.pronunciationChunks.map((chunk) => chunk.displayText))
      expect(support?.focusParts.filter((part) => part.emphasis)).toHaveLength(1)
    }
  })

  test('passes pack, semantic, ownership, and blind-projection audits before registration', () => {
    const pack = grade3WordForgeMultisyllableMountainPack
    expect(buildMultisyllableDecodingGuideAudit(pack)).toEqual([])
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

  test('makes every checkpoint cover transfer, morphology, full chunking, and distinct analyses', () => {
    const checkpoints = grade3WordForgeMultisyllableMountainPack.lessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
    const required = [
      'open-closed-contrast', 'vowel-team-or-vce-transfer', 'r-controlled-or-consonant-le-transfer',
      'morphology-assisted-decoding', 'full-word-chunking', 'transfer-decoding', 'morphology-vs-reading-chunks',
    ]
    for (const checkpoint of checkpoints) {
      const questions = grade3WordForgeMultisyllableMountainPack.questions.filter((question) => question.lessonIdentifier === checkpoint.lessonId)
      const tags = new Set(questions.flatMap((question) => question.tags))
      expect(required.every((tag) => tags.has(tag))).toBe(true)
      const content = questions.find((question) => question.questionType === 'two_part')?.questionContent
      if (content?.type !== 'two_part') throw new Error(`Missing two-part analysis for ${checkpoint.lessonId}`)
      const partA = content.partAChoices.find((item) => item.id === content.partACorrectChoiceId)?.text
      const partB = content.partBChoices.find((item) => item.id === content.partBCorrectChoiceId)?.text
      expect(partA).toBeTruthy()
      expect(partB).toBeTruthy()
      expect(partA).not.toBe(partB)
    }
  })

  test('claims only the final F.1.3 branch and keeps fluency and vocabulary mastery outside this pack', () => {
    const manifest = grade3WordForgeMultisyllableMountainPack.manifest
    expect(manifest.coveredPatterns).toContain('multisyllabic-decoding')
    expect(manifest.coveredPatterns).not.toEqual(expect.arrayContaining(['oral-fluency', 'wcpm', 'prosody-mastery', 'unfamiliar-word-meaning']))
    expect(manifest.benchmarkReferences).not.toContain('ELA.3.F.1.4')
    expect(manifest.benchmarkReferences).not.toContain('ELA.3.V.1.2')
  })

  test('keeps multisyllable guide and authored answer content out of learner persistence', () => {
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T12:00:00.000Z'))
    expect(serialized).not.toContain('multisyllableDecodingGuides')
    expect(serialized).not.toContain('decodingSteps')
    expect(serialized).not.toContain('trailblazer')
  })
})
