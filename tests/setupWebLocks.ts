const queues = new Map<string, Promise<void>>()

const testLockManager = {
  async request<T>(
    name: string,
    options: { signal?: AbortSignal },
    callback: () => Promise<T> | T,
  ): Promise<T> {
    const previous = queues.get(name) ?? Promise.resolve()
    let release!: () => void
    const current = new Promise<void>((resolve) => { release = resolve })
    const queued = previous.then(() => current)
    queues.set(name, queued)
    await previous
    if (options.signal?.aborted) {
      release()
      throw new DOMException('The lock request was aborted.', 'AbortError')
    }
    try {
      return await callback()
    } finally {
      release()
      if (queues.get(name) === queued) queues.delete(name)
    }
  },
}

Object.defineProperty(navigator, 'locks', {
  configurable: true,
  value: testLockManager,
})
