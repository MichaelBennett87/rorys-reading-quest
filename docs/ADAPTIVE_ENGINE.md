# Adaptive Engine (Phase 3)

## Score Contract

`LessonResult.accuracy` is a percentage from `0` through `100`. The checkpoint engine receives `accuracy / 100`. First-attempt accuracy is `firstAttemptCorrect / totalQuestions`; incomplete, zero-question, malformed, unknown-skill, mismatched-trail, and unsupported-difficulty results are declined.

`LessonResult.assistanceSummary` is the Phase 4 bridge into progression. Visual hints, spoken chunk help, spoken word help, and sentence read-aloud assistance are summarized locally and then adapted into the checkpoint contract without exposing raw support text.

## Distinct Independent Evidence

- Strong independent evidence requires at least 85% accuracy and first-attempt accuracy with no disqualifying assistance.
- The first distinct qualifying activity stays at the same difficulty and returns `VERIFY_MASTERY`.
- A replayed activity ID is recorded as an attempt but cannot increase mastery evidence.
- A second distinct qualifying activity returns `ADVANCE`, increases difficulty by exactly one, records the prior difficulty as mastered, clears current evidence/failure counters, and schedules review one day later.
- Any used assistance prevents a result from counting as independent mastery evidence, even when accuracy remains strong.

## Partial and Unsuccessful Outcomes

- 70-84%: `RETRY_SAME_DIFFICULTY`, fresh practice, same difficulty, and unsuccessful count reset.
- First result below 70%: `GUIDED_PRACTICE`, targeted fresh same-level remediation, and unsuccessful count one.
- Second consecutive result below 70%: `REMEDIATE_PREREQUISITE`. A playable explicit prerequisite is preferred; otherwise the last mastered difficulty for the same skill is used.
- Rewards and unrelated skill progress are preserved during remediation.

## Remediation Return

The remediation context retains original skill/difficulty, remediation skill/difficulty, and route reason. Rebuilding the remediation level clears the context and returns to the original target with its unsuccessful count reset. The original target is not marked mastered, and its retry still requires fresh material.

## Fresh Lesson Selection

Lesson candidates include lesson/activity IDs, skill, difficulty, purposes, passage-question keys, and content version. Selection is sorted and deterministic. Recent activity IDs and an exact immediate passage-question repeat are excluded. No candidate produces structured `content_needed`; no fallback silently repeats exhausted content.

## Spaced Review

- Intervals remain 1, 3, 7, 14, and 30 days.
- Mastery schedules the first review one day later.
- Successful review moves one step later; an unsuccessful review moves one step closer.
- Date calculations receive a timestamp so pure tests remain deterministic.

## Rewards and Summary

Stars remain 3 for 90-100%, 2 for 70-89%, and 1 below 70% for completion. XP is 10 per completed question plus 5 per correct answer. Rewards never prove mastery and never decrease. A pure telemetry-free summary reports local educational progress without claiming an official diagnosis, reading level, FAST score, or calibrated probability.

## Parent Explanations

Phase 5A adds deterministic parent-facing explanations that mirror the structured progression outcomes without changing the underlying adaptive rules. These explanations summarize verification, advancement, retry, guided practice, prerequisite remediation, review, and content-needed states in parent-friendly language only. They do not introduce new progression logic or predictive scoring.

## Phase 6A1 and Phase 6A2 Bridge Pack Selection

Phase 6A1, Phase 6A2, Phase 6B1, and Phase 6B2 add registered Grade 2 bridge packs for `word-forge`. Fresh selection prefers the active bridge lessons, leaves legacy development lessons available only for recovery and history, and chooses between trail 1, trail 2, trail 3, and trail 4 using the current difficulty, selected unit, and freshness. Guided-teaching lessons stay distinct from checkpoint lessons: they show authored teaching blocks before scored questions, but the teaching block is not scored, not counted as assistance, and not treated as mastery evidence.

## Phase 6A1 and Phase 6A2 Coverage

`ELA.2.F.1.3a` is implemented in DRAFT form across Phase 6A1 and Phase 6A2. `ELA.2.F.1.3b` is implemented in DRAFT form in Phase 6B1, and `ELA.2.F.1.3c` is implemented in DRAFT form across Phase 6B1 and Phase 6B2. The active packs cover `oo`, `ea`, `ou`, `oi`, `oy`, and `ow`, and the Syllable Summit pack covers the two-syllable, open/closed, and consonant-`le` bridge patterns. Parent and curriculum docs must distinguish benchmark-aligned exposure from complete benchmark mastery. Later bridge phases add the remaining Grade 2 foundations and reading strands.
