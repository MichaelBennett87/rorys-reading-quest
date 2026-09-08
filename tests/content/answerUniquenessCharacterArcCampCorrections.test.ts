import { describe, expect, test } from 'vitest'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

const pack = getActiveContentPacks().find(
  (candidate) => candidate.manifest.packId === 'g3-story-scouts-character-arc-camp',
)

if (!pack) {
  throw new Error('Character Arc Camp pack is unavailable.')
}

describe('Character Arc Camp answer uniqueness corrections', () => {
  test('uses Mina sharing her idea as the selectable turning-point action', () => {
    const question = pack.questions.find(
      (candidate) => candidate.questionIdentifier === 'g3-ss-cac-q1-4',
    )

    expect(question?.prompt).toBe(
      'Select the sentence that best shows the turning point in Mina’s development.',
    )
    expect(question?.correctAnswers).toEqual([
      'Mina opened her map, explained her suggestion, and pointed to the creek stones beside the safe path.',
    ])
    expect(question?.correctAnswers).not.toContain(
      'Ana asked, “Mina, did you notice a clue while you were drawing?”',
    )
  })
})
