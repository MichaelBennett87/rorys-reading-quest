import { constants, promises as fs } from 'node:fs'
import { dirname } from 'node:path'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type {
  ApprovedWritingInstallation,
  StoredWritingServiceResponse,
  WritingAuthorizationStore,
  WritingBudgetLedger,
  WritingProviderBilling,
  WritingProviderOperation,
  WritingRecognitionProvenance,
} from '../../src/server/writingPilot/writingPilotService'

const STORE_VERSION = 1
const DEFAULT_RESPONSE_RETENTION_MS = 15 * 60 * 1_000
const DEFAULT_AUDIT_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000

interface SessionRecord {
  tokenHash: string
  installationId: string
  expiresAt: string
  revokedAt: string | null
}

interface BudgetRequestRecord {
  installationId: string
  operation: WritingProviderOperation
  requestId: string
  payloadHash: string
  maximumCostMicros: number
  status: 'reserved' | 'completed' | 'unknown'
  actualCostMicros: number | null
  billing: WritingProviderBilling | null
  response: StoredWritingServiceResponse | null
  responseExpiresAt: string | null
  recognitionProvenance: WritingRecognitionProvenance | null
  createdAt: string
  updatedAt: string
}

interface DurableState {
  version: typeof STORE_VERSION
  activationRedeemedAt: string | null
  sessions: SessionRecord[]
  requests: BudgetRequestRecord[]
}

export interface FileWritingPilotStoresOptions {
  statePath: string
  installation: ApprovedWritingInstallation
  activationCodeSha256: string
  sessionTtlMs?: number
  responseRetentionMs?: number
  auditRetentionMs?: number
  lockTimeoutMs?: number
  now?: () => Date
  randomToken?: () => string
}

export class FileWritingPilotStores implements WritingAuthorizationStore, WritingBudgetLedger {
  private readonly options: FileWritingPilotStoresOptions
  private readonly pendingActivations = new Set<string>()
  private readonly now: () => Date
  private readonly sessionTtlMs: number
  private readonly responseRetentionMs: number
  private readonly auditRetentionMs: number
  private readonly lockTimeoutMs: number
  private readonly randomToken: () => string

  constructor(options: FileWritingPilotStoresOptions) {
    this.options = options
    if (!/^[a-f0-9]{64}$/i.test(options.activationCodeSha256)) throw new Error('Activation code hash must be SHA-256 hex.')
    this.now = options.now ?? (() => new Date())
    this.sessionTtlMs = options.sessionTtlMs ?? 30 * 24 * 60 * 60 * 1_000
    this.responseRetentionMs = options.responseRetentionMs ?? DEFAULT_RESPONSE_RETENTION_MS
    this.auditRetentionMs = options.auditRetentionMs ?? DEFAULT_AUDIT_RETENTION_MS
    this.lockTimeoutMs = options.lockTimeoutMs ?? 2_000
    this.randomToken = options.randomToken ?? (() => randomBytes(32).toString('base64url'))
  }

  async exchangeActivationCode(code: string): Promise<ApprovedWritingInstallation | null> {
    if (!safeEqual(sha256(code), this.options.activationCodeSha256.toLowerCase())) return null
    return this.mutate((state) => {
      if (state.activationRedeemedAt !== null) return { value: null, changed: false }
      state.activationRedeemedAt = this.now().toISOString()
      this.pendingActivations.add(this.options.installation.installationId)
      return { value: this.options.installation, changed: true }
    })
  }

  async createSession(installationId: string): Promise<{ token: string; expiresAt: string }> {
    if (!this.pendingActivations.delete(installationId) || installationId !== this.options.installation.installationId) {
      throw new Error('No valid activation exchange is pending.')
    }
    const token = this.randomToken()
    if (token.length < 32) throw new Error('Generated installation token is too short.')
    const expiresAt = new Date(Math.min(
      this.now().getTime() + this.sessionTtlMs,
      Date.parse(this.options.installation.authorizationExpiresAt),
    )).toISOString()
    await this.mutate((state) => {
      state.sessions.push({ tokenHash: sha256(token), installationId, expiresAt, revokedAt: null })
      return { value: undefined, changed: true }
    })
    return { token, expiresAt }
  }

  async resolveSession(token: string): Promise<ApprovedWritingInstallation | null> {
    const tokenHash = sha256(token)
    return this.mutate((state) => {
      const session = state.sessions.find((candidate) => safeEqual(candidate.tokenHash, tokenHash))
      const valid = session
        && session.revokedAt === null
        && Number.isFinite(Date.parse(session.expiresAt))
        && Date.parse(session.expiresAt) > this.now().getTime()
      return { value: valid ? this.options.installation : null, changed: false }
    })
  }

  async revokeSession(token: string): Promise<void> {
    const tokenHash = sha256(token)
    await this.mutate((state) => {
      const session = state.sessions.find((candidate) => safeEqual(candidate.tokenHash, tokenHash))
      if (!session || session.revokedAt !== null) return { value: undefined, changed: false }
      session.revokedAt = this.now().toISOString()
      return { value: undefined, changed: true }
    })
  }

  async getRemaining(installationId: string, limitMicros: number): Promise<number> {
    return this.mutate((state) => ({
      value: Math.max(0, limitMicros - committedAndReserved(state.requests, installationId)),
      changed: false,
    }))
  }

  async reserve(input: Parameters<WritingBudgetLedger['reserve']>[0]): ReturnType<WritingBudgetLedger['reserve']> {
    return this.mutate<Awaited<ReturnType<WritingBudgetLedger['reserve']>>>((state) => {
      const existing = state.requests.find((request) => request.installationId === input.installationId && request.requestId === input.requestId)
      if (existing) {
        if (existing.operation !== input.operation || existing.payloadHash !== input.payloadHash) return { value: { status: 'identity_conflict' as const }, changed: false }
        if (existing.status === 'completed' && existing.response) return { value: { status: 'duplicate' as const, response: existing.response }, changed: false }
        return { value: { status: 'unresolved' as const }, changed: false }
      }
      const spent = committedAndReserved(state.requests, input.installationId)
      if (input.maximumCostMicros <= 0 || spent + input.maximumCostMicros > input.limitMicros) {
        return { value: { status: 'exhausted' as const }, changed: false }
      }
      const timestamp = this.now().toISOString()
      state.requests.push({
        installationId: input.installationId,
        operation: input.operation,
        requestId: input.requestId,
        payloadHash: input.payloadHash,
        maximumCostMicros: input.maximumCostMicros,
        status: 'reserved',
        actualCostMicros: null,
        billing: null,
        response: null,
        responseExpiresAt: null,
        recognitionProvenance: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      return { value: { status: 'reserved' as const, remainingMicros: input.limitMicros - spent - input.maximumCostMicros }, changed: true }
    })
  }

  async complete(input: Parameters<WritingBudgetLedger['complete']>[0]): Promise<void> {
    await this.mutate((state) => {
      const request = exactRequest(state.requests, input)
      if (!request || request.status !== 'reserved') throw new Error('Budget completion did not match an active reservation.')
      if (!Number.isSafeInteger(input.actualCostMicros) || input.actualCostMicros < 0 || input.actualCostMicros > request.maximumCostMicros) {
        throw new Error('Observed provider cost exceeded the reservation.')
      }
      request.status = 'completed'
      request.actualCostMicros = input.actualCostMicros
      request.billing = input.billing
      request.response = input.response
      request.responseExpiresAt = new Date(this.now().getTime() + this.responseRetentionMs).toISOString()
      request.recognitionProvenance = input.recognitionProvenance ?? null
      request.updatedAt = this.now().toISOString()
      return { value: undefined, changed: true }
    })
  }

  async markUnknown(input: Parameters<WritingBudgetLedger['markUnknown']>[0]): Promise<void> {
    await this.mutate((state) => {
      const request = exactRequest(state.requests, input)
      if (!request || request.status !== 'reserved') throw new Error('Unknown outcome did not match an active reservation.')
      request.status = 'unknown'
      request.updatedAt = this.now().toISOString()
      return { value: undefined, changed: true }
    })
  }

  async resolveRecognition(installationId: string, requestId: string): Promise<WritingRecognitionProvenance | null> {
    return this.mutate((state) => ({
      value: state.requests.find((request) => (
        request.installationId === installationId
        && request.requestId === requestId
        && request.operation === 'transcribe'
        && request.status === 'completed'
      ))?.recognitionProvenance ?? null,
      changed: false,
    }))
  }

  private async mutate<T>(operation: (state: DurableState) => { value: T; changed: boolean }): Promise<T> {
    return withFileLock(`${this.options.statePath}.lock`, this.lockTimeoutMs, async () => {
      const state = await readState(this.options.statePath)
      const pruned = pruneState(state, this.now(), this.auditRetentionMs)
      const result = operation(pruned.state)
      if (pruned.changed || result.changed) await writeState(this.options.statePath, pruned.state)
      return result.value
    })
  }
}

function exactRequest(requests: BudgetRequestRecord[], input: { installationId: string; operation: WritingProviderOperation; requestId: string; payloadHash: string }) {
  return requests.find((request) => request.installationId === input.installationId
    && request.operation === input.operation
    && request.requestId === input.requestId
    && request.payloadHash === input.payloadHash)
}

function committedAndReserved(requests: BudgetRequestRecord[], installationId: string): number {
  return requests
    .filter((request) => request.installationId === installationId)
    .reduce((total, request) => total + (request.status === 'completed' ? request.actualCostMicros ?? request.maximumCostMicros : request.maximumCostMicros), 0)
}

function pruneState(state: DurableState, now: Date, auditRetentionMs: number): { state: DurableState; changed: boolean } {
  let changed = false
  const nowMs = now.getTime()
  const sessions = state.sessions.filter((session) => {
    const retain = Date.parse(session.expiresAt) > nowMs - auditRetentionMs
    changed ||= !retain
    return retain
  })
  const requests = state.requests.filter((request) => {
    const retain = Date.parse(request.createdAt) > nowMs - auditRetentionMs
    changed ||= !retain
    if (retain && request.response && request.responseExpiresAt && Date.parse(request.responseExpiresAt) <= nowMs) {
      request.response = null
      request.responseExpiresAt = null
      changed = true
    }
    return retain
  })
  return { state: { ...state, sessions, requests }, changed }
}

async function readState(path: string): Promise<DurableState> {
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(path, 'utf8'))
    if (!isState(parsed)) throw new Error('Durable writing service state is invalid.')
    return parsed
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') return { version: STORE_VERSION, activationRedeemedAt: null, sessions: [], requests: [] }
    throw error
  }
}

async function writeState(path: string, state: DurableState): Promise<void> {
  await fs.mkdir(dirname(path), { recursive: true, mode: 0o700 })
  const temporary = `${path}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`
  try {
    await fs.writeFile(temporary, JSON.stringify(state), { encoding: 'utf8', mode: 0o600, flag: 'wx' })
    await fs.rename(temporary, path)
  } finally {
    await fs.unlink(temporary).catch(() => undefined)
  }
}

async function withFileLock<T>(path: string, timeoutMs: number, action: () => Promise<T>): Promise<T> {
  const startedAt = Date.now()
  let handle: Awaited<ReturnType<typeof fs.open>> | null = null
  while (!handle) {
    try {
      await fs.mkdir(dirname(path), { recursive: true, mode: 0o700 })
      handle = await fs.open(path, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600)
      await handle.writeFile(JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }))
    } catch (error) {
      if (!isNodeError(error) || error.code !== 'EEXIST') throw error
      const age = await fs.stat(path).then((value) => Date.now() - value.mtimeMs).catch(() => 0)
      if (age > 10_000) await fs.unlink(path).catch(() => undefined)
      if (Date.now() - startedAt >= timeoutMs) throw new Error('Durable writing service state is busy.')
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
  }
  try {
    return await action()
  } finally {
    await handle.close().catch(() => undefined)
    await fs.unlink(path).catch(() => undefined)
  }
}

function isState(value: unknown): value is DurableState {
  if (!isRecord(value) || value.version !== STORE_VERSION || !Array.isArray(value.sessions) || !Array.isArray(value.requests)) return false
  if (value.activationRedeemedAt !== null && !validDate(value.activationRedeemedAt)) return false
  return value.sessions.every((session) => isRecord(session)
      && typeof session.tokenHash === 'string' && /^[a-f0-9]{64}$/.test(session.tokenHash)
      && typeof session.installationId === 'string'
      && validDate(session.expiresAt)
      && (session.revokedAt === null || validDate(session.revokedAt)))
    && value.requests.every((request) => isRecord(request)
      && typeof request.installationId === 'string'
      && typeof request.requestId === 'string'
      && typeof request.payloadHash === 'string' && /^[a-f0-9]{64}$/.test(request.payloadHash)
      && ['transcribe', 'evaluate'].includes(String(request.operation))
      && ['reserved', 'completed', 'unknown'].includes(String(request.status))
      && Number.isSafeInteger(request.maximumCostMicros) && Number(request.maximumCostMicros) > 0
      && (request.actualCostMicros === null || (Number.isSafeInteger(request.actualCostMicros) && Number(request.actualCostMicros) >= 0))
      && validDate(request.createdAt)
      && validDate(request.updatedAt)
      && (request.responseExpiresAt === null || validDate(request.responseExpiresAt)))
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left)
  const rightBytes = Buffer.from(right)
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && 'code' in value
}
