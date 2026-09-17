import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { chromium, webkit } from 'playwright-core'

import { findEdgeExecutable, findWebKitExecutable } from './release-contract.mjs'

if (process.argv[2] !== '--child') throw new Error('This helper is only run by the release-gate contract test.')

const engine = process.argv[3]
if (!['edge', 'webkit'].includes(engine)) throw new Error('The deliberate browser failure requires edge or webkit.')
const executablePath = process.argv[4] || (engine === 'edge' ? findEdgeExecutable() : findWebKitExecutable())
const profilePath = join(tmpdir(), `rrq-deliberate-browser-failure-${process.pid}`)
let context
try {
  context = await (engine === 'edge' ? chromium : webkit).launchPersistentContext(profilePath, {
    executablePath,
    headless: true,
    ...(engine === 'edge' ? { args: ['--no-first-run', '--no-default-browser-check'] } : {}),
  })
  const page = context.pages()[0] ?? await context.newPage()
  await page.setContent('<main><p id="actual-marker">Intentional gate self-test</p></main>')
  const count = await page.locator('#required-release-marker').count()
  if (count !== 1) throw new Error('INTENTIONAL_BROWSER_ASSERTION_FAILURE: required marker was absent.')
  process.exitCode = 0
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 23
} finally {
  await context?.close()
  rmSync(profilePath, { recursive: true, force: true })
}
