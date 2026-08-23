# Grade 2 Semantic Question Audit

## Scope

- Total questions reviewed: 889 active Grade 2 questions
- Source slice: active production packs only; the legacy development pack is excluded from the reviewed set
- Status: automated semantic QA passed on the active production slice after targeted corrections

## Automated checks performed

- Prompt-answer leakage detection for the phonics patterns used by the active Grade 2 decoding lessons
- Visible-choice distinctness checks for single-answer question types
- Prompt/passage ownership checks for the changed Word Forge items
- Evidence-reference sanity checks for the changed items
- Active-pack slicing so legacy development content does not pollute the production audit

## Semantic review approach

The audit combined deterministic helper checks with targeted review of the live content families that changed during the hardening pass. Structured builder questions such as table-match and two-part items were reviewed through their own pack audits because repeated row labels are intentional there and should not be flagged as duplicate visible answer text.

## Defects found

- One duplicate prompt existed inside the Word Forge checkpoint B lesson.
- One Moon-and-Team hot-text question referenced stale content from a different passage family.
- Several low-transfer exemplar prompts in the observed Word Forge lessons repeated the answer token directly in the prompt.

## Defects fixed

- The duplicate Word Forge checkpoint B prompt was rewritten to a unique exemplar.
- The Moon-and-Team hot-text prompt, answer key, and explanation were brought back into alignment with the visible passage.
- The low-transfer Word Forge exemplar prompts were rewritten to use distinct exemplars from the same lesson family where phonetically accurate.
- The semantic audit helper now ignores intentional duplicate row labels in table-match and two-part builder questions.

## Low-transfer questions improved

- Word Forge vowel-team multiple-choice prompts that repeated the keyed exemplar were rewritten.
- Word Forge guided and checkpoint prompts that gave away the answer token were rewritten.
- The audited lesson family now uses non-identical exemplars that still stay inside the same phonics pattern.

## Unresolved questions requiring human review

- None identified by the deterministic audit after the targeted fixes.

## Final status

The active Grade 2 semantic-question slice passed the deterministic audit. This report documents the repository review only; it is not human curricular approval.