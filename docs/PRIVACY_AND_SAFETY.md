# Privacy and Safety

## Local-First Principles

- Progress is stored only in browser localStorage behind a versioned interface.
- No telemetry, analytics, advertising, backend, cloud sync, runtime API, or child-facing live AI is used.
- The application continues in memory if localStorage is unavailable, malformed, unsupported, or throws.
- Technical storage detail stays in development/test contracts; child-facing notices are calm and do not expose raw JSON or stack traces.
- Browser speech is optional, local to the browser, and only used after an explicit learner action. The app does not request microphone access or configure an external speech provider.

## Data Minimization

Persisted version-1 state uses a generic `local-learner` ID and may contain stable lesson/activity/question IDs, correctness summaries, submitted option/segment IDs needed for active recovery, accuracy, assistance count, progression outcomes, review dates, rewards, assistance-event IDs/kinds/levels/targets, assistance summaries, and timestamps.

It does not persist passage or explanation text, correct-answer text, full answer text, spoken text, surname, birth date, school, student ID, official FAST report or score, address, credentials, remote identifiers, analytics identifiers, advertising identifiers, or voice objects.

## Safety Controls

- Completed history is capped at 250 attempts and recent use at 12 entries per trail.
- Completion IDs prevent duplicate attempts, XP, stars, mastery evidence, and failure counters.
- Incompatible active content discards only the active session and preserves completed progress and rewards.
- Rewards are deterministic, never subtracted, and are not evidence of mastery.
- Child-facing progression copy avoids punitive, diagnostic, or demoting language.
- Word-help assistance is supportive only; it never deducts rewards and never silently turns an assisted attempt into independent mastery.

## Deferred Controls

Parent dashboard/PIN, additional curriculum expansion, PWA behavior, accounts, remote sync, and official assessment reporting remain deferred. Browser speech support is local-only and limited to the browser's own capabilities.

## Phase 5A Parent Data Boundary

Parent access uses a separate local store with hashed PIN material only. Official assessment records use a separate local store. Neither store writes to the child-progress key, and neither store is required for child gameplay to continue. Plaintext PINs, surnames, birth dates, student IDs, school data, report images, and other child-sensitive records stay out of persisted progress. When browser cryptography is unavailable, parent unlocking fails closed and child play remains available.

## Phase 5B1 Parent Dashboard Privacy

The read-only parent dashboard reuses the same local progress and assessment stores. It presents aggregate summaries, privacy-safe session metadata, and read-only assessment counts without exposing passage text, answers, spoken text, PIN material, or raw assistance events. Dashboard navigation never writes to child progress or parent assessment records.

## Phase 5B2 Assessment and Print Boundary

Assessment records stay local, use the separate parent-record store, and store only stable IDs plus official report values entered by a parent. The UI never stores report images, uploaded files, or narrative notes. Print Summary uses the browser print dialog only after explicit parent action and does not send content to an external service or create a PDF download artifact.

## Phase 6A1 through Phase 6C3 Curriculum Boundary

Phase 6A1, Phase 6A2, Phase 6B1, Phase 6B2, Phase 6C1, Phase 6C2, Phase 6C3, and Phase 6C4 keep all new Grade 2 content local, original, and DRAFT-only. Phase 6D0 keeps the same boundary and adds no new passages, questions, or content packs; Phase 6D1 adds only the first Story Scouts prose pack, Phase 6D2 adds Theme Trail practice without theme-development, perspective, or poetry content, Phase 6D3 adds Perspective Portal without narrator-point-of-view scoring, and Phase 6D4 adds Poetry Planet rhyme-scheme practice without free verse, haiku, limerick, meter, or rhyme-meaning analysis. The bridge packs do not call a runtime content-generation service, do not browse external curriculum sources at runtime, and do not add official fluency scoring. Audio remains optional and browser-provided only, with no microphone access or speech recognition. Phase 6C1 adds common-prefix practice and Prefix Power gating, Phase 6C2 adds common-suffix practice and Suffix Station gating, Phase 6C3 adds a bounded silent-letter set and Quiet Letter Quest gating, Phase 6C4 adds Fluency Flight supportive practice without oral measurement, Phase 6D1 adds Story Scouts story-map practice, Phase 6D2 adds Story Scouts theme practice, Phase 6D3 adds Story Scouts perspective practice, and Phase 6D4 adds Poetry Planet rhyme practice, all without any new sensitive data collection. Legacy lesson history remains local and readable without exposing child-sensitive identifiers or persisted raw passage text.
