# Rory's Reading Quest

## Purpose

Rory's Reading Quest is a local-first, child-safe reading-learning foundation for Grade 2–4 progression.

The current work is **Phase 1 (Child Shell and Navigation)**. It builds from:

- a minimal React shell,
- deterministic progression domain logic from Phase 0,
- a child-facing local demo shell with world, unit, and lesson-ready navigation.
- updated architecture documentation and test coverage.

This repository intentionally uses only original sample material and does not deliver official FAST scores.

## Current Status

- Status: `Phase 1 complete` (navigation shell only).
- Still no lesson engine, persistence, parent dashboard, audio, router, or backend.
- No account system, no remote services, and no real content scoring.

## Privacy Warning

This version contains no student identifiers, no school credentials, and no private child data.
Only original sample content marked as DRAFT is included.

## Commands

- `npm install` — install dependencies.
- `npm run dev` — start local development server.
- `npm run build` — TypeScript + production build.
- `npm run lint` — run lint checks.
- `npm run typecheck` — TypeScript type checking.
- `npm run test` — run focused Phase 0 tests.
- `npm run preview` — preview production build artifacts.

## Architecture Summary

- **Presentation**: small React/TypeScript shell (`src/App.tsx`) with no router or backend dependency.
- **Domain**: deterministic progression and content modules under `src/domain`.
- **Content**: typed sample content for one Grade 2 bridge skill variant set plus validator.
- **Storage**: none in Phase 0.
- **Runtime services**: browser only, no external requests.

## Content Integrity

- All content is original and explicitly marked with review status.
- Only DRAFT sample content is present in this phase.
- No real-child outcome is claimed by this phase.

## FAST/FAST Score Guidance

This phase is not an official assessment system. It does not claim to produce official FAST scores.
