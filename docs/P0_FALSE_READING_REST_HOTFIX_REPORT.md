# P0 false Reading Rest topic-handoff repair

Date: 2026-09-16

## Incident

After a valid section boundary, the child could be routed to `Reading Rest` even though compatible comprehension work existed. The message claimed completed work was safely saved, but one reproduced branch had recorded no completed attempt, reward, or progression and had cleared the active session.

The investigation started from synchronized SHA `fb9965f9321ecd3766ead5708625d067da3c6277`. The unchanged baseline passed 189 test files, 928 tests, the 1,611-question semantic gate, type checking, lint, and the production build.

## Confirmed causes

1. A lesson result that matched the active session but no longer matched the current skill difficulty was declined by the progression adapter. The ordinary decline branch then persisted `CONTENT_NEEDED`, cleared the active session, reported persistence success, and awarded nothing. This exactly reproduced a false rest state with no recorded completion.
2. Active verification and remediation selected their preferred unit and content version from the latest completed attempt globally. An attempt from another skill could therefore eliminate every valid candidate and demote required verification into ordinary progression.
3. `planGlobalQuest` normalized newly eligible tracks internally, but completion callers persisted the pre-normalized state with only the returned plan. The selected next topic and the durable state used to launch it could disagree at a track boundary.
4. The child shell treated a post-completion `content_needed` result as final and rendered rest without running the authoritative reconciled launcher again.

The existing stored-plan boot recovery was correct: a saved stale `content_needed` plan was retired and replanned. The repair reuses that path rather than creating a second planner.

## Correction

- Rejected completions now return `RECOVERY_NEEDED`, remain unpersisted, preserve the active session, record no attempt or reward, and use the existing single Retry state.
- Accepted ordinary, review, fluency, and duplicate completion paths now reconcile first and persist the same normalized state used by global planning.
- Verification/remediation affinity now comes from the latest attempt with the same skill and current difficulty.
- Final `Next` always re-enters the authoritative launcher. Only its reconciled global result can display genuine rest or curriculum completion.
- A genuine idle page rechecks on `visibilitychange` to visible, `pageshow`, and a matching same-origin progress `storage` event. Events are coalesced by the existing launch guard; no timer, polling, reload loop, or background write was introduced.
- Authoritative preparation reloads valid or transient-recovered durable progress before reconciliation, allowing a resting tab to adopt newer same-origin work without letting invalid, unsupported, or missing storage overwrite valid in-memory state.

## Focused evidence

`tests/p0ReadingRestHandoff.test.tsx` proves:

- declined stale completion preserves session authority and records no attempt;
- unrelated latest-attempt metadata cannot steal Story Scouts verification affinity;
- Story Scouts completion durably initializes Information Detectives before launch;
- a stored false-rest plan launches the next eligible topic automatically;
- an open genuine-rest page adopts newer same-origin progress on a storage event;
- every current ordinary difficulty, all twelve tracks, all eleven topic handoffs, and genuine final completion have a derived global result.

The broader focused matrix also covers failed writes, stale-tab conflict protection, exact-once completion, assisted and low-performance progression, remediation, safe recycling, historical unit-affine reviews, Grade 3 fluency completion, question-first UI, Parent PIN reporting, and print privacy.

## Preserved contracts

The repair changes no learner content, answer key, semantic record, curriculum count, mastery threshold, reward formula, review interval, schema version, storage key, Parent PIN, or assessment record. Comprehension-first ordering and deferred Word Forge remain authoritative. Current inventory remains 40 packs, 280 lessons, 294 texts, 1,611 questions, and 1,111 support targets.

## Browser acceptance boundary

The local browser inventory available to this task was empty. In-app browser creation and automatic browser selection both reported that no browser was available, and the repository has no Playwright or Puppeteer dependency. No interactive browser result is inferred from UI integration tests. The complete automated UI suite and published static assets remain the supported fallback evidence; any unavailable deployed interaction is reported explicitly in the external completion report.
