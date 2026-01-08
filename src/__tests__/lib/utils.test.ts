import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  formatPercentage,
  truncateString,
  debounce,
  capitalize,
  generateId,
  isEmpty,
  formatDate,
  calculateBMI,
  getBMICategory,
  calculateCaloriesBurned,
  formatDuration,
} from '@/lib/utils'

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

describe('formatPercentage', () => {
  it('should format a decimal as percentage', () => {
    expect(formatPercentage(0.5)).toBe('50%')
    expect(formatPercentage(0.75)).toBe('75%')
    expect(formatPercentage(1)).toBe('100%')
  })

  it('should handle decimals parameter', () => {
    expect(formatPercentage(0.333, 1)).toBe('33.3%')
    expect(formatPercentage(0.6667, 2)).toBe('66.67%')
  })

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0%')
  })

  it('should handle values over 100%', () => {
    expect(formatPercentage(1.5)).toBe('150%')
  })
})

describe('truncateString', () => {
  it('should truncate long strings with ellipsis', () => {
    expect(truncateString('Hello World', 8)).toBe('Hello...')
  })

  it('should not truncate short strings', () => {
    expect(truncateString('Hi', 10)).toBe('Hi')
  })

  it('should handle exact length', () => {
    expect(truncateString('Hello', 5)).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(truncateString('', 5)).toBe('')
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce function calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to debounced function', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('arg1', 'arg2')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should reset timer on subsequent calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    vi.advanceTimersByTime(50)
    debouncedFn()
    vi.advanceTimersByTime(50)
    
    expect(fn).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('should handle already capitalized string', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('should preserve rest of string', () => {
    expect(capitalize('hELLO')).toBe('HELLO')
  })
})

describe('generateId', () => {
  it('should generate ID with default length', () => {
    const id = generateId()
    expect(id).toHaveLength(8)
  })

  it('should generate ID with custom length', () => {
    const id = generateId(16)
    expect(id).toHaveLength(16)
  })

  it('should only contain alphanumeric characters', () => {
    const id = generateId(100)
    expect(id).toMatch(/^[A-Za-z0-9]+$/)
  })

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

describe('isEmpty', () => {
  it('should return true for null', () => {
    expect(isEmpty(null)).toBe(true)
  })

  it('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('   ')).toBe(true)
  })

  it('should return true for empty array', () => {
    expect(isEmpty([])).toBe(true)
  })

  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true)
  })

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false)
    expect(isEmpty([1, 2])).toBe(false)
    expect(isEmpty({ key: 'value' })).toBe(false)
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(false)).toBe(false)
  })
})

describe('formatDate', () => {
  it('should format Date object', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date)
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('should format date string', () => {
    const result = formatDate('2024-12-25')
    expect(result).toContain('December')
    expect(result).toContain('25')
  })

  it('should format timestamp', () => {
    const timestamp = new Date('2024-06-01').getTime()
    const result = formatDate(timestamp)
    expect(result).toContain('June')
    expect(result).toContain('1')
  })
})

describe('calculateBMI', () => {
  it('should calculate BMI correctly', () => {
    expect(calculateBMI(70, 175)).toBe(22.9)
    expect(calculateBMI(80, 180)).toBe(24.7)
  })

  it('should handle different weight ranges', () => {
    expect(calculateBMI(50, 170)).toBe(17.3) // Underweight
    expect(calculateBMI(85, 170)).toBe(29.4) // Overweight
  })
})

describe('getBMICategory', () => {
  it('should return Underweight for BMI < 18.5', () => {
    expect(getBMICategory(17)).toBe('Underweight')
    expect(getBMICategory(18.4)).toBe('Underweight')
  })

  it('should return Normal for BMI 18.5-24.9', () => {
    expect(getBMICategory(18.5)).toBe('Normal')
    expect(getBMICategory(22)).toBe('Normal')
    expect(getBMICategory(24.9)).toBe('Normal')
  })

  it('should return Overweight for BMI 25-29.9', () => {
    expect(getBMICategory(25)).toBe('Overweight')
    expect(getBMICategory(28)).toBe('Overweight')
  })

  it('should return Obese for BMI >= 30', () => {
    expect(getBMICategory(30)).toBe('Obese')
    expect(getBMICategory(35)).toBe('Obese')
  })
})

describe('calculateCaloriesBurned', () => {
  it('should calculate calories for running (MET 9.8)', () => {
    const calories = calculateCaloriesBurned(70, 30, 9.8)
    expect(calories).toBeGreaterThan(300)
    expect(calories).toBeLessThan(400)
  })

  it('should calculate calories for walking (MET 3.5)', () => {
    const calories = calculateCaloriesBurned(70, 30, 3.5)
    expect(calories).toBeGreaterThan(100)
    expect(calories).toBeLessThan(150)
  })

  it('should scale with duration', () => {
    const short = calculateCaloriesBurned(70, 15, 5)
    const long = calculateCaloriesBurned(70, 30, 5)
    expect(long).toBe(short * 2)
  })

  it('should scale with weight', () => {
    const light = calculateCaloriesBurned(50, 30, 5)
    const heavy = calculateCaloriesBurned(100, 30, 5)
    expect(heavy).toBe(light * 2)
  })
})

describe('formatDuration', () => {
  it('should format seconds as MM:SS', () => {
    expect(formatDuration(90)).toBe('1:30')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(5)).toBe('0:05')
  })

  it('should format hours as HH:MM:SS', () => {
    expect(formatDuration(3661)).toBe('1:01:01')
    expect(formatDuration(7200)).toBe('2:00:00')
  })

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('should pad minutes and seconds correctly', () => {
    expect(formatDuration(3601)).toBe('1:00:01')
    expect(formatDuration(3660)).toBe('1:01:00')
  })
})
