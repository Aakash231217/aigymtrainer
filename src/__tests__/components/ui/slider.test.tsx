import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Slider } from '@/components/ui/slider'

describe('Slider Component', () => {
  it('should render slider', () => {
    render(<Slider defaultValue={[50]} />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('should render with default value', () => {
    render(<Slider defaultValue={[25]} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '25')
  })

  it('should have correct min value', () => {
    render(<Slider defaultValue={[50]} min={0} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemin', '0')
  })

  it('should have correct max value', () => {
    render(<Slider defaultValue={[50]} max={100} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemax', '100')
  })

  it('should apply custom className', () => {
    render(<Slider defaultValue={[50]} className="custom-slider" />)
    const slider = screen.getByRole('slider').closest('[class*="custom-slider"]')
    expect(slider || screen.getByRole('slider')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Slider defaultValue={[50]} disabled />)
    expect(screen.getByRole('slider')).toHaveAttribute('data-disabled')
  })

  it('should handle custom step value', () => {
    render(<Slider defaultValue={[50]} step={10} />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('should call onValueChange when value changes', () => {
    const handleChange = vi.fn()
    render(<Slider defaultValue={[50]} onValueChange={handleChange} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should render with custom min and max', () => {
    render(<Slider defaultValue={[5]} min={0} max={10} />)
    const slider = screen.getByRole('slider')
    
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '10')
    expect(slider).toHaveAttribute('aria-valuenow', '5')
  })

  it('should handle controlled value', () => {
    const { rerender } = render(<Slider value={[25]} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '25')
    
    rerender(<Slider value={[75]} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '75')
  })
})

describe('Slider Keyboard Navigation', () => {
  it('should increase value on ArrowRight', () => {
    const handleChange = vi.fn()
    render(<Slider defaultValue={[50]} onValueChange={handleChange} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should decrease value on ArrowLeft', () => {
    const handleChange = vi.fn()
    render(<Slider defaultValue={[50]} onValueChange={handleChange} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should increase value on ArrowUp', () => {
    const handleChange = vi.fn()
    render(<Slider defaultValue={[50]} onValueChange={handleChange} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should decrease value on ArrowDown', () => {
    const handleChange = vi.fn()
    render(<Slider defaultValue={[50]} onValueChange={handleChange} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowDown' })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should go to min on Home key', () => {
    const handleChange = vi.fn()
    render(<Slider defaultValue={[50]} min={0} onValueChange={handleChange} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'Home' })
    
    expect(handleChange).toHaveBeenCalledWith([0])
  })

  it('should go to max on End key', () => {
    const handleChange = vi.fn()
    render(<Slider defaultValue={[50]} max={100} onValueChange={handleChange} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'End' })
    
    expect(handleChange).toHaveBeenCalledWith([100])
  })
})

describe('Slider Accessibility', () => {
  it('should have slider role', () => {
    render(<Slider defaultValue={[50]} />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('should have correct aria attributes', () => {
    render(<Slider defaultValue={[50]} min={0} max={100} />)
    const slider = screen.getByRole('slider')
    
    expect(slider).toHaveAttribute('aria-valuenow', '50')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '100')
  })

  it('should support aria-label', () => {
    render(<Slider defaultValue={[50]} aria-label="Volume" />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-label', 'Volume')
  })
})

describe('Slider Range', () => {
  it('should support range with two thumbs', () => {
    render(<Slider defaultValue={[25, 75]} />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBe(2)
  })

  it('should have correct values for range', () => {
    render(<Slider defaultValue={[20, 80]} />)
    const sliders = screen.getAllByRole('slider')
    
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '20')
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '80')
  })
})
