import { describe, expect, test } from 'vitest'

import {
  buildActiveQuestionTruthInventory,
  buildBlindQuestionTruthProjection,
} from '../../src/domain/content/questionTruthAudit'
import { getActiveContentPacks } from '../../src/domain/content/packs/registry'

interface LedgerRecord {
  questionId: string
  packId: string
  contentFingerprint: string
  finalStatus: string
}

const ledgerModules = import.meta.glob(
  '../../docs/content/question-truth-ledger/*.json',
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

describe('active question truth inventory', () => {
  test('derives every active question exactly once from the production registry', () => {
    const activePacks = getActiveContentPacks()
    const inventory = buildActiveQuestionTruthInventory(activePacks)

    expect(inventory.issues, JSON.stringify(inventory.issues, null, 2)).toEqual([])
    expect(inventory.records).toHaveLength(1204)
    expect(new Set(inventory.records.map((record) => record.questionId)).size).toBe(1204)
    expect(new Set(inventory.records.map((record) => record.packId))).toEqual(
      new Set(activePacks.map((pack) => pack.manifest.packId)),
    )
    expect(inventory.records.every((record) => record.lessonIds.length === 1)).toBe(true)
    expect(inventory.records.every((record) => record.passageIds.length >= 1)).toBe(true)
  })

  test('builds a blind projection without keys, explanations, evidence, or guide answers', () => {
    const projection = buildBlindQuestionTruthProjection(getActiveContentPacks())
    const forbiddenKeys = new Set([
      'authoredCorrectAnswerRepresentation',
      'correctAnswers',
      'correctChoiceIds',
      'correctSegmentIds',
      'evidenceReferenceIds',
      'explanation',
      'guides',
    ])
    const discoveredKeys = collectKeys(projection)

    expect(projection).toHaveLength(1204)
    expect([...forbiddenKeys].filter((key) => discoveredKeys.has(key))).toEqual([])
    expect(projection.every((record) => record.displayedTexts.length >= 1)).toBe(true)
  })

  test('keeps one current fingerprinted PASS ledger record for every active question', () => {
    const inventory = buildActiveQuestionTruthInventory(getActiveContentPacks())
    const activeById = new Map(inventory.records.map((record) => [record.questionId, record] as const))
    const ledgerRecords = Object.values(ledgerModules).flatMap((raw) => JSON.parse(raw) as LedgerRecord[])

    expect(Object.keys(ledgerModules)).toHaveLength(30)
    expect(ledgerRecords).toHaveLength(1204)
    expect(new Set(ledgerRecords.map((record) => record.questionId)).size).toBe(1204)
    expect(new Set(ledgerRecords.map((record) => record.packId))).toEqual(
      new Set(getActiveContentPacks().map((pack) => pack.manifest.packId)),
    )
    expect(ledgerRecords.every((record) => record.finalStatus === 'PASS')).toBe(true)
    expect(ledgerRecords.map((record) => record.questionId).sort()).toEqual([...activeById.keys()].sort())
    expect(ledgerRecords.every((record) => (
      activeById.get(record.questionId)?.contentFingerprint === record.contentFingerprint
    ))).toBe(true)
  })
})

function collectKeys(value: unknown, output = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, output)
    return output
  }
  if (!value || typeof value !== 'object') return output
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    output.add(key)
    collectKeys(item, output)
  }
  return output
}
