import { describe, expect, it } from 'vitest'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

describe('Theme Development Trail answer-uniqueness corrections', () => {
  it('keeps the Asha middle-stage table free of a second theme-building middle detail', () => {
    const question = getActiveContentPacks()
      .flatMap((pack) => pack.questions)
      .find((candidate) => candidate.questionIdentifier === 'g3-ss-tdt-q2-5')

    expect(question?.questionContent?.type).toBe('table_match')
    if (question?.questionContent?.type !== 'table_match') return

    const visibleChoices = question.questionContent.rows.flatMap((row) =>
      row.options.map((option) => option.text),
    )

    expect(visibleChoices).not.toContain('The guide points toward a bench near tall grass.')
    expect(visibleChoices).toContain('Asha opens her nature journal beside the pond.')
  })
})
