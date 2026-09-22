import { spawn } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateBrowserFixtures } from './generate-browser-fixtures.mjs'
import {
  assertRequiredScenarioResults,
  createBuildManifest,
  extractEntrypoints,
  findEdgeExecutable,
  findWebKitExecutable,
  parseArguments,
  readBuildManifest,
  sha256,
  verifyBuildManifest,
  writeBuildManifest,
} from './release-contract.mjs'
import { startStaticBuildServer } from './static-build-server.mjs'

const REPO_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const args = parseArguments(process.argv.slice(2))
const mode = args.mode ?? 'local'
if (!['local', 'deployed'].includes(mode)) throw new Error(`Unsupported browser acceptance mode: ${mode}`)
const engine = args.engine?.trim()
if (!['edge', 'webkit'].includes(engine)) throw new Error('Browser acceptance requires explicit --engine edge or --engine webkit.')

const distDir = resolve(args.dist ?? 'dist')
const manifestPath = resolve(args.manifest ?? '.artifacts/browser/build-manifest.json')
const explicitCommit = args.commit?.trim()
const sourceCommit = explicitCommit
  ?? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
if (mode === 'deployed' && (!explicitCommit || !args.url)) {
  throw new Error('verify:deployed requires explicit --commit, --manifest, and --url arguments.')
}

if (mode === 'local' && !args.requireExistingManifest) {
  const runIdentity = args.runId
    ?? process.env.RRQ_BROWSER_RUN_ID
    ?? `local-${new Date().toISOString().replace(/[:.]/g, '-')}`
  const manifest = createBuildManifest({ distDir, sourceCommit, browserTestRunIdentity: runIdentity })
  mkdirSync(dirname(manifestPath), { recursive: true })
  writeBuildManifest(manifestPath, manifest)
}

const manifest = readBuildManifest(manifestPath)
const artifactVerification = verifyBuildManifest({ manifest, distDir, expectedCommit: sourceCommit })
const browserPath = engine === 'edge' ? findEdgeExecutable() : findWebKitExecutable()
const artifactRoot = resolve(args.artifacts ?? '.artifacts/browser')
const fixturesPath = join(artifactRoot, 'fixtures', `${manifest.manifestDigest}.json`)
const fixtureSummary = await generateBrowserFixtures(fixturesPath)
let localServer = null
let candidateReadWriteServer = null
let appUrl = args.url

try {
  if (mode === 'local') {
    const previousUrl = args.previousUrl?.trim()
    if (engine === 'webkit' && !previousUrl) {
      throw new Error('Local WebKit acceptance requires an explicit --previous-url for the same-origin release-upgrade scenario.')
    }
    localServer = await startStaticBuildServer(distDir, {
      previousUrl: engine === 'webkit' ? previousUrl : undefined,
      initialSource: engine === 'webkit' ? 'previous' : 'candidate',
    })
    appUrl = localServer.url
  } else {
    await verifyPublishedBuild({ appUrl, manifest, attempts: Number(args.propagationAttempts ?? 12) })
  }
  const acceptanceRunIdentity = sanitize(`${manifest.browserTestRunIdentity}-${mode}-${engine}-${new Date().toISOString()}`)
  const runDirectory = join(artifactRoot, `run-${acceptanceRunIdentity}`)
  const reportPath = join(runDirectory, `${engine}-acceptance.json`)
  const javascript = manifest.entrypoints.javascript[0]
  const css = manifest.entrypoints.css[0]
  if (!javascript || !css) throw new Error('Manifest does not contain the required JavaScript and CSS entrypoints.')
  const sharedEnvironment = {
    RRQ_ACCEPTANCE_ARTIFACTS: artifactRoot,
    RRQ_ACCEPTANCE_BROWSER_PATH: browserPath,
    RRQ_ACCEPTANCE_ENGINE: engine,
    RRQ_ACCEPTANCE_EXPECTED_CSS: css,
    RRQ_ACCEPTANCE_EXPECTED_JS: javascript,
    RRQ_ACCEPTANCE_FIXTURES: fixturesPath,
    RRQ_ACCEPTANCE_MANIFEST_DIGEST: manifest.manifestDigest,
    RRQ_ACCEPTANCE_MODE: mode,
    RRQ_ACCEPTANCE_RELEASE_SHA: manifest.sourceCommit,
    RRQ_ACCEPTANCE_PREVIOUS_COMMIT: args.previousCommit?.trim() ?? '',
    RRQ_ACCEPTANCE_PREVIOUS_URL: args.previousUrl?.trim() ?? '',
  }
  let readWriteReportPath = ''
  if (mode === 'local' && engine === 'webkit') {
    candidateReadWriteServer = await startStaticBuildServer(distDir)
    const readWriteRunIdentity = sanitize(`${acceptanceRunIdentity}-read-write`)
    const readWriteRunDirectory = join(artifactRoot, `run-${readWriteRunIdentity}`)
    readWriteReportPath = join(readWriteRunDirectory, `${engine}-read-write-acceptance.json`)
    const readWriteExitCode = await runNativeAcceptance({
      ...sharedEnvironment,
      RRQ_ACCEPTANCE_APP_URL: ensureTrailingSlash(candidateReadWriteServer.url),
      RRQ_ACCEPTANCE_PHASE: 'read-write-only',
      RRQ_ACCEPTANCE_RUN_ID: readWriteRunIdentity,
    })
    if (readWriteExitCode !== 0) throw new Error(`${engine} candidate-bound Read & Write acceptance failed with exit code ${readWriteExitCode}. Evidence: ${readWriteRunDirectory}`)
    const readWriteReport = JSON.parse(readFileSync(readWriteReportPath, 'utf8'))
    assertReadWriteEvidence(readWriteReport, manifest)
    await candidateReadWriteServer.close()
    candidateReadWriteServer = null
  }
  const exitCode = await runNativeAcceptance({
    ...sharedEnvironment,
    RRQ_ACCEPTANCE_APP_URL: ensureTrailingSlash(appUrl),
    RRQ_ACCEPTANCE_PHASE: 'full',
    RRQ_ACCEPTANCE_READ_WRITE_REPORT: readWriteReportPath,
    RRQ_ACCEPTANCE_RUN_ID: acceptanceRunIdentity,
    RRQ_ACCEPTANCE_SWITCH_TO_CANDIDATE_URL: localServer?.switchToCandidateUrl ?? '',
  })
  if (exitCode !== 0) throw new Error(`${engine} acceptance failed with exit code ${exitCode}. Evidence: ${runDirectory}`)
  const report = JSON.parse(readFileSync(reportPath, 'utf8'))
  if (report.status !== 'PASS') throw new Error(`${engine} browser report status was ${report.status}.`)
  if (report.releaseSha !== manifest.sourceCommit || report.manifestDigest !== manifest.manifestDigest) {
    throw new Error('Browser evidence is not bound to the required source commit and artifact manifest.')
  }
  const scenarioVerification = assertRequiredScenarioResults(report, { engine, mode })
  console.log(JSON.stringify({
    status: 'PASS',
    engine,
    mode,
    appUrl: ensureTrailingSlash(appUrl),
    sourceCommit: manifest.sourceCommit,
    manifestDigest: manifest.manifestDigest,
    artifactVerification,
    fixtureSummary,
    scenarioVerification,
    readWriteReportPath: readWriteReportPath || null,
    reportPath,
  }))
} finally {
  await candidateReadWriteServer?.close()
  await localServer?.close()
}

async function runNativeAcceptance(environment) {
  const child = spawn(process.execPath, [join(REPO_ROOT, 'scripts', 'browser', 'native-acceptance.mjs')], {
    cwd: REPO_ROOT,
    env: { ...process.env, ...environment },
    stdio: 'inherit',
  })
  return new Promise((resolvePromise, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => signal ? reject(new Error(`Native browser process ended with signal ${signal}.`)) : resolvePromise(code ?? 1))
  })
}

function assertReadWriteEvidence(report, expectedManifest) {
  if (report.status !== 'PASS' || report.phase !== 'read-write-only') throw new Error('Candidate-bound Read & Write report did not pass its required phase.')
  if (report.engine !== 'webkit' || report.mode !== 'local') throw new Error('Candidate-bound Read & Write report used the wrong engine or mode.')
  if (report.releaseSha !== expectedManifest.sourceCommit || report.manifestDigest !== expectedManifest.manifestDigest) {
    throw new Error('Candidate-bound Read & Write evidence is not bound to the required source commit and artifact manifest.')
  }
  if (report.scenarios?.readWritePilot?.status !== 'PASS' || report.requiredScenarios?.['read-write-pilot'] !== 'PASS') {
    throw new Error('Candidate-bound Read & Write scenario did not pass.')
  }
  if (report.requiredScenarios?.['runtime-health'] !== 'PASS' || report.cleanup?.removed !== true || report.cleanup?.remainingTaskOwnedProcesses !== 0) {
    throw new Error('Candidate-bound Read & Write runtime health or cleanup did not pass.')
  }
}

async function verifyPublishedBuild({ appUrl, manifest: expected, attempts }) {
  const url = ensureTrailingSlash(appUrl)
  let lastError = null
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const htmlResponse = await fetch(url, { cache: 'no-store', redirect: 'follow' })
      if (!htmlResponse.ok) throw new Error(`Published root returned HTTP ${htmlResponse.status}.`)
      const contentType = htmlResponse.headers.get('content-type') ?? ''
      if (!contentType.includes('text/html')) throw new Error(`Published root MIME type was ${contentType || 'missing'}.`)
      const htmlBuffer = Buffer.from(await htmlResponse.arrayBuffer())
      const indexEntry = expected.files.find((entry) => entry.path === 'index.html')
      if (!indexEntry || sha256(htmlBuffer) !== indexEntry.sha256) throw new Error('Published index.html does not match the tested artifact.')
      const entrypoints = extractEntrypoints(htmlBuffer.toString('utf8'))
      if (JSON.stringify(entrypoints) !== JSON.stringify(expected.entrypoints)) throw new Error('Published HTML entrypoints do not match the tested manifest.')
      for (const path of [...entrypoints.javascript, ...entrypoints.css]) {
        const response = await fetch(new URL(path, url), { cache: 'no-store' })
        if (!response.ok) throw new Error(`Published asset ${path} returned HTTP ${response.status}.`)
        const type = response.headers.get('content-type') ?? ''
        if (path.endsWith('.js') && !/(javascript|ecmascript)/i.test(type)) throw new Error(`Published JavaScript MIME type was ${type || 'missing'}.`)
        if (path.endsWith('.css') && !/text\/css/i.test(type)) throw new Error(`Published CSS MIME type was ${type || 'missing'}.`)
        const expectedFile = expected.files.find((entry) => entry.path === path)
        const body = Buffer.from(await response.arrayBuffer())
        if (!expectedFile || sha256(body) !== expectedFile.sha256) throw new Error(`Published asset ${path} does not match the tested artifact.`)
      }
      return
    } catch (error) {
      lastError = error
      if (attempt < attempts) await wait(10_000)
    }
  }
  throw new Error(`The explicit deployed artifact was not observable after ${attempts} bounded checks. It may be unpropagated or superseded. ${lastError instanceof Error ? lastError.message : String(lastError)}`)
}

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`
}

function sanitize(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 120)
}

function wait(milliseconds) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds))
}
