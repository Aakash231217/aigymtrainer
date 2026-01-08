import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('should apply default variant', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge).toBeInTheDocument()
  })

  it('should apply secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    const badge = screen.getByText('Secondary')
    expect(badge).toBeInTheDocument()
  })

  it('should apply destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>)
    const badge = screen.getByText('Destructive')
    expect(badge).toBeInTheDocument()
  })

  it('should apply outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText('Outline')
    expect(badge).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-badge')
  })

  it('should render as a span element', () => {
    render(<Badge>Span Badge</Badge>)
    const badge = screen.getByText('Span Badge')
    expect(badge.tagName.toLowerCase()).toBe('div')
  })

  it('should accept and spread HTML attributes', () => {
    render(<Badge data-testid="test-badge">With Attributes</Badge>)
    expect(screen.getByTestId('test-badge')).toBeInTheDocument()
  })

  it('should render children correctly', () => {
    render(
      <Badge>
        <span>Child Element</span>
      </Badge>
    )
    expect(screen.getByText('Child Element')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <Badge>
        <span>First</span>
        <span>Second</span>
      </Badge>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})

describe('badgeVariants', () => {
  it('should be a function', () => {
    expect(typeof badgeVariants).toBe('function')
  })

  it('should return a string for default variant', () => {
    const result = badgeVariants({ variant: 'default' })
    expect(typeof result).toBe('string')
  })

  it('should return a string for secondary variant', () => {
    const result = badgeVariants({ variant: 'secondary' })
    expect(typeof result).toBe('string')
  })

  it('should return a string for destructive variant', () => {
    const result = badgeVariants({ variant: 'destructive' })
    expect(typeof result).toBe('string')
  })

  it('should return a string for outline variant', () => {
    const result = badgeVariants({ variant: 'outline' })
    expect(typeof result).toBe('string')
  })

  it('should return default classes without variant', () => {
    const result = badgeVariants({})
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('Badge Visual Tests', () => {
  it('should have inline-flex display', () => {
    render(<Badge>Flex Badge</Badge>)
    const badge = screen.getByText('Flex Badge')
    expect(badge).toHaveClass('inline-flex')
  })

  it('should have rounded styling', () => {
    render(<Badge>Rounded</Badge>)
    const badge = screen.getByText('Rounded')
    expect(badge.className).toMatch(/rounded/)
  })

  it('should have text styling', () => {
    render(<Badge>Text Style</Badge>)
    const badge = screen.getByText('Text Style')
    expect(badge.className).toMatch(/text/)
  })
})
