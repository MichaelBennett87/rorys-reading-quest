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
