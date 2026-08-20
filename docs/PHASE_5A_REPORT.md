# Phase 5A Report

## Summary

Phase 5A adds the local parent-data foundation required for the later dashboard phase. The child learning flow remains unchanged. Parent analytics are derived purely from canonical child progress, assistance summaries, review state, and current authored content metadata.

## Why Phase 5 Was Split

Spark was unavailable, so Phase 5 is split into a bounded foundation phase and a later presentation phase. This keeps the first step small, deterministic, and reversible while preserving all child behavior.

## Parent Analytics Architecture

- `src/domain/dashboard/*` builds overview, category, benchmark, skill, recent-attempt, word-help, review, and attention summaries.
- Parent-friendly progression explanations map structured child progression outcomes into calm, readable text.
- All analytics are pure and deterministic and accept an injected timestamp for time-sensitive summaries.
- Missing or unclassified history remains explicit instead of being guessed.

## Parent Access and Storage

- Parent access uses the local key `rorys-reading-quest.parent-access.v1`.
- Official assessment records use the local key `rorys-reading-quest.parent-records.v1`.
- The child-progress key remains `rorys-reading-quest.progress.v1` and is unchanged.
- Parent PIN material stores only hashed values and salts through a browser-crypto boundary. Plaintext PINs are never persisted.
- Unsupported cryptography fails closed so child gameplay remains available while parent unlock is unavailable.

## Assessment Record Model

Phase 5A adds a local parent-entered assessment record shape for later use. Records are validated for supported window, grade band, integer score, date bounds, and optional reported achievement or percentile values. The model does not alter adaptive progression or rewards.

## Minimal Parent Area

The old placeholder now acts as a small authenticated parent foundation screen. It supports PIN setup, unlock, lock, and a bounded summary view with completed sessions, XP, stars, due reviews, current attention items, and a note that the detailed dashboard arrives in Phase 5B.

## Tests Added

- Dashboard analytics summaries and parent explanations.
- Assessment record validation.
- Separate parent-access and parent-record persistence.
- Browser PIN setup and verification service behavior.
- Parent Area setup, unlock, lock, and fallback flows.

## Known Limitations

- The detailed parent dashboard, assessment-entry UI, and print/export views remain deferred.
- Local PIN gating is a convenience control, not device security.
- Parent unlock state is memory-only and clears on reload.

## Deferred Phase 5B Scope

Phase 5B will build the polished dashboard screens, FAST category and benchmark views, skill drill-downs, recent-session details, assessment entry and editing UI, and the print-friendly parent summary.