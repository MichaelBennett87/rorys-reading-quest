# Cloudflare Free-Only Read & Write Readiness

Status: `LOCAL PARENT FALLBACK READY; CLOUDFLARE ACTIVATION PENDING`

## Decision

GitHub Pages remains the frontend and therefore preserves the existing browser-local reading and writing origins. The external candidate is one `workers.dev` HTTPS Worker using direct Workers AI bindings and one SQLite-backed Durable Object. Authentication uses the existing high-entropy installation bearer in IndexedDB rather than cross-site cookies, the Parent PIN, CORS, or an anonymous endpoint.

The selected candidate is `@cf/google/gemma-4-26b-a4b-it`, which Cloudflare documents as vision-capable and available on Workers Free. The linked Gemma license is Apache 2.0. `@cf/meta/llama-guard-3-8b` is the bounded text-safety candidate. The Worker does not use AI Gateway, prompt logging, a paid model route, or another provider fallback.

## Free-only accounting

- Cloudflare documents 10,000 account-wide Workers AI neurons per day on Workers Free, resetting at 00:00 UTC.
- RRQ defaults to a separate 4,000-estimated-neuron application cap and rejects configuration above 5,000.
- Recognition reserves 1,800 estimated neurons and evaluation reserves 2,000, including their safety stages.
- Reservations occur atomically in the Durable Object before inference. Inference runs outside the transaction.
- Provider token usage, estimated neurons, unknown outcomes, and paid spending are separate evidence fields.
- Unknown outcomes retain the reservation. A request identity cannot be reused with changed content.
- Paid spending is fixed to zero. A paid-plan-required response disables automatic processing for that request rather than upgrading or falling back.

RRQ's ledger cannot see usage by unrelated applications in the same Cloudflare account. Cloudflare quota errors remain authoritative. No account was connected during implementation, so the actual plan, current account-wide usage, and paid-routing state remain unverified.

## Local fallback

Every response is saved locally before external processing. Quota, capacity, network, timeout, authorization, safety, recognition uncertainty, and invalid output retain one local parent-review item. No failure marks the response wrong or changes reading progression, attempts, reviews, XP, or stars. A confirmed quota result suppresses further inference through the current UTC window, but it never uploads queued work after reset.

Ana sees pending work oldest-first on the same browser, including the passage prompt, ink, transcription, manual-review reason, retention date, machine provenance, and separate parent provenance. She can correct transcription, record comprehension and mechanics observations, mark reviewed, or delete. No notification, delivery, remote inbox, or cross-device access is claimed.

Unexpired unreviewed records cannot be silently evicted. When 18 pending items exist, supplemental writing pauses and ordinary reading continues.

## Deterministic evidence

- `npm run test:writing-worker` starts the repository Worker in Wrangler's local runtime with a controlled provider and real SQLite Durable Object.
- The integration proves one-time activation, bearer authorization, payload-bound deduplication, changed-payload rejection, restart persistence, revocation, and distinct provider-quota classification without making a Workers AI call.
- Unit tests validate exact transcription preservation, uncertainty, safety withholding, feedback category separation, and Cloudflare error classification.
- Required Edge and WebKit `read-write-pilot` scenarios force quota exhaustion, verify exactly one local fallback record, continue reading, restart the persistent browser profile, and save a parent judgment with separate provenance.
- `service/read-write-cloudflare/benchmark/benchmark-v1.json` freezes expected non-child quality outcomes before any live candidate run.

These checks prove software behavior, not handwriting quality. The controlled provider is not a live Cloudflare inference result.

## Activation checklist

1. Sign in to the intended existing Cloudflare account through supported Wrangler authorization and verify it is Workers Free with no RRQ paid route, AI Gateway prepaid route, or payment-backed overage.
2. Review the current Workers AI, Cloudflare data-use, Gemma license, and child-data notice requirements for the intended private installation.
3. Deploy the Worker and SQLite Durable Object, configure only the approved GitHub Pages origin, and store the activation-code hash plus current free-plan verification timestamp as Worker secrets or protected variables.
4. Confirm direct Workers AI model availability and remaining account-wide allowance without consuming Rory's data.
5. Run the frozen benchmark and one bounded non-child live canary. Record model output, safety behavior, allowance consumption, Worker identity, and paid spending.
6. Enable the installation only if the quality, privacy, authorization, $0 spending, Edge, and WebKit gates all pass.

No credential should be pasted into chat or committed. No paid plan, credit purchase, domain purchase, or provider subscription is authorized.
