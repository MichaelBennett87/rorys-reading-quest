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

The development catalog contains four coherent lessons:

- one difficulty-0 building-block lesson
- three distinct difficulty-1 Word Forge variants

All 2 passages and all 10 questions are reused from Phase 2. No new passage or question was added, and no lesson mixes difficulty 0 and 1.

The same two passages now also carry 9 DRAFT support targets across the existing lesson content. Support is authored, not generated, and passage rendering keeps the readable sentence flow while exposing target words as controls.

## Review and Safety

All development content remains original and `DRAFT`. Validation still enforces stable identifiers, supported payloads, answer/evidence integrity, passage references, content versions, and review states. DRAFT content is developmental and not production curriculum.

## Persisted Content Boundary

Persistence stores content identifiers and versions, not passage text, explanations, correct-answer text, or full submitted-answer text. Active recovery stores only submitted option/segment/mapping IDs needed to reconstruct evaluation against compatible current content.

## Parent Analytics Inputs

Phase 5A does not add new child curriculum. Parent analytics consume the existing lesson, skill, attempt, assistance, and review metadata already produced by the child flow. When historical items cannot be resolved against current content, they remain unclassified rather than guessed.

## Phase 5B2 Parent Records Boundary

Official assessment records remain separate from lesson/content authoring. Phase 5B2 does not add new passages, questions, or curriculum content. The print summary reuses existing dashboard snapshots and parent records only; it does not mutate content or persist raw report text.
