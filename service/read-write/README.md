# Protected Read & Write service

This is the single-installation, single-instance service boundary for the disabled-by-default Read & Write pilot. GitHub Pages remains the reading frontend. A separately hosted HTTPS service may be configured only after child-data retention approval, a reviewed pinned model and price configuration, an installation authorization, and a finite parent-approved budget are all available.

The service uses a one-time activation code to issue a high-entropy installation bearer. The browser keeps that bearer in IndexedDB, separate from writing records and reading progress. CORS is not authentication, and the local Parent PIN is never accepted by this service.

The durable JSON ledger must be placed on an encrypted attached volume. Every mutation uses an exclusive file lock and atomic rename. This implementation supports one service instance on one host. Do not scale it horizontally; a multi-instance deployment requires a transactional database implementation of the same authorization and budget interfaces.

Data retained by this service:

- hashed activation and session credentials, authorization expiry, and revocation;
- operation, request and payload hashes;
- maximum reservation, observed token usage, reviewed pricing version, and reconciled cost;
- a deduplication response for 15 minutes;
- non-content request and budget audit metadata for 30 days.

Request bodies are not logged or stored as audit data. The short deduplication response can contain transcription or feedback and therefore remains sensitive. Provider retention is a separate control and does not delete this service state.

Build with `npm run build:writing-service`. The container intentionally refuses to start unless every live authorization, retention, pinned-model, pricing, token-bound, budget, origin, and state-path setting is present. The repository does not provide production credentials, a host, or a nonzero budget.
