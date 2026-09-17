import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

export const PAGES_BASE = '/rorys-reading-quest/'

export const REQUIRED_BROWSER_SCENARIOS = Object.freeze([
  'continuous-journey',
  'browser-process-restarts',
  'stranded-save',
  'unsuccessful-remediation',
  'historical-review',
  'persistence-failure',
  'stale-state',
  'rejected-completion',
  'genuine-completion-reactivation',
  'question-types-and-content',
  'parent-print-responsive',
  'runtime-health',
])

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

export function parseArguments(argv) {
  const parsed = {}
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (!value.startsWith('--')) throw new Error(`Unexpected argument: ${value}`)
    const key = value.slice(2)
    if (key === 'require-existing-manifest') {
      parsed.requireExistingManifest = true
      continue
    }
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) throw new Error(`Missing value for --${key}`)
    parsed[toCamelCase(key)] = next
    index += 1
  }
  return parsed
}

export function createBuildManifest({
  distDir,
  sourceCommit,
  browserTestRunIdentity,
  generatedAt = new Date().toISOString(),
}) {
  const resolvedDist = resolve(distDir)
  if (!existsSync(join(resolvedDist, 'index.html'))) {
    throw new Error(`Production build is unavailable at ${resolvedDist}. Run npm run build first.`)
  }
  if (!/^[0-9a-f]{40}$/i.test(sourceCommit)) {
    throw new Error(`A full 40-character source commit is required, received: ${sourceCommit}`)
  }
  if (!browserTestRunIdentity?.trim()) throw new Error('A browser-test run identity is required.')

  const files = collectFiles(resolvedDist).map((absolutePath) => {
    const content = readFileSync(absolutePath)
    return {
      path: relative(resolvedDist, absolutePath).split(sep).join('/'),
      bytes: content.byteLength,
      sha256: sha256(content),
    }
  })
  const index = readFileSync(join(resolvedDist, 'index.html'), 'utf8')
  const entrypoints = extractEntrypoints(index)
  if (entrypoints.javascript.length === 0 || entrypoints.css.length === 0) {
    throw new Error('The production HTML must reference at least one JavaScript and one CSS asset.')
  }

  const unsigned = {
    schemaVersion: 1,
    sourceCommit: sourceCommit.toLowerCase(),
    pagesBase: PAGES_BASE,
    generatedAt,
    browserTestRunIdentity: browserTestRunIdentity.trim(),
    entrypoints,
    files,
  }
  return { ...unsigned, manifestDigest: digestManifest(unsigned) }
}

export function writeBuildManifest(path, manifest) {
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`)
}

export function readBuildManifest(path) {
  const parsed = JSON.parse(readFileSync(path, 'utf8'))
  if (!parsed || typeof parsed !== 'object') throw new Error('Build manifest is not an object.')
  return parsed
}

export function verifyBuildManifest({ manifest, distDir, expectedCommit }) {
  if (manifest.schemaVersion !== 1) throw new Error(`Unsupported build manifest schema: ${manifest.schemaVersion}`)
  if (manifest.pagesBase !== PAGES_BASE) throw new Error(`Unexpected Pages base: ${manifest.pagesBase}`)
  if (expectedCommit && manifest.sourceCommit !== expectedCommit.toLowerCase()) {
    throw new Error(`Artifact source commit ${manifest.sourceCommit} does not match required ${expectedCommit.toLowerCase()}.`)
  }
  const { manifestDigest, ...unsigned } = manifest
  const expectedDigest = digestManifest(unsigned)
  if (manifestDigest !== expectedDigest) {
    throw new Error(`Build manifest digest mismatch: expected ${expectedDigest}, received ${manifestDigest}.`)
  }

  const resolvedDist = resolve(distDir)
  const actualFiles = collectFiles(resolvedDist).map((absolutePath) => relative(resolvedDist, absolutePath).split(sep).join('/'))
  const recordedFiles = manifest.files.map((entry) => entry.path)
  if (JSON.stringify(actualFiles) !== JSON.stringify(recordedFiles)) {
    throw new Error(`Build file inventory mismatch. Expected ${JSON.stringify(recordedFiles)}, received ${JSON.stringify(actualFiles)}.`)
  }
  for (const entry of manifest.files) {
    const absolutePath = resolve(resolvedDist, entry.path)
    if (!isInside(resolvedDist, absolutePath)) throw new Error(`Manifest path escapes the build: ${entry.path}`)
    const content = readFileSync(absolutePath)
    if (content.byteLength !== entry.bytes || sha256(content) !== entry.sha256) {
      throw new Error(`Artifact mismatch for ${entry.path}.`)
    }
  }
  return { manifestDigest, fileCount: manifest.files.length, sourceCommit: manifest.sourceCommit }
}

export function findEdgeExecutable({ platform = process.platform, env = process.env, exists = existsSync } = {}) {
  const explicit = env.RRQ_EDGE_PATH?.trim()
  if (explicit) {
    if (!exists(explicit)) throw blocked(`RRQ_EDGE_PATH does not exist: ${explicit}`)
    return resolve(explicit)
  }
  const candidates = platform === 'win32'
    ? [
        join(env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        join(env.ProgramFiles ?? 'C:\\Program Files', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        env.LOCALAPPDATA ? join(env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : '',
      ]
    : platform === 'darwin'
      ? ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']
      : ['/usr/bin/microsoft-edge-stable', '/usr/bin/microsoft-edge']
  const found = candidates.find((candidate) => candidate && exists(candidate))
  if (!found) throw blocked(`Microsoft Edge is required but unavailable on ${platform}.`)
  return resolve(found)
}

export function assertRequiredScenarioResults(report, required = REQUIRED_BROWSER_SCENARIOS) {
  const results = report?.requiredScenarios
  if (!results || typeof results !== 'object') throw new Error('Browser report contains zero required scenario results.')
  const names = Object.keys(results)
  if (names.length === 0) throw new Error('Zero browser scenarios cannot certify a release.')
  for (const name of required) {
    if (results[name] !== 'PASS') {
      throw new Error(`Required browser scenario ${name} did not pass; result was ${String(results[name] ?? 'MISSING')}.`)
    }
  }
  return { required: required.length, executed: names.length }
}

export function validatePagesWorkflowContract(source) {
  if (/continue-on-error\s*:\s*true/i.test(source)) throw new Error('Required Pages gates may not use continue-on-error.')
  if ((source.match(/npm run build/g) ?? []).length !== 1) throw new Error('The Pages workflow must build exactly once.')
  const quality = jobBlock(source, 'quality_build')
  const browser = jobBlock(source, 'native_browser')
  const deploy = jobBlock(source, 'deploy')
  const deployed = jobBlock(source, 'deployed_browser')
  if (!/^\s{4}needs:\s*quality_build\s*$/m.test(browser)) throw new Error('Native browser acceptance must depend on quality_build.')
  if (!/^\s{4}needs:\s*native_browser\s*$/m.test(deploy)) throw new Error('Deployment must depend on native_browser.')
  if (!/^\s{4}needs:\s*deploy\s*$/m.test(deployed)) throw new Error('Deployed-browser verification must depend on deploy.')
  if (!/npm run test:browser/m.test(browser)) throw new Error('Native browser job does not run the repository browser command.')
  if (!/npm run verify:deployed/m.test(deployed)) throw new Error('Post-deployment job does not run verify:deployed.')
  if (!/actions\/upload-pages-artifact@/m.test(deploy) || !/actions\/deploy-pages@/m.test(deploy)) {
    throw new Error('Deploy job must publish the tested artifact through GitHub Pages actions.')
  }
  if (/actions\/upload-pages-artifact@/m.test(quality) || /actions\/deploy-pages@/m.test(browser)) {
    throw new Error('Quality and browser jobs must not receive deployment operations.')
  }
  return { buildCount: 1, chain: ['quality_build', 'native_browser', 'deploy', 'deployed_browser'] }
}

export function extractEntrypoints(html) {
  const javascript = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/gi)].map((match) => normalizeAssetPath(match[1]))
  const css = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/gi)].map((match) => normalizeAssetPath(match[1]))
  return { javascript: [...new Set(javascript)].sort(), css: [...new Set(css)].sort() }
}

function collectFiles(root) {
  if (!existsSync(root)) throw new Error(`Build directory does not exist: ${root}`)
  return readdirSync(root, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const path = join(root, entry.name)
      return entry.isDirectory() ? collectFiles(path) : statSync(path).isFile() ? [path] : []
    })
}

function digestManifest(unsigned) {
  return sha256(Buffer.from(JSON.stringify(unsigned)))
}

function normalizeAssetPath(value) {
  const path = new URL(value, `https://rrq.invalid${PAGES_BASE}`).pathname
  if (!path.startsWith(PAGES_BASE)) throw new Error(`Entrypoint is outside the Pages base: ${value}`)
  return path.slice(PAGES_BASE.length)
}

function isInside(root, candidate) {
  const rel = relative(root, candidate)
  return rel === '' || (!rel.startsWith('..') && !rel.includes(`..${sep}`))
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

function blocked(message) {
  const error = new Error(`BROWSER_BLOCKED: ${message}`)
  error.code = 'BROWSER_BLOCKED'
  return error
}

function jobBlock(source, name) {
  const heading = new RegExp(`^  ${name}:\\r?$`, 'm').exec(source)
  if (!heading) throw new Error(`Pages workflow is missing required job: ${name}`)
  const tail = source.slice(heading.index + heading[0].length)
  const nextHeading = /^  [a-zA-Z0-9_-]+:\r?$/m.exec(tail)
  return source.slice(heading.index, nextHeading ? heading.index + heading[0].length + nextHeading.index : source.length)
}
