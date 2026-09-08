import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../src/domain/content'

const pack = contentPacks.find((candidate) => candidate.questions.some(
  (question) => question.activityIdentifier === 'activity-word-forge-ou-oi-oy-ow-guided-ou-ow-prereq-1',
))

function questionByActivity(activityIdentifier: string) {
  expect(pack, 'Missing active ou/oi/oy/ow pack').toBeDefined()
  const question = pack!.questions.find((candidate) => candidate.activityIdentifier === activityIdentifier)
  expect(question, `Missing ${activityIdentifier}`).toBeDefined()
  return question!
}

describe('ou, oi, oy, and ow answer-uniqueness corrections', () => {
  it('requires both the requested spelling and vowel sound in every single-answer pattern comparison', () => {
    expect(pack, 'Missing active ou/oi/oy/ow pack').toBeDefined()
    const comparisons = pack!.questions.filter((question) =>
      question.questionType === 'multiple_choice'
      && question.prompt.startsWith('Which word'),
    )

    expect(comparisons).toHaveLength(19)
    for (const question of comparisons) {
      expect(question.prompt).toMatch(/spelled with (ou|ow|oi|oy) and has the same vowel sound/)
    }
  })

  it('removes the second oi-spelled answer from the boil comparison', () => {
    const question = questionByActivity('activity-word-forge-ou-oi-oy-ow-guided-oi-oy-practice-1')
    const content = question.questionContent
    expect(content?.type).toBe('multiple_choice')
    if (!content || content.type !== 'multiple_choice') return

    expect(content.choices.map((choice) => choice.text)).toEqual(['toy', 'cloud', 'coin', 'boy'])
    expect(content.choices.filter((choice) => choice.text.includes('oi'))).toHaveLength(1)
    expect(content.correctChoiceIds).toEqual(['coin-choice'])
  })

  it('leaves only toy as an oy-spelled answer in the reported joy checkpoint item', () => {
    const question = questionByActivity('activity-word-forge-ou-oi-oy-ow-checkpoint-a-3')
    const content = question.questionContent
    expect(content?.type).toBe('multiple_choice')
    if (!content || content.type !== 'multiple_choice') return

    expect(content.choices.map((choice) => choice.text)).toEqual(['cloud', 'snow', 'coin', 'toy'])
    expect(content.choices.filter((choice) => choice.text.includes('oy'))).toHaveLength(1)
    expect(content.correctChoiceIds).toEqual(['toy-choice'])
  })

  it('labels table mappings as spellings rather than distinct sound groups', () => {
    expect(pack, 'Missing active ou/oi/oy/ow pack').toBeDefined()
    const tables = pack!.questions.filter((question) => question.questionType === 'table_match')

    expect(tables).toHaveLength(7)
    expect(tables.map((question) => question.prompt)).not.toContain('Match each word to its sound group.')
    for (const question of tables) {
      const content = question.questionContent
      if (!content || content.type !== 'table_match') continue
      for (const row of content.rows) {
        expect(row.options.every((option) => (
          option.text.startsWith('spelled with ')
          || /^(ou|ow|oi) as in /.test(option.text)
        ))).toBe(true)
      }
    }
  })
})
