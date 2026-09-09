# P0 Learning Continuity Hotfix

## Scope

This post-Phase-7 repair investigates reports that the first Word Forge material repeats and earned progress disappears after reopening. It changes no curriculum, benchmark coverage, threshold, reward formula, review interval, Parent PIN, assessment, schema version, or storage-key identity.

## Continuous-profile control

An initially empty, isolated browser origin completed fourteen real Word Forge checkpoints through the question-first UI with no Word Help. The history survived tab close/reopen during a question, during submitted feedback, before final `Next`, after the first qualifying success, after the second qualifying success, after the first unit transition, and after Word Forge completion.

The observed path was:

| Completed sessions | Earned state | Automatically opened next |
| ---: | --- | --- |
| 1 | Difficulty 1 `VERIFY_MASTERY`; first distinct activity retained | Vowel Voyage checkpoint B |
| 2 | Difficulty 2; difficulty 1 mastered | Word Forge Trail 2 checkpoint A |
| 4 | Difficulty 3; first unit complete | Syllable Summit Trail 3 checkpoint A (`wg-unit-2`) |
| 8 | Difficulty 5 | Prefix Power Trail 5 checkpoint A (`wg-unit-3`) |
| 10 | Difficulty 6 | Suffix Station Trail 6 checkpoint A (`wg-unit-4`) |
| 12 | Difficulty 7 | Quiet Letter Quest Trail 7 checkpoint A (`wg-unit-5`) |
| 14 | Word Forge completion difficulty 8 | Story Map Checkpoint in Grade 2 Story Scouts |

The final persisted totals were 14 attempts, 14 completed sessions, 1,470 XP, and 42 stars. Reopening resumed the Story Scouts question. This disproves a universal evaluator, progression-threshold, planner-order, or normal localStorage-load failure on the tested browser boundary. It does not identify the exact environment-specific cause on Rory's device.

A second local acceptance used the built application in an isolated Microsoft Edge Chromium profile. The browser process was terminated and restarted with the same profile at qualifying-success and unit boundaries. The same 14-session path, totals, Word Forge completion, and Story Scouts resume were preserved.

## Confirmed storage defects

Focused reproductions found three independent destructive edge cases:

1. A future-schema payload loaded as unsupported, but a later automatic save could replace it with a fresh schema-v1 learner.
2. A malformed transient session, plan, or outcome caused the entire valid durable record to fall back to defaults, which a later save could overwrite.
3. Two pages loaded from the same origin could save in reverse order, allowing the stale page to roll back newer XP, progression, attempts, rewards, or session state.

Additional contract gaps allowed a silently dropped write to be reported as saved without exact read-back, allowed `saveActiveSession` to return `saved` when the store failed, and allowed the child shell to leave a completed lesson after its final write failed. A narrow initialization race also kept an older normalized state when transient recovery collided with a newer page's save.

## Correction

- Validate and recover durable data only when invalidity is confined to the three transient fields.
- Keep invalid JSON, unsupported schemas, and malformed durable records untouched and write-protected.
- Compare the current raw storage value with the value loaded by this store instance before every write.
- Return the newer persisted state on conflict instead of writing stale state.
- Read back every accepted write and require an exact match before reporting `saved`.
- Keep failed checkpoints non-authoritative in the progress hook and expose a truthful save failure status.
- Adopt the newer state when initialization recovery detects a concurrent write.
- Keep the completed active session in place and show a truthful retry state when the final completion write is not authoritative.

## Boundaries and remaining uncertainty

The application remains local-only and does not synchronize between devices, browser profiles, private sessions, or embedded-browser storage partitions. The browser profile and engine on Rory's reporting device were not available to this automated investigation, so a device-specific storage policy or origin boundary remains possible. The release acceptance must repeat the continuous history on the built and deployed application using an isolated persistent browser origin.
