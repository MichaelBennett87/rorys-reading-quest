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
