# Rory's Reading Quest

## Purpose

Rory's Reading Quest is a local-first, child-safe reading-learning foundation for Grade 2-4 progression. Phase 3 connects the playable Phase 2 lesson engine to deterministic adaptive progression and versioned browser persistence.

## Current Status

- Status: `Phase 6B1 complete`.
- A completed `LessonResult` now drives verification, advancement, fresh practice, same-level remediation, prerequisite rebuilding, spaced review, or a structured content-needed outcome.
- Progress, rewards, bounded attempt history, review scheduling, submitted active-session checkpoints, and assistance summaries persist locally.
- Curated word-help controls reveal authored patterns and optional browser speech without using an external service or microphone.
- The parent area now opens a polished local-only dashboard with overview, progress drill-downs, sessions, reviews, word help, editable official assessments, and a print-summary preview.
- Phase 6A1 adds a scalable Grade 2 content-pack registry, guided-teaching lessons, and a partial bridge pack for `oo` and `ea` variable vowel teams. Phase 6A2 adds the remaining `ou`, `oi`, `oy`, and `ow` patterns, and Phase 6B1 adds regularly spelled two-syllable words plus open and closed syllables. `ELA.2.F.1.3a` is implemented in DRAFT across the vowel packs, `ELA.2.F.1.3b` is implemented in DRAFT in Syllable Summit, and `ELA.2.F.1.3c` is partial in DRAFT until consonant-le arrives in Phase 6B2. Audio, later Grade 2 benchmarks, PWA behavior, backend services, accounts, analytics, and live AI remain deferred.

## Commands

- `npm install` - install local dependencies.
- `npm run dev` - start the local development server.
- `npm run lint` - run lint checks.
- `npm run typecheck` - run TypeScript checks.
- `npm run test` - run domain, persistence, and UI tests.
- `npm run build` - create the production build.

## Architecture Summary

- Presentation: React/TypeScript shell with explicit local screen state and a small progress hook.
- Domain: pure lesson evaluation, adaptive progression, deterministic lesson selection, remediation return, review scheduling, and assistance summarization.
- Content: three registered Grade 2 bridge packs with 21 DRAFT lessons, 21 original DRAFT passages, 123 DRAFT questions, and 89 DRAFT word-support targets, plus legacy lessons preserved for recovery and history.
- Persistence: version-1 child progress plus separate parent-access and parent-record stores behind small interfaces, with safe in-memory fallback and optional assistance-event persistence.
- Runtime services: browser only; no telemetry, advertising, cloud service, backend, or remote content request. Phase 5A adds a local parent PIN gate and parent analytics summaries without changing child learning flow. Phase 5B1 adds the parent dashboard presentation on top of the same local data, Phase 5B2 adds local assessment CRUD plus a browser-print preview, and Phase 6A1 plus Phase 6A2 add local curriculum packs without runtime generation or external content.

## Privacy and Assessment Boundary

Persisted records contain stable local IDs and educational summaries only. Passage text, explanation text, correct-answer text, private child identifiers, official FAST reports, official FAST scores, and plaintext PINs are not persisted. Parent access and assessment records use separate local stores. This application is not an official assessment or diagnostic system.
