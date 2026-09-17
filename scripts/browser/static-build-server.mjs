import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, relative, resolve, sep } from 'node:path'

import { PAGES_BASE } from './release-contract.mjs'

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

export async function startStaticBuildServer(distDir) {
  const root = resolve(distDir)
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1')
      if (!url.pathname.startsWith(PAGES_BASE)) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
        response.end('Not found')
        return
      }
      const relativePath = url.pathname === PAGES_BASE
        ? 'index.html'
        : decodeURIComponent(url.pathname.slice(PAGES_BASE.length))
      const path = resolve(root, relativePath)
      const rel = relative(root, path)
      if (rel.startsWith('..') || rel.includes(`..${sep}`)) {
        response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' })
        response.end('Forbidden')
        return
      }
      const content = await readFile(path)
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': MIME_TYPES[extname(path)] ?? 'application/octet-stream',
      })
      response.end(request.method === 'HEAD' ? undefined : content)
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      response.end('Not found')
    }
  })
  await new Promise((resolvePromise, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolvePromise)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Local release server did not expose a TCP port.')
  return {
    url: `http://127.0.0.1:${address.port}${PAGES_BASE}`,
    close: () => new Promise((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise())),
  }
}
