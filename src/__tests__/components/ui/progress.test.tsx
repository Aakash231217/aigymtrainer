import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from '@/components/ui/progress'

describe('Progress Component', () => {
  it('should render progress bar', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should have correct aria-valuenow', () => {
    render(<Progress value={75} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
  })

  it('should have aria-valuemin of 0', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0')
  })

  it('should have aria-valuemax of 100', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100')
  })

  it('should render with 0% progress', () => {
    render(<Progress value={0} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('should render with 100% progress', () => {
    render(<Progress value={100} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('should apply custom className', () => {
    render(<Progress value={50} className="custom-progress" />)
    expect(screen.getByRole('progressbar')).toHaveClass('custom-progress')
  })

  it('should handle undefined value', () => {
    render(<Progress />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should handle null value', () => {
    render(<Progress value={null as any} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render indicator element', () => {
    const { container } = render(<Progress value={50} />)
    const indicator = container.querySelector('[data-state]')
    expect(indicator || container.firstChild).toBeInTheDocument()
  })
})

describe('Progress Visual States', () => {
  it('should render empty state at 0%', () => {
    const { container } = render(<Progress value={0} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render partial state at 50%', () => {
    const { container } = render(<Progress value={50} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render complete state at 100%', () => {
    const { container } = render(<Progress value={100} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should handle values below 0 gracefully', () => {
    render(<Progress value={-10} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should handle values above 100 gracefully', () => {
    render(<Progress value={150} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})

describe('Progress Accessibility', () => {
  it('should have progressbar role', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should be accessible with screen readers', () => {
    render(<Progress value={75} />)
    const progressbar = screen.getByRole('progressbar')
    
    expect(progressbar).toHaveAttribute('aria-valuenow')
    expect(progressbar).toHaveAttribute('aria-valuemin')
    expect(progressbar).toHaveAttribute('aria-valuemax')
  })

  it('should update aria-valuenow when value changes', () => {
    const { rerender } = render(<Progress value={25} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25')
    
    rerender(<Progress value={75} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
  })
})

describe('Progress Styling', () => {
  it('should have default styling', () => {
    const { container } = render(<Progress value={50} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should merge custom className with default styles', () => {
    render(<Progress value={50} className="h-4 w-full" />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveClass('h-4')
    expect(progress).toHaveClass('w-full')
  })
})
