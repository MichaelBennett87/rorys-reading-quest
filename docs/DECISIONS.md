# Design Decisions Log

## 2026-08-18 — Phase 0 Foundations

- Decision: Keep all logic local and deterministic with pure TypeScript modules.
- Reason: Aligns with local-first, minimal-dependency constraints.
- Consequence: Progression and content rules are testable without runtime services.
- Status: Applied

## 2026-08-18 — UI Scope

- Decision: Implement a compact shell only with title, three-path card, and parent placeholder.
- Reason: The phase requires minimal UI surface and no dashboard/map expansion.
- Consequence: No routing, no backend, no audio, and no parent dashboard in this phase.
- Status: Applied

## 2026-08-18 — Sampling Strategy

- Decision: Use one Grade 2 bridge skill with three fresh activity variants and DRAFT content state.
- Reason: Phase 0 requirement is a tiny developmental sample, not production curriculum.
- Consequence: Small deterministic content set for rule verification and testing.
- Status: Applied

## 2026-08-18 — Progression Rule Coverage

- Decision: Implement two-step mastery requirement and two-failure prerequisite return logic explicitly.
- Reason: These are direct acceptance criteria and must be verifiable by tests.
- Consequence: `evaluateCheckpoint` returns structured decisions and reason codes; no predictive scoring.
- Status: Applied

## 2026-08-18 — Phase 1 Navigation Approach

- Decision: Use a local `AppShell` screen state instead of a router for navigation.
- Reason: Keeps shell implementation minimal and avoids introducing routing dependency before gameplay exists.
- Consequence: Navigation transitions are explicit and testable via component state and back behavior.
- Status: Applied

## 2026-08-18 — Difficulty Naming

- Decision: Display child-facing difficulty as “Trail 1/Trail 2/Trail 3.”
- Reason: Numeric values are retained internally, but friendly labels reduce learner load.
- Consequence: Unit cards and world progress text use trail naming while data remains plain labels.
- Status: Applied

## 2026-08-18 — Demo Boundaries

- Decision: Use fixed static demo data for learner, worlds, and units with no persistence.
- Reason: Phase 1 scope is shell and navigation only.
- Consequence: Navigation is deterministic and repeatable; no analytics or storage changes introduced.
- Status: Applied

## 2026-08-18 — Styling Strategy

- Decision: Use shared design tokens plus lightweight CSS with inline SVG iconography.
- Reason: Keeps visual direction colorful and adventurous while avoiding extra styling dependencies.
- Consequence: New tokens in `src/index.css` and reusable classes in `src/App.css`; no third-party CSS framework used.
- Status: Applied

## 2026-08-19 — Phase 2 Lesson Runtime

- Decision: Keep phase 2 lesson sessions in local in-memory state.
- Reason: deterministic gameplay can be validated without adding persistence or external services.
- Consequence: `lesson_run` now supports question render, scoring, lockout, feedback, and completion result shape.
- Status: Applied

## 2026-08-19 — Supported Question Type Coverage

- Decision: Implement exactly five question types in phase 2: multiple choice, multiselect, hot text, two-part evidence, and table match.
- Reason: this set reaches the required engine complexity while staying bounded.
- Consequence: evaluator, validator, and content model all align on the same typed payload contract.
- Status: Applied

## 2026-08-19 — Child-Safe Feedback Policy

- Decision: Use only supportive language and explanations in all feedback states.
- Reason: child safety and motivation are core product constraints for this phase.
- Consequence: forbidden terms are rejected in tests; feedback emphasizes correction and evidence-based explanations.
- Status: Applied

## 2026-08-20 - Distinct Adaptive Evidence

- Decision: Track qualifying independent activity IDs rather than trusting a numeric success count alone.
- Reason: Replaying one lesson must not satisfy both mastery proofs.
- Consequence: Duplicate strong attempts remain in history but cannot advance difficulty.
- Status: Applied

## 2026-08-20 - Lesson-Level Fresh Selection

- Decision: Select deterministic lesson candidates by skill, difficulty, purpose, recent activity ID, and passage-question keys.
- Reason: Phase 3 progression needs coherent complete lessons and must never silently repeat exhausted material.
- Consequence: The DRAFT catalog is split into one lower lesson and three current-difficulty variants; exhaustion returns `content_needed`.
- Status: Applied

## 2026-08-20 - Versioned Local Persistence

- Decision: Use `localStorage` behind a version-1 persistence interface with safe in-memory fallback.
- Reason: It is reversible, browser-local, and adds no dependency while preserving a future migration boundary.
- Consequence: Only schema version 1 is supported; malformed data is not overwritten during load, history is bounded, and no private assessment fields are stored.
- Status: Applied

## 2026-08-20 - Recoverable and Idempotent Lesson Sessions

- Decision: Persist stable active-session IDs after submission and navigation checkpoints, and use the session ID as completion ID.
- Reason: Submitted work must survive reload while one completion must award progress and rewards exactly once.
- Consequence: Compatible sessions reconstruct evaluation from current local content; incompatible sessions alone are discarded.
- Status: Applied

## 2026-08-20 - Curated Word Support and Optional Speech

- Decision: Add authored support targets, deterministic assistance events, and an optional browser-speech boundary for word help.
- Reason: Learners need supportive on-demand clues without introducing an external speech service or microphone dependency.
- Consequence: Assistance stays local, is persisted as privacy-safe IDs and summaries, and never counts as independent mastery evidence.
- Status: Applied

## 2026-08-20 - Parent Analytics and Access Foundation

- Decision: Keep parent analytics pure and derived from canonical child progress, assistance summaries, and current authored content metadata.
- Reason: Phase 5A needs parent-readable summaries without changing child learning behavior or duplicating stored child progress.
- Consequence: Dashboard snapshots, explanations, review summaries, attention items, and word-help summaries remain deterministic and testable.
- Status: Applied

## 2026-08-20 - Parent PIN and Record Separation

- Decision: Store local parent access state and official assessment records in separate versioned localStorage keys behind browser-crypto services.
- Reason: Parent access must not modify child progress and plaintext PINs must never enter persisted state.
- Consequence: The parent gate is local-only, reload locks it again, and unsupported cryptography fails closed without affecting child gameplay.
- Status: Applied

## 2026-08-20 - Minimal Parent Area Foundation

- Decision: Ship only a compact authenticated parent foundation screen in Phase 5A.
- Reason: The detailed dashboard, assessment-entry UI, and print/export flows are deferred to Phase 5B.
- Consequence: The app can unlock a private parent area, show bounded summary data, and keep the full dashboard scope out of this split.
- Status: Applied