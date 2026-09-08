import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../src/domain/content'

const pack = contentPacks.find((candidate) => candidate.manifest.packId === 'g2-word-forge-common-prefixes')

function question(questionIdentifier: string) {
  expect(pack).toBeDefined()
  const result = pack!.questions.find((candidate) => candidate.questionIdentifier === questionIdentifier)
  expect(result, `Missing ${questionIdentifier}`).toBeDefined()
  return result!
}

describe('common-prefix answer-uniqueness corrections', () => {
  it('offers only one pre-prefixed answer in the single-select item', () => {
    const item = question('q-word-forge-common-prefixes-guided-find-the-base-3')
    const content = item.questionContent
    expect(content?.type).toBe('multiple_choice')
    if (!content || content.type !== 'multiple_choice') return

    expect(content.choices.map((choice) => choice.text)).toEqual(['heat', 'repaint', 'unsafe', 'preheat'])
    expect(content.choices.filter((choice) => choice.text.startsWith('pre'))).toHaveLength(1)
    expect(content.correctChoiceIds).toEqual(['preheat-choice'])
  })

  it('keeps both Hot Text prompts faithful to the displayed could-retell sentence', () => {
    const items = pack!.questions.filter((candidate) => (
      candidate.prompt.includes('a child could unroll a poster')
    ))

    expect(items).toHaveLength(2)
    for (const item of items) {
      expect(item.prompt).toContain('the teacher could retell the plan')
      expect(item.prompt).not.toContain('the teacher retold the plan')
      expect(item.questionContent).toMatchObject({
        type: 'hot_text',
        correctSegmentIds: ['school-preview-2'],
      })
    }
  })

  it('uses the exact visible prefixed form unrolled in the supply-cart multiselect', () => {
    const item = question('q-word-forge-common-prefixes-checkpoint-a-5')
    const content = item.questionContent
    expect(content?.type).toBe('multi_select')
    if (!content || content.type !== 'multi_select') return

    expect(content.choices.map((choice) => choice.text)).toContain('unrolled')
    expect(content.choices.map((choice) => choice.text)).not.toContain('unroll')
    expect(content.correctChoiceIds).toContain('unroll-choice')
  })
})
