import { describe, expect, test } from 'vitest'

import { parseScopedEvidenceReference, resolveLessonEvidence } from '../../src/domain/content/evidence'
import { buildContentPackAudit, buildGrade3AuthorComparisonGuideAudit } from '../../src/domain/content/packs'
import {
  AUTHOR_LENS_BENCHMARK,
  AUTHOR_LENS_PACK_ID,
  AUTHOR_LENS_VERSION,
  authorLensComparisonGuides,
  authorLensPairRecords,
  authorLensTowerPack,
} from '../../src/domain/content/packs/grade3/compareCastle/authorLensTower'

describe('Grade 3 Compare Castle: Author Lens Tower', () => {
  test('has the exact paired-text, lesson, guide, support, and question inventory', () => {
    const pack = authorLensTowerPack
    const typeCounts = pack.questions.reduce<Record<string, number>>((counts, question) => ({ ...counts, [question.questionType]: (counts[question.questionType] ?? 0) + 1 }), {})
    expect(pack.manifest).toMatchObject({ packId: AUTHOR_LENS_PACK_ID, contentVersion: AUTHOR_LENS_VERSION, benchmarkReferences: [AUTHOR_LENS_BENCHMARK], worldId: 'compare-castle', unitId: 'g3-cg-unit-3', primarySkillId: 'g3-across-genres-reading', gradeBand: 3, reviewStatus: 'DRAFT' })
    expect(pack.lessons).toHaveLength(7)
    expect(pack.pairedTextSets).toHaveLength(7)
    expect(pack.passages).toHaveLength(14)
    expect(pack.grade3AuthorComparisonGuides).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(authorLensPairRecords.filter((record) => record.kind === 'informational')).toHaveLength(4)
    expect(authorLensPairRecords.filter((record) => record.kind === 'literary')).toHaveLength(3)
    expect(typeCounts).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 2 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 3 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(pack.lessons.filter((lesson) => lesson.difficulty === 3 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
  })

  test('keeps every shared basis and comparison source-scoped to both texts', () => {
    const pack = authorLensTowerPack
    const passagesById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
    const usedPassages = new Set<string>()
    for (const guide of authorLensComparisonGuides) {
      const pairedSet = pack.pairedTextSets!.find((pair) => pair.pairId === guide.pairedTextSetId)!
      expect(pairedSet.members.map((member) => member.label)).toEqual(['Text A', 'Text B'])
      expect(guide.similarities).toHaveLength(2)
      expect(guide.differences).toHaveLength(2)
      expect(guide).toMatchObject({ evidenceFromBothRequired: true, reviewStatus: 'DRAFT', contentVersion: AUTHOR_LENS_VERSION })
      const [textA, textB] = pairedSet.members
      expect(usedPassages.has(textA.passageId)).toBe(false)
      expect(usedPassages.has(textB.passageId)).toBe(false)
      usedPassages.add(textA.passageId)
      usedPassages.add(textB.passageId)
      for (const point of [...guide.similarities, ...guide.differences]) {
        const textAEvidenceIds = 'textAEvidenceIds' in point ? point.textAEvidenceIds : []
        const textBEvidenceIds = 'textBEvidenceIds' in point ? point.textBEvidenceIds : []
        expect(textAEvidenceIds.length).toBeGreaterThan(0)
        expect(textBEvidenceIds.length).toBeGreaterThan(0)
        for (const reference of textAEvidenceIds) {
          expect(parseScopedEvidenceReference(reference)?.passageId).toBe(textA.passageId)
          expect(resolveLessonEvidence(passagesById, textA.passageId, reference)?.passageId).toBe(textA.passageId)
        }
        for (const reference of textBEvidenceIds) {
          expect(parseScopedEvidenceReference(reference)?.passageId).toBe(textB.passageId)
          expect(resolveLessonEvidence(passagesById, textB.passageId, reference)?.passageId).toBe(textB.passageId)
        }
      }
    }
    expect(usedPassages.size).toBe(14)
  })

  test('uses learner-visible hot text and source-owned Word Help without answer leakage', () => {
    for (const passage of authorLensTowerPack.passages) {
      expect(passage.wordSupportTargets).toHaveLength(2)
      for (const target of passage.wordSupportTargets ?? []) {
        const sourceSentence = passage.sentences?.find((sentence) => sentence.sentenceId === target.sentenceId)?.text ?? ''
        expect(sourceSentence.toLowerCase()).toContain(target.surfaceWord.toLowerCase())
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
      }
    }
    for (const question of authorLensTowerPack.questions.filter((question) => question.questionType === 'hot_text')) {
      const content = question.questionContent
      if (!content || content.type !== 'hot_text') throw new Error('Expected hot-text content.')
      const passage = authorLensTowerPack.passages.find((candidate) => candidate.passageIdentifier === parseScopedEvidenceReference(question.evidenceReference)?.passageId)
      expect(passage).toBeTruthy()
      for (const segment of content.selectableSegments) expect(passage?.passageText).toContain(segment.text)
    }
  })

  test('passes the deterministic guide, pack, and construct audits with no scope drift', () => {
    expect(buildGrade3AuthorComparisonGuideAudit(authorLensTowerPack)).toEqual([])
    expect(buildContentPackAudit([authorLensTowerPack])).toEqual([])
    const tags = new Set(authorLensTowerPack.questions.flatMap((question) => question.tags ?? []))
    for (const pattern of ['two-author-comparison', 'same-topic-or-theme', 'presentation-similarity', 'presentation-difference', 'evidence-from-both-texts']) expect(tags.has(pattern)).toBe(true)
    const serialized = JSON.stringify(authorLensTowerPack)
    expect(serialized).not.toMatch(/author wanted|wanted the reader|make the reader feel/i)
    expect(serialized).not.toMatch(/bias|propaganda|credibility|rhetorical appeal/i)
  })
})
