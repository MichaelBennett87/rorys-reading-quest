import { describe, expect, test } from 'vitest'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

const pack = getActiveContentPacks().find(
  (candidate) => candidate.manifest.packId === 'g3-information-detectives-structure-station',
)

if (!pack) {
  throw new Error('Structure Station pack is unavailable.')
}

function getMultiselect(questionId: string) {
  const question = pack!.questions.find((candidate) => candidate.questionIdentifier === questionId)
  const content = question?.questionContent
  if (!question || !content || content.type !== 'multi_select') {
    throw new Error(`Expected multiselect question ${questionId}.`)
  }
  return { question, content }
}

describe('Structure Station checkpoint answer uniqueness corrections', () => {
  test('constrains comparison evidence to the two bridge-shape details', () => {
    const { question, content } = getMultiselect('g3-id-ss-q5-4')

    expect(question.prompt).toBe(
      'Choose the two details that describe the different bridge shapes being compared.',
    )
    expect(content.correctChoiceIds).toHaveLength(2)
  })

  test('constrains cause-and-effect evidence to the keyed cause and result', () => {
    const { question, content } = getMultiselect('g3-id-ss-q6-4')

    expect(question.prompt).toBe(
      'Choose the cause detail about hard surfaces and the result detail about fewer puddles.',
    )
    expect(content.correctChoiceIds).toHaveLength(2)
  })

  test('constrains chronology evidence to the opening and closing action sentences', () => {
    const { question, content } = getMultiselect('g3-id-ss-q7-4')

    expect(question.prompt).toBe(
      'Choose the first and final action sentences that mark the beginning and end of the paper-making process.',
    )
    expect(content.correctChoiceIds).toHaveLength(2)
  })
})
