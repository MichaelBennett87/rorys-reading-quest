# Read & Write External-Service Readiness Report

Status: `EXTERNAL ACTIVATION PENDING`

## Corrected gaps

- The former adapter checked only moderation HTTP success. It now requires a well-formed `results[0].flagged` decision, handles a flagged HTTP 200, checks generated child-visible output, and fails closed when safety output is absent or malformed.
- The former adapter returned configured estimates as actual cost. It now preserves response usage before parsing model content, verifies the configured model identity, calculates cost from reviewed input/output pricing, and marks missing or malformed usage as unresolved rather than free.
- The former `SameSite=Strict` cookie contract was not suitable for a GitHub Pages frontend calling a separately hosted service in Safari. Activation now yields a revocable installation bearer kept outside localStorage in IndexedDB and sent in an authorization header.
- WebKit can finish a short IndexedDB transaction immediately after its request succeeds. The credential store now subscribes to transaction completion before issuing the request, preventing authorization from hanging after a successful activation.
- Deduplication formerly used only request identity. It now binds installation, operation, request identity, and canonical payload hash. A changed payload conflicts; an ambiguous paid outcome retains its maximum reservation.
- The service now derives spelling-assessment supportability from matching server-side recognition provenance. A browser boolean cannot authorize spelling assessment.

## Operational topology

GitHub Pages continues to serve the unchanged local-first reading application. A future separately hosted HTTPS Node service owns authorization, catalog/rubric resolution, validation, provider calls, budget, deduplication, and retention. The included durable store is intentionally one-instance only and requires an encrypted attached volume. No production host or account was created by this work.

## Evidence classes

- Frontend mocks: deterministic child/parent UI, timeout, fallback, and stale-reply behavior.
- Controlled local backend: real HTTP/CORS/bearer/service/ledger behavior in Edge and Playwright WebKit, with a local deterministic provider and zero paid requests.
- Deployed backend: not available.
- Real provider inference: not run; no credentials, child data, subscription, or spend were used.

## Retention

The service audit stores hashes and budget/provenance metadata for 30 days. A sensitive deduplication result is bounded to 15 minutes. Request bodies are not service audit data and must not appear in access or exception logs. Host backups and provider retention remain separate configuration gates.

## Activation boundary

Code readiness is not provider approval. `store: false`, a configured retention enum, mocks, and controlled-provider tests do not prove Zero Data Retention approval. Live processing remains disabled until all owner actions in `docs/READ_WRITE_PILOT.md` are complete and a non-child live canary passes.
