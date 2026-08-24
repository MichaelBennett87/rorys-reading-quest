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
- The active Grade 2 bridge packs now total twenty-two registered packs, 154 lessons, 161 passages, 889 questions, and 614 support targets, with the legacy development pack still preserved for recovery and history.
- `planUnitQuest` keeps selected-unit planning unit-aware so fresh content and active-session recovery do not silently cross from one Word Forge trail to another.
- The active Grade 2 bridge packs cover `oo`, `ea`, `ou`, `oi`, `oy`, and `ow` across Phase 6A1 and Phase 6A2, implement `ELA.2.F.1.3b` in DRAFT form in Phase 6B1, implement `ELA.2.F.1.3c` in DRAFT form across Phase 6B1 and Phase 6B2, implement `ELA.2.F.1.3d` in DRAFT form across Phase 6C1 and Phase 6C2, implement `ELA.2.F.1.3e` in DRAFT form in Phase 6C3, provide `ELA.2.F.1.4` as supportive practice only in Phase 6C4, implement `ELA.2.R.1.1`, `ELA.2.R.1.2`, and `ELA.2.R.1.3` in DRAFT form across Phases 6D1 through 6D3, implement `ELA.2.R.1.4` in DRAFT form in Phase 6D4, and implement `ELA.2.R.2.1`, `ELA.2.R.2.2`, `ELA.2.R.2.3`, and `ELA.2.R.2.4` in DRAFT form in Phases 6E1 through 6E4 while implementing `ELA.2.V.1.1` in DRAFT form in Phase 6E5, implementing `ELA.2.V.1.2` in DRAFT form in Phase 6E6, and implementing `ELA.2.V.1.3` in DRAFT form in Phase 6E7 while keeping Fluency Flight free of oral measurement. Phase 6E0 keeps Information Detectives and Context Cavern as planned shells only so they do not affect active totals before content exists.
- Phase 6D0 adds curriculum-track registry, playable-track discovery, and safe multi-skill initialization so later prose, poetry, and informational packs can land without relying on object insertion order or Word Forge-specific assumptions. Phase 6D1 uses that foundation to activate Story Scouts, Phase 6D2 adds unit-affine Story Map and Theme Trail review scheduling so same-skill units do not steal one another's reviews, Phase 6D3 extends that review affinity to Perspective Portal and preserves the existing Story Scouts unit boundaries, Phase 6D4 activates Poetry Planet with the same deterministic planning and world-gating rules, Phase 6E1 activates Information Detectives Text Feature Hunt with the same deterministic planning and world-gating rules, Phase 6E2 adds Central Idea Center while preserving unit-specific review, remediation, and completion labeling, Phase 6E3 adds Purpose Path while preserving the same unit-specific review, remediation, and completion labeling, and Phase 6E4 adds Opinion & Evidence Desk while preserving the same unit-specific review, remediation, and completion labeling, Phase 6E5 adds Academic Word Workshop while preserving the same Context Cavern unit boundaries, Phase 6E6 adds Morphology Mine while preserving the same Context Cavern unit boundaries, and Phase 6E7 adds Meaning Clue Chamber while preserving the same Context Cavern unit boundaries.
- Lesson ownership now comes from catalog metadata, not brittle lesson-ID prefixes, so unit gating and recovery stay aligned as later packs land.
## Phase 6F0 architecture boundary

Compare Castle becomes active in Phase 6F1. The shared curriculum architecture reserves `g2-across-genres-reading` for `compare-castle` with three Compare Castle units that activate in sequence across Phase 6F1, Phase 6F2, and Phase 6F3. Phase 6F3 adaptive-planning boundary: Compare Castle is active only when Wordplay Watchtower, Retell Hall, and Compare Keep exist, and the planner keeps later Phase 6F4 audit work separate from the production units. Phase 6F4 completes the final Grade 2 audit and Phase 6 completion, and Phase 7 remains next.

- `cg-unit-1` Wordplay Watchtower for `ELA.2.R.3.1` (active in DRAFT)
- `cg-unit-2` Retell Hall for `ELA.2.R.3.2` (active in DRAFT)
- `cg-unit-3` Compare Keep for `ELA.2.R.3.3`

Phase 6F0 adds no production lessons and no new persistence behavior. Phase 6F1 adds the first active Compare Castle content pack, Wordplay Watchtower, Phase 6F2 adds Retell Hall, and Phase 6F3 adds Compare Keep while Phase 6F4 completes the final audit boundary and Phase 6 completion.

The retell boundary remains structured and authored rather than oral or free-response scoring. The paired-text boundary is now active in Compare Keep while remaining limited to two texts and structured authored selected response. The figurative-language boundary remains limited to similes, idioms, and alliteration.

## Phase 6.5 operational hardening

Phase 6.5 keeps the existing architecture and applies only bounded fixes. Parent accuracy uses one percent contract, production rewards start at zero, the known demo baseline is cleaned up once for legacy saves, and the active Grade 2 semantic audit targets the production slice without adding new persistence fields or services.

The registry-wide semantic layer now verifies lesson/question ownership, passage membership, source text, evidence scope, answer resolution, cardinality, retell pieces, paired-text evidence, and explanation stability across all active packs. Browser speech support uses separate authored request sequences for parts, blending, whole-word, and sentence support. The child and parent visual systems are CSS/component presentation layers only; progression, persistence, scoring, mastery thresholds, and review intervals remain unchanged.

## Phase 7A0 multi-grade track architecture

Curriculum tracks now carry immutable grade band, completion difficulty, prerequisite track IDs, and per-world chapter order. A world can own multiple tracks; runtime ownership resolves by exact skill, unit, or track ID. `getTrackByWorldId` remains only a documented Grade 2 compatibility helper, while `getTracksByWorldId` supplies deterministic grade/chapter/curriculum ordering.

Readiness requires both active progression content and completed same-domain prerequisites. Planned Grade 3 metadata therefore cannot initialize progress, create content-needed noise, or appear in production child, parent, or print surfaces. Lesson grade band derives from the content-pack manifest and is validated against passage and question grade bands. Persistence schema and storage keys remain unchanged.

## Phase 7A1 Root Reactor architecture

`g3-word-forge-root-reactor` is the first active Grade 3 pack and remains owned by `g3-word-forge-word-analysis`, `g3-wg-unit-1`, and content version `g3-wf-root-reactor-r0.1.0`. Optional `rootDecodingGuides` stay inside immutable curriculum data. Validation checks passage ownership, target occurrence, meaningful-part and reading-chunk reconstruction, classical-part links, and one-to-one Word Help ownership. Guide data is never copied into persistence. The Grade 3 chapter is derived only when active content exists, remains prerequisite-locked until Grade 2 Word Forge reaches its completion boundary, and does not initialize unrelated Grade 3 skills.

## Phase 7A1.5 question truth and feedback architecture

- `questionTruthAudit.ts` derives the active audit inventory from production packs and active lesson ownership. It also creates a key-free blind projection and a deterministic fingerprint over the owning pack, lesson, displayed texts, and question.
- `questionGradingContract.ts` builds canonical, canonical-equivalent, and question-type-specific adversarial submissions. Tests route all of them through production `evaluateAnswer` and assert that authored questions remain immutable.
- Table-match evaluation now requires the exact known row set, valid option IDs, complete mappings, and unique choices in `use_each_once` mode. Extra or unknown mappings cannot be silently ignored.
- Answer presentation is derived after evaluation. Pre-submit selection is neutral; post-submit correct, incorrect, and correct-answer reveal states are passed to all five renderers without mutating question content or persistence.
- Per-pack JSON ledgers under `docs/content/question-truth-ledger/` contain curriculum data and concise audit conclusions only, never learner data or hidden reasoning.

## Phase 7A2 derivational-suffix architecture

`ContentPack.derivationalSuffixGuides` is optional, immutable authored curriculum metadata. Each guide binds one source passage to four transparent base/derived pairs, suffix identity, base and derived sentence roles, meaningful chunks, pronounceable reading chunks, an authored transformation explanation, DRAFT state, and content version. Pack audit validates sentence ownership, exact reconstruction, role/suffix compatibility, Word Help affinity, safe text, and non-persistence.

Progression keeps the shared `g3-word-forge-word-analysis` skill while resolving unit and content-version affinity exactly. Verification, remediation, and review remain pinned to their source unit. A true `ADVANCE` intentionally releases the completed unit affinity so difficulty 1 Root Reactor can transition to difficulty 2 Suffix Shifter; difficulty 2 completion reaches structured `CONTENT_NEEDED` at the deferred difficulty 3 roadmap boundary.

## Phase 7A3 multisyllable-decoding architecture

`ContentPack.multisyllableDecodingGuides` is optional and curriculum-only. Each DRAFT guide owns one passage and four targets. A target stores its written word, source sentence, authored pronunciation chunks, one pattern label per chunk, optional morphology clues, decoding steps, whole-word speech text, review status, and content version. Pack-scoped validation checks source ownership, chunk reconstruction, all six bounded patterns, Word Help alignment, exact pack shape, checkpoint constructs, and forbidden coverage claims. No guide field enters schema-version-1 learner persistence.

At the Phase 7A3 checkpoint, the existing grade-aware planner activates `g3-wg-unit-3` at difficulty 3 and keeps exact unit/content-version affinity for verification, remediation, and reviews. A true advance moves the shared Grade 3 Word Forge skill to difficulty 4, releases completed-unit affinity, and returned structured `CONTENT_NEEDED` while Fluency Flight Grade 3 had no production content. Parent and print presentation distinguish implemented DRAFT curriculum coverage from learner mastery. Phase 7A4 supersedes only that deferred-content boundary as described below.

## Phase 7A4 Grade 3 fluency architecture

Grade 3 Fluency Flight reuses the established `FLUENCY_PRACTICE` role, `FluencyPracticeBlock`, `FluencyPracticeScreen`, optional local model-read action, phrase-group rendering, reflection state, and supportive completion path. No second fluency runtime or persisted guide model was introduced. The seven lesson blocks are authored curriculum-only guides and remain outside schema-version-1 persistence.

`completeFluencyPractice` accepts the exact owning track completion difficulty. Grade 2 retains its existing behavior. Grade 3 difficulty-4 practice selects fresh unit-affine activities until exhaustion, then moves the chapter to completion difficulty 5 while preserving `lastMasteredDifficulty` and the `FLUENCY_PRACTICE` learning state. This is chapter completion, not oral mastery evidence. Grade 2 and all four Grade 3 Word Forge review identities remain exact by grade, skill, unit, and content version.

The Grade 3 coverage snapshot records `ELA.3.F.1.4` as `supportive_practice` only after the active pack supplies all five expected support patterns. Parent and print notes identify both Grade 2 and Grade 3 fluency as practice-only and explicitly retain the no-oral-measurement boundary.
## Phase 7B1 character-development architecture

`ContentPack.characterDevelopmentGuides` is optional and nonpersisted. A guide owns one passage and one or two character arcs. Each arc owns ordered beginning, middle, and end stages, typed evidence kinds, resolved turning-point IDs, a plot-cause statement, and a multi-stage development summary. The pack-specific audit rejects unresolved evidence, repeated stages, static-trait-only summaries, missing checkpoint action/dialogue/thought coverage, unsafe text, wrong versions, or shape drift.

`g3-story-scouts-prose` uses the existing multi-grade readiness, world chapter, selected-unit planner, review affinity, active-session, dashboard, and print architecture. It adds no new persistence object or question evaluator.

## Phase 7B2 theme-development architecture

`ContentPack.themeDevelopmentGuides` is optional, immutable, and nonpersisted. One guide owns each Theme Development Trail passage, a topic label, one supported complete theme, bounded plausible distractors, ordered beginning/middle/end stages, turning-point evidence, character and conflict connections, and a multi-stage development summary. Pack audit rejects topic-only themes, summary-only themes, commands, unresolved evidence, equal second themes, unsafe text, wrong versions, or missing stage contribution.

The existing Grade 3 Story Scouts track now resolves unit 2 at difficulty 2. Unit-owned remediation may expose difficulty-1 Theme Trail Power-Up missions without unlocking the unit for ordinary progression. Registry-derived coverage, parent/print wording, permanent truth ledgers, evaluator contracts, feedback states, selected-unit planning, review affinity, and schema-version-1 persistence remain shared rather than duplicated.

## Phase 7B3 character-perspective architecture

`ContentPack.characterPerspectiveGuides` is optional, immutable, and nonpersisted. One guide owns each Perspective Portal passage, at least two character states toward a shared situation, typed evidence and motivations, one text-supported comparison, optional perspective-change records, and important evidence IDs. Pack audit rejects unresolved evidence, feeling-only or trait-only viewpoints, narrator or author perspective substitution, unsupported comparison sides, wrong versions, unsafe text, or relationship-count drift.

The existing Grade 3 Story Scouts track resolves unit 3 at difficulty 3. Perspective-owned difficulty-2 remediation remains unit-affine; two distinct independent strong checkpoints advance the shared track to completion difficulty 4 without creating poetry content. Registry coverage, permanent truth ledgers, the production evaluator, child feedback, parent/print reporting, schema-version-1 persistence, and active-session safeguards remain shared architecture rather than parallel implementations.

## Simplified guided child journey architecture

`AppShell` now exposes only `home`, `lesson_run`, `progression_outcome`, and `parent_gate` in the normal application state. Home renders a display-only journey map and exactly two navigation controls: `Start Journey` and `Parent Area`. `WorldScreen`, `UnitSelectScreen`, `LessonReadyScreen`, and `planUnitQuest` remain reusable/tested capabilities, but the child shell has no route to them and stores no selected world or unit.

`planGlobalQuest` remains the sole child lesson-selection authority. Active-session recovery, stored urgent plans, due reviews, verification, and remediation retain their established priority. Only ordinary fresh progression changes: it selects the first incomplete playable track by canonical `curriculumOrder`, refuses to bypass an exhausted required track, and proceeds to the next track only after the current track reaches its existing `completionDifficulty`. Completion results are reconciled through the same global planner so the single `Continue Journey` action launches the already-selected next lesson, including cross-world transitions. Schema version 1, storage keys, curriculum packs, scoring, mastery evidence, review timing, rewards, and parent analytics are unchanged.

## Phase 7B4 architecture

`ContentPack.poemFormGuides` adds authored, non-persisted form evidence for Grade 3 poetry. `buildPoemFormGuideAudit` validates guide ownership, form distribution, line and stanza claims, rhyme evidence, qualified classroom-haiku metadata, limerick AABBA structure, lesson roles, checkpoint coverage, and exact pack counts. The existing PoemCard renderer, evaluator, review planner, persistence layer, and guided child state machine are reused unchanged. Grade 3 Poetry Planet is activated in the canonical curriculum track registry and remains planner-selected rather than child-selected.

## Phase 7C1 informational-structure architecture

Structure Station reuses `InformationalTextCard`, passage evidence resolution, lesson catalog, global planning, review affinity, parent reporting, and print privacy. `ContentPack` may now include DRAFT `informationalStructureGuides`; the informational feature union adds accessible timelines and sidebars. Validation and pack audit bind every guide, feature contribution, structure-evidence record, and source ID without persisting or printing guide content. The protected child route remains `home`, `lesson_run`, `progression_outcome`, and `parent_gate`; Home retains only Start Journey and Parent Area.

## Phase 7C2 central-idea architecture

Central Idea Engine extends the existing optional `CentralIdeaGuide` compatibly with section-owned relevant and minor details, section-contribution records, and a synthesis statement. `buildCentralIdeaEngineGuideAudit` enforces the exact seven-text pack shape, stated/inferred balance, cross-section evidence, complete-thought central ideas, and topic/summary/minor-detail boundaries. The existing informational renderer, evaluator, review affinity, planner, persistence schema, parent reporting, print privacy, and four-state guided child route are reused unchanged.

## Phase 7C3 journey recovery and content integration

`useQuestProgress.prepareJourneyLaunch` is the authoritative child-launch transition shared by Start Journey and Continue Journey. It reads the latest state reference, rejects active sessions whose session identity is already complete, validates compatibility, normalizes stored planning, replans against the current registry, and creates at most one new session. The rendered progression outcome remains a presentation snapshot rather than launch authority. Late checkpoints return an ignored result when their identity is complete or stale.

Purpose Development Path reuses the existing Information Detectives renderer and lesson/evaluator pipeline. Its optional AuthorPurposeGuides are authored registry metadata only and are excluded from version-1 persistence and print output.
