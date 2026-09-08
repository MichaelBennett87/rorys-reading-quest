import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [, , sourceArgument, destinationArgument] = process.argv
if (!sourceArgument || !destinationArgument) {
  throw new Error(
    'Usage: node scripts/export-answer-uniqueness-second-pass.mjs <key-free-export-root> <destination>',
  )
}

const source = path.resolve(sourceArgument)
const destination = path.resolve(destinationArgument)
if (existsSync(destination)) {
  throw new Error(`Refusing to overwrite an existing second-pass export: ${destination}`)
}

const hash = (text) => createHash('sha256').update(text).digest('hex')
const manifestText = await readFile(path.join(source, 'manifest.json'), 'utf8')
const manifest = JSON.parse(manifestText)
const identityText = await readFile(path.join(source, manifest.privateIdentityMap.file), 'utf8')
if (hash(identityText) !== manifest.privateIdentityMap.sha256) {
  throw new Error('The source private identity-map fingerprint does not match its manifest.')
}

const identities = JSON.parse(identityText).identityMap
const identityByAuditId = new Map(identities.map((entry) => [entry.auditId, entry]))
const records = []
for (const batch of manifest.batches) {
  const text = await readFile(path.join(source, batch.file), 'utf8')
  if (hash(text) !== batch.sha256) throw new Error(`Frozen source batch changed: ${batch.batchId}`)
  records.push(...JSON.parse(text).records)
}

if (records.length !== identities.length) {
  throw new Error(`Question/identity mismatch: ${records.length}/${identities.length}`)
}

const strata = new Map()
for (const record of records) {
  const identity = identityByAuditId.get(record.auditId)
  if (!identity) throw new Error(`Missing private identity for ${record.auditId}`)
  const key = `${identity.packId}\u0000${record.questionType}`
  strata.set(key, [...(strata.get(key) ?? []), record])
}

const score = (auditId) => hash(`rrq-answer-uniqueness-second-pass-v1\u0000${auditId}`)
const selected = []
const remaining = []
for (const [, population] of [...strata.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  const ordered = [...population].sort((left, right) => score(left.auditId).localeCompare(score(right.auditId)))
  selected.push(ordered[0])
  remaining.push(...ordered.slice(1))
}
const target = Math.ceil(records.length * 0.2)
selected.push(...remaining
  .sort((left, right) => score(left.auditId).localeCompare(score(right.auditId)))
  .slice(0, target - selected.length))
const selectedIds = new Set(selected.map((record) => record.auditId))
const stratumSummary = [...strata.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([key, population]) => {
    const [packId, questionType] = key.split('\u0000')
    return {
      packId,
      questionType,
      population: population.length,
      selected: population.filter((record) => selectedIds.has(record.auditId)).length,
    }
  })

const selectedByPack = new Map()
for (const record of selected) {
  const packId = identityByAuditId.get(record.auditId).packId
  selectedByPack.set(packId, [...(selectedByPack.get(packId) ?? []), record])
}

await mkdir(path.join(destination, 'review-batches'), { recursive: true })
await mkdir(path.join(destination, 'private'), { recursive: true })
const batches = []
let batchNumber = 0
for (const [packId, packRecords] of [...selectedByPack.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  batchNumber += 1
  const batchId = `batch-s${String(batchNumber).padStart(4, '0')}`
  const file = `review-batches/${batchId}.json`
  const text = `${JSON.stringify({
    schemaVersion: 2,
    stage: 'SECOND_PASS_KEY_FREE_PROJECTION',
    batchId,
    packId,
    records: packRecords.sort((left, right) => left.auditId.localeCompare(right.auditId)),
  }, null, 2)}\n`
  await writeFile(path.join(destination, file), text)
  batches.push({ batchId, packId, questions: packRecords.length, file, sha256: hash(text) })
}

const selectedIdentityText = `${JSON.stringify({
  projectionVersion: manifest.projectionVersion,
  identityMap: identities.filter((entry) => selectedIds.has(entry.auditId)),
  sourceMapsNotice: 'Private mapping for post-freeze comparison only. Do not provide it to the key-free reviewer.',
}, null, 2)}\n`
const privateIdentityFile = 'private/identity-map.json'
await writeFile(path.join(destination, privateIdentityFile), selectedIdentityText)

const outputManifest = {
  projectionVersion: manifest.projectionVersion,
  stage: 'SECOND_PASS_KEY_FREE_PROJECTION',
  method: 'One SHA-256-ranked question per active pack/type stratum, then SHA-256-ranked fill to ceiling 20 percent globally',
  sourceManifestSha256: hash(manifestText),
  populationQuestions: records.length,
  selectedQuestions: selected.length,
  selectedRate: selected.length / records.length,
  stratumSummary,
  privateIdentityMap: { file: privateIdentityFile, sha256: hash(selectedIdentityText) },
  batches,
}
await writeFile(path.join(destination, 'manifest.json'), `${JSON.stringify(outputManifest, null, 2)}\n`)

console.log(JSON.stringify({
  destination,
  populationQuestions: records.length,
  selectedQuestions: selected.length,
  selectedRate: selected.length / records.length,
  packs: selectedByPack.size,
  strata: stratumSummary.length,
  batches: batches.length,
}, null, 2))
