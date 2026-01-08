import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should render with default type text', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('should render with specified type', () => {
    render(<Input type="email" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should render password input', () => {
    render(<Input type="password" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should render number input', () => {
    render(<Input type="number" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('should handle value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} data-testid="input" />)
    
    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should display controlled value', () => {
    render(<Input value="controlled value" onChange={() => {}} data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.value).toBe('controlled value')
  })

  it('should be disabled when disabled prop is passed', () => {
    render(<Input disabled data-testid="input" />)
    expect(screen.getByTestId('input')).toBeDisabled()
  })

  it('should be read-only when readOnly prop is passed', () => {
    render(<Input readOnly data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('readonly')
  })

  it('should apply custom className', () => {
    render(<Input className="custom-input" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveClass('custom-input')
  })

  it('should forward ref', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should handle focus events', () => {
    const handleFocus = vi.fn()
    render(<Input onFocus={handleFocus} data-testid="input" />)
    
    fireEvent.focus(screen.getByTestId('input'))
    expect(handleFocus).toHaveBeenCalled()
  })

  it('should handle blur events', () => {
    const handleBlur = vi.fn()
    render(<Input onBlur={handleBlur} data-testid="input" />)
    
    const input = screen.getByTestId('input')
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('should support required attribute', () => {
    render(<Input required data-testid="input" />)
    expect(screen.getByTestId('input')).toBeRequired()
  })

  it('should support min and max for number inputs', () => {
    render(<Input type="number" min={0} max={100} data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('should support maxLength attribute', () => {
    render(<Input maxLength={50} data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('maxlength', '50')
  })

  it('should support pattern attribute', () => {
    render(<Input pattern="[A-Za-z]+" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('pattern', '[A-Za-z]+')
  })

  it('should support autoComplete attribute', () => {
    render(<Input autoComplete="email" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('autocomplete', 'email')
  })

  it('should support name attribute', () => {
    render(<Input name="username" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('name', 'username')
  })

  it('should support aria-label for accessibility', () => {
    render(<Input aria-label="Username input" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('aria-label', 'Username input')
  })
})

describe('Input Edge Cases', () => {
  it('should handle empty string value', () => {
    render(<Input value="" onChange={() => {}} data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('should handle special characters in value', () => {
    render(<Input value="<script>alert('xss')</script>" onChange={() => {}} data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.value).toBe("<script>alert('xss')</script>")
  })

  it('should handle unicode characters', () => {
    render(<Input value="こんにちは 🎉" onChange={() => {}} data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.value).toBe('こんにちは 🎉')
  })
})
