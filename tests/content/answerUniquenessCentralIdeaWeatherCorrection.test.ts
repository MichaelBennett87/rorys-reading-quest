import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(
    process.cwd(),
    'src/domain/content/packs/grade2/informationDetectives/centralIdeaCenter/questionsGuided.ts',
  ),
  'utf8',
)

describe('Central Idea Center weather answer uniqueness', () => {
  it('identifies the sentence that combines tools, observations, and learning', () => {
    expect(source).toContain(
      "prompt: 'Tap the sentence that combines tools, observations, and what the class learns about weather.'",
    )
    expect(source).toContain(
      "explanation: 'This sentence combines the tools, careful observations, and learning about weather into one idea.'",
    )
  })
})
