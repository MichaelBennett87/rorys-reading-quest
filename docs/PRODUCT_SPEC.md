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

## Phase 6A1 through Phase 6C2 Grade 2 Bridge Content

Phase 6A1 adds the first scalable Grade 2 content pack without changing the lesson engine or parent systems. Phase 6A2 adds the second registered Word Forge pack, Phase 6B1 adds the Syllable Summit pack for two-syllable, open-syllable, and closed-syllable work, Phase 6B2 adds consonant-`le` practice to complete authored `ELA.2.F.1.3c` coverage, Phase 6C1 adds Prefix Power common-prefix practice, and Phase 6C2 adds Suffix Station common-suffix practice. Together the bridge packs are DRAFT-only, locally authored, and registered as one active Word Forge unit plus legacy history-preserving content. They cover the full listed `ELA.2.F.1.3a` pattern set through `oo`, `ea`, `ou`, `oi`, `oy`, and `ow`, `ELA.2.F.1.3b` in Phase 6B1, `ELA.2.F.1.3c` in Phases 6B1 and 6B2, and implemented DRAFT `ELA.2.F.1.3d` coverage across Phase 6C1 and Phase 6C2. The work is supportive exposure and implemented DRAFT benchmark coverage, not complete benchmark mastery.

Parent reporting treats this work as `Foundational Skills Bridge`, an internal practice category that stays separate from the official Grade 3 FAST reporting lanes.
