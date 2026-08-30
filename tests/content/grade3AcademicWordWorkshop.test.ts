import { describe, expect, test } from 'vitest'

import {
  grade3AcademicVocabularyGuides,
  grade3AcademicWords,
  grade3AcademicWordInfo,
  grade3ContextCavernAcademicWordWorkshopPack,
} from '../../src/domain/content/packs/grade3/contextCavern/academicWordWorkshop'
import { buildGrade3AcademicVocabularyGuideAudit } from '../../src/domain/content/packs'

const PACK_ID = 'g3-context-cavern-academic-word-workshop'
const CONTENT_VERSION = 'g3-cc-academic-word-r0.1.0'

describe('Grade 3 Academic Word Workshop production pack', () => {
  test('keeps the exact bounded pack and question shape', () => {
    const pack = grade3ContextCavernAcademicWordWorkshopPack
    const questionTypes = pack.questions.reduce<Record<string, number>>((counts, question) => {
      const type = question.questionContent?.type ?? 'missing'
      counts[type] = (counts[type] ?? 0) + 1
      return counts
    }, {})

    expect(pack.manifest).toMatchObject({
      packId: PACK_ID,
      contentVersion: CONTENT_VERSION,
      gradeBand: 3,
      worldId: 'context-cavern',
      unitId: 'g3-cc-unit-1',
      primarySkillId: 'g3-context-cavern-vocabulary',
      benchmarkReferences: [],
      supportingBenchmarkReferences: ['ELA.3.V.1.1'],
      coverageKind: 'supportive_practice',
      reviewStatus: 'DRAFT',
    })
    expect(pack.lessons).toHaveLength(7)
    expect(pack.passages).toHaveLength(7)
    expect(pack.questions).toHaveLength(41)
    expect(pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])).toHaveLength(28)
    expect(questionTypes).toEqual({
      multiple_choice: 17,
      multi_select: 7,
      hot_text: 7,
      table_match: 7,
      two_part: 3,
    })
  })

  test('keeps seven guides and twenty-eight unique, source-owned targets', () => {
    const targets = grade3AcademicVocabularyGuides.flatMap((guide) => guide.targets)
    const sourceSentences = new Map(
      grade3ContextCavernAcademicWordWorkshopPack.passages.flatMap((passage) =>
        (passage.sentences ?? []).map((sentence) => [sentence.sentenceId, sentence.text] as const),
      ),
    )

    expect(grade3AcademicVocabularyGuides).toHaveLength(7)
    expect(grade3AcademicVocabularyGuides.every((guide) => guide.targets.length === 4)).toBe(true)
    expect(targets).toHaveLength(28)
    expect(targets.map((target) => target.word).sort()).toEqual([...grade3AcademicWords].sort())
    expect(new Set(targets.map((target) => target.word)).size).toBe(28)
    expect(new Set(targets.map((target) => target.targetId)).size).toBe(28)
    for (const target of targets) {
      expect(target.subjectContexts.length).toBeGreaterThanOrEqual(2)
      expect(target.sourceSentenceIds).toHaveLength(1)
      expect(sourceSentences.get(target.sourceSentenceIds[0])?.toLowerCase()).toContain(target.word)
      expect(target.speakingFrame.toLowerCase()).toContain(target.word)
      expect(target.writingFrame.toLowerCase()).toContain(target.word)
      expect(target.appropriateUseExamples.every((example) => example.toLowerCase().includes(target.word))).toBe(true)
      expect(target.inappropriateUseExample.toLowerCase()).toContain(target.word)
      expect(target.inappropriateUseReason.trim().length).toBeGreaterThan(10)
      expect(target.precisionNote.trim().length).toBeGreaterThan(10)
    }
  })

  test('preserves the supportive-practice and constrained-response boundary', () => {
    expect(grade3AcademicVocabularyGuides.every((guide) => (
      guide.supportivePracticeOnly
      && !guide.openResponseScoring
      && !guide.oralScoring
      && guide.reviewStatus === 'DRAFT'
      && guide.contentVersion === CONTENT_VERSION
    ))).toBe(true)
    expect(grade3ContextCavernAcademicWordWorkshopPack.questions.every((question) => (
      question.gradeBand === 3
      && question.benchmarkReference === 'ELA.3.V.1.1'
      && question.skillIdentifier === 'g3-context-cavern-vocabulary'
      && question.reportingCategory === 'Reading Across Genres and Vocabulary'
      && question.reviewStatus === 'DRAFT'
      && question.contentVersion === CONTENT_VERSION
      && ['multiple_choice', 'multi_select', 'hot_text', 'table_match', 'two_part'].includes(question.questionContent?.type ?? '')
    ))).toBe(true)
  })

  test('keeps authored pronunciation focus and reviewed ambiguity corrections', () => {
    const expectedFocusIndices = {
      analyze: 0, evidence: 0, conclude: 1, accurate: 0,
      estimate: 0, represent: 2, determine: 1, justify: 0,
      infer: 1, interpret: 1, summarize: 0, support: 1,
      revise: 1, clarify: 0, organize: 0, structure: 0,
      contrast: 1, relationship: 1, relevant: 0, respond: 1,
      investigate: 1, method: 0, process: 0, factor: 0,
      classify: 0, select: 1, demonstrate: 0, outcome: 0,
    }
    const expectedReviewedSpeech = {
      evidence: ['ev', 'ih', 'duhns'],
      conclude: ['kuhn', 'klood'],
      represent: ['rep', 'rih', 'zent'],
      revise: ['rih', 'vize'],
      contrast: ['kuhn', 'trast'],
      respond: ['rih', 'spond'],
    }

    expect(Object.fromEntries(grade3AcademicWords.map((word) => [word, grade3AcademicWordInfo[word].focusChunkIndex]))).toEqual(expectedFocusIndices)
    for (const [word, speech] of Object.entries(expectedReviewedSpeech)) {
      expect(grade3AcademicWordInfo[word as keyof typeof grade3AcademicWordInfo].chunks.map((chunk) => chunk.speechText)).toEqual(speech)
    }
    for (const word of grade3AcademicWords) {
      const info = grade3AcademicWordInfo[word]
      expect(info.focusChunkIndex).toBeGreaterThanOrEqual(0)
      expect(info.focusChunkIndex).toBeLessThan(info.chunks.length)
    }
    for (const target of grade3ContextCavernAcademicWordWorkshopPack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])) {
      expect(target.focusParts.filter((part) => part.emphasis)).toHaveLength(1)
      expect(target.displayChunks.map((chunk) => chunk.displayText).join('')).toBe(target.surfaceWord)
      expect(target.spokenChunks.every((chunk) => chunk.speechText.trim().length > 0)).toBe(true)
    }

    const question = (suffix: string) => grade3ContextCavernAcademicWordWorkshopPack.questions.find((item) => item.questionIdentifier.endsWith(suffix))
    const interpret = question('lesson-g3-cc-aww-explain-and-support-q-2')?.questionContent
    expect(interpret?.type === 'multiple_choice' ? interpret.choices[0].text : '').toContain('guide Nia and create a hopeful mood')

    const hotText = question('lesson-g3-cc-aww-reading-and-writing-checkpoint-q-5')
    expect(hotText?.prompt).toBe('Select the sentence that names one useful map detail and one decorative detail that is not useful.')

    const twoPart = question('lesson-g3-cc-aww-reading-and-writing-checkpoint-q-7')?.questionContent
    expect(twoPart?.type === 'two_part' ? twoPart.partBPrompt : '').toBe('Why is the word you chose in Part A appropriate?')

    const classify = question('lesson-g3-cc-aww-across-subjects-checkpoint-q-1')?.questionContent
    expect(classify?.type === 'multiple_choice' ? classify.choices.map((choice) => choice.text) : []).not.toContain('Arrange the papers only by ink color.')
  })

  test('passes the dedicated Grade 3 guide and semantic shape audit', () => {
    expect(buildGrade3AcademicVocabularyGuideAudit(grade3ContextCavernAcademicWordWorkshopPack)).toEqual([])
  })
})
