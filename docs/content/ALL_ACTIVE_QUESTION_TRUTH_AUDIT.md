# All Active Question Truth Audit

## Gate identity

- Milestone: Phase 7A1.5 Full Question Truth Audit and Feedback-State Correction
- Starting SHA: `83b179ff6dff808b058b79e31b311d9fc5b5f06c`
- Review method: GPT-5.6 Sol repository-level curricular reasoning review plus executable production-evaluator contracts
- Status: PASS at the recorded content fingerprints
- Approval boundary: this is not teacher approval, Florida approval, official FAST approval, or a learner diagnosis

## Registry-derived scope

| Artifact | Active count |
| --- | ---: |
| Packs | 23 |
| Lessons | 161 |
| Texts | 168 |
| Questions | 930 |
| Word-support targets | 642 |

The inventory is derived from active production pack and lesson ownership. Legacy-only material is excluded. Every active question appears once and has one owning active lesson, at least one displayed text, and a current content fingerprint.

## Audit method

### Blind review

`buildBlindQuestionTruthProjection` provides the full displayed text context, lesson objective, prompt, and visible response surface while excluding authored keys, explanations, evidence IDs, and guide answers. Pack review proceeded in deterministic registry order across foundational skills, prose, poetry, informational text, vocabulary, and across-genres reading.

The independent pass selected the defensible visible answer, identified supporting source context, checked the measured skill, and challenged ambiguity, prompt leakage, outside-knowledge dependence, dialect dependence, triviality, and unfair difficulty. Concise conclusions, rather than hidden reasoning, are stored in the ledgers.

### Authored-key comparison

The second pass compared the independent answer with the authored payload, explanation, evidence IDs, lesson/passage ownership, guide metadata, grade, benchmark, skill, and content version. The current 930 fingerprints match all ledger records.

### Adversarial review

Every visible alternative was checked as a potential second answer. Multiple choice tests every non-key choice. Multiselect and hot text exhaust every visible subset when there are eight or fewer choices. Two-part items exhaust the bounded Part A x Part B matrix. Table match mutates each row, omits rows, introduces unknown options, and adds an unknown row; `use_each_once` also retains unique-choice enforcement.

### Evaluator contract

- Canonical submissions: 930
- Canonical-equivalent submissions: 309
- Adversarial submissions: 12,518
- Total grading-contract assertions: 15,617
- Canonical false negatives: 0
- Adversarial false positives after correction: 0

Every submission runs through production `evaluateAnswer`. The contract also verifies explanation identity and source-question immutability.

## Findings at the starting fingerprint

| Defect category | Confirmed | Corrected |
| --- | ---: | ---: |
| False-positive evaluator behavior | 1 | 1 |
| False-negative evaluator behavior | 0 | 0 |
| Answer-key defects | 0 | 0 |
| Prompt defects | 0 | 0 |
| Distractor defects | 0 | 0 |
| Explanation defects | 0 | 0 |
| Evidence defects | 0 | 0 |
| Ownership defects | 0 | 0 |
| Feedback-state defects | 1 | 1 |

The evaluator defect was bounded to malformed table-match payloads: a canonical mapping with an extra unknown row could previously remain correct because extra keys were ignored. Table evaluation now requires the exact known row set, valid option IDs, complete mappings, and unique selections for `use_each_once`.

The feedback defect was visual and semantic: `AnswerFeedback` received `isCorrect` but did not apply a correctness class, so the generic success-green container styled both results. Correct and incorrect feedback now have distinct classes, data attributes, icons, text, colors, and one-cycle animations. Pre-submit selection is neutral.

No active authored question, answer key, distractor, explanation, evidence reference, or passage required a new content rewrite at the current fingerprint. This result preserves the confirmed curricular corrections from the earlier Grade 2 Sol audit and Root Reactor review rather than counting those historical corrections again.

## Domain conclusions

- Grade 2 foundational skills: variable vowels, syllables, consonant-`le`, prefixes, suffixes, silent letters, and fluency-support questions retain unique defensible authored responses without scored dialect dependence.
- Root Reactor: all 41 questions preserve correct root/affix, morphology, reading-chunk, word-family, and connected-text distinctions. `ELA.3.F.1.3` remains partial and `ELA.3.V.1.2` remains planned.
- Literary and poetry: plot, theme, perspective, rhyme, source evidence, and explanations align at current fingerprints.
- Informational and vocabulary: feature contribution, central idea, purpose, opinion evidence, vocabulary use, morphology, and clue strategy align at current fingerprints.
- Across genres: simile, idiom, alliteration, retell order, paired-text scope, similarities, differences, and two-part dependencies align at current fingerprints.

## Durable ledger

`docs/content/question-truth-ledger/` contains exactly one JSON ledger per active pack and one PASS record per active question. The fingerprint covers the relevant pack, lesson, displayed text, and question payload. A later authored change fails the ledger integrity test until review is repeated and the ledger is regenerated intentionally.

## Remaining human educational review

- Professional educator review of instructional quality and developmental fit
- Continued live learner observation for wording and accessibility comfort
- Dialect- and browser-voice review where optional Word Help speech is used

No active question remains unresolved in this repository-level gate. Human review may still identify a future improvement; it does not weaken the current executable truth contract.

## Final status

PASS - all 930 active questions have current PASS ledger records, canonical grading succeeds, generated incorrect responses are rejected, and no confirmed semantic ambiguity remains at these fingerprints. Phase 7A2 remains unstarted.

## Phase 7A2 extension

The Phase 7A1.5 body above is a historical 930-question checkpoint. Phase 7A2 applies the same permanent gate to `g3-word-forge-suffix-shifter` and brings the current registry to 24 packs, 168 lessons, 175 texts, 971 questions, and 971 matching PASS ledger records. Current evaluator metrics are 971 canonical, 323 canonical-equivalent, and 12,913 adversarial submissions, totaling 16,149 grading assertions.

Independent source review corrected one passage grammar defect and three checkpoint construct defects before registration. The three checkpoint two-part items now compare meaningful base-plus-suffix boundaries with genuinely distinct authored reading chunks. No answer key, evidence reference, production evaluator, Grade 2 item, or Root Reactor item required correction. `ELA.3.F.1.3` remains partial DRAFT coverage, `ELA.3.V.1.2` remains planned, and Phase 7A3 remains unstarted.

## Phase 7A3 extension

The Phase 7A1.5 and Phase 7A2 sections above remain historical checkpoints. Phase 7A3 applies the same permanent gate to `g3-word-forge-multisyllable-mountain` and brings the current registry to 25 packs, 175 lessons, 182 texts, 1,012 questions, and 1,012 matching PASS ledger records. Current evaluator metrics are 1,012 canonical, 337 canonical-equivalent, and 13,332 adversarial submissions, totaling 16,705 grading assertions.

Independent source review corrected one selection-count target set, four help-dependent hot-text prompts, three checkpoint hot-text target bindings, and five passage/target choices before registration. Final questions are self-contained, the six syllable patterns and meaningful boundaries are defensible, and no final answer key, distractor, evidence reference, production evaluator, Grade 2 item, Root Reactor item, or Suffix Shifter item required correction. `ELA.3.F.1.3` is now IMPLEMENTED / DRAFT curriculum coverage, `ELA.3.F.1.4` and `ELA.3.V.1.2` remain planned, no learner-mastery or FAST claim is made, and Phase 7A4 remains unstarted.

## Phase 7A4 extension

The earlier sections remain historical checkpoints. Phase 7A4 applies the permanent gate to `g3-word-forge-fluency-flight` and brings the current registry to 26 packs, 182 lessons, 189 texts, 1,040 questions, and 1,040 matching PASS ledger records. Current evaluator metrics are 1,040 canonical, 346 canonical-equivalent, and 13,596 adversarial submissions, totaling 17,062 grading assertions.

Blind review corrected six choice-clarity defects before registration: four table items had repeated visible option labels, and two phrase-grouping items differed only by separator placement after normalization. No final answer key, prompt, explanation, evidence reference, passage, production evaluator, Grade 2 item, Root Reactor item, Suffix Shifter item, or Multisyllable Mountain item required correction. `ELA.3.F.1.3` remains IMPLEMENTED / DRAFT, `ELA.3.F.1.4` is now SUPPORTIVE_PRACTICE / DRAFT, no oral measurement or learner-mastery claim is made, Phase 7A is complete, and Phase 7B remains unstarted.
## Phase 7B1 current inventory

The permanent audit now covers 27 active packs, 189 active lessons, 196 active texts, and 1,081 active questions. There are 1,081 current fingerprinted PASS records, 1,081 canonical submissions, 360 canonical-equivalent submissions, 14,027 adversarial submissions, and 17,630 grading assertions. Character Arc Camp adds 41 PASS records. Seven table distractors were corrected before release; no answer key, prompt, explanation, evidence, passage, or evaluator defect remains unresolved. These are repository quality-gate results, not teacher or Florida approval.

## Phase 7B2 current inventory

The permanent audit now covers 28 active packs, 196 active lessons, 203 active texts, and 1,122 active questions. There are 1,122 current fingerprinted PASS records, 1,122 canonical submissions, 374 canonical-equivalent submissions, 14,458 adversarial submissions, and 18,198 grading assertions. Theme Development Trail adds 41 PASS records. Final blind review found no learner-facing question, key, prompt, distractor, explanation, evidence, passage, or evaluator defect; one audit regular expression was corrected before registration. No question ID remains unresolved. These are repository quality-gate results, not teacher or Florida approval.

## Phase 7B3 current inventory

The permanent audit now covers 29 active packs, 203 active lessons, 210 active texts, and 1,163 active questions. There are 1,163 current fingerprinted PASS records, 1,163 canonical submissions, 388 canonical-equivalent submissions, 14,840 adversarial submissions, and 18,717 grading assertions. Perspective Portal adds 41 PASS records. Blind review corrected two source-sentence Word Help occurrences, one checkpoint multiselect factory affecting three items, and one bounded table factory affecting seven items. No final answer key, explanation, evidence reference, production evaluator, or unresolved question ID remains. These are repository quality-gate results, not teacher approval, Florida approval, learner mastery, or FAST certification.

## Phase 7B4 registration

Poem Form Observatory adds 41 independently reviewed questions under `g3-poetry-planet-poem-form-observatory`. The production inventory now contains 1,204 active questions and 1,204 current PASS ledger records across 30 packs. The executable contract accepts 1,204 canonical submissions and 402 canonical-equivalent submissions, rejects 15,214 adversarial submissions, and completes 19,228 grading assertions. Three prompts were refined before registration; no key, distractor, explanation, evidence, poem, rhyme, or evaluator correction remained after blind comparison. Zero question IDs are unresolved and zero fingerprints are stale.

## Phase 7C1 registration

Structure Station adds 41 independently reviewed questions under `g3-information-detectives-structure-station`. The production inventory now contains 1,245 active questions and 1,245 current PASS ledger records across 31 packs. The executable contract accepts 1,245 canonical submissions and 416 canonical-equivalent submissions, rejects 15,596 adversarial submissions, and completes 19,747 grading assertions. Two Word Help source alignments and one guide-contribution statement were corrected before registration; no question, key, distractor, explanation, evidence reference, passage fact, or evaluator correction remained after blind comparison. Zero question IDs are unresolved and zero fingerprints are stale.

## Phase 7C2 registration

Central Idea Engine adds 41 independently reviewed questions under `g3-information-detectives-central-idea-engine`. The production inventory now contains 1,286 active questions and 1,286 current PASS ledger records across 32 packs. The executable contract accepts 1,286 canonical submissions and 430 canonical-equivalent submissions, rejects 16,027 adversarial submissions, and completes 20,315 grading assertions. Blind review corrected one Word Help source alignment and replaced that target with an equally useful lowercase source word to preserve exact chunk reconstruction; no passage fact, question, key, distractor, explanation, evidence, or evaluator correction remained. Zero question IDs are unresolved and zero fingerprints are stale.

## Phase 7C3 registration

Purpose Development Path adds 41 independently reviewed questions under `g3-information-detectives-purpose-development-path`. The production inventory now contains 1,327 active questions and 1,327 current PASS ledger records across 33 packs. The executable contract accepts 1,327 canonical submissions and 444 canonical-equivalent submissions, rejects 16,458 adversarial submissions, and completes 20,883 grading assertions. Registration review corrected two one-chunk Word Help targets by selecting source-bound multisyllable words; no passage fact, question, key, distractor, explanation, evidence, or evaluator correction remained. Zero question IDs are unresolved and zero fingerprints are stale.

## Phase 7C4 registration

Claim and Evidence Court adds 41 independently reviewed questions under `g3-information-detectives-claim-evidence-court`. The production inventory now contains 1,368 active questions and 1,368 current PASS ledger records across 34 packs. The executable contract accepts 1,368 canonical submissions and 458 canonical-equivalent submissions, rejects 16,952 adversarial submissions, and completes 21,514 grading assertions. Registration review corrected one source-bound Word Help target, three guide synthesis statements, seven multiselect explanations, and seven table distractor sets before the final fingerprints were recorded. No passage fact, answer key, evidence reference, evaluator, unresolved question ID, or stale fingerprint remains. These are repository truth-gate results, not teacher approval, learner mastery, or FAST certification.

## Phase 7D1 registration

Figurative Fortress adds 41 independently reviewed questions under `g3-compare-castle-figurative-fortress`. The production inventory now contains 1,409 active questions and 1,409 current PASS ledger records across 35 packs. The executable contract accepts 1,409 canonical submissions and 472 canonical-equivalent submissions, rejects 17,418 adversarial submissions, and completes 22,117 grading assertions. Editorial review adjusted the two poems to the shared structured-poem shape before registration; no final figurative target, question, answer key, distractor, explanation, evidence reference, evaluator, unresolved question ID, or stale fingerprint remains. These are repository truth-gate results, not teacher approval, learner mastery, or FAST certification.
