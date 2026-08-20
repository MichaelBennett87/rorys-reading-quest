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

The development catalog now aggregates registered local packs instead of a single monolithic development set. Phase 6A1 adds one active Grade 2 bridge pack with 7 lessons, 7 passages, 41 scored questions, and 33 DRAFT word-support targets. Legacy lesson IDs remain resolvable for recovery and parent history, but they are excluded from fresh selection so new learners enter the active bridge pack.

The active bridge pack remains DRAFT-only. Support is authored, not generated, and passage rendering keeps the readable sentence flow while exposing target words as controls. The pack is aligned to `ELA.2.F.1.3a` partially, covering `oo` and `ea` only in Phase 6A1.

## Review and Safety

All development content remains original and `DRAFT`. Validation still enforces stable identifiers, supported payloads, answer/evidence integrity, passage references, content versions, and review states. DRAFT content is developmental and not production curriculum.

## Persisted Content Boundary

Persistence stores content identifiers and versions, not passage text, explanations, correct-answer text, or full submitted-answer text. Active recovery stores only submitted option/segment/mapping IDs needed to reconstruct evaluation against compatible current content.

## Parent Analytics Inputs

Phase 5A does not add new child curriculum. Parent analytics consume the existing lesson, skill, attempt, assistance, and review metadata already produced by the child flow. When historical items cannot be resolved against current content, they remain unclassified rather than guessed.

## Phase 5B2 Parent Records Boundary

Official assessment records remain separate from lesson/content authoring. Phase 5B2 does not add new passages, questions, or curriculum content. The print summary reuses existing dashboard snapshots and parent records only; it does not mutate content or persist raw report text.

## Phase 6A1 Bridge Pack Boundary

Phase 6A1 introduces a local bridge pack for `word-forge` and `wg-unit-1`. The pack is composed of original DRAFT passages, original DRAFT questions, and authored word-help targets that can be reviewed deterministically. It does not reuse the Phase 2 lesson engine as a content source, and it does not promote the legacy development lessons into the fresh selection path. `sampleContent` now aggregates registered packs so existing imports continue to work while the curriculum grows in bounded packs.

## Phase 6A1 Curriculum Scope Boundary

Phase 6A1 is partial benchmark coverage only. `ELA.2.F.1.3a` is not complete until later phases add `ou`, `oi`, `oy`, and `ow`. Phase 6A1 can support fluency-adjacent reading practice, but it does not assess or score oral fluency. Parent analytics should label this work as `Foundational Skills Bridge`, which is an internal practice category and not an official FAST reporting lane.
