# Continue Journey State Recovery

## Release-blocking reproduction

The Phase 7C3 opening checkpoint reproduced the human-observed deadlock before any production fix. Nine deterministic cases were added. Five failed against the starting implementation:

- a completed catalog-compatible session recovered as active;
- duplicate completion retained the matching active session;
- a late checkpoint could recover under a completed identity;
- stored `CONTENT_NEEDED` survived after eligible content existed;
- reload and Start Journey relaunched completed work instead of the current planner result.

Four controls already passed: valid unfinished resume, incompatible-session discard, rapid Start idempotency, and genuine content-needed.

## Proven root cause

The deadlock was a state-authority failure across several boundaries rather than one isolated UI message. Recovery validated catalog compatibility without checking exact completion identity. Duplicate completion returned prior state without clearing a matching active session. Checkpoint persistence could restore an already-completed identity. Start Journey and Continue Journey used separate launch paths, and Continue Journey trusted a rendered outcome snapshot. Stored content-needed was retained instead of recomputed against the current registry.

## Correction

- Active recovery now returns `discarded_completed` when the session ID already exists as an attempt completion ID.
- Standard and fluency duplicate completion clear only the matching stale session and award no new rewards.
- Late or superseded checkpoints return safe ignored results and cannot resurrect completed work.
- `beginLesson` resumes the same compatible session and refuses to overwrite another valid unfinished session.
- Start Journey and Continue Journey call one authoritative `prepareJourneyLaunch` path based on the latest progress reference and current registry.
- Stored content-needed is retired before fresh planning.
- Lesson and fluency session references are retired before completion callbacks.

## Preservation and proof

The fix keeps persistence schema version 1 and preserves storage keys, attempts, XP, stars, reviews, mastery evidence, assessments, Parent PIN behavior, and unfinished-session recovery. The focused hotfix matrix contains 38 tests across the nine reproduction cases and 29 state invariants, including complete/continue/resume/late-checkpoint and new-content-registration sequences. Full lint, typecheck, test, build, and diff checks passed before commit `613d5fb fix: reconcile continue journey state`.
