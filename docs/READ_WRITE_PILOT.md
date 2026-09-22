# Parent-Enabled Read & Write Pilot

Status: `GUARDED IMPLEMENTATION - EXTERNAL ACTIVATION PENDING`

## Product role

Read & Write is supplemental Grade 2-3 DRAFT practice. At selected comprehension-checkpoint boundaries, an enabled installation may offer one short source-bound writing response before revealing the already-planned next reading lesson. Writing does not count as a scored reading question, benchmark coverage, mastery evidence, remediation evidence, an attempt, a review, XP, or stars.

The ordinary journey remains question-first and unchanged when the pilot is disabled.

## Six activities

The separate catalog contains six activities over three existing passages and versions:

1. Tia's cleanup: explain why she collected light wrappers first.
2. Tia's cleanup: explain how the neighbors solved the sidewalk problem.
3. The bridge model: explain why Carlos added a brace.
4. The bridge model: explain how Carlos and Emmi knew the bridge was fixed.
5. The Bent Trail Marker: explain why Jalen tried Mara's plan.
6. The Bent Trail Marker: explain how Jalen changed.

Each prompt requests one sentence supported by that passage. Server-owned rubrics include required ideas, source evidence, acceptable paraphrases, contradictions/omissions, varied valid examples, and examples that separate correct meaning from imperfect mechanics. Examples are not exact-match answer keys.

## Child flow

1. Keep the source passage visible.
2. Write with finger, pen/stylus, or mouse, or open the labelled keyboard alternative.
3. Select `Check Writing` once. No request occurs while drawing or typing.
4. Confirm or correct the raw transcription using `That's What I Wrote`.
5. Read separate understanding, evidence, spelling, grammar, and capitalization/punctuation feedback.
6. Select `Next` to reveal the already-authoritative next reading activity.

The pad stores normalized points, redraws for device-pixel ratio and orientation, captures/cancels pointers, and offers Write, Eraser, Undo, and Clear. It does not promise perfect palm rejection or physical-stylus compatibility. Typed text disables a claim that spelling is untouched handwriting evidence.

When processing is unavailable or uncertain, the work is saved for parent review and is never marked incorrect. Recognition uncertainty that could change meaning withholds comprehension judgment.

## Parent flow

Writing Review lives behind the existing `#/parent` PIN gate. A parent can enable local practice, provision the separate protected-service authorization, inspect ink/raw/confirmed text and provenance, correct a transcription, accept or dismiss suggestions, mark work reviewed, delete a response, delete all writing, or disable future processing. Opening a record sends no provider request.

The local PIN is not service authorization. Activation uses a parent-provisioned one-time code exchanged by the protected service for a high-entropy installation bearer. The code is not persisted. The bearer is stored only in a dedicated IndexedDB credential store, separate from reading and writing records, and is sent in an `Authorization` header. This avoids relying on a cross-site cookie that Safari may block while retaining server-enforced expiry and revocation.

## Storage and request authority

- Storage key: `rorys-reading-quest.writing-pilot.v1`.
- Schema: independent version 1; reading schema version 1 and its keys are unchanged.
- Limits: 18 records, 30 days, 200 strokes, and 4,000 normalized points per retained state.
- Saves use a short Web Lock, compare-before-write revision, and accepted-byte readback.
- Network waits never hold the browser lock.
- Every request is bound to installation, operation, request identity, canonical payload identity, submission, and ink revision; a late reply cannot grade replacement ink and an identity reused with different content is rejected.
- The server owns allowed origins, installation authorization, consent version, source task, rubric, provider models, request limits, deduplication, and budget.
- A short exclusive durable lock covers reservation and reconciliation. Observed usage is priced from an explicitly reviewed model/pricing version. Unknown paid outcomes retain the full reservation and are not blindly retried or treated as free.
- The included file-backed ledger supports one service instance on one host with an encrypted attached volume. Horizontal scaling is unsupported until a transactional database implements the same interfaces.

## Provider adapter

The repository implements one server-only OpenAI adapter without a browser SDK. It requires explicitly pinned model identities, reviewed pricing, token bounds, `store: false`, no tools, no web access, no persistent conversation/file/vector-store state, bounded timeouts, structured schemas, and zero automatic retries. It parses moderation decisions rather than treating HTTP 200 as permission, checks generated child-visible feedback, preserves usage before content parsing, and distinguishes flagged content, malformed safety results, refusals, definite failures, and ambiguous paid outcomes. `store: false` is not represented as Zero Data Retention approval. Real use remains blocked until the specific project has the required approved retention controls and the protected service is deployed.

Recognition receives only the ink image and layout instructions. Evaluation treats confirmed learner text as untrusted data and has no tools or state authority. Returned text is rendered as React text, never raw HTML.

## Testing and evidence classes

- Unit tests cover catalog integrity, bounded fail-closed storage, consent/auth/budget, server-owned rubrics, recognition isolation, moderation-body handling, usage reconciliation, payload-bound deduplication, concurrent durable reservations, malformed response rejection, and late-response rejection.
- Edge and Playwright WebKit release gates use synthetic ink and mocked UI responses, then separately exercise the real local HTTP service with a controlled provider for CORS, bearer activation, authorization, replay, expiry, revocation, and budget/deduplication behavior.
- Mocked tests prove flow and safety handling, not provider accuracy.
- The controlled local backend proves the real service boundary without contacting a provider; it is not a deployed-backend or live-inference result.
- No live-provider canary has run; synthetic-test provider spending is $0.
- No Rory handwriting, PIN, assessment, or other private learner data is used in development fixtures.

## Activation blockers

External activation requires all of the following and none is currently configured in this repository environment:

- an approved protected-service host and deployment;
- a service secret stored outside Git and browser code;
- reviewed OpenAI project retention configuration, including actual Zero Data Retention approval where required;
- approved-installation issuance and revocation operations;
- a finite parent-approved server-side budget and price configuration;
- a live, non-child synthetic canary covering recognition, validation, accounting, and the complete browser flow;
- applicable parent notice/consent and broader-public-rollout compliance review.

## Service-owned retention and logging

The service stores no request body in its audit ledger and must not place handwriting, confirmed writing, PIN material, assessments, or provider bodies in access or exception logs. It retains hashed activation/session credentials, request and payload hashes, operation/cost metadata, and recognition provenance without learner text for 30 days. A completed deduplication response may contain transcription or feedback and is therefore retained for only 15 minutes. Backups and host logs must honor the same bounded policy. Provider-side retention remains an independent approval gate.

## Remaining owner setup

1. Select and deploy the reviewed HTTPS host with an encrypted persistent volume and one running service instance.
2. Verify the provider project's applicable child-data and actual Zero Data Retention approval.
3. Provision the provider credential in the host's secret store, never the frontend or repository.
4. Issue the approved installation and one-time activation code through a private parent-controlled process.
5. Approve and configure a finite nonzero spending limit and the reviewed pinned model/pricing inputs.

After those five items, run one authorized non-child live canary and the complete Edge/WebKit browser flow before changing the status from `EXTERNAL ACTIVATION PENDING`.

GitHub Pages remains the static frontend host and cannot provide the protected server authority by itself.
