import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import CornerElements from '@/components/CornerElements'

describe('CornerElements Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<CornerElements />)
    expect(container).toBeDefined()
  })

  it('should render 4 corner elements', () => {
    const { container } = render(<CornerElements />)
    const corners = container.querySelectorAll('div')
    expect(corners.length).toBe(4)
  })

  it('should have absolute positioning on all corners', () => {
    const { container } = render(<CornerElements />)
    const corners = container.querySelectorAll('div')
    corners.forEach((corner) => {
      expect(corner).toHaveClass('absolute')
    })
  })

  it('should have top-left corner element', () => {
    const { container } = render(<CornerElements />)
    const topLeft = container.querySelector('.top-0.left-0')
    expect(topLeft).toBeInTheDocument()
    expect(topLeft).toHaveClass('border-l')
    expect(topLeft).toHaveClass('border-t')
  })

  it('should have top-right corner element', () => {
    const { container } = render(<CornerElements />)
    const topRight = container.querySelector('.top-0.right-0')
    expect(topRight).toBeInTheDocument()
    expect(topRight).toHaveClass('border-r')
    expect(topRight).toHaveClass('border-t')
  })

  it('should have bottom-left corner element', () => {
    const { container } = render(<CornerElements />)
    const bottomLeft = container.querySelector('.bottom-0.left-0')
    expect(bottomLeft).toBeInTheDocument()
    expect(bottomLeft).toHaveClass('border-l')
    expect(bottomLeft).toHaveClass('border-b')
  })

  it('should have bottom-right corner element', () => {
    const { container } = render(<CornerElements />)
    const bottomRight = container.querySelector('.bottom-0.right-0')
    expect(bottomRight).toBeInTheDocument()
    expect(bottomRight).toHaveClass('border-r')
    expect(bottomRight).toHaveClass('border-b')
  })

  it('should have consistent sizing on all corners', () => {
    const { container } = render(<CornerElements />)
    const corners = container.querySelectorAll('div')
    corners.forEach((corner) => {
      expect(corner).toHaveClass('w-4')
      expect(corner).toHaveClass('h-4')
    })
  })
})
