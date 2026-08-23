# Product Specification (Phase 2)
## Scope

- Add a playable in-app lesson runtime over local sample content.
- Implement five question types with deterministic scoring.
- Keep all behavior local and child-safe.
- Do not connect progression decisions, persistence, parent dashboard, audio, sound-out, or PWA features in this phase.

## Lesson Runtime

### Flow

1. Lesson intro from unit card (`lesson_ready`).
2. Passage + question stack (`lesson_run`).
3. One question at a time; no automatic progression.
4. Submit only after a valid selection.
5. Show supportive feedback and explanation.
6. Continue to next question via explicit action.
7. Show completion screen with temporary score summary.

### Question rendering rules

- Multiple choice: one selection.
- Multiselect: multiple selections; exact set match required.
- Hot text: selectable text segments (single or multiple depending on prompt config).
- Two-part evidence: Part A and Part B both required.
- Table match: one response per row, one select per row.

## Feedback philosophy

- Feedback must be supportive, non-judgmental, and child-safe.
- Suggested messages:
  - Correct: “Great clue-finding!”
  - Incorrect: “Not quite. Let’s look at the clue.”
- Show brief explanation always after submission.
- Do not show words such as FAILED, FAILURE, BAD, BEHIND, BAD READER, WRONG LEVEL.

## Completion result

- Completion always produces:
  - `lessonId`, `activityId`, `skillId`, `difficulty`, `totalQuestions`, `correctAnswers`, `firstAttemptCorrect`, `accuracy`, `assistanceUsed`, `questionResults`, `completed`
- Temporary star rules (local only):
  - `90–100% = 3`
  - `70–89% = 2`
  - `< 70% = 1`
- At least one star is always awarded.
- No FAST score or official placement claims are produced.

## Development content

- Keep content local and clearly marked.
- Current phase 2 sample includes:
  - 2 original passages
  - 10 questions
  - all five supported question formats represented
- All questions include explanations for traceability and teaching support.

## Accessibility

- Keep fieldset/legend structure for question prompts.
- Keyboard-selectable controls, visible focus, and disabled state visibility.
- No timers and no automatic submission or timer-based scoring.

## Future connection

- Phase 3 can consume `LessonResult` to drive adaptive activity selection and progression without changing question rendering logic.

## Phase 5A Parent Foundation

Phase 5A adds a separate local parent-access gate and parent analytics foundation without changing the child lesson runtime. The child progress store, lesson flow, rewards, and adaptive progression continue to use their existing contracts. Parent summaries are derived from canonical child progress and current authored content metadata only.

## Phase 5B1 Parent Dashboard Presentation

Phase 5B1 keeps the same local data sources and adds a read-only Parent Dashboard shell. The dashboard exposes overview metrics, reporting categories, benchmark and skill drill-downs, recent sessions, review summaries, word-help summaries, and a read-only assessments placeholder. It does not add parent record mutation, print/export, or any child-learning changes.

## Phase 5B2 Parent Dashboard Completion

Phase 5B2 adds local official-assessment management and a print-summary preview to the authenticated parent area. Assessment records are entered manually from official reports, stored only in the browser, and never affect child progression, XP, stars, or review scheduling. Print Summary is an explicit parent action that opens a local preview before calling the browser print dialog; it does not create a download or PDF artifact.

## Phase 6A1 through Phase 6C3 Grade 2 Bridge Content

Phase 6A1 adds the first scalable Grade 2 content pack without changing the lesson engine or parent systems. Phase 6A2 adds the second registered Word Forge pack, Phase 6B1 adds the Syllable Summit pack for two-syllable, open-syllable, and closed-syllable work, Phase 6B2 adds consonant-`le` practice to complete authored `ELA.2.F.1.3c` coverage, Phase 6C1 adds Prefix Power common-prefix practice, Phase 6C2 adds Suffix Station common-suffix practice, Phase 6C3 adds Quiet Letter Quest silent-letter practice, Phase 6C4 adds Fluency Flight supportive practice, Phase 6D1 adds the first active Story Scouts pack, Phase 6D2 adds Story Scouts Theme Trail for `ELA.2.R.1.2`, Phase 6D3 adds Story Scouts Perspective Portal for `ELA.2.R.1.3`, and Phase 6D4 adds Poetry Planet Rhyme Routes for `ELA.2.R.1.4`. Phase 6E0 keeps Information Detectives and Context Cavern as planned shells, Phase 6E1 adds the first active Information Detectives pack for `ELA.2.R.2.1`, Phase 6E2 adds Central Idea Center for `ELA.2.R.2.2`, Phase 6E3 adds Purpose Path for `ELA.2.R.2.3`, Phase 6E4 adds Opinion & Evidence Desk for `ELA.2.R.2.4`, Phase 6E5 adds Context Cavern Academic Word Workshop for `ELA.2.V.1.1`, and Phase 6E6 adds Context Cavern Morphology Mine for `ELA.2.V.1.2`, and Phase 6E7 adds Context Cavern Meaning Clue Chamber for `ELA.2.V.1.3`. Phase 6F0 adds the Compare Castle roadmap shell and the Grade 2 baseline audit without adding production across-genres content. Together the bridge packs are DRAFT-only, locally authored, and registered across the Word Forge, Story Scouts, Poetry Planet, Information Detectives, Context Cavern, and Compare Castle trails while keeping fluency practice supportive rather than measured and preserving unit-affine review scheduling for Story Map, Theme Trail, Perspective Portal, Rhyme Routes, Text Feature Hunt, Central Idea Center, Purpose Path, Opinion & Evidence Desk, Academic Word Workshop, Morphology Mine, Meaning Clue Chamber, Wordplay Watchtower, Retell Hall, and Compare Keep. They cover the full listed `ELA.2.F.1.3a` pattern set through `oo`, `ea`, `ou`, `oi`, `oy`, and `ow`, `ELA.2.F.1.3b` in Phase 6B1, `ELA.2.F.1.3c` in Phases 6B1 and 6B2, `ELA.2.F.1.3d` in Phases 6C1 and 6C2, `ELA.2.F.1.3e` in Phase 6C3, `ELA.2.F.1.4` as supportive practice only in Phase 6C4, and `ELA.2.R.1.1`, `ELA.2.R.1.2`, `ELA.2.R.1.3`, `ELA.2.R.1.4`, `ELA.2.R.2.1`, `ELA.2.R.2.2`, `ELA.2.R.2.3`, `ELA.2.R.2.4`, `ELA.2.R.3.1`, `ELA.2.R.3.2`, `ELA.2.R.3.3`, `ELA.2.V.1.1`, `ELA.2.V.1.2`, and `ELA.2.V.1.3` in Phases 6D1 through 6F3. The work is supportive exposure and implemented DRAFT benchmark coverage where applicable, not complete benchmark mastery.

Phase 6D0 adds only the multi-world and multi-skill progression foundation needed for later prose and poetry packs. Phase 6D1 adds the first prose pack, Phase 6D2 adds Theme Trail, Phase 6D3 adds Perspective Portal, and Phase 6D4 adds Poetry Planet Rhyme Routes. Phase 6E0 keeps Information Detectives and Context Cavern as planned roadmap shells only, Phase 6E1 activates Information Detectives Text Feature Hunt while Context Cavern remains planned, Phase 6E2 activates Central Idea Center while preserving the later informational and vocabulary phases as planned, Phase 6E3 activates Purpose Path while preserving the later informational and vocabulary phases as planned, Phase 6E4 activates Opinion & Evidence Desk while preserving the later informational and vocabulary phases as planned, Phase 6E5 activates Context Cavern Academic Word Workshop while preserving Morphology Mine as planned, and Phase 6E6 activates Context Cavern Morphology Mine while preserving Meaning Clue Chamber as planned, and Phase 6E7 activates Meaning Clue Chamber while completing Phase 6E. Phase 6F0 adds the Compare Castle roadmap shell, keeps the across-genres benchmarks planned, and does not initialize any production progress. Phase 6F1 activates the first active Compare Castle pack, Wordplay Watchtower, and makes Compare Castle playable while Retell Hall remains planned. Phase 6F2 activates Retell Hall with structured authored retell choices. Phase 6F3 activates Compare Keep with structured authored paired-text comparison choices. Phase 6F4 completes the final Grade 2 audit and Phase 6 completion, and Phase 7 remains next.

Parent reporting treats this work as `Foundational Skills Bridge`, an internal practice category that stays separate from the official Grade 3 FAST reporting lanes. Phase 6F2 uses structured authored retell choices rather than spontaneous oral retelling or open-ended writing, and Phase 6F3 uses structured authored paired-text comparison choices rather than original written or oral comparison.
## Phase 6F0 compare-castle foundation

Phase 6F0 adds the planned Compare Castle world shell and the Grade 2 baseline audit only. It does not add production across-genres lessons, passages, questions, or support targets.

The production world ID is `compare-castle`, the child-facing world name is `Compare Castle`, and the track display name is `Across-Genre Reading`.

Phase 6F1 covers `ELA.2.R.3.1` with similes, idioms, and alliteration in DRAFT Wordplay Watchtower content.
Phase 6F2 covers `ELA.2.R.3.2` with structured authored retell choices for literary and informational retelling.
Phase 6F3 covers `ELA.2.R.3.3` with structured authored paired-text comparison of important details.

Phase 6F0 documents the retell measurement boundary, the paired-text architecture boundary, and the figurative-language boundary before any production across-genres content exists.
