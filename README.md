# Rory's Reading Quest

## Purpose

Rory's Reading Quest is a local-first, child-safe reading-learning foundation for Grade 2–4 progression.

The current work is **Phase 0 (Foundation)**. It establishes:

- a minimal React shell,
- deterministic progression domain logic,
- a constrained content model,
- validation tooling for development content,
- and documentation required for later phases.

This repository intentionally uses only original sample material and does not deliver official FAST scores.

## Current Status

- Status: `Phase 0 foundation complete` (implementation scaffold only).
- Scope remains minimal and phase-limited.
- No production learning content, no remote services, and no account system are included.

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

## FAST/FASt Score Guidance

This phase is not an official assessment system. It does not claim to produce official FAST scores.
