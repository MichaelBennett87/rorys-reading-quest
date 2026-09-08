import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(
    process.cwd(),
    'src/domain/content/packs/grade2/contextCavern/meaningClueChamber/pack.ts',
  ),
  'utf8',
)

describe('Meaning Clue Chamber deep answer uniqueness', () => {
  it('constrains the hot-text task to the fact stated by the deep-soil sentence', () => {
    expect(source).toContain(
      "? 'Select the sentence that states what deep soil gives roots.'",
    )
    expect(source).toContain(
      "? 'The sentence says deep soil gives roots more room to grow.'",
    )
  })
})
