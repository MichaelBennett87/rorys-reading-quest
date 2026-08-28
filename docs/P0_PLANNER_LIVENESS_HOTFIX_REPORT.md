# P0 Planner Liveness Hotfix Report

## Scope and release boundary

This hotfix begins from synchronized local and remote SHA 61c67932fd38f5130950768c058e41c4905590ef. It changes planner selection, tests, runtime outcome wording, and documentation only. It adds or removes no curriculum pack, lesson, passage, question, support target, truth-ledger record, benchmark status, or roadmap phase. Phase 7D3 Author Lens Tower remains unstarted.

## Observed deployed failure

The human playtest showed 400 XP, 10 stars, a four-session streak, four completed quests, and Current path: Story Scouts Prose Trail 1, Level 1. Start Journey opened More Quests Are Being Prepared with zero earned XP, zero earned stars, Trail 1, and Back Home as the only action. Back Home returned to the same incomplete Story Scouts state.

This is distinct from the earlier Phase 7C3 stale-session defect. The earlier repair reconciles completed and incompatible active sessions, duplicate completion, late checkpoints, stale plans, exact-once rewards, and the shared Start/Continue launcher. Those protections remain unchanged.

## Deterministic pre-fix reproduction

The reproduction derived production IDs from the active registry. Story Scouts difficulty 1 had five authored activities: three ss-unit-1 checkpoints eligible for progression, verification, and review, plus two ss-unit-2 prerequisite activities eligible for remediation and review. The deployed-equivalent state used currentLearningState CHECKPOINT, currentDifficulty 1, lastMasteredDifficulty 0, four completed attempts, no active session, 400 XP, 10 stars, completedSessionCount 4, later playable tracks, and recent usage containing all three compatible progression checkpoints.

Five expected-AVAILABLE assertions failed before production changes:

1. The exact screenshot/global ordinary plan returned CONTENT_NEEDED.
2. Direct ordinary progression exhaustion returned CONTENT_NEEDED.
3. Verification exhaustion returned CONTENT_NEEDED.
4. Assisted verification exhaustion returned CONTENT_NEEDED.
5. A new activity with unavoidable passage-question overlap returned CONTENT_NEEDED.

selectNextLesson reported: No fresh lesson remains without repeating a recent activity or passage-question pair.

planGlobalQuest reported: No fresh quests remain for Story Scouts Prose.

The difficulty-99 control with no compatible authored candidate continued to return CONTENT_NEEDED, proving that fail-closed boundary behavior itself was not the defect.

## Proven root cause

The global planner correctly selected the first incomplete playable track by curriculum order and correctly refused to bypass Story Scouts. The failure occurred inside that required track. selectNextLesson first applied legitimate compatibility filters, then treated every activity ID in recentActivityUsage and every overlap with the last passage-question set as unavailable. recentActivityUsage is append-ordered and bounded at 12 entries. When all three compatible Trail 1 checkpoints appeared in that history, no selectable candidate remained. planGlobalQuest tried ordinary progression only for Story Scouts, received the false freshness exhaustion, and converted it into a child-facing content-needed outcome. Stored content-needed normalization worked, but immediate replanning recreated the same false result.

No purpose, learning-state, unit, version, evidence, assistance, active-session, registry-ownership, or later-track mismatch was required to trigger the screenshot failure.

## Full-suite fluency regression and explicit correction

The first corrected focused gate passed 5 files and 41 tests after replacing a false-positive serialized substring assertion with an exact recursive own-property check. The original 40/41 result had matched the legitimate `reasonCodes` property while looking for singular `reasonCode`; that test-only correction changed no production or persistence behavior.

The subsequent 124-file full suite exposed four assertions: two old tests still expected recent-use exhaustion to produce content-needed, one genuine no-content test was bound to obsolete prose wording, and one substantive Grade 3 Fluency Flight test remained at difficulty 4 instead of advancing to completion difficulty 5. Focused pre-fix confirmation reproduced all four failures across 22 tests.

The substantive root cause was a separate older coupling. `completeFluencyPractice` recorded usage, asked `selectNextLesson` for another activity, and returned immediately whenever one was available. Its completion-difficulty branch ran only after selection failed. Safe recycling correctly made compatible practice available, so terminal chapter completion could no longer run.

The correction separates chapter completion from optional practice availability. Existing schema-version-1 completed attempts are passed into the pure fluency transition and joined to the current exact authored lesson/activity, skill, difficulty, unit, and content-version registry. The current completion is included. When every current Grade 3 Unit 4 activity has been completed at least once, the transition advances to difficulty 5 before selection, preserves `lastMasteredDifficulty` 3 and `FLUENCY_PRACTICE`, records `fluency_practice_chapter_completed` plus `oral_fluency_not_measured`, and does not plan another recycled Unit 4 activity. Grade 2 and incomplete Grade 3 fluency continue through fresh-first safe recycling. No persistence field or schema migration is introduced.

## Bounded implementation

Hard compatibility is calculated before variety ranking. Skill, difficulty, purpose, requested unit, requested content version, grade-aware active registry ownership, and sequential track ownership remain authoritative.

Compatible candidates use four deterministic tiers:

1. Unused activity with no overlap against the most recent compatible passage-question set.
2. Unused activity with unavoidable overlap.
3. Previously used, non-immediate activity.
4. Immediate repeat fallback when it is the only compatible route.

Within a tier, ranking uses prior use count ascending, oldest last use, overlap count ascending, activity ID, and lesson ID. Incompatible historical versions are ignored for ranking but retained in the save. Plain NextQuestPlan values remain unchanged; a separate in-memory diagnostic result exposes selection mode and bounded metadata to tests without persistence.

CONTENT_NEEDED now means that no compatible authored candidate exists or a required affinity cannot be satisfied. Recent use alone cannot produce it.

## Sequencing and mastery preservation

The first incomplete track remains authoritative. Story Scouts is recycled rather than skipped, and completed tracks are never recycled as ordinary progression. Verification, guided practice, remediation, and review use the same compatible-candidate ranking while retaining unit and version affinity.

Recycling does not change checkpoint evaluation. Two distinct independent strong activities remain required where configured. The same activity cannot count twice. Weak or assisted work does not qualify. A later strong independent attempt can qualify. Remediation rebuilding returns to its original target without falsely mastering it. Review intervals, XP, stars, completed-attempt idempotency, and reward calculations are unchanged.

## Existing-save recovery and privacy

Schema-version-1 saves with completed attempts, full recent usage, no active session, and stored content-needed automatically normalize and launch recycled same-track work through Start Journey or Continue Journey. Attempts, XP, stars, reviews, mastery evidence, assistance history, assessments, Parent PIN data, and unrelated progress are retained. No reset, cache clearing, history deletion, migration, backend, analytics, telemetry, microphone, or remote diagnostics are introduced.

Selection diagnostics remain memory-only and are absent from persisted next-quest plans, parent views, print output, and child UI.

## Verification inventory

The frozen baseline passed 121 test files and 623 tests. The hotfix adds three dedicated test files with 14 tests, updates the three selector contract tests, and revises one existing global-planner assertion. The production-registry audit derives 160 active-track skill/difficulty/purpose combinations below completion boundaries and requires AVAILABLE after all compatible candidates have recent-use entries.

The suite covers the exact screenshot state, null and stored content-needed plans, ordinary progression, verification, guided practice, remediation, unavoidable overlap, sole-candidate repeat, immediate-repeat avoidance, deterministic insertion order, repeated low performance, assisted strong work, distinct mastery proof, completed-track transition, genuine no-content, one-session launch idempotency, memory-only diagnostics, one-action outcome behavior, unchanged registry totals, and existing persistence.

Final lint, typecheck, test, build, diff, Git synchronization, Pages workflow, HTTP asset, and deployed-marker evidence are release gates. Their actual results belong in the final operator report after the documentation commit and push; this document does not claim deployment before that gate occurs.

## Remaining human acceptance

After Pages deployment, load Rory's existing browser save without clearing storage. Confirm the Home values remain intact, Start Journey launches Story Scouts instead of More Quests Are Being Prepared, Save and Exit resumes the same unfinished session, and subsequent practice or verification remains available. This human check confirms the exact live localStorage history that cannot be extracted by repository tests.
