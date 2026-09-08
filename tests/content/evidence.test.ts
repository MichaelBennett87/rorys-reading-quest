import { describe, expect, test } from 'vitest'

import { buildPassageEvidenceIndex, type Passage } from '../../src/domain/content'

function passage(overrides: Partial<Passage> = {}): Passage {
  return {
    passageIdentifier: 'passage-evidence-labels',
    gradeBand: 2,
    passageText: 'First sentence. Second sentence.',
    contentKind: 'prose',
    sentences: [
      { sentenceId: 'sentence-first', text: 'First sentence.' },
      { sentenceId: 'sentence-second', text: 'Second sentence.' },
    ],
    readingContext: 'Evidence label regression fixture',
    contentVersion: 'evidence-labels-r0.1.0',
    ...overrides,
  }
}

describe('passage evidence labels', () => {
  test('uses one-based source order when prose sentence line numbers are absent', () => {
    const evidence = buildPassageEvidenceIndex(passage())

    expect(evidence.get('sentence-first')?.label).toBe('Sentence 1')
    expect(evidence.get('sentence-second')?.label).toBe('Sentence 2')
  })

  test('preserves explicit poem line numbers', () => {
    const evidence = buildPassageEvidenceIndex(passage({
      contentKind: 'poem',
      sentences: [{ sentenceId: 'poem-line', lineNumber: 7, stanzaId: 'stanza-2', text: 'A seventh line.' }],
    }))

    expect(evidence.get('poem-line')?.label).toBe('Line 7')
  })
})
