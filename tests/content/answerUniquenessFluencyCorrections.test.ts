import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../src/domain/content'

const pack = contentPacks.find((candidate) => (
  candidate.manifest.packId === 'g2-word-forge-fluency-practice-foundations'
))

function question(questionIdentifier: string) {
  expect(pack).toBeDefined()
  const result = pack!.questions.find((candidate) => candidate.questionIdentifier === questionIdentifier)
  expect(result, `Missing ${questionIdentifier}`).toBeDefined()
  return result!
}

describe('Grade 2 fluency answer-uniqueness corrections', () => {
  it('keeps sentence records and learner-visible passage text aligned', () => {
    expect(pack).toBeDefined()
    const weather = pack!.passages.find((passage) => passage.passageIdentifier.endsWith('weather-announcement'))
    const science = pack!.passages.find((passage) => passage.passageIdentifier.endsWith('science-demo'))

    expect(weather?.passageText).toContain('Will the wind move gently?')
    expect(weather?.passageText).not.toContain('Will the wind stay gentle?')
    expect(science?.passageText).toContain('Another student helped the class review the steps.')
    expect(science?.passageText).not.toContain('Another student replied')
    for (const passage of [weather, science]) {
      for (const sentence of passage?.sentences ?? []) {
        expect(passage?.passageText).toContain(sentence.text)
      }
    }
  })

  it('uses observable prompt constraints instead of overlapping calm or strong voice labels', () => {
    expect(question('question-word-forge-fluency-practice-phrase-groups-3').prompt).toBe(
      'Select the sentence that gives a calm instruction to read a sign carefully.',
    )
    expect(question('question-word-forge-fluency-practice-dialogue-and-character-voice-2').prompt).toBe(
      'Select the sentence spoken as a curious question.',
    )
    expect(question('question-word-forge-fluency-practice-nature-report-4').prompt).toBe(
      'Which sentence includes the direction to move slowly?',
    )
    expect(question('question-word-forge-fluency-practice-community-announcement-1').prompt).toBe(
      'Which choice ends with an exclamation mark and signals an excited voice?',
    )
  })

  it('keeps every revised table row on one nonoverlapping reading category', () => {
    const phraseTable = question('question-word-forge-fluency-practice-phrase-groups-4').questionContent
    const museumTable = question('question-word-forge-fluency-practice-dialogue-and-character-voice-4').questionContent

    expect(phraseTable?.type).toBe('table_match')
    expect(museumTable?.type).toBe('table_match')
    if (!phraseTable || phraseTable.type !== 'table_match') return
    if (!museumTable || museumTable.type !== 'table_match') return

    expect(phraseTable.rows.find((row) => row.id === 'phrase-path-row')?.options.map((option) => option.text)).toEqual([
      'a question about the path',
      'one path-checking action phrase',
      'a name for the path',
      'an excited path exclamation',
    ])
    expect(museumTable.rows.find((row) => row.id === 'story-row')?.options.map((option) => option.text)).toEqual([
      'a rushed command',
      'a curious question',
      'a calm statement that explains',
      'a surprised shout',
    ])
  })
})
