import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(
    process.cwd(),
    'src/domain/content/packs/grade2/informationDetectives/centralIdeaCenter/questionsPrerequisite.ts',
  ),
  'utf8',
)

describe('Central Idea Center shelter answer uniqueness', () => {
  it('constrains the exact-set item to noise and crowding evidence', () => {
    expect(source).toContain(
      "prompt: 'Choose the two details that directly explain how the shelter reduces noise or crowding for animals.'",
    )
    expect(source).toContain(
      "explanation: 'A quiet resting space reduces noise, and one-way paths keep animals from feeling crowded.'",
    )
    expect(source).not.toContain(
      "prompt: 'Choose two details that are most relevant to the central idea.'",
    )
  })

  it('identifies the one sentence that combines three shelter features', () => {
    expect(source).toContain(
      "prompt: 'Tap the sentence that names three shelter features working together for the animals.'",
    )
    expect(source).toContain(
      "explanation: 'This sentence combines quiet rooms, clean beds, and clear paths as support for the animals.'",
    )
  })
})
