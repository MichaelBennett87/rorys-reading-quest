# Question Grading Contract

## Purpose

The question grading contract prevents a structurally valid answer key from being mistaken for a proven runtime result. Every active question is converted to the lesson runtime shape and submitted through production `evaluateAnswer` with both canonical and adversarial payloads.

## Canonical submissions

- Multiple choice: the single authored choice ID
- Multiselect: the complete authored choice-ID set
- Hot text: the complete authored segment-ID set
- Two-part: both authored Part A and Part B IDs
- Table match: the complete row-to-choice mapping

Order-independent forms also receive a canonical-equivalent submission with reversed array or mapping insertion order.

## Adversarial submissions

### Multiple choice

Every non-key choice, an empty ID, and an unknown ID must be incorrect.

### Multiselect

When the visible set contains eight or fewer choices, every subset except the canonical set is tested. Larger sets use empty, singleton, missing-required, extra-choice, replacement, and deterministic mixed mutations. Input order does not change a correct complete set.

### Hot text

Every bounded segment subset is tested when possible. Missing, extra, single incorrect, and reordered selections cannot change the exact-set contract.

### Two-part

The complete Part A x Part B choice matrix is tested. Only canonical Part A plus canonical Part B is correct; a merely true but unsupported Part B is not sufficient.

### Table match

Each row is changed to every visible incorrect option while other rows remain canonical. Missing rows, unknown options, and extra unknown rows are rejected. `use_each_once` requires distinct selected choice IDs and preserves the one-use retell contract.

## Evaluator invariants

- Canonical result is correct.
- Every adversarial result is incorrect.
- Returned explanation is the current question's explanation.
- Evaluation does not mutate authored content.
- Failures identify both question ID and pack ID in the test report.

## Feedback semantics

- Before submission: `data-answer-state="selected"` is neutral and world-accented, never green or red.
- Correct feedback: explicit `answer-feedback-correct`, `data-result="correct"`, check icon, `Correct!` text, green accent, and one brief correct pulse.
- Incorrect feedback: explicit `answer-feedback-incorrect`, `data-result="incorrect"`, correction icon, `Not quite` text, red accent, and one brief incorrect pulse.
- After an incorrect response, the selected incorrect option is red and the authored correct option is green.
- Multiselect, hot text, two-part, table-match, and `use_each_once` rows derive presentation from submitted IDs without changing grading data.
- `prefers-reduced-motion: reduce` disables both pulses while preserving icons, text, borders, and contrast.

## Fingerprint contract

Every ledger fingerprint includes relevant pack metadata, the owning lesson, all displayed lesson texts, and the complete authored question. Any later change to wording, answer data, evidence, explanation, ownership, or source text invalidates the ledger test until that question is reviewed again.

The ledgers contain authored curriculum and concise audit outcomes only. They contain no learner response, child identifier, persisted progress, hidden reasoning, or assessment prediction.
