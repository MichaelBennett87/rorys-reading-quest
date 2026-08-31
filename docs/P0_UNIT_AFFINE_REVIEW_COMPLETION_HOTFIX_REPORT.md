# P0 Unit-Affine Review Completion Hotfix Report

## Boundary

This hotfix began from synchronized local and remote SHA `d8bcab45a06cbfef28364a159dfd790dcd19a7ca`. It repairs historical spaced-review completion only. It adds or removes no pack, lesson, source, question, support target, benchmark, track, unit, route, dependency, or persistence store. Phase 8, Phase 9, and Phase 10 remain unstarted.

## Deployed failure

Phase 7D7 deployed-browser acceptance correctly planned a due Grade 2 Story Map review from its historical skill, difficulty, unit, and content version while the Story Scouts track was already at completion difficulty. All seven answers were correct. Completion nevertheless recorded no attempt, completed session, XP, or stars; it did not consume or reschedule the review; it cleared the active session; and it displayed a false content-needed outcome with `Lesson result does not match the active skill trail.` A separate due Grade 3 Meaning Maze review remained queued.

## Proven root cause

The review planner retained exact queue affinity, but `prepareJourneyLaunch` passed only the lesson into `beginLesson`. `ActiveLessonSession` therefore lost launch purpose and review identity. Save and Exit or reload could not recover that authority. Completion searched for progress at the historical lesson difficulty, fell back to the track's current completion progress, and entered the ordinary checkpoint adapter. That adapter correctly rejected the difficulty mismatch, but the ordinary decline path was invalid for an authoritative review.

The same missing boundary also meant that a same-difficulty review could accidentally run ordinary progression. Merely relaxing the difficulty comparison would therefore have weakened identity safety and allowed historical non-review results to bypass progression validation.

## Repair

An optional `ActiveLessonLaunchContext` now travels from the global quest plan into the active session. A review context records purpose, exact skill, historical difficulty, unit, content version, review step, due time, and return learning state. The optional shape is validated and cloned within schema version 1. Legacy active sessions remain readable; an old session without launch context is ordinary and receives no review authority.

Session recovery and completion fail closed unless the context agrees with the registered lesson and exactly one resolved queue entry. Checkpoint persistence cannot replace the launch context. Valid review completion uses a dedicated pure transition and the existing score, assistance, spacing, XP, and star calculations. It replaces only the exact review entry, preserves unrelated reviews, records completion once, and replans globally.

The transition does not change current difficulty, last mastered difficulty, qualifying advancement evidence, consecutive-failure counters, remediation, chapter completion, review intervals, reward formulas, planner ranking, Parent PIN, assessments, schema version, or storage keys.

## Test-first evidence

The production tree first reproduced the defect in completed Grade 2, completed Grade 3, and incomplete advanced-track historical reviews. The same-difficulty control exposed unintended ordinary progression. An ordinary historical lesson without review authority remained rejected.

The final focused matrix contains 19 cases covering:

- completed Grade 2 and Grade 3 historical reviews;
- incomplete advanced-track and same-difficulty reviews;
- independent, assisted, partial, and unsuccessful review results;
- exact queue rescheduling with unrelated reviews preserved;
- Save and Exit plus schema-v1 reload;
- duplicate completion and late checkpoints;
- wrong skill, difficulty, unit, content version, lesson, due time, and review step;
- cross-grade, missing-entry, and same-skill multi-unit identity safety;
- checkpoint attempts to mutate review authority;
- ordinary historical results without review authority.

The focused hotfix suite passes 19 of 19 tests. The inherited planner, persistence, progression, review schedule, final Grade 3 audit, active-session, and exact-once matrix passes 120 of 120 tests across 11 files. Full repository and deployed-browser results are release gates and are reported externally only after they run on the final synchronized SHA.

## Bounded review lanes

Exactly four read-only review lanes were launched for review semantics, launch-context persistence, adversarial identity safety, and release acceptance. The client created all four isolated worktrees but did not expose callable thread IDs or completed responses. In accordance with the task boundary, no replacement agents were spawned; the primary agent independently repeated each complete review and records the tooling limitation rather than treating an unavailable response as approval.

## Release gate

Release requires the complete lint, typecheck, test, build, diff, remote-safety, GitHub Pages, static asset, and deployed-browser A-through-H sequence on one exact final SHA. In particular, Sequence F must prove that a completed Grade 2 review records and reschedules exactly once while a separate Grade 3 review is preserved, then that the Grade 3 review can launch and complete independently. Until that gate passes, Phase 7 release certification remains blocked.
