# Rory's Reading Quest

## Purpose

Rory's Reading Quest is a local-first, child-safe reading-learning foundation for Grade 2-4 progression. Phase 3 connects the playable Phase 2 lesson engine to deterministic adaptive progression and versioned browser persistence.

## Current Status

- Status: `Phase 3 complete`.
- A completed `LessonResult` now drives verification, advancement, fresh practice, same-level remediation, prerequisite rebuilding, spaced review, or a structured content-needed outcome.
- Progress, rewards, bounded attempt history, review scheduling, and submitted active-session checkpoints persist locally.
- The parent area remains a placeholder. Audio, sound-out support, PWA behavior, backend services, accounts, analytics, and live AI remain deferred.

## Commands

- `npm install` - install local dependencies.
- `npm run dev` - start the local development server.
- `npm run lint` - run lint checks.
- `npm run typecheck` - run TypeScript checks.
- `npm run test` - run domain, persistence, and UI tests.
- `npm run build` - create the production build.

## Architecture Summary

- Presentation: React/TypeScript shell with explicit local screen state and a small progress hook.
- Domain: pure lesson evaluation, adaptive progression, deterministic lesson selection, remediation return, and review scheduling.
- Content: 2 original DRAFT passages and 10 DRAFT questions arranged as one lower-trail lesson and three current-trail variants.
- Persistence: version-1 `localStorage` adapter behind a small interface, with safe in-memory fallback.
- Runtime services: browser only; no telemetry, advertising, cloud service, backend, or remote content request.

## Privacy and Assessment Boundary

Persisted records contain stable local IDs and educational summaries only. Passage text, explanation text, correct-answer text, private child identifiers, official FAST reports, and official FAST scores are not persisted. This application is not an official assessment or diagnostic system.
