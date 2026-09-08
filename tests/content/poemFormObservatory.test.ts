import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks } from '../../src/domain/content/semanticQuestionAudit'
import { buildContentPackAudit, buildPoemFormGuideAudit } from '../../src/domain/content/packs'
import {
  poemFormGuides, poemFormObservatoryPack, poemFormPassages, poemFormQuestions, poemFormRecords,
} from '../../src/domain/content/packs/grade3/poetryPlanet/poemFormObservatory'
import { createDefaultQuestProgress } from '../../src/persistence'

describe('Grade 3 Poem Form Observatory production pack', () => {
  test('keeps the exact pack shape and question distribution', () => {
    expect(poemFormObservatoryPack.lessons).toHaveLength(7)
    expect(poemFormPassages).toHaveLength(7)
    expect(poemFormGuides).toHaveLength(7)
    expect(poemFormQuestions).toHaveLength(41)
    expect(poemFormPassages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(poemFormObservatoryPack.lessons.filter((lesson) => lesson.difficulty === 0 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(poemFormObservatoryPack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'GUIDED_PRACTICE')).toHaveLength(2)
    expect(poemFormObservatoryPack.lessons.filter((lesson) => lesson.difficulty === 1 && lesson.lessonRole === 'CHECKPOINT')).toHaveLength(3)
    expect(Object.fromEntries(['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].map((type) => [
      type, poemFormQuestions.filter((question) => question.questionType === type).length,
    ]))).toEqual({ multiple_choice: 17, multi_select: 7, hot_text: 7, table_match: 7, two_part: 3 })
  })

  test('uses the reviewed two-free, two-rhymed, one-haiku, two-limerick distribution', () => {
    expect(poemFormRecords.map((record) => record.form)).toEqual([
      'free-verse', 'rhymed-verse', 'haiku', 'limerick', 'free-verse', 'rhymed-verse', 'limerick',
    ])
    expect(poemFormGuides.filter((guide) => guide.form === 'free-verse')).toHaveLength(2)
    expect(poemFormGuides.filter((guide) => guide.form === 'rhymed-verse')).toHaveLength(2)
    expect(poemFormGuides.filter((guide) => guide.form === 'haiku')).toHaveLength(1)
    expect(poemFormGuides.filter((guide) => guide.form === 'limerick')).toHaveLength(2)
  })

  test('keeps line, rhyme, haiku, and limerick metadata exact and qualified', () => {
    for (const guide of poemFormGuides) {
      const poem = poemFormPassages.find((passage) => passage.passageIdentifier === guide.poemId)!
      expect(guide.lineCount).toBe(poem.poemStructure?.lines.length)
      expect(guide.stanzaCount).toBe(poem.poemStructure?.stanzas.length)
      expect(guide.definingFeatures.every((feature) => feature.evidenceLineIds.every((id) => poem.poemStructure?.lines.some((line) => line.lineId === id)))).toBe(true)
      if (guide.rhymeScheme) expect(guide.rhymeLines?.map((line) => line.rhymeLabel).join('')).toBe(guide.rhymeScheme)
    }
    const haiku = poemFormGuides.find((guide) => guide.form === 'haiku')!
    expect(haiku).toMatchObject({ lineCount: 3, classroomSyllablePattern: [5, 7, 5] })
    expect(`${haiku.formExplanation} ${haiku.comparisonNotes}`).toMatch(/classroom/i)
    expect(haiku.comparisonNotes).toMatch(/not a universal law/i)
    expect(poemFormGuides.filter((guide) => guide.form === 'limerick').every((guide) => guide.lineCount === 5 && guide.rhymeScheme === 'AABBA')).toBe(true)
    expect(poemFormGuides.filter((guide) => guide.form === 'free-verse').every((guide) => !guide.rhymeScheme && !/never rhymes/i.test(guide.formExplanation))).toBe(true)
  })

  test('uses a pronunciation-stable seven-syllable middle line in the classroom haiku', () => {
    const haiku = poemFormRecords.find((record) => record.form === 'haiku')!
    expect(haiku.lines).toEqual([
      'Soft snow covers grass',
      'One bright red bird settles here',
      'Morning holds its breath',
    ])
    expect(haiku.lines[1].split(' ')).toEqual(['One', 'bright', 'red', 'bird', 'settles', 'here'])
    expect(haiku.support.some((target) => target.word === 'cardinal')).toBe(false)
    expect(haiku.support.some((target) => target.word === 'bright')).toBe(true)
  })

  test('asks for the most exact taught form when specific and broad labels overlap', () => {
    const classifications = poemFormQuestions.filter((question) => /-q\d+-1$/.test(question.questionIdentifier))
    expect(classifications).toHaveLength(7)
    expect(classifications.every((question) => question.prompt.startsWith('Which of these taught poem forms gives the most exact name for'))).toBe(true)
  })

  test('makes transfer, rhyme-exemplar, and two-part selection constraints explicit', () => {
    expect(poemFormQuestions.find((question) => question.questionIdentifier === 'g3-pp-pfo-q6-3')?.prompt).toContain('most exact name')
    expect(poemFormQuestions.find((question) => question.questionIdentifier === 'g3-pp-pfo-q6-5')?.prompt).toContain('other line')
    const twoPartQuestions = poemFormQuestions.filter((question) => question.questionType === 'two_part')
    expect(twoPartQuestions).toHaveLength(3)
    expect(twoPartQuestions.every((question) => {
      const content = question.questionContent
      return content?.type === 'two_part' && content.partAPrompt.includes('most exact name')
    })).toBe(true)
  })

  test('aligns four Word Help targets with every poem without leaking form labels', () => {
    for (const passage of poemFormPassages) {
      expect(passage.wordSupportTargets).toHaveLength(4)
      for (const target of passage.wordSupportTargets ?? []) {
        const source = passage.sentences?.find((line) => line.sentenceId === target.sentenceId)?.text ?? ''
        expect(source).toContain(target.surfaceWord)
        expect(target.displayChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
        expect(target.focusParts.map((part) => part.text).join('')).toBe(target.surfaceWord)
        expect(target.surfaceWord).not.toMatch(/free verse|rhymed verse|haiku|limerick/i)
      }
    }
  })

  test('passes pack-specific, global content, and semantic audits', () => {
    expect(buildPoemFormGuideAudit(poemFormObservatoryPack)).toEqual([])
    expect(buildContentPackAudit([poemFormObservatoryPack])).toEqual([])
    expect(auditSemanticQuestionPacks([poemFormObservatoryPack])).toMatchObject({
      reviewedPackCount: 1, reviewedLessonCount: 7, reviewedCount: 41, issues: [],
    })
  })

  test('keeps every item inside ELA.3.R.1.4 and guide content outside persistence', () => {
    expect(poemFormQuestions.every((question) => question.gradeBand === 3 && question.benchmarkReference === 'ELA.3.R.1.4')).toBe(true)
    expect(poemFormQuestions.every((question) => question.skillIdentifier === 'g3-poetry-planet-poetry')).toBe(true)
    expect(poemFormQuestions.every((question) => question.reportingCategory === 'Reading Prose and Poetry')).toBe(true)
    expect(poemFormQuestions.every((question) => question.reviewStatus === 'DRAFT' && question.contentVersion === 'g3-pp-poem-form-r0.1.0')).toBe(true)
    expect(poemFormQuestions.every((question) => !/metaphor|personification|hyperbole|theme of|write a poem/i.test(question.prompt))).toBe(true)
    const serialized = JSON.stringify(createDefaultQuestProgress('2026-08-24T12:00:00.000Z'))
    expect(serialized).not.toContain('poemFormGuides')
    expect(serialized).not.toContain('rhymeScheme')
    expect(serialized).not.toContain('City Rain Window')
  })
})
