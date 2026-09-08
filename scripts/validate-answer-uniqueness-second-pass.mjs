import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const rootIndex = process.argv.indexOf('--root')
const reportsIndex = process.argv.indexOf('--reports')
const currentRootIndex = process.argv.indexOf('--current-root')
const correctionsIndex = process.argv.indexOf('--corrections')
if (rootIndex < 0 || reportsIndex < 0 || !process.argv[rootIndex + 1] || !process.argv[reportsIndex + 1]) {
  throw new Error(
    'Usage: node scripts/validate-answer-uniqueness-second-pass.mjs --root <key-free-root> --reports <receipt-directory> [--current-root <current-key-free-root> --corrections <correction-receipt-directory>]',
  )
}
if ((currentRootIndex >= 0) !== (correctionsIndex >= 0)
  || (currentRootIndex >= 0 && (!process.argv[currentRootIndex + 1] || !process.argv[correctionsIndex + 1]))) {
  throw new Error('--current-root and --corrections must be supplied together.')
}

const root = path.resolve(process.argv[rootIndex + 1])
const reports = path.resolve(process.argv[reportsIndex + 1])
const currentRoot = currentRootIndex >= 0 ? path.resolve(process.argv[currentRootIndex + 1]) : root
const corrections = correctionsIndex >= 0 ? path.resolve(process.argv[correctionsIndex + 1]) : null

async function loadProjectionRoot(directory, label) {
  const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'))
  const byBatch = new Map()
  const byAuditId = new Map()
  for (const meta of manifest.batches) {
    const text = await readFile(path.join(directory, meta.file), 'utf8')
    if (createHash('sha256').update(text).digest('hex') !== meta.sha256) {
      throw new Error(`${label} batch changed: ${meta.batchId}`)
    }
    const batch = JSON.parse(text)
    const records = new Map()
    for (const record of batch.records) {
      if (records.has(record.auditId) || byAuditId.has(record.auditId)) {
        throw new Error(`Duplicate ${label} question: ${record.auditId}`)
      }
      records.set(record.auditId, record)
      byAuditId.set(record.auditId, record)
    }
    byBatch.set(meta.batchId, records)
  }
  return { manifest, byBatch, byAuditId }
}

async function listReceiptFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await listReceiptFiles(entryPath))
    else if (entry.name.endsWith('.second-pass.json')) files.push(entryPath)
  }
  return files.sort()
}

const hasAmbiguity = (value) => typeof value === 'string'
  && value.trim() !== ''
  && value.trim().toUpperCase() !== 'NONE'

function validateReceiptMetadata(report, file) {
  if (report.stage !== 'SECOND_PASS_FROZEN_BEFORE_KEY_COMPARISON' || report.independentReviewer !== false || !report.reviewer?.trim()) {
    throw new Error(`Invalid second-pass receipt metadata: ${file}`)
  }
}

function validateRecord(record, visible, label) {
  if (!visible || record.fingerprint !== visible.visibleProjectionFingerprint || record.slots.length !== visible.slots.length) {
    throw new Error(`Invalid ${label} question: ${record.auditId}`)
  }
  for (const slot of record.slots) {
    const visibleSlot = visible.slots.find((candidate) => candidate.slotId === slot.slotId)
    const answerIds = new Set(visibleSlot?.options.map((option) => option.answerId) ?? [])
    if (!visibleSlot || new Set(slot.defensible).size !== slot.defensible.length || slot.defensible.some((id) => !answerIds.has(id)) || typeof slot.selectionContractValid !== 'boolean' || !slot.challengeSummary?.trim()) {
      throw new Error(`Invalid ${label} slot conclusion: ${record.auditId}/${slot.slotId}`)
    }
  }
}

const originalProjection = await loadProjectionRoot(root, 'frozen second-pass')
const currentProjection = currentRoot === root
  ? originalProjection
  : await loadProjectionRoot(currentRoot, 'current projection')
const expected = originalProjection.byBatch
const baseRecords = new Map()
for (const file of (await readdir(reports)).filter((name) => name.endsWith('.second-pass.json')).sort()) {
  const report = JSON.parse(await readFile(path.join(reports, file), 'utf8'))
  validateReceiptMetadata(report, file)
  const batch = expected.get(report.batchId)
  if (!batch || report.records.length !== batch.size) throw new Error(`Second-pass batch mismatch: ${file}`)
  for (const record of report.records) {
    const visible = batch.get(record.auditId)
    validateRecord(record, visible, 'second-pass')
    if (baseRecords.has(record.auditId)) throw new Error(`Duplicate second-pass question: ${record.auditId}`)
    baseRecords.set(record.auditId, record)
  }
}

const currentCorrections = new Map()
let staleCorrectionReceipts = 0
if (corrections) {
  for (const file of await listReceiptFiles(corrections)) {
    const report = JSON.parse(await readFile(file, 'utf8'))
    if (expected.has(report.batchId)) continue
    validateReceiptMetadata(report, file)
    for (const record of report.records) {
      if (!baseRecords.has(record.auditId)) continue
      const currentVisible = currentProjection.byAuditId.get(record.auditId)
      if (!currentVisible || record.fingerprint !== currentVisible.visibleProjectionFingerprint) {
        staleCorrectionReceipts += 1
        continue
      }
      validateRecord(record, currentVisible, 'second-pass correction')
      if (currentCorrections.has(record.auditId)) {
        throw new Error(`Duplicate current second-pass correction: ${record.auditId}`)
      }
      currentCorrections.set(record.auditId, record)
    }
  }
}

const expectedCount = [...expected.values()].reduce((sum, records) => sum + records.size, 0)
let slotCount = 0
let ambiguityCount = 0
let currentFingerprintQuestions = 0
for (const [auditId, baseRecord] of baseRecords) {
  const currentVisible = currentProjection.byAuditId.get(auditId)
  if (!currentVisible) throw new Error(`Current projection is missing selected question: ${auditId}`)
  const record = currentCorrections.get(auditId) ?? baseRecord
  validateRecord(record, currentVisible, 'current second-pass')
  currentFingerprintQuestions += 1
  for (const slot of record.slots) {
    slotCount += 1
    if (hasAmbiguity(slot.ambiguity) || !slot.selectionContractValid) ambiguityCount += 1
  }
}

const result = {
  status: baseRecords.size === expectedCount && currentFingerprintQuestions === expectedCount && ambiguityCount === 0 ? 'PASS' : 'STOP',
  populationQuestions: originalProjection.manifest.populationQuestions,
  selectedQuestions: expectedCount,
  reviewedQuestions: baseRecords.size,
  reviewedSlots: slotCount,
  ambiguityCount,
  currentFingerprintQuestions,
  correctionsApplied: currentCorrections.size,
  staleCorrectionReceipts,
  packs: originalProjection.manifest.batches.length,
  strata: originalProjection.manifest.stratumSummary.length,
}
console.log(JSON.stringify(result, null, 2))
if (result.status !== 'PASS') process.exitCode = 1
