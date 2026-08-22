# Architecture (Phase 3)

## Presentation and Application Layer

- `src/app/AppShell.tsx` owns explicit local navigation, including `progression_outcome`.
- `src/app/useQuestProgress.ts` is the small application coordinator. It loads progress, resumes safe sessions, invokes pure progression, commits completion idempotently, saves local state, and plans Continue Quest.
- `src/screens/LessonScreen.tsx` owns question interaction only. It emits submitted-question checkpoints and one explicit completed `LessonResult` callback.
- `src/screens/ProgressionOutcomeScreen.tsx` maps structured outcomes to supportive child-safe copy without exposing reason codes.
- Phase 4 adds `src/components/wordSupport/*` for authored word-help controls and `src/services/speech/*` for an optional browser-speech boundary.

## Pure Domain Layer

- `lessonResultToCheckpoint.ts` validates a completed result, converts accuracy from `0-100` to `0-1`, and computes first-attempt accuracy.
- `applyLessonResult.ts` coordinates checkpoint evaluation, distinct activity evidence, immutable skill-state updates, remediation routing, and next-quest planning.
- `selectNextLesson.ts` filters by skill, difficulty, and purpose; excludes recent activity IDs and immediate passage-question reuse; then chooses deterministically.
- `reviewSchedule.ts` retains the `1, 3, 7, 14, 30` day sequence and uses supplied timestamps through the coordinator.
- Assistance is now a first-class local contract. Lesson results carry a privacy-safe assistance summary; assistance events are deterministic and idempotent; and any used help suppresses independent mastery evidence.

## Persistence Layer

- `src/persistence/*` contains schema types, default state, validation, localStorage adapter, active-session reconstruction, idempotent completion, and local summary functions.
- Storage key: `rorys-reading-quest.progress.v1`.
- Schema: version `1` only; invalid, unavailable, throwing, or unsupported storage falls back to fresh in-memory progress without crashing.
- Loading malformed storage never overwrites it. Incompatible active-session data is discarded independently while completed progress remains intact.
- Completed attempts are capped at 250; recent activity usage is capped at 12 entries per trail.
- Active sessions now also carry bounded assistance events so a compatible reload keeps the already-requested word help attached to the lesson state.

## Boundaries

- No router, state-management library, persistence dependency, IndexedDB, backend, cloud sync, telemetry, live AI, external speech provider, microphone capture, parent dashboard, service worker, or PWA behavior was added.
- All content remains local and DRAFT.

## Phase 5A Parent Foundation

- `src/domain/dashboard/*` stays pure and derives parent-readable summaries from canonical child progress, current content metadata, and an injected timestamp.
- `src/services/parentAccess/*` wraps browser Web Crypto for PBKDF2-based local PIN setup and verification, with a safe unavailable fallback when crypto is missing.
- `src/persistence/parentAccessStore.ts` and `src/persistence/parentRecordsStore.ts` keep parent access and official assessment records separate from child progress.
- `src/screens/ParentPlaceholderScreen.tsx` now serves as the minimal authenticated parent foundation screen and lock gate.
- Child progression, rewards, assistance, and recovery remain owned by the existing child-progress store and are not altered by parent-state loading failures.

## Phase 5B1 Parent Dashboard Presentation

- `src/screens/parent/ParentDashboardScreen.tsx` consumes the existing `DashboardSnapshot` contract and renders the authenticated parent overview, progress drill-downs, recent sessions, reviews, word-help summaries, and the read-only assessments placeholder.
- `src/components/parent/*` provides small reusable presentation primitives for headers, navigation, metric cards, data notes, empty states, status badges, and accuracy meters.
- Skill summaries and print summaries can display multiple benchmark references when a skill spans more than one benchmark.
- The dashboard is responsive and local-only, with no new persistence layer, charting dependency, router, or mutation path added.

## Phase 5B2 Parent Dashboard Completion

- `src/screens/parent/ParentAssessmentsView.tsx` owns the authenticated assessment-management UI. It keeps local form state, renders create/edit/delete flows, and delegates storage mutations through callbacks owned by the parent gate.
- `src/screens/parent/ParentPrintSummaryView.tsx` renders the print-ready parent summary from `DashboardSnapshot` and `ParentRecordsState`, then calls the injected browser print service only after an explicit parent action.
- `src/screens/ParentPlaceholderScreen.tsx` remains the single owner of parent-access state, parent-record state, and transactional persistence. Assessment mutations and print actions never touch child progress.

## Phase 6A1 through Phase 6C3 Grade 2 Content Pack Architecture

- `src/domain/content/packs/*` registers local content packs so the bridge curriculum can grow in bounded units without breaking existing imports.
- `sampleContent` now aggregates registered packs, while legacy lesson IDs remain resolvable for recovery and history.
- `GUIDED_PRACTICE` lessons can include teaching blocks before scored questions; `CHECKPOINT` lessons remain fresh, scored progression material.
- The benchmark-pattern catalog is benchmark-specific, so `ELA.2.F.1.3a`, `ELA.2.F.1.3b`, `ELA.2.F.1.3c`, and `ELA.2.F.1.3d` can each report their own expected patterns and coverage status.
- The active Grade 2 bridge packs now total eleven registered packs, 77 lessons, 77 passages, 438 questions, and 306 support targets, with the legacy development pack still preserved for recovery and history.
- `planUnitQuest` keeps selected-unit planning unit-aware so fresh content and active-session recovery do not silently cross from one Word Forge trail to another.
- The active Grade 2 bridge packs cover `oo`, `ea`, `ou`, `oi`, `oy`, and `ow` across Phase 6A1 and Phase 6A2, implement `ELA.2.F.1.3b` in DRAFT form in Phase 6B1, implement `ELA.2.F.1.3c` in DRAFT form across Phase 6B1 and Phase 6B2, implement `ELA.2.F.1.3d` in DRAFT form across Phase 6C1 and Phase 6C2, implement `ELA.2.F.1.3e` in DRAFT form in Phase 6C3, provide `ELA.2.F.1.4` as supportive practice only in Phase 6C4, and implement `ELA.2.R.1.1`, `ELA.2.R.1.2`, and `ELA.2.R.1.3` in DRAFT form across Phases 6D1 through 6D3 while keeping Fluency Flight free of oral measurement.
- Phase 6D0 adds curriculum-track registry, playable-track discovery, and safe multi-skill initialization so later prose and poetry packs can land without relying on object insertion order or Word Forge-specific assumptions. Phase 6D1 uses that foundation to activate Story Scouts, Phase 6D2 adds unit-affine Story Map and Theme Trail review scheduling so same-skill units do not steal one another’s reviews, Phase 6D3 extends that review affinity to Perspective Portal and preserves the existing Story Scouts unit boundaries, and Phase 6D4 activates Poetry Planet with the same deterministic planning and world-gating rules.
- Lesson ownership now comes from catalog metadata, not brittle lesson-ID prefixes, so unit gating and recovery stay aligned as later packs land.
