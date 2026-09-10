# Question-first child experience implementation and acceptance

Date: 2026-09-08

## Product contract

The normal application URL opens directly into a compatible resumed session or the global planner's authoritative current question. The child makes zero navigation decisions. One primary action moves through the stable states `Check Answer`, visible feedback, and `Next`.

The current experience removes the child Home, map, Start Journey, Parent Area button, lesson-introduction gate, Save and Exit button, lesson-results menu, and separate progression-outcome navigation stop. Their domain calculations and planner invariants remain intact. At a final-question `Next`, the stable session completes once, progression or review state updates, and the next authoritative activity opens without a results detour.

The parent bookmark is:

`https://michaelbennett87.github.io/rorys-reading-quest/#/parent`

The route always uses the existing PIN gate, survives GitHub Pages refresh behavior through the hash, and does not auto-launch child work.

## Preserved instruction and response behavior

- All five scored interfaces remain: multiple choice, multiselect, Hot Text, table match, and two-part.
- Guided teaching appears inline without a Start Practice gate.
- Fluency retains model listening, phrase practice, rereading, reflection, and its real completion conditions. Audio remains optional and no microphone or oral score is introduced.
- Word Help remains explicitly requested, dismissible, assistance-tracked, and limited to its five accepted stages.
- Local glossary, dictionary-style, and thesaurus-style cards remain learner-visible where required and make no network request.
- Multiselect and multi-Hot-Text `Check Answer` readiness requires a learner selection but never consults the hidden authored correct-answer count.

## Persistence and exact-once behavior

Schema version 1 and all three storage keys remain unchanged. Autosave contains bounded IDs and response mappings only. It preserves question position, drafts, submitted feedback, assistance, fluency state, active-session identity, and review launch context without persisting prompt, source, explanation, reference-card, or answer-key text.

Local browser acceptance verified reload during submitted feedback, exact session restoration, one completed attempt, one completed-session increment, and one XP/star transaction. A completed-track historical Grade 2 Story Map review rescheduled its exact unit/version-affine queue entry from review step 1 to step 2 while preserving unrelated state. A real low checkpoint result then launched a guided lesson with persisted `purpose: remediation` through the same final `Next` action.

## Visual and accessibility result

The child surface uses a deep forest/teal canvas, one warm reading/question workspace, large response controls, restrained gold action styling, neutral teal selection, green correct feedback, and crimson incorrect feedback. Evidence snippets use a pale green block with dark text. Correct and incorrect states include text and symbols; no state depends on color alone.

The local Codex in-app browser was exercised at narrow phone, portrait iPad, landscape iPad, and desktop-sized viewports. Measured document scroll width never exceeded client width. Passage and question columns sit side by side when space permits and stack in reading order on narrower layouts. Prose, poetry, informational features, paired Text 1/Text 2, reference cards, guided instruction, fluency, Word Help, and all five question forms were visually inspected. This is viewport simulation, not physical-device testing.

## Semantic release relationship

The semantic answer-uniqueness gate now accounts for all 1,611 current active questions and 2,382 response slots. It has 1,611 frozen primary conclusions, 343 current second-pass records against 323 required, 42 questions with correction provenance, 1,611 final semantic PASS records, and zero unresolved issues. Review was performed sequentially in this conversation; no independent reviewer approval is claimed.

The learner-visible source title remains information already present in the key-free audit projection. The redesign does not expose guide conclusions or remove essential question context. The evidence resolver now numbers unnumbered prose by one-based source order instead of displaying `Sentence 0`.

## Release evidence boundary

Pre-release local browser acceptance passed the question-first boot, correct and incorrect feedback, feedback reload, all-five-type rendering, lesson completion, automatic next launch, historical review, remediation, parent route, privacy-request, and responsive-layout cases. The complete lint, typecheck, test, semantic, truth, build, secret/prohibited-file, whitespace, Git, deployment, and exact deployed-browser results are recorded against the final synchronized SHA in the external completion response. This committed report does not predict or self-certify a future deployment SHA.

Phase 7 remains historically complete. This release adds no pack, lesson, source, question, support target, benchmark, Grade 4 work, FAST timed practice, or Phase 10 work.
