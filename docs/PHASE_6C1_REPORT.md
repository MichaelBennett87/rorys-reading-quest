# Phase 6C1 Report

## Scope

Phase 6C1 adds common-prefix practice for `ELA.2.F.1.3d` through Prefix Power and keeps common suffixes deferred to Phase 6C2.

## Delivered curriculum

- Pack ID: `g2-word-forge-common-prefixes`
- Content version: `g2-wf-common-prefixes-r0.1.0`
- Benchmark alignment: `ELA.2.F.1.3d`
- Coverage status: partial
- Review status: DRAFT
- Active lessons: 7
- Active passages: 7
- Scored questions: 41
- Guided lessons: 2 at difficulty 4, 2 at difficulty 5
- Checkpoint lessons: 3 at difficulty 5
- Support targets: 28
- Active bridge packs: 5
- Total bridge lessons: 35
- Total bridge passages: 35
- Total bridge questions: 205

## Curriculum behavior

- Prefix Power is locked before difficulty 5.
- Prefix Power becomes available at difficulty 5.
- Prefix Power returns `CONTENT_NEEDED` at difficulty 6 until Phase 6C2 exists.
- Selected-unit planning stays unit-aware and does not silently replace another unit's active session.
- `ELA.2.F.1.3d` remains partial in DRAFT because common suffixes are deferred.

## Quality and safety

- All new content remains local, original, and DRAFT-only.
- No oral-reading scoring, microphone access, or live AI was added.
- Parent and print reporting continue to label this work as `Foundational Skills Bridge`.

## Verification

- Lint: passed
- Typecheck: passed
- Test: passed, 32 files / 181 tests
- Build: passed
- `git diff --check`: passed

## Bundle size

- Largest JavaScript asset: `dist/assets/index-BHPO943j.js`
- Raw size: 692.32 kB
- Gzip size: 143.16 kB
- Baseline comparison: +70.09 kB raw, +8.64 kB gzip versus the Phase 6B2 bundle
- Vite warning: `Some chunks are larger than 500 kB after minification. Consider:`

Curriculum data is increasing the initial bundle. Dynamic content-pack loading remains deferred to Phase 10 release hardening unless it becomes a functional blocker earlier.

## Remaining scope

- Phase 6C2 will add common suffixes and complete `ELA.2.F.1.3d`.
- Later Phase 6C subsections remain deferred.
