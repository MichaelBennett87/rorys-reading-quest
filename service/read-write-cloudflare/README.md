# RRQ Cloudflare free-only writing service

This directory contains the guarded production candidate for Read & Write external processing. It is inactive until an existing authorized Cloudflare account passes the Free-plan, privacy, model-quality, and live-canary gates in `docs/CLOUDFLARE_FREE_READ_WRITE_REPORT.md`.

## Runtime

- `worker.ts`: CORS, one-time activation, bearer authorization, request validation, server-owned task resolution, and inference orchestration.
- `cloudflareWritingProvider.ts`: direct Workers AI recognition, evaluation, safety, strict output validation, and error classification.
- `WritingPilotLedger`: SQLite-backed Durable Object for authorization, request identity, deduplication, and daily application quota.
- `benchmark/benchmark-v1.json`: frozen expected outcomes for the non-child quality trial.

No AI Gateway or external provider fallback is configured. `RRQ_PAID_ROUTES_DISABLED` must be `true`; the Worker refuses activation otherwise. The checked-in application cap is 4,000 estimated neurons per UTC day and code rejects a cap above 5,000. This does not prove account-wide allowance because Cloudflare usage may be shared with other applications.

## Local controlled verification

```powershell
npm run test:writing-worker
npm run build:writing-worker
```

The integration uses Wrangler's local runtime, a real local SQLite Durable Object, synthetic payloads, and a controlled provider. It makes zero Workers AI calls and spends $0. Do not run `wrangler dev` with the production AI binding merely for local testing: Cloudflare documents that local Workers AI calls still access the account and consume usage.

## Deployment prerequisites

Deployment is intentionally not automatic while activation is pending. Before an authorized deployment:

1. `npx wrangler login` must target the reviewed existing Free account.
2. Verify actual Workers Free status and absence of RRQ paid/AI Gateway routes.
3. Set `RRQ_ACTIVATION_CODE_SHA256` without storing the plaintext code in Git.
4. Set a current `RRQ_FREE_PLAN_VERIFIED_AT` value only after the account check.
5. Deploy with `npx wrangler deploy --config service/read-write-cloudflare/wrangler.jsonc`.
6. Record the Worker version/URL without exposing secrets.
7. Run only the bounded non-child canary and inspect allowance/spending evidence before enabling a real installation.

The Worker retains request responses only for the 24-hour deduplication window and stores no PIN, assessment, reading history, personal identifier supplied by the app, or arbitrary prompt. Observability is disabled to avoid request-body logging.
