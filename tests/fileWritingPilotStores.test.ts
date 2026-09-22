// @vitest-environment node
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { WRITING_PILOT_NOTICE_VERSION } from '../src/domain/writingPilot'
import { FileWritingPilotStores } from '../service/read-write/fileWritingPilotStores'

const directories: string[] = []
afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })))
})

describe('durable writing service authority and budget store', () => {
  it('uses a one-time activation, hashed bearer, expiry, and revocation', async () => {
    const clock = { now: new Date('2026-09-22T12:00:00.000Z') }
    const { stores, statePath } = await createStores(clock)
    expect(await stores.exchangeActivationCode('wrong')).toBeNull()
    expect(await stores.exchangeActivationCode('synthetic-one-time-code')).toMatchObject({ installationId: 'test-installation' })
    expect(await stores.exchangeActivationCode('synthetic-one-time-code')).toBeNull()
    const session = await stores.createSession('test-installation')
    expect(session.token).toBe('synthetic-private-installation-token-1234567890')
    expect(await stores.resolveSession(session.token)).toMatchObject({ installationId: 'test-installation' })
    expect(await fs.readFile(statePath, 'utf8')).not.toContain(session.token)
    await stores.revokeSession(session.token)
    expect(await stores.resolveSession(session.token)).toBeNull()
  })

  it('serializes concurrent reservations, binds payload identity, and retains unknown maximum cost', async () => {
    const clock = { now: new Date('2026-09-22T12:00:00.000Z') }
    const { stores } = await createStores(clock, 100)
    const base = { installationId: 'test-installation', operation: 'transcribe' as const, maximumCostMicros: 60, limitMicros: 100 }
    const [first, second] = await Promise.all([
      stores.reserve({ ...base, requestId: 'request-one', payloadHash: 'a'.repeat(64) }),
      stores.reserve({ ...base, requestId: 'request-two', payloadHash: 'b'.repeat(64) }),
    ])
    expect([first.status, second.status].sort()).toEqual(['exhausted', 'reserved'])
    const reservedId = first.status === 'reserved' ? 'request-one' : 'request-two'
    const reservedHash = first.status === 'reserved' ? 'a'.repeat(64) : 'b'.repeat(64)
    expect((await stores.reserve({ ...base, requestId: reservedId, payloadHash: 'c'.repeat(64) })).status).toBe('identity_conflict')
    await stores.markUnknown({ installationId: 'test-installation', operation: 'transcribe', requestId: reservedId, payloadHash: reservedHash })
    expect(await stores.getRemaining('test-installation', 100)).toBe(40)
    expect((await stores.reserve({ ...base, requestId: reservedId, payloadHash: reservedHash })).status).toBe('unresolved')
  })

  it('reconciles observed cost and replays only the exact short-lived completed result', async () => {
    const clock = { now: new Date('2026-09-22T12:00:00.000Z') }
    const { stores } = await createStores(clock, 1_000)
    const reservation = { installationId: 'test-installation', operation: 'transcribe' as const, requestId: 'recognition-one', payloadHash: 'a'.repeat(64), maximumCostMicros: 100, limitMicros: 1_000 }
    expect((await stores.reserve(reservation)).status).toBe('reserved')
    await stores.complete({
      installationId: reservation.installationId,
      operation: reservation.operation,
      requestId: reservation.requestId,
      payloadHash: reservation.payloadHash,
      response: { status: 200, body: { rawTranscription: 'synthetic text' } },
      actualCostMicros: 25,
      billing: { status: 'observed', model: 'controlled', pricingVersion: 'test', inputTokens: 10, outputTokens: 5, totalTokens: 15, costMicros: 25 },
      recognitionProvenance: {
        requestId: reservation.requestId,
        activityId: 'activity',
        submissionId: 'submission',
        inkRevision: 1,
        rawTranscriptionHash: 'hash',
        spellingAssessmentSupportable: true,
        meaningUncertain: false,
      },
    })
    expect(await stores.getRemaining('test-installation', 1_000)).toBe(975)
    expect(await stores.reserve(reservation)).toMatchObject({ status: 'duplicate', response: { status: 200 } })
    expect(await stores.resolveRecognition('test-installation', 'recognition-one')).toMatchObject({ submissionId: 'submission' })
  })
})

async function createStores(clock: { now: Date }, budgetLimitMicros = 1_000) {
  const directory = await fs.mkdtemp(join(tmpdir(), 'rrq-writing-service-'))
  directories.push(directory)
  const statePath = join(directory, 'service-state.json')
  const stores = new FileWritingPilotStores({
    statePath,
    activationCodeSha256: createHash('sha256').update('synthetic-one-time-code').digest('hex'),
    installation: {
      installationId: 'test-installation',
      consentVersion: WRITING_PILOT_NOTICE_VERSION,
      authorizationExpiresAt: '2026-10-22T12:00:00.000Z',
      retentionControl: 'approved_zero_data_retention',
      budgetLimitMicros,
    },
    now: () => clock.now,
    randomToken: () => 'synthetic-private-installation-token-1234567890',
  })
  return { stores, statePath }
}
