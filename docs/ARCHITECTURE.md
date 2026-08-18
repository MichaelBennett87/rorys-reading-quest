# Architecture (Phase 0)

## Presentation Layer

- React + TypeScript with a local presentation state machine (no router dependency in Phase 1).
- Reusable screen and component boundaries for child shell navigation:
  - `src/app/AppShell.tsx`
  - `src/screens/*`
  - `src/components/*`
- Semantic HTML with accessible labels and visible focus styles.
- No router, no global store, and no backend in Phase 1.

## Domain Layer

- `src/domain/progression` contains pure logic for decisioning:
  - Checkpoint evaluation
  - Activity selection rules
  - Review scheduling
- `src/domain/content` contains:
  - Typed content models
  - Validator
  - Small sample set
- No side effects, no network calls.

## Content Layer

- In-repo typed content data structures.
- Each item carries grade band, skill ids, grade-level references, difficulty, review status, and version metadata.
- DRAFT-only sample is intended for internal development use only.

## Local Persistence Boundary

- No persistence is implemented in Phase 0.
- Planned boundary in later phases:
  - Local-only storage for session state and skill history.
  - No external account dependency.

## Browser Speech Boundary

- No speech synthesis used in Phase 0.
- Future phases reserve a boundary for assistance audio logic.

## Future PWA Boundary

- No PWA runtime support in Phase 0.
- Build remains standard Vite static output so future installability can be added later without backend dependency.

## Tests

- Domain functions are covered by deterministic unit tests.
- Screen-level shell tests cover navigation transitions and input states.
- Added coverage for accessibility basics and placeholder lesson-ready behavior.
- Tests run via Vitest with local TypeScript configuration.
