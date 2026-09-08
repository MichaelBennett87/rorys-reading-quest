import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

function runValidator(ambiguity: string, selectionContractValid: boolean) {
  const root = mkdtempSync(path.join(tmpdir(), 'rrq-second-pass-validator-'))
  temporaryDirectories.push(root)
  const reports = path.join(root, 'reports')
  mkdirSync(path.join(root, 'batches'))
  mkdirSync(reports)

  const batch = {
    records: [{
      auditId: 'Q0001',
      visibleProjectionFingerprint: 'fingerprint-1',
      slots: [{
        slotId: 'response',
        options: [{ answerId: 'A1', text: 'Only answer' }],
      }],
    }],
  }
  const batchText = `${JSON.stringify(batch, null, 2)}\n`
  writeFileSync(path.join(root, 'batches', 'batch-s0001.json'), batchText)
  writeFileSync(path.join(root, 'manifest.json'), `${JSON.stringify({
    populationQuestions: 1,
    stratumSummary: [{}],
    batches: [{
      batchId: 'batch-s0001',
      file: 'batches/batch-s0001.json',
      sha256: createHash('sha256').update(batchText).digest('hex'),
    }],
  }, null, 2)}\n`)
  writeFileSync(path.join(reports, 'batch-s0001.second-pass.json'), `${JSON.stringify({
    stage: 'SECOND_PASS_FROZEN_BEFORE_KEY_COMPARISON',
    batchId: 'batch-s0001',
    reviewer: 'primary-agent-current-conversation',
    independentReviewer: false,
    records: [{
      auditId: 'Q0001',
      fingerprint: 'fingerprint-1',
      slots: [{
        slotId: 'response',
        defensible: ['A1'],
        ambiguity,
        selectionContractValid,
        challengeSummary: 'A1 is the only response supported by the visible material.',
      }],
    }],
  }, null, 2)}\n`)

  return spawnSync(process.execPath, [
    path.resolve('scripts/validate-answer-uniqueness-second-pass.mjs'),
    '--root',
    root,
    '--reports',
    reports,
  ], { encoding: 'utf8' })
}

function runCorrectionReconciliation() {
  const root = mkdtempSync(path.join(tmpdir(), 'rrq-second-pass-original-'))
  const currentRoot = mkdtempSync(path.join(tmpdir(), 'rrq-second-pass-current-'))
  const reports = path.join(root, 'reports')
  const corrections = path.join(root, 'corrections')
  temporaryDirectories.push(root, currentRoot)
  mkdirSync(path.join(root, 'batches'))
  mkdirSync(path.join(currentRoot, 'batches'))
  mkdirSync(reports)
  mkdirSync(corrections)

  const writeProjection = (directory: string, fingerprint: string) => {
    const batch = {
      records: [{
        auditId: 'Q0001',
        visibleProjectionFingerprint: fingerprint,
        slots: [{
          slotId: 'response',
          options: [{ answerId: 'A1', text: 'Only answer' }],
        }],
      }],
    }
    const batchText = `${JSON.stringify(batch, null, 2)}\n`
    writeFileSync(path.join(directory, 'batches', 'batch-s0001.json'), batchText)
    writeFileSync(path.join(directory, 'manifest.json'), `${JSON.stringify({
      populationQuestions: 1,
      stratumSummary: [{}],
      batches: [{
        batchId: 'batch-s0001',
        file: 'batches/batch-s0001.json',
        sha256: createHash('sha256').update(batchText).digest('hex'),
      }],
    }, null, 2)}\n`)
  }
  writeProjection(root, 'old-fingerprint')
  writeProjection(currentRoot, 'current-fingerprint')

  const writeReceipt = (file: string, batchId: string, fingerprint: string, ambiguity: string) => {
    writeFileSync(file, `${JSON.stringify({
      stage: 'SECOND_PASS_FROZEN_BEFORE_KEY_COMPARISON',
      batchId,
      reviewer: 'primary-agent-current-conversation',
      independentReviewer: false,
      records: [{
        auditId: 'Q0001',
        fingerprint,
        slots: [{
          slotId: 'response',
          defensible: ['A1'],
          ambiguity,
          selectionContractValid: true,
          challengeSummary: 'A1 is the only response supported by the visible material.',
        }],
      }],
    }, null, 2)}\n`)
  }
  writeReceipt(path.join(reports, 'batch-s0001.second-pass.json'), 'batch-s0001', 'old-fingerprint', 'The old wording was ambiguous.')
  writeReceipt(path.join(corrections, 'batch-c0001.second-pass.json'), 'batch-c0001', 'current-fingerprint', '')

  return spawnSync(process.execPath, [
    path.resolve('scripts/validate-answer-uniqueness-second-pass.mjs'),
    '--root',
    root,
    '--reports',
    reports,
    '--current-root',
    currentRoot,
    '--corrections',
    corrections,
  ], { encoding: 'utf8' })
}

describe('answer-uniqueness second-pass validator', () => {
  test('accepts the explicit NONE sentinel as a clean conclusion', () => {
    const result = runValidator('NONE', true)

    expect(result.status).toBe(0)
    expect(JSON.parse(result.stdout)).toMatchObject({ status: 'PASS', ambiguityCount: 0 })
  })

  test('fails closed when the selection contract is invalid', () => {
    const result = runValidator('', false)

    expect(result.status).toBe(1)
    expect(JSON.parse(result.stdout)).toMatchObject({ status: 'STOP', ambiguityCount: 1 })
  })

  test('preserves an old ambiguous receipt while requiring a current-fingerprint correction', () => {
    const result = runCorrectionReconciliation()

    expect(result.status).toBe(0)
    expect(JSON.parse(result.stdout)).toMatchObject({
      status: 'PASS',
      ambiguityCount: 0,
      currentFingerprintQuestions: 1,
      correctionsApplied: 1,
    })
  })
})
