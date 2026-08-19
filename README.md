# Rory's Reading Quest

## Purpose

Rory's Reading Quest is a local-first, child-safe reading-learning foundation for Grade 2–4 progression.

The current work is **Phase 2 (Lesson and Question Engine)**. It builds from:

- a minimal React shell,
- deterministic progression and lesson-domain modules from earlier phases,
- a local question runtime with five supported question types,
- child-friendly passage display, feedback, and completion result computation,
- updated architecture documentation and test coverage.

This repository intentionally uses only original sample material and does not deliver official FAST scores.

## Current Status

- Status: `Phase 2 complete` (deterministic in-memory lesson runtime).
- Still no persistence, parent dashboard, or adaptive progression connection.
- No audio, sound-out engine, or backend/router services yet.
- No account system, no remote services, and no official FAST reporting.

## Privacy Warning

This version contains no student identifiers, no school credentials, and no private child data.
Only original sample content marked as DRAFT is included.

## Commands

- `npm install` — install dependencies.
- `npm run dev` — start local development server.
- `npm run build` — TypeScript + production build.
- `npm run lint` — run lint checks.
- `npm run typecheck` — TypeScript type checking.
- `npm run test` — run focused lesson-phase tests.
- `npm run preview` — preview production build artifacts.

## Architecture Summary

- **Presentation**: small React/TypeScript shell (`src/App.tsx`) with no router or backend dependency.
- **Domain**: deterministic progression, lesson runtime, and content modules under `src/domain`.
- **Content**: typed sample content with 2 passages and 10 development questions across 5 question types plus validator.
- **Storage**: none in early phases.
- **Runtime services**: browser only, no external requests.

## Content Integrity

- All content is original and explicitly marked with review status.
- Only DRAFT sample content is present in this phase.
- No real-child outcome is claimed by this phase.

## FAST/FAST Score Guidance

This phase is not an official assessment system. It does not claim to produce official FAST scores.
