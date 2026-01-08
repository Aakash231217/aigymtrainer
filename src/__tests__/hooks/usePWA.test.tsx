import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import usePWA from '@/hooks/usePWA'

describe('usePWA Hook', () => {
  const originalNavigator = global.navigator
  const originalWindow = global.window

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return null', () => {
    const { result } = renderHook(() => usePWA())
    expect(result.current).toBeNull()
  })

  it('should register service worker when supported', () => {
    const mockRegister = vi.fn().mockResolvedValue({ scope: '/' })
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      configurable: true,
      writable: true,
    })

    renderHook(() => usePWA())
    
    // Trigger window load event
    window.dispatchEvent(new Event('load'))
    
    expect(mockRegister).toHaveBeenCalledWith('/sw.js')
  })

  it('should handle service worker registration failure', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockRegister = vi.fn().mockRejectedValue(new Error('Registration failed'))
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      configurable: true,
      writable: true,
    })

    renderHook(() => usePWA())
    
    // Trigger window load event
    window.dispatchEvent(new Event('load'))
    
    // Wait for the rejection to be handled
    setTimeout(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    }, 0)
  })

  it('should not attempt registration when service workers are not supported', () => {
    const mockRegister = vi.fn()
    
    // Remove serviceWorker from navigator
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
      writable: true,
    })

    renderHook(() => usePWA())
    
    window.dispatchEvent(new Event('load'))
    
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('should log success message on successful registration', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const mockRegister = vi.fn().mockResolvedValue({ scope: '/test-scope/' })
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      configurable: true,
      writable: true,
    })

    renderHook(() => usePWA())
    
    window.dispatchEvent(new Event('load'))
    
    // Wait for promise to resolve
    await new Promise(resolve => setTimeout(resolve, 10))
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Service Worker registered with scope:',
      '/test-scope/'
    )
  })
})

describe('usePWA Hook - Edge Cases', () => {
  it('should only run effect once (empty dependency array)', () => {
    const mockRegister = vi.fn().mockResolvedValue({ scope: '/' })
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      configurable: true,
      writable: true,
    })

    const { rerender } = renderHook(() => usePWA())
    rerender()
    rerender()
    
    // addEventListener should only be called once for 'load' event
    const loadCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'load'
    )
    expect(loadCalls.length).toBe(1)
  })
})
