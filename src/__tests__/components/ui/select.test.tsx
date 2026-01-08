import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'

describe('Select Component', () => {
  it('should render Select with trigger', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
      </Select>
    )
    
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should display placeholder text', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
      </Select>
    )
    
    expect(screen.getByText('Choose an option')).toBeInTheDocument()
  })

  it('should open dropdown on click', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    
    expect(await screen.findByText('Option 1')).toBeInTheDocument()
  })

  it('should render multiple SelectItems', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Item A</SelectItem>
          <SelectItem value="b">Item B</SelectItem>
          <SelectItem value="c">Item C</SelectItem>
        </SelectContent>
      </Select>
    )
    
    fireEvent.click(screen.getByRole('combobox'))
    
    expect(await screen.findByText('Item A')).toBeInTheDocument()
    expect(screen.getByText('Item B')).toBeInTheDocument()
    expect(screen.getByText('Item C')).toBeInTheDocument()
  })

  it('should apply custom className to SelectTrigger', () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    )
    
    expect(screen.getByRole('combobox')).toHaveClass('custom-trigger')
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    )
    
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('should call onValueChange when option is selected', async () => {
    const handleChange = vi.fn()
    
    render(
      <Select onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="test">Test Option</SelectItem>
        </SelectContent>
      </Select>
    )
    
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(await screen.findByText('Test Option'))
    
    expect(handleChange).toHaveBeenCalledWith('test')
  })

  it('should display selected value', () => {
    render(
      <Select defaultValue="selected">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="selected">Selected Option</SelectItem>
        </SelectContent>
      </Select>
    )
    
    expect(screen.getByText('Selected Option')).toBeInTheDocument()
  })
})

describe('SelectGroup and SelectLabel', () => {
  it('should render SelectGroup with label', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    
    fireEvent.click(screen.getByRole('combobox'))
    
    expect(await screen.findByText('Fruits')).toBeInTheDocument()
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('should render multiple SelectGroups', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select food" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    
    fireEvent.click(screen.getByRole('combobox'))
    
    expect(await screen.findByText('Fruits')).toBeInTheDocument()
    expect(screen.getByText('Vegetables')).toBeInTheDocument()
  })
})

describe('Select Accessibility', () => {
  it('should have combobox role', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    )
    
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should have aria-expanded attribute', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    )
    
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-expanded')
  })
})
