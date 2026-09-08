# P0 semantic answer-uniqueness audit

## Current local completion status

The fingerprint-bound semantic release gate is `PASS` on the current working tree. Registry-derived coverage is 1,614 active questions and 2,385 scored response slots. All 1,614 key-free primary conclusions are frozen, all 323 required stratified second-pass records are complete across 40 packs and 191 pack/type strata, all 1,614 current records have final semantic `PASS`, and the gate reports zero pending or unresolved issues.

Twenty-five questions carry direct correction provenance: 16 in Grade 2 and 9 in Grade 3. Corrections preserve the established totals of 40 packs, 280 lessons, 294 texts, 1,614 questions, and 1,111 support targets. Every changed learner-visible item was re-reviewed before its final record was accepted. The broader truth-ledger refresh is fingerprint reconciliation for source/factory changes and must not be misreported as 324 separate semantic defects.

Review provenance is same-conversation primary-agent work under the current no-subagent and no-fork policy. Earlier reviewer creation receipts produced no usable reports and are not independent approvals. Fingerprints establish exactly which projection was reviewed; they do not prove that natural-language review is infallible. No unresolved answer-ambiguity findings remained in this audit.

The semantic gate passing clears only the semantic barrier. Publication remains blocked until the complete mechanical suite, production build, Git safety checks, exact deployment, and deployed-browser acceptance also pass. Phase 7 remains historically complete; Phase 8, Grade 4, FAST timed practice, and Phase 10 remain unstarted.

## Historical initial checkpoint preserved below

Date: 2026-09-07

Starting HEAD, master, and origin/master:
`452ab848628ab1df4f212bbab682fb47da4befde`.

The starting worktree was clean, master tracked origin/master, the authorized
fetch preserved exact equality, and no interrupted Git operation was present.

## Outcome and release boundary

The reported failure class is real. Authored single-answer keys can reject
other defensible responses, and at least one source-evidence key identifies the
wrong action. The mechanical grading and existing truth gates did not detect
these semantic defects.

This is NOT a completed all-question audit. No learner curriculum or runtime
behavior has been changed. No defect has yet been corrected in production.
No commit, push, deployment, or deployed-browser acceptance has occurred during
this task. The new semantic gate returns STOP. The live application is unchanged.

Phase 7 remains complete historically. This separate P0 repair is unfinished.
Phase 8, Grade 4, FAST timed practice, and Phase 10 remain unstarted.

## Registry-derived inventory

| Inventory | Actual |
| --- | ---: |
| Active packs | 40 |
| Active lessons | 280 |
| Active texts | 294 |
| Active questions | 1,614 |
| Active support targets | 1,111 |
| Grade 2 questions | 889 |
| Grade 3 questions | 725 |
| Scored response slots | 2,385 |
| Existing current question-truth records | 1,614 |

The new semantic directory contains one record per active question, but an
unfinished record is FAIL, never a generated approval. These counts do not
increase curriculum inventory.

## Completed review work

Three Grade 2 packs have frozen primary Pass A conclusions: 123 questions and
139 response slots. Those receipts predate their authored-key comparison.
The importer reports 49 questions with primary semantic or ambiguity flags.
These are not 49 independently confirmed production defects: some remain
provisional, including pronunciation concerns needing stronger verification.

The other 1,491 questions have no frozen Pass A conclusion. No question has a
completed final semantic PASS. Pass C, independent reconciliation, the Grade 3
review, the remaining Grade 2 review, and the required cross-pack sample remain
incomplete.

| Pack | Frozen questions | Flagged questions |
| --- | ---: | ---: |
| g2-word-forge-variable-vowels-oo-ea | 41 | 10 |
| g2-word-forge-variable-vowels-ou-oi-oy-ow | 41 | 25 |
| g2-word-forge-two-syllable-open-closed | 41 | 14 |

## Confirmed primary findings requiring correction

These conclusions concern the current source and prompt, not an assumption
about what the author intended. They remain uncorrected and await the required
independent final review and focused correction tests.

| Question | Defect | Required correction direction |
| --- | --- | --- |
| q-word-forge-oo-ea-guided-b-3 | The prompt asks for beach cleanup. The key selects the meeting-at-the-beach sentence, not the sentence describing picking up trash. | Select `boots-pool-sentence` rather than `cleanup-sentence`; reconcile the prompt, evidence, and explanation with the cleanup action. |
| q-word-forge-oo-ea-guided-a-3 | More than one selectable sentence shows the moon-room scene. | Ask for one specific source-supported event or detail rather than any sentence showing the scene. |
| q-word-forge-oo-ea-guided-d-3 | The named weather-team sentence and another sentence about that team's actions both fit the broad prompt. | Specify the exact requested team action or detail. |
| q-word-forge-ou-oi-oy-ow-guided-ou-ow-prereq-1 | Cloud and cow both have the vowel sound in loud; the prompt does not explicitly require the letters ou. | Explicitly require the target vowel-team letters and their sound if spelling-plus-sound is the construct. |
| q-word-forge-ou-oi-oy-ow-guided-oi-oy-prereq-1 | Coin, toy, and boy have the vowel sound in boil. | Do not treat oi and oy as different sounds; make the spelling requirement explicit. |
| q-word-forge-ou-oi-oy-ow-guided-ou-ow-practice-1 | Group and soup both match group, including its ou spelling. | Exclude the exemplar explicitly or replace it with an actually incorrect distractor. |
| q-word-forge-ou-oi-oy-ow-guided-oi-oy-practice-1 | All four choices match boil's vowel. Coin and choice also both use oi. | Clarify the spelling-plus-sound contract AND replace the extra matching oi choice. |
| q-word-forge-ou-oi-oy-ow-checkpoint-a-3 | Toy and boy both match joy's vowel and oy spelling. | Replace one valid same-pattern distractor; spelling clarification alone is insufficient. |
| q-word-forge-syllable-summit-guided-closed-4 | The prompt names rabbit and napkin together, but no single selectable sentence contains both. | Make the single-sentence target achievable and unique. |
| q-word-forge-syllable-summit-guided-open-4 | The prompt names robot and music together, but no single selectable sentence contains both. | Make the single-sentence target achievable and unique. |
| q-word-forge-syllable-summit-checkpoint-c-3 | The prompt requires words in the displayed passages, but keyed `helmet-choice` appears in none of those passages. | Reconcile the source-presence condition, options, keyed set, and selection count; do not force a learner to select an absent word. |

Additional flagged table rows use labels such as `oi sound` and `oy sound` as
though those spellings identify different vowels, or use undefined categories
such as `Mixed sound`. These need row-by-row rewriting, not a global answer-key
swap. Some ea prompts also leave spelling versus sound unstated.

## Primary-review errors and external-check limitation

The ownership gate caught eight invalid option-evidence judgments across two
questions in the third batch:

- `q-word-forge-syllable-summit-checkpoint-c-3`
- `q-word-forge-syllable-summit-checkpoint-c-7`

Those conclusions cite `rabbit-habitat-*` evidence although their displayed
sources are Tulip Garden, Pilot Weather Log, and Photo Display. The compact
reading display de-duplicated sources without repeating each question's source
binding. The original exported records contain the correct bindings. Future
review displays must repeat those bindings explicitly. The frozen receipt is
preserved unchanged; these entries are not approved.

The source-ownership follow-up exposed the absent-helmet key independently of
the provisional pronunciation concern. The initial review did not establish
that condition correctly and must not be represented as flawless.

Pronunciation flags remain provisional. An editorial-only check of Cambridge's
napkin pronunciation page lists short i in both its US and UK forms; it does not
establish the hypothesized schwa variation. A magnet pronunciation request
returned HTTP 403. Do not turn these incomplete checks into confirmed dialect
defects or rewrite sound instruction based on them alone. No external dictionary
service has been added to the application.

Editorial reference: https://dictionary.cambridge.org/us/pronunciation/english/napkin

## Four bounded review requests: tooling limitation

Exactly four usable MCP creation requests were issued after baseline success,
each with read-only authority and no production edits, nested agents, Git, push,
deployment, or phase expansion. They returned pending client identifiers only:

| Lane | Scope | Pending client identifier |
| --- | --- | --- |
| 1 | Grade 2 blind answer audit | client-new-thread:bf0ccf08-2d22-4254-937b-1ea3064de407 |
| 2 | Grade 3 blind answer audit | client-new-thread:e1be70da-85c3-443a-9179-073eda9642ca |
| 3 | Cross-type adversarial and infrastructure review | client-new-thread:ac6e82ad-ee75-48f3-946e-47ab47093411 |
| 4 | Final educational, UI, and release review | client-new-thread:596cdbbb-e034-4ada-b713-81108d990f2b |

No usable thread IDs or reviewer reports became available through the thread
listing. Earlier legacy-tool calls were rejected as unavailable and created no
confirmed reviewer. No replacement or fifth agent was requested. Four completed
independent reviews are NOT claimed. The primary fallback has covered only the
three documented packs, not the full scopes of all four lanes.

## Local implementation and checks

- Added an offline opaque-ID blind exporter.
- Added a typed option-level semantic gate with exact slot/option ownership,
  defensible-set equality, ambiguity, evidence, fingerprints, and review-stage
  checks. It does not score the child's answers or change the app evaluator.
- Added a baseline ledger importer that preserves missing work as FAIL.
- Added 11 focused tests proving that a keyed single answer cannot override a
  second defensible answer, an equivalent distractor, invalid evidence, missing
  table rows, a missing two-part dependency, or an unfinished review.
- Baseline: lint and typecheck PASS; 147 files / 775 tests PASS; build PASS.
- Local code checkpoint: lint and typecheck PASS; 148 files / 786 tests PASS;
  zero reported failures or skips; build PASS.
- Existing canonical/adversarial, truth, planner-liveness, safe-recycling,
  historical-review, fluency, one-button journey, parent, print, persistence,
  and accessibility tests remain passing. They do not establish semantic
  correctness of the flagged questions.
- The semantic command correctly exits 1 with STOP. Its 12,476 issue entries
  include missing review stages and missing option judgments, not 12,476
  distinct authored defects.

Bundle remains `index-DjCzn_-F.js`, 2,982.32 kB raw / 606.32 kB gzip.
CSS remains `index-1vquRqyg.css`, 50.43 kB raw / 11.11 kB gzip.
The existing Vite chunk-size warning remains visible and unsuppressed.

## Remaining release work

Complete all remaining blind reviews and the independent adversarial sample;
reconcile every flagged item and every primary-review error; correct confirmed
content; handle active-session compatibility; refresh affected truth and
semantic records; run focused and global gates; perform the final independent
educational/UI review; only then consider normal commit/push, Pages verification,
and full deployed-browser acceptance. No release success is inferred from this
checkpoint and no later phase is authorized by it.
