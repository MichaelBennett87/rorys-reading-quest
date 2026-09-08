import { describe, expect, it } from 'vitest'

import { buildBlindQuestionTruthProjection } from '../../src/domain/content'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

describe('answer uniqueness learner-visible projection', () => {
  const projection = buildBlindQuestionTruthProjection(getActiveContentPacks())

  it('binds ordinary questions to only their question-owned passage', () => {
    const ordinary = projection.filter((record) => record.presentation.kind === 'single')

    expect(ordinary.length).toBeGreaterThan(0)
    expect(ordinary.every((record) => record.displayedTexts.length === 1)).toBe(true)
    expect(ordinary.every((record) => !('readingContext' in record.displayedTexts[0]))).toBe(true)
  })

  it('preserves paired-text labels and both displayed members', () => {
    const paired = projection.filter((record) => record.presentation.kind === 'paired')

    expect(paired.length).toBeGreaterThan(0)
    expect(paired.every((record) => record.displayedTexts.length === 2)).toBe(true)
    expect(paired.every((record) => record.presentation.pairedText?.members.length === 2)).toBe(true)
    expect(paired.every((record) => record.displayedTexts.every((text) => /^Text (?:A|B|1|2): /.test(text.heading)))).toBe(true)
  })

  it('includes every learner-visible informational sentence used by the rendered sections', () => {
    const informationalTexts = projection.flatMap((record) => record.displayedTexts)
      .filter((text) => text.contentKind === 'informational')

    expect(informationalTexts.length).toBeGreaterThan(0)
    expect(informationalTexts.every((text) => (text.sentences?.length ?? 0) > 0)).toBe(true)
    expect(informationalTexts.every((text) => {
      const sentencesById = new Map(text.sentences?.map((sentence) => [sentence.sentenceId, sentence.text] as const))
      return text.informationalStructure?.sections.every((section) => section.sentenceIds.every((sentenceId) => {
        const sentenceText = sentencesById.get(sentenceId)
        return typeof sentenceText === 'string' && sentenceText.trim().length > 0
      })) === true
    })).toBe(true)
  })

  it('includes the fluency practice stimulus and optional Word Help without hidden guide conclusions', () => {
    const fluency = projection.filter((record) => record.presentation.kind === 'fluency')

    expect(fluency.length).toBeGreaterThan(0)
    expect(fluency.every((record) => record.fluencyPractice)).toBe(true)
    expect(fluency.every((record) => record.displayedTexts.length === 1)).toBe(true)
    expect(projection.some((record) => record.wordHelpAvailability.length > 0)).toBe(true)
    expect(projection.every((record) => record.trackedAssistance?.assistanceTracked === true)).toBe(true)
    expect(fluency.every((record) => (record.fluencyPractice?.supportedWords.length ?? 0) > 0)).toBe(true)
    expect(JSON.stringify(projection)).not.toContain('selectedForContext')
  })

  it('keeps visible teaching explanations while excluding keyed question explanations', () => {
    expect(projection.every((record) => !Object.hasOwn(record, 'explanation'))).toBe(true)
    expect(projection.some((record) => (JSON.stringify(record.teachingBlock) ?? '').includes('explanation'))).toBe(true)
  })

  it('uses explicit Hot Text selection mode rather than answer cardinality', () => {
    const hotText = getActiveContentPacks().flatMap((pack) => pack.questions)
      .filter((question) => question.questionContent?.type === 'hot_text')

    expect(hotText).toHaveLength(276)
    expect(hotText.every((question) => question.questionContent?.type === 'hot_text'
      && (question.questionContent.selectionMode ?? 'single') === 'single')).toBe(true)
    expect(hotText.every((question) => question.questionContent?.type === 'hot_text'
      && question.questionContent.correctSegmentIds.length === 1)).toBe(true)
  })
})
