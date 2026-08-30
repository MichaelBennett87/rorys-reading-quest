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

## Phase 7C4 boundary regression

Claim and Evidence Court registration exercises the same recovery path at the former difficulty-4 boundary. A version-1 save with completed Purpose Development Path work and stored content-needed is normalized against the current registry; Start Journey or Continue Journey launches Unit 4 directly without relaunching Unit 3, restoring a completed session, changing earned rewards, or showing a false coming-soon state. The original 38-test recovery/invariant matrix and the new persisted-boundary integration fixture pass unchanged.
## Phase 7D1 boundary regression

The Phase 7C-to-7D boundary is covered by a production-registry fixture. A schema-v1 save with completed Grade 3 Information Detectives and stale `CONTENT_NEEDED` is normalized against newly registered Figurative Fortress content. The stale plan is retired, only `g3-across-genres-reading` initializes, and the shared Start/Continue launcher opens Unit 1 without relaunching Information Detectives or replacing attempts, XP, stars, or reviews. A valid unfinished Figurative Fortress session resumes first; completed or incompatible sessions remain non-resumable. The one-button recovery contract is unchanged.
## Phase 7D2 boundary regression

The Figurative Fortress-to-Summary Stronghold boundary uses the same authoritative launcher. A schema-v1 save at Grade 3 Across-Genre difficulty 2 with stored `CONTENT_NEEDED` is replanned against the current registry, and Start Journey or Continue Journey opens Unit 2. Repeated launch preparation resumes the same session identity instead of creating a second session. Existing XP and stars remain unchanged, completed Unit 1 state cannot block Unit 2, and genuine content-needed remains fail-closed at unregistered Unit 3.

## Phase 7D3 boundary regression

The Summary Stronghold-to-Author Lens Tower boundary uses the same authoritative launcher and P0 liveness selector. A schema-v1 save at Grade 3 Across-Genre difficulty 3 with stored `CONTENT_NEEDED` is replanned against the registered Unit 3 pair. Start Journey and Continue Journey launch or resume one Author Lens session, completed Unit 2 state cannot block it, rapid preparation cannot duplicate it, and attempts, XP, stars, reviews, Parent PIN data, and assessments remain unchanged. After two distinct independent strong Unit 3 checkpoints, the track reaches completion difficulty 4 and genuine later-content absence remains fail-closed.


## Phase 7D4 boundary regression

When Grade 2 Context Cavern is complete, a schema-v1 save with all earlier Grade 3 tracks complete, no Grade 3 Context Cavern progress, no active session, and stale CONTENT_NEEDED now initializes `g3-context-cavern-vocabulary` exactly once. Start Journey and Continue Journey both launch Unit 1 through the shared authoritative transition. An unfinished Unit 1 session resumes; a completed stale session cannot block it.

When the Grade 2 prerequisite is incomplete, Grade 3 Context Cavern does not initialize. After Unit 1 advances to difficulty 2, the absent Unit 2 remains a genuine content boundary. Home still has exactly two navigation controls, world cards remain display-only, progression outcome has one action, and safe recycling remains active.

## Phase 7D5 boundary regression

A schema-v1 save at Grade 3 Context Cavern difficulty 2 with completed Academic Word Workshop state and stored `CONTENT_NEEDED` now replans against Root Meaning Vault. Start Journey launches Unit 2, and another launch resumes the same unfinished session identity. A completed stale Unit 1 session is rejected before Unit 2 starts; XP, stars, attempts, reviews, Parent PIN data, and assessments remain intact.

After two distinct independent strong Unit 2 checkpoints, the track reaches difficulty 3 and the absent Meaning Maze returns genuine content-needed. Home still has exactly Start Journey and Parent Area, world cards remain display-only, progression outcome retains one action, and no root, word, unit, or lesson selector is introduced.
