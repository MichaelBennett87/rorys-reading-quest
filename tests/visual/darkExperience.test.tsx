import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import App from '../../src/App'

describe('dark-first experience', () => {
  test('uses the dark child experience by default', () => {
    render(<App />)

    const shell = screen.getByRole('heading', { name: "Rory's Reading Quest" }).closest('.child-experience')
    expect(shell?.getAttribute('data-appearance')).toBe('dark')
  })

  test('keeps distinct world identities and accessible unavailable states', () => {
    render(<App />)

    expect(document.querySelector('.world-theme-word-forge')).not.toBeNull()
    expect(document.querySelector('.world-theme-story-scouts')).not.toBeNull()
    expect(document.querySelector('.world-theme-poetry-planet')).not.toBeNull()
    expect(document.querySelector('.world-theme-information-detectives')).not.toBeNull()
    expect(document.querySelector('.world-theme-context-cavern')).not.toBeNull()
    expect(document.querySelector('.world-theme-compare-castle')).not.toBeNull()

    const unavailableWorld = document.querySelector<HTMLButtonElement>('.world-coming-later')
    expect(unavailableWorld?.disabled).toBe(true)
    expect(unavailableWorld?.textContent).toMatch(/coming later/i)
  })
})
