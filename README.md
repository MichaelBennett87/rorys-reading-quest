# Rory's Reading Quest

## Purpose

Rory's Reading Quest is a local-first, child-safe reading-learning foundation for Grade 2-4 progression. Phase 3 connects the playable Phase 2 lesson engine to deterministic adaptive progression and versioned browser persistence.

## Current Status

- Status: `Phase 6D complete; Phase 6E0 through Phase 6E6 complete; Information Detectives informational-reading sequence complete; Academic Word Workshop complete; Morphology Mine complete; Phase 6 remains in progress; Phase 6E7 is next; Meaning Clue Chamber remains without production curriculum; Context Cavern is active`.
- A completed `LessonResult` now drives verification, advancement, fresh practice, same-level remediation, prerequisite rebuilding, spaced review, or a structured content-needed outcome.
- Progress, rewards, bounded attempt history, review scheduling, submitted active-session checkpoints, and assistance summaries persist locally.
- Curated word-help controls reveal authored patterns and optional browser speech without using an external service or microphone.
- The parent area now opens a polished local-only dashboard with overview, progress drill-downs, sessions, reviews, word help, editable official assessments, and a print-summary preview.
- Phase 6A1 adds a scalable Grade 2 content-pack registry, guided-teaching lessons, and a partial bridge pack for `oo` and `ea` variable vowel teams. Phase 6A2 adds the remaining `ou`, `oi`, `oy`, and `ow` patterns, Phase 6B1 adds regularly spelled two-syllable words plus open and closed syllables, Phase 6B2 completes authored DRAFT coverage for consonant-`le` in `ELA.2.F.1.3c`, Phase 6C1 adds common-prefix practice plus Prefix Power gating, Phase 6C2 adds common-suffix practice plus Suffix Station gating, Phase 6C3 adds silent-letter combinations plus Quiet Letter Quest gating, Phase 6C4 adds fluency-practice foundations plus Fluency Flight supportive practice, Phase 6D1 adds the first active Story Scouts Story Map pack, Phase 6D2 adds Story Scouts Theme Trail for `ELA.2.R.1.2`, Phase 6D3 adds Story Scouts Perspective Portal for `ELA.2.R.1.3`, and Phase 6D4 adds Poetry Planet Rhyme Routes for `ELA.2.R.1.4`. Phase 6E0 keeps the future-world shells in place, Phase 6E1 adds the first active Information Detectives pack for `ELA.2.R.2.1`, Phase 6E2 adds the Central Idea Center pack for `ELA.2.R.2.2`, Phase 6E3 adds the Purpose Path pack for `ELA.2.R.2.3`, Phase 6E4 adds the Opinion & Evidence Desk pack for `ELA.2.R.2.4`, Phase 6E5 adds the Context Cavern Academic Word Workshop pack for `ELA.2.V.1.1`, and Phase 6E6 adds the Morphology Mine pack for `ELA.2.V.1.2`, while Phase 6E7 remains deferred. `ELA.2.F.1.3a` is implemented in DRAFT across the vowel packs, `ELA.2.F.1.3b` is implemented in DRAFT in Syllable Summit, `ELA.2.F.1.3c` is implemented in DRAFT across the Syllable Summit packs, `ELA.2.F.1.3d` is implemented in DRAFT across the Prefix Power and Suffix Station packs, `ELA.2.F.1.3e` is implemented in DRAFT in Quiet Letter Quest, `ELA.2.F.1.4` is supportive practice only in Fluency Flight, `ELA.2.R.1.1` is implemented in DRAFT in Story Scouts, `ELA.2.R.1.2` is implemented in DRAFT in Story Scouts, `ELA.2.R.1.3` is implemented in DRAFT in Story Scouts, `ELA.2.R.1.4` is implemented in DRAFT in Poetry Planet, `ELA.2.R.2.1` is implemented in DRAFT in Information Detectives, `ELA.2.R.2.2` is implemented in DRAFT in Information Detectives, `ELA.2.R.2.3` is implemented in DRAFT in Information Detectives, `ELA.2.R.2.4` is implemented in DRAFT in Information Detectives, `ELA.2.V.1.1` is implemented in DRAFT in Context Cavern, and `ELA.2.V.1.2` is implemented in DRAFT in Context Cavern. Phase 6D is complete, Phase 6E0 through Phase 6E6 are complete, Phase 6 is still a work in progress, and Phase 6E7 is next. Context Cavern is active. Audio, later Grade 2 benchmarks, PWA behavior, backend services, accounts, analytics, and live AI remain deferred.

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
- Content: thirteen active Grade 2 bridge packs with 91 DRAFT lessons, 91 original DRAFT passages, 520 DRAFT questions, and 362 DRAFT word-support targets, plus the legacy development pack preserved for recovery and history.
- Persistence: version-1 child progress plus separate parent-access and parent-record stores behind small interfaces, with safe in-memory fallback and optional assistance-event persistence.
- Runtime services: browser only; no telemetry, advertising, cloud service, backend, or remote content request. Phase 5A adds a local parent PIN gate and parent analytics summaries without changing child learning flow. Phase 5B1 adds the parent dashboard presentation on top of the same local data, Phase 5B2 adds local assessment CRUD plus a browser-print preview, and Phase 6A1 through Phase 6C4 add local curriculum packs without runtime generation or external content.

## Privacy and Assessment Boundary

Persisted records contain stable local IDs and educational summaries only. Passage text, explanation text, correct-answer text, private child identifiers, official FAST reports, official FAST scores, and plaintext PINs are not persisted. Parent access and assessment records use separate local stores. This application is not an official assessment or diagnostic system.
