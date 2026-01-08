import { describe, it, expect } from 'vitest'
import { USER_PROGRAMS } from '@/constants'

describe('USER_PROGRAMS Constants', () => {
  it('should export USER_PROGRAMS array', () => {
    expect(USER_PROGRAMS).toBeDefined()
    expect(Array.isArray(USER_PROGRAMS)).toBe(true)
  })

  it('should have at least 3 user programs', () => {
    expect(USER_PROGRAMS.length).toBeGreaterThanOrEqual(3)
  })

  it('should have valid structure for each user program', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program).toHaveProperty('id')
      expect(program).toHaveProperty('first_name')
      expect(program).toHaveProperty('fitness_goal')
      expect(program).toHaveProperty('height')
      expect(program).toHaveProperty('weight')
      expect(program).toHaveProperty('age')
      expect(program).toHaveProperty('workout_days')
      expect(program).toHaveProperty('fitness_level')
      expect(program).toHaveProperty('equipment_access')
      expect(program).toHaveProperty('workout_plan')
      expect(program).toHaveProperty('diet_plan')
    })
  })

  it('should have unique IDs for each program', () => {
    const ids = USER_PROGRAMS.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have valid workout_days between 1 and 7', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program.workout_days).toBeGreaterThanOrEqual(1)
      expect(program.workout_days).toBeLessThanOrEqual(7)
    })
  })

  it('should have valid age for each user', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program.age).toBeGreaterThan(0)
      expect(program.age).toBeLessThan(120)
    })
  })

  it('should have valid fitness levels', () => {
    const validLevels = ['Beginner', 'Intermediate', 'Advanced']
    USER_PROGRAMS.forEach((program) => {
      expect(validLevels).toContain(program.fitness_level)
    })
  })

  it('should have valid fitness goals', () => {
    const validGoals = ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Strength', 'Endurance']
    USER_PROGRAMS.forEach((program) => {
      expect(validGoals).toContain(program.fitness_goal)
    })
  })
})

describe('Workout Plan Structure', () => {
  it('should have title and description for each workout plan', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program.workout_plan).toHaveProperty('title')
      expect(program.workout_plan).toHaveProperty('description')
      expect(typeof program.workout_plan.title).toBe('string')
      expect(typeof program.workout_plan.description).toBe('string')
    })
  })

  it('should have weekly schedule with valid days', () => {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    USER_PROGRAMS.forEach((program) => {
      expect(program.workout_plan).toHaveProperty('weekly_schedule')
      expect(Array.isArray(program.workout_plan.weekly_schedule)).toBe(true)
      
      program.workout_plan.weekly_schedule.forEach((schedule) => {
        expect(validDays).toContain(schedule.day)
        expect(schedule).toHaveProperty('focus')
        expect(schedule).toHaveProperty('duration')
      })
    })
  })

  it('should have schedule length matching workout_days', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program.workout_plan.weekly_schedule.length).toBe(program.workout_days)
    })
  })
})

describe('Diet Plan Structure', () => {
  it('should have title and description for each diet plan', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program.diet_plan).toHaveProperty('title')
      expect(program.diet_plan).toHaveProperty('description')
      expect(typeof program.diet_plan.title).toBe('string')
      expect(typeof program.diet_plan.description).toBe('string')
    })
  })

  it('should have daily calories specified', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program.diet_plan).toHaveProperty('daily_calories')
      expect(typeof program.diet_plan.daily_calories).toBe('string')
    })
  })

  it('should have macros with protein, carbs, and fats', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program.diet_plan).toHaveProperty('macros')
      expect(program.diet_plan.macros).toHaveProperty('protein')
      expect(program.diet_plan.macros).toHaveProperty('carbs')
      expect(program.diet_plan.macros).toHaveProperty('fats')
    })
  })

  it('should have meal examples array', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program.diet_plan).toHaveProperty('meal_examples')
      expect(Array.isArray(program.diet_plan.meal_examples)).toBe(true)
      expect(program.diet_plan.meal_examples.length).toBeGreaterThan(0)
    })
  })

  it('should have valid meal structure', () => {
    USER_PROGRAMS.forEach((program) => {
      program.diet_plan.meal_examples.forEach((meal) => {
        expect(meal).toHaveProperty('meal')
        expect(meal).toHaveProperty('example')
        expect(typeof meal.meal).toBe('string')
        expect(typeof meal.example).toBe('string')
      })
    })
  })
})

describe('User Profile Data', () => {
  it('should have profile picture URL for each user', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(program).toHaveProperty('profilePic')
      expect(program.profilePic).toMatch(/^https?:\/\//)
    })
  })

  it('should have first name as non-empty string', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(typeof program.first_name).toBe('string')
      expect(program.first_name.length).toBeGreaterThan(0)
    })
  })

  it('should have height in valid format', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(typeof program.height).toBe('string')
      expect(program.height.length).toBeGreaterThan(0)
    })
  })

  it('should have weight in valid format', () => {
    USER_PROGRAMS.forEach((program) => {
      expect(typeof program.weight).toBe('string')
      expect(program.weight.length).toBeGreaterThan(0)
    })
  })
})
