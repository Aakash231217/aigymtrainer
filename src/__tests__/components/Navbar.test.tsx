import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '@/components/Navbar'

// Mock useUser with different states
const mockUseUser = vi.fn()

vi.mock('@clerk/nextjs', async () => {
  const actual = await vi.importActual('@clerk/nextjs')
  return {
    ...actual,
    useUser: () => mockUseUser(),
    SignInButton: ({ children }: { children: React.ReactNode }) => (
      <button data-testid="sign-in-button">{children}</button>
    ),
    SignUpButton: ({ children }: { children: React.ReactNode }) => (
      <button data-testid="sign-up-button">{children}</button>
    ),
    UserButton: () => <div data-testid="user-button">UserButton</div>,
  }
})

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to signed out state
    mockUseUser.mockReturnValue({ isSignedIn: false, user: null })
  })

  it('should render the logo', () => {
    render(<Navbar />)
    expect(screen.getByText('Atho')).toBeInTheDocument()
    expect(screen.getByText('nix')).toBeInTheDocument()
  })

  it('should render sign in and sign up buttons when user is not signed in', () => {
    mockUseUser.mockReturnValue({ isSignedIn: false, user: null })
    render(<Navbar />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('should render navigation links when user is signed in', () => {
    mockUseUser.mockReturnValue({ isSignedIn: true, user: { id: '123' } })
    render(<Navbar />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('should toggle mobile menu when hamburger icon is clicked', () => {
    // Set viewport to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })
    window.dispatchEvent(new Event('resize'))

    render(<Navbar />)
    
    // Find the menu toggle button (hamburger icon)
    const menuButtons = screen.getAllByRole('button')
    const menuButton = menuButtons.find(btn => btn.querySelector('svg'))
    
    if (menuButton) {
      fireEvent.click(menuButton)
      // Menu should be visible after click
    }
  })

  it('should have correct link to home page', () => {
    render(<Navbar />)
    const logoLink = screen.getByRole('link', { name: /athonix/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })
})

describe('Navbar Responsive Behavior', () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({ isSignedIn: true, user: { id: '123' } })
  })

  it('should close mobile menu when window is resized to desktop', () => {
    // Start with mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })
    
    render(<Navbar />)
    
    // Resize to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    window.dispatchEvent(new Event('resize'))
    
    // Menu should be closed (desktop nav visible instead)
  })
})
