# Grade 2 Semantic Question Audit

## Scope

- Automated questions checked: 889 active Grade 2 questions
- Active packs checked: 22
- Active lessons checked: 154
- Source slice: active production packs only; legacy development content remains excluded from fresh planning
- Status: deterministic integrity checks pass after confirmed defects were corrected

## Automated checks performed

The registry-aware audit now checks:

- lesson and question ownership
- question passage membership in the owning lesson
- hot-text segments against the intended source text
- local and scoped evidence resolution and passage ownership
- keyed-answer existence
- single-select and multiselect cardinality
- two-part authored-context consistency
- paired-text evidence scope
- structured-retell piece ownership
- explanation references to answers and evidence
- stale first, second, or third positional explanations
- duplicate visible choices
- prompt-exemplar leakage in transfer-oriented items

Malformed-fixture regression tests prove that ownership, source, key, cardinality, and ordinal defects are reported rather than silently accepted.

## Semantic review approach

The deterministic audit was run against every active question. A source-level editorial pass also reviewed each active pack's manifest, question modules, answer keys, evidence references, explanations, structured builders, paired-text guides, and retell guides in its authored lesson context. Pack-specific audits remain responsible for their deeper format contracts.

Automated checks can prove structural and authored-context invariants, but they cannot establish professional curricular approval or replace a live human reading of every learner experience.

## Confirmed defects found and corrected

- The two oo/ea checkpoints displayed Moon Room and Beach Cleanup passages while their questions were authored for Tree Study and Pool Party. Their lesson titles, objectives, and passage ownership now match the authored question families.
- Common Prefix and Silent Letter lesson manifests omitted additional canonical passages used by their questions. Those passage lists now include every authored question context.
- Eleven hot-text selectable segments contained stale or incomplete text that did not exactly match the intended source. The visible segments now match their canonical text.
- Several oo/ea answer keys or explanations conflated spelling patterns with sounds. `book`, `bread`, and the affected `ea` selections now use phonetically accurate distinctions.
- Thirty-six low-transfer exemplar prompts repeated the keyed token or named the answer too directly. They now ask for valid transfer using a different accurate exemplar or a direct feature question.

No lesson, text, question, support target, benchmark, or content pack was added by these corrections. Existing identifiers were retained where safe.

## Automated result

- Questions checked: 889
- Packs checked: 22
- Lessons checked: 154
- Remaining deterministic issues: 0

## Targeted human-style source review

The repository pass covered all active pack families, with additional line-level attention to Word Forge ownership, hot-text source text, answer sound relationships, Retell Hall sequence pieces, and Compare Keep scoped evidence. Confirmed defects were corrected in place and protected by regression tests.

## Items still needing live human verification

- The deployed child and parent visual experience needs Michael's post-deployment playthrough.
- Browser voice quality varies by operating system and installed voice. The app requests authored chunks and distinct sequences, but browser SpeechSynthesis cannot guarantee isolated phoneme fidelity.
- Professional curricular approval remains pending; this repository audit does not claim it.

## Final status

Expanded deterministic audit passed. Source-level editorial review is complete for this hardening implementation. Live human visual and voice acceptance remains pending.

## Phase 6.6 Sol extension

A GPT-5.6 Sol repository-level curricular reasoning review supplemented the deterministic audit across all 22 active packs and all 889 questions. It reviewed keyed answers, distractor defensibility, skill alignment, available evidence, explanation accuracy, Grade 2 wording, pronunciation ambiguity, passage ownership, transfer value, and mechanical repetition.

Confirmed corrections included ambiguous consonant-`le`, prefix, suffix, and fluency prompts; four rhyme-scheme text conflicts; generated perspective wording; author-purpose items that had incorrectly keyed central ideas; inaccurate compost wording; weak opinion evidence; misclassified context clues; stale Wordplay and Retell text; and a Compare Keep checkpoint whose two texts did not share a sufficiently precise topic.

The automated result remains 889 questions checked with zero deterministic issues. The Sol review corrected twelve confirmed defect families without adding or removing curriculum. Professional teacher review, dialect-sensitive phonics listening, and Michael's deployed visual acceptance remain human review boundaries.
