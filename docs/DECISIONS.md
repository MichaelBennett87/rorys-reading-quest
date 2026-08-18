# Design Decisions Log

## 2026-08-18 — Phase 0 Foundations

- Decision: Keep all logic local and deterministic with pure TypeScript modules.
- Reason: Aligns with local-first, minimal-dependency constraints.
- Consequence: Progression and content rules are testable without runtime services.
- Status: Applied

## 2026-08-18 — UI Scope

- Decision: Implement a compact shell only with title, three-path card, and parent placeholder.
- Reason: The phase requires minimal UI surface and no dashboard/map expansion.
- Consequence: No routing, no backend, no audio, and no parent dashboard in this phase.
- Status: Applied

## 2026-08-18 — Sampling Strategy

- Decision: Use one Grade 2 bridge skill with three fresh activity variants and DRAFT content state.
- Reason: Phase 0 requirement is a tiny developmental sample, not production curriculum.
- Consequence: Small deterministic content set for rule verification and testing.
- Status: Applied

## 2026-08-18 — Progression Rule Coverage

- Decision: Implement two-step mastery requirement and two-failure prerequisite return logic explicitly.
- Reason: These are direct acceptance criteria and must be verifiable by tests.
- Consequence: `evaluateCheckpoint` returns structured decisions and reason codes; no predictive scoring.
- Status: Applied

## 2026-08-18 — Phase 1 Navigation Approach

- Decision: Use a local `AppShell` screen state instead of a router for navigation.
- Reason: Keeps shell implementation minimal and avoids introducing routing dependency before gameplay exists.
- Consequence: Navigation transitions are explicit and testable via component state and back behavior.
- Status: Applied

## 2026-08-18 — Difficulty Naming

- Decision: Display child-facing difficulty as “Trail 1/Trail 2/Trail 3.”
- Reason: Numeric values are retained internally, but friendly labels reduce learner load.
- Consequence: Unit cards and world progress text use trail naming while data remains plain labels.
- Status: Applied

## 2026-08-18 — Demo Boundaries

- Decision: Use fixed static demo data for learner, worlds, and units with no persistence.
- Reason: Phase 1 scope is shell and navigation only.
- Consequence: Navigation is deterministic and repeatable; no analytics or storage changes introduced.
- Status: Applied

## 2026-08-18 — Styling Strategy

- Decision: Use shared design tokens plus lightweight CSS with inline SVG iconography.
- Reason: Keeps visual direction colorful and adventurous while avoiding extra styling dependencies.
- Consequence: New tokens in `src/index.css` and reusable classes in `src/App.css`; no third-party CSS framework used.
- Status: Applied
