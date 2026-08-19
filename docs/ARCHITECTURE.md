# Architecture (Phase 2)

## Presentation Layer

- React + TypeScript with a local `AppShell` state machine (`src/app/appView.ts`, `src/app/AppShell.tsx`).
- Phase 2 lesson screens:
  - `src/screens/LessonReadyScreen.tsx`
  - `src/screens/LessonScreen.tsx`
- Shared lesson UI:
  - `src/components/lesson/*`
- Semantic HTML with fieldsets/legends, keyboard controls, and visible focus styles.
- No router, backend, or external service layer is introduced.

## Domain Layer

- `src/domain/progression` remains the adaptive-ready foundation and is not wired in this phase.
- `src/domain/content` holds typed sample content and validation.
- `src/domain/lesson` now owns deterministic lesson runtime contracts:
  - `lessonTypes.ts` (union question model)
  - `evaluateAnswer.ts` (pure scoring)
  - `buildLessonResult.ts` (in-memory result object)
  - `lessonCatalog.ts` (unit-to-lesson lookup and launch preflight checks)
- All evaluators are pure and side-effect free.

## Content Model Boundary

- `Content` is still in-repo sample content under `src/domain/content/sampleContent.ts`.
- Each development question includes:
  - prompt text
  - `questionType` + `questionContent`
  - stable IDs for selectable elements
  - explanation and optional `evidenceReferenceIds`
- `validateContent` is extended for phase 2 question payload rules.

## Lesson Engine Flow

- App navigation adds `lesson_ready` and `lesson_run`.
- Runtime flow:
  1. lesson selection
  2. intro and question count
  3. question rendering by type
  4. answer submission and locked scoring
  5. feedback + explanation
  6. completion summary with temporary star result
- Results are currently session-local (memory only) and designed for future adaptive handoff.

## Boundaries Deferred to Later Phases

- Persistence: no localStorage/session storage writes.
- Progression engine wiring: not yet connected (Phase 3).
- Parent dashboard, parent PIN, audio, sound-out, and PWA functionality: not added.

## Validation & Test Coverage

- Pure domain tests for evaluation, result composition, validator behavior.
- UI tests for lesson launch, interaction, completion, and child-safe messaging.
- Accessibility checks remain part of UI test suite for focus, roles, and lockout behavior.
