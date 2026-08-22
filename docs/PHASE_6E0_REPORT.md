# Phase 6E0 Report

## Phase 6D4 completion reconciliation

- `docs/PHASE_6D4_REPORT.md` has been reconciled to preserve the final synchronized Phase 6D4 facts.
- The record keeps Phase 6D4 completion separate from Phase 6E0 planning.
- The report preserves the final Phase 6D4 boundary, including Poetry Planet coverage and the note that Phase 6E remains next.

## TASKS reconciliation

- Phase 6 nesting is corrected.
- Phase 6D is marked complete.
- Phase 6E is split into bounded subphases.
- Phase 6E0 is marked complete.
- Phase 6E1 through Phase 6E7 remain incomplete.

## Active curriculum totals

- Active packs: 12
- Active lessons: 84
- Active passages: 84
- Active questions: 479
- Active support targets: 334

These totals are unchanged from Phase 6D4 because Phase 6E0 adds no content.

## Verification summary

- Lint passed with zero warnings.
- Typecheck passed.
- Tests passed: 41 files, 246 tests.
- Build passed.
- `git diff --check` passed.
- The Vite chunk-size warning remained present.

## Bundle-size comparison

- Largest JavaScript asset: `dist/assets/index-nXVzOFwe.js`
- Raw size: 1,222.84 kB
- Gzip size: 225.01 kB
- Change from the Phase 6D4 baseline: +5.13 kB raw, +1.32 kB gzip

## Phase 6E subphase split

- Phase 6E0: Information Detectives and vocabulary-world foundation
- Phase 6E1: text features and ELA.2.R.2.1
- Phase 6E2: central idea and relevant details for ELA.2.R.2.2
- Phase 6E3: author's purpose for ELA.2.R.2.3
- Phase 6E4: opinion and supporting evidence for ELA.2.R.2.4
- Phase 6E5: academic-vocabulary practice and Context Cavern foundation
- Phase 6E6: morphology and ELA.2.V.1.2
- Phase 6E7: context, word relationships, reference materials, background knowledge, and final Phase 6E audit

## Information Detectives track

- Track ID: `g2-information-detectives-reading`
- Skill ID: `g2-information-detectives-reading`
- World ID: `information-detectives`
- Entry unit: `id-unit-1`
- Units:
  - `id-unit-1` Text Feature Hunt
  - `id-unit-2` Central Idea Center
  - `id-unit-3` Purpose Path
  - `id-unit-4` Opinion & Evidence Desk
- Status: planned until content exists

## Context Cavern track

- Track ID: `g2-context-cavern-vocabulary`
- Skill ID: `g2-context-cavern-vocabulary`
- World ID: `context-cavern`
- Entry unit: `cc-unit-1`
- Units:
  - `cc-unit-1` Academic Word Workshop
  - `cc-unit-2` Morphology Mine
  - `cc-unit-3` Meaning Clue Chamber
- Status: planned until content exists

## Corrected roadmap naming

- The active curriculum roadmap uses Information Detectives and Context Cavern names that match the application.
- The roadmap no longer relies on the old Info Lab or Vocabulary Lab naming in active future-track entries.

## Sequential-world configuration

- A pure sequential-world configuration exists for future linear worlds.
- It describes locked roadmap shells for Information Detectives and Context Cavern.
- It is used only for safe derivation and planning boundaries.
- It does not persist learner progress.

## No-content activation behavior

- Information Detectives remains non-playable in production until content exists.
- Context Cavern remains non-playable in production until content exists.
- Planned tracks do not create progress entries without active content.
- Empty planned tracks do not appear as earned progress.
- Empty planned tracks do not block playable tracks.

## Safe progress initialization

- Future Information Detectives and Context Cavern fixtures initialize only their matching skill progress.
- Existing Word Forge, Story Scouts, and Poetry Planet progress remains unchanged.
- XP, stars, attempts, reviews, and assessments remain unchanged.

## Fixture planning behavior

- Fixture-only candidates can make Information Detectives or Context Cavern playable for tests.
- Fixture planning remains unit-affine and deterministic.
- Another unit's plan does not unlock the selected unit.
- Production behavior stays locked or coming later.

## Global-planner compatibility

- The global planner remains deterministic.
- Planned empty tracks are ignored when no active candidates exist.
- Balanced progression still favors active, verification, remediation, and due-review priorities in the existing order.
- Existing playable tracks remain unchanged.

## Academic-vocabulary measurement limitation

- ELA.2.V.1.1 remains planned.
- The application cannot independently verify spoken or open-ended vocabulary use.
- Phase 6E0 does not add microphone access, speech recognition, or a live evaluator.
- Phase 6E5 will need a bounded practice model before any implementation status can be assigned.

## Persistence compatibility

- No storage keys changed.
- No schema version changed.
- Existing progress records remain readable.
- No raw roadmap text is persisted.
- No raw future benchmark description is persisted.

## Parent and print behavior

- Parent Dashboard does not show empty planned tracks as failure.
- Print Summary does not print empty future tracks as poor performance.
- Friendly labels resolve safely for future-track shells in fixtures.
- Raw future skill IDs are not used as primary labels.

## No-content boundary

- Phase 6E0 adds no passages.
- Phase 6E0 adds no questions.
- Phase 6E0 adds no support targets.
- Phase 6E0 adds no content packs.
- Phase 6E0 adds no benchmark implementations.

## Phase 6D4 report state

- The Phase 6D4 completion record remains synchronized to the final Phase 6D4 facts.
- The implementation checkpoint remains distinct from the final synchronized repository state.

## Exact Phase 6E1 scope

- Phase 6E1 will focus on Information Detectives text features for ELA.2.R.2.1.
- It will remain bounded to informational reading only.
- It will not begin during Phase 6E0.
