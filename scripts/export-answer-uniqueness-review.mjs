import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import os from 'node:os'
import { createServer } from 'vite'

// Offline review export only. No generated semantic verdicts or approval claims.
const destination = process.argv[2] ?? path.join(os.tmpdir(), 'rrq-answer-uniqueness-452ab84-v2-release')
await mkdir(destination)
const server = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
try {
  const { getActiveContentPacks } = await server.ssrLoadModule('/src/domain/content/packs/registry.ts')
  const { buildBlindQuestionTruthProjection, buildActiveQuestionTruthInventory } = await server.ssrLoadModule('/src/domain/content/questionTruthAudit.ts')
  const packs = getActiveContentPacks()
  const inventory = buildActiveQuestionTruthInventory(packs)
  if (inventory.issues.length) throw new Error(JSON.stringify(inventory.issues))
  const projection = buildBlindQuestionTruthProjection(packs)
  const identityMap = []
  const manifest = []
  const assistanceRecords = []
  const assistanceFiles = []
  const visibleRecords = []
  let ordinal = 0
  for (const pack of packs) {
    const sourceIds = new Map()
    const remapSourceId = (id) => {
      if (!sourceIds.has(id)) sourceIds.set(id, `S${String(sourceIds.size + 1).padStart(4, '0')}`)
      return sourceIds.get(id)
    }
    const sanitizeSource = (value, field = '') => {
      if (Array.isArray(value)) return value.map((entry) => sanitizeSource(entry, field))
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => !['selectedForContext', 'reviewStatus', 'contentVersion', 'sourceReference'].includes(key)).map(([key, entry]) => [key, sanitizeSource(entry, key)]))
      return typeof value === 'string' && /(?:Id|Ids|Identifier)$/.test(field) ? remapSourceId(value) : value
    }
    const records = projection.filter((record) => record.packId === pack.manifest.packId).map((record) => {
      const auditId = `Q${String(++ordinal).padStart(4, '0')}`
      const question = pack.questions.find((entry) => entry.questionIdentifier === record.questionId)
      const payload = question.questionContent
      const slots = []
      const mapping = {}
      const addSlot = (slotId, prompt, choices, selectionContract, originalRowId) => {
        const ordered = choices.map((choice, index) => ({ choice, order: createHash('sha256').update(`${auditId}:${slotId}:${index}`).digest('hex') })).sort((a, b) => a.order.localeCompare(b.order))
        mapping[slotId] = { originalRowId, answers: {} }
        slots.push({ slotId, prompt, selectionContract, options: ordered.map(({ choice }, index) => {
          const answerId = `A${index + 1}`
          mapping[slotId].answers[answerId] = choice.id
          return { answerId, text: choice.text }
        }) })
      }
      if (payload.type === 'multiple_choice' || payload.type === 'multi_select') addSlot(
        'response',
        record.prompt,
        payload.choices,
        payload.type === 'multiple_choice'
          ? { kind: 'exact_count', count: 1, control: 'radio', instruction: 'Choose one answer.' }
          : { kind: 'all_defensible', control: 'checkbox', instruction: 'Choose all that are correct.' },
      )
      if (payload.type === 'hot_text') {
        const allowMultiple = (payload.selectionMode ?? 'single') === 'multiple'
        addSlot(
          'response',
          record.prompt,
          payload.selectableSegments,
          allowMultiple
            ? { kind: 'all_defensible', control: 'checkbox', instruction: 'Choose the relevant segment(s).' }
            : { kind: 'exact_count', count: 1, control: 'radio', instruction: 'Choose the relevant segment(s).' },
        )
      }
      if (payload.type === 'two_part') {
        addSlot('part_a', payload.partAPrompt, payload.partAChoices, { kind: 'exact_count', count: 1, control: 'radio', instruction: 'Choose one answer for Part A.' })
        addSlot('part_b', payload.partBPrompt, payload.partBChoices, { kind: 'exact_count', count: 1, control: 'radio', instruction: 'Choose one answer for Part B.' })
      }
      if (payload.type === 'table_match') payload.rows.forEach((row, index) => addSlot(
        `row_${index + 1}`,
        row.prompt,
        row.options,
        {
          kind: 'exact_count',
          count: 1,
          control: 'select',
          instruction: payload.selectionMode === 'use_each_once'
            ? 'Choose one match for this row. Each option can be used only once across the table.'
            : 'Choose one match for this row.',
        },
        row.id,
      ))
      const visibleRecord = {
        projectionVersion: 2,
        auditId,
        questionType: payload.type,
        prompt: record.prompt,
        selectionMode: payload.selectionMode,
        lessonTitle: record.lessonTitle,
        lessonObjective: record.lessonObjective,
        presentation: sanitizeSource(record.presentation),
        teaching: record.teachingBlock ? sanitizeSource(record.teachingBlock) : undefined,
        fluencyPractice: record.fluencyPractice ? sanitizeSource(record.fluencyPractice) : undefined,
        wordHelpAvailability: sanitizeSource(record.wordHelpAvailability),
        displayedTexts: sanitizeSource(record.displayedTexts),
        slots,
      }
      const visibleProjectionFingerprint = createHash('sha256').update(JSON.stringify(visibleRecord)).digest('hex')
      const allowedVisibleSourceAliasIds = [...collectOpaqueSourceIds(visibleRecord)].sort()
      const trackedAssistance = record.trackedAssistance ? sanitizeSource(record.trackedAssistance) : undefined
      const assistanceProjectionFingerprint = trackedAssistance
        ? createHash('sha256').update(JSON.stringify({ auditId, trackedAssistance })).digest('hex')
        : null
      const allowedAssistanceSourceAliasIds = trackedAssistance ? [...collectOpaqueSourceIds(trackedAssistance)].sort() : []
      const allowedSourceAliasIds = [...new Set([...allowedVisibleSourceAliasIds, ...allowedAssistanceSourceAliasIds])]
      identityMap.push({
        auditId,
        questionId: record.questionId,
        packId: record.packId,
        questionPassageId: question.passageIdentifier,
        contentFingerprint: inventory.records.find((entry) => entry.questionId === record.questionId).contentFingerprint,
        visibleProjectionFingerprint,
        assistanceProjectionFingerprint,
        mapping,
        allowedVisibleSourceAliasIds,
        allowedAssistanceSourceAliasIds,
        sourceAliases: Object.fromEntries([...sourceIds.entries()]
          .filter(([, opaqueId]) => allowedSourceAliasIds.includes(opaqueId))
          .map(([sourceId, opaqueId]) => [opaqueId, sourceId])),
      })
      if (trackedAssistance) assistanceRecords.push({ auditId, packId: record.packId, assistanceProjectionFingerprint, trackedAssistance })
      visibleRecords.push({ lessonKey: `${record.packId}:${record.lessonIds[0]}`, record: { ...visibleRecord, visibleProjectionFingerprint } })
      return { ...visibleRecord, visibleProjectionFingerprint }
    })
    const directory = path.join(destination, `grade-${pack.manifest.gradeBand}`)
    await mkdir(directory, { recursive: true })
    const file = `${pack.manifest.packId}.json`
    const content = `${JSON.stringify({ projectionVersion: 2, packTitle: pack.manifest.packTitle, gradeBand: pack.manifest.gradeBand, records }, null, 2)}\n`
    await writeFile(path.join(directory, file), content, 'utf8')
    manifest.push({ packId: pack.manifest.packId, gradeBand: pack.manifest.gradeBand, questions: records.length, slots: records.reduce((sum, record) => sum + record.slots.length, 0), file: path.posix.join(`grade-${pack.manifest.gradeBand}`, file), sha256: createHash('sha256').update(content).digest('hex') })
  }
  const assistanceByPack = Map.groupBy(assistanceRecords, (entry) => entry.packId)
  for (const [packId, records] of assistanceByPack) {
    const pack = packs.find((entry) => entry.manifest.packId === packId)
    const directory = path.join(destination, 'tracked-assistance', `grade-${pack.manifest.gradeBand}`)
    await mkdir(directory, { recursive: true })
    const content = `${JSON.stringify({
      projectionVersion: 2,
      assistanceTracked: true,
      records: records.map(({ packId: _packId, ...record }) => record),
    }, null, 2)}\n`
    const file = `${packId}.word-help.json`
    await writeFile(path.join(directory, file), content, 'utf8')
    assistanceFiles.push({
      packId,
      gradeBand: pack.manifest.gradeBand,
      records: records.length,
      file: path.posix.join('tracked-assistance', `grade-${pack.manifest.gradeBand}`, file),
      sha256: createHash('sha256').update(content).digest('hex'),
    })
  }
  const reviewBatches = buildReviewBatches(visibleRecords)
  const batchDirectory = path.join(destination, 'review-batches')
  await mkdir(batchDirectory, { recursive: true })
  for (const batch of reviewBatches) {
    const content = `${JSON.stringify({ projectionVersion: 2, batchId: batch.batchId, records: batch.records }, null, 2)}\n`
    await writeFile(path.join(batchDirectory, `${batch.batchId}.json`), content, 'utf8')
    batch.sha256 = createHash('sha256').update(content).digest('hex')
  }
  await mkdir(path.join(destination, 'private'), { recursive: true })
  const identityMapContent = `${JSON.stringify({ projectionVersion: 2, identityMap, sourceMapsNotice: 'Each identity record authorizes only the source aliases present in that question projection.' }, null, 2)}\n`
  await writeFile(path.join(destination, 'private', 'identity-map.json'), identityMapContent)
  await writeFile(path.join(destination, 'manifest.json'), `${JSON.stringify({
    projectionVersion: 2,
    packs: manifest,
    trackedAssistance: assistanceFiles,
    privateIdentityMap: {
      file: 'private/identity-map.json',
      records: identityMap.length,
      sha256: createHash('sha256').update(identityMapContent).digest('hex'),
    },
    batches: reviewBatches.map(({ batchId, records, sha256 }) => ({
      batchId,
      questions: records.length,
      file: path.posix.join('review-batches', `${batchId}.json`),
      sha256,
    })),
  }, null, 2)}\n`)
  console.log(JSON.stringify({ destination, packs: packs.length, lessons: packs.reduce((sum, pack) => sum + pack.lessons.length, 0), texts: packs.reduce((sum, pack) => sum + pack.passages.length, 0), questions: projection.length, supportTargets: packs.reduce((sum, pack) => sum + pack.passages.reduce((count, passage) => count + (passage.wordSupportTargets?.length ?? 0), 0), 0), grades: manifest.reduce((totals, pack) => ({ ...totals, [pack.gradeBand]: (totals[pack.gradeBand] ?? 0) + pack.questions }), {}), slots: manifest.reduce((sum, pack) => sum + pack.slots, 0) }, null, 2))
} finally {
  await server.close()
}

function collectOpaqueSourceIds(value, result = new Set(), field = '') {
  if (typeof value === 'string' && /(?:Id|Ids|Identifier)$/.test(field) && /^S\d{4}$/.test(value)) result.add(value)
  else if (Array.isArray(value)) value.forEach((entry) => collectOpaqueSourceIds(entry, result, field))
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, entry]) => collectOpaqueSourceIds(entry, result, key))
  return result
}

function buildReviewBatches(records) {
  const lessonGroups = []
  for (const entry of records) {
    const currentGroup = lessonGroups.at(-1)
    if (currentGroup?.lessonKey === entry.lessonKey) currentGroup.records.push(entry.record)
    else lessonGroups.push({ lessonKey: entry.lessonKey, records: [entry.record] })
  }
  const batches = []
  let current = []
  const flush = () => {
    if (!current.length) return
    batches.push({ batchId: `batch-${String(batches.length + 1).padStart(4, '0')}`, records: current })
    current = []
  }
  for (const group of lessonGroups) {
    if (current.length && current.length + group.records.length > 20) flush()
    current.push(...group.records)
    if (current.length >= 10) flush()
  }
  flush()
  return batches
}
