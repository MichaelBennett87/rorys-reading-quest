# Product Specification (Phase 2)
## Scope

- Add a playable in-app lesson runtime over local sample content.
- Implement five question types with deterministic scoring.
- Keep all behavior local and child-safe.
- Do not connect progression decisions, persistence, parent dashboard, audio, sound-out, or PWA features in this phase.

## Lesson Runtime

### Flow

1. Lesson intro from unit card (`lesson_ready`).
2. Passage + question stack (`lesson_run`).
3. One question at a time; no automatic progression.
4. Submit only after a valid selection.
5. Show supportive feedback and explanation.
6. Continue to next question via explicit action.
7. Show completion screen with temporary score summary.

### Question rendering rules

- Multiple choice: one selection.
- Multiselect: multiple selections; exact set match required.
- Hot text: selectable text segments (single or multiple depending on prompt config).
- Two-part evidence: Part A and Part B both required.
- Table match: one response per row, one select per row.

## Feedback philosophy

- Feedback must be supportive, non-judgmental, and child-safe.
- Suggested messages:
  - Correct: “Great clue-finding!”
  - Incorrect: “Not quite. Let’s look at the clue.”
- Show brief explanation always after submission.
- Do not show words such as FAILED, FAILURE, BAD, BEHIND, BAD READER, WRONG LEVEL.

## Completion result

- Completion always produces:
  - `lessonId`, `activityId`, `skillId`, `difficulty`, `totalQuestions`, `correctAnswers`, `firstAttemptCorrect`, `accuracy`, `assistanceUsed`, `questionResults`, `completed`
- Temporary star rules (local only):
  - `90–100% = 3`
  - `70–89% = 2`
  - `< 70% = 1`
- At least one star is always awarded.
- No FAST score or official placement claims are produced.

## Development content

- Keep content local and clearly marked.
- Current phase 2 sample includes:
  - 2 original passages
  - 10 questions
  - all five supported question formats represented
- All questions include explanations for traceability and teaching support.

## Accessibility

- Keep fieldset/legend structure for question prompts.
- Keyboard-selectable controls, visible focus, and disabled state visibility.
- No timers and no automatic submission or timer-based scoring.

## Future connection

- Phase 3 can consume `LessonResult` to drive adaptive activity selection and progression without changing question rendering logic.

## Phase 5A Parent Foundation

Phase 5A adds a separate local parent-access gate and parent analytics foundation without changing the child lesson runtime. The child progress store, lesson flow, rewards, and adaptive progression continue to use their existing contracts. Parent summaries are derived from canonical child progress and current authored content metadata only.

## Phase 5B1 Parent Dashboard Presentation

Phase 5B1 keeps the same local data sources and adds a read-only Parent Dashboard shell. The dashboard exposes overview metrics, reporting categories, benchmark and skill drill-downs, recent sessions, review summaries, word-help summaries, and a read-only assessments placeholder. It does not add parent record mutation, print/export, or any child-learning changes.

## Phase 5B2 Parent Dashboard Completion

Phase 5B2 adds local official-assessment management and a print-summary preview to the authenticated parent area. Assessment records are entered manually from official reports, stored only in the browser, and never affect child progression, XP, stars, or review scheduling. Print Summary is an explicit parent action that opens a local preview before calling the browser print dialog; it does not create a download or PDF artifact.

## Phase 6A1 through Phase 6C3 Grade 2 Bridge Content

Phase 6A1 adds the first scalable Grade 2 content pack without changing the lesson engine or parent systems. Phase 6A2 adds the second registered Word Forge pack, Phase 6B1 adds the Syllable Summit pack for two-syllable, open-syllable, and closed-syllable work, Phase 6B2 adds consonant-`le` practice to complete authored `ELA.2.F.1.3c` coverage, Phase 6C1 adds Prefix Power common-prefix practice, Phase 6C2 adds Suffix Station common-suffix practice, Phase 6C3 adds Quiet Letter Quest silent-letter practice, Phase 6C4 adds Fluency Flight supportive practice, Phase 6D1 adds the first active Story Scouts pack, Phase 6D2 adds Story Scouts Theme Trail for `ELA.2.R.1.2`, Phase 6D3 adds Story Scouts Perspective Portal for `ELA.2.R.1.3`, and Phase 6D4 adds Poetry Planet Rhyme Routes for `ELA.2.R.1.4`. Phase 6E0 keeps Information Detectives and Context Cavern as planned shells, Phase 6E1 adds the first active Information Detectives pack for `ELA.2.R.2.1`, Phase 6E2 adds Central Idea Center for `ELA.2.R.2.2`, Phase 6E3 adds Purpose Path for `ELA.2.R.2.3`, Phase 6E4 adds Opinion & Evidence Desk for `ELA.2.R.2.4`, Phase 6E5 adds Context Cavern Academic Word Workshop for `ELA.2.V.1.1`, and Phase 6E6 adds Context Cavern Morphology Mine for `ELA.2.V.1.2`, and Phase 6E7 adds Context Cavern Meaning Clue Chamber for `ELA.2.V.1.3`. Phase 6F0 adds the Compare Castle roadmap shell and the Grade 2 baseline audit without adding production across-genres content. Together the bridge packs are DRAFT-only, locally authored, and registered across the Word Forge, Story Scouts, Poetry Planet, Information Detectives, Context Cavern, and Compare Castle trails while keeping fluency practice supportive rather than measured and preserving unit-affine review scheduling for Story Map, Theme Trail, Perspective Portal, Rhyme Routes, Text Feature Hunt, Central Idea Center, Purpose Path, Opinion & Evidence Desk, Academic Word Workshop, Morphology Mine, Meaning Clue Chamber, Wordplay Watchtower, Retell Hall, and Compare Keep. They cover the full listed `ELA.2.F.1.3a` pattern set through `oo`, `ea`, `ou`, `oi`, `oy`, and `ow`, `ELA.2.F.1.3b` in Phase 6B1, `ELA.2.F.1.3c` in Phases 6B1 and 6B2, `ELA.2.F.1.3d` in Phases 6C1 and 6C2, `ELA.2.F.1.3e` in Phase 6C3, `ELA.2.F.1.4` as supportive practice only in Phase 6C4, and `ELA.2.R.1.1`, `ELA.2.R.1.2`, `ELA.2.R.1.3`, `ELA.2.R.1.4`, `ELA.2.R.2.1`, `ELA.2.R.2.2`, `ELA.2.R.2.3`, `ELA.2.R.2.4`, `ELA.2.R.3.1`, `ELA.2.R.3.2`, `ELA.2.R.3.3`, `ELA.2.V.1.1`, `ELA.2.V.1.2`, and `ELA.2.V.1.3` in Phases 6D1 through 6F3. The work is supportive exposure and implemented DRAFT benchmark coverage where applicable, not complete benchmark mastery.

Phase 6D0 adds only the multi-world and multi-skill progression foundation needed for later prose and poetry packs. Phase 6D1 adds the first prose pack, Phase 6D2 adds Theme Trail, Phase 6D3 adds Perspective Portal, and Phase 6D4 adds Poetry Planet Rhyme Routes. Phase 6E0 keeps Information Detectives and Context Cavern as planned roadmap shells only, Phase 6E1 activates Information Detectives Text Feature Hunt while Context Cavern remains planned, Phase 6E2 activates Central Idea Center while preserving the later informational and vocabulary phases as planned, Phase 6E3 activates Purpose Path while preserving the later informational and vocabulary phases as planned, Phase 6E4 activates Opinion & Evidence Desk while preserving the later informational and vocabulary phases as planned, Phase 6E5 activates Context Cavern Academic Word Workshop while preserving Morphology Mine as planned, and Phase 6E6 activates Context Cavern Morphology Mine while preserving Meaning Clue Chamber as planned, and Phase 6E7 activates Meaning Clue Chamber while completing Phase 6E. Phase 6F0 adds the Compare Castle roadmap shell, keeps the across-genres benchmarks planned, and does not initialize any production progress. Phase 6F1 activates the first active Compare Castle pack, Wordplay Watchtower, and makes Compare Castle playable while Retell Hall remains planned. Phase 6F2 activates Retell Hall with structured authored retell choices. Phase 6F3 activates Compare Keep with structured authored paired-text comparison choices. Phase 6F4 completes the final Grade 2 audit and Phase 6 completion, and Phase 7 remains next.

Parent reporting treats this work as `Foundational Skills Bridge`, an internal practice category that stays separate from the official Grade 3 FAST reporting lanes. Phase 6F2 uses structured authored retell choices rather than spontaneous oral retelling or open-ended writing, and Phase 6F3 uses structured authored paired-text comparison choices rather than original written or oral comparison.
## Phase 6F0 compare-castle foundation

Phase 6F0 adds the planned Compare Castle world shell and the Grade 2 baseline audit only. It does not add production across-genres lessons, passages, questions, or support targets.

The production world ID is `compare-castle`, the child-facing world name is `Compare Castle`, and the track display name is `Across-Genre Reading`.

Phase 6F1 covers `ELA.2.R.3.1` with similes, idioms, and alliteration in DRAFT Wordplay Watchtower content.
Phase 6F2 covers `ELA.2.R.3.2` with structured authored retell choices for literary and informational retelling.
Phase 6F3 covers `ELA.2.R.3.3` with structured authored paired-text comparison of important details.

Phase 6F0 documents the retell measurement boundary, the paired-text architecture boundary, and the figurative-language boundary before any production across-genres content exists.

## Phase 6.5 live hardening

Phase 6.5 is a post-curriculum hardening milestone. It does not add curriculum, change benchmark counts, or move the phase boundary into Phase 7. It corrects live UX and data issues discovered in playtesting, including accuracy formatting, reward initialization, stale child copy, and semantic question integrity.
## Phase 7A0 multi-grade boundary

Phase 7 reuses the six established worlds through separate grade-band tracks. Grade 3 readiness is domain-specific, requires active eligible content, and requires the matching Grade 2 track to reach its explicit completion difficulty. Phase 7A0 adds roadmap and FAST audit metadata only; it adds no Grade 3 production curriculum and makes no global grade diagnosis. Grade 3 fluency and unconstrained academic-vocabulary use retain supportive-practice measurement boundaries.

## Phase 7A1 Root Reactor boundary

Root Reactor activates only Grade 3 Word Forge after the matching Grade 2 Word Forge prerequisite is complete. Its seven DRAFT lessons teach decoding with a bounded set of Greek and Latin roots, combining forms, and classical prefixes. Meanings are memory support rather than the scored construct. `ELA.3.F.1.3` remains partial because derivational-suffix/part-of-speech work and systematic multisyllabic decoding remain deferred to Phases 7A2 and 7A3. The product makes no oral-decoding score, grade-level diagnosis, or FAST prediction.

## Phase 7A2 Suffix Shifter boundary

Suffix Shifter activates Grade 3 Word Forge Trail 2 only after Root Reactor completes. Seven DRAFT lessons teach transparent derivational suffix decoding and child-readable word-function changes with `-ness`, `-ment`, `-er`, `-ful`, `-less`, `-ly`, `-able`, and `-y`. The pack does not teach absolute ending rules, unrestricted grammar or writing, oral scoring, or systematic multisyllabic decoding. `ELA.3.F.1.3` remains partial until Phase 7A3.

## Phase 7A3 Multisyllable Mountain boundary

Multisyllable Mountain activates Grade 3 Word Forge Trail 3 only after Suffix Shifter completes. Seven DRAFT lessons teach flexible decoding with closed, open, vowel-consonant-e, vowel-team, r-controlled, and consonant-le syllables plus helpful compound, prefix, base, and suffix boundaries. The child chunks, blends, and rereads in context; no oral score, WCPM, prosody mastery, vocabulary mastery, or universal mechanical division rule is claimed. With Root Reactor and Suffix Shifter, all five `ELA.3.F.1.3` inventory patterns now have authored coverage, so the curriculum row is IMPLEMENTED / DRAFT. That status does not mean the learner mastered the benchmark.

## Phase 7A4 Fluency Flight Grade 3 boundary

Fluency Flight activates Grade 3 Word Forge Trail 4 only after Multisyllable Mountain completes. Seven DRAFT `FLUENCY_PRACTICE` lessons support accurate attention to print, familiar-word automaticity, phrase grouping, punctuation cues, expression choices, optional model listening, and rereading. The twenty-eight scored questions assess visible fluency knowledge rather than oral performance. The pack has no microphone, recording, WCPM, pronunciation score, prosody score, expression score, oral-accuracy score, or oral-mastery claim. `ELA.3.F.1.4` is SUPPORTIVE_PRACTICE / DRAFT and is not counted as implemented benchmark coverage. Completing the Word Forge chapter at difficulty 5 does not mean oral fluency mastery or a global Grade 3 diagnosis.
## Phase 7B1 Character Arc Camp

Grade 3 Story Scouts now begins with prerequisite-gated Character Arc Camp. The learner traces character development through beginning, middle, and end evidence; actions, dialogue, thoughts, feelings, choices, turning points, and plot consequences. The application reports `ELA.3.R.1.1` curriculum coverage as IMPLEMENTED / DRAFT and keeps learner mastery separate. Theme development, perspective, poetry, FAST prediction, and unrestricted writing remain outside this phase.

## Phase 7B2 Theme Development Trail

Theme Development Trail activates Grade 3 Story Scouts Trail 2 only after Character Arc Camp completes. Seven original DRAFT stories and guides teach a complete best-supported theme, theme versus topic and summary, and how beginning, middle, turning-point, and ending details develop that theme. The pack uses only existing selected-response forms and reports `ELA.3.R.1.2` curriculum coverage as IMPLEMENTED / DRAFT. Character perspective, narrator point of view, poetry, unrestricted writing, learner-mastery claims, and FAST prediction remain outside this phase.

## Phase 7B3 Perspective Portal Grade 3

Perspective Portal activates Grade 3 Story Scouts Trail 3 only after Theme Development Trail completes. Seven original DRAFT stories and perspective guides teach how two characters see the same situation through dialogue, actions, thoughts, feelings, noticing, choices, motivations, similarities, differences, and supported viewpoint change. The pack reports `ELA.3.R.1.3` curriculum coverage as IMPLEMENTED / DRAFT while keeping feeling-only labels, traits, narrator point of view, author perspective, poetry, unrestricted writing, learner-mastery claims, and FAST prediction outside the scored boundary.

## Simplified Guided Child Journey

Child mode presents one learning-navigation action: `Start Journey`. `Parent Area` remains a separate, visually secondary grown-up action. The colorful curriculum map remains visible as noninteractive progress information so Rory can see the current world, completed worlds, the next world, and later locked content without choosing a world, unit, or lesson.

`Start Journey` resumes a valid active session first and otherwise delegates to the global progression planner. The planner retains verification, remediation, and due-review priorities, while ordinary fresh progression follows active curriculum tracks in canonical `curriculumOrder`: Word Forge first, Story Scouts after Word Forge completion, then each later active track. A missing required track fails closed with the existing content-needed result rather than skipping ahead. No content, mastery threshold, review interval, score rule, XP, star, streak, persistence, assessment, or parent analytics contract is removed.

## Phase 7B4: Grade 3 Poetry Planet

Poem Form Observatory activates the existing `g3-poetry-planet` track behind Grade 2 Poetry Planet completion. Its seven DRAFT lessons use structured PoemCards to identify free verse, rhymed verse, haiku, and limerick without expanding into figurative language, composition, advanced meter, or oral scoring. The simplified child journey remains authoritative: Home has only Start Journey and Parent Area, the map is display-only, and the global planner launches Grade 3 poetry when prerequisite and curriculum order permit.

## Phase 7C1: Grade 3 Information Detectives

Structure Station activates `g3-information-detectives-reading` behind verified Grade 2 Information Detectives completion. Seven DRAFT lessons teach how informational text features contribute to meaning and how chronology, comparison, and cause/effect organize important ideas. Central idea, author purpose, claim/evidence, and informational writing remain deferred. The protected child journey remains unchanged: the planner selects Structure Station through Start/Continue Journey and no child-facing curriculum menu is added.

## Phase 7C2: Central Idea Engine

Central Idea Engine adds seven DRAFT Grade 3 informational lessons at difficulty 2. Learners distinguish topic, complete central idea, summary, relevant detail, and minor detail; identify stated and implied ideas; and connect evidence across sections. Author purpose, author claims, argumentative evidence, vocabulary, and written-response scoring remain deferred. Structure Station flows automatically into this unit through the existing planner, while Home remains limited to Start Journey and Parent Area.

## Phase 7C3 product update

Purpose Development Path adds authored DRAFT `ELA.3.R.2.3` practice for precise author purpose and how facts, examples, organization, and sections develop that purpose. Topic, central idea, generic intent, and claim remain explicit non-target boundaries. Claim and Evidence Court remains unstarted.

The one-button journey now reconciles stale active-session and planned-quest state before every Start Journey or Continue Journey launch. The child never resolves a conflict manually: valid unfinished work resumes, completed or incompatible work is retired conservatively, and genuine content-needed remains fail-closed.

## Phase 7C4: Claim and Evidence Court

Claim and Evidence Court adds seven DRAFT Grade 3 informational argument lessons at difficulty 4 for `ELA.3.R.2.4`. Learners distinguish a supportable author claim from topic, neutral central idea, author purpose, fact, and unsupported preference; separate reasons from evidence; identify strong and weak support; and explain how visible evidence connects to a claim. The scope excludes sophisticated rhetoric, bias, source-credibility evaluation, counterargument, open writing, and Phase 7D content.

Purpose Development Path flows into Claim and Evidence Court through the reconciled Start/Continue Journey transition. Existing stored content-needed is recomputed against the current registry, the Home map remains display-only with exactly Start Journey and Parent Area, and a valid unfinished lesson still resumes before new work.
## Phase 7D1: Figurative Fortress

Figurative Fortress activates Grade 3 Across-Genre Reading only after Grade 2 Across-Genre Reading reaches completion difficulty 4. Seven original DRAFT texts span literary prose, poetry, and informational reading while teaching metaphors, personification, hyperbole, context-supported figurative meaning, and literal-versus-nonliteral distinctions for `ELA.3.R.3.1`. The pack does not claim simile, idiom, alliteration, tone, mood, summary, author comparison, or vocabulary-benchmark coverage. Summary Stronghold, Author Lens Tower, and Grade 3 Context Cavern remain unstarted.

The accepted child flow remains Home to Start Journey to planner-selected work to one progression action. Start Journey and Continue Journey share the reconciled current-state launcher; no Compare Castle, unit, or lesson selector is introduced. Curriculum status is IMPLEMENTED / DRAFT and remains separate from learner mastery or FAST prediction.
## Phase 7D2 Summary Stronghold boundary

Summary Stronghold activates Grade 3 Across-Genre Reading Trail 2 only after Figurative Fortress completes. Seven original DRAFT sources teach concise literary and informational summarization through selection, omission, compression, and preservation of meaning. Literary work includes problem or goal, essential plot events, resolution, and supported theme; informational work includes central idea, relevant details, and essential relationships. The pack uses only bounded selected-response forms and does not introduce free-response scoring, author comparison, vocabulary curriculum, learner-mastery claims, or FAST predictions. `ELA.3.R.3.2` curriculum coverage is IMPLEMENTED / DRAFT.

## Phase 7D3 Author Lens Tower boundary

Author Lens Tower activates Grade 3 Across-Genre Reading Trail 3 only after Summary Stronghold completes. Seven DRAFT paired lessons contain fourteen original texts: four informational-informational pairs sharing a topic and three literary-literary pairs sharing a supported theme. Questions compare how authors organize, focus, explain, illustrate, describe, and develop the shared basis, with source-scoped evidence from both texts. The phase excludes fact-only comparison, private author intent, advanced rhetoric, vocabulary curriculum, Grade 4 work, and timed FAST practice. `ELA.3.R.3.3` curriculum coverage is IMPLEMENTED / DRAFT; learner mastery and approval remain separate.


## Phase 7D4 Academic Word Workshop product boundary

Grade 3 Context Cavern becomes active at curriculum order 150 only after Grade 2 Context Cavern reaches completion difficulty 4 and Unit 1 production content exists. Academic Word Workshop provides selected-response academic-vocabulary practice across school subjects. It supports recognition and constrained use in authored speaking and writing contexts but does not score spontaneous speech, original writing, pronunciation, or productive vocabulary mastery.

The child still launches work only through Start Journey or Continue Journey. Home retains exactly two navigation controls, world cards remain display-only, and progression outcome retains one action. Root Meaning Vault and Meaning Maze have no production content.
