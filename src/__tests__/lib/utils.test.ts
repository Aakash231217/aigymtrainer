import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-4', 'py-2')
    expect(result).toBe('px-4 py-2')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('should handle false conditional classes', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class')
  })

  it('should merge tailwind classes and remove conflicts', () => {
    const result = cn('px-4 py-2', 'px-6')
    expect(result).toBe('py-2 px-6')
  })

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end')
    expect(result).toBe('base end')
  })

  it('should handle empty string', () => {
    const result = cn('')
    expect(result).toBe('')
  })

  it('should handle object syntax', () => {
    const result = cn({
      'text-red-500': true,
      'text-blue-500': false,
      'font-bold': true,
    })
    expect(result).toBe('text-red-500 font-bold')
  })

  it('should handle array syntax', () => {
    const result = cn(['px-4', 'py-2'])
    expect(result).toBe('px-4 py-2')
  })

  it('should handle complex mixed input', () => {
    const variant = 'primary'
    const result = cn(
      'base-button',
      variant === 'primary' && 'bg-blue-500',
      variant === 'secondary' && 'bg-gray-500',
      { 'cursor-pointer': true, 'opacity-50': false }
    )
    expect(result).toBe('base-button bg-blue-500 cursor-pointer')
  })
})
