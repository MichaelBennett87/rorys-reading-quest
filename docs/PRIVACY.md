# Privacy Boundary

## Ordinary reading

Rory's ordinary reading journey remains local to the browser. It does not use telemetry, advertising, analytics, cloud progress synchronization, live lesson generation, a microphone, a camera, or file uploads. Reading progress, the parent PIN record, and parent assessment records retain their existing separate stores and protections.

## Read & Write pilot

Read & Write is a private, parent-enabled supplemental pilot and is off by default. With the pilot disabled, the application makes no writing-service request and ordinary reading remains fully usable.

The local pilot may retain normalized ink strokes, typed draft text, raw transcription, confirmed or parent-corrected transcription, bounded feedback, uncertainty, request status, and parent-review provenance. Those records use `rorys-reading-quest.writing-pilot.v1`, not the reading-progress payload. Retention is bounded to 30 days and 18 records. Parent Area can disable the pilot and delete one or all writing responses.

The local Parent PIN protects Parent Area on the same browser. It is not remote authentication and is never sent to the writing service. Parent Area on another device cannot see this browser's writing history.

## External-processing boundary

External processing is permitted only after all of these independent controls are active:

- a reviewed provider and fixed endpoint;
- a protected deployed service with an approved-installation credential in an `HttpOnly`, `Secure`, `SameSite=Strict` session;
- the current parent notice and consent version;
- verified applicable child-data retention controls;
- a finite server-enforced per-installation budget covering recognition, evaluation, and required safety processing.

Recognition receives cropped ink and layout information only. It does not receive the expected response or rubric. Evaluation receives the confirmed text plus the specific source and server-owned rubric. Neither request includes learner history, PIN material, assessments, personal names supplied by the application, school, address, or arbitrary browser-supplied model/URL/rubric values. Free-form writing can still be sensitive, so the application does not promise perfect de-identification.

Provider credentials never enter browser JavaScript, Vite variables, Git, screenshots, reports, or Parent Area. Request bodies must not be written to service access logs, exception logs, analytics, or CI artifacts.

## Current activation status

`EXTERNAL ACTIVATION PENDING`

The repository has no configured protected service deployment, provider secret, verified provider retention approval, approved installation, or finite parent-authorized spending limit. CI uses synthetic ink and mocked responses and spends $0. A checked box and local PIN do not satisfy the missing controls. A broader public rollout requires a separate legal/compliance and verifiable-parental-consent review.

Never recommend clearing Safari website data as a routine repair; doing so can erase local learning and writing records.
