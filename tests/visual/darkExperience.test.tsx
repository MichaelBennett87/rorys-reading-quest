import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import App from '../../src/App'

afterEach(() => cleanup())

describe('dark-first experience', () => {
  test('uses the dark child experience by default', async () => {
    render(<App />)

    const shell = (await screen.findByRole('heading', { name: "Rory's Reading Quest" })).closest('.child-experience')
    expect(shell?.getAttribute('data-appearance')).toBe('dark')
  })

  test('applies the current world identity without restoring the retired map', async () => {
    render(<App />)

    expect(await screen.findByRole('region', { name: /Reading material/i })).toBeTruthy()
    expect(document.querySelector('.world-theme-story-scouts')).not.toBeNull()
    expect(document.querySelector('.world-map')).toBeNull()
    expect(document.querySelector('.world-coming-later')).toBeNull()
    expect(screen.getByRole('region', { name: /Current question/i })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /Check Answer|Next/i })).toHaveLength(1)
  })
})
