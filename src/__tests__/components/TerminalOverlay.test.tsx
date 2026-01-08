import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TerminalOverlay from '@/components/TerminalOverlay'

describe('TerminalOverlay Component', () => {
  it('should render without crashing', () => {
    render(<TerminalOverlay />)
    expect(screen.getByText('SYSTEM ACTIVE')).toBeInTheDocument()
  })

  it('should display system status', () => {
    render(<TerminalOverlay />)
    expect(screen.getByText('SYSTEM ACTIVE')).toBeInTheDocument()
  })

  it('should display system ID', () => {
    render(<TerminalOverlay />)
    expect(screen.getByText('ID:78412.93')).toBeInTheDocument()
  })

  it('should display workout analysis complete message', () => {
    render(<TerminalOverlay />)
    expect(screen.getByText(/WORKOUT ANALYSIS COMPLETE/)).toBeInTheDocument()
  })

  it('should display workout step 1', () => {
    render(<TerminalOverlay />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText(/30 min strength training/)).toBeInTheDocument()
  })

  it('should display workout step 2', () => {
    render(<TerminalOverlay />)
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText(/20 min cardio/)).toBeInTheDocument()
  })

  it('should display workout step 3', () => {
    render(<TerminalOverlay />)
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText(/10 min flexibility/)).toBeInTheDocument()
  })

  it('should have absolute positioning', () => {
    const { container } = render(<TerminalOverlay />)
    const overlay = container.firstChild
    expect(overlay).toHaveClass('absolute')
    expect(overlay).toHaveClass('bottom-0')
    expect(overlay).toHaveClass('left-0')
    expect(overlay).toHaveClass('right-0')
  })

  it('should have pulse animation on status indicator', () => {
    const { container } = render(<TerminalOverlay />)
    const pulseElement = container.querySelector('.animate-pulse')
    expect(pulseElement).toBeInTheDocument()
  })

  it('should use monospace font', () => {
    const { container } = render(<TerminalOverlay />)
    const monoElement = container.querySelector('.font-mono')
    expect(monoElement).toBeInTheDocument()
  })

  it('should have backdrop blur effect', () => {
    const { container } = render(<TerminalOverlay />)
    const blurElement = container.querySelector('.backdrop-blur-sm')
    expect(blurElement).toBeInTheDocument()
  })

  it('should have border styling', () => {
    const { container } = render(<TerminalOverlay />)
    const borderElement = container.querySelector('.border')
    expect(borderElement).toBeInTheDocument()
  })
})
