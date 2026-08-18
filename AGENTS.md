# AGENTS.md — Rory's Reading Quest (Phase 0)

## Scope and Operating Rules

- Use the currently selected base model and model settings only.
- Do not switch models or request alternate model tiers, modes, or speed profiles.
- Do not use subagents, teams, delegated model workers, parallel model tasks, or background model runs.
- Do not use plugins, external agents, browser automation, image generation tools, web research, or remote API calls for this phase.
- Do not run shell commands concurrently.
- Do not duplicate work merely to compare alternatives.
- Do not run destructive Git operations.
- Do not change global Git, Node, npm, OS, IDE, or Codex configuration.
- Do not install global packages or system software.
- Do not use background jobs, scheduled jobs, or unattended follow-up processes.
- Do not deploy, publish, host, upload, or connect this application to remote services.

## Safety and Privacy Rules

- No child-facing live AI content generation in Phase 0.
- Keep dependency footprint intentionally small.
- Keep local-first behavior only in Phase 0.
- Store only project-development data necessary for this phase.
- Do not add personal information, credentials, API keys, school identifiers, or private records.
- Ensure repository does not contain external FAST report images or proprietary passage text.
- Do not add PII or sensitive personal data in code or data files.

- Keep a strict content review workflow:
  - DRAFT, REVIEWED, APPROVED, RETIRED review states are required for lesson units.
  - Unreviewed DRAFT content is not treated as production-ready.

## Workflow and Progress Control

- Respect phase boundaries and stop after each assigned milestone.
- Do not begin Phase 1 work until Phase 0 acceptance is complete.
- Do not begin bulk lesson authoring, parent dashboard, PWA, or audio support in Phase 0.
- Before future edits outside the current phase, read existing project documents (`README`, `TASKS`, `docs/*`).
- Update `TASKS.md` and `docs/DECISIONS.md` whenever scope or assumptions change.

## Git and Verification

- If Git is not initialized, initialize a local repository only.
- Do not set or alter global Git identity.
- Do not connect remotes, push, or create external hosting resources.
- Keep all work local.
- Before completion, run verification commands in this order:
  1. `npm run lint`
  2. `npm run typecheck`
  3. `npm run test`
  4. `npm run build`

## Privacy-Safe Development

- Use original sample content only.
- No generated or third-party art/sound in Phase 0.
- No live service dependency in runtime behavior.
