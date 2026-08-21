# Lesson Content Model (Phase 3)

## Existing Content Entities

Passages and questions retain the Phase 2 typed model, stable IDs, content versions, explanations, evidence IDs, and review states. The five supported question types remain multiple choice, multiselect, hot text, two-part evidence, and table match.

Phase 4 extends passages with optional authored `wordSupportTargets`. Each target includes a stable target ID, owning passage and sentence IDs, a surface word, authored focus parts, authored display and spoken chunks, blend/word/sentence speech text, review status, and content version.

## Lesson-Level Candidate

Each playable lesson candidate contains:

- `lessonId` and stable lesson-level `activityId`
- one `skillId` and one `difficulty`
- eligible purposes: progression, verification, remediation, and/or review
- passage-question keys
- `contentVersion`

The development catalog now aggregates registered local packs instead of a single monolithic development set. Phases 6A1 through 6C3 add seven active Grade 2 bridge packs with 49 lessons, 49 passages, 287 scored questions, and 201 authored word-support targets. Legacy lesson IDs remain resolvable for recovery and parent history, but they are excluded from fresh selection so new learners enter the active bridge packs.

The active bridge packs remain DRAFT-only. Support is authored, not generated, and passage rendering keeps the readable sentence flow while exposing target words as controls. Together the packs implement the listed `ELA.2.F.1.3a` vowel-team patterns across Phase 6A1 and Phase 6A2, implement `ELA.2.F.1.3b` in Phase 6B1, implement `ELA.2.F.1.3c` across Phase 6B1 and Phase 6B2, implement `ELA.2.F.1.3d` across Phase 6C1 and Phase 6C2, implement `ELA.2.F.1.3e` in Phase 6C3, and provide `ELA.2.F.1.4` as supportive practice only in Phase 6C4. The work stays local practice, not oral-fluency measurement.

## Review and Safety

All development content remains original and `DRAFT`. Validation still enforces stable identifiers, supported payloads, answer/evidence integrity, passage references, content versions, and review states. DRAFT content is developmental and not production curriculum.

## Persisted Content Boundary

Persistence stores content identifiers and versions, not passage text, explanations, correct-answer text, or full submitted-answer text. Active recovery stores only submitted option/segment/mapping IDs needed to reconstruct evaluation against compatible current content.

## Parent Analytics Inputs

Phase 5A does not add new child curriculum. Parent analytics consume the existing lesson, skill, attempt, assistance, and review metadata already produced by the child flow. When historical items cannot be resolved against current content, they remain unclassified rather than guessed.

## Phase 5B2 Parent Records Boundary

Official assessment records remain separate from lesson/content authoring. Phase 5B2 does not add new passages, questions, or curriculum content. The print summary reuses existing dashboard snapshots and parent records only; it does not mutate content or persist raw report text.

## Phase 6A1 through Phase 6C3 Bridge Pack Boundary

Phase 6A1 introduces a local bridge pack for `word-forge` and `wg-unit-1`. Phase 6A2 adds the second `word-forge` bridge pack, Phase 6B1 adds `Syllable Summit` as the next unit, Phase 6B2 adds consonant-`le` practice, Phase 6C1 adds Prefix Power, Phase 6C2 adds Suffix Station, Phase 6C3 adds Quiet Letter Quest while completing `ELA.2.F.1.3e` in authored DRAFT form, and Phase 6C4 adds Fluency Flight as supportive practice only. The packs are composed of original DRAFT passages, original DRAFT questions, and authored word-help targets that can be reviewed deterministically. They do not reuse the legacy lesson engine as a content source, and they do not promote the legacy development lessons into the fresh selection path. `sampleContent` now aggregates registered packs so existing imports continue to work while the curriculum grows in bounded packs.

## Phase 6A1 through Phase 6C3 Curriculum Scope Boundary

Phase 6A1 is partial benchmark coverage only. `ELA.2.F.1.3a` becomes implemented in DRAFT form when Phase 6A2 adds `ou`, `oi`, `oy`, and `ow`. Phase 6B1 implements `ELA.2.F.1.3b` in DRAFT form, Phase 6B2 completes `ELA.2.F.1.3c` in DRAFT form, Phase 6C1 through Phase 6C2 implement `ELA.2.F.1.3d` in DRAFT form with common prefixes and common suffixes, Phase 6C3 implements `ELA.2.F.1.3e` in DRAFT form with a bounded silent-letter set, and Phase 6C4 provides supportive practice for `ELA.2.F.1.4` without measuring oral fluency. The bridge packs can support fluency-adjacent reading practice, but they do not assess or score oral fluency. Parent analytics should label this work as `Foundational Skills Bridge`, which is an internal practice category and not an official FAST reporting lane.
