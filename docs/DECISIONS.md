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

## 2026-08-22 - Phase 6E5 Academic Word Workshop Activation
- Decision: Activate Context Cavern Academic Word Workshop for `ELA.2.V.1.1` while preserving Morphology Mine and Meaning Clue Chamber as planned later units.
- Reason: Phase 6E5 needs bounded academic-vocabulary practice in speaking and writing without moving into morphology, context clues, reference-material work, or live speech evaluation.
- Consequence: The active curriculum gains a fifth track, the bridge roadmap now includes implemented DRAFT coverage for `ELA.2.V.1.1`, and later Context Cavern phases stay planned.

## 2026-08-22 - Phase 6E6 Morphology Mine Activation
- Decision: Activate Context Cavern Morphology Mine for `ELA.2.V.1.2` while preserving Meaning Clue Chamber as the planned later unit.
- Reason: Phase 6E6 needs bounded morphology practice with transparent base words and affixes without moving into context clues, word relationships, reference materials, or background knowledge.
- Consequence: The active curriculum keeps Context Cavern playable, the bridge roadmap now includes implemented DRAFT coverage for `ELA.2.V.1.2`, and Meaning Clue Chamber stays planned.

## 2026-08-23 - Phase 6E7 Meaning Clue Chamber Activation
- Decision: Activate Context Cavern Meaning Clue Chamber for `ELA.2.V.1.3` while completing Phase 6E and preserving later across-genres work for Phase 6F.
- Reason: Phase 6E7 needs bounded Grade 2 meaning-clue practice with context clues, word relationships, reference materials, and background knowledge without moving into figurative language, multiple-meaning words, or cross-genre comparison.
- Consequence: The active curriculum keeps Context Cavern playable, the bridge roadmap now includes implemented DRAFT coverage for `ELA.2.V.1.3`, and Phase 6F remains the next planned boundary.
## 2026-08-23 - Phase 6F0 Compare Castle foundation

Decision: use the existing world ID `compare-castle` for the Across-Genre Reading track and keep it planned until production lessons exist.

Rationale: the application already has a locked placeholder world shell, and Phase 6F0 only needs the roadmap, inventory, and audit foundation. Reusing the existing world avoids duplicate production worlds and keeps the child-facing name `Compare Castle` aligned with the current map.

Consequences: `ELA.2.R.3.1`, `ELA.2.R.3.2`, and `ELA.2.R.3.3` remain planned in Phase 6F0; the Grade 2 benchmark inventory and coverage snapshot become explicit; the retell, paired-text, and figurative-language boundaries are documented before content authoring begins.

## 2026-08-23 - Phase 6F1 Compare Castle activation

Decision: activate `g2-across-genres-reading` through the Compare Castle Wordplay Watchtower pack while keeping Retell Hall and Compare Keep planned.

Rationale: Phase 6F1 now has authored DRAFT production content for `ELA.2.R.3.1`, and the shared curriculum architecture can use the existing `compare-castle` world without changing storage, review identity, or the later Compare Castle unit roadmap.

Consequences: `ELA.2.R.3.1` becomes implemented in DRAFT through Compare Castle Wordplay Watchtower; `ELA.2.R.3.2` and `ELA.2.R.3.3` remain planned; Compare Castle becomes active in child-facing views and in the Grade 2 coverage snapshot; later Compare Castle units remain locked until their own phases.

## 2026-08-23 - Phase 6F2 Retell Hall activation

Decision: activate `g2-across-genres-reading` through the Compare Castle Retell Hall pack while keeping Compare Keep planned.

Rationale: Phase 6F2 now has authored DRAFT production content for `ELA.2.R.3.2`, and the shared curriculum architecture can extend the existing `compare-castle` world without changing storage, review identity, or the later Compare Castle unit roadmap.

Consequences: `ELA.2.R.3.2` becomes implemented in DRAFT through Compare Castle Retell Hall; `ELA.2.R.3.3` remains planned; Compare Castle remains active in child-facing views and in the Grade 2 coverage snapshot; Compare Keep remains locked until its own phase.

## 2026-08-23 - Phase 6F3 Compare Keep activation

Decision: activate `g2-across-genres-reading` through the Compare Castle Compare Keep pack while keeping the final Grade 2 audit for Phase 6F4.

Rationale: Phase 6F3 now has authored DRAFT production content for `ELA.2.R.3.3`, and the shared curriculum architecture can extend the existing `compare-castle` world without changing storage, review identity, or the final audit boundary.

Consequences: `ELA.2.R.3.3` becomes implemented in DRAFT through Compare Castle Compare Keep; Compare Castle remains active in child-facing views and in the Grade 2 coverage snapshot; Phase 6F4 remains the final audit boundary.

## 2026-08-23 - Phase 6F4 Final Grade 2 Audit Completion

Decision: mark Phase 6 complete after the final Grade 2 audit verified the 20-benchmark inventory, the 22 active packs, the authored DRAFT and supportive-practice coverage, and the unchanged privacy, accessibility, and progression boundaries.

Rationale: The repository already contains the full planned Grade 2 bridge curriculum, and the final audit only needed to confirm the documented totals, reports, and safety boundaries without adding new curriculum.

Consequences: Phase 6 is complete; Phase 7 remains the next boundary; the final audit documents now describe the repository state rather than a pending phase.

## 2026-08-23 - Phase 6.5 Live Hardening

- Decision: treat the live UX, phonics, data, and content-integrity cleanup as a post-Phase-6 hardening milestone.
- Reason: the first live playtest exposed percentage formatting drift, demo reward contamination, stale child copy, and a small semantic question mismatch that did not require new curriculum.
- Consequence: production reward totals now initialize at zero, legacy seeded saves receive a bounded one-time cleanup, active Grade 2 semantic audit coverage is explicit, and the phase boundary stays below Phase 7.

### Reopened acceptance correction

- Decision: keep Phase 6.5 unchecked after implementation and use `IMPLEMENTATION COMPLETE - LIVE HUMAN VISUAL ACCEPTANCE PENDING` until Michael completes the deployed playthrough.
- Reason: registry-wide ownership, expanded semantic checks, distinct speech sequences, and real child/parent visual implementations were required beyond the first partial hardening pass.
- Consequence: no curriculum counts, benchmark states, persistence schema, mastery thresholds, review intervals, or Phase 7 state change. The remaining gate is external visual and voice acceptance on GitHub Pages.

## 2026-08-23 - Phase 6.6 dark-first quality gate

- Decision: make a layered dark visual system the fixed default for both application shells, with playful world-specific child themes and a separate restrained parent analytics theme.
- Reason: the post-playtest interface needed stronger depth, hierarchy, and product identity without adding a UI dependency or changing application behavior.
- Consequence: child and parent screens share reusable dark tokens but retain distinct presentation systems; print remains light and readable; reduced-motion, focus, contrast, and semantic controls remain required. A light-mode preference was not added because it would introduce new persistence scope without improving this bounded gate.

## 2026-08-23 - Phase 6.6 active-quest and word-help hotfix

- Decision: remove the redundant visible Blend It learner control, keep historical level-4 compatibility for older saves, and add explicit active-quest resume, Save and Exit, and End Current Quest behavior.
- Reason: browser speech did not provide a distinct enough blended-word experience to justify a separate learner control, and learners needed a clear, safe way to keep or abandon an in-progress quest without silent replacement.
- Consequence: new child help exposes five visible steps, historical level-4 records still render safely, and abandonment clears only the unfinished active session while preserving earned progress and review state.

## 2026-08-23 - GPT-5.6 Sol Grade 2 curricular reasoning review

- Decision: supplement deterministic content validation with a source-level reasoning review of all 22 active packs, 154 lessons, 161 texts, 889 questions, and 614 support targets.
- Reason: structural validation proves ownership and resolution contracts but cannot prove that a keyed answer is instructionally defensible, a distractor is unambiguous, or an explanation measures the intended skill.
- Consequence: confirmed ambiguity, author-purpose construct, rhyme, perspective, factual wording, context-clue, retell, wordplay, and paired-comparison defects were corrected in place. Counts, IDs where practical, benchmark coverage, adaptive thresholds, review intervals, persistence schema, and Phase 7 state remain unchanged. Professional educational review and final live human acceptance remain pending.

## Phase 7A0 decisions

- Reuse each established world with separate grade-band tracks and distinct skill IDs rather than renaming or migrating Grade 2 progress.
- Treat `ELA.3.F.1.3` as one official benchmark with five internal required patterns; do not invent official lettered sub-benchmarks.
- Gate Grade 3 by same-domain Grade 2 completion plus active content, not by a global grade diagnosis or parent assessment.
- Retain `getTrackByWorldId` only as a Grade 2 compatibility helper and require exact ownership for ambiguity-sensitive runtime paths.
- Keep the Grade 3 FAST blueprint immutable and audit-facing; defer multimedia and timed mixed practice to Phase 9.
- Keep `ELA.3.F.1.4` and `ELA.3.V.1.1` as intended supportive practice with no oral or unrestricted writing scoring.
- Preserve schema version 1, storage keys, mastery thresholds, review intervals, rewards, Pages base, and deployment workflow.

## 2026-08-23 - Phase 7A1 Root Reactor activation

Decision: activate only `g3-word-forge-foundations` with one prerequisite-gated DRAFT pack. Keep all other Grade 3 tracks planned. Represent meaningful word parts and pronounceable reading chunks separately because their boundaries can differ. Treat root meanings and origin labels as teaching/audit support, not scored meaning mastery or origin trivia. Keep `ELA.3.F.1.3` partial until Phases 7A2 and 7A3 supply the remaining broad patterns; keep `ELA.3.V.1.2` planned. Preserve schema version 1, storage keys, Grade 2 review identity, reward rules, mastery thresholds, and review intervals.

## Phase 7A1.5: fingerprinted question truth and semantic feedback

- Derive the audit inventory from the active registry instead of maintaining a parallel question list.
- Keep blind-review projections free of authored keys and guide answers to reduce confirmation bias.
- Exercise every canonical response and bounded meaningful incorrect mutation through production `evaluateAnswer`.
- Reject extra table rows, unknown table choices, incomplete mappings, and duplicate `use_each_once` selections rather than ignoring malformed payload data.
- Derive correct, incorrect, and selected presentation state after grading; never infer correctness from text, CSS position, or color alone.
- Keep all 23 ledgers documentation-only and fingerprint-bound. A changed question must fail the ledger gate until reviewed again.
- Preserve all curriculum totals, adaptive thresholds, review intervals, rewards, persistence, parent access, and Phase 7A2 boundaries.

## 2026-08-24 - Phase 7A2 transparent derivational suffix scope

Decision: activate only `g3-wg-unit-2` with the DRAFT `g3-word-forge-suffix-shifter` pack. Teach eight bounded transparent suffix families: `-ness`, `-ment`, `-er`, `-ful`, `-less`, `-ly`, `-able`, and `-y`. Substitute `-y` for the provisional `-tion` family because common Grade 3 `-tion` examples generally require a nontransparent boundary or spelling-change instruction that this phase deliberately excludes. Preserve the eight-family count and noun-to-adjective branch without implying universal ending rules.

Decision: keep verification, remediation, and review unit/content-version affine, but release unit affinity after an `ADVANCE` decision so Root Reactor can enter Suffix Shifter. Keep `ELA.3.F.1.3` partial and DRAFT with only `multisyllabic-decoding` missing; keep `ELA.3.V.1.2` planned and Phase 7A3 unstarted.

## 2026-08-24 - Phase 7A3 flexible multisyllabic decoding scope

Decision: activate only `g3-wg-unit-3` with the DRAFT `g3-word-forge-multisyllable-mountain` pack. Teach six bounded syllable patterns and compound/prefix/base/suffix boundaries as flexible decoding strategies, not universal division rules. Keep morphology clues and pronunciation chunks explicit and independent where their boundaries differ.

Decision: mark `ELA.3.F.1.3` curriculum coverage IMPLEMENTED / DRAFT because Root Reactor, Suffix Shifter, and Multisyllable Mountain together cover all five inventory patterns. Do not mark it APPROVED, infer learner mastery, activate `ELA.3.F.1.4`, or claim `ELA.3.V.1.2`, oral fluency, WCPM, prosody, grade diagnosis, or FAST prediction.

Decision: preserve exact review identity for Grade 2 Word Forge and all three Grade 3 Word Forge units. Advancing Multisyllable Mountain reaches difficulty 4 and structured `CONTENT_NEEDED`; Fluency Flight Grade 3 remains unstarted. Storage, thresholds, intervals, rewards, Parent PIN, assessments, feedback semantics, and Pages configuration remain unchanged.

## 2026-08-24 - Phase 7A4 supportive Grade 3 fluency scope

Decision: activate only `g3-wg-unit-4` with the DRAFT `g3-word-forge-fluency-flight` pack. Reuse the Grade 2 `FLUENCY_PRACTICE` architecture, question types, optional local model listening, phrase groups, reflection, and supportive completion semantics rather than creating an incompatible Grade 3 runtime.

Decision: classify `ELA.3.F.1.4` as SUPPORTIVE_PRACTICE / DRAFT. Question correctness measures only understanding of visible fluent-reading choices. Do not record speech or infer oral accuracy, automaticity, pronunciation, expression, prosody, rate, learner mastery, a global grade diagnosis, or FAST performance.

Decision: permit fresh difficulty-4 fluency practice to complete the Grade 3 Word Forge chapter at completion difficulty 5 without creating checkpoint-style oral mastery evidence. Preserve exact Grade 2 and four-unit Grade 3 review identity, optional model listening, five-stage Word Help, feedback semantics, persistence schema, thresholds, review intervals, rewards, Parent PIN, assessments, privacy boundaries, Pages configuration, and the Phase 7B stop boundary.
## Phase 7B1 decisions

- Activate `g3-story-scouts-prose` only with Character Arc Camp production content and verified Grade 2 Story Scouts completion.
- Represent character development with ordered authored stages and resolved evidence rather than inferring arcs at runtime.
- Require a development summary to connect multiple plot stages so a static trait cannot satisfy the guide contract.
- Keep `ELA.3.R.1.1` curriculum coverage separate from learner mastery and human approval.
- Reuse the five existing question types, hardened evaluator, permanent truth ledger, five-stage Word Help, planner, review, persistence, parent, print, and Pages architecture.
- Defer theme development, character perspective, and poetry to later bounded phases.

## Phase 7B2 decisions

- Activate only `g3-ss-unit-2` with the DRAFT `g3-story-scouts-theme-development-trail` pack after Character Arc Camp completion.
- Model one clearly best-supported complete theme with ordered beginning, middle, and end evidence; reject topic-only, summary-only, command, and equally supported distractor candidates.
- Keep character actions and consequences as theme evidence without turning the pack into `ELA.3.R.1.1` character-development or `ELA.3.R.1.3` perspective instruction.
- Mark `ELA.3.R.1.2` curriculum coverage IMPLEMENTED / DRAFT while keeping learner mastery and human approval separate.
- Preserve exact Grade 2 Story Scouts, Character Arc Camp, and Theme Development Trail review identity, permanent truth gates, evaluator behavior, feedback semantics, persistence, Parent PIN, assessments, and Pages configuration.
- Defer Perspective Portal Grade 3, poetry, informational, vocabulary, across-genres content, Grade 4, and FAST timed practice.

## Phase 7B3 decisions

- Activate only `g3-ss-unit-3` with the DRAFT `g3-story-scouts-perspective-portal` pack after Theme Development Trail completion.
- Model character perspective as a complete text-supported view of a shared situation; reject isolated feelings, traits, narrator point of view, author perspective, and unsupported inferred motivations as substitutes.
- Require evidence for both characters and include four different, two partly-similar, one similar comparison, plus three supported perspective changes across the pack.
- Mark `ELA.3.R.1.3` curriculum coverage IMPLEMENTED / DRAFT while keeping learner mastery and human approval separate.
- Preserve exact Grade 2 and all three Grade 3 Story Scouts review identities, permanent truth gates, evaluator and feedback behavior, schema-version-1 persistence, Parent PIN, assessments, thresholds, intervals, rewards, and Pages configuration.
- Defer Poem Form Observatory, Grade 3 informational, vocabulary, across-genres content, Grade 4, and FAST timed practice.

## 2026-08-24 - Simplified Guided Child Journey

- Decision: Make `Start Journey` the sole child learning-navigation action on Home and keep `Parent Area` as the only secondary Home navigation action. Render curriculum worlds as static progress landmarks rather than controls.
- Reason: Rory benefits from seeing the route and progress without having to choose a world, unit, lesson, review, verification, or remediation path.
- Consequence: The normal route is `home -> lesson_run -> progression_outcome -> lesson_run or home`; reusable selection components remain outside that route. `planGlobalQuest` chooses the first incomplete active track by canonical curriculum order for ordinary progression while preserving active-session, urgent-plan, due-review, remediation, and verification priority. Word Forge therefore leads to Story Scouts only at its existing completion boundary, and required missing content still fails closed. Curriculum, mastery thresholds, reviews, rewards, persistence, assessments, and parent functionality are unchanged.
- Status: Applied

## Simplified Guided Journey remains protected for Phase 7B4

- Decision: activate Grade 3 Poetry Planet only through the canonical track registry and global planner; do not add child-facing world, chapter, unit, or lesson selection.
- Decision: preserve exactly two Home navigation controls, Start Journey and Parent Area, plus display-only world cards and one outcome action.
- Decision: classify `ELA.3.R.1.4` as IMPLEMENTED / DRAFT when all four required poem forms are authored and truth-gated; this is not learner mastery or human approval.
- Decision: teach free verse and rhymed verse without false absolutes, qualify the authored haiku's 5-7-5 pattern as a common English classroom example, and identify limericks through five lines, AABBA rhyme, and playful tone without advanced meter claims.
- Decision: Phase 7B is complete after Phase 7B4; Phase 7C remains unstarted.

## Phase 7C1 decisions

Decision: activate only `g3-information-detectives-reading` through the DRAFT Structure Station pack after verified Grade 2 Information Detectives completion. Reuse the existing informational renderer and add only timeline/sidebar feature variants plus optional `InformationalStructureGuide` metadata. Treat feature contribution and chronology/comparison/cause-effect organization as the complete Phase 7C1 boundary; keep central idea, author purpose, claim/evidence, vocabulary, across-genres, Grade 4, and timed FAST practice deferred.

Decision: preserve the simplified guided journey without exceptions. Structure Station is planner-selected through Start Journey or Continue Journey; Home retains exactly Start Journey and Parent Area, world cards remain display-only, and progression outcomes retain one child-facing action. Existing mastery thresholds, review intervals, rewards, persistence, Parent PIN, assessments, and planner priority are unchanged.

## Phase 7C2 decisions

Decision: implement `ELA.3.R.2.2` only through Central Idea Engine at `g3-id-unit-2`, reusing the active Grade 3 Information Detectives track and existing informational renderer. Extend the shared central-idea guide compatibly for Grade 3 section evidence rather than create a competing model. Treat topic, complete central idea, stated/inferred ideas, relevant/minor details, and support across sections as the complete scope; defer author purpose, author claims, vocabulary, across genres, Grade 4, and FAST practice.

Decision: preserve the simplified guided journey and all progression evidence rules. Central Idea Engine is planner-selected after Structure Station completion, remediation remains unit-affine, reviews remain separately identified by unit and version, and Home continues to expose only Start Journey and Parent Area.
