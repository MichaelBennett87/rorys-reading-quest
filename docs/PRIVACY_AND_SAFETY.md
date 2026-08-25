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

Phase 6A1, Phase 6A2, Phase 6B1, Phase 6B2, Phase 6C1, Phase 6C2, Phase 6C3, and Phase 6C4 keep all new Grade 2 content local, original, and DRAFT-only. Phase 6D0 keeps the same boundary and adds no new passages, questions, or content packs; Phase 6D1 adds only the first Story Scouts prose pack, Phase 6D2 adds Theme Trail practice without theme-development, perspective, or poetry content, Phase 6D3 adds Perspective Portal without narrator-point-of-view scoring, and Phase 6D4 adds Poetry Planet rhyme-scheme practice without free verse, haiku, limerick, meter, or rhyme-meaning analysis. Phase 6E0 adds only planned Information Detectives and Context Cavern shells, Phase 6E1 adds original informational text-feature practice without external images, remote maps, or embedded third-party charts, Phase 6E2 adds original central-idea practice without Grade 3 explanation-of-support prompts or persisted guide data, Phase 6E3 adds original author-purpose practice without Grade 3 purpose-development prompts or persisted guide data, Phase 6E4 adds original opinion and supporting-evidence practice without argument-analysis prompts or persisted guide data, Phase 6E5 adds original academic-vocabulary practice in Context Cavern without microphone access, speech recognition, persisted guide data, or runtime evaluator services, Phase 6E6 adds original morphology practice in Context Cavern without Greek or Latin roots, context-clue scoring, reference-material scoring, or background-knowledge scoring, and Phase 6E7 adds original meaning-clue practice in Context Cavern without figurative-language scoring, multiple-meaning-word scoring, phrase-meaning scoring, connotation or denotation terminology, or remote reference services. The bridge packs do not call a runtime content-generation service, do not browse external curriculum sources at runtime, and do not add official fluency scoring. Audio remains optional and browser-provided only, with no microphone access or speech recognition. Phase 6C1 adds common-prefix practice and Prefix Power gating, Phase 6C2 adds common-suffix practice and Suffix Station gating, Phase 6C3 adds a bounded silent-letter set and Quiet Letter Quest gating, Phase 6C4 adds Fluency Flight supportive practice without oral measurement, Phase 6D1 adds Story Scouts story-map practice, Phase 6D2 adds Story Scouts theme practice, Phase 6D3 adds Story Scouts perspective practice, and Phase 6D4 adds Poetry Planet rhyme practice, all without any new sensitive data collection. Legacy lesson history remains local and readable without exposing child-sensitive identifiers or persisted raw passage text. `ELA.2.V.1.1` is now implemented in DRAFT through Context Cavern Academic Word Workshop, `ELA.2.V.1.2` is now implemented in DRAFT through Context Cavern Morphology Mine, while later Context Cavern phases remain planned.
## Phase 6F1 privacy and boundary note

Phase 6F0 adds no child data, no assessment data, no external service, no telemetry, and no live AI. Phase 6F1 adds original Wordplay Watchtower content, Phase 6F2 adds original Retell Hall content, and Phase 6F3 adds original Compare Keep content while keeping Phase 6F4 as the final audit boundary. Phase 6F4 completed the final audit without adding new child data or persistence fields. The Compare Castle roadmap and Grade 2 benchmark inventory remain documentation and planning artifacts only; they do not persist learner text, roadmap prose, or benchmark descriptions as child records.

The retell boundary remains authored and structured. The paired-text boundary is structured authored paired-text comparison. Compare Castle is active in child-facing views, Retell Hall is active as structured authored retell work, and Compare Keep is active as structured authored paired-text comparison work; none of these phases must surface as failure or zero-percent performance states.

## Phase 6.5 production-initialization note

Phase 6.5 does not add new persisted learner fields. New production progress starts at zero rewards, and the one-time legacy cleanup only trims the known demo baseline from old saves when it is safe to do so. Attempts, reviews, assessments, assistance history, and PIN state remain intact.

Phonics speech remains optional browser SpeechSynthesis output. Hear the Parts uses a local chunk sequence, Hear the Word uses a whole-word request, and historical level-4 blended-word summaries remain readable for older saves, but no microphone, recording, external speech provider, learner audio, analytics, or telemetry is introduced. Visual and speech preferences are not used to alter curriculum selection or mastery decisions.

## Phase 7A0 privacy boundary

Grade 3 roadmap and FAST blueprint metadata contain no child data and are not persisted. Planned tracks do not initialize progress without active unlocked content. Parent assessments do not unlock grade transitions. Existing child progress, parent access, and parent record keys remain unchanged at schema version 1, and no grade-level mastery diagnosis or FAST prediction is introduced.

## Phase 7A1 privacy boundary

Root Reactor persists the same bounded attempt, progress, review, reward, and assistance event data as existing lessons. Passage text, root-guide content, root meanings, question text, answer text, explanations, and Word Help curriculum text are not persisted or printed. Browser speech remains optional local `SpeechSynthesis`; there is no microphone, oral score, external speech provider, analytics, telemetry, backend, or live AI. Parent and print views identify Grade 3 Word Forge only after real learner data exists and do not expose root-answer metadata.

## Phase 7A1.5 audit-data boundary

Question-truth ledgers contain only local authored curriculum identifiers, visible authored answer text, concise audit conclusions, and deterministic content fingerprints. They contain no learner selections, child identifiers, session data, progress, rewards, parent records, assessment records, PIN material, or hidden reasoning. The ledgers are not loaded into persistence and are not printed in parent summaries.

Feedback decoration is derived from the in-memory evaluator result already used by the lesson screen. It adds no storage field and sends no data anywhere. The phase adds no backend, cloud service, analytics, telemetry, microphone, external speech provider, or live AI.

## Phase 7A2 curriculum-data boundary

Suffix Shifter persists only the existing bounded attempt, skill, review, reward, and assistance records. It does not persist passages, derivational guides, base/derived roles, transformation explanations, question or answer text, evidence text, or Word Help curriculum content. Parent and print views use friendly lesson/unit metadata and never expose guide answers or learner answer text. Storage keys, schema version 1, Parent PIN cryptography, assessment records, local-only browser speech, and the no-backend/no-telemetry/no-microphone boundaries remain unchanged.

## Phase 7A3 curriculum-data boundary

Multisyllable Mountain uses the same bounded local attempt, skill, review, reward, and assistance records. Passage text, decoding guides, pronunciation chunks, morphology hints, decoding steps, questions, submitted answers, correct answers, evidence text, explanations, and Word Help curriculum text are not persisted or printed. Parent and print views may report `ELA.3.F.1.3` curriculum coverage as IMPLEMENTED / DRAFT only after real Grade 3 activity exists, and explicitly separate curriculum availability from learner mastery. They do not expose oral scores, FAST predictions, or a global grade diagnosis.

Storage keys, schema version 1, Parent PIN cryptography, assessments, optional local browser speech, the five-step Word Help contract, and the no-backend/no-cloud/no-analytics/no-telemetry/no-microphone/no-live-AI boundaries remain unchanged.

## Phase 7A4 fluency-support boundary

Grade 3 Fluency Flight persists only existing bounded attempt, skill, review, reward, assistance, and fluency-practice reflection fields. It does not persist passages, phrase groups, expression cues, modeled-reading text, teaching text, questions, submitted answers, correct answers, explanations, or Word Help curriculum text.

Optional model listening uses local browser `SpeechSynthesis`, never autoplays, and is not required to reach questions. Browser voice use is stored only as the existing boolean practice-summary fact; it is not interpreted as oral performance. There is no microphone permission, speech recognition, recording, WCPM, pronunciation score, prosody score, oral-accuracy score, expression score, automaticity score, backend, cloud sync, analytics, telemetry, advertising, external speech provider, or live AI.

Parent and print views may show practice sessions, question accuracy, assistance, friendly unit names, and `ELA.3.F.1.4` supportive-practice context. They do not print passage text, guide metadata, learner answer text, correct answers, oral scores, FAST predictions, or a global grade diagnosis.
## Phase 7B1 privacy and child-safety boundary

Character Arc Camp persists no passage text, dialogue, thoughts, stage statements, development summaries, guide metadata, question text, answer text, explanation text, or Word Help curriculum text. Parent and print views use friendly activity metadata and aggregate attempt facts only. The stories are original, child-safe DRAFT content without private child details, real private locations, trauma, shaming, analytics, telemetry, microphone use, cloud services, or live AI.

## Phase 7B2 privacy and child-safety boundary

Theme Development Trail persists no story text, supported or distractor theme statement, stage evidence, turning-point statement, guide metadata, question text, submitted answer, correct answer, explanation, or Word Help curriculum text. Parent and print views use benchmark, grade, unit, and aggregate progress facts only and explicitly separate curriculum coverage from learner mastery.

Storage keys, schema version 1, Parent PIN behavior, assessment records, bounded attempt history, active-session recovery, and optional local browser speech remain unchanged. The phase adds no backend, cloud sync, analytics, telemetry, advertising, microphone, speech recognition, external speech provider, or live AI.

## Phase 7B3 privacy and child-safety boundary

Perspective Portal persists no story text, character-perspective guide, perspective or motivation statement, dialogue/thought excerpt, comparison, change statement, question text, submitted answer, correct answer, explanation, or Word Help curriculum text. Parent and print surfaces use friendly benchmark, grade, unit, and aggregate progress facts only; implemented DRAFT curriculum coverage remains separate from learner mastery.

The stories use original child-safe situations and reasonable motivations, without private child details, real private locations, trauma, political or ideological conflict, shaming, villain/hero simplification, backend services, cloud sync, analytics, telemetry, microphone access, speech recognition, external speech, or live AI. Schema version 1, storage keys, Parent PIN, assessments, bounded attempt history, and active-session recovery remain unchanged.

## Phase 7B4 privacy boundary

Poem text, PoemFormGuide records, rhyme maps, classroom syllable notes, question text, explanations, and correct answers remain authored application content and are not copied into learner persistence or print output. Storage keys, schema version 1, the hashed Parent PIN record, assessment stores, bounded attempts, and active-session recovery are unchanged. Phase 7B4 adds no backend, cloud synchronization, analytics, telemetry, microphone, external speech provider, or live AI.

## Phase 7C1 privacy and accessibility boundary

Structure Station passages, headings, captions, diagram labels, timelines, sidebars, glossary text, `InformationalStructureGuide` records, question text, explanations, correct answers, and Word Help curriculum remain application content and are not copied into learner persistence or print output. Storage schema version 1, storage keys, the hashed Parent PIN record, assessments, bounded attempts, reviews, and active-session recovery are unchanged. Accessible headings, captions, text equivalents for structured diagrams, keyboard controls, focus, non-color-only feedback, and reduced motion remain required. Phase 7C1 adds no backend, cloud synchronization, analytics, telemetry, microphone, external speech service, or live AI.

## Phase 7C2 privacy and accessibility boundary

Central Idea Engine passages, section text, central-idea statements, detail classifications, `CentralIdeaGuide` records, questions, explanations, correct answers, and Word Help curriculum remain authored application content and are not copied into learner persistence or print output. Schema version 1, storage keys, the hashed Parent PIN record, assessments, bounded attempts, reviews, and active-session recovery remain unchanged. Semantic informational sections, keyboard controls, visible focus, non-color-only feedback, supported question interactions, reduced motion, and responsive layout remain required. Phase 7C2 adds no backend, cloud synchronization, analytics, telemetry, microphone, external speech service, or live AI.

## Phase 7C3 preservation

Journey-state reconciliation changes no storage key or schema version and preserves Parent PIN behavior, assessments, XP, stars, attempts, reviews, mastery evidence, and legitimate unfinished sessions. Purpose Development Path does not persist passage text, purpose guides, purpose statements, question text, explanations, correct answers, or Word Help curriculum text. No backend, telemetry, analytics, microphone, speech recognition, or live AI was added.

## Phase 7C4 privacy and accessibility boundary

Claim and Evidence Court does not persist passage text, `AuthorClaimGuide` metadata, claim statements, reasons, evidence text, questions, explanations, correct answers, or Word Help curriculum text. Parent and print surfaces use friendly benchmark, unit, curriculum-status, and aggregate progress facts only. Schema version 1, all storage keys, hashed Parent PIN behavior, assessment records, bounded attempts, reviews, assistance summaries, exact-once rewards, and active-session recovery are unchanged.

Semantic informational sections and headings, keyboard operation, visible focus, non-color-only feedback, accessible selected states, multiselect, hot text, table match, two-part questions, reduced motion, responsive layout, and text equivalents remain required. The phase adds no backend, cloud synchronization, analytics, telemetry, microphone, speech recognition, external speech provider, or live AI.
## Phase 7D1 privacy boundary

Figurative Fortress adds no network, child identifier, telemetry, analytics, microphone, speech recognition, or live-AI path. Source prose, poems, informational text, figurative guides, expressions, literal readings, intended meanings, questions, explanations, answer keys, and Word Help curriculum remain static registry content and are not copied into persisted progress or parent print output.

Schema version 1, the child-progress key, parent-access key, parent-records key, hashed Parent PIN behavior, assessment records, bounded attempts, active-session recovery, reviews, and assistance summaries remain unchanged. Print exposes friendly curriculum status and benchmark identity only after activity; it excludes source and guide content, submitted responses, correct answers, raw IDs, FAST prediction, and global diagnosis.
