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

## 2026-08-20 - Parent Dashboard Presentation Shell

- Decision: Add only a read-only dashboard shell in Phase 5B1 that consumes the existing parent analytics snapshot.
- Reason: The phase needs a polished parent-facing presentation layer without adding record mutation or print/export behavior.
- Consequence: Parent navigation, overview, drill-downs, session details, reviews, word help, and the assessments placeholder can be delivered now while Phase 5B2 retains the remaining mutation and print flows.
- Status: Applied

## 2026-08-20 - Transactional Parent Assessment Records

- Decision: Route assessment create/update/delete through the parent gate and only promote state after a successful local store save.
- Reason: Parent assessment edits must be isolated from child progress and must not claim durability when storage fails.
- Consequence: Failed save/delete operations preserve the previous assessment collection and surface a calm browser-local notice.
- Status: Applied

## 2026-08-20 - Local Print Summary Preview

- Decision: Keep print as a parent-only preview plus explicit browser print action, with no PDF or download feature.
- Reason: The phase needs a readable paper-friendly summary without adding a file-generation dependency or remote service.
- Consequence: The dashboard renders a dedicated print preview view and delegates the actual dialog to the injected browser print service.
- Status: Applied

## 2026-08-20 - Registered Grade 2 Bridge Pack

- Decision: Add Phase 6A1 curriculum through a registered content-pack layer rather than expanding the legacy development content file.
- Reason: The bridge curriculum needs a stable place for future packs, partial coverage markers, and recovery-safe legacy IDs.
- Consequence: `sampleContent` aggregates registered packs, fresh selection prefers the active bridge pack, and legacy lessons remain resolvable for history.
- Status: Applied

## 2026-08-20 - Explicit Partial Coverage for ELA.2.F.1.3a

- Decision: Mark `ELA.2.F.1.3a` as partial in Phase 6A1 until the remaining vowel-team packs are added.
- Reason: Only `oo` and `ea` are implemented in this phase, so complete benchmark coverage would be inaccurate.
- Consequence: Parent reporting and curriculum docs can distinguish benchmark-aligned exposure from complete coverage.
- Status: Applied

- Decision: Add Phase 6A2 as the second vowel-team bridge pack and treat `ELA.2.F.1.3a` as implemented in DRAFT form only after both packs are registered.
- Reason: The remaining `ou`, `oi`, `oy`, and `ow` patterns complete the authored pattern set while still staying inside the local DRAFT curriculum boundary.
- Consequence: Benchmark coverage audits can report implemented coverage without implying approval, mastery, or official FAST results.
- Status: Applied

## 2026-08-20 - Catalog-Derived Lesson Ownership

- Decision: Resolve lesson unit and world ownership from catalog metadata instead of brittle lesson-ID prefixes.
- Reason: Trail 4 unit gating and legacy-history recovery need metadata-driven ownership as the curriculum grows.
- Consequence: Selected-unit planning, unit badges, and parent reporting remain stable even when lesson IDs do not follow a simple prefix pattern.
- Status: Applied

## 2026-08-20 - Phase 6B2 Consonant-LE Completion

- Decision: Treat `ELA.2.F.1.3c` as implemented in DRAFT form after Phase 6B2 registers consonant-`le` content alongside the Phase 6B1 open/closed work.
- Reason: The benchmark now has authored DRAFT coverage for open, closed, and consonant-`le` syllables across the registered Syllable Summit packs.
- Consequence: Curriculum and parent docs can report implemented DRAFT coverage without implying human approval, mastery, or official FAST results.
- Status: Applied

## 2026-08-20 - Benchmark-Specific Coverage Catalog

- Decision: Drive coverage audits from benchmark-specific expected pattern catalogs instead of reusing the `ELA.2.F.1.3a` vowel list everywhere.
- Reason: The bridge curriculum now spans `ELA.2.F.1.3a`, `ELA.2.F.1.3b`, and `ELA.2.F.1.3c`, and each benchmark needs its own deterministic coverage shape.
- Consequence: Coverage audits can report implemented or partial status accurately, and review status can remain conservative across multiple packs.
- Status: Applied

## 2026-08-20 - Phase 6C1 Common-Prefix Coverage

- Decision: Mark `ELA.2.F.1.3d` as partial in DRAFT form after Phase 6C1 registers common-prefix practice for Prefix Power.
- Reason: The benchmark now has authored common-prefix coverage, but common suffixes remain deferred to Phase 6C2.
- Consequence: Parent and curriculum docs can report partial coverage without implying approval, mastery, or official FAST results.
- Status: Applied

## 2026-08-20 - Phase 6C2 Common-Suffix Coverage

- Decision: Mark `ELA.2.F.1.3d` as implemented in DRAFT form after Phase 6C2 registers common-suffix practice for Suffix Station.
- Reason: The benchmark now has authored common-prefix and common-suffix coverage across the two bridge packs.
- Consequence: Parent and curriculum docs can report implemented coverage without implying approval, mastery, or official FAST results.
- Status: Applied

## 2026-08-21 - Phase 6C3 Silent-Letter Coverage

- Decision: Mark `ELA.2.F.1.3e` as implemented in DRAFT form after Phase 6C3 registers bounded silent-letter practice for Quiet Letter Quest.
- Reason: The benchmark now has authored DRAFT coverage for the app's defined silent-letter set while fluency practice remains deferred.
- Consequence: Parent and curriculum docs can report implemented DRAFT coverage without implying exhaustive English silent-letter mastery, human approval, or oral fluency.
- Status: Applied

## 2026-08-21 - Quiet Letter Quest and Fluency Flight Shells

- Decision: Add Quiet Letter Quest as `wg-unit-5` and Fluency Flight as a locked `wg-unit-6` shell.
- Reason: The app needs deterministic gating for Trail 7 and a visible future shell while Phase 6C4 remains deferred.
- Consequence: Selected-unit planning can unlock Quiet Letter Quest at difficulty 7 while keeping Fluency Flight locked until Phase 6C4.
- Status: Applied

## 2026-08-21 - Phase 6C4 Fluency Practice Foundations

- Decision: Treat `ELA.2.F.1.4` as supportive practice only in Phase 6C4 and keep it distinct from benchmark coverage.
- Reason: Fluency Flight needs modeled reading, phrase-cued reading, repeated reading, self-monitoring, and understanding checks without recording or certifying oral reading.
- Consequence: Parent, curriculum, and adaptive docs can report supportive practice while clearly saying the app does not measure oral fluency or claim benchmark mastery.
- Status: Applied

## 2026-08-21 - Phase 6D0 Multi-World Progression Foundation

- Decision: Add a small curriculum-track registry plus world-aware and unit-aware planning before prose content exists.
- Reason: Phase 6D needs deterministic multi-skill progression, safe initialization for new tracks, and child-facing labels that no longer assume every route is Word Forge.
- Consequence: Later Story Scouts and Poetry Planet packs can land without changing persistence keys, track ordering by object insertion, or the existing Word Forge flow.
- Status: Applied

## 2026-08-21 - Phase 6D1 Story Scouts Activation

- Decision: Activate `g2-story-scouts-prose` when the first Story Scouts pack is registered, while keeping Theme Trail, Perspective Portal, and Poetry Planet planned.
- Reason: Phase 6D1 is the first active Story Scouts curriculum-authoring phase and needs a bounded prose pack without theme, perspective, or poetry content.
- Consequence: The curriculum map can show `ELA.2.R.1.1` as implemented in DRAFT form without implying mastery or opening later prose and poetry phases.
- Status: Applied

## 2026-08-21 - Phase 6D2 Theme Trail Activation

- Decision: Activate `ELA.2.R.1.2` and the Theme Trail pack when the first Story Scouts theme pack is registered, while keeping Perspective Portal and Poetry Planet planned.
- Reason: Phase 6D2 is the first active Story Scouts theme-authoring phase and needs bounded theme practice with unit-affine review scheduling.
- Consequence: Story Scouts continues to use one skill track with separate Story Map and Theme Trail review content, and later units can land without stealing one another's reviews.
- Status: Applied

## 2026-08-20 - Unit-Aware Word Forge Planning

- Decision: Make selected-unit planning unit-aware so fresh lesson selection and active-session recovery respect the chosen Word Forge trail.
- Reason: The curriculum now has multiple bridge units, and the app must not silently replace an active quest with content from another unit.
- Consequence: Vowel Voyage, Syllable Summit, and future bridge units can be derived from progress and locked or unlocked deterministically.
- Status: Applied

## 2026-08-20 - Multi-Benchmark Parent Reporting

- Decision: Allow parent skill summaries and print summaries to display multiple benchmark references for one skill.
- Reason: The broad `g2-word-forge-word-practice` skill now spans more than one benchmark, so showing only one reference would be misleading.
- Consequence: Parent views can present the represented benchmark set deterministically without implying an official FAST result.
- Status: Applied

## 2026-08-20 - Guided Practice and Checkpoint Lesson Roles

- Decision: Allow guided-teaching lessons and scored checkpoint lessons to coexist in the same curriculum pack.
- Reason: Remediation needs a teaching block before practice, while progression requires fresh scored material.
- Consequence: Teaching blocks can support decoding practice without being scored or counted as assistance or mastery evidence.
- Status: Applied
## 2026-08-21 - Phase 6D3 Perspective Portal Activation
- Decision: Activate `ELA.2.R.1.3` and the Perspective Portal pack when the first Story Scouts perspective pack is registered, while keeping Poetry Planet planned.
- Reason: Phase 6D3 is the first active Story Scouts perspective-authoring phase and needs bounded character-perspective practice with unit-affine review scheduling across all Story Scouts units.
- Consequence: Story Scouts continues to use one skill track with separate Story Map, Theme Trail, and Perspective Portal review content, and later poetry content can land without stealing one another’s reviews.

## 2026-08-22 - Phase 6D4 Poetry Planet Activation
- Decision: Activate `ELA.2.R.1.4` and the Rhyme Routes pack when the first Poetry Planet pack is registered, while keeping later Grade 2 informational and vocabulary phases planned.
- Reason: Phase 6D4 is the first active Poetry Planet rhyme-scheme phase and needs bounded end-rhyme practice with unit-affine review scheduling alongside the existing Story Scouts tracks.
- Consequence: Poetry Planet becomes an active independent track with its own review content, Story Scouts review isolation remains intact, and later Grade 2 bridge phases stay deferred.

## 2026-08-22 - Phase 6E0 Planned Information and Vocabulary Shells
- Decision: Add planned Information Detectives and Context Cavern roadmap shells without active content during Phase 6E0.
- Reason: Phase 6E0 needs stable track definitions, unit ownership, and future-world gating boundaries before informational and vocabulary content exists.
- Consequence: The curriculum can recognize the future worlds in docs and tests without creating benchmark coverage, new passages, questions, or learner progress entries.

## 2026-08-22 - Phase 6E0 Vocabulary Measurement Boundary
- Decision: Keep `ELA.2.V.1.1` planned in Phase 6E0 rather than implementing it.
- Reason: The application cannot independently verify spoken or open-ended vocabulary use yet, so a benchmark claim would overstate what the UI can measure safely.
- Consequence: Phase 6E0 stays within a no-content architecture boundary and leaves future vocabulary practice design for Phase 6E5.

## 2026-08-22 - Phase 6E1 Information Detectives Activation
- Decision: Activate Information Detectives Text Feature Hunt for `ELA.2.R.2.1` while keeping Context Cavern planned.
- Reason: Phase 6E1 needs a bounded informational-text pack with authored text features, evidence, and deterministic unit-gated progression.
- Consequence: The active curriculum gains one informational pack and the bridge roadmap now includes implemented DRAFT coverage for `ELA.2.R.2.1`.

## 2026-08-22 - Phase 6E2 Central Idea Center Activation
- Decision: Activate Information Detectives Central Idea Center for `ELA.2.R.2.2` while preserving unit-specific review isolation and the existing no-Grade-3-explanation boundary.
- Reason: Phase 6E2 needs a bounded informational-text pack that teaches topic versus central idea, complete central-idea statements, and relevant details without moving into Grade 3 explanation or cross-text analysis.
- Consequence: The active curriculum gains a second informational pack, the bridge roadmap now includes implemented DRAFT coverage for `ELA.2.R.2.2`, and later informational and vocabulary phases stay planned.

## 2026-08-22 - Phase 6E3 Purpose Path Activation
- Decision: Activate Information Detectives Purpose Path for `ELA.2.R.2.3` while preserving unit-specific review isolation and the existing no-Grade-3-purpose-development boundary.
- Reason: Phase 6E3 needs a bounded informational-text pack that teaches specific author purpose from whole-text clues without moving into Grade 3 purpose-development analysis or opinion scoring.
- Consequence: The active curriculum gains a third informational pack, the bridge roadmap now includes implemented DRAFT coverage for `ELA.2.R.2.3`, and later informational and vocabulary phases stay planned.

## 2026-08-22 - Phase 6E4 Opinion & Evidence Desk Activation
- Decision: Activate Information Detectives Opinion & Evidence Desk for `ELA.2.R.2.4` while preserving unit-specific review isolation and the existing no-argument-analysis boundary.
- Reason: Phase 6E4 needs a bounded informational-text pack that teaches author opinion, fact versus opinion, and supporting evidence without moving into formal argument analysis, source reliability, or bias analysis.
- Consequence: The active curriculum gains a fourth informational pack, the bridge roadmap now includes implemented DRAFT coverage for `ELA.2.R.2.4`, and later vocabulary phases stay planned.
