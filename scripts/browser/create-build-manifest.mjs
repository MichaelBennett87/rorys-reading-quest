import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import {
  createBuildManifest,
  parseArguments,
  verifyBuildManifest,
  writeBuildManifest,
} from './release-contract.mjs'

const args = parseArguments(process.argv.slice(2))
const distDir = resolve(args.dist ?? 'dist')
const output = resolve(args.output ?? '.artifacts/browser/build-manifest.json')
const sourceCommit = (args.commit ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' })).trim()
const runIdentity = args.runId
  ?? process.env.RRQ_BROWSER_RUN_ID
  ?? `local-${new Date().toISOString().replace(/[:.]/g, '-')}`

const manifest = createBuildManifest({ distDir, sourceCommit, browserTestRunIdentity: runIdentity })
mkdirSync(dirname(output), { recursive: true })
writeBuildManifest(output, manifest)
const verification = verifyBuildManifest({ manifest, distDir, expectedCommit: sourceCommit })
console.log(JSON.stringify({ output, ...verification, browserTestRunIdentity: runIdentity }))
