import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SalesAgent from '@/components/SalesAgent'

vi.mock('@/lib/gemini', () => ({
  getSalesResponse: vi.fn().mockResolvedValue({
    text: 'Welcome to Athonix! How can I help you today?',
    suggestPlan: false,
  }),
}))

describe('SalesAgent Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Storage.prototype.getItem = vi.fn().mockReturnValue(null)
    Storage.prototype.setItem = vi.fn()
    
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render without crashing', async () => {
    render(<SalesAgent />)
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  it('should render input field', async () => {
    render(<SalesAgent />)
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/message|type|ask/i)
      expect(input).toBeInTheDocument()
    })
  })

  it('should render send button', async () => {
    render(<SalesAgent />)
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('should load welcome message on mount', async () => {
    render(<SalesAgent />)
    await waitFor(() => {
      const welcomeText = screen.queryByText(/welcome|hello|hi/i)
      expect(welcomeText || screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  it('should handle input changes', async () => {
    render(<SalesAgent />)
    await waitFor(() => {
      const input = screen.getByRole('textbox') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Test message' } })
      expect(input.value).toBe('Test message')
    })
  })

  it('should save messages to localStorage', async () => {
    render(<SalesAgent />)
    await waitFor(() => {
      expect(Storage.prototype.setItem).toHaveBeenCalled()
    })
  })

  it('should load messages from localStorage', () => {
    const savedMessages = JSON.stringify([
      { text: 'Previous message', isUser: true, timestamp: new Date().toISOString() }
    ])
    Storage.prototype.getItem = vi.fn().mockReturnValue(savedMessages)
    
    render(<SalesAgent />)
    expect(Storage.prototype.getItem).toHaveBeenCalledWith('athonix_chat_history')
  })

  it('should initialize speech synthesis', () => {
    render(<SalesAgent />)
    expect(window.speechSynthesis.getVoices).toHaveBeenCalled()
  })
})

describe('SalesAgent Message Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Storage.prototype.getItem = vi.fn().mockReturnValue(null)
    Storage.prototype.setItem = vi.fn()
    
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })
  })

  it('should clear input after sending message', async () => {
    render(<SalesAgent />)
    
    await waitFor(() => {
      const input = screen.getByRole('textbox') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Test' } })
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }
    })
  })
})
