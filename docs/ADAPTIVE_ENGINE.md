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

## Phase 6A1 through Phase 6C3 Bridge Pack Selection

Phase 6A1 through Phase 6C4 add registered Grade 2 bridge packs for `word-forge`. Fresh selection prefers the active bridge lessons, leaves legacy development lessons available only for recovery and history, and chooses between trail 1, trail 2, trail 3, trail 4, trail 5, trail 6, and trail 7 using the current difficulty, selected unit, and freshness. Guided-teaching lessons stay distinct from checkpoint lessons: they show authored teaching blocks before scored questions, but the teaching block is not scored, not counted as assistance, and not treated as mastery evidence. Quiet Letter Quest stays unit-gated for Phase 6C3, Fluency Flight is support-practice only in Phase 6C4 so later phases remain locked until their packs exist, and Phase 6D0 adds the multi-world progression foundation needed for Story Scouts, Poetry Planet, and Information Detectives without changing the existing Word Forge rules. Phase 6D1 and Phase 6D2 extend the Story Scouts skill with separate unit-affine Story Map and Theme Trail review content, Phase 6D3 extends that same review affinity to Perspective Portal so a review for one unit cannot be silently replaced by another, Phase 6D4 brings Poetry Planet online with the same deterministic planning and world-gating rules, Phase 6E1 brings Information Detectives online with the same deterministic planning and world-gating rules, Phase 6E2 extends the same rules to Central Idea Center while Context Cavern remains planned, Phase 6E3 extends the same rules to Purpose Path while Context Cavern remains planned, Phase 6E4 extends the same rules to Opinion & Evidence Desk while Context Cavern remains planned, Phase 6E5 brings Context Cavern Academic Word Workshop online with the same deterministic planning and world-gating rules, Phase 6E6 extends those same rules to Morphology Mine while Meaning Clue Chamber remains planned, and Phase 6E7 extends those same rules to Meaning Clue Chamber while Context Cavern completes. `ELA.2.V.1.1` is implemented in DRAFT form in Phase 6E5, `ELA.2.V.1.2` is implemented in DRAFT form in Phase 6E6, and `ELA.2.V.1.3` is implemented in DRAFT form in Phase 6E7.

## Phase 6A1 through Phase 6C3 Coverage

`ELA.2.F.1.3a` is implemented in DRAFT form across Phase 6A1 and Phase 6A2. `ELA.2.F.1.3b` is implemented in DRAFT form in Phase 6B1, `ELA.2.F.1.3c` is implemented in DRAFT form across Phase 6B1 and Phase 6B2, `ELA.2.F.1.3d` is implemented in DRAFT form across Phase 6C1 and Phase 6C2, `ELA.2.F.1.3e` is implemented in DRAFT form in Phase 6C3, and `ELA.2.F.1.4` is supportive practice only in Phase 6C4. The active packs cover `oo`, `ea`, `ou`, `oi`, `oy`, and `ow`; the Syllable Summit pack covers the two-syllable, open/closed, and consonant-`le` bridge patterns; Prefix Power covers common prefixes; Suffix Station covers common suffixes; Quiet Letter Quest covers the bounded silent-letter set; Fluency Flight supports modeled and repeated reading without oral scoring; the active prose-and-poetry bridge packs implement `ELA.2.R.1.1` through `ELA.2.R.1.4` in DRAFT form; Information Detectives implements `ELA.2.R.2.1` through `ELA.2.R.2.4` in DRAFT form; and Context Cavern implements `ELA.2.V.1.1` in DRAFT form in Phase 6E5 and `ELA.2.V.1.2` in DRAFT form in Phase 6E6 while later Context Cavern units remain planned. Phase 6D0 adds the track foundation only; it does not add prose or poetry content yet. Parent and curriculum docs must distinguish benchmark-aligned exposure from complete benchmark mastery and supportive practice from benchmark coverage. Later bridge phases add the remaining Grade 2 foundations and reading strands.
## Phase 6F3 adaptive-planning boundary

The adaptive planner includes `g2-across-genres-reading` when active Compare Castle content exists. Compare Castle is playable in Phase 6F1 through Wordplay Watchtower, in Phase 6F2 through Retell Hall, and in Phase 6F3 through Compare Keep. The planner must keep unit ownership deterministic, preserve review identity, and avoid creating progress entries for the next Phase 6F4 audit boundary. Phase 6F4 completes the final Grade 2 audit and Phase 6 completion, and Phase 7 remains next.

When fixture content is present, unit affinity remains isolated:

- `cg-unit-1` owns Wordplay Watchtower
- `cg-unit-2` owns Retell Hall
- `cg-unit-3` owns Compare Keep

Planning priority remains unchanged: compatible active session, verification, remediation, due review, balanced ordinary progression, then content-needed. The new Grade 2 coverage snapshot is read-only and does not alter child progress.

## Phase 6.5 accuracy and recovery note

`LessonResult.accuracy` continues to use a 0 through 100 percent contract. Dashboard and parent summary formatters must not multiply that value again. Phase 6.5 also preserves the existing mastery thresholds, review intervals, and review identity while the legacy demo baseline cleanup keeps old saves readable.

## Phase 6.6 active-quest lifecycle note

`Save and Exit` preserves the current active lesson session for later resume. `End Current Quest` abandons only the unfinished active session, keeps completed attempts, rewards, reviews, and progression intact, and clears the stale resume plan when it points at the same abandoned lesson. Historical level-4 blended-word records remain readable for older saves, but the child-facing help sequence now exposes five steps rather than a separate visible Blend It control.

## Phase 7A0 domain-specific grade transition

Grade transition is track-specific rather than a global learner classification. A track is progression-playable only when exact-track active content exists and each prerequisite track has reached its explicit completion difficulty. Grade 3 progress is initialized only at that point. Grade 2 reviews remain eligible after a domain advances, and global priority remains active session, verification, remediation, due review, balanced ordinary progression, then content-needed. Review and remediation identity never crosses grade, skill, unit, or content version.

## Phase 7A1 Root Reactor progression

Root Reactor starts at Grade 3 difficulty 1 after domain readiness. Two distinct strong independent checkpoints are required to advance to difficulty 2; replaying the same activity cannot provide both proofs. A first low result chooses same-level Grade 3 guidance, while a second consecutive low result routes to Root Reactor difficulty-0 power-up work and preserves the difficulty-1 return target. Assisted strong work retains score and rewards but does not become independent mastery evidence. With Phase 7A2 active, completion transitions to Suffix Shifter without blocking Grade 2 work or reviews.

## Phase 7A2 Suffix Shifter progression

Suffix Shifter is available only at Grade 3 Word Forge difficulty 2 after Root Reactor mastery evidence advances the shared skill. Two distinct strong independent checkpoints are required to advance to difficulty 3. A first low result selects difficulty-2 Suffix Shifter guidance; a second consecutive low result selects difficulty-1 Suffix Shifter remediation while preserving the difficulty-2 return target. Root Reactor, Suffix Shifter, and Grade 2 Word Forge reviews retain distinct unit/content-version identities. At difficulty 3, Multisyllable Mountain remains locked and planning returns structured `CONTENT_NEEDED` without blocking other playable tracks or due reviews.

## Phase 7A3 Multisyllable Mountain progression

Multisyllable Mountain is available only at Grade 3 Word Forge difficulty 3 after Suffix Shifter advances the shared skill. Two distinct strong independent checkpoints are required to advance to difficulty 4; replaying one checkpoint cannot supply both proofs, and assisted strong work does not become independent evidence. A first low result selects difficulty-3 guidance. A second consecutive low result routes to difficulty-2 Multisyllable Mountain remediation while preserving the difficulty-3 return target. Rebuilding returns to difficulty 3 without marking it mastered.

At the Phase 7A3 checkpoint, Grade 2 Word Forge, Root Reactor, Suffix Shifter, and Multisyllable Mountain reviews retained exact grade/skill/unit/version identities and could coexist. Due Grade 2 review kept its normal priority over ordinary Grade 3 progression. Difficulty 4 returned structured `CONTENT_NEEDED` while Fluency Flight Grade 3 remained deferred. Phase 7A4 supersedes only that content-availability boundary; thresholds, review intervals, rewards, and planner priority remain unchanged.

## Phase 7A4 Fluency Flight progression

Fluency Flight becomes available at Grade 3 Word Forge difficulty 4 after Multisyllable Mountain advances the shared skill. All seven lessons use `FLUENCY_PRACTICE`; none is a mastery checkpoint and none creates independent oral-mastery evidence. Freshness remains activity- and passage-aware. After fresh unit-affine practice is exhausted, the shared track may move to completion difficulty 5 while `lastMasteredDifficulty` remains separate and the outcome remains supportive fluency practice.

Normal XP and stars remain governed by existing question-result rules. Assistance does not become evidence of oral weakness. An incorrect fluency-support answer is not classified as oral-reading failure. Root Reactor, Suffix Shifter, Multisyllable Mountain, Fluency Flight Grade 3, and Grade 2 Word Forge reviews remain unit/content-version affine and may coexist. Active session, verification, remediation, due review, balanced progression, and content-needed priority are unchanged.
## Phase 7B1 Story Scouts progression

Grade 3 Story Scouts initializes at difficulty 1 only after active Character Arc Camp content exists and Grade 2 Story Scouts reaches completion difficulty 4. Two distinct independent strong checkpoints are required to advance to difficulty 2. A first low checkpoint selects same-level guidance; a second consecutive low checkpoint selects Character Arc-specific difficulty-0 remediation and preserves the difficulty-1 return target. Theme Development Trail remains content-needed, and no planner path falls back across grade bands.

## Phase 7B2 Theme Development Trail progression

Theme Development Trail becomes ordinary progression content only at Grade 3 Story Scouts difficulty 2 after Character Arc Camp advances the shared skill. Two distinct independent strong checkpoints are required to advance to difficulty 3. A first low checkpoint selects difficulty-2 Theme Trail guidance; a second consecutive low checkpoint selects difficulty-1 Theme Trail remediation while preserving the difficulty-2 return target. Rebuilding returns to difficulty 2 without marking it mastered.

Grade 2 Story Scouts, Character Arc Camp, and Theme Development Trail reviews retain exact grade, skill, unit, and content-version identity. After a true advance, Perspective Portal Grade 3 remains locked and planning returns structured CONTENT_NEEDED. Thresholds, review intervals, rewards, assistance semantics, planner priority, and active-session behavior are unchanged.

## Phase 7B3 Perspective Portal progression

Perspective Portal becomes ordinary progression content at Grade 3 Story Scouts difficulty 3 only after Theme Development Trail advances the shared skill. A first distinct independent strong checkpoint requests verification, replay is not a second proof, and a second distinct proof advances to completion difficulty 4. Partial work remains at difficulty 3. Repeated low work moves from same-level guidance to Perspective-owned difficulty-2 remediation while preserving the difficulty-3 return target; rebuilding does not mark difficulty 3 mastered.

Character Arc Camp, Theme Development Trail, Perspective Portal, and Grade 2 Story Scouts retain exact grade/unit/version review affinity. Completion releases progression affinity without replacing reviews, crossing grade bands, changing thresholds or intervals, or creating Grade 3 poetry content. Active session, verification, remediation, due review, balanced ordinary progression, and content-needed priority remain deterministic.

## Grade 3 Poetry Planet progression

Poem Form Observatory starts at difficulty 1 after the existing Grade 2 Poetry Planet prerequisite reaches completion. Two distinct strong checkpoints verify then advance the track to completionDifficulty 2; partial work remains at level, two consecutive low outcomes route to difficulty-0 unit-affine remediation, rebuilding returns to difficulty 1, and assisted work does not create independent mastery evidence. Active sessions, verification, remediation, due review, ordinary progression, and content-needed retain their established priority. No threshold, review interval, reward, or one-button journey rule changes.

## Phase 7C1 Structure Station progression

Grade 3 Information Detectives initializes at difficulty 1 only after Grade 2 Information Detectives reaches completion difficulty 5 and active Structure Station content exists. Two distinct independent strong checkpoints verify then advance to difficulty 2, where Central Idea Engine remains unavailable and planning fails closed with structured content-needed. Partial work stays at difficulty 1; two consecutive low outcomes route to difficulty-0 Structure Station remediation; rebuilding returns to difficulty 1 without claiming mastery. Active session, verification, remediation, due review, ordinary progression, and content-needed priorities remain unchanged, and Start/Continue Journey remains the only child launch path.

## Phase 7C2 Central Idea Engine progression

Central Idea Engine becomes available only when Grade 3 Information Detectives reaches difficulty 2 after Structure Station completion. Two distinct independent strong checkpoints verify then advance to difficulty 3, where Purpose Development Path remains unavailable and planning fails closed with structured content-needed. Partial work remains at difficulty 2; two consecutive low outcomes route to difficulty-1 Central Idea Engine remediation; rebuilding returns to difficulty 2 without claiming mastery. Active sessions, verification, remediation, due review, ordinary progression, deterministic freshness, and unit-affine review retain their established priority.
