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
