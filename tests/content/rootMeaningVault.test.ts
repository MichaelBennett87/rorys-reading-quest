import { describe, expect, test } from 'vitest'

import { buildRootMeaningGuideAudit } from '../../src/domain/content/packs/rootMeaningGuideAudit'
import {
  grade3ContextCavernRootMeaningVaultPack,
  rootMeaningGuides,
  rootMeaningVaultQuestions,
  rootMeaningWords,
} from '../../src/domain/content/packs/grade3/contextCavern/rootMeaningVault'

describe('Grade 3 Root Meaning Vault pack', () => {
  test('keeps the exact bounded pack inventory and family distribution', () => {
    const pack = grade3ContextCavernRootMeaningVaultPack
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.passages.filter((passage) => passage.contentKind === 'informational')).toHaveLength(4)
    expect(pack.passages.filter((passage) => passage.contentKind === 'prose')).toHaveLength(3)
    expect(rootMeaningGuides).toHaveLength(7)
    expect(rootMeaningWords).toHaveLength(28)
    expect(new Set(rootMeaningWords)).toHaveLength(28)
    expect(rootMeaningVaultQuestions).toHaveLength(41)
    expect(pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(pack.passages.map((passage) => passage.readingContext)).toEqual([
      'A museum helper uses prefixes and context to repair mixed-up exhibit labels.',
      'A project note explains how suffixes help describe materials and helpful choices.',
      'Two friends use transparent Greek roots while preparing a science fair transportation model.',
      'An exhibit guide uses transparent Latin roots to explain carrying, saying, and seeing.',
      'A club team uses English bases and affixes to follow a safe warm-air paper-spiral demonstration plan.',
      'A museum note connects Greek and Latin roots across space science, life science, communication, and sound.',
      'A school design note uses roots, bases, and suffixes to explain a water-saving system.',
    ])
    const familyCounts = rootMeaningGuides.flatMap((guide) => guide.targets).reduce<Record<string, number>>((counts, target) => ({ ...counts, [target.primaryFamily]: (counts[target.primaryFamily] ?? 0) + 1 }), {})
    expect(familyCounts).toEqual({ 'greek-root': 7, 'latin-root': 7, 'english-prefix-base': 7, 'english-base-suffix': 7 })
  })

  test('uses the exact five-question-type distribution', () => {
    const counts = rootMeaningVaultQuestions.reduce<Record<string, number>>((result, question) => ({ ...result, [question.questionType]: (result[question.questionType] ?? 0) + 1 }), {})
    expect(counts).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
  })

  test('passes the deterministic root-meaning semantic audit', () => {
    expect(buildRootMeaningGuideAudit(grade3ContextCavernRootMeaningVaultPack)).toEqual([])
  })

  test('keeps every target source-owned, transparent, and context-confirmed', () => {
    const passageById = new Map(grade3ContextCavernRootMeaningVaultPack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
    for (const guide of rootMeaningGuides) {
      const passage = passageById.get(guide.passageId)!
      const sentences = new Map((passage.sentences ?? []).map((sentence) => [sentence.sentenceId, sentence.text] as const))
      expect(guide.targets).toHaveLength(4)
      for (const target of guide.targets) {
        expect(sentences.get(target.sourceSentenceId)?.toLowerCase()).toContain(target.surfaceWord)
        expect(target.parts.map((part) => part.surfaceForm).join('')).toBe(target.surfaceWord)
        expect(target.parts.filter((part) => part.kind !== 'connector').every((part) => part.contributesMeaning)).toBe(true)
        expect(target.contextEvidenceIds.every((id) => sentences.has(id))).toBe(true)
        expect(target.transparentComposition).toBe(true)
      }
    }
  })

  test('separates meaning parts from pronounceable Word Help chunks', () => {
    const guideTarget = rootMeaningGuides.flatMap((guide) => guide.targets).find((target) => target.surfaceWord === 'thermometer')!
    const supportTarget = grade3ContextCavernRootMeaningVaultPack.passages.flatMap((passage) => passage.wordSupportTargets ?? []).find((target) => target.surfaceWord === 'thermometer')!
    expect(guideTarget.parts.map((part) => part.surfaceForm)).toEqual(['therm', 'o', 'meter'])
    expect(supportTarget.spokenChunks.map((chunk) => chunk.speechText)).toEqual(['thur', 'mom', 'uh', 'tur'])
    expect(supportTarget.spokenChunks).toHaveLength(4)
  })
})
