import { describe, it, expect } from 'vitest'
import {
  calculateOneRepMax,
  calculatePercentage1RM,
  calculateWorkoutVolume,
  getIntensityZone,
  getRecommendedRestTime,
  suggestWeightFromRPE,
  calculateProgressiveOverload,
  getWeeklyVolumeRecommendation,
  calculateHeartRateZones,
  estimateMaxHeartRate,
  getTargetHeartRate,
  type ExerciseSet,
} from '@/lib/fitness'

describe('calculateOneRepMax', () => {
  it('should calculate 1RM using Epley formula', () => {
    // 100kg × 5 reps = 100 × (1 + 5/30) = 116.67 ≈ 117
    expect(calculateOneRepMax(100, 5)).toBe(117)
  })

  it('should return weight for 1 rep', () => {
    expect(calculateOneRepMax(100, 1)).toBe(100)
  })

  it('should return 0 for invalid inputs', () => {
    expect(calculateOneRepMax(0, 5)).toBe(0)
    expect(calculateOneRepMax(100, 0)).toBe(0)
    expect(calculateOneRepMax(-10, 5)).toBe(0)
  })

  it('should handle high rep ranges', () => {
    // 50kg × 20 reps = 50 × (1 + 20/30) = 83.33 ≈ 83
    expect(calculateOneRepMax(50, 20)).toBe(83)
  })
})

describe('calculatePercentage1RM', () => {
  it('should calculate percentage of 1RM', () => {
    expect(calculatePercentage1RM(100, 80)).toBe(80)
    expect(calculatePercentage1RM(100, 75)).toBe(75)
  })

  it('should round to nearest integer', () => {
    expect(calculatePercentage1RM(100, 67)).toBe(67)
  })

  it('should handle 100%', () => {
    expect(calculatePercentage1RM(150, 100)).toBe(150)
  })
})

describe('calculateWorkoutVolume', () => {
  it('should calculate total workout volume', () => {
    const sets: ExerciseSet[] = [
      { weight: 100, reps: 8 },
      { weight: 100, reps: 8 },
      { weight: 100, reps: 6 },
    ]
    
    const result = calculateWorkoutVolume(sets)
    
    expect(result.totalSets).toBe(3)
    expect(result.totalReps).toBe(22)
    expect(result.totalVolume).toBe(2200) // 100×8 + 100×8 + 100×6
    expect(result.avgWeight).toBe(100)
    expect(result.avgReps).toBeCloseTo(7.3, 1)
  })

  it('should handle empty sets array', () => {
    const result = calculateWorkoutVolume([])
    
    expect(result.totalSets).toBe(0)
    expect(result.totalReps).toBe(0)
    expect(result.totalVolume).toBe(0)
    expect(result.avgWeight).toBe(0)
    expect(result.avgReps).toBe(0)
  })

  it('should handle varying weights', () => {
    const sets: ExerciseSet[] = [
      { weight: 80, reps: 10 },
      { weight: 90, reps: 8 },
      { weight: 100, reps: 6 },
    ]
    
    const result = calculateWorkoutVolume(sets)
    
    expect(result.totalSets).toBe(3)
    expect(result.totalVolume).toBe(2120) // 800 + 720 + 600
    expect(result.avgWeight).toBe(90)
  })
})

describe('getIntensityZone', () => {
  it('should return Strength/Power for 90%+', () => {
    expect(getIntensityZone(95)).toBe('Strength/Power')
    expect(getIntensityZone(90)).toBe('Strength/Power')
  })

  it('should return Strength for 80-89%', () => {
    expect(getIntensityZone(85)).toBe('Strength')
    expect(getIntensityZone(80)).toBe('Strength')
  })

  it('should return Hypertrophy for 70-79%', () => {
    expect(getIntensityZone(75)).toBe('Hypertrophy')
    expect(getIntensityZone(70)).toBe('Hypertrophy')
  })

  it('should return Muscular Endurance for 60-69%', () => {
    expect(getIntensityZone(65)).toBe('Muscular Endurance')
    expect(getIntensityZone(60)).toBe('Muscular Endurance')
  })

  it('should return Light/Recovery for under 60%', () => {
    expect(getIntensityZone(50)).toBe('Light/Recovery')
  })
})

describe('getRecommendedRestTime', () => {
  it('should return 5 minutes for 90%+ intensity', () => {
    expect(getRecommendedRestTime(95)).toBe(300)
  })

  it('should return 3 minutes for 80-89% intensity', () => {
    expect(getRecommendedRestTime(85)).toBe(180)
  })

  it('should return 2 minutes for 70-79% intensity', () => {
    expect(getRecommendedRestTime(75)).toBe(120)
  })

  it('should return 1.5 minutes for 60-69% intensity', () => {
    expect(getRecommendedRestTime(65)).toBe(90)
  })

  it('should return 1 minute for light intensity', () => {
    expect(getRecommendedRestTime(50)).toBe(60)
  })
})

describe('suggestWeightFromRPE', () => {
  it('should increase weight when lowering target RPE', () => {
    // Going from RPE 8 to RPE 7 means more reps in reserve
    const suggested = suggestWeightFromRPE(100, 8, 8, 7)
    expect(suggested).toBeGreaterThan(100)
  })

  it('should decrease weight when increasing target RPE', () => {
    // Going from RPE 7 to RPE 8 means fewer reps in reserve
    const suggested = suggestWeightFromRPE(100, 8, 7, 8)
    expect(suggested).toBeLessThan(100)
  })

  it('should round to nearest 2.5kg', () => {
    const suggested = suggestWeightFromRPE(100, 8, 8, 7)
    expect(suggested % 2.5).toBe(0)
  })
})

describe('calculateProgressiveOverload', () => {
  it('should suggest weight increase when reps achieved', () => {
    const result = calculateProgressiveOverload(100, 10, 10, 'weight')
    
    expect(result.weight).toBe(102.5)
    expect(result.reps).toBe(10)
    expect(result.reason).toContain('Increase weight')
  })

  it('should suggest rep increase when using reps progression', () => {
    const result = calculateProgressiveOverload(100, 10, 10, 'reps')
    
    expect(result.weight).toBe(100)
    expect(result.reps).toBe(11)
    expect(result.reason).toContain('Add one rep')
  })

  it('should maintain weight when target not achieved', () => {
    const result = calculateProgressiveOverload(100, 8, 10, 'weight')
    
    expect(result.weight).toBe(100)
    expect(result.reps).toBe(10)
    expect(result.reason).toContain('Maintain current weight')
  })
})

describe('getWeeklyVolumeRecommendation', () => {
  it('should return correct volume for large muscle beginners', () => {
    const result = getWeeklyVolumeRecommendation('large', 'beginner')
    
    expect(result.minSets).toBe(6)
    expect(result.maxSets).toBe(10)
    expect(result.optimal).toBe(8)
  })

  it('should return higher volume for advanced lifters', () => {
    const beginner = getWeeklyVolumeRecommendation('large', 'beginner')
    const advanced = getWeeklyVolumeRecommendation('large', 'advanced')
    
    expect(advanced.optimal).toBeGreaterThan(beginner.optimal)
  })

  it('should return lower volume for small muscles', () => {
    const large = getWeeklyVolumeRecommendation('large', 'intermediate')
    const small = getWeeklyVolumeRecommendation('small', 'intermediate')
    
    expect(small.optimal).toBeLessThan(large.optimal)
  })
})

describe('calculateHeartRateZones', () => {
  it('should calculate correct heart rate zones for max HR 200', () => {
    const zones = calculateHeartRateZones(200)
    
    expect(zones.zone1.min).toBe(100)
    expect(zones.zone1.max).toBe(120)
    expect(zones.zone1.name).toBe('Recovery')
    
    expect(zones.zone2.min).toBe(120)
    expect(zones.zone2.max).toBe(140)
    expect(zones.zone2.name).toBe('Fat Burn')
    
    expect(zones.zone5.max).toBe(200)
    expect(zones.zone5.name).toBe('Max Effort')
  })

  it('should handle different max heart rates', () => {
    const zones = calculateHeartRateZones(180)
    
    expect(zones.zone1.min).toBe(90) // 50% of 180
    expect(zones.zone3.min).toBe(126) // 70% of 180
    expect(zones.zone5.max).toBe(180)
  })
})

describe('estimateMaxHeartRate', () => {
  it('should calculate max HR using Tanaka formula', () => {
    // 208 - (0.7 × 30) = 208 - 21 = 187
    expect(estimateMaxHeartRate(30)).toBe(187)
  })

  it('should decrease with age', () => {
    const young = estimateMaxHeartRate(20)
    const old = estimateMaxHeartRate(50)
    
    expect(young).toBeGreaterThan(old)
  })

  it('should return reasonable values for typical ages', () => {
    expect(estimateMaxHeartRate(25)).toBeGreaterThan(180)
    expect(estimateMaxHeartRate(60)).toBeLessThan(170)
  })
})

describe('getTargetHeartRate', () => {
  it('should calculate target HR for specific zone', () => {
    // 30 years old: max HR = 187
    // 70% zone = 130.9 ≈ 131
    expect(getTargetHeartRate(30, 70)).toBe(131)
  })

  it('should return max HR for 100%', () => {
    const maxHR = estimateMaxHeartRate(30)
    expect(getTargetHeartRate(30, 100)).toBe(maxHR)
  })

  it('should return half max HR for 50%', () => {
    const maxHR = estimateMaxHeartRate(30)
    expect(getTargetHeartRate(30, 50)).toBe(Math.round(maxHR * 0.5))
  })
})
