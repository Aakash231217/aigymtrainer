import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
  useAuth: () => ({
    isSignedIn: false,
    isLoaded: true,
    userId: null,
  }),
}))

vi.mock('convex/react', () => ({
  ConvexReactClient: vi.fn().mockImplementation(() => ({
    setAuth: vi.fn(),
  })),
}))

vi.mock('convex/react-clerk', () => ({
  ConvexProviderWithClerk: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
}))

import ConvexClerkProvider from '@/providers/ConvexClerkProvider'

describe('ConvexClerkProvider', () => {
  it('should render children', () => {
    render(
      <ConvexClerkProvider>
        <div data-testid="child">Test Child</div>
      </ConvexClerkProvider>
    )
    
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should wrap children with ClerkProvider', () => {
    render(
      <ConvexClerkProvider>
        <div>Child Content</div>
      </ConvexClerkProvider>
    )
    
    expect(screen.getByTestId('clerk-provider')).toBeInTheDocument()
  })

  it('should wrap children with ConvexProviderWithClerk', () => {
    render(
      <ConvexClerkProvider>
        <div>Child Content</div>
      </ConvexClerkProvider>
    )
    
    expect(screen.getByTestId('convex-provider')).toBeInTheDocument()
  })

  it('should render nested providers in correct order', () => {
    render(
      <ConvexClerkProvider>
        <span>Nested Child</span>
      </ConvexClerkProvider>
    )
    
    const clerkProvider = screen.getByTestId('clerk-provider')
    const convexProvider = screen.getByTestId('convex-provider')
    
    expect(clerkProvider).toContainElement(convexProvider)
  })

  it('should render multiple children', () => {
    render(
      <ConvexClerkProvider>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
      </ConvexClerkProvider>
    )
    
    expect(screen.getByTestId('first')).toBeInTheDocument()
    expect(screen.getByTestId('second')).toBeInTheDocument()
  })

  it('should render complex nested children', () => {
    render(
      <ConvexClerkProvider>
        <div>
          <header>Header</header>
          <main>Main Content</main>
          <footer>Footer</footer>
        </div>
      </ConvexClerkProvider>
    )
    
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})

describe('ConvexClerkProvider Integration', () => {
  it('should provide auth context to children', () => {
    const TestComponent = () => {
      return <div data-testid="auth-consumer">Auth Consumer</div>
    }
    
    render(
      <ConvexClerkProvider>
        <TestComponent />
      </ConvexClerkProvider>
    )
    
    expect(screen.getByTestId('auth-consumer')).toBeInTheDocument()
  })
})
