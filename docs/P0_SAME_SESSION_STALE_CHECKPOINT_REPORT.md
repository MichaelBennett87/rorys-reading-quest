# P0 Same-Session Stale-Checkpoint Repair

## Scope

This repair addresses a same-session, two-page rollback found by the mandatory native Edge release gate. It changes active-session authority, persistence coordination, lesson-view synchronization, and the existing browser regression. It does not change curriculum, questions, answers, progression thresholds, rewards, review intervals, schema version, or storage keys.

## Reproduced failure

Two pages opened the same lesson at question index 0. The newer page submitted and advanced to index 1. The older page then proposed a stale checkpoint. The store detected the newer durable record and returned a conflict, but only the hook's progress reference adopted it. The still-mounted lesson screen retained its old session reference. A second action from that obsolete rendering therefore received the newest compare-before-write baseline while carrying the old checkpoint payload, and durable progress regressed to index 0.

The root cause was split authority:

- storage conflict detection protected one write but did not invalidate the rendering that produced it;
- checkpoint callbacks returned no authoritative session to the child screen;
- session identity did not include a revision tied to the rendering's accepted base;
- localStorage compare-before-write was not atomic across simultaneous cooperating pages.

## Repair contract

Every active lesson session may carry `checkpointRevision`. Legacy schema-v1 sessions without it are interpreted as revision 0. A proposed transition must carry the revision from the exact session snapshot that produced the action.

The authoritative write path:

1. Acquires the short same-origin reading-progress Web Lock.
2. Loads and validates the latest durable state inside the lock.
3. Confirms exact session, lesson, content, launch-purpose, and checkpoint-revision identity.
4. Validates the proposed transition rather than comparing question indexes alone.
5. Assigns the next revision only after accepting a real state change.
6. Persists through the existing exact read-back store contract.
7. Returns the authoritative session to the caller for accepted, unchanged, stale, completed, and failed outcomes.

Exact duplicate proposals are idempotent. Stale, future, malformed, and identity-mismatched proposals do not alter durable bytes or timestamps. Missing Web Locks block production mutation rather than silently falling back to an uncoordinated write.

## Transition validation

The validator preserves accepted information across same-index and forward transitions:

- submitted feedback and first-attempt evidence cannot be removed or changed;
- an unsubmitted draft cannot replace submitted feedback;
- drafts must belong to the currently rendered question;
- accepted assistance events cannot be removed or changed;
- fluency practice cannot lose completed steps or read count;
- question movement is forward by at most one position and requires submitted current work;
- final completion must match the authoritative final checkpoint and persisted evaluations.

Draft replacement and deselection remain valid before submission. A response from an obsolete question is discarded rather than transferred to the current question.

## UI reconciliation

Lesson and fluency checkpoint callbacks now receive the authoritative result. On stale conflict, the application adopts that session and performs one bounded remount keyed by session and accepted revision. This synchronizes question index, draft, feedback, evaluations, assistance, fluency state, and local session references. Ordinary accepted draft writes update the internal session reference without remounting, preserving focus and reading position.

Response and primary-action controls are briefly disabled during an authoritative write. This prevents rapid interactions from queuing another proposal against a superseded local revision. Storage events remain synchronization signals; freshness is enforced at the write boundary.

## Completion protection

Final completion carries its expected checkpoint revision. The authoritative session must contain every submitted question and match the result's correctness, first-attempt evidence, assistance count, and fluency summary. A stale final screen cannot restore a completed session, replace a newly launched lesson, or award rewards again.

## Compatibility and limits

- Schema version remains 1.
- Existing progress, attempts, XP, stars, reviews, Parent PIN records, and assessments are preserved.
- Existing storage keys are unchanged.
- Legacy active sessions normalize to revision 0 and gain revision authority on their next accepted write.
- The guarantee covers cooperating pages running this release on browsers with the required Web Locks capability.
- A newly updated page cannot make older cached application code participate in the lock or revision protocol retroactively.
- This is a bounded browser-local coordination guarantee, not a claim of permanent freedom from all concurrency defects or cross-device synchronization.

## Required acceptance

The retained native Edge scenario uses two real pages in one isolated persistent context. It must prove same-index feedback beats a stale draft, a second stale action after conflict adoption cannot roll back an advanced question, a fresh action from the synchronized view succeeds, attempts and rewards remain unchanged, and the accepted checkpoint survives a full Edge process restart. Release acceptance remains blocked unless the complete repository-owned browser gate and exact deployed-artifact gate pass for the final source SHA.
