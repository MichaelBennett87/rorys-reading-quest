import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'

import {
  assertRequiredScenarioResults,
  createBuildManifest,
  findEdgeExecutable,
  findWebKitExecutable,
  validatePagesWorkflowContract,
  verifyBuildManifest,
} from '../scripts/browser/release-contract.mjs'

test('missing Edge is a blocked release rather than a pass', () => {
  assert.throws(
    () => findEdgeExecutable({ platform: 'win32', env: {}, exists: () => false }),
    /BROWSER_BLOCKED/,
  )
})

test('missing pinned WebKit is a blocked release rather than a pass', () => {
  assert.throws(
    () => findWebKitExecutable({ executablePath: '/missing/playwright-webkit', exists: () => false }),
    /BROWSER_BLOCKED/,
  )
})

test('zero or skipped required browser scenarios cannot pass', () => {
  assert.throws(() => assertRequiredScenarioResults({ requiredScenarios: {} }), /Zero browser scenarios/)
  assert.throws(
    () => assertRequiredScenarioResults({ requiredScenarios: { 'continuous-journey': 'SKIP' } }),
    /did not pass/,
  )
})

test('an artifact changed after manifest creation is rejected', () => {
  const root = mkdtempSync(join(tmpdir(), 'rrq-manifest-contract-'))
  try {
    const dist = join(root, 'dist')
    mkdirSync(join(dist, 'assets'), { recursive: true })
    writeFileSync(join(dist, 'index.html'), '<script type="module" src="/rorys-reading-quest/assets/app.js"></script><link rel="stylesheet" href="/rorys-reading-quest/assets/app.css">')
    writeFileSync(join(dist, 'assets', 'app.js'), 'console.log("tested")')
    writeFileSync(join(dist, 'assets', 'app.css'), 'body { color: green; }')
    const manifest = createBuildManifest({
      distDir: dist,
      sourceCommit: 'a'.repeat(40),
      browserTestRunIdentity: 'contract-test',
      generatedAt: '2026-09-17T00:00:00.000Z',
    })
    verifyBuildManifest({ manifest, distDir: dist, expectedCommit: 'a'.repeat(40) })
    writeFileSync(join(dist, 'assets', 'app.js'), 'console.log("changed")')
    assert.throws(() => verifyBuildManifest({ manifest, distDir: dist, expectedCommit: 'a'.repeat(40) }), /Artifact mismatch/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('the Pages workflow enforces build then browser then deploy then deployed-browser verification', () => {
  const workflow = readFileSync(resolve('.github/workflows/deploy-pages.yml'), 'utf8')
  const result = validatePagesWorkflowContract(workflow)
  assert.deepEqual(result.chain, [
    'quality_build',
    ['native_browser', 'webkit_browser'],
    'deploy',
    ['deployed_browser', 'deployed_webkit'],
  ])
  assert.equal(result.buildCount, 1)
})

test('a real required-engine assertion failure propagates as nonzero', () => {
  const engine = process.env.RRQ_BROWSER_SELF_TEST_ENGINE === 'webkit' ? 'webkit' : 'edge'
  const executablePath = engine === 'edge' ? findEdgeExecutable() : findWebKitExecutable()
  const result = spawnSync(
    process.execPath,
    [resolve('scripts/browser/deliberate-browser-failure.mjs'), '--child', engine, executablePath],
    { cwd: resolve('.'), encoding: 'utf8', timeout: 60_000 },
  )
  assert.equal(result.status, 23, `Expected deliberate failure exit 23, received ${result.status}. ${result.stderr}`)
  assert.match(result.stderr, /INTENTIONAL_BROWSER_ASSERTION_FAILURE/)
})
