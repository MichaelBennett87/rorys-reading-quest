# Phase 4 Report

## Summary

Phase 4 adds curated sound-out assistance for authored target words. The implementation stays local, uses only browser-provided speech synthesis when available, and persists assistance in a privacy-safe way alongside the existing phase 3 progress state.

## Support Ladder

1. Notice the Pattern
1. Break It Apart
1. Hear the Parts
1. Blend It
1. Hear the Word
1. Hear the Sentence

Visual steps remain usable without speech. Speech begins only after explicit learner action and can be stopped or canceled on navigation, unmount, or lesson completion.

## Curated Support Data

- 2 DRAFT passages now carry 9 authored support targets.
- Targets include focus parts, authored display chunks, spoken chunks, blend text, whole-word text, and sentence text.
- Support data is authored and validated; no automatic syllable or chunk generation is used.

## Domain and Progression

- Assistance events are deterministic and idempotent.
- Lesson results now include a privacy-safe assistance summary.
- Any used assistance prevents the attempt from counting as independent mastery evidence.
- Strong assisted work preserves rewards and score while planning a fresh same-difficulty opportunity.

## Persistence

- Storage remains `rorys-reading-quest.progress.v1`.
- Active sessions now persist bounded assistance events.
- Completed attempts store assistance summaries and privacy-safe event metadata only.
- Legacy version-1 state without assistance fields still loads with empty assistance defaults.

## Speech Boundary

- Browser speech is optional and local to the device/browser.
- No external speech provider is configured.
- No microphone permission is requested.
- Unsupported browsers keep the visual help ladder usable and show a calm notice.

## Tests Added

- Assistance event idempotency and summary mapping.
- Support metadata validation for valid and duplicate targets.
- Legacy persistence loading with empty assistance defaults.

## Known Limitations

- Browser speech quality and voice availability vary by browser and device.
- The project does not provide parent-facing dashboards, live AI, audio recording, or external content services.

## Deferred Scope

- Parent dashboard and review tools.
- Additional curriculum expansion.
- PWA/offline installability work.
- Phase 5 features and later curriculum phases.
