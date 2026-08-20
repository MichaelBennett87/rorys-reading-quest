import type { PrintService } from './PrintService'

export function createBrowserPrintService(win: Window | null = typeof globalThis !== 'undefined'
  ? (globalThis.window ?? null)
  : null): PrintService {
  if (!win || typeof win.print !== 'function') {
    return createUnavailablePrintService('Printing is not available in this browser.')
  }

  return {
    isSupported: () => true,
    print() {
      win.print()
      return { status: 'printed' }
    },
  }
}

export function createUnavailablePrintService(reason: string): PrintService {
  return {
    isSupported: () => false,
    print() {
      return { status: 'unavailable', reason }
    },
  }
}
