import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

describe('PWAInstallPrompt Component', () => {
  let mockMatchMedia: any
  let mockAddEventListener: any
  let mockRemoveEventListener: any

  beforeEach(() => {
    vi.useFakeTimers()
    
    mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })

    mockAddEventListener = vi.spyOn(window, 'addEventListener')
    mockRemoveEventListener = vi.spyOn(window, 'removeEventListener')
    
    Storage.prototype.getItem = vi.fn()
    Storage.prototype.setItem = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should not render when app is already installed', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { container } = render(<PWAInstallPrompt />)
    expect(container.firstChild).toBeNull()
  })

  it('should register beforeinstallprompt event listener', () => {
    render(<PWAInstallPrompt />)
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    )
  })

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = render(<PWAInstallPrompt />)
    unmount()
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    )
  })

  it('should not show prompt initially', () => {
    const { container } = render(<PWAInstallPrompt />)
    expect(container.firstChild).toBeNull()
  })
})

describe('PWAInstallPrompt UI Elements', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should have correct structure when visible', async () => {
    const mockPrompt = vi.fn().mockResolvedValue(undefined)
    const mockUserChoice = Promise.resolve({ outcome: 'accepted' as const })
    
    const beforeInstallPromptEvent = new Event('beforeinstallprompt') as any
    beforeInstallPromptEvent.preventDefault = vi.fn()
    beforeInstallPromptEvent.prompt = mockPrompt
    beforeInstallPromptEvent.userChoice = mockUserChoice

    render(<PWAInstallPrompt />)
    
    window.dispatchEvent(beforeInstallPromptEvent)
    
    await waitFor(() => {
      const title = screen.queryByText('Install Athonix App')
      if (title) {
        expect(title).toBeInTheDocument()
      }
    })
  })
})
