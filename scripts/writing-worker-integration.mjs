import { createHash } from 'node:crypto'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import process from 'node:process'

const ROOT = resolve(import.meta.dirname, '..')
const WRANGLER = join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const CONFIG = join(ROOT, 'service', 'read-write-cloudflare', 'wrangler.test.jsonc')
const ARTIFACT_ROOT = join(ROOT, '.artifacts', 'worker')
const ORIGIN = 'http://127.0.0.1:8798'
const ACTIVATION_CODE = 'synthetic-free-worker-activation'
const CONSENT_VERSION = 'rrq-read-write-pilot-notice-v2-cloudflare-free'
const report = {
  schemaVersion: 1,
  mode: 'local-worker-controlled-provider',
  liveInferenceCalls: 0,
  actualPaidSpendingMicros: 0,
  scenarios: {},
  generatedAt: new Date().toISOString(),
}

mkdirSync(ARTIFACT_ROOT, { recursive: true })

try {
  await happyPath()
  await providerQuotaPath()
  writeFileSync(join(ARTIFACT_ROOT, 'latest-integration.json'), `${JSON.stringify(report, null, 2)}\n`)
  process.stdout.write(`Cloudflare Worker integration PASS (${Object.keys(report.scenarios).length} scenarios, live calls 0, paid spending $0).\n`)
} catch (error) {
  report.failure = error instanceof Error ? error.message : String(error)
  writeFileSync(join(ARTIFACT_ROOT, 'latest-integration.json'), `${JSON.stringify(report, null, 2)}\n`)
  throw error
}

async function happyPath() {
  const profile = join(ARTIFACT_ROOT, 'happy-profile')
  rmOwned(profile)
  let worker = await launchWorker(profile)
  try {
    const activation = await activate()
    const token = activation.installationToken
    assert(activation.actualPaidSpendingMicros === 0, 'activation did not enforce zero paid spending')
    const transcription = transcriptionBody('recognition-happy-1')
    const first = await serviceRequest('transcribe', transcription, token)
    assert(first.status === 200 && first.body.provider === 'cloudflare_workers_ai', `controlled recognition did not complete: ${JSON.stringify(first)}`)
    const duplicate = await serviceRequest('transcribe', transcription, token)
    assert(duplicate.status === 200 && JSON.stringify(duplicate.body) === JSON.stringify(first.body), 'same-payload deduplication did not replay the stored result')
    const changed = await serviceRequest('transcribe', { ...transcription, inkRevision: 2 }, token)
    assert(changed.status === 409 && changed.body.error === 'request_identity_conflict', 'request ID reuse with changed content was not rejected')
    const evaluation = await serviceRequest('evaluate', evaluationBody('evaluation-happy-1', transcription.requestId), token)
    assert(evaluation.status === 200 && evaluation.body.provider === 'cloudflare_workers_ai', 'controlled evaluation did not complete')
    const applicationQuota = await serviceRequest('transcribe', transcriptionBody('recognition-application-quota'), token)
    assert(applicationQuota.status === 429 && applicationQuota.body.error === 'application_quota_exhausted', 'application quota did not stop inference before another recognition')
    await stopWorker(worker)
    worker = await launchWorker(profile)
    const afterRestart = await serviceRequest('transcribe', transcription, token)
    assert(afterRestart.status === 200 && JSON.stringify(afterRestart.body) === JSON.stringify(first.body), 'Durable Object request state did not survive Worker restart')
    const revoked = await serviceRequest('revoke', {}, token)
    assert(revoked.status === 200 && revoked.body.revoked === true, 'installation revocation failed')
    const afterRevoke = await serviceRequest('transcribe', transcriptionBody('recognition-after-revoke'), token)
    assert(afterRevoke.status === 401, 'revoked installation remained authorized')
    report.scenarios.authorizationDeduplicationRestart = 'PASS'
  } finally {
    await stopWorker(worker)
    rmOwned(profile)
  }
}

async function providerQuotaPath() {
  const profile = join(ARTIFACT_ROOT, 'quota-profile')
  rmOwned(profile)
  const worker = await launchWorker(profile)
  try {
    const activation = await activate()
    const response = await serviceRequest('transcribe', transcriptionBody('recognition-quota-1'), activation.installationToken, {
      'x-rrq-test-outcome': 'quota_exhausted',
    })
    assert(response.status === 429 && response.body.error === 'free_quota_exhausted', 'provider daily quota was not classified distinctly')
    const duplicate = await serviceRequest('transcribe', transcriptionBody('recognition-quota-1'), activation.installationToken)
    assert(duplicate.status === 429 && duplicate.body.error === 'free_quota_exhausted', 'quota result was not payload-bound and deduplicated')
    report.scenarios.providerQuotaClassification = 'PASS'
  } finally {
    await stopWorker(worker)
    rmOwned(profile)
  }
}

async function launchWorker(profile) {
  mkdirSync(profile, { recursive: true })
  const args = [
    WRANGLER,
    'dev',
    '--config', CONFIG,
    '--local',
    '--ip', '127.0.0.1',
    '--port', '8798',
    '--persist-to', profile,
    '--var', `RRQ_ACTIVATION_CODE_SHA256:${sha256(ACTIVATION_CODE)}`,
    '--var', `RRQ_FREE_PLAN_VERIFIED_AT:${new Date().toISOString()}`,
    '--log-level', 'error',
  ]
  const child = spawn(process.execPath, args, {
    cwd: ROOT,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stdout.on('data', (chunk) => { output += chunk.toString() })
  child.stderr.on('data', (chunk) => { output += chunk.toString() })
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Wrangler stopped before readiness: ${sanitize(output)}`)
    try {
      const response = await fetch(`${ORIGIN}/api/read-write/v1/health`, { headers: { origin: ORIGIN } })
      if (response.ok) return { child, output: () => output }
    } catch {
      // The owned local Worker has not bound its port yet.
    }
    await delay(150)
  }
  await stopWorker({ child, output: () => output })
  throw new Error(`Wrangler readiness timed out: ${sanitize(output)}`)
}

async function stopWorker(handle) {
  if (!handle?.child || handle.child.exitCode !== null) return
  handle.child.kill('SIGTERM')
  await Promise.race([
    new Promise((resolveExit) => handle.child.once('exit', resolveExit)),
    delay(5_000),
  ])
  if (handle.child.exitCode === null) handle.child.kill('SIGKILL')
  if (handle.child.exitCode === null) {
    await Promise.race([
      new Promise((resolveExit) => handle.child.once('exit', resolveExit)),
      delay(5_000),
    ])
  }
}

async function activate() {
  const response = await serviceRequest('activate', { activationCode: ACTIVATION_CODE, consentVersion: CONSENT_VERSION })
  assert(response.status === 200 && typeof response.body.installationToken === 'string', 'one-time installation activation failed')
  return response.body
}

async function serviceRequest(path, body, token = null, extraHeaders = {}) {
  const response = await fetch(`${ORIGIN}/api/read-write/v1/${path}`, {
    method: 'POST',
    headers: {
      origin: ORIGIN,
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  })
  return { status: response.status, body: await response.json() }
}

function transcriptionBody(requestId) {
  return {
    requestId,
    submissionId: 'submission-worker-1',
    activityId: 'rw-g2-tia-wrappers-reason',
    sourceContentVersion: 'g2-ss-plot-elements-r0.2.0',
    inkRevision: 1,
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
    layout: { width: 1, height: 1 },
  }
}

function evaluationBody(requestId, recognitionRequestId) {
  return {
    requestId,
    recognitionRequestId,
    activityId: 'rw-g2-tia-wrappers-reason',
    sourceContentVersion: 'g2-ss-plot-elements-r0.2.0',
    rubricVersion: 'rw-rubric-tia-r1',
    submissionId: 'submission-worker-1',
    inkRevision: 1,
    inputMode: 'handwriting',
    transcriptionConfirmedBy: 'learner',
    confirmedText: 'Tia got the wrappers before the wind blew them away.',
  }
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function rmOwned(path) {
  const resolved = resolve(path)
  if (!resolved.startsWith(`${resolve(ARTIFACT_ROOT)}\\`) && !resolved.startsWith(`${resolve(ARTIFACT_ROOT)}/`)) {
    throw new Error(`Refusing to remove non-owned path: ${resolved}`)
  }
  rmSync(resolved, { recursive: true, force: true })
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))
}

function sanitize(value) {
  return value.replaceAll(ACTIVATION_CODE, '[redacted]').slice(-2_000)
}
