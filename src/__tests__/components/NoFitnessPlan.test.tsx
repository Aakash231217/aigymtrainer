import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NoFitnessPlan from '@/components/NoFitnessPlan'

describe('NoFitnessPlan Component', () => {
  it('should render without crashing', () => {
    render(<NoFitnessPlan />)
    expect(screen.getByText(/No/)).toBeInTheDocument()
  })

  it('should display the heading text', () => {
    render(<NoFitnessPlan />)
    expect(screen.getByText('No')).toBeInTheDocument()
    expect(screen.getByText('fitness plans yet')).toBeInTheDocument()
  })

  it('should display description text', () => {
    render(<NoFitnessPlan />)
    expect(
      screen.getByText(/Start by creating a personalized fitness and diet plan/)
    ).toBeInTheDocument()
  })

  it('should render a call-to-action button', () => {
    render(<NoFitnessPlan />)
    const button = screen.getByRole('link', { name: /Create Your First Plan/i })
    expect(button).toBeInTheDocument()
  })

  it('should have correct link to generate-program page', () => {
    render(<NoFitnessPlan />)
    const link = screen.getByRole('link', { name: /Create Your First Plan/i })
    expect(link).toHaveAttribute('href', '/generate-program')
  })

  it('should render CornerElements component', () => {
    const { container } = render(<NoFitnessPlan />)
    const cornerElements = container.querySelectorAll('.absolute.w-4.h-4')
    expect(cornerElements.length).toBe(4)
  })

  it('should have backdrop blur styling', () => {
    const { container } = render(<NoFitnessPlan />)
    const mainDiv = container.querySelector('.backdrop-blur-sm')
    expect(mainDiv).toBeInTheDocument()
  })

  it('should have border styling', () => {
    const { container } = render(<NoFitnessPlan />)
    const mainDiv = container.querySelector('.border')
    expect(mainDiv).toBeInTheDocument()
  })

  it('should have relative positioning for corner elements', () => {
    const { container } = render(<NoFitnessPlan />)
    const relativeDiv = container.querySelector('.relative')
    expect(relativeDiv).toBeInTheDocument()
  })

  it('should center text content', () => {
    const { container } = render(<NoFitnessPlan />)
    const textCenter = container.querySelector('.text-center')
    expect(textCenter).toBeInTheDocument()
  })
})
