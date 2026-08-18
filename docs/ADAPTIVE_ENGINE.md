# Adaptive Engine (Phase 0)

## State Machine

`TEACH` -> `GUIDED_PRACTICE` -> `CHECKPOINT` -> decision branch:

- `VERIFY_MASTERY`
- `ADVANCE`
- `RETRY_SAME_DIFFICULTY`
- `REMEDIATE_PREREQUISITE`
- `SPACED_REVIEW`
- `MASTERED` (target state)

Parent-facing and parent-review states are represented in the interface contract even when not implemented in shell UI.

## Thresholds

- Strong threshold: `>= 85%`
- Partial threshold: `>= 70%` and `< 85%`
- Retry threshold: `< 70%`
- Assistance gating:
  - no more than one major hint,
  - no sentence-level read-aloud,
  - first-attempt quality must also be strong for independent evidence.

## Assistance Effects

- Assistance is recorded and never treated as failure by itself.
- Heavy assistance prevents automatic independent mastery advancement.
- A supported assistance path can still return a child-safe "next-step" message and request an additional independent verification.

## Two Distinct Success Rule

- The first strong independent checkpoint sets `needsIndependentVerification = true` and retains difficulty.
- The second qualifying independent success at the same difficulty advances difficulty by one.

## Failure Behavior

- Partial result:
  - same difficulty,
  - fresh practice and targeted explanation,
  - review opportunity remains available.
- First unsuccessful checkpoint:
  - `GUIDED_PRACTICE`,
  - remediation activity at same difficulty,
  - do not repeat same passage-question pair.
- Second consecutive unsuccessful checkpoint:
  - identify prerequisite (or last mastered point),
  - return to rebuild prerequisite first,
  - preserve existing rewards and achievements.

## Fresh Material Rule

- Repetition is allowed for skill/grade/difficulty/format.
- Immediate repetition is blocked for:
  - activity identifier,
  - passage-question pair.

## Spaced Review

Initial sequence: `1, 3, 7, 14, 30` days.

- Correct review advances one step in sequence.
- Missed review returns one step sooner.

## Parent-Facing Explanations

Parent explanations are structured short messages describing:

- checkpoint interpretation,
- whether independent evidence is still required,
- if prerequisite remediation is required,
- whether difficulty changed.

## Configurable Points

- Threshold values
- Hint severity thresholds
- Mastery evidence requirement count
- Review spacing sequence
- Remediation fallback rules

## Known Future Calibration Questions

- How strict should first-attempt criteria be for long passages?
- Whether independent evidence should enforce unique passage families before advancement.
- Whether review sequence should vary by skill age and family difficulty.
- How much support counts as independent for mixed assistance traces.
