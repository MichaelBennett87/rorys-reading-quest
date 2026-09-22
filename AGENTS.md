# AGENTS.md - Rory's Reading Quest

## Working Contract

- Use the current user-selected model and reasoning settings. Unless the user changes them, the standing default is Ultra reasoning with Fast mode off.
- Perform all Rory's Reading Quest work in the current user-selected conversation. Additional subagents, conversation forks, and side model sessions are prohibited.
- The primary agent owns integration decisions, production edits, Git operations, verification, pushes, and deployments.
- Do not delegate review, implementation, verification, continuation, or side tasks through another agent, fork, SDK, plugin, shell command, cloud task, browser-based model, or Codex instance.
- Do not start unsupervised background work.
- Run shell commands sequentially and prefer deterministic, non-interactive operations.
- Do not use destructive Git operations or rewrite history.
- Do not change global Git, Node, npm, Codex, IDE, or operating-system configuration.
- Keep dependencies intentionally small and add one only when the current phase requires it.
- Respect the current phase boundary and do not begin later-phase work automatically.
- Read `README.md`, `TASKS.md`, and relevant `docs/*` contracts before future phase work.
- Keep `TASKS.md` and `docs/DECISIONS.md` current when scope or assumptions change.

## Child Safety, Privacy, and Content

- Ordinary reading must remain local, telemetry-free, advertising-free, and independent of runtime cloud services. The only current exception is the parent-enabled Read & Write pilot: bounded handwriting recognition and advisory writing evaluation may use the reviewed protected service described in `docs/READ_WRITE_PILOT.md`, but only with server-enforced installation authorization, current parent notice/consent, approved retention controls, and a finite server-side budget. The pilot stays off by default and must fail safely back to local parent review.
- Never place provider credentials, rubrics, model selection, arbitrary URLs, or remote authorization authority in browser code. A local PIN or local checkbox is not internet-facing authorization. The protected installation bearer belongs only in the dedicated IndexedDB credential store; it must not enter localStorage, writing records, logs, screenshots, or reports.
- Browser speech, when introduced, must remain optional, local to the browser, and free of microphone or external speech-provider requirements.
- Do not store private assessment records, child-sensitive identifiers, credentials, school data, or personal records.
- Use only original content with an explicit `DRAFT`, `REVIEWED`, `APPROVED`, or `RETIRED` review state.
- Do not treat unreviewed DRAFT content as production-ready.
- Do not add external FAST report images, proprietary passages, or official score claims.
- Keep parent-access records and official assessment records in separate versioned stores; never persist a plaintext PIN.
- Keep child-facing feedback supportive and free of punitive or diagnostic labels.

## Git and Remote Operations

- The repository has a private GitHub `origin`; local commits are permitted.
- Do not fetch, pull, push, publish, deploy, or otherwise contact a remote unless the current user command explicitly authorizes it.
- Never force-push, amend without authorization, squash, rebase, reset, or rewrite history.
- Phase 3 permits local commits but does not authorize any remote operation.

## Verification

- For focused development, run the smallest relevant tests before the full gate.
- Before any release or phase completion, run `npm run verify:release`. It must complete lint, typecheck, unit/integration tests, the semantic answer gate, one production build, and the repository-owned Microsoft Edge plus Playwright WebKit suites against that exact build.
- Native browser availability is mandatory. A missing Edge or pinned WebKit binary, zero scenarios, a skipped required scenario, a browser assertion failure, or an artifact mismatch blocks that engine's certification.
- A page reload is not a browser-process restart. Each continuous-learning scenario must reuse one isolated persistent profile across actual browser shutdowns and relaunches.
- Pages publication requires both the native Edge job and the macOS Playwright WebKit job. Playwright WebKit with iPad touch emulation is Safari-relevant automated coverage, not physical-iPad, shipping-Safari, or VoiceOver certification.
- After GitHub Pages publishes, run `npm run verify:deployed -- --engine <edge|webkit> --commit <full-sha> --manifest <manifest-path> --dist <tested-dist-path> --url <deployment-url>` in both required engines. A post-deployment failure means the already-published release is unaccepted.
- Never attach browser acceptance to a personal profile or commit generated profiles, fixtures, screenshots, or reports.
- Both Edge and WebKit release suites must execute the required `read-write-pilot` scenario. CI uses mocked protected-service responses and synthetic ink only; live inference is never a release-test dependency.
- Do not call a phase or release complete while a required local or deployed gate is failing.
