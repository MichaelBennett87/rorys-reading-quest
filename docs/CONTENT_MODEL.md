# Lesson Content Model (Phase 3)
## Existing Content Entities

Passages and questions retain the Phase 2 typed model, stable IDs, content versions, explanations, evidence IDs, and review states. The five supported question types remain multiple choice, multiselect, hot text, two-part evidence, and table match.

Phase 4 extends passages with optional authored `wordSupportTargets`. Each target includes a stable target ID, owning passage and sentence IDs, a surface word, authored focus parts, authored display and spoken chunks, blend/word/sentence speech text, review status, and content version.

## Lesson-Level Candidate

Each playable lesson candidate contains:

- `lessonId` and stable lesson-level `activityId`
- one `skillId` and one `difficulty`
- eligible purposes: progression, verification, remediation, and/or review
- passage-question keys
- `contentVersion`

The development catalog now aggregates registered local packs instead of a single monolithic development set. Phases 6A1 through 6F3 add twenty-two active Grade 2 bridge packs with 154 lessons, 161 passages, 889 scored questions, and 614 authored word-support targets. Phase 6E0 adds only planned Information Detectives and Context Cavern shells, Phase 6E1 adds active Information Detectives text-feature content, Phase 6E2 adds active Information Detectives central-idea content, Phase 6E3 adds active Information Detectives author-purpose content, Phase 6E4 adds active Information Detectives opinion-and-evidence content, Phase 6E5 adds active Context Cavern academic-word content, Phase 6E6 adds active Context Cavern morphology content, and Phase 6E7 adds active Context Cavern meaning-clue content, so the active totals rise only when new content exists. Phase 6F1 adds active Compare Castle wordplay content, Phase 6F2 adds active Compare Castle retell content, Phase 6F3 adds active Compare Castle paired-text compare content, and legacy lesson IDs remain resolvable for recovery and parent history, but they are excluded from fresh selection so new learners enter the active bridge packs. Phase 6F4 completes the final Grade 2 audit and Phase 6 completion. Phase 6F4 also confirms the twenty-benchmark inventory with 19 implemented benchmarks and one supportive-practice benchmark, and Phase 7 remains next.

The active bridge packs remain DRAFT-only. Support is authored, not generated, and passage rendering keeps the readable sentence flow while exposing target words as controls. Together the packs implement the listed `ELA.2.F.1.3a` vowel-team patterns across Phase 6A1 and Phase 6A2, implement `ELA.2.F.1.3b` in Phase 6B1, implement `ELA.2.F.1.3c` across Phase 6B1 and 6B2, implement `ELA.2.F.1.3d` across Phase 6C1 and Phase 6C2, implement `ELA.2.F.1.3e` in Phase 6C3, provide `ELA.2.F.1.4` as supportive practice only in Phase 6C4, and implement `ELA.2.R.1.1`, `ELA.2.R.1.2`, `ELA.2.R.1.3`, `ELA.2.R.1.4`, `ELA.2.R.2.1`, `ELA.2.R.2.2`, `ELA.2.R.2.3`, `ELA.2.R.2.4`, `ELA.2.V.1.1`, `ELA.2.V.1.2`, and `ELA.2.V.1.3` in Phases 6D1 through 6E7. Phase 6D0 adds the curriculum-track scaffold for later prose, poetry, informational content, and academic vocabulary without introducing new passages or questions; Phase 6D1 uses that scaffold for the first Story Scouts pack, Phase 6D2 keeps Story Map and Theme Trail reviews unit-affine, Phase 6D3 extends that same structure to Perspective Portal, Phase 6D4 extends that same structure to Poetry Planet, Phase 6E1 extends it again to Information Detectives Text Feature Hunt, Phase 6E2 extends it again to Information Detectives Central Idea Center, Phase 6E3 extends it again to Information Detectives Purpose Path, Phase 6E4 extends it again to Information Detectives Opinion & Evidence Desk, Phase 6E5 extends it again to Context Cavern Academic Word Workshop, Phase 6E6 extends it again to Context Cavern Morphology Mine, and Phase 6E7 extends it again to Context Cavern Meaning Clue Chamber. The work stays local practice, not oral-fluency measurement.

Informational passages now use `InformationalTextStructure` plus DRAFT guide metadata to keep feature evidence and central-idea evidence local to the pack. These guides do not persist to learner progress.

## Review and Safety

All development content remains original and `DRAFT`. Validation still enforces stable identifiers, supported payloads, answer/evidence integrity, passage references, content versions, and review states. DRAFT content is developmental and not production curriculum.

## Persisted Content Boundary

Persistence stores content identifiers and versions, not passage text, explanations, correct-answer text, or full submitted-answer text. Active recovery stores only submitted option/segment/mapping IDs needed to reconstruct evaluation against compatible current content.

## Parent Analytics Inputs

Phase 5A does not add new child curriculum. Parent analytics consume the existing lesson, skill, attempt, assistance, and review metadata already produced by the child flow. When historical items cannot be resolved against current content, they remain unclassified rather than guessed.

## Phase 5B2 Parent Records Boundary

Official assessment records remain separate from lesson/content authoring. Phase 5B2 does not add new passages, questions, or curriculum content. The print summary reuses existing dashboard snapshots and parent records only; it does not mutate content or persist raw report text.

## Phase 6A1 through Phase 6C3 Bridge Pack Boundary

Phase 6A1 introduces a local bridge pack for `word-forge` and `wg-unit-1`. Phase 6A2 adds the second `word-forge` bridge pack, Phase 6B1 adds `Syllable Summit` as the next unit, Phase 6B2 adds consonant-`le` practice, Phase 6C1 adds Prefix Power, Phase 6C2 adds Suffix Station, Phase 6C3 adds Quiet Letter Quest while completing `ELA.2.F.1.3e` in authored DRAFT form, Phase 6C4 adds Fluency Flight as supportive practice only, Phase 6D1 adds Story Scouts Story Map for `ELA.2.R.1.1`, Phase 6D2 adds Story Scouts Theme Trail for `ELA.2.R.1.2`, Phase 6D3 adds Story Scouts Perspective Portal for `ELA.2.R.1.3`, Phase 6D4 adds Poetry Planet Rhyme Routes for `ELA.2.R.1.4`, Phase 6E5 adds Context Cavern Academic Word Workshop for `ELA.2.V.1.1`, Phase 6E6 adds Context Cavern Morphology Mine for `ELA.2.V.1.2`, and Phase 6E7 adds Context Cavern Meaning Clue Chamber for `ELA.2.V.1.3`. The packs are composed of original DRAFT passages, original DRAFT questions, and authored word-help targets that can be reviewed deterministically. They do not reuse the legacy lesson engine as a content source, and they do not promote the legacy development lessons into the fresh selection path. `sampleContent` now aggregates registered packs so existing imports continue to work while the curriculum grows in bounded packs.

## Phase 6A1 through Phase 6C3 Curriculum Scope Boundary

Phase 6A1 is partial benchmark coverage only. `ELA.2.F.1.3a` becomes implemented in DRAFT form when Phase 6A2 adds `ou`, `oi`, `oy`, and `ow`. Phase 6B1 implements `ELA.2.F.1.3b` in DRAFT form, Phase 6B2 completes `ELA.2.F.1.3c` in DRAFT form, Phase 6C1 through 6C2 implement `ELA.2.F.1.3d` in DRAFT form with common prefixes and common suffixes, Phase 6C3 implements `ELA.2.F.1.3e` in DRAFT form with a bounded silent-letter set, Phase 6C4 provides supportive practice for `ELA.2.F.1.4` without measuring oral fluency, Phase 6D1 through 6D4 implement `ELA.2.R.1.1` through `ELA.2.R.1.4` in DRAFT form, Phase 6E5 implements `ELA.2.V.1.1` in DRAFT form, Phase 6E6 implements `ELA.2.V.1.2` in DRAFT form, and Phase 6E7 implements `ELA.2.V.1.3` in DRAFT form. The bridge packs can support fluency-adjacent reading practice, but they do not assess or score oral fluency. Parent analytics should label this work as `Foundational Skills Bridge`, which is an internal practice category and not an official FAST reporting lane.
## Phase 6F3 Grade 2 benchmark inventory and coverage snapshot

Grade 2 now has an immutable 20-entry benchmark inventory that includes the three Reading Across Genres benchmarks and the supportive-practice boundary for `ELA.2.F.1.4`.

The coverage snapshot is a pure derivation over:

- the benchmark inventory
- registered active content packs
- benchmark coverage audits
- the existing fluency supportive-practice audit

The snapshot reports `implemented` for `ELA.2.R.3.1`, `ELA.2.R.3.2`, and `ELA.2.R.3.3`, and `supportive_practice` for `ELA.2.F.1.4` during Phase 6F3 because Compare Castle now has active Wordplay Watchtower, Retell Hall, and Compare Keep content. It preserves the implemented DRAFT statuses for the authored Grade 2 packs already in the registry, and Phase 6F4 completes the final Grade 2 audit without changing those measured totals.

## Phase 6.5 semantic audit and content-integrity note

Phase 6.5 adds no new curriculum packs. The active production totals remain 22 packs, 154 lessons, 161 passages, 889 questions, and 614 support targets. The semantic question audit applies to the active Grade 2 slice, and the live hardening pass corrects stale child copy and question-text mismatches without reopening Phase 6 curriculum completeness.

Every active question must be owned by its lesson and use a passage in that lesson's passage list. Single-text lessons may include multiple canonical passages when their authored question set intentionally spans them; paired lessons retain exactly two ordered members. The semantic audit also verifies hot-text source membership, local and scoped evidence, keyed answers, selection cardinality, paired scope, retell-piece ownership, and explanation stability. These checks establish repository integrity, not professional curricular approval.

## Phase 7A0 grade-band ownership

The content-pack manifest remains the canonical grade-band owner. Catalog entries, `LessonDefinition`, and `LessonActivityCandidate` expose the derived grade band without adding a persisted active-session field. Pack audit validation rejects passages or questions whose grade band contradicts the manifest. Grade 3 inventory, roadmap, coverage snapshot, and FAST blueprint objects are immutable planning metadata, not persisted curriculum or child progress.

## Phase 7A1 root-decoding guides

Root Reactor extends `ContentPack` with optional `rootDecodingGuides`. A guide owns one passage and four targets. Each target records a primary classical part, optional additional parts, meaningful morphological chunks, pronounceable reading chunks with authored speech text, a decoding statement, and a non-scored meaning support statement. Morphological chunks and reading chunks independently reconstruct the written word and are deliberately not treated as interchangeable. Root Reactor contributes only `greek-latin-root-decoding` and `affix-decoding` to `ELA.3.F.1.3`; it contributes nothing to `ELA.3.V.1.2`.

## Phase 7A1.5 truth-audit projection

The active-question truth inventory is derived from active production packs and active lesson ownership. Each record carries pack, version, grade, benchmark, world, unit, skill, lesson, passage, question, visible answer, evidence, explanation, authored response, evaluator contract, and fingerprint metadata. The separate blind projection intentionally excludes keys, explanations, evidence IDs, and guide answers.

Question-truth ledgers are documentation artifacts, not runtime curriculum or persistence. A fingerprint covers the relevant pack, lesson, displayed text, and question payload so later authoring changes require explicit re-review. No ledger data is used for learner scoring, mastery, planning, rewards, parent assessment, or FAST prediction.

## Phase 7A2 derivational-suffix guides

Suffix Shifter adds optional `derivationalSuffixGuides` to `ContentPack`. Each `DerivationalSuffixTarget` stores a transparent base word, derived word, suffix, child-readable base and derived roles, meaningful chunks, authored reading chunks, source sentence, and concise transformation explanation. Meaningful chunks and pronunciation chunks independently reconstruct the derived word and may differ. Matching Word Help targets highlight only the suffix while Break It Apart and Hear the Parts use authored reading chunks. Guide data is curriculum-only and is never added to schema-version-1 learner persistence.

## Phase 7A3 multisyllable-decoding guides

Multisyllable Mountain adds optional `multisyllableDecodingGuides` to `ContentPack`. Each `MultisyllableDecodingTarget` stores a surface word, source sentence, syllable count, authored display/speech chunks, one bounded syllable-pattern label per chunk, optional compound/prefix/base/suffix hints, child-facing decoding steps, whole-word speech text, DRAFT review status, and content version. Display chunks reconstruct the written word. Morphological hints identify useful contiguous meaning parts but are not falsely treated as syllable boundaries.

Each target owns exactly one existing five-step Word Help target. Look at the Pattern highlights one useful authored clue; Break It Apart and Hear the Parts use pronunciation chunks; Hear the Word uses only the whole word; Hear the Sentence uses only the source sentence. The guide, passage, question, answer, and support text remain authored curriculum and are never persisted in learner progress.

## Phase 7A4 fluency-practice content

Grade 3 Fluency Flight reuses `FluencyPracticeBlock` as the canonical authored guide layer. Each of seven DRAFT lessons owns one passage, visible phrase groups, expression cues, optional model-reading availability, required practice-read count, and guided or independent mode. Four guided lessons also own non-scored teaching blocks; three independent lessons begin with passage practice. No quantitative oral field is added.

The pack contains twenty-one ordinary `WordSupportTarget` records for word-level help. Passage phrase groups do not replace Word Help and are not persisted. All twenty-eight questions retain ordinary question ownership, `ELA.3.F.1.4`, Grade 3 metadata, DRAFT status, visible evidence, and the permanent truth fingerprint. The pack contributes only the five supportive-practice patterns and does not contribute oral mastery or a benchmark implementation claim.
## Character-development guides

Phase 7B1 adds optional `CharacterDevelopmentGuide` records to a content pack. A guide links to one literary passage and owns one or two `CharacterDevelopmentArc` records. Every arc has exactly three ordered stages, typed action/dialogue/thought/feeling/choice/response evidence, resolved turning-point evidence, a plot-cause statement, and a development summary that connects multiple plot stages. Guide data remains authored DRAFT curriculum and is never persisted or printed.

## Theme-development guides

Phase 7B2 adds optional `ThemeDevelopmentGuide` records. Each guide links to one literary passage, owns one complete supported theme plus bounded distractor candidates, and records ordered beginning, middle, and end stages with resolved evidence. Turning-point, character-connection, conflict-connection, and development-summary fields make the progression of the theme explicit for validation without exposing guide answers to learners before grading.

Guide records remain DRAFT curriculum-only metadata. Passage text, theme candidates, stage statements, explanations, answer keys, and Word Help curriculum text are excluded from persistence and print. All forty-one questions use the permanent inventory, fingerprint, semantic-audit, and production evaluator contracts.

## Character-perspective guides

Phase 7B3 adds optional `CharacterPerspectiveGuide` records. Each guide links to one literary passage and stores at least two character states toward a shared situation, complete perspective and motivation statements, typed dialogue/thought/action/feeling/noticing/choice evidence, a supported similar/different/partly-similar comparison, optional earlier/later perspective change, and important evidence IDs. Validation keeps perspective distinct from an isolated feeling, trait, narrator point of view, or author viewpoint.

Guide records remain DRAFT curriculum-only metadata. Passage text, perspective statements, motivations, excerpts, explanations, answer keys, and Word Help curriculum text are excluded from persistence and print. All forty-one questions use the permanent inventory, fingerprint, semantic-audit, and production evaluator contracts.

## Grade 3 poem-form guides

Phase 7B4 adds optional `PoemFormGuide` records to authored content packs. A guide binds one structured poem to one of `free-verse`, `rhymed-verse`, `haiku`, or `limerick`, with defining and non-defining features, evidence line IDs, an explanation, comparison notes, DRAFT status, and the pack content version. Guides are validated and audited at build/test time but are not persisted or printed.

Phase 7C1 adds optional `InformationalStructureGuide` records and minimal structured timeline/sidebar feature variants. A guide binds one Grade 3 informational text to chronology, comparison, or cause/effect; records feature contributions and resolved structure evidence; and provides an organizational summary for deterministic audit. Guide and feature curriculum text are never persisted or printed. The active registry now contains 31 packs, 217 lessons, 224 texts, 1,245 questions, and 859 support targets.

Phase 7C2 extends optional `CentralIdeaGuide` records with authored relevant-detail, minor-detail, section-support, and synthesis metadata while preserving existing Grade 2 guide compatibility. Grade 3 guides distinguish stated from inferred central ideas, bind every detail to resolved evidence inside its declared section, and remain DRAFT curriculum that is neither persisted nor printed. The active registry now contains 32 packs, 224 lessons, 231 texts, 1,286 questions, and 887 support targets.

## Phase 7C3 AuthorPurposeGuide

Grade 3 informational packs may attach one optional AuthorPurposeGuide per passage. The guide records topic, a precise purpose kind and statement, strong or secondary supporting details with section ownership and evidence IDs, per-section contributions, weak or non-diagnostic details, and a synthesis statement. Validation requires a purpose more precise than generic `inform`, rejects topic, central-idea, and claim substitutions, resolves all evidence, and keeps review status/version aligned. Guide metadata is not persisted or printed.

## Phase 7C4 AuthorClaimGuide

Grade 3 informational argument packs may attach one optional `AuthorClaimGuide` per passage. A guide records an explicit position, recommendation, evaluation, priority, or proposed action; at least two section-owned reasons; typed fact, example, observation, measurement, result, or comparison evidence; evidence-to-reason ownership; claim-connection statements; and weak or irrelevant details. Validation rejects topic-only, neutral central-idea, purpose-only, fact-only, unsupported, and circular claims while requiring resolved learner-visible evidence and cross-section checkpoint support.

Guide metadata, claims, reasons, evidence statements, questions, explanations, and correct answers remain authored application content and are not persisted or printed. The active registry contains 34 packs, 238 lessons, 245 texts, 1,368 questions, and 943 support targets.
## Figurative-language guide extension

Phase 7D1 adds optional `figurativeLanguageGuides` to a content pack. A guide owns one source passage and exactly four targets. Each target records a unique ID, one Grade 3 device kind, source format, exact expression, source and context evidence IDs, literal reading, figurative meaning, explanation, and device-specific proof fields. Metaphors require a direct comparison and shared quality; personification requires a nonhuman subject and genuinely human action or quality; hyperbole requires deliberate exaggeration and a realistic context-supported meaning.

The Figurative Fortress pack contains 7 guides and 28 targets distributed as 10 metaphors, 9 personification targets, and 9 hyperboles. Guide and target data is authored DRAFT metadata used by deterministic audits, not runtime persistence or print reporting.
## Grade 3 summary guide metadata

Phase 7D2 adds `Grade3SummaryGuide`, discriminated as `LiterarySummaryGuide` or `InformationalSummaryGuide`. Literary guides own characters, problem or goal, sequenced important plot events, resolution, supported theme, minor details, and a model summary. Informational guides own topic, central idea, important details, minor details, essential relationship, and a model summary. Every guide is DRAFT, version-bound, source-owned, audit-only curriculum data. Guides, summaries, themes, central ideas, important/minor mappings, questions, explanations, and answers are not written to child progress or parent records.

## Grade 3 author-comparison guide metadata

Phase 7D3 adds optional `Grade3AuthorComparisonGuide` metadata on a content pack. Each guide identifies one paired set, a meaningful same-topic or same-theme basis, Text A and Text B kinds and focus statements, presentation-feature similarities and differences, separately scoped evidence IDs from both texts, and a synthesis statement. `evidenceFromBothRequired` is always true. Guides remain DRAFT and content-version bound.

The active pack contains 7 paired sets, 14 sources, 7 guides, and 28 lesson-level Word Help targets. Guide content, source text, comparison statements, evidence text, questions, explanations, keys, and Word Help curriculum are not persisted or printed. Current active registry totals are 37 packs, 259 lessons, 273 texts, 1,491 questions, and 1,027 support targets.


## Phase 7D4 Grade 3 academic-vocabulary model

A Grade 3 academic-vocabulary guide belongs to one passage and contains exactly four unique targets. Each target records its learner-visible word, grammatical role, meaning, source sentence ownership, two or more academic subject contexts, authored speaking and writing frames, appropriate-use examples, one unambiguous misuse and reason, and a precision note.

The guide explicitly records `supportivePracticeOnly: true`, `openResponseScoring: false`, `oralScoring: false`, DRAFT review status, and the pack content version. Guide data, frames, examples, meanings, source text, question text, answers, and Word Help curriculum text remain registry content and are excluded from persisted child state and print output.

## Phase 7D5 root-meaning guide model

`RootMeaningGuide` adds four `RootMeaningTarget` records per passage. `MeaningWordPart` distinguishes root, base, prefix, suffix, and connector; records Greek, Latin, or English origin; and separates the visible surface form from an optional canonical form. `contributesMeaning` must be false for connectors. The target combines exact source ownership, primary family, reconstructed spelling, part clue, inferred contextual meaning, context evidence, confirmation statement, and `transparentComposition: true`.

The pack contains 7 guides and 28 unique targets distributed exactly 7 / 7 / 7 / 7 across Greek-root, Latin-root, English prefix-plus-base, and English base-plus-suffix primary families. `aqueduct` records surface `aque` with canonical `aqua`, preserving exact spelling while teaching the defensible water root. Authored meaning parts and Word Help speech chunks remain independent. Guide data, parts, meanings, context statements, questions, explanations, keys, and support text are neither persisted nor printed.

## Phase 7D6 meaning-maze guide model

A `MeaningMazeGuide` owns exactly four source-bound targets plus any learner-visible local reference entries. Targets distinguish word from phrase form; unfamiliar, multiple-meaning, and figurative challenges; context, relationship, reference, background, and combined strategies; alternate senses; literal readings; and confirmation evidence. Reference entries distinguish glossary, dictionary, and thesaurus presentation without importing third-party text.

The guide is authored DRAFT curriculum metadata. It is available to registration and semantic audits but excluded from schema-v1 progress, active sessions, attempts, reviews, assessments, Parent PIN records, and print. Word Help remains a separate assistance model and cannot silently disclose a scored meaning without assistance tracking.