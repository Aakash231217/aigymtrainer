import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateAge,
  validateWeight,
  validateHeight,
  validateDuration,
  validateSetsReps,
  validateDate,
  validateRequired,
  validateLength,
  validateUrl,
  validatePhone,
} from '@/lib/validation'

describe('validateEmail', () => {
  it('should validate correct email formats', () => {
    expect(validateEmail('test@example.com').isValid).toBe(true)
    expect(validateEmail('user.name@domain.co.uk').isValid).toBe(true)
    expect(validateEmail('user+tag@example.org').isValid).toBe(true)
  })

  it('should reject invalid email formats', () => {
    expect(validateEmail('invalid').isValid).toBe(false)
    expect(validateEmail('missing@domain').isValid).toBe(false)
    expect(validateEmail('@nodomain.com').isValid).toBe(false)
    expect(validateEmail('spaces in@email.com').isValid).toBe(false)
  })

  it('should reject empty email', () => {
    expect(validateEmail('').isValid).toBe(false)
    expect(validateEmail('   ').isValid).toBe(false)
  })

  it('should provide appropriate error messages', () => {
    expect(validateEmail('').error).toBe('Email is required')
    expect(validateEmail('invalid').error).toBe('Please enter a valid email address')
  })
})

describe('validatePassword', () => {
  it('should validate strong passwords', () => {
    expect(validatePassword('Password1').isValid).toBe(true)
    expect(validatePassword('MySecure123Password').isValid).toBe(true)
  })

  it('should reject short passwords', () => {
    const result = validatePassword('Pass1')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('at least 8 characters')
  })

  it('should require uppercase letter', () => {
    const result = validatePassword('password1')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('uppercase')
  })

  it('should require lowercase letter', () => {
    const result = validatePassword('PASSWORD1')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('lowercase')
  })

  it('should require number', () => {
    const result = validatePassword('PasswordOnly')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('number')
  })

  it('should reject empty password', () => {
    expect(validatePassword('').isValid).toBe(false)
    expect(validatePassword('').error).toBe('Password is required')
  })
})

describe('validateUsername', () => {
  it('should validate correct usernames', () => {
    expect(validateUsername('john_doe').isValid).toBe(true)
    expect(validateUsername('User123').isValid).toBe(true)
    expect(validateUsername('abc').isValid).toBe(true)
  })

  it('should reject too short usernames', () => {
    const result = validateUsername('ab')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('at least 3 characters')
  })

  it('should reject too long usernames', () => {
    const result = validateUsername('a'.repeat(21))
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('20 characters')
  })

  it('should reject special characters', () => {
    expect(validateUsername('user@name').isValid).toBe(false)
    expect(validateUsername('user name').isValid).toBe(false)
    expect(validateUsername('user-name').isValid).toBe(false)
  })

  it('should reject empty username', () => {
    expect(validateUsername('').isValid).toBe(false)
  })
})

describe('validateAge', () => {
  it('should validate valid ages', () => {
    expect(validateAge(25).isValid).toBe(true)
    expect(validateAge(13).isValid).toBe(true)
    expect(validateAge(100).isValid).toBe(true)
  })

  it('should reject ages under 13', () => {
    const result = validateAge(12)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('at least 13')
  })

  it('should reject unrealistic ages', () => {
    const result = validateAge(121)
    expect(result.isValid).toBe(false)
  })

  it('should reject non-integer ages', () => {
    const result = validateAge(25.5)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('whole number')
  })

  it('should reject NaN', () => {
    expect(validateAge(NaN).isValid).toBe(false)
  })
})

describe('validateWeight', () => {
  it('should validate valid weights', () => {
    expect(validateWeight(70).isValid).toBe(true)
    expect(validateWeight(45.5).isValid).toBe(true)
    expect(validateWeight(150).isValid).toBe(true)
  })

  it('should reject weights below minimum', () => {
    const result = validateWeight(15)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('min 20')
  })

  it('should reject weights above maximum', () => {
    const result = validateWeight(501)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('max 500')
  })

  it('should reject zero or negative weights', () => {
    expect(validateWeight(0).isValid).toBe(false)
    expect(validateWeight(-10).isValid).toBe(false)
  })
})

describe('validateHeight', () => {
  it('should validate valid heights', () => {
    expect(validateHeight(175).isValid).toBe(true)
    expect(validateHeight(150.5).isValid).toBe(true)
    expect(validateHeight(200).isValid).toBe(true)
  })

  it('should reject heights below minimum', () => {
    const result = validateHeight(40)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('min 50')
  })

  it('should reject heights above maximum', () => {
    const result = validateHeight(301)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('max 300')
  })

  it('should reject zero or negative heights', () => {
    expect(validateHeight(0).isValid).toBe(false)
    expect(validateHeight(-175).isValid).toBe(false)
  })
})

describe('validateDuration', () => {
  it('should validate valid durations', () => {
    expect(validateDuration(30).isValid).toBe(true)
    expect(validateDuration(1).isValid).toBe(true)
    expect(validateDuration(480).isValid).toBe(true)
  })

  it('should reject durations below minimum', () => {
    const result = validateDuration(0)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('at least 1')
  })

  it('should reject durations above maximum', () => {
    const result = validateDuration(481)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('8 hours')
  })

  it('should reject non-integer durations', () => {
    const result = validateDuration(30.5)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('whole number')
  })
})

describe('validateSetsReps', () => {
  it('should validate valid sets', () => {
    expect(validateSetsReps(3, 'sets').isValid).toBe(true)
    expect(validateSetsReps(1, 'sets').isValid).toBe(true)
    expect(validateSetsReps(20, 'sets').isValid).toBe(true)
  })

  it('should validate valid reps', () => {
    expect(validateSetsReps(10, 'reps').isValid).toBe(true)
    expect(validateSetsReps(1, 'reps').isValid).toBe(true)
    expect(validateSetsReps(100, 'reps').isValid).toBe(true)
  })

  it('should reject sets above maximum', () => {
    const result = validateSetsReps(21, 'sets')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('20')
  })

  it('should reject reps above maximum', () => {
    const result = validateSetsReps(101, 'reps')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('100')
  })

  it('should reject zero values', () => {
    expect(validateSetsReps(0, 'sets').isValid).toBe(false)
    expect(validateSetsReps(0, 'reps').isValid).toBe(false)
  })

  it('should reject non-integer values', () => {
    expect(validateSetsReps(3.5, 'sets').isValid).toBe(false)
    expect(validateSetsReps(10.5, 'reps').isValid).toBe(false)
  })
})

describe('validateDate', () => {
  it('should validate valid dates', () => {
    expect(validateDate('2024-01-15').isValid).toBe(true)
    expect(validateDate('2000-12-31').isValid).toBe(true)
  })

  it('should reject future dates', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const result = validateDate(futureDate.toISOString())
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('future')
  })

  it('should reject invalid date strings', () => {
    expect(validateDate('not-a-date').isValid).toBe(false)
    expect(validateDate('2024-13-45').isValid).toBe(false)
  })

  it('should reject empty date', () => {
    expect(validateDate('').isValid).toBe(false)
  })
})

describe('validateRequired', () => {
  it('should validate non-empty values', () => {
    expect(validateRequired('value', 'Field').isValid).toBe(true)
  })

  it('should reject empty values', () => {
    const result = validateRequired('', 'Name')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Name is required')
  })

  it('should reject whitespace-only values', () => {
    expect(validateRequired('   ', 'Field').isValid).toBe(false)
  })
})

describe('validateLength', () => {
  it('should validate values within range', () => {
    expect(validateLength('hello', 'Field', { min: 3, max: 10 }).isValid).toBe(true)
  })

  it('should reject values below minimum', () => {
    const result = validateLength('ab', 'Name', { min: 3 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('at least 3')
  })

  it('should reject values above maximum', () => {
    const result = validateLength('too long', 'Name', { max: 5 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('5 characters')
  })
})

describe('validateUrl', () => {
  it('should validate correct URLs', () => {
    expect(validateUrl('https://example.com').isValid).toBe(true)
    expect(validateUrl('http://localhost:3000').isValid).toBe(true)
    expect(validateUrl('https://sub.domain.com/path?query=1').isValid).toBe(true)
  })

  it('should reject invalid URLs', () => {
    expect(validateUrl('not-a-url').isValid).toBe(false)
    expect(validateUrl('example.com').isValid).toBe(false)
  })

  it('should reject empty URL', () => {
    expect(validateUrl('').isValid).toBe(false)
  })
})

describe('validatePhone', () => {
  it('should validate correct phone numbers', () => {
    expect(validatePhone('1234567890').isValid).toBe(true)
    expect(validatePhone('+1 234 567 8901').isValid).toBe(true)
    expect(validatePhone('(123) 456-7890').isValid).toBe(true)
  })

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123').isValid).toBe(false)
    expect(validatePhone('abcdefghij').isValid).toBe(false)
  })

  it('should reject empty phone', () => {
    expect(validatePhone('').isValid).toBe(false)
  })
})
