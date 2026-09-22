import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    ssr: true,
    target: 'node22',
    outDir: resolve(import.meta.dirname, '../../.service-dist'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        server: resolve(import.meta.dirname, 'entry.ts'),
        harness: resolve(import.meta.dirname, 'harnessExports.ts'),
      },
      output: { entryFileNames: '[name].mjs', chunkFileNames: 'chunks/[name]-[hash].mjs' },
    },
  },
})
