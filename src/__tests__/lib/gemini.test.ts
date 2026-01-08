import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the Google Generative AI module
const mockGenerateContent = vi.fn()
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}))

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}))

// Import after mocking
import { getSalesResponse } from '@/lib/gemini'

describe('Gemini AI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getSalesResponse', () => {
    it('should return a response with text and suggestPlan', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Hello! I can help you with your fitness journey.',
        },
      })

      const result = await getSalesResponse('Hi there')
      
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('suggestPlan')
      expect(typeof result.text).toBe('string')
      expect(typeof result.suggestPlan).toBe('boolean')
    })

    it('should suggest plan when message contains "weight"', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'I can help you with weight loss goals!',
        },
      })

      const result = await getSalesResponse('I want to lose weight')
      
      expect(result.suggestPlan).toBe(true)
    })

    it('should suggest plan when message contains "muscle"', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Great goal! Building muscle requires proper training.',
        },
      })

      const result = await getSalesResponse('I want to build muscle')
      
      expect(result.suggestPlan).toBe(true)
    })

    it('should suggest plan when message contains "workout"', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Lets create a workout plan for you!',
        },
      })

      const result = await getSalesResponse('I need a good workout routine')
      
      expect(result.suggestPlan).toBe(true)
    })

    it('should suggest plan when message contains "exercise"', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Exercise is key to a healthy lifestyle.',
        },
      })

      const result = await getSalesResponse('What exercises should I do?')
      
      expect(result.suggestPlan).toBe(true)
    })

    it('should suggest plan when message contains "strength"', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Strength training is important for everyone.',
        },
      })

      const result = await getSalesResponse('I want to improve my strength')
      
      expect(result.suggestPlan).toBe(true)
    })

    it('should suggest plan when message contains "fitness"', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Your fitness journey starts here!',
        },
      })

      const result = await getSalesResponse('Help me get fit')
      
      expect(result.suggestPlan).toBe(true)
    })

    it('should suggest plan when message contains "health"', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Health is wealth! Let me help you.',
        },
      })

      const result = await getSalesResponse('I want to improve my health')
      
      expect(result.suggestPlan).toBe(true)
    })

    it('should suggest plan when message contains "train"', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Lets start your training program!',
        },
      })

      const result = await getSalesResponse('I want to train for a marathon')
      
      expect(result.suggestPlan).toBe(true)
    })

    it('should NOT suggest plan for unrelated messages', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Hello! How can I assist you today?',
        },
      })

      const result = await getSalesResponse('What is the weather like?')
      
      expect(result.suggestPlan).toBe(false)
    })

    it('should return fallback response on API error', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'))

      const result = await getSalesResponse('Hello')
      
      expect(result.text).toContain('happy to help')
      expect(result.suggestPlan).toBe(false)
    })

    it('should handle empty message', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'How can I help you today?',
        },
      })

      const result = await getSalesResponse('')
      
      expect(result).toHaveProperty('text')
      expect(result.suggestPlan).toBe(false)
    })

    it('should be case insensitive for keyword detection', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Great! Lets work on your weight goals.',
        },
      })

      const result = await getSalesResponse('WEIGHT LOSS please')
      
      expect(result.suggestPlan).toBe(true)
    })
  })
})

describe('Gemini API Model Configuration', () => {
  it('should use gemini-2.0-flash model', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'Test response',
      },
    })

    await getSalesResponse('test')
    
    expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-2.0-flash' })
  })
})
