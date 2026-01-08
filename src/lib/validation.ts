/**
 * Validation utilities for form inputs and data
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  return { isValid: true }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' }
  }
  
  return { isValid: true }
}

/**
 * Validate username format
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Username is required' }
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' }
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be 20 characters or less' }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  
  return { isValid: true }
}

/**
 * Validate age (for fitness app context)
 */
export function validateAge(age: number): ValidationResult {
  if (isNaN(age) || age === null || age === undefined) {
    return { isValid: false, error: 'Age is required' }
  }
  
  if (!Number.isInteger(age)) {
    return { isValid: false, error: 'Age must be a whole number' }
  }
  
  if (age < 13) {
    return { isValid: false, error: 'You must be at least 13 years old' }
  }
  
  if (age > 120) {
    return { isValid: false, error: 'Please enter a valid age' }
  }
  
  return { isValid: true }
}

/**
 * Validate weight in kg
 */
export function validateWeight(weight: number): ValidationResult {
  if (isNaN(weight) || weight === null || weight === undefined) {
    return { isValid: false, error: 'Weight is required' }
  }
  
  if (weight <= 0) {
    return { isValid: false, error: 'Weight must be greater than 0' }
  }
  
  if (weight < 20) {
    return { isValid: false, error: 'Please enter a valid weight (min 20 kg)' }
  }
  
  if (weight > 500) {
    return { isValid: false, error: 'Please enter a valid weight (max 500 kg)' }
  }
  
  return { isValid: true }
}

/**
 * Validate height in cm
 */
export function validateHeight(height: number): ValidationResult {
  if (isNaN(height) || height === null || height === undefined) {
    return { isValid: false, error: 'Height is required' }
  }
  
  if (height <= 0) {
    return { isValid: false, error: 'Height must be greater than 0' }
  }
  
  if (height < 50) {
    return { isValid: false, error: 'Please enter a valid height (min 50 cm)' }
  }
  
  if (height > 300) {
    return { isValid: false, error: 'Please enter a valid height (max 300 cm)' }
  }
  
  return { isValid: true }
}

/**
 * Validate workout duration in minutes
 */
export function validateDuration(duration: number): ValidationResult {
  if (isNaN(duration) || duration === null || duration === undefined) {
    return { isValid: false, error: 'Duration is required' }
  }
  
  if (!Number.isInteger(duration)) {
    return { isValid: false, error: 'Duration must be a whole number' }
  }
  
  if (duration < 1) {
    return { isValid: false, error: 'Duration must be at least 1 minute' }
  }
  
  if (duration > 480) {
    return { isValid: false, error: 'Duration cannot exceed 8 hours (480 minutes)' }
  }
  
  return { isValid: true }
}

/**
 * Validate exercise sets/reps
 */
export function validateSetsReps(value: number, type: 'sets' | 'reps'): ValidationResult {
  if (isNaN(value) || value === null || value === undefined) {
    return { isValid: false, error: `${type === 'sets' ? 'Sets' : 'Reps'} is required` }
  }
  
  if (!Number.isInteger(value)) {
    return { isValid: false, error: `${type === 'sets' ? 'Sets' : 'Reps'} must be a whole number` }
  }
  
  if (value < 1) {
    return { isValid: false, error: `${type === 'sets' ? 'Sets' : 'Reps'} must be at least 1` }
  }
  
  const maxValue = type === 'sets' ? 20 : 100
  if (value > maxValue) {
    return { 
      isValid: false, 
      error: `${type === 'sets' ? 'Sets' : 'Reps'} cannot exceed ${maxValue}` 
    }
  }
  
  return { isValid: true }
}

/**
 * Validate a date string
 */
export function validateDate(dateString: string): ValidationResult {
  if (!dateString || dateString.trim().length === 0) {
    return { isValid: false, error: 'Date is required' }
  }
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' }
  }
  
  const now = new Date()
  if (date > now) {
    return { isValid: false, error: 'Date cannot be in the future' }
  }
  
  const hundredYearsAgo = new Date()
  hundredYearsAgo.setFullYear(now.getFullYear() - 100)
  
  if (date < hundredYearsAgo) {
    return { isValid: false, error: 'Please enter a valid date' }
  }
  
  return { isValid: true }
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  return { isValid: true }
}

/**
 * Validate string length
 */
export function validateLength(
  value: string, 
  fieldName: string,
  options: { min?: number; max?: number }
): ValidationResult {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  const { min, max } = options
  
  if (min !== undefined && value.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` }
  }
  
  if (max !== undefined && value.length > max) {
    return { isValid: false, error: `${fieldName} must be ${max} characters or less` }
  }
  
  return { isValid: true }
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' }
  }
  
  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' }
  }
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' }
  }
  
  // Remove spaces, dashes, and parentheses for validation
  const cleaned = phone.replace(/[\s\-()]/g, '')
  
  // Check for valid phone format (at least 10 digits, optionally starting with +)
  if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid phone number' }
  }
  
  return { isValid: true }
}
