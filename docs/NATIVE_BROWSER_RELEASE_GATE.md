# Native Microsoft Edge release gate

## Status and boundary

Native browser acceptance is a required release gate for Rory's Reading Quest. It is infrastructure-only: it changes no learner curriculum, planner rule, progression threshold, reward formula, persistence schema, Parent PIN, or assessment record. Phase 8, Grade 4, FAST timed practice, and broader Phase 10 work remain unstarted.

The repository harness promotes the proven external acceptance approach from `C:\Users\Micha\RRQ_Acceptance\053c953\native-acceptance.mjs`. The original retained evidence remains external and unchanged. The maintained implementation is now `scripts/browser/native-acceptance.mjs` with release orchestration and fail-closed contracts beside it.

## Supported tooling

- `playwright-core` is pinned as a development-only dependency and launches an installed Microsoft Edge executable through the Chromium protocol.
- Local certification supports installed native Edge and never attaches to a personal profile. Every scenario owns a temporary `rrq-native-acceptance-*` profile.
- GitHub Actions uses `windows-2025`, whose maintained runner image includes Microsoft Edge. The harness still detects Edge explicitly and blocks if it is absent.
- Microsoft documents Edge automation with Playwright and the `msedge` channel at <https://learn.microsoft.com/en-us/microsoft-edge/playwright/>.
- GitHub documents the software on `windows-2025`, including Edge, at <https://github.com/actions/runner-images/blob/main/images/windows/Windows2025-Readme.md>.

No Playwright browser download, WebDriver service, cloud browser, self-hosted runner, global browser change, or production dependency is required.

## Command contracts

### Existing production build

```powershell
npm run build
npm run test:browser
```

`test:browser` does not run Vite's development server and does not rebuild. It creates a SHA-256 manifest for the existing `dist`, starts a loopback static server at the real `/rorys-reading-quest/` base, runs gate-contract checks, generates temporary answer-driving fixtures from the checked-out source, and exercises native Edge sequentially.

### Complete local release

```powershell
npm run verify:release
```

This command runs lint, typecheck, Vitest, the semantic answer-uniqueness gate, one production build, gate self-tests, and the complete native Edge suite. There is no browser-bypass certification flag.

### Exact deployed release

```powershell
npm run verify:deployed -- `
  --commit <full-40-character-sha> `
  --manifest <tested-build-manifest.json> `
  --dist <tested-dist-directory> `
  --url https://michaelbennett87.github.io/rorys-reading-quest/
```

All identity inputs are explicit. The command verifies the local tested artifact, polls the deployment only for a bounded propagation window, compares published `index.html`, JavaScript, and CSS hashes and MIME types with the manifest, then runs the complete native suite. It cannot silently certify whichever release happens to be live.

## Required scenarios

The browser report cannot pass with zero results or a skipped required scenario. It requires:

1. An initially empty profile earns seven real completions through Story Map, Theme Trail, Perspective Portal, and the first Information Detectives activity using audited answer controls.
2. The same profile survives actual Edge process shutdown and relaunch during submitted feedback, after a first qualifying success, after unit advancement, and at the Story Scouts to Information Detectives handoff.
3. A low Story Map result opens difficulty-1 guided C or D remediation with matching manifest, question, and runtime difficulty, survives restart, and returns to appropriate comprehension work.
4. A stale content-needed save preserves attempts, evidence, XP, stars, and unrelated reviews while initializing the eligible topic once.
5. A historical unit-affine review preserves purpose and identity across restart, changes no track difficulty, and reschedules only the exact review.
6. A deliberately dropped completion write produces truthful retry behavior, preserves recoverable work, and awards no fake attempt or reward.
7. A stale tab cannot overwrite a newer question checkpoint.
8. An invalid completion preserves recovery authority and cannot become reassuring Reading Rest.
9. Genuine completion initializes no Grade 4 work, while a due review can safely reactivate through supported lifecycle and same-origin storage events.
10. All five question types, prose, poetry, informational features, paired texts, local reference cards, guided instruction, fluency practice, and on-demand Word Help render and interact correctly.
11. Parent PIN setup, lock/unlock, reporting, privacy-safe print, child-session preservation, and phone, iPad-sized, and desktop overflow checks pass.
12. Page errors, failed requests, external application traffic, and unexpected HTTP or console errors are absent. The known root `/favicon.ico` 404 is the only narrow nonblocking exception.

The process-restart evidence differs from a page reload. The central journey earns progression from one empty profile; seeded recovery fixtures are separately labeled synthetic and never substitute for earned advancement.

## Build and evidence binding

`scripts/browser/create-build-manifest.mjs` records:

- full source commit;
- Pages base;
- every production build file, byte count, and SHA-256 hash;
- JavaScript and CSS entrypoints;
- manifest digest;
- browser-test run identity.

Temporary answer-driving fixtures are generated outside `dist`. Browser profiles live under the operating-system temporary directory and are removed by ownership-aware cleanup. Sanitized JSON reports and screenshots live under ignored `.artifacts/browser/run-*` directories and are uploaded by CI for seven days. Profiles, fixture keys, reports, and test tooling never enter the Pages artifact.

## Pages enforcement

The workflow is a strict chain:

```text
quality and semantic checks plus one production build
-> native Edge acceptance of the downloaded hashed build
-> Pages upload and deployment of that same build
-> native Edge verification of the exact published hashes and interactions
```

Only the deploy job receives Pages and identity-token write permissions. A pre-deployment browser failure blocks publication. A post-deployment failure cannot undo publication automatically, so it marks that published release unaccepted and preserves evidence for investigation.

The gate self-tests prove that a deliberate native Edge assertion returns nonzero, browser absence blocks, zero or skipped scenarios cannot pass, artifact mutation is rejected, and deployment depends on the required successful browser stage.
