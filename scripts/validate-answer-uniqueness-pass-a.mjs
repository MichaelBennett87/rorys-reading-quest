import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'

const allowedVerdicts = new Set([
  'DEFENSIBLE',
  'INCORRECT',
  'PARTIALLY_TRUE_BUT_NONRESPONSIVE',
  'UNSUPPORTED',
  'CONTRADICTED',
  'EQUIVALENT_TO_KEY',
  'AMBIGUOUS',
])

function valueAfter(flag) {
  const index = process.argv.indexOf(flag)
  if (index < 0 || index + 1 >= process.argv.length) return undefined
  return process.argv[index + 1]
}

function fail(message) {
  throw new Error(message)
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

const rootArgument = valueAfter('--root')
const suffix = valueAfter('--report-suffix') ?? '.pass-a.json'
const batchIds = process.argv.filter((value, index) => (
  value.startsWith('batch-')
  && process.argv[index - 1] !== '--root'
  && process.argv[index - 1] !== '--report-suffix'
))

if (!rootArgument || batchIds.length === 0) {
  fail('Usage: node scripts/validate-answer-uniqueness-pass-a.mjs --root <immutable-export-root> [--report-suffix <suffix>] batch-0001 [...]')
}

const root = resolve(rootArgument)
if (!isAbsolute(root)) fail('The export root must resolve to an absolute path.')

const manifest = readJson(join(root, 'manifest.json'))
if (manifest.projectionVersion !== 2) fail('Only projection version 2 is supported.')

const identityMapPath = join(root, manifest.privateIdentityMap.file)
const identityMapBuffer = readFileSync(identityMapPath)
if (sha256(identityMapBuffer) !== manifest.privateIdentityMap.sha256) {
  fail('The private identity-map fingerprint does not match the manifest.')
}
const identities = new Map(readJson(identityMapPath).identityMap.map((record) => [record.auditId, record]))

const summaries = []
for (const batchId of batchIds) {
  const batchMetadata = manifest.batches.find((candidate) => candidate.batchId === batchId)
  if (!batchMetadata) fail(`${batchId}: missing manifest entry`)

  const batchPath = resolve(root, batchMetadata.file)
  if (relative(root, batchPath).startsWith('..')) fail(`${batchId}: batch path escapes export root`)
  const batchBuffer = readFileSync(batchPath)
  if (sha256(batchBuffer) !== batchMetadata.sha256) fail(`${batchId}: batch fingerprint mismatch`)

  const batch = JSON.parse(batchBuffer.toString('utf8'))
  const reportPath = join(root, 'review-reports', `${batchId}${suffix}`)
  const report = readJson(reportPath)

  if (
    report.schemaVersion !== 2
    || report.stage !== 'PASS_A_FROZEN_BEFORE_KEY_COMPARISON'
    || report.batchId !== batchId
    || report.batchFileSha256 !== batchMetadata.sha256
    || !Array.isArray(report.records)
    || report.records.length !== batch.records.length
  ) {
    fail(`${batchId}: invalid report header or record count`)
  }

  let slotCount = 0
  let ambiguityCount = 0
  for (let questionIndex = 0; questionIndex < batch.records.length; questionIndex += 1) {
    const visible = batch.records[questionIndex]
    const reviewed = report.records[questionIndex]
    const identity = identities.get(visible.auditId)
    if (!identity) fail(`${batchId}/${visible.auditId}: missing private identity`)
    if (
      reviewed.auditId !== visible.auditId
      || reviewed.fingerprint !== visible.visibleProjectionFingerprint
      || typeof reviewed.projectionDefect !== 'string'
      || !Array.isArray(reviewed.slots)
      || reviewed.slots.length !== visible.slots.length
    ) {
      fail(`${batchId}/${visible.auditId}: invalid question identity, fingerprint, or slot count`)
    }
    if (reviewed.projectionDefect) ambiguityCount += 1

    const allowedEvidenceIds = new Set(identity.allowedVisibleSourceAliasIds)
    for (let slotIndex = 0; slotIndex < visible.slots.length; slotIndex += 1) {
      slotCount += 1
      const expectedSlot = visible.slots[slotIndex]
      const reviewedSlot = reviewed.slots[slotIndex]
      if (
        reviewedSlot.slotId !== expectedSlot.slotId
        || typeof reviewedSlot.ambiguity !== 'string'
        || typeof reviewedSlot.selectionContractValid !== 'boolean'
        || !Array.isArray(reviewedSlot.defensible)
        || !Array.isArray(reviewedSlot.options)
        || reviewedSlot.options.length !== expectedSlot.options.length
      ) {
        fail(`${batchId}/${visible.auditId}/${expectedSlot.slotId}: invalid slot record`)
      }
      if (reviewedSlot.ambiguity || !reviewedSlot.selectionContractValid) ambiguityCount += 1

      const expectedOptionIds = expectedSlot.options.map((option) => option.answerId)
      const reviewedOptionIds = reviewedSlot.options.map((option) => option[0])
      if (JSON.stringify(reviewedOptionIds) !== JSON.stringify(expectedOptionIds)) {
        fail(`${batchId}/${visible.auditId}/${expectedSlot.slotId}: option identities or order changed`)
      }

      const defensibleFromJudgments = []
      for (const option of reviewedSlot.options) {
        if (
          !Array.isArray(option)
          || option.length !== 4
          || !allowedVerdicts.has(option[1])
          || typeof option[2] !== 'string'
          || !option[2].trim()
          || !Array.isArray(option[3])
        ) {
          fail(`${batchId}/${visible.auditId}/${expectedSlot.slotId}/${option?.[0] ?? 'unknown'}: invalid option judgment`)
        }
        if (option[3].some((evidenceId) => !allowedEvidenceIds.has(evidenceId))) {
          fail(`${batchId}/${visible.auditId}/${expectedSlot.slotId}/${option[0]}: evidence is not source-owned`)
        }
        if (option[1] === 'DEFENSIBLE' || option[1] === 'EQUIVALENT_TO_KEY') {
          defensibleFromJudgments.push(option[0])
        }
      }
      if (JSON.stringify(reviewedSlot.defensible) !== JSON.stringify(defensibleFromJudgments)) {
        fail(`${batchId}/${visible.auditId}/${expectedSlot.slotId}: defensible answers disagree with option judgments`)
      }
    }
  }

  summaries.push({
    batchId,
    reportPath,
    reportSha256: sha256(readFileSync(reportPath)),
    questionCount: report.records.length,
    slotCount,
    ambiguityCount,
    status: 'PASS',
  })
}

console.log(JSON.stringify(summaries, null, 2))
