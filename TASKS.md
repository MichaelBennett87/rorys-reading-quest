# Rory's Reading Quest Tasks

## Milestones

- [x] Phase 0: foundation
  - [x] Repository scaffold and local safety constraints.
  - [x] AGENTS, README, and required docs created.
  - [x] Minimal shell rendered.
  - [x] Progression domain functions implemented.
  - [x] Content model and validation implemented.
  - [x] Required test coverage added.
  - [x] Verification commands run.
- [x] Phase 1: child shell and navigation
  - [x] Child home screen with rewards/status, map, and daily quest.
  - [x] World detail and unit-selection navigation.
  - [x] Lesson-ready placeholder route.
  - [x] Parent-area entry placeholder.
  - [x] Shared reusable UI components and screen-level styles.
  - [x] Local accessibility and keyboard interaction checks added.
  - [x] Phase 1 verification run.
- [x] Phase 2: lesson and question engine
  - [x] Introduce lesson session orchestration.
  - [x] Expand question and passage authoring structures.
  - [x] Add deterministic evaluator for five question types.
  - [x] Add lesson run, feedback, evidence, and completion result screens.
  - [x] Add and wire lesson validator extensions.
  - [x] Add focused lesson-domain and UI tests.
  - [x] Update architecture/content/product docs and phase report.
- [x] Phase 3: adaptive progression and persistence
  - [x] Adapt LessonResult percentages into validated checkpoint inputs.
  - [x] Require distinct activity IDs for independent mastery evidence.
  - [x] Add immutable skill progression, remediation return, fresh lesson planning, and spaced review.
  - [x] Add version-1 local persistence, bounded history, safe fallback, and active-session recovery.
  - [x] Make completion idempotent and persist deterministic XP and stars.
  - [x] Wire supportive progression outcomes and adaptive Continue Quest behavior.
  - [x] Add a telemetry-free local progress summary and focused test coverage.
- [x] Phase 4: sound-out support
  - [x] Add curated support metadata and validation for authored word-help targets.
  - [x] Add assistance-event tracking, summaries, and lesson-result integration.
  - [x] Add optional browser speech support and accessible word-help controls.
  - [x] Persist assistance with active sessions and completed attempts.
  - [x] Add focused support, persistence, and UI test coverage.
- [x] Phase 5: parent dashboard
  - [x] Phase 5A: analytics and parent-access foundation
  - [x] Phase 5B: complete dashboard, assessment entry, and print summary
    - [x] Phase 5B1: dashboard presentation and progress drill-downs
    - [x] Phase 5B2: assessment management, print summary, and Phase 5 completion
- [x] Phase 6: Grade 2 bridge content
  - [x] Phase 6A1: content framework and variable vowel teams `oo`/`ea`
  - [x] Phase 6A2: `ou`, `oi`, `oy`, and `ow`
  - [x] Phase 6B: two-syllable, open, closed, and consonant-`le`
    - [x] Phase 6B1: two-syllable words plus open and closed syllables
    - [x] Phase 6B2: consonant-`le` and final ELA.2.F.1.3c integration
  - [x] Phase 6C: prefixes, suffixes, silent letters, and fluency foundations
    - [x] Phase 6C1: common prefixes and Prefix Power
    - [x] Phase 6C2: common suffixes and final ELA.2.F.1.3d integration
    - [x] Phase 6C3: silent-letter combinations and ELA.2.F.1.3e
    - [x] Phase 6C4: fluency-practice foundations and final Phase 6C audit
  - [x] Phase 6D: Grade 2 prose and poetry
    - [x] Phase 6D0: multi-world and multi-skill progression foundation
    - [x] Phase 6D1: plot structure and main story elements
    - [x] Phase 6D2: theme
    - [x] Phase 6D3: character perspectives
    - [x] Phase 6D4: rhyme schemes, Poetry Planet, and final Phase 6D audit
  - [x] Phase 6E: informational reading and vocabulary
    - [x] Phase 6E0: Information Detectives and vocabulary-world foundation
    - [x] Phase 6E1: text features and ELA.2.R.2.1
    - [x] Phase 6E2: central idea and relevant details for ELA.2.R.2.2
    - [x] Phase 6E3: author's purpose for ELA.2.R.2.3
    - [x] Phase 6E4: opinion and supporting evidence for ELA.2.R.2.4
    - [x] Phase 6E5: academic-vocabulary practice and Context Cavern foundation
    - [x] Phase 6E6: morphology and ELA.2.V.1.2
    - [x] Phase 6E7: context, word relationships, reference materials, background knowledge, and final Phase 6E audit
  - [x] Phase 6F: across-genres reading and final Grade 2 audit
    - [x] Phase 6F0: Compare Castle and across-genres foundation
    - [x] Phase 6F1: similes, idioms, alliteration, and ELA.2.R.3.1
    - [x] Phase 6F2: literary and informational retelling for ELA.2.R.3.2
    - [x] Phase 6F3: paired-text comparison for ELA.2.R.3.3
    - [x] Phase 6F4: final Grade 2 audit and Phase 6 completion
- [x] Phase 6.5: live UX, phonics, data, and content-integrity hardening
- [x] Phase 6.6: dark experience, Sol Grade 2 audit, and final live acceptance
- [x] Historical guided child journey simplification, superseded by the current question-first contract
  - [x] Preserve the former Start Journey, Parent Area, and display-only map behavior in historical reports and regression provenance.
- [x] Question-first child experience
  - [x] Open the default route directly into a resumed or planner-selected current question with zero child navigation decisions.
  - [x] Use one primary `Check Answer` / `Next` action and remove Home, map, lesson-introduction, results, and progression-outcome detours from ordinary child use.
  - [x] Keep answer controls, guided teaching, fluency steps, local reference materials, and on-demand five-stage Word Help available.
  - [x] Autosave bounded ID-only response/session state and preserve exact recovery and exact-once completion.
  - [x] Move parent access to the separate PIN-gated `#/parent` bookmark route.
  - [x] Preserve canonical curriculum order, review, verification, remediation, safe recycling, and active-session priority.
- [x] P0 persisted learning-continuity hotfix
  - [x] Prove two distinct independent Word Forge successes survive cold page reopening and advance the correct difficulty.
  - [x] Preserve durable schema-v1 fields when only transient session, plan, or outcome data is malformed.
  - [x] Refuse future-schema, unreadable, and malformed-durable overwrites; verify writes by read-back.
  - [x] Reject stale-tab writes so an older page cannot roll back newer progress or rewards.
  - [x] Keep failed final-completion writes on a truthful retry path without losing or double-awarding the active session.
- [x] Phase 7: Grade 3 FAST-aligned content
  - [x] Phase 7A: Grade 3 foundations and transition
    - [x] Phase 7A0: Grade 3 architecture, standards map, FAST blueprint, and progression bridge
    - [x] Phase 7A1: Root Reactor
    - [x] Phase 7A1.5: Full Question Truth Audit and Feedback-State Correction
    - [x] Phase 7A2: Suffix Shifter
    - [x] Phase 7A3: Multisyllable Mountain
    - [x] Phase 7A4: Fluency Flight Grade 3
  - [x] Phase 7B: Grade 3 prose and poetry
    - [x] Phase 7B1: Character Arc Camp
    - [x] Phase 7B2: Theme Development Trail
    - [x] Phase 7B3: Perspective Portal Grade 3
    - [x] Phase 7B4: Poem Form Observatory
  - [x] Phase 7C: Grade 3 informational reading
    - [x] Phase 7C1: Structure Station
    - [x] Phase 7C2: Central Idea Engine
    - [x] Phase 7C3: Purpose Development Path
    - [x] Phase 7C4: Claim and Evidence Court
  - [x] Phase 7D: Grade 3 across genres and vocabulary
    - [x] Phase 7D1: Figurative Fortress
    - [x] Phase 7D2: Summary Stronghold
    - [x] Phase 7D3: Author Lens Tower
    - [x] Phase 7D4: Academic Word Workshop Grade 3
    - [x] Phase 7D5: Root Meaning Vault
    - [x] Phase 7D6: Meaning Maze
    - [x] Phase 7D7: final Grade 3 audit
- [ ] Phase 8: Grade 4 stretch content
  - [ ] Add stretch writing and evidence tasks.
- [ ] Phase 9: FAST-style practice mode
  - [ ] Add timed practice and mixed-question sessions.
- [ ] Phase 10: PWA, offline support, accessibility, and release hardening
  - [ ] Add installability, offline safeguards, and final accessibility pass.
# Phase 7B delivery status

- [x] Phase 7A
- [x] Phase 7B
- [x] Phase 7B1 - Character Arc Camp
- [x] Phase 7B2 - Theme Development Trail
- [x] Phase 7B3 - Perspective Portal Grade 3
- [x] Phase 7B4 - Poem Form Observatory
- [x] Phase 7C
- [x] Phase 7C1: Structure Station
- [x] Phase 7C2: Central Idea Engine
- [x] Phase 7C3: Purpose Development Path
- [x] Phase 7C4: Claim and Evidence Court
- [x] Phase 7D
- [x] Phase 7D1: Figurative Fortress
- [x] Phase 7D2: Summary Stronghold
- [x] Phase 7D3: Author Lens Tower
- [x] P0 production hotfix: keep finite guided tracks live through deterministic recycling and preserve explicit Grade 3 Fluency Flight chapter completion
- [x] P0 production hotfix: preserve unit-affine spaced-review purpose through launch, save, reload, and exact review-only completion after track advancement or completion
- [x] Phase 7

The repository-level Phase 7D7, Phase 7D, and Phase 7 audit work is complete. Remote synchronization and deployed-browser acceptance remain final release gates and are recorded in the external completion report. Grade 3 curriculum coverage is complete at DRAFT repository level; learner mastery, educator approval, Florida approval, FAST certification, and FAST prediction are not inferred. Phase 8, Phase 9, and Phase 10 remain unstarted.


### Phase 7D4 completion checkpoint

- [x] Activate Grade 3 Context Cavern only after Unit 1 production content exists and Grade 2 Context Cavern is complete.
- [x] Add seven Academic Word Workshop lessons, seven texts, seven guides, 28 academic targets, 41 questions, and 28 Word Help targets.
- [x] Preserve P0 planner liveness, the one-button journey, schema v1, rewards, review intervals, Parent PIN behavior, and assessments.
- [x] Record ELA.3.V.1.1 as SUPPORTIVE_PRACTICE / DRAFT without speaking, writing, or open-response mastery claims.
- [x] Complete Phase 7D5 Root Meaning Vault without beginning Meaning Maze.

### Phase 7D5 completion checkpoint

- [x] Add seven Root Meaning Vault lessons, seven original texts, seven guides, 28 meaning targets, 41 questions, and 28 Word Help targets.
- [x] Preserve the exact 7 Greek / 7 Latin / 7 prefix-plus-base / 7 base-plus-suffix distribution with no target substitution.
- [x] Prove genuine morpheme boundaries, transparent composition, context confirmation, and meaning-versus-pronunciation separation.
- [x] Advance Grade 3 Context Cavern from Unit 1 into Unit 2 while leaving difficulty 3 as genuine CONTENT_NEEDED.
- [x] Preserve P0 planner liveness, one-button launch, exact-once rewards, schema v1, Parent PIN, assessments, and review isolation.
- [x] Record ELA.3.V.1.2 as IMPLEMENTED / DRAFT without learner-mastery, decoding-mastery, pronunciation, or FAST claims.
- [x] Complete Phase 7D6 Meaning Maze without beginning the final Grade 3 audit.

### Phase 7D6 completion checkpoint

- [x] Add seven Meaning Maze lessons, seven original sources, seven guides, 28 meaning targets, 41 questions, and 28 Word Help targets.
- [x] Cover all eight ELA.3.V.1.3 patterns as IMPLEMENTED / DRAFT without inferring learner mastery.
- [x] Complete Grade 3 Context Cavern curriculum progression at difficulty 4 while preserving P0 planner liveness and the one-button child journey.
- [x] Preserve schema-v1 storage, Parent PIN, assessments, rewards, reviews, privacy, and accessibility contracts.
- [x] Complete Phase 7D7 final Grade 3 audit without adding or removing learner curriculum.

### Phase 7D7 completion checkpoint

- [x] Audit all 16 Grade 3 inventory rows, all 18 Grade 3 packs, and all 725 Grade 3 questions.
- [x] Reconcile all 1,614 active questions to one current PASS truth record each.
- [x] Preserve the frozen Grade 2 inventory, P0 planner liveness, Grade 3 Fluency Flight completion, and one-button journey.
- [x] Verify schema-v1 persistence, Parent PIN separation, assessments, parent reporting, print privacy, accessibility, and completion-state copy.
- [x] Keep Phase 8 Grade 4 architecture, Phase 9 FAST-style practice, and Phase 10 PWA/release hardening unstarted.

## Post-Phase-7 P0 semantic answer-uniqueness audit

- [x] Complete the all-active-question semantic answer-uniqueness audit and corrections.
- [x] Reconcile the current 1,611 questions and 2,382 response slots through frozen key-free review, option-level challenge, and the required deterministic second pass.
- [x] Pass the separate semantic release gate with 1,611 current semantic PASS records and zero unresolved findings.
- [x] Publish the semantic-correction and question-first foundation before the comprehension-first policy change.

Current semantic checkpoint: all 1,611 blind conclusions are frozen, 42 current questions have correction provenance, all 323 required second-pass records are covered by 343 current records across 40 packs and 191 pack/type strata, and the semantic gate reports PASS with zero issues. Review provenance is same-conversation primary-agent work under the no-subagent policy, not independent-agent approval. See `docs/P0_SEMANTIC_ANSWER_UNIQUENESS_AUDIT.md` and `docs/content/answer-uniqueness-ledger/AUDIT_PROGRESS.md`. Phase 7 remains complete historically. Phase 8, Grade 4, FAST timed practice, and Phase 10 remain unstarted.

## Comprehension-first learning journey

- [x] Make Grade 2 Story Scouts the fresh-learner entry and establish the twelve-stage comprehension-first ordinary-progression order.
- [x] Preserve same-domain Grade 3 prerequisites while removing unrelated Word Forge completion as an earlier-stage blocker.
- [x] Defer rather than discard a compatible unfinished Word Forge session, its plans, reviews, evidence, attempts, XP, stars, PIN, and assessments.
- [x] Revise all three opening Story Map checkpoints to one coherent two-paragraph story with six passage-dependent questions.
- [x] Reconcile all changed question fingerprints, blind conclusions, second-pass records, truth ledgers, evaluator contracts, and active totals.
- [x] Publish only after the complete release gate and isolated deployed-browser acceptance pass.

## P0 false Reading Rest topic-handoff repair

- [x] Reproduce and correct the declined-completion path that cleared an authoritative session and persisted false `CONTENT_NEEDED` without an attempt or reward.
- [x] Reconcile and persist the same normalized post-completion state used to choose the next global activity.
- [x] Restrict verification and remediation unit/version affinity to a completed attempt from the same skill and difficulty.
- [x] Recover stored false no-content plans automatically and recheck genuine idle pages on foreground, page restoration, and newer same-origin storage events without polling.
- [x] Derive launchability coverage for every current track, ordinary difficulty, topic handoff, and genuine final-completion boundary while preserving comprehension-first ordering and deferred Word Forge history.

## Native browser release gate

- [x] Promote the accepted native Edge harness into repository-owned, lockfile-managed infrastructure without adding a production dependency.
- [x] Bind local and deployed browser evidence to a full source SHA, complete production-file hashes, and a manifest digest.
- [x] Require the seven-completion comprehension journey and real Edge process restarts with one isolated persistent profile.
- [x] Require remediation, stranded-save, historical-review, persistence-failure, stale-state, rejected-completion, genuine-completion, all-question-type, parent/print, and responsive scenarios.
- [x] Make missing Edge, zero scenarios, skipped required scenarios, deliberate assertion failure, or artifact mismatch fail closed.
- [x] Enforce quality plus one build, native acceptance, exact-artifact Pages deployment, and separate deployed acceptance in the Pages workflow.
- [x] Keep generated profiles, answer-driving fixtures, screenshots, and reports outside Git and the Pages artifact.

## P0 same-session stale-checkpoint authority

- [x] Bind each active-session proposal to the checkpoint revision that produced the learner action.
- [x] Reject stale, future, malformed, identity-mismatched, regressive, and lower-information checkpoint transitions without changing durable bytes.
- [x] Return and adopt the authoritative session after a conflict so a second action from the obsolete rendering cannot roll progress backward.
- [x] Coordinate cooperating same-origin production writers with a short exclusive Web Lock and fail closed when that capability is unavailable.
- [x] Protect final completion, review identity, assistance, fluency state, attempts, and exact-once rewards with the same authority contract.
- [x] Preserve schema version 1, existing storage keys, legacy sessions, curriculum, Parent PIN records, and assessments.
- [x] Retain the native stale-state release scenario and expand it to two rejected writes, a fresh recovered action, and a real browser-process restart.

Release acceptance remains SHA-specific: this checklist does not replace `npm run verify:release`, the exact-artifact Pages workflow, or deployed-browser verification.

## iPad and WebKit release compatibility

- [x] Parameterize the repository-owned acceptance harness for native Edge and actual pinned Playwright WebKit without introducing a second browser framework.
- [x] Require iPad touch emulation, rapid-tap safety, all question controls, real Web Locks behavior, page restoration, unsupported-capability handling, and same-origin release upgrades in WebKit.
- [x] Preserve isolated persistent profiles and real browser-process restarts without exporting or reinjecting storage.
- [x] Require both native Edge and macOS WebKit acceptance before Pages deployment, then run exact-release deployed acceptance in both engines.
- [x] Keep missing browsers, missing scenarios, skipped scenarios, artifact mismatch, and browser assertions fail-closed.
- [x] Preserve curriculum, semantic ledgers, progression, rewards, reviews, schema version 1, Parent PIN records, and assessments.

Playwright WebKit on macOS with an iPad descriptor is required automated Safari-relevant coverage. It is not physical-iPad, shipping-Safari, VoiceOver, or Rory-device certification. Release acceptance remains source-SHA and artifact-digest specific.

## Parent-enabled Read & Write pilot

- [x] Keep the six supplemental DRAFT activities separate from the 1,611 scored reading questions.
- [x] Add bounded normalized-ink capture, keyboard fallback, transcription confirmation, and parent-review fallback.
- [x] Keep writing records in a separate versioned store with retention, record, stroke, point, revision, and late-response limits.
- [x] Add PIN-gated Writing Review controls for consent, transcription correction, suggestion disposition, review status, deletion, and external disablement.
- [x] Add a fixed protected-service contract with server-owned rubrics, installation authorization, approved-retention checks, request deduplication, and finite budget enforcement.
- [x] Add provider safety-body validation, generated-feedback safety checks, observed-usage cost reconciliation, payload-bound idempotency, a durable single-instance reservation ledger, and Edge/WebKit real-local-service authorization coverage.
- [x] Require the mocked, synthetic `read-write-pilot` scenario in Edge and WebKit release reports.
- [ ] Deploy and review a protected inference service outside GitHub Pages.
- [ ] Verify the selected provider project's applicable child-data retention approval; `store: false` alone is not approval.
- [ ] Configure a finite parent-approved service budget and approved-installation issuance/revocation.
- [ ] Run one authorized live canary with non-child synthetic ink and record actual observed recognition/evaluation errors and spend.

External status: `EXTERNAL ACTIVATION PENDING`. Ordinary reading remains fully local and available with the pilot disabled.
