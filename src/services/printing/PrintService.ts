export interface PrintService {
  isSupported(): boolean
  print(): PrintServiceResult
}

export interface PrintServiceSuccess {
  status: 'printed'
}

export interface PrintServiceUnavailable {
  status: 'unavailable'
  reason: string
}

export type PrintServiceResult = PrintServiceSuccess | PrintServiceUnavailable
