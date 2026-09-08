# Semantic answer-uniqueness review protocol

## Release status

This audit is incomplete and its release gate is STOP. Existing question-truth
PASS records establish agreement with authored keys, not semantic uniqueness.
No production correction, commit, push, deployment, or browser acceptance has
been performed by this audit checkpoint. Phase 7 remains complete historically;
this is a separate post-Phase-7 P0 content-truth repair. Phase 8 is not started.

## Review stages

1. Export learner-visible material with opaque question, answer, and source IDs.
2. Review the exact sources attached to each question, including displayed
   reference cards and guided teaching. Do not assume that a source used earlier
   in the pack is owned by a later question.
3. Record every defensible response and one concise judgment for every option.
   Preserve ambiguity instead of forcing the UI's selection count.
4. Freeze Pass A conclusions and the projection SHA-256 before revealing keys.
5. Compare the frozen conclusion with the current key. This mechanical Pass B
   comparison does not finish the editorial review of guides or explanations.
6. Challenge every distractor, reconcile source ownership and explanation/key
   agreement, and record the final educational review. Check both two-part
   slots and their direct evidence dependency.
7. Correct confirmed defects. Re-review changed learner-visible material and
   refresh its truth and semantic fingerprints. Preserve the earlier receipt;
   never silently rewrite a frozen conclusion to agree with the key.
8. Require a fully reviewed current PASS for every active question before release.

## Commands

```powershell
node scripts/export-answer-uniqueness-review.mjs <temporary-review-directory>
node scripts/audit-answer-uniqueness.mjs --write --projection-dir <temporary-review-directory>
node scripts/audit-answer-uniqueness.mjs
npx vitest run tests/content/answerUniquenessAudit.test.ts
```

The export is offline and uses the production registry. Reviewers performing
Pass A must not read the export's `private` directory, production question
implementations, existing truth ledgers, or assembled semantic ledgers.

The `--write` command is a baseline importer for frozen Pass A conclusions.
It does not generate semantic judgments or complete Pass C. It creates explicit
FAIL records for missing work and exits nonzero while any release issue remains.
Do not use it to overwrite later adjudicated records; preserve those records and
their review receipts when implementing a later reconciliation importer.

The default command verifies without rewriting records. It is an additional
release gate, not currently an npm script or a replacement for the established
canonical/adversarial grading contract. A green `npm run test` alone is not a
semantic release approval.

## Durable evidence

- `blind/*.pass-a.json`: frozen concise review conclusions, not private reasoning.
- `<pack-id>.json`: current fingerprint-bound records, including unfinished work.
- `AUDIT_PROGRESS.json`: registry-derived structured progress.
- `AUDIT_PROGRESS.md`: generated human-readable progress.
- `../../P0_SEMANTIC_ANSWER_UNIQUENESS_AUDIT.md`: findings and operating limitations.

SHA receipts bind recorded content. A hash cannot establish that a reviewer was
independent or that a rationale is substantively correct. Those facts require
the actual review process and must not be manufactured by an audit generator.

## Known incomplete infrastructure work

- Reconcile the third batch's two source-ownership errors without overwriting
  its frozen Pass A receipt.
- Store an explicit post-comparison adjudication layer and per-change review
  receipts before any final semantic PASS is issued.
- Complete the risky-word, pronunciation, and deterministic 20-percent clean
  cross-pack sample reviews.
- Review exporter parity for fluency teaching and every learner-visible feature.
- Design corrected-content compatibility for active sessions. Existing session
  recovery checks lesson content versions, not a per-question semantic revision.
  Do not let a same-version correction silently reuse stale scored feedback.
- Add full malformed-ledger schema validation before accepting externally edited
  records as trusted input. The current typed core assumes its input structure.
- Do not mistake these pending contracts for completed production protection.
