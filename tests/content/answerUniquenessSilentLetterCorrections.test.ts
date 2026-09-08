import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../src/domain/content'

const pack = contentPacks.find((candidate) => (
  candidate.manifest.packId === 'g2-word-forge-silent-letter-combinations'
))

describe('silent-letter answer-uniqueness corrections', () => {
  it('removes unsupported shiny and careful details from every affected sibling', () => {
    expect(pack).toBeDefined()
    const wording = pack!.questions.map((question) => question.prompt).join(' ')

    expect(wording).not.toContain('shiny tool')
    expect(wording).not.toContain('careful movement up the ramp')
    expect(wording).not.toContain('names a careful action')
    expect(wording).not.toContain('checkpoint passages')
    expect(pack!.questions.filter((question) => (
      question.prompt === 'Which word in the shelter passage ends with quiet mb and names a tool?'
    ))).toHaveLength(2)
    expect(pack!.questions.filter((question) => (
      question.prompt === 'Which word in the shelter passage ends with quiet mb and shows movement up the ramp?'
    ))).toHaveLength(2)
  })

  it('uses source-independent checkpoint labels and one silent-letter family per table row', () => {
    expect(pack).toBeDefined()
    const checkpointTables = pack!.questions.filter((question) => (
      question.questionType === 'table_match'
      && Boolean(question.activityIdentifier?.match(/silent-letter-combinations-checkpoint-[abc]-7$/))
    ))

    expect(checkpointTables).toHaveLength(3)
    for (const question of checkpointTables) {
      expect(question.prompt).toMatch(/^Match each word(?: from the final review set)? to its silent-letter family\.$/)
      expect(question.prompt).not.toMatch(/passage|checkpoint passages/i)
    }

    const firstTable = checkpointTables[0]?.questionContent
    expect(firstTable?.type).toBe('table_match')
    if (!firstTable || firstTable.type !== 'table_match') return
    const revisedRow = firstTable.rows.find((row) => row.id === 'knight-row')
    expect(revisedRow?.prompt).toBe('kneel')
    expect(revisedRow?.correctChoiceId).toBe('knight-family-a1')
  })

  it('tests the visible thumb-through verb phrase rather than an invented paper-feeling action', () => {
    expect(pack).toBeDefined()
    const question = pack!.questions.find((candidate) => (
      candidate.questionIdentifier === 'q-word-forge-silent-letter-combinations-guided-quiet-review-5'
    ))

    expect(question?.prompt).toBe('Tap the word that completes the action meaning "look through the list."')
    expect(question?.explanation).toContain('thumb through')
    expect(question?.questionContent).toMatchObject({
      type: 'hot_text',
      correctSegmentIds: ['thumb-segment'],
    })
  })
})
