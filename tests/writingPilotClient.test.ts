import { describe, expect, it, vi } from 'vitest'
import { createWritingPilotClient, type WritingPilotCredentialStore } from '../src/services/writingPilot'
import { WRITING_PILOT_NOTICE_VERSION } from '../src/domain/writingPilot'

describe('writing pilot protected-service client', () => {
  it('keeps the bearer out of public authority and sends it from private storage', async () => {
    const credentials = memoryCredentials()
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>
      if ('activationCode' in body) return new Response(JSON.stringify({
        status: 'authorized',
        authMode: 'installation_bearer_v1',
        installationId: 'installation-1',
        endpointId: 'rrq-writing-pilot-v1',
        retentionControl: 'approved_zero_data_retention',
        approvedAt: '2026-09-22T00:00:00.000Z',
        expiresAt: '2026-10-01T00:00:00.000Z',
        budgetLimitMicros: 10_000,
        budgetRemainingMicros: 10_000,
        installationToken: 'private-installation-token-1234567890',
      }), { status: 200 })
      expect(new Headers(init?.headers).get('authorization')).toBe('Bearer private-installation-token-1234567890')
      expect(init?.credentials).toBe('omit')
      return new Response(JSON.stringify({ revoked: true }), { status: 200 })
    }) as unknown as typeof fetch
    const client = createWritingPilotClient({ baseUrl: 'https://service.example/v1/', fetchImpl, credentials })
    const activated = await client.activate('one-time-code', WRITING_PILOT_NOTICE_VERSION)
    expect(activated.status).toBe('ok')
    expect(JSON.stringify(activated)).not.toContain('private-installation-token')
    expect(await credentials.load(client.endpointId)).toBe('private-installation-token-1234567890')
    expect((await client.revoke()).status).toBe('ok')
    expect(await credentials.load(client.endpointId)).toBeNull()
  })

  it('fails closed when protected credential storage is unavailable', async () => {
    const credentials: WritingPilotCredentialStore = {
      load: vi.fn(async () => null),
      save: vi.fn(async () => { throw new Error('blocked') }),
      clear: vi.fn(async () => undefined),
    }
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      status: 'authorized', authMode: 'installation_bearer_v1', installationId: 'i', endpointId: 'e',
      retentionControl: 'approved_zero_data_retention', approvedAt: '2026-09-22T00:00:00.000Z', expiresAt: '2026-10-01T00:00:00.000Z',
      budgetLimitMicros: 1, budgetRemainingMicros: 1, installationToken: 'private-installation-token-1234567890',
    }), { status: 200 })) as unknown as typeof fetch
    const client = createWritingPilotClient({ baseUrl: 'https://service.example/v1/', fetchImpl, credentials })
    expect(await client.activate('code', WRITING_PILOT_NOTICE_VERSION)).toMatchObject({ status: 'error', code: 'unavailable' })
  })
})

function memoryCredentials(): WritingPilotCredentialStore {
  const values = new Map<string, string>()
  return {
    load: vi.fn(async (key) => values.get(key) ?? null),
    save: vi.fn(async (key, value) => { values.set(key, value) }),
    clear: vi.fn(async (key) => { values.delete(key) }),
  }
}
