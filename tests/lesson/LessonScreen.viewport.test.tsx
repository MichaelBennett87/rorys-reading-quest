import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getLessonById } from '../../src/domain/lesson'
import { LessonScreen } from '../../src/screens/LessonScreen'

describe('LessonScreen viewport reading position', () => {
  let scrollY = 0
  let innerWidth = 768
  let innerHeight = 1024
  let animationFrameId = 0

  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    })
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      get: () => innerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      get: () => innerHeight,
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get: () => 2200,
    })
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrameId += 1
      callback(animationFrameId)
      return animationFrameId
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
    vi.spyOn(window, 'scrollTo').mockImplementation(((optionsOrX: number | ScrollToOptions, y?: number) => {
      scrollY = typeof optionsOrX === 'object'
        ? optionsOrX.top ?? 0
        : y ?? 0
    }) as typeof window.scrollTo)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('restores the stable reading position after portrait and landscape reflow', () => {
    const lesson = getLessonById('lesson-word-forge-ou-oi-oy-ow-checkpoint-a').lesson
    expect(lesson).toBeDefined()

    render(
      <LessonScreen
        lesson={lesson!}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    act(() => {
      scrollY = 320
      window.dispatchEvent(new Event('scroll'))
    })

    act(() => {
      innerWidth = 1024
      innerHeight = 768
      scrollY = 0
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('resize'))
    })

    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 320, behavior: 'auto' })
    expect(scrollY).toBe(320)

    act(() => {
      innerWidth = 768
      innerHeight = 1024
      scrollY = 0
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('resize'))
    })

    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 320, behavior: 'auto' })
    expect(scrollY).toBe(320)
  })

  test('keeps an intentional scroll to the top as the new reading position', () => {
    const lesson = getLessonById('lesson-word-forge-ou-oi-oy-ow-checkpoint-a').lesson
    expect(lesson).toBeDefined()

    render(
      <LessonScreen
        lesson={lesson!}
        onBack={() => undefined}
        onSessionCheckpoint={() => undefined}
        onComplete={() => undefined}
      />,
    )

    act(() => {
      scrollY = 320
      window.dispatchEvent(new Event('scroll'))
      scrollY = 0
      window.dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(250)
    })

    vi.mocked(window.scrollTo).mockClear()
    act(() => {
      innerWidth = 1024
      innerHeight = 768
      window.dispatchEvent(new Event('resize'))
    })

    expect(window.scrollTo).not.toHaveBeenCalled()
    expect(scrollY).toBe(0)
  })
})
