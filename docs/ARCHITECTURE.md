# Architecture (Phase 0)

## Presentation Layer

- React + TypeScript with one shell component.
- Semantic HTML with accessible labels and visible focus states.
- No router or global state library in Phase 0.

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
- Shell render test ensures baseline app starts.
- Tests run via Vitest with local TypeScript configuration.
