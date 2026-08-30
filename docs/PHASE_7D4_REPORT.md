# Phase 7D4 Report: Academic Word Workshop Grade 3

## Release identity

- Starting local SHA: `5045e2dc874d087c32ecbbe0a29ba866256611d1`
- Starting remote SHA: `5045e2dc874d087c32ecbbe0a29ba866256611d1`
- Branch: `master`
- Pack: `g3-context-cavern-academic-word-workshop`
- Content version: `g3-cc-academic-word-r0.1.0`
- Benchmark reference: `ELA.3.V.1.1`
- Coverage: `SUPPORTIVE_PRACTICE / DRAFT`
- Approved: false

## Commits

- `8033fc7 docs: allow bounded multi-agent project work`
- `d8ffe33 feat: add grade 3 academic vocabulary architecture`
- `d02af2a feat: add grade 3 academic word workshop pack`
- `9e043fd feat: integrate grade 3 context cavern progression`
- `docs: complete phase 7d4 review` is the documentation and release-audit checkpoint.

## Operating-policy reconciliation

The repository policy now permits three to four bounded subagents for substantial work when useful. The primary agent retains all production edits, integration decisions, verification ordering, Git operations, push, and deployment. Four read-only GPT-5.6 Sol Ultra reviewers were used for vocabulary, architecture/progression/persistence, truth/adversarial review, and accessibility/parent/print/release review. Child safety, privacy, phase boundaries, sequential shell commands, and remote authorization remain unchanged.

## Phase 7D3 reconciliation

Phase 7D3 began at `5fb733b0010b63e9b8b92d37c7e24cf04ab07426` and synchronized at `5045e2dc874d087c32ecbbe0a29ba866256611d1` through `b4caf53`, `1b39594`, `767707a`, and `5045e2d`. ELA.3.R.3.3 remains `IMPLEMENTED / DRAFT`; Grade 3 Across-Genre Reading remains chapter complete/review-ready at difficulty 4. The P0 planner-liveness recovery remains intact.

## Architecture and activation

A dedicated Grade 3 academic-vocabulary guide models meaning, part of speech, subject contexts, speaking and writing frames, appropriate uses, bounded misuse, and precision notes. A structured audit validates all guide invariants without persisting or printing guide data.

`g3-context-cavern-vocabulary` becomes active only because Unit 1 production content now exists. It initializes at difficulty 1 and last mastered difficulty 0 only after `g2-context-cavern-vocabulary` reaches completion difficulty 4. Parent assessment records are not used to unlock it. Existing schema-v1 saves with stale global `CONTENT_NEEDED` recover automatically without changing XP, stars, attempts, reviews, assessments, or Parent PIN state.

## Exact authored inventory

| Artifact | Count |
| --- | ---: |
| Active lessons | 7 |
| Original texts | 7 |
| Grade 3 guides | 7 |
| Unique academic targets | 28 |
| Word Help targets | 28 |
| Scored questions | 41 |
| Multiple choice | 17 |
| Multiselect | 7 |
| Hot text | 7 |
| Table match | 7 |
| Two-part | 3 |

The final inventory is: analyze, evidence, conclude, accurate, estimate, represent, determine, justify, infer, interpret, summarize, support, revise, clarify, organize, structure, contrast, relationship, relevant, respond, investigate, method, process, factor, classify, select, demonstrate, and outcome. Vocabulary substitutions: zero.

## Semantic and truth review

The independent review confirmed all meanings, parts of speech, speaking uses, writing uses, appropriate-use examples, misuse contrasts, near-neighbor distinctions, and cross-subject transfers. Twelve bounded editorial or semantic corrections were made before final registration. Four questions carry explicit correction provenance. Remaining semantic issues and ambiguities: zero.

| Grading gate | Result |
| --- | ---: |
| Active questions / current PASS records | 1,532 / 1,532 |
| Canonical submissions accepted | 1,532 |
| Canonical equivalents accepted | 514 |
| Adversarial submissions rejected | 20,154 |
| Total grading assertions | 25,264 |
| Pack canonical / equivalent / adversarial | 41 / 14 / 528 |
| Pack assertions | 665 |

One evaluator defect was corrected by rejecting mismatched question-type discriminators. One audit-infrastructure defect was corrected by exposing learner-visible table and two-part subprompts to blind review. No authored-content mutation, false positive, false negative, or stale fingerprint remains.

The final read-only release review also surfaced four inherited integration gaps, all corrected before the authoritative gate: single-select Hot Text now replaces the prior radio selection, print no longer renders raw target IDs, parent and print copy explicitly describe ELA.3.V.1.1 as supportive selected-response practice, and the cross-pack feedback matrix now includes Academic Word Workshop. The focused behavioral and reporting gate passed 7 files and 51 tests after these corrections.

## Progression and protected journey

The first distinct independent strong checkpoint returns `VERIFY_MASTERY`; a second distinct independent strong checkpoint advances the track to difficulty 2. Duplicate or assisted evidence cannot satisfy distinct mastery proof. Low work routes first to difficulty-1 guidance and then to difficulty-0 Unit 1 remediation. Because Unit 2 is not authored, difficulty 2 remains a genuine `CONTENT_NEEDED` boundary.

Start Journey and Continue Journey retain one authoritative transition. Home still has exactly two navigation controls, world cards remain display-only, and progression outcome has exactly one child-facing action. Safe recycling, deterministic least-used/oldest-used ranking, completed-session rejection, late-checkpoint rejection, exact-once rewards, and explicit Grade 3 Fluency Flight completion remain unchanged.

## Reporting, privacy, and accessibility

Parent and print views distinguish Grade 2 and Grade 3 Context Cavern and report ELA.3.V.1.1 as `SUPPORTIVE_PRACTICE / DRAFT`. They do not report oral scores, writing-production scores, productive mastery, FAST predictions, raw IDs, source text, guides, frames, examples, or answers.

Schema version 1 and all storage keys remain unchanged. No source content, guide metadata, frames, examples, answers, or learner-generated speech or writing is persisted. No backend, cloud synchronization, analytics, telemetry, microphone, speech recognition, or live AI was added.

The five bounded question types retain keyboard operation, visible focus, non-color-only feedback, reduced-motion handling, responsive rendering, and no typing or audio requirement. A dedicated regression proves that selecting a second radio-style Hot Text segment clears the first selection before grading.

## Registry and coverage snapshot

| Scope | Packs | Lessons | Texts | Questions | Support targets |
| --- | ---: | ---: | ---: | ---: | ---: |
| Grade 2 | 22 | 154 | 161 | 889 | 614 |
| Grade 3 | 16 | 112 | 119 | 643 | 441 |
| Combined | 38 | 266 | 280 | 1,532 | 1,055 |

Grade 3 coverage now has 12 implemented benchmark rows, 2 supportive-practice rows, 2 planned rows, and no partial, missing, or approved rows. This is curriculum coverage, not learner mastery.

## Verification and boundary

Checkpoint C passed lint, typecheck, 133 test files with 686 tests, production build, and `git diff --check`. The frozen documentation and release-correction checkpoint adds the Phase 7D4 acceptance suite and exercises 134 test files with 691 tests before commit and again after commit. The production bundle before documentation was `dist/assets/index-C8JCdfQE.js` at 2,831.11 kB raw and 566.91 kB gzip; CSS remained `dist/assets/index-1vquRqyg.css` at 50.43 kB raw and 11.11 kB gzip. The existing Vite chunk-size warning remains visible and unsuppressed.

Phase 7D4 is complete after the final local, remote, deployment, and live-asset gates pass. Phase 7D remains incomplete. Phase 7D5, Root Meaning Vault, Meaning Maze, the final Grade 3 audit, Grade 4, and timed FAST practice remain unstarted.

The exact recommended Phase 7D5 scope is Root Meaning Vault for ELA.3.V.1.2: bounded DRAFT instruction and assessment of roots, base words, and affixes used to determine word meaning, while preserving the one-button journey and leaving Meaning Maze unstarted.
