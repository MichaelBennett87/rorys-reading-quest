import { describe, expect, test, vi } from 'vitest'

import { createBrowserPrintService, createUnavailablePrintService } from '../../src/services/printing'

describe('print service boundary', () => {
  test('reports supported when window.print exists and prints only on explicit request', () => {
    const print = vi.fn()
    const service = createBrowserPrintService({ print } as never)

    expect(service.isSupported()).toBe(true)
    expect(print).toHaveBeenCalledTimes(0)
    expect(service.print()).toEqual({ status: 'printed' })
    expect(print).toHaveBeenCalledTimes(1)
  })

  test('returns a safe unavailable service when print is missing', () => {
    const service = createBrowserPrintService({} as never)
    const result = service.print()

    expect(service.isSupported()).toBe(false)
    expect(result.status).toBe('unavailable')
    if (result.status !== 'unavailable') {
      throw new Error('Expected print service to be unavailable.')
    }
    expect(result.reason).toMatch(/Printing is not available/i)
  })

  test('unavailable service does not call print or start network activity', () => {
    const print = vi.fn()
    const service = createUnavailablePrintService('Printing is not available in this browser.')

    expect(service.isSupported()).toBe(false)
    expect(service.print()).toEqual({
      status: 'unavailable',
      reason: 'Printing is not available in this browser.',
    })
    expect(print).toHaveBeenCalledTimes(0)
  })
})
