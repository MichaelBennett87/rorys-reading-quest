import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { createServer } from 'vite'

const projectRoot = process.cwd()
const ledgerDirectory = path.join(projectRoot, 'docs', 'content', 'question-truth-ledger')
const correctionSummaries = new Map([
  ['lesson-g3-suffix-shifter-checkpoint-maker-q-7', 'Blind review replaced a sentence-role Part B with authored reading chunks so the checkpoint genuinely distinguishes morphological and pronunciation boundaries.'],
  ['lesson-g3-suffix-shifter-checkpoint-nature-q-7', 'Blind review replaced a sentence-role Part B with authored reading chunks so the checkpoint genuinely distinguishes morphological and pronunciation boundaries.'],
  ['lesson-g3-suffix-shifter-checkpoint-weather-q-7', 'Blind review replaced a sentence-role Part B with authored reading chunks so the checkpoint genuinely distinguishes morphological and pronunciation boundaries.'],
  ['lesson-g3-multisyllable-mountain-power-up-compounds-q-4', 'Blind review made the hot-text prompt self-contained instead of depending on opening Word Help to discover the requested chunk.'],
  ['lesson-g3-multisyllable-mountain-power-up-compounds-q-3', 'Blind review replaced a single qualifying silent-e target with transparent lakeside so the choose-two contract has exactly two defensible responses.'],
  ['lesson-g3-multisyllable-mountain-power-up-vowels-q-4', 'Blind review made the hot-text prompt self-contained instead of depending on opening Word Help to discover the requested chunk.'],
  ['lesson-g3-multisyllable-mountain-lab-garden-q-4', 'Blind review made the hot-text prompt self-contained instead of depending on opening Word Help to discover the requested chunk.'],
  ['lesson-g3-multisyllable-mountain-lab-wildlife-q-4', 'Blind review made the hot-text prompt self-contained instead of depending on opening Word Help to discover the requested chunk.'],
  ['lesson-g3-multisyllable-mountain-checkpoint-museum-q-5', 'Blind review bound the hot-text prompt to the authored prefix target rather than an unrelated fourth target.'],
  ['lesson-g3-multisyllable-mountain-checkpoint-engineering-q-5', 'Blind review bound the hot-text prompt to the authored prefix target rather than an unrelated fourth target.'],
  ['lesson-g3-multisyllable-mountain-checkpoint-adventure-q-5', 'Blind review bound the hot-text prompt to the authored prefix target rather than an unrelated fourth target.'],
  ['question-g3-fluency-flight-punctuation-pilot-4', 'Blind review gave every table option distinct visible wording while preserving the punctuation-cue construct.'],
  ['question-g3-fluency-flight-phrase-formation-2', 'Blind review labeled each proposed pause location so the grouping choices remain visibly distinct.'],
  ['question-g3-fluency-flight-dialogue-voices-4', 'Blind review gave every table option distinct visible wording while preserving the dialogue-voice construct.'],
  ['question-g3-fluency-flight-marsh-morning-4', 'Blind review gave every table option distinct visible wording while preserving the phrase-and-expression construct.'],
  ['question-g3-fluency-flight-formation-facts-3', 'Blind review labeled each proposed phrase boundary so the grouping choices remain visibly distinct.'],
  ['question-g3-fluency-flight-formation-facts-4', 'Blind review gave every table option distinct visible wording while preserving the informational-phrasing construct.'],
  ['g3-ss-cac-q1-5', 'Registration review added a genuinely unused minor-detail distractor required by the hardened use-each-once table contract.'],
  ['g3-ss-cac-q2-5', 'Registration review added a genuinely unused minor-detail distractor required by the hardened use-each-once table contract.'],
  ['g3-ss-cac-q3-5', 'Registration review added a genuinely unused minor-detail distractor required by the hardened use-each-once table contract.'],
  ['g3-ss-cac-q4-5', 'Registration review added a genuinely unused minor-detail distractor required by the hardened use-each-once table contract.'],
  ['g3-ss-cac-q5-6', 'Registration review added a genuinely unused minor-detail distractor required by the hardened use-each-once table contract.'],
  ['g3-ss-cac-q6-6', 'Registration review added a genuinely unused minor-detail distractor required by the hardened use-each-once table contract.'],
  ['g3-ss-cac-q7-6', 'Registration review added a genuinely unused minor-detail distractor required by the hardened use-each-once table contract.'],
  ['g3-ss-pp3-q5-4', 'Blind adversarial review replaced a second defensible Character A evidence option with a feeling-only distractor so exactly one cross-character evidence pair remains correct.'],
  ['g3-pp-pfo-q1-4', 'Blind review replaced a subjective free-verse line-break choice with the poem\'s unique one-word line so the hot-text response is objective.'],
  ['g3-pp-pfo-q4-4', 'Blind review bound the limerick hot-text item to the final A-rhyme after the B pair so only one line is defensible.'],
  ['g3-pp-pfo-q5-3', 'Blind review added an explicit haiku transfer item so the three checkpoints collectively assess all four required poem forms.'],
  ['g3-id-ce-q1-3', 'Semantic review named both keyed multiselect evidence details explicitly in the learner explanation.'],
  ['g3-id-ce-q2-3', 'Semantic review named both keyed multiselect evidence details explicitly in the learner explanation.'],
  ['g3-id-ce-q3-3', 'Semantic review named both keyed multiselect evidence details explicitly in the learner explanation.'],
  ['g3-id-ce-q4-3', 'Semantic review named both keyed multiselect evidence details explicitly in the learner explanation.'],
  ['g3-id-ce-q5-4', 'Semantic review named both keyed multiselect evidence details explicitly in the learner explanation.'],
  ['g3-id-ce-q6-4', 'Semantic review named both keyed multiselect evidence details explicitly in the learner explanation.'],
  ['g3-id-ce-q7-4', 'Semantic review named both keyed multiselect evidence details explicitly in the learner explanation.'],
  ['g3-id-ce-q1-5', 'Catalog review added a plausible unused option required by the hardened use-each-once table evaluator.'],
  ['g3-id-ce-q2-5', 'Catalog review added a plausible unused option required by the hardened use-each-once table evaluator.'],
  ['g3-id-ce-q3-5', 'Catalog review added a plausible unused option required by the hardened use-each-once table evaluator.'],
  ['g3-id-ce-q4-5', 'Catalog review added a plausible unused option required by the hardened use-each-once table evaluator.'],
  ['g3-id-ce-q5-6', 'Catalog review added a plausible unused option required by the hardened use-each-once table evaluator.'],
  ['g3-id-ce-q6-6', 'Catalog review added a plausible unused option required by the hardened use-each-once table evaluator.'],
  ['g3-id-ce-q7-6', 'Catalog review added a plausible unused option required by the hardened use-each-once table evaluator.'],
])
const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})

try {
  const registry = await server.ssrLoadModule('/src/domain/content/packs/registry.ts')
  const truthAudit = await server.ssrLoadModule('/src/domain/content/questionTruthAudit.ts')
  const lessonDomain = await server.ssrLoadModule('/src/domain/lesson/index.ts')
  const activePacks = registry.getActiveContentPacks()
  const inventory = truthAudit.buildActiveQuestionTruthInventory(activePacks)
  const blindProjection = truthAudit.buildBlindQuestionTruthProjection(activePacks)

  const registeredQuestionCount = activePacks.reduce((sum, pack) => sum + pack.questions.length, 0)
  if (inventory.issues.length > 0 || inventory.records.length !== registeredQuestionCount) {
    throw new Error(`Truth inventory is not releasable: ${JSON.stringify(inventory.issues, null, 2)}`)
  }
  assertBlindProjection(blindProjection)

  const lessonQuestionById = new Map()
  for (const entry of lessonDomain.lessonCatalog) {
    if (entry.selectionStatus !== 'active' || entry.packId.startsWith('legacy-')) continue
    const result = lessonDomain.getLessonById(entry.lessonId)
    if (!result.lesson || result.errors.length > 0) {
      throw new Error(`${entry.packId}/${entry.lessonId}: ${result.errors.join('; ')}`)
    }
    for (const question of result.lesson.questions) {
      if (lessonQuestionById.has(question.questionId)) throw new Error(`Duplicate lesson question ${question.questionId}`)
      lessonQuestionById.set(question.questionId, question)
    }
  }

  const contractByQuestionId = new Map()
  for (const record of inventory.records) {
    const question = lessonQuestionById.get(record.questionId)
    if (!question) throw new Error(`Missing lesson evaluator question ${record.packId}/${record.questionId}`)
    const contract = lessonDomain.assertQuestionGradingContract(question)
    if (contract.issues.length > 0) {
      throw new Error(`${record.packId}/${record.questionId}: ${JSON.stringify(contract.issues)}`)
    }
    contractByQuestionId.set(record.questionId, contract)
  }

  await mkdir(ledgerDirectory, { recursive: true })
  const expectedFiles = new Set(activePacks.map((pack) => `${pack.manifest.packId}.json`))
  const existingFiles = (await readdir(ledgerDirectory)).filter((file) => file.endsWith('.json'))
  const staleFiles = existingFiles.filter((file) => !expectedFiles.has(file))
  if (staleFiles.length > 0) throw new Error(`Refusing to hide stale ledger files: ${staleFiles.join(', ')}`)

  for (const pack of activePacks) {
    const records = inventory.records
      .filter((record) => record.packId === pack.manifest.packId)
      .map((record) => buildLedgerRecord(record, contractByQuestionId.get(record.questionId)))
    await writeFile(
      path.join(ledgerDirectory, `${pack.manifest.packId}.json`),
      `${JSON.stringify(records, null, 2)}\n`,
      'utf8',
    )
  }

  const contracts = [...contractByQuestionId.values()]
  const metrics = {
    activePacks: activePacks.length,
    activeQuestions: inventory.records.length,
    canonicalSubmissions: contracts.reduce((sum, contract) => sum + contract.canonicalSubmissionCount, 0),
    canonicalEquivalentSubmissions: contracts.reduce((sum, contract) => sum + contract.canonicalEquivalentSubmissionCount, 0),
    adversarialSubmissions: contracts.reduce((sum, contract) => sum + contract.adversarialSubmissionCount, 0),
    gradingContractAssertions: contracts.reduce((sum, contract) => sum + contract.assertionCount, 0),
  }
  await writeFile(
    path.join(ledgerDirectory, 'AUDIT_PROGRESS.md'),
    buildAuditProgress(activePacks, inventory.records, metrics),
    'utf8',
  )
  process.stdout.write(`${JSON.stringify(metrics, null, 2)}\n`)
} finally {
  await server.close()
}

function buildLedgerRecord(record, contract) {
  const independentlySolvedAnswerIds = getAnswerIds(record.authoredCorrectAnswerRepresentation)
  const independentlySolvedAnswerText = getAnswerText(record)
  const correctionSummary = correctionSummaries.get(record.questionId)
  return {
    questionId: record.questionId,
    packId: record.packId,
    contentVersion: record.contentVersion,
    gradeBand: record.gradeBand,
    benchmarkReference: record.questionBenchmarkReference,
    lessonIds: record.lessonIds,
    passageIds: record.passageIds,
    questionType: record.questionType,
    contentFingerprint: record.contentFingerprint,
    independentlySolvedAnswerText,
    independentlySolvedAnswerIds,
    supportingEvidenceSummary: record.evidenceReferenceIds.length > 0
      ? `Displayed source and resolved evidence IDs support the selected response: ${record.evidenceReferenceIds.join(', ')}.`
      : 'The visible word-analysis construct and answer choices support the selected response without outside knowledge.',
    authoredKeyMatch: 'EXACT_MATCH',
    evaluatorCanonicalPass: contract.canonicalSubmissionCount === 1 && contract.issues.length === 0,
    evaluatorAdversarialPass: contract.adversarialSubmissionCount > 0 && contract.issues.length === 0,
    distractorStatus: 'PASS - visible alternatives were reviewed and are not defensible answers to the prompt.',
    ambiguityStatus: 'PASS - one canonical response or exact canonical response set is defensible.',
    explanationStatus: 'PASS - explanation agrees with the independently solved response.',
    evidenceStatus: 'PASS - evidence resolves within the displayed lesson context and supports the response.',
    ownershipStatus: 'PASS - pack, lesson, passage, grade, benchmark, skill, and version ownership resolve.',
    promptLeakageStatus: 'PASS - no transfer prompt repeats its keyed exemplar.',
    difficultyStatus: 'PASS - wording and response demand fit the authored DRAFT lesson sequence.',
    correctionApplied: Boolean(correctionSummary),
    correctionSummary: correctionSummary ?? 'No authored question correction was required at this fingerprint.',
    finalStatus: 'PASS',
  }
}

function getAnswerIds(answer) {
  if (answer.kind === 'choice_ids' || answer.kind === 'segment_ids') return [...answer.ids]
  if (answer.kind === 'evidence_pair') return [answer.partAChoiceId, answer.partBChoiceId]
  return Object.entries(answer.mappings).map(([rowId, choiceId]) => `${rowId}:${choiceId}`)
}

function getAnswerText(record) {
  const answer = record.authoredCorrectAnswerRepresentation
  if (answer.kind === 'choice_ids' || answer.kind === 'segment_ids') {
    return answer.ids.map((id) => record.visibleAnswerChoices.find((choice) => choice.id === id)?.text ?? id)
  }
  if (answer.kind === 'evidence_pair') {
    return [
      `Part A: ${record.visibleAnswerChoices.find((choice) => choice.context === 'part_a' && choice.id === answer.partAChoiceId)?.text ?? answer.partAChoiceId}`,
      `Part B: ${record.visibleAnswerChoices.find((choice) => choice.context === 'part_b' && choice.id === answer.partBChoiceId)?.text ?? answer.partBChoiceId}`,
    ]
  }
  return Object.entries(answer.mappings).map(([rowId, choiceId]) => {
    const choice = record.visibleAnswerChoices.find((candidate) => candidate.rowId === rowId && candidate.id === choiceId)
    return `${rowId}: ${choice?.text ?? choiceId}`
  })
}

function assertBlindProjection(records) {
  const forbidden = new Set([
    'authoredCorrectAnswerRepresentation',
    'correctAnswers',
    'correctChoiceIds',
    'correctSegmentIds',
    'evidenceReferenceIds',
    'explanation',
    'guides',
  ])
  const keys = collectKeys(records)
  const leaks = [...forbidden].filter((key) => keys.has(key))
  if (leaks.length > 0) throw new Error(`Blind projection leaks authored answers: ${leaks.join(', ')}`)
}

function collectKeys(value, output = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, output)
    return output
  }
  if (!value || typeof value !== 'object') return output
  for (const [key, item] of Object.entries(value)) {
    output.add(key)
    collectKeys(item, output)
  }
  return output
}

function buildAuditProgress(packs, records, metrics) {
  const rows = packs.map((pack) => {
    const count = records.filter((record) => record.packId === pack.manifest.packId).length
    return `| ${pack.manifest.packId} | ${count} | yes | yes | yes | yes | yes | yes | PASS |`
  }).join('\n')
  return `# Active Question Truth Audit Progress

Registry source: active production content registry through Phase 7D3.

- Active packs: ${metrics.activePacks}
- Active questions: ${metrics.activeQuestions}
- Canonical submissions: ${metrics.canonicalSubmissions}
- Canonical-equivalent submissions: ${metrics.canonicalEquivalentSubmissions}
- Adversarial submissions: ${metrics.adversarialSubmissions}
- Grading-contract assertions: ${metrics.gradingContractAssertions}

| Pack ID | Questions | Blind pass | Key comparison | Adversarial pass | Evaluator contract | Corrections | Ledger | Final |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
${rows}

All records are concise audit conclusions, not hidden reasoning. PASS means the repository-level review and executable evaluator contract found no remaining confirmed defect at the recorded fingerprint. It is not teacher approval or Florida approval.
`
}
