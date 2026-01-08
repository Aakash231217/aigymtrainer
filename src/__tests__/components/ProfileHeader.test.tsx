import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileHeader from '@/components/ProfileHeader'
import { UserResource } from '@clerk/types'

// Mock user data
const createMockUser = (overrides = {}): Partial<UserResource> => ({
  id: 'user_123',
  fullName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  imageUrl: 'https://example.com/avatar.jpg',
  primaryEmailAddress: {
    emailAddress: 'john@example.com',
    id: 'email_123',
    linkedTo: [],
    verification: { status: 'verified', strategy: 'email_code', externalVerificationRedirectURL: null, attempts: null, expireAt: null, nonce: null, message: null },
    toString: () => 'john@example.com',
    prepareVerification: vi.fn(),
    attemptVerification: vi.fn(),
    destroy: vi.fn(),
    create: vi.fn(),
  } as any,
  ...overrides,
})

describe('ProfileHeader Component', () => {
  it('should render nothing when user is null', () => {
    const { container } = render(<ProfileHeader user={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when user is undefined', () => {
    const { container } = render(<ProfileHeader user={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render user full name', () => {
    const mockUser = createMockUser()
    render(<ProfileHeader user={mockUser as UserResource} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render user email', () => {
    const mockUser = createMockUser()
    render(<ProfileHeader user={mockUser as UserResource} />)
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should render USER ACTIVE status', () => {
    const mockUser = createMockUser()
    render(<ProfileHeader user={mockUser as UserResource} />)
    expect(screen.getByText('USER ACTIVE')).toBeInTheDocument()
  })

  it('should render user avatar when imageUrl is provided', () => {
    const mockUser = createMockUser({ imageUrl: 'https://example.com/avatar.jpg' })
    render(<ProfileHeader user={mockUser as UserResource} />)
    const avatar = screen.getByAltText('John Doe')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('should render fallback avatar with initial when no imageUrl', () => {
    const mockUser = createMockUser({ imageUrl: '' })
    render(<ProfileHeader user={mockUser as UserResource} />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('should render U as fallback when no fullName', () => {
    const mockUser = createMockUser({ imageUrl: '', fullName: '' })
    render(<ProfileHeader user={mockUser as UserResource} />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('should handle user with partial data', () => {
    const mockUser = createMockUser({
      fullName: 'Jane Smith',
      primaryEmailAddress: {
        emailAddress: 'jane@test.com',
        id: 'email_456',
        linkedTo: [],
        verification: { status: 'verified', strategy: 'email_code', externalVerificationRedirectURL: null, attempts: null, expireAt: null, nonce: null, message: null },
        toString: () => 'jane@test.com',
        prepareVerification: vi.fn(),
        attemptVerification: vi.fn(),
        destroy: vi.fn(),
        create: vi.fn(),
      } as any,
    })
    render(<ProfileHeader user={mockUser as UserResource} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@test.com')).toBeInTheDocument()
  })
})

describe('ProfileHeader Styling', () => {
  it('should have online status indicator (green dot)', () => {
    const mockUser = createMockUser()
    const { container } = render(<ProfileHeader user={mockUser as UserResource} />)
    const greenDot = container.querySelector('.bg-green-500')
    expect(greenDot).toBeInTheDocument()
  })

  it('should have pulse animation on status indicator', () => {
    const mockUser = createMockUser()
    const { container } = render(<ProfileHeader user={mockUser as UserResource} />)
    const pulsingElement = container.querySelector('.animate-pulse')
    expect(pulsingElement).toBeInTheDocument()
  })
})
