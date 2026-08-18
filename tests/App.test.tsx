import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import App from '../src/App'

describe('App shell', () => {
  test('renders minimal phase 0 interface', () => {
    const { container } = render(<App />)
    const title = container.querySelector('h1')
    const parentArea = container.querySelector('[aria-label="Parent area placeholder"]')

    expect(title?.textContent).toContain("Rory's Reading Quest")
    expect(parentArea).toBeTruthy()
    expect(container.querySelector('.pathway-grid')).toBeTruthy()
  })
})
