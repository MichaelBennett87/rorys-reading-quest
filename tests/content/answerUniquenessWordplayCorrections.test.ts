import { describe, expect, test } from 'vitest'

import { auditSemanticQuestionPacks, contentPacks } from '../../src/domain/content'

const pack = contentPacks.find(
  (candidate) => candidate.manifest.packId === 'g2-compare-castle-wordplay-watchtower',
)

function question(questionId: string) {
  const found = pack?.questions.find((candidate) => candidate.questionIdentifier === questionId)
  if (!found) throw new Error(`Missing Wordplay Watchtower question ${questionId}.`)
  return found
}

describe('Wordplay Watchtower semantic answer-uniqueness corrections', () => {
  test('gives each corrected alliteration slot one source-owned defensible answer', () => {
    const guided = question('lesson-cg-wordplay-guided-sound-patterns-in-a-poem-q-4').questionContent
    expect(guided?.type).toBe('hot_text')
    if (!guided || guided.type !== 'hot_text') return
    expect(guided.selectableSegments).toEqual([
      { id: 'h1', text: 'The flags climbed' },
      { id: 'h2', text: 'We put on our thinking caps' },
      { id: 'h3', text: 'Tiny tools tapped' },
      { id: 'h4', text: 'We checked each knot' },
    ])
    expect(guided.correctSegmentIds).toEqual(['h3'])

    const checkpointChoice = question('lesson-cg-wordplay-checkpoint-a-q-3').questionContent
    expect(checkpointChoice?.type).toBe('multiple_choice')
    if (!checkpointChoice || checkpointChoice.type !== 'multiple_choice') return
    expect(checkpointChoice.choices.find((choice) => choice.id === 'c3')?.text).toBe('the glue tipped over')
    expect(checkpointChoice.correctChoiceIds).toEqual(['c2'])

    const checkpointHotText = question('lesson-cg-wordplay-checkpoint-a-q-5')
    const checkpointHotTextContent = checkpointHotText.questionContent
    expect(checkpointHotTextContent?.type).toBe('hot_text')
    if (!checkpointHotTextContent || checkpointHotTextContent.type !== 'hot_text') return
    expect(checkpointHotTextContent.selectableSegments).toEqual([
      { id: 'h1', text: 'The flags climbed' },
      { id: 'h2', text: 'We put on our thinking caps' },
      { id: 'h3', text: 'Tiny tools tapped' },
      { id: 'h4', text: 'We checked each knot' },
    ])
    expect(checkpointHotTextContent.correctSegmentIds).toEqual(['h3'])
    expect(checkpointHotText.explanation).toContain('Tiny tools tapped')
  })

  test('retains the pack semantic and ownership audit', () => {
    expect(pack).toBeDefined()
    expect(auditSemanticQuestionPacks([pack!]).issues).toEqual([])
  })
})
