# Parent-Enabled Read & Write Pilot

Status: `LOCAL PARENT FALLBACK READY; CLOUDFLARE ACTIVATION PENDING`

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

## Cloudflare free-only provider

The guarded production candidate is one Cloudflare Worker using direct Workers AI bindings, `@cf/google/gemma-4-26b-a4b-it` for vision/language work, `@cf/meta/llama-guard-3-8b` for bounded text safety classification, and one SQLite-backed Durable Object for installation authorization, request identity, short-lived deduplication, and application quota. AI Gateway and every paid-provider fallback are prohibited. The checked-in OpenAI service remains only as historical controlled-contract test code and is not a runtime fallback.

The Worker requires current Free-plan verification, paid routes disabled, and a conservative application cap of at most 5,000 estimated neurons per UTC day; the default is 4,000. This cap is deliberately below Cloudflare's account-wide 10,000-neuron Free allocation, but it cannot observe use by unrelated applications. Cloudflare quota errors remain authoritative. Provider token usage, estimated neurons, unknown outcomes, and actual paid spending are separate fields. Missing usage is never treated as free, and actual paid spending must remain zero.

Gemma output is parsed and validated as data rather than trusted JSON mode. Recognition receives cropped ink and layout instructions without the expected answer or rubric. Evaluation receives confirmed learner text, the source, and a server-owned rubric. Learner text is untrusted data; the model receives no tools, web access, arbitrary URLs, or application-state authority. Returned text is rendered as React text, never raw HTML.

The candidate is documented as vision-capable and available on Workers Free, and its linked model license is Apache 2.0. This does not certify handwriting quality or child-data suitability. A frozen non-child benchmark and live $0 canary remain activation gates.

## Ana fallback and daily reset

Ink is saved locally before any external request. Provider daily quota, RRQ application quota, capacity, rate limit, network failure, timeout, authorization failure, safety withholding, uncertain recognition, and invalid output each retain one stable parent-review record. None becomes an incorrect answer, reading remediation, mastery evidence, XP, or stars. The child sees only that the writing is saved for a grown-up to check and can continue the already-authoritative reading lesson.

A confirmed quota stop opens a local circuit until the next 00:00 UTC boundary. Page load, rendering, and Parent Area never retry queued work. After reset, only a newly and explicitly submitted response may try free inference; yesterday's queue remains assigned to Ana unless a parent explicitly initiates a future reviewed retry feature. No message claims that Ana was notified, sent a copy, or can view the record from another device.

Unexpired records awaiting parent review are protected from record-limit eviction. At 18 pending items, new supplemental writing offers pause while ordinary reading continues. Ana sees pending work oldest-first and may record separate comprehension, spelling, grammar/punctuation, and correction notes, then mark or delete the local record. Parent provenance never overwrites machine provenance or original ink.

## Testing and evidence classes

- Unit tests cover catalog integrity, bounded fail-closed storage, consent/auth/budget, server-owned rubrics, recognition isolation, moderation-body handling, usage reconciliation, payload-bound deduplication, concurrent durable reservations, malformed response rejection, and late-response rejection.
- Edge and Playwright WebKit release gates use synthetic ink and mocked UI responses, then separately exercise the real local HTTP service with a controlled provider for CORS, bearer activation, authorization, replay, expiry, revocation, and budget/deduplication behavior.
- Mocked tests prove flow and safety handling, not provider accuracy.
- The controlled local backend proves the real service boundary without contacting a provider; it is not a deployed-backend or live-inference result.
- No live-provider canary has run; synthetic-test provider spending is $0.
- No Rory handwriting, PIN, assessment, or other private learner data is used in development fixtures.

## Activation blockers

External activation requires all of the following and none is currently configured in this repository environment:

- an existing authorized Cloudflare account confirmed to use Workers Free, with no paid AI Gateway or paid overage path for RRQ;
- a deployed HTTPS Worker and SQLite Durable Object, with the activation-code hash and free-plan verification timestamp stored outside Git and browser code;
- reviewed Cloudflare Workers AI and Gemma processor/data terms reflected in the parent notice;
- one-time approved-installation issuance, expiry, and revocation operations;
- a conservative finite daily application neuron cap while the monetary limit remains exactly $0;
- the frozen non-child synthetic benchmark and a bounded live $0 canary covering recognition, safety, evaluation, accounting, authorization, and the complete browser flow;
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
