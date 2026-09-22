import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

export interface NodeWritingPilotServerOptions {
  service(request: Request): Promise<Response>
  host?: string
  port?: number
  maxRequestBytes?: number
}

export async function startNodeWritingPilotServer(options: NodeWritingPilotServerOptions) {
  const maxRequestBytes = options.maxRequestBytes ?? 1_600_000
  const server = createServer(async (incoming, outgoing) => {
    try {
      const body = await readBody(incoming, maxRequestBytes)
      const authority = incoming.headers.host ?? '127.0.0.1'
      const request = new Request(`http://${authority}${incoming.url ?? '/'}`, {
        method: incoming.method,
        headers: requestHeaders(incoming),
        body: body.length > 0 ? body : undefined,
      })
      await sendResponse(outgoing, await options.service(request))
    } catch (error) {
      const status = error instanceof PayloadTooLargeError ? 413 : 500
      outgoing.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
      outgoing.end(JSON.stringify({ error: status === 413 ? 'payload_too_large' : 'service_failure' }))
    }
  })
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(options.port ?? 0, options.host ?? '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Writing service did not bind a TCP address.')
  return {
    url: `http://${address.address.includes(':') ? `[${address.address}]` : address.address}:${address.port}/api/read-write/v1/`,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  }
}

async function readBody(request: IncomingMessage, maximum: number): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  let total = 0
  for await (const chunk of request) {
    const bytes = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    total += bytes.byteLength
    if (total > maximum) throw new PayloadTooLargeError()
    chunks.push(bytes)
  }
  return Buffer.concat(chunks)
}

function requestHeaders(request: IncomingMessage): Headers {
  const headers = new Headers()
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) value.forEach((entry) => headers.append(name, entry))
    else if (value !== undefined) headers.set(name, value)
  }
  return headers
}

async function sendResponse(outgoing: ServerResponse, response: Response) {
  const headers: Record<string, string> = {}
  response.headers.forEach((value, name) => { headers[name] = value })
  outgoing.writeHead(response.status, headers)
  outgoing.end(Buffer.from(await response.arrayBuffer()))
}

class PayloadTooLargeError extends Error {}
