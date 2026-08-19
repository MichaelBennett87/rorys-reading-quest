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
