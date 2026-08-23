import { describe, expect, test } from 'vitest'

import { contentPacks, sampleContent } from '../../src/domain/content'
import { auditSemanticQuestionContent } from '../../src/domain/content/semanticQuestionAudit'

describe('semantic question audit', () => {
  test('reports no prompt-answer leakage or duplicate visible choices in active Grade 2 content', () => {
    const grade2Content = {
      ...sampleContent,
      questions: contentPacks
        .filter((pack) => !pack.manifest.packId.startsWith('legacy-'))
        .flatMap((pack) => pack.questions),
    }
    const report = auditSemanticQuestionContent(grade2Content)

    expect(report.reviewedCount).toBe(889)
    expect(report.issues).toEqual([])
  })
})
