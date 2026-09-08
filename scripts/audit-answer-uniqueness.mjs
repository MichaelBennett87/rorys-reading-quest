import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'

// This command imports frozen human conclusions. It never derives semantic
// correctness from an authored key. Writing requires an explicit current,
// key-free projection; ordinary verification reads only durable final ledgers.
const write = process.argv.includes('--write')
const valueAfter = (flag) => {
  const index = process.argv.indexOf(flag)
  return index >= 0 ? process.argv[index + 1] : null
}
const projectionArgument = valueAfter('--projection-dir')
if (write && !projectionArgument) {
  throw new Error('--write requires --projection-dir <current-key-free-projection>.')
}

const repoRoot = process.cwd()
const ledgerDirectory = path.resolve('docs/content/answer-uniqueness-ledger')
const blindDirectory = path.join(ledgerDirectory, 'blind')
const secondPassDirectory = path.join(ledgerDirectory, 'second-pass')
const hash = (text) => createHash('sha256').update(text).digest('hex')
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))
const optionalJson = async (file) => {
  try {
    return await readJson(file)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}
const sameSet = (left, right) => new Set(left).size === left.length
  && new Set(right).size === right.length
  && left.length === right.length
  && left.every((value) => right.includes(value))
const hasAmbiguity = (value) => typeof value === 'string'
  && value.trim() !== ''
  && value.trim().toUpperCase() !== 'NONE'
const collectIds = (value, result = new Set(), field = '') => {
  if (typeof value === 'string' && (field === 'id' || /(?:Id|Ids|Identifier)$/.test(field))) result.add(value)
  else if (Array.isArray(value)) value.forEach((entry) => collectIds(entry, result, field))
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, entry]) => collectIds(entry, result, key))
  return result
}

async function listJsonFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await listJsonFiles(entryPath))
    else if (entry.name.endsWith('.json')) files.push(entryPath)
  }
  return files.sort()
}

function receiptPriority(file) {
  const normalized = file.replaceAll('\\', '/')
  const special = normalized.match(/\/(corrections|adjudications)-v(\d+)(?:-([a-z]+))?\//)
  if (special) {
    const kind = special[1] === 'adjudications' ? 2 : 1
    const state = special[3] === 'final' ? 20 : special[3] === 'initial' ? 10 : 0
    return 10000 + Number(special[2]) * 100 + state + kind
  }
  const version = normalized.match(/\/v(\d+)\//)
  const nameBonus = normalized.includes('.v2r2.') ? 2 : normalized.includes('.canonical.') ? 1 : 0
  return (version ? Number(version[1]) * 100 : 0) + nameBonus
}

async function loadProjection(directory) {
  const root = path.resolve(directory)
  const manifest = await readJson(path.join(root, 'manifest.json'))
  const identities = (await readJson(path.join(root, 'private/identity-map.json'))).identityMap
  const visibleByAuditId = new Map()
  for (const meta of manifest.batches) {
    const file = path.join(root, meta.file)
    const text = await readFile(file, 'utf8')
    if (hash(text) !== meta.sha256) throw new Error(`Current key-free projection changed: ${meta.batchId}`)
    for (const record of JSON.parse(text).records) {
      if (visibleByAuditId.has(record.auditId)) throw new Error(`Duplicate projected audit ID: ${record.auditId}`)
      visibleByAuditId.set(record.auditId, record)
    }
  }
  if (identities.length !== visibleByAuditId.size) throw new Error('Projection identity inventory mismatch.')
  return {
    manifest,
    identities,
    identityByQuestionId: new Map(identities.map((identity) => [identity.questionId, identity])),
    identityByAuditId: new Map(identities.map((identity) => [identity.auditId, identity])),
    visibleByAuditId,
  }
}

async function loadPrimaryCandidates() {
  const candidates = new Map()
  for (const file of await listJsonFiles(blindDirectory)) {
    if (file.replaceAll('\\', '/').includes('/original-reports/')) continue
    const text = await readFile(file, 'utf8')
    const receipt = JSON.parse(text)
    if (receipt.stage !== 'PASS_A_FROZEN_BEFORE_KEY_COMPARISON') continue
    // Root-level schema-v1 journals are preserved historical checkpoints, not
    // opaque-ID receipts. Only schema-v2 batch receipts can satisfy this gate.
    if (receipt.schemaVersion !== 2 || !Array.isArray(receipt.records)) continue
    const projectionSha256 = receipt.batchFileSha256 ?? receipt.projectionSha256
    if (!/^[a-f0-9]{64}$/.test(projectionSha256 ?? '') || !receipt.reviewer?.trim()) {
      throw new Error(`Invalid frozen primary receipt metadata: ${path.relative(repoRoot, file)}`)
    }
    const relativePath = path.relative(repoRoot, file).replaceAll('\\', '/')
    for (const record of receipt.records ?? []) {
      const candidate = {
        record,
        receipt,
        receiptPath: relativePath,
        receiptSha256: hash(text),
        projectionSha256,
        priority: receiptPriority(file),
      }
      candidates.set(record.auditId, [...(candidates.get(record.auditId) ?? []), candidate])
    }
  }
  return candidates
}

function selectCurrentPrimaryReceipt(identity, candidates) {
  const matches = (candidates.get(identity.auditId) ?? [])
    .filter((candidate) => candidate.record.fingerprint === identity.visibleProjectionFingerprint)
    .sort((left, right) => right.priority - left.priority || right.receiptPath.localeCompare(left.receiptPath))
  if (!matches.length) throw new Error(`No current frozen primary receipt: ${identity.questionId}`)
  return matches[0]
}

function validateReviewRecord(record, visible, label) {
  if (!record || record.fingerprint !== visible.visibleProjectionFingerprint || record.slots.length !== visible.slots.length) {
    throw new Error(`${label} inventory or fingerprint mismatch: ${record?.auditId ?? visible.auditId}`)
  }
  for (const slot of record.slots) {
    const visibleSlot = visible.slots.find((candidate) => candidate.slotId === slot.slotId)
    const answerIds = visibleSlot?.options.map((option) => option.answerId) ?? []
    const reviewedIds = (slot.options ?? []).map((option) => option[0])
    if (!visibleSlot
      || hasAmbiguity(slot.ambiguity)
      || slot.selectionContractValid !== true
      || !sameSet(reviewedIds, answerIds)
      || !sameSet(slot.defensible, [...new Set(slot.defensible)])
      || slot.defensible.some((answerId) => !answerIds.includes(answerId))) {
      throw new Error(`${label} conclusion is incomplete or unresolved: ${record.auditId}/${slot.slotId}`)
    }
    for (const option of slot.options) {
      if (!option[1]?.trim() || !option[2]?.trim() || !Array.isArray(option[3])) {
        throw new Error(`${label} option judgment is incomplete: ${record.auditId}/${slot.slotId}/${option[0]}`)
      }
    }
  }
}

async function loadSecondPass(projection, primaryByAuditId) {
  const baseDirectory = path.join(secondPassDirectory, 'v1')
  const base = new Map()
  for (const file of (await listJsonFiles(baseDirectory)).filter((entry) => entry.endsWith('.second-pass.json'))) {
    const text = await readFile(file, 'utf8')
    const receipt = JSON.parse(text)
    if (receipt.stage !== 'SECOND_PASS_FROZEN_BEFORE_KEY_COMPARISON' || receipt.independentReviewer !== false || !receipt.reviewer?.trim()) {
      throw new Error(`Invalid second-pass receipt metadata: ${path.relative(repoRoot, file)}`)
    }
    for (const record of receipt.records) {
      if (base.has(record.auditId)) throw new Error(`Duplicate sampled second-pass question: ${record.auditId}`)
      base.set(record.auditId, {
        record,
        receiptPath: path.relative(repoRoot, file).replaceAll('\\', '/'),
        receiptSha256: hash(text),
      })
    }
  }

  const corrections = new Map()
  for (const file of (await listJsonFiles(secondPassDirectory)).filter((entry) => entry.endsWith('.second-pass.json'))) {
    if (path.dirname(file) === baseDirectory) continue
    const text = await readFile(file, 'utf8')
    const receipt = JSON.parse(text)
    if (receipt.stage !== 'SECOND_PASS_FROZEN_BEFORE_KEY_COMPARISON' || receipt.independentReviewer !== false || !receipt.reviewer?.trim()) {
      throw new Error(`Invalid second-pass correction metadata: ${path.relative(repoRoot, file)}`)
    }
    for (const record of receipt.records) {
      if (!base.has(record.auditId)) continue
      const identity = projection.identityByAuditId.get(record.auditId)
      if (!identity || record.fingerprint !== identity.visibleProjectionFingerprint) continue
      if (corrections.has(record.auditId)) throw new Error(`Duplicate current second-pass correction: ${record.auditId}`)
      corrections.set(record.auditId, {
        record,
        receiptPath: path.relative(repoRoot, file).replaceAll('\\', '/'),
        receiptSha256: hash(text),
      })
    }
  }

  const current = new Map()
  for (const [auditId, original] of base) {
    const identity = projection.identityByAuditId.get(auditId)
    const visible = projection.visibleByAuditId.get(auditId)
    const selected = corrections.get(auditId) ?? original
    if (!identity || !visible || selected.record.fingerprint !== identity.visibleProjectionFingerprint) {
      throw new Error(`Sampled second-pass question lacks a current receipt: ${auditId}`)
    }
    if (selected.record.slots.length !== visible.slots.length) throw new Error(`Second-pass slot mismatch: ${auditId}`)
    const primary = primaryByAuditId.get(auditId)?.record
    for (const slot of selected.record.slots) {
      const visibleSlot = visible.slots.find((candidate) => candidate.slotId === slot.slotId)
      const primarySlot = primary?.slots.find((candidate) => candidate.slotId === slot.slotId)
      if (!visibleSlot
        || !primarySlot
        || hasAmbiguity(slot.ambiguity)
        || slot.selectionContractValid !== true
        || !slot.challengeSummary?.trim()
        || !sameSet(slot.defensible, primarySlot.defensible)) {
        throw new Error(`Second-pass conclusion does not confirm the current primary conclusion: ${auditId}/${slot.slotId}`)
      }
    }
    current.set(auditId, selected)
  }
  return current
}

function buildContracts(packs, inventory, projection, sourceProjectionByQuestionId) {
  const inventoryById = new Map(inventory.records.map((record) => [record.questionId, record]))
  return packs.flatMap((pack) => pack.questions.map((question) => {
    const current = inventoryById.get(question.questionIdentifier)
    const identity = projection?.identityByQuestionId.get(current.questionId)
    const payload = question.questionContent
    const slots = []
    const slot = (slotId, prompt, options, keys, count = keys.length) => slots.push({
      slotId,
      prompt,
      requestedSelectionCount: count,
      keyedAnswerIds: keys,
      answerIds: options.map((option) => option.id),
    })
    if (payload.type === 'multiple_choice' || payload.type === 'multi_select') {
      slot('response', current.prompt, payload.choices, payload.correctChoiceIds, payload.type === 'multiple_choice' ? 1 : payload.correctChoiceIds.length)
    }
    if (payload.type === 'hot_text') slot('response', current.prompt, payload.selectableSegments, payload.correctSegmentIds)
    if (payload.type === 'two_part') {
      slot('part_a', payload.partAPrompt, payload.partAChoices, [payload.partACorrectChoiceId])
      slot('part_b', payload.partBPrompt, payload.partBChoices, [payload.partBCorrectChoiceId])
    }
    if (payload.type === 'table_match') {
      payload.rows.forEach((row) => slot(row.id, row.prompt, row.options, [row.correctChoiceId]))
    }
    const answerIds = new Set(slots.flatMap((entry) => entry.answerIds))
    const sourceRecord = sourceProjectionByQuestionId.get(current.questionId)
    const evidenceIds = identity
      ? [...new Set([identity.questionPassageId, ...Object.values(identity.sourceAliases ?? {})].filter(Boolean))]
      : [...collectIds(sourceRecord)].filter((id) => id !== current.questionId
        && (payload.type === 'hot_text' || !answerIds.has(id)))
    return {
      questionId: current.questionId,
      packId: current.packId,
      contentVersion: current.contentVersion,
      contentFingerprint: current.contentFingerprint,
      questionType: payload.type,
      evidenceIds,
      slots,
      auditId: identity?.auditId,
      identity,
    }
  }))
}

function buildFinalRecord(contract, projection, primary, secondPass, determineAnswerSlotStatus) {
  const identity = contract.identity
  const visible = projection.visibleByAuditId.get(identity.auditId)
  if (identity.contentFingerprint !== contract.contentFingerprint
    || identity.packId !== contract.packId
    || identity.visibleProjectionFingerprint !== visible?.visibleProjectionFingerprint) {
    throw new Error(`Current projection identity mismatch: ${contract.questionId}`)
  }
  validateReviewRecord(primary.record, visible, 'Primary blind review')
  const fallbackEvidenceId = identity.questionPassageId ?? contract.evidenceIds[0]
  if (!fallbackEvidenceId || !contract.evidenceIds.includes(fallbackEvidenceId)) {
    throw new Error(`No source-owned evidence fallback: ${contract.questionId}`)
  }

  const slots = contract.slots.map((expected) => {
    const mappingEntry = Object.entries(identity.mapping).find(([opaqueSlotId, mapping]) => (mapping.originalRowId ?? opaqueSlotId) === expected.slotId)
    if (!mappingEntry) throw new Error(`Missing opaque slot mapping: ${contract.questionId}/${expected.slotId}`)
    const [opaqueSlotId, mapping] = mappingEntry
    const blindSlot = visible.slots.find((slot) => slot.slotId === opaqueSlotId)
    const conclusion = primary.record.slots.find((slot) => slot.slotId === opaqueSlotId)
    if (!blindSlot || !conclusion || blindSlot.prompt !== expected.prompt) {
      throw new Error(`Current blind slot contract mismatch: ${contract.questionId}/${expected.slotId}`)
    }
    const answerId = (opaqueId) => {
      const realId = mapping.answers[opaqueId]
      if (!realId || !expected.answerIds.includes(realId)) throw new Error(`Unknown opaque answer: ${contract.questionId}/${opaqueSlotId}/${opaqueId}`)
      return realId
    }
    const optionJudgments = conclusion.options.map(([opaqueId, verdict, rationale, aliases]) => {
      const mappedEvidence = aliases.map((alias) => {
        const realId = identity.sourceAliases?.[alias]
        if (!realId || !contract.evidenceIds.includes(realId)) {
          throw new Error(`Foreign evidence alias: ${contract.questionId}/${opaqueSlotId}/${alias}`)
        }
        return realId
      })
      return {
        answerId: answerId(opaqueId),
        verdict,
        rationale,
        evidenceIds: [...new Set(mappedEvidence.length ? mappedEvidence : [fallbackEvidenceId])],
      }
    })
    const result = {
      slotId: expected.slotId,
      prompt: expected.prompt,
      requestedSelectionCount: expected.requestedSelectionCount,
      keyedAnswerIds: expected.keyedAnswerIds,
      independentlyDefensibleAnswerIds: conclusion.defensible.map(answerId),
      optionJudgments,
      ambiguity: hasAmbiguity(conclusion.ambiguity) ? conclusion.ambiguity : '',
    }
    return { ...result, uniquenessStatus: determineAnswerSlotStatus(expected, result) }
  })

  const keyComparisonComplete = slots.every((slot) => slot.uniquenessStatus === 'PASS')
  const distractorChallengeComplete = slots.every((slot) => slot.optionJudgments.length > 0
    && slot.optionJudgments.every((judgment) => judgment.rationale.trim() && judgment.evidenceIds.length))
  const correctionApplied = primary.receiptPath.includes('/corrections-')
  const method = secondPass
    ? 'STRATIFIED_SECOND_PASS'
    : correctionApplied
      ? 'CORRECTION_REREVIEW'
      : primary.receiptPath.includes('/adjudications-')
        ? 'PRIMARY_ADJUDICATION'
        : 'PRIMARY_PASS_C_RECONCILIATION'
  const finalReceipt = secondPass ?? primary
  return {
    questionId: contract.questionId,
    packId: contract.packId,
    contentVersion: contract.contentVersion,
    contentFingerprint: contract.contentFingerprint,
    questionType: contract.questionType,
    blindReview: {
      projectionSha256: primary.projectionSha256,
      conclusionsSha256: primary.receiptSha256,
      reviewer: primary.receipt.reviewer,
      frozenBeforeKeyComparison: true,
    },
    keyComparisonComplete,
    distractorChallengeComplete,
    independentFinalReviewComplete: false,
    finalReview: {
      completed: keyComparisonComplete && distractorChallengeComplete,
      independent: false,
      reviewer: 'primary-agent-current-conversation',
      method,
      receiptPath: finalReceipt.receiptPath,
      receiptSha256: finalReceipt.receiptSha256,
      currentFingerprintVerified: true,
    },
    partBSupportsPartA: contract.questionType === 'two_part' ? keyComparisonComplete : null,
    slots,
    correctionApplied,
    correctionSummary: correctionApplied
      ? `Learner-visible content was corrected and re-reviewed in ${primary.receiptPath}.`
      : '',
    finalStatus: keyComparisonComplete && distractorChallengeComplete ? 'PASS' : 'FAIL',
  }
}

const server = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
try {
  const { getActiveContentPacks } = await server.ssrLoadModule('/src/domain/content/packs/registry.ts')
  const { buildActiveQuestionTruthInventory, buildBlindQuestionTruthProjection } = await server.ssrLoadModule('/src/domain/content/questionTruthAudit.ts')
  const { auditAnswerUniqueness, determineAnswerSlotStatus } = await server.ssrLoadModule('/src/domain/content/answerUniquenessAudit.ts')
  const packs = getActiveContentPacks()
  const inventory = buildActiveQuestionTruthInventory(packs)
  if (inventory.issues.length) throw new Error(JSON.stringify(inventory.issues))
  const sourceProjectionByQuestionId = new Map(buildBlindQuestionTruthProjection(packs).map((record) => [record.questionId, record]))

  const projection = write ? await loadProjection(projectionArgument) : null
  const contracts = buildContracts(packs, inventory, projection, sourceProjectionByQuestionId)
  let records = []
  if (write) {
    const candidates = await loadPrimaryCandidates()
    const primaryByAuditId = new Map()
    for (const identity of projection.identities) {
      primaryByAuditId.set(identity.auditId, selectCurrentPrimaryReceipt(identity, candidates))
    }
    const secondPassByAuditId = await loadSecondPass(projection, primaryByAuditId)
    records = contracts.map((contract) => buildFinalRecord(
      contract,
      projection,
      primaryByAuditId.get(contract.auditId),
      secondPassByAuditId.get(contract.auditId),
      determineAnswerSlotStatus,
    ))
  } else {
    for (const pack of packs) {
      const ledger = await optionalJson(path.join(ledgerDirectory, `${pack.manifest.packId}.json`))
      records.push(...(ledger?.records ?? []))
    }
  }

  const plainContracts = contracts.map(({ auditId: _auditId, identity: _identity, ...contract }) => contract)
  const issues = auditAnswerUniqueness(plainContracts, records)
  const requiredSecondPassQuestions = Math.ceil(plainContracts.length * 0.2)
  const secondPassRecords = records.filter((record) => record.finalReview?.method === 'STRATIFIED_SECOND_PASS')
  const allStrata = new Set(plainContracts.map((contract) => `${contract.packId}:${contract.questionType}`))
  const secondPassStrata = new Set(secondPassRecords.map((record) => `${record.packId}:${record.questionType}`))
  const secondPassPacks = new Set(secondPassRecords.map((record) => record.packId))
  if (secondPassRecords.length < requiredSecondPassQuestions) {
    issues.push({ code: 'answer_second_pass_sample_incomplete', questionId: 'GLOBAL', detail: 'At least 20 percent of current questions require a fresh second pass.' })
  }
  if (secondPassPacks.size !== packs.length || secondPassStrata.size !== allStrata.size) {
    issues.push({ code: 'answer_second_pass_strata_incomplete', questionId: 'GLOBAL', detail: 'The second pass must cover every active pack and pack/question-type stratum.' })
  }

  const issuesByQuestion = new Map()
  for (const issue of issues) issuesByQuestion.set(issue.questionId, [...(issuesByQuestion.get(issue.questionId) ?? []), issue])
  const progressPacks = packs.map((pack) => {
    const packContracts = plainContracts.filter((contract) => contract.packId === pack.manifest.packId)
    const packRecords = records.filter((record) => record.packId === pack.manifest.packId)
    return {
      packId: pack.manifest.packId,
      gradeBand: pack.manifest.gradeBand,
      questions: packContracts.length,
      slots: packContracts.reduce((sum, contract) => sum + contract.slots.length, 0),
      frozenBlindQuestions: packRecords.filter((record) => record.blindReview).length,
      correctedQuestions: packRecords.filter((record) => record.correctionApplied).length,
      secondPassQuestions: packRecords.filter((record) => record.finalReview?.method === 'STRATIFIED_SECOND_PASS').length,
      finalPassQuestions: packRecords.filter((record) => !issuesByQuestion.has(record.questionId)).length,
    }
  })
  const summary = {
    status: issues.length ? 'STOP' : 'PASS',
    activeQuestions: plainContracts.length,
    activeSlots: plainContracts.reduce((sum, contract) => sum + contract.slots.length, 0),
    recordedQuestions: records.length,
    frozenBlindQuestions: records.filter((record) => record.blindReview).length,
    correctedQuestions: records.filter((record) => record.correctionApplied).length,
    requiredSecondPassQuestions,
    secondPassQuestions: secondPassRecords.length,
    secondPassPacks: secondPassPacks.size,
    secondPassStrata: secondPassStrata.size,
    totalStrata: allStrata.size,
    finalPassQuestions: records.filter((record) => !issuesByQuestion.has(record.questionId)).length,
    issueCount: issues.length,
    packs: progressPacks,
  }

  if (write) {
    await mkdir(ledgerDirectory, { recursive: true })
    for (const pack of packs) {
      const packRecords = records.filter((record) => record.packId === pack.manifest.packId)
      await writeFile(path.join(ledgerDirectory, `${pack.manifest.packId}.json`), `${JSON.stringify({
        schemaVersion: 2,
        reviewNotice: 'Fingerprint-bound semantic review. PASS records preserve blind conclusions, key comparison, option challenges, and truthful primary-review provenance.',
        records: packRecords,
      }, null, 2)}\n`)
    }
    await writeFile(path.join(ledgerDirectory, 'AUDIT_PROGRESS.json'), `${JSON.stringify(summary, null, 2)}\n`)
    const rows = progressPacks.map((pack) => `| ${pack.packId} | ${pack.questions} | ${pack.frozenBlindQuestions} | ${pack.correctedQuestions} | ${pack.secondPassQuestions} | ${pack.finalPassQuestions} |`).join('\n')
    await writeFile(path.join(ledgerDirectory, 'AUDIT_PROGRESS.md'), `# Semantic answer-uniqueness audit progress\n\nRelease gate: **${summary.status}**.\n\nRegistry-derived questions: ${summary.activeQuestions}. Response slots: ${summary.activeSlots}.\nFrozen blind conclusions: ${summary.frozenBlindQuestions}. Corrected questions: ${summary.correctedQuestions}.\nStratified second pass: ${summary.secondPassQuestions}/${summary.requiredSecondPassQuestions} across ${summary.secondPassPacks} packs and ${summary.secondPassStrata}/${summary.totalStrata} pack/type strata.\nFinal semantic PASS: ${summary.finalPassQuestions}.\n\nReview provenance is primary-agent work under the no-subagent policy. No record claims independent review. Fingerprints prove which learner-visible content was reviewed; they do not prove that natural-language judgment is infallible.\n\n| Pack | Questions | Frozen Pass A | Corrected | Second pass | Final PASS |\n| --- | ---: | ---: | ---: | ---: | ---: |\n${rows}\n\nGenerated by the explicit \`--write\` command. Verify without rewriting using \`npm run audit:answer-uniqueness\`.\n`)
  }

  console.log(JSON.stringify({
    ...summary,
    packs: summary.packs.filter((pack) => pack.finalPassQuestions !== pack.questions),
    issueSample: issues.slice(0, 12),
  }, null, 2))
  if (issues.length) process.exitCode = 1
} finally {
  await server.close()
}
