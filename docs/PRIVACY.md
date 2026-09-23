# Privacy Boundary

## Ordinary reading

Rory's ordinary reading journey remains local to the browser. It does not use telemetry, advertising, analytics, cloud progress synchronization, live lesson generation, a microphone, a camera, or file uploads. Reading progress, the parent PIN record, and parent assessment records retain their existing separate stores and protections.

## Read & Write pilot

Read & Write is a private, parent-enabled supplemental pilot and is off by default. With the pilot disabled, the application makes no writing-service request and ordinary reading remains fully usable.

The local pilot may retain normalized ink strokes, typed draft text, raw transcription, confirmed or parent-corrected transcription, bounded feedback, uncertainty, request status, fallback reason, and separate AI/parent-review provenance. Those records use `rorys-reading-quest.writing-pilot.v1`, not the reading-progress payload. Retention is bounded to 30 days and 18 records. Unexpired records awaiting parent review are not silently evicted; supplemental writing pauses if that queue is full. Parent Area can disable the pilot and delete one or all writing responses.

The local Parent PIN protects Parent Area on the same browser. It is not remote authentication and is never sent to the writing service. Parent Area on another device cannot see this browser's writing history.

## External-processing boundary

External processing is permitted only after all of these independent controls are active:

- a reviewed direct Cloudflare Workers AI endpoint with no AI Gateway or paid-provider fallback;
- a protected deployed service that exchanges a one-time parent-provisioned code for a high-entropy, revocable installation bearer stored in a dedicated IndexedDB credential store;
- the current parent notice and consent version;
- current verification that the authorized account and selected models are eligible for Workers Free;
- reviewed Cloudflare and model data/usage terms reflected in the notice;
- a conservative finite server-enforced neuron allowance covering recognition, evaluation, and required safety processing, with paid spending fixed at $0.

Recognition receives cropped ink and layout information only. It does not receive the expected response or rubric. Evaluation receives the confirmed text plus the specific source and server-owned rubric. Neither request includes learner history, PIN material, assessments, personal names supplied by the application, school, address, or arbitrary browser-supplied model/URL/rubric values. Free-form writing can still be sensitive, so the application does not promise perfect de-identification.

Provider and Cloudflare management credentials never enter browser JavaScript, Vite variables, Git, screenshots, reports, or Parent Area. The installation bearer remains in a dedicated IndexedDB store. Request bodies must not be written to service access logs, exception logs, analytics, or CI artifacts. The Worker disables observability logging and stores only bounded authorization/quota metadata plus short-lived payload-bound deduplication results in its Durable Object. Cloudflare account-wide usage and provider retention remain separate from the browser's local 30-day writing retention.

Cloudflare documents Workers AI inputs and outputs as customer content that is not used to train or improve its services without explicit consent; the selected Gemma model has separate Apache 2.0 terms. Those statements do not by themselves certify the pilot for child data. Automatic feedback remains disabled until account, processor, notice, safety, quality, and live-canary review are complete.

## Current activation status

`LOCAL PARENT FALLBACK READY; CLOUDFLARE ACTIVATION PENDING`

No authorized Cloudflare account or CLI session was available during this implementation, so no Worker resource or inference call was made. CI uses synthetic ink, a controlled provider, and the real local Worker/Durable Object runtime; it spends $0 and does not measure handwriting accuracy. Activation still requires the actual Workers Free account check, HTTPS Worker deployment, secret provisioning, private installation issuance, and a bounded non-child live canary. A checked box and local PIN do not satisfy those controls. A broader public rollout requires a separate legal/compliance and verifiable-parental-consent review.

Never recommend clearing Safari website data as a routine repair; doing so can erase local learning and writing records.
