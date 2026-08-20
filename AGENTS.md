# AGENTS.md - Rory's Reading Quest

## Working Contract

- Use the currently selected base model and model settings only.
- Do not use subagents, delegated workers, parallel model tasks, or background tasks.
- Run shell commands sequentially and prefer deterministic, non-interactive operations.
- Do not use destructive Git operations or rewrite history.
- Do not change global Git, Node, npm, Codex, IDE, or operating-system configuration.
- Keep dependencies intentionally small and add one only when the current phase requires it.
- Respect the current phase boundary and do not begin later-phase work automatically.
- Read `README.md`, `TASKS.md`, and relevant `docs/*` contracts before future phase work.
- Keep `TASKS.md` and `docs/DECISIONS.md` current when scope or assumptions change.

## Child Safety, Privacy, and Content

- Do not add child-facing live AI, telemetry, advertising, or runtime cloud services.
- Do not store private assessment records, child-sensitive identifiers, credentials, school data, or personal records.
- Use only original content with an explicit `DRAFT`, `REVIEWED`, `APPROVED`, or `RETIRED` review state.
- Do not treat unreviewed DRAFT content as production-ready.
- Do not add external FAST report images, proprietary passages, or official score claims.
- Keep child-facing feedback supportive and free of punitive or diagnostic labels.

## Git and Remote Operations

- The repository has a private GitHub `origin`; local commits are permitted.
- Do not fetch, pull, push, publish, deploy, or otherwise contact a remote unless the current user command explicitly authorizes it.
- Never force-push, amend without authorization, squash, rebase, reset, or rewrite history.
- Phase 3 permits local commits but does not authorize any remote operation.

## Verification

- Before phase completion, run in order:
  1. `npm run lint`
  2. `npm run typecheck`
  3. `npm run test`
  4. `npm run build`
- Do not call a phase complete while a required check is failing.
