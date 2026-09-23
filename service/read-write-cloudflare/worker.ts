import {
  WRITING_PILOT_NOTICE_VERSION,
  getWritingPilotActivity,
  type WritingEvaluationResult,
  type WritingRecognitionResult,
} from '../../src/domain/writingPilot'
import { resolveServerWritingTask } from '../../src/server/writingPilot/serverWritingCatalog'
import {
  CLOUDFLARE_SAFETY_MODEL,
  CLOUDFLARE_WRITING_MODEL,
  EVALUATION_RESERVATION_NEURONS,
  RECOGNITION_RESERVATION_NEURONS,
  createCloudflareWritingProvider,
  type CloudflareProviderOutcome,
  type CloudflareUsageEvidence,
  type WorkersAiBinding,
} from './cloudflareWritingProvider'

interface Env {
  AI?: WorkersAiBinding
  WRITING_LEDGER: DurableObjectNamespace
  RRQ_ALLOWED_ORIGIN: string
  RRQ_ACTIVATION_CODE_SHA256?: string
  RRQ_FREE_PLAN_VERIFIED_AT?: string
  RRQ_DAILY_APPLICATION_NEURON_LIMIT: string
  RRQ_AUTHORIZATION_TTL_DAYS: string
  RRQ_PAID_ROUTES_DISABLED: string
  RRQ_CONTROLLED_PROVIDER?: string
}

type Operation = 'transcribe' | 'evaluate'

interface ReserveResult {
  status: 'reserved' | 'replay' | 'quota' | 'unauthorized' | 'conflict' | 'pending'
  response?: StoredResponse
  remaining?: number
}

interface StoredResponse {
  status: number
  body: Record<string, unknown>
}

interface LedgerRow extends Record<string, SqlStorageValue> {
  installation_id: string
  token_hash: string
  consent_version: string
  approved_at: string
  expires_at: string
  revoked: number
}

const MAX_REQUEST_BYTES = 900_000
const MAX_APPLICATION_NEURONS = 5_000
const DEDUPLICATION_TTL_MS = 86_400_000

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('origin') ?? ''
    if (request.method === 'OPTIONS') return preflight(origin, env)
    if (origin !== env.RRQ_ALLOWED_ORIGIN) return json({ error: 'origin_not_allowed' }, 403, origin, env)
    const url = new URL(request.url)
    const path = url.pathname.split('/').filter(Boolean).at(-1) ?? ''
    if (request.method === 'GET' && path === 'health') {
      return json({
        status: 'guarded',
        provider: 'cloudflare_workers_ai',
        model: CLOUDFLARE_WRITING_MODEL,
        safetyModel: CLOUDFLARE_SAFETY_MODEL,
        paidRoutesDisabled: env.RRQ_PAID_ROUTES_DISABLED === 'true',
      }, 200, origin, env)
    }
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin, env)
    const body = await readBoundedJson(request)
    if (!body) return json({ error: 'invalid_request' }, 422, origin, env)
    const ledger = env.WRITING_LEDGER.get(env.WRITING_LEDGER.idFromName('rrq-read-write-free-v1'))

    if (path === 'activate') return activate(body, ledger, origin, env)
    const token = bearerToken(request)
    if (!token) return json({ error: 'unauthorized' }, 401, origin, env)
    const tokenHash = await hashText(token)
    if (path === 'revoke') {
      const response = await ledgerJson(ledger, 'revoke', { tokenHash, now: new Date().toISOString() })
      return response.ok ? json({ revoked: true }, 200, origin, env) : json({ error: 'unauthorized' }, 401, origin, env)
    }
    if (path !== 'transcribe' && path !== 'evaluate') return json({ error: 'not_found' }, 404, origin, env)
    const operation = path as Operation
    const validated = validateOperation(operation, body)
    if (!validated) return json({ error: 'invalid_request' }, 422, origin, env)
    const task = resolveTask(operation, body)
    if (!task) return json({ error: 'unknown_activity' }, 422, origin, env)
    const payloadHash = await hashJson(body)
    const reservation = operation === 'transcribe' ? RECOGNITION_RESERVATION_NEURONS : EVALUATION_RESERVATION_NEURONS
    const reserve = await ledgerJson<ReserveResult>(ledger, 'reserve', {
      tokenHash,
      operation,
      requestId: body.requestId,
      payloadHash,
      reservation,
      day: utcDay(new Date()),
      now: new Date().toISOString(),
      expiresAt: new Date(Date.now() + DEDUPLICATION_TTL_MS).toISOString(),
      dailyLimit: applicationLimit(env),
    })
    if (!reserve.ok) return json({ error: 'service_failure' }, 503, origin, env)
    if (reserve.value.status === 'replay' && reserve.value.response) return json(reserve.value.response.body, reserve.value.response.status, origin, env)
    if (reserve.value.status === 'quota') return json({ error: 'application_quota_exhausted', quotaResetsAt: nextUtcMidnight().toISOString() }, 429, origin, env)
    if (reserve.value.status === 'conflict') return json({ error: 'request_identity_conflict' }, 409, origin, env)
    if (reserve.value.status === 'pending') return json({ error: 'provider_outcome_unknown' }, 409, origin, env)
    if (reserve.value.status !== 'reserved') return json({ error: 'unauthorized' }, 401, origin, env)

    const outcome = await performOperation(operation, body, task, tokenHash, ledger, request, env)
    if (outcome.status === 'failed' && outcome.outcome === 'unknown') {
      await ledgerJson(ledger, 'unknown', { tokenHash, operation, requestId: body.requestId, payloadHash })
      return json({ error: providerError(outcome.code) }, providerStatus(outcome.code, true), origin, env)
    }
    const response = outcomeResponse(outcome)
    await ledgerJson(ledger, 'complete', {
      tokenHash,
      operation,
      requestId: body.requestId,
      payloadHash,
      response,
      usage: outcome.usage,
      metadata: operation === 'transcribe' && outcome.status === 'completed'
        ? {
            submissionId: body.submissionId,
            inkRevision: body.inkRevision,
            spellingAssessmentSupportable: (outcome.result as WritingRecognitionResult).spellingAssessmentSupportable,
          }
        : null,
    })
    return json(response.body, response.status, origin, env)
  },
} satisfies ExportedHandler<Env>

export class WritingPilotLedger {
  private readonly sql: SqlStorage

  constructor(private readonly state: DurableObjectState) {
    this.sql = state.storage.sql
    state.blockConcurrencyWhile(async () => {
      this.sql.exec(`
        CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS installations (
          installation_id TEXT PRIMARY KEY,
          token_hash TEXT NOT NULL UNIQUE,
          consent_version TEXT NOT NULL,
          approved_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          revoked INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS requests (
          request_key TEXT PRIMARY KEY,
          installation_id TEXT NOT NULL,
          operation TEXT NOT NULL,
          request_id TEXT NOT NULL,
          payload_hash TEXT NOT NULL,
          status TEXT NOT NULL,
          response_json TEXT,
          reserved_neurons INTEGER NOT NULL,
          usage_json TEXT,
          metadata_json TEXT,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS daily_usage (
          day TEXT PRIMARY KEY,
          reserved_neurons INTEGER NOT NULL
        );
      `)
    })
  }

  async fetch(request: Request): Promise<Response> {
    const action = new URL(request.url).pathname.slice(1)
    const body = await request.json<Record<string, unknown>>().catch(() => null)
    if (!body) return Response.json({ ok: false }, { status: 422 })
    if (action === 'activate') return Response.json(this.activate(body))
    if (action === 'revoke') return Response.json(this.revoke(body))
    if (action === 'reserve') return Response.json(this.reserve(body))
    if (action === 'complete') return Response.json(this.complete(body))
    if (action === 'unknown') return Response.json(this.unknown(body))
    if (action === 'provenance') return Response.json(this.provenance(body))
    return Response.json({ ok: false }, { status: 404 })
  }

  private activate(body: Record<string, unknown>) {
    return this.state.storage.transactionSync(() => {
      const consumed = this.first<{ value: string }>('SELECT value FROM meta WHERE key = ?', 'activation_consumed')
      if (consumed) return { ok: false, error: 'activation_used' }
      const installationId = `rrq-${crypto.randomUUID()}`
      const installationToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll('-', '')
      const approvedAt = String(body.approvedAt)
      const expiresAt = String(body.expiresAt)
      this.sql.exec(
        'INSERT INTO installations (installation_id, token_hash, consent_version, approved_at, expires_at, revoked) VALUES (?, ?, ?, ?, ?, 0)',
        installationId,
        String(body.tokenHash),
        String(body.consentVersion),
        approvedAt,
        expiresAt,
      )
      this.sql.exec('INSERT INTO meta (key, value) VALUES (?, ?)', 'activation_consumed', approvedAt)
      return { ok: true, installationId, installationToken }
    })
  }

  private revoke(body: Record<string, unknown>) {
    const installation = this.authorized(String(body.tokenHash), String(body.now))
    if (!installation) return { ok: false }
    this.sql.exec('UPDATE installations SET revoked = 1 WHERE installation_id = ?', installation.installation_id)
    return { ok: true }
  }

  private reserve(body: Record<string, unknown>): ReserveResult {
    return this.state.storage.transactionSync(() => {
      const installation = this.authorized(String(body.tokenHash), String(body.now))
      if (!installation) return { status: 'unauthorized' as const }
      this.sql.exec('DELETE FROM requests WHERE expires_at <= ?', String(body.now))
      const key = requestKey(installation.installation_id, String(body.operation), String(body.requestId))
      const existing = this.first<{ payload_hash: string; status: string; response_json: string | null }>(
        'SELECT payload_hash, status, response_json FROM requests WHERE request_key = ?', key,
      )
      if (existing) {
        if (existing.payload_hash !== body.payloadHash) return { status: 'conflict' as const }
        if (existing.status === 'completed' && existing.response_json) {
          return { status: 'replay' as const, response: JSON.parse(existing.response_json) as StoredResponse }
        }
        return { status: 'pending' as const }
      }
      const day = String(body.day)
      const reservation = Number(body.reservation)
      const dailyLimit = Number(body.dailyLimit)
      const usage = this.first<{ reserved_neurons: number }>('SELECT reserved_neurons FROM daily_usage WHERE day = ?', day)
      const used = usage?.reserved_neurons ?? 0
      if (!Number.isSafeInteger(reservation) || reservation <= 0 || used + reservation > dailyLimit) {
        return { status: 'quota' as const, remaining: Math.max(0, dailyLimit - used) }
      }
      this.sql.exec(
        'INSERT INTO requests (request_key, installation_id, operation, request_id, payload_hash, status, response_json, reserved_neurons, usage_json, metadata_json, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, NULL, NULL, ?, ?)',
        key,
        installation.installation_id,
        String(body.operation),
        String(body.requestId),
        String(body.payloadHash),
        'pending',
        reservation,
        String(body.now),
        String(body.expiresAt),
      )
      this.sql.exec(
        'INSERT INTO daily_usage (day, reserved_neurons) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET reserved_neurons = reserved_neurons + excluded.reserved_neurons',
        day,
        reservation,
      )
      return { status: 'reserved' as const, remaining: dailyLimit - used - reservation }
    })
  }

  private complete(body: Record<string, unknown>) {
    return this.state.storage.transactionSync(() => {
      const installation = this.byToken(String(body.tokenHash))
      if (!installation) return { ok: false }
      const key = requestKey(installation.installation_id, String(body.operation), String(body.requestId))
      const request = this.first<{ payload_hash: string; status: string }>('SELECT payload_hash, status FROM requests WHERE request_key = ?', key)
      if (!request || request.payload_hash !== body.payloadHash) return { ok: false }
      if (request.status === 'completed') return { ok: true }
      this.sql.exec(
        'UPDATE requests SET status = ?, response_json = ?, usage_json = ?, metadata_json = ? WHERE request_key = ?',
        'completed',
        JSON.stringify(body.response),
        JSON.stringify(body.usage),
        body.metadata ? JSON.stringify(body.metadata) : null,
        key,
      )
      return { ok: true }
    })
  }

  private unknown(body: Record<string, unknown>) {
    const installation = this.byToken(String(body.tokenHash))
    if (!installation) return { ok: false }
    const key = requestKey(installation.installation_id, String(body.operation), String(body.requestId))
    this.sql.exec('UPDATE requests SET status = ? WHERE request_key = ? AND payload_hash = ? AND status = ?', 'unknown', key, String(body.payloadHash), 'pending')
    return { ok: true }
  }

  private provenance(body: Record<string, unknown>) {
    const installation = this.authorized(String(body.tokenHash), String(body.now))
    if (!installation) return { ok: false, supportable: false }
    const key = requestKey(installation.installation_id, 'transcribe', String(body.requestId))
    const row = this.first<{ status: string; metadata_json: string | null }>('SELECT status, metadata_json FROM requests WHERE request_key = ?', key)
    if (!row || row.status !== 'completed' || !row.metadata_json) return { ok: true, supportable: false }
    const metadata = JSON.parse(row.metadata_json) as Record<string, unknown>
    return {
      ok: true,
      supportable: metadata.submissionId === body.submissionId
        && metadata.inkRevision === body.inkRevision
        && metadata.spellingAssessmentSupportable === true,
    }
  }

  private authorized(tokenHash: string, now: string): LedgerRow | null {
    const row = this.byToken(tokenHash)
    return row && row.revoked === 0 && row.consent_version === WRITING_PILOT_NOTICE_VERSION && Date.parse(row.expires_at) > Date.parse(now)
      ? row
      : null
  }

  private byToken(tokenHash: string): LedgerRow | null {
    return this.first<LedgerRow>('SELECT installation_id, token_hash, consent_version, approved_at, expires_at, revoked FROM installations WHERE token_hash = ?', tokenHash)
  }

  private first<T extends Record<string, SqlStorageValue>>(query: string, ...bindings: SqlStorageValue[]): T | null {
    const rows = this.sql.exec<T>(query, ...bindings).toArray()
    return rows[0] ?? null
  }
}

async function activate(body: Record<string, unknown>, ledger: DurableObjectStub, origin: string, env: Env): Promise<Response> {
  if (body.consentVersion !== WRITING_PILOT_NOTICE_VERSION || typeof body.activationCode !== 'string') {
    return json({ error: 'consent_required' }, 412, origin, env)
  }
  const readiness = freeOnlyReadiness(env)
  if (!readiness.ok) return json({ error: readiness.error }, 503, origin, env)
  const suppliedHash = await hashText(body.activationCode)
  if (!env.RRQ_ACTIVATION_CODE_SHA256 || !constantTimeEqual(suppliedHash, env.RRQ_ACTIVATION_CODE_SHA256)) {
    return json({ error: 'unauthorized' }, 403, origin, env)
  }
  const approvedAt = new Date().toISOString()
  const expiresAt = new Date(Date.now() + authorizationTtlDays(env) * 86_400_000).toISOString()
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll('-', '')
  const result = await ledgerJson<{ ok: boolean; installationId?: string; installationToken?: string }>(ledger, 'activate', {
    tokenHash: await hashText(token),
    consentVersion: WRITING_PILOT_NOTICE_VERSION,
    approvedAt,
    expiresAt,
  })
  if (!result.ok || !result.value.ok || !result.value.installationId) return json({ error: 'unauthorized' }, 403, origin, env)
  const limit = applicationLimit(env)
  return json({
    status: 'authorized',
    authMode: 'installation_bearer_v1',
    installationId: result.value.installationId,
    endpointId: 'rrq-cloudflare-free-v1',
    provider: 'cloudflare_workers_ai',
    retentionControl: 'cloudflare_workers_ai_no_training',
    quotaPolicy: 'cloudflare_free_only_v1',
    model: CLOUDFLARE_WRITING_MODEL,
    approvedAt,
    expiresAt,
    freePlanVerifiedAt: env.RRQ_FREE_PLAN_VERIFIED_AT,
    dailyApplicationNeuronLimit: limit,
    dailyApplicationNeuronsRemaining: limit,
    quotaResetsAt: nextUtcMidnight().toISOString(),
    actualPaidSpendingMicros: 0,
    installationToken: token,
  }, 200, origin, env)
}

async function performOperation(
  operation: Operation,
  body: Record<string, unknown>,
  task: NonNullable<ReturnType<typeof resolveServerWritingTask>>,
  tokenHash: string,
  ledger: DurableObjectStub,
  request: Request,
  env: Env,
): Promise<CloudflareProviderOutcome<WritingRecognitionResult | WritingEvaluationResult>> {
  if (env.RRQ_CONTROLLED_PROVIDER === 'true') return controlledOutcome(operation, task, request)
  if (!env.AI) return { status: 'failed', code: 'provider_outcome_unknown', outcome: 'definite', usage: unknownUsage() }
  const provider = createCloudflareWritingProvider(env.AI)
  if (operation === 'transcribe') {
    return provider.transcribe({ imageDataUrl: String(body.imageDataUrl), layout: body.layout as { width: number; height: number } })
  }
  let spellingAssessmentSupportable = false
  if (body.inputMode === 'handwriting' && body.transcriptionConfirmedBy === 'learner' && typeof body.recognitionRequestId === 'string') {
    const provenance = await ledgerJson<{ ok: boolean; supportable: boolean }>(ledger, 'provenance', {
      tokenHash,
      requestId: body.recognitionRequestId,
      submissionId: body.submissionId,
      inkRevision: body.inkRevision,
      now: new Date().toISOString(),
    })
    spellingAssessmentSupportable = provenance.ok && provenance.value.ok && provenance.value.supportable
  }
  return provider.evaluate({
    confirmedText: String(body.confirmedText),
    spellingAssessmentSupportable,
    task: { passageTitle: task.passageTitle, passageText: task.passageText, prompt: task.activity.prompt, rubric: task.rubric },
  })
}

function controlledOutcome(
  operation: Operation,
  task: NonNullable<ReturnType<typeof resolveServerWritingTask>>,
  request: Request,
): CloudflareProviderOutcome<WritingRecognitionResult | WritingEvaluationResult> {
  const requested = request.headers.get('x-rrq-test-outcome')
  if (requested === 'quota_exhausted') return { status: 'failed', code: 'free_quota_exhausted', outcome: 'definite', usage: estimatedUsage(operation) }
  if (requested === 'capacity') return { status: 'failed', code: 'capacity_unavailable', outcome: 'definite', usage: estimatedUsage(operation) }
  if (requested === 'unknown') return { status: 'failed', code: 'provider_outcome_unknown', outcome: 'unknown', usage: unknownUsage() }
  if (requested === 'unsafe') return { status: 'review_required', code: 'safety_flagged', usage: estimatedUsage(operation) }
  if (operation === 'transcribe') return {
    status: 'completed',
    usage: estimatedUsage(operation),
    result: {
      rawTranscription: 'Tia picked up the light wrappers before the wind blew them away.',
      uncertainties: [],
      spellingAssessmentSupportable: true,
      provider: 'cloudflare_workers_ai',
    },
  }
  const evidenceId = task.rubric.relevantEvidence[0]?.evidenceId ?? ''
  const category = (message: string) => ({ status: 'meets' as const, message, evidenceIds: evidenceId ? [evidenceId] : [] })
  return {
    status: 'completed',
    usage: estimatedUsage(operation),
    result: {
      provider: 'cloudflare_workers_ai',
      feedback: {
        understood: 'You used the story to explain your answer.',
        comprehension: category('The response matches the passage.'),
        supportingEvidence: category('The response uses a relevant story detail.'),
        spelling: category('Spelling can be reviewed separately.'),
        grammar: category('The sentence communicates a complete idea.'),
        capitalizationPunctuation: category('Capitalization and punctuation are reviewed separately.'),
        improvements: [],
        parentReviewRequired: false,
        uncertaintyReason: null,
      },
    },
  }
}

function resolveTask(operation: Operation, body: Record<string, unknown>) {
  const activity = typeof body.activityId === 'string' ? getWritingPilotActivity(body.activityId) : null
  if (!activity) return null
  return resolveServerWritingTask({
    activityId: activity.activityId,
    sourceContentVersion: String(body.sourceContentVersion),
    rubricVersion: operation === 'evaluate' ? String(body.rubricVersion) : activity.rubricVersion,
  })
}

function validateOperation(operation: Operation, body: Record<string, unknown>): boolean {
  if (!validId(body.requestId) || !validId(body.submissionId) || !validId(body.activityId)
    || typeof body.sourceContentVersion !== 'string'
    || !Number.isSafeInteger(body.inkRevision) || Number(body.inkRevision) < 0) return false
  if (operation === 'transcribe') {
    if (typeof body.imageDataUrl !== 'string' || body.imageDataUrl.length > 800_000 || !/^data:image\/(png|jpeg);base64,[a-z0-9+/=]+$/i.test(body.imageDataUrl)) return false
    if (!isRecord(body.layout) || !boundedDimension(body.layout.width) || !boundedDimension(body.layout.height)) return false
    return true
  }
  return typeof body.rubricVersion === 'string'
    && (body.recognitionRequestId === null || validId(body.recognitionRequestId))
    && ['handwriting', 'typed', 'mixed'].includes(String(body.inputMode))
    && ['learner', 'parent'].includes(String(body.transcriptionConfirmedBy))
    && typeof body.confirmedText === 'string'
    && body.confirmedText.trim().length > 0
    && body.confirmedText.length <= 500
}

function outcomeResponse(outcome: CloudflareProviderOutcome<WritingRecognitionResult | WritingEvaluationResult>): StoredResponse {
  if (outcome.status === 'completed') return { status: 200, body: outcome.result as unknown as Record<string, unknown> }
  if (outcome.status === 'review_required') return { status: 409, body: { error: 'safety_review_required' } }
  return { status: providerStatus(outcome.code, false), body: { error: providerError(outcome.code) } }
}

function providerError(code: string): string {
  if (code === 'free_quota_exhausted') return 'free_quota_exhausted'
  if (code === 'capacity_unavailable') return 'capacity_unavailable'
  if (code === 'paid_plan_required') return 'paid_plan_required'
  if (code === 'provider_refused') return 'provider_refused'
  if (code === 'provider_output_invalid') return 'provider_output_invalid'
  return 'provider_outcome_unknown'
}

function providerStatus(code: string, unknown: boolean): number {
  if (unknown) return 409
  if (code === 'free_quota_exhausted' || code === 'capacity_unavailable') return 429
  if (code === 'paid_plan_required') return 503
  if (code === 'provider_refused') return 409
  return 422
}

function freeOnlyReadiness(env: Env): { ok: true } | { ok: false; error: string } {
  const verifiedAt = env.RRQ_FREE_PLAN_VERIFIED_AT ? Date.parse(env.RRQ_FREE_PLAN_VERIFIED_AT) : Number.NaN
  if (!Number.isFinite(verifiedAt) || verifiedAt > Date.now() || Date.now() - verifiedAt > 30 * 86_400_000) return { ok: false, error: 'free_plan_unverified' }
  if (env.RRQ_PAID_ROUTES_DISABLED !== 'true') return { ok: false, error: 'paid_routes_not_disabled' }
  try {
    applicationLimit(env)
    authorizationTtlDays(env)
  } catch {
    return { ok: false, error: 'free_policy_invalid' }
  }
  return { ok: true }
}

function applicationLimit(env: Env): number {
  const limit = Number(env.RRQ_DAILY_APPLICATION_NEURON_LIMIT)
  if (!Number.isSafeInteger(limit) || limit <= 0 || limit > MAX_APPLICATION_NEURONS) throw new Error('Application neuron limit must be between 1 and 5000.')
  return limit
}

function authorizationTtlDays(env: Env): number {
  const days = Number(env.RRQ_AUTHORIZATION_TTL_DAYS)
  if (!Number.isSafeInteger(days) || days <= 0 || days > 30) throw new Error('Authorization TTL must be between 1 and 30 days.')
  return days
}

async function readBoundedJson(request: Request): Promise<Record<string, unknown> | null> {
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) return null
  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) return null
  try {
    const value: unknown = JSON.parse(text)
    return isRecord(value) ? value : null
  } catch {
    return null
  }
}

async function ledgerJson<T = Record<string, unknown>>(stub: DurableObjectStub, action: string, body: Record<string, unknown>): Promise<{ ok: true; value: T } | { ok: false }> {
  try {
    const response = await stub.fetch(`https://ledger/${action}`, { method: 'POST', body: JSON.stringify(body) })
    if (!response.ok) return { ok: false }
    const value: unknown = await response.json()
    return isRecord(value) ? { ok: true, value: value as T } : { ok: false }
  } catch {
    return { ok: false }
  }
}

function preflight(origin: string, env: Env): Response {
  if (origin !== env.RRQ_ALLOWED_ORIGIN) return new Response(null, { status: 403 })
  return new Response(null, { status: 204, headers: corsHeaders(origin, env) })
}

function json(body: Record<string, unknown>, status: number, origin: string, env: Env): Response {
  return Response.json(body, { status, headers: corsHeaders(origin, env) })
}

function corsHeaders(origin: string, env: Env): Headers {
  const headers = new Headers({
    'access-control-allow-origin': origin === env.RRQ_ALLOWED_ORIGIN ? origin : '',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type, x-rrq-test-outcome',
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    vary: 'Origin',
  })
  return headers
}

function bearerToken(request: Request): string | null {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') ?? '')
  return match?.[1]?.length && match[1].length >= 32 ? match[1] : null
}

async function hashJson(value: unknown): Promise<string> {
  return hashText(JSON.stringify(canonicalize(value)))
}

async function hashText(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!isRecord(value)) return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return difference === 0
}

function requestKey(installationId: string, operation: string, requestId: string): string {
  return `${installationId}:${operation}:${requestId}`
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._:-]{2,199}$/.test(value)
}

function boundedDimension(value: unknown): boolean {
  return Number.isFinite(value) && Number(value) >= 1 && Number(value) <= 4096
}

function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10)
}

function nextUtcMidnight(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
}

function estimatedUsage(operation: Operation): CloudflareUsageEvidence {
  return {
    status: 'estimated_only',
    inputTokens: null,
    outputTokens: null,
    estimatedNeurons: operation === 'transcribe' ? RECOGNITION_RESERVATION_NEURONS : EVALUATION_RESERVATION_NEURONS,
    actualPaidSpendingMicros: 0,
  }
}

function unknownUsage(): CloudflareUsageEvidence {
  return { status: 'unknown', inputTokens: null, outputTokens: null, estimatedNeurons: null, actualPaidSpendingMicros: 0 }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
