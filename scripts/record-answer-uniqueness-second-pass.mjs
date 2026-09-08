import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [, , rootArgument, batchId, outputArgument] = process.argv
if (!rootArgument || !batchId || !outputArgument) {
  throw new Error(
    'Usage: node scripts/record-answer-uniqueness-second-pass.mjs <key-free-root> <batch-id> <durable-output-directory>',
  )
}

let input = ''
process.stdin.setEncoding('utf8')
for await (const chunk of process.stdin) input += chunk

const specs = JSON.parse(input)
const root = path.resolve(rootArgument)
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'))
const batchMeta = manifest.batches.find((entry) => entry.batchId === batchId)
if (!batchMeta) throw new Error(`Unknown second-pass batch: ${batchId}`)
const batchText = await readFile(path.join(root, batchMeta.file), 'utf8')
const sha256 = createHash('sha256').update(batchText).digest('hex')
if (sha256 !== batchMeta.sha256) throw new Error(`Frozen second-pass batch changed: ${batchId}`)
const batch = JSON.parse(batchText)
if (!Array.isArray(specs) || specs.length !== batch.records.length) {
  throw new Error(`Expected ${batch.records.length} conclusions, received ${specs.length}`)
}

const byAuditId = new Map(specs.map((entry) => [entry.auditId, entry]))
if (byAuditId.size !== specs.length) throw new Error('Duplicate second-pass audit ID.')
const records = batch.records.map((visible) => {
  const spec = byAuditId.get(visible.auditId)
  if (!spec) throw new Error(`Missing second-pass conclusion for ${visible.auditId}`)
  if (!Array.isArray(spec.slots) || spec.slots.length !== visible.slots.length) {
    throw new Error(`Second-pass slot inventory mismatch: ${visible.auditId}`)
  }
  const visibleSlots = new Map(visible.slots.map((slot) => [slot.slotId, slot]))
  const slots = spec.slots.map((slot) => {
    const expected = visibleSlots.get(slot.slotId)
    if (!expected) throw new Error(`Unknown second-pass slot: ${visible.auditId}/${slot.slotId}`)
    const answerIds = new Set(expected.options.map((option) => option.answerId))
    if (!Array.isArray(slot.defensible) || new Set(slot.defensible).size !== slot.defensible.length || slot.defensible.some((id) => !answerIds.has(id))) {
      throw new Error(`Invalid second-pass answer set: ${visible.auditId}/${slot.slotId}`)
    }
    if (typeof slot.ambiguity !== 'string' || typeof slot.selectionContractValid !== 'boolean' || !slot.challengeSummary?.trim()) {
      throw new Error(`Incomplete second-pass conclusion: ${visible.auditId}/${slot.slotId}`)
    }
    return {
      slotId: slot.slotId,
      defensible: slot.defensible,
      ambiguity: slot.ambiguity,
      selectionContractValid: slot.selectionContractValid,
      challengeSummary: slot.challengeSummary,
    }
  })
  return { auditId: visible.auditId, fingerprint: visible.visibleProjectionFingerprint, slots }
})

const report = {
  schemaVersion: 1,
  stage: 'SECOND_PASS_FROZEN_BEFORE_KEY_COMPARISON',
  batchId,
  batchFileSha256: batchMeta.sha256,
  reviewerThreadId: 'UNKNOWN_CURRENT_MAIN_CONVERSATION',
  reviewer: 'primary-agent-current-conversation',
  independentReviewer: false,
  records,
}
const content = `${JSON.stringify(report, null, 2)}\n`
const durableFile = path.join(path.resolve(outputArgument), `${batchId}.second-pass.json`)
const validationFile = path.join(root, 'second-pass-reports', `${batchId}.second-pass.json`)
await mkdir(path.dirname(durableFile), { recursive: true })
await mkdir(path.dirname(validationFile), { recursive: true })
await writeFile(durableFile, content, { flag: 'wx' })
await writeFile(validationFile, content, { flag: 'wx' })
console.log(JSON.stringify({ batchId, records: records.length, durableFile, validationFile }))
