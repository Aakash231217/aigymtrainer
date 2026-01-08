/**
 * Fitness calculation utilities for AI Gym Trainer
 */

export interface ExerciseSet {
  weight: number
  reps: number
  rpe?: number // Rate of Perceived Exertion (1-10)
}

export interface WorkoutVolume {
  totalSets: number
  totalReps: number
  totalVolume: number // weight × reps
  avgWeight: number
  avgReps: number
}

/**
 * Calculate estimated 1 Rep Max using Epley formula
 * 1RM = weight × (1 + reps/30)
 */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

/**
 * Calculate weight for a given percentage of 1RM
 */
export function calculatePercentage1RM(oneRepMax: number, percentage: number): number {
  return Math.round(oneRepMax * (percentage / 100))
}

/**
 * Calculate total workout volume from sets
 */
export function calculateWorkoutVolume(sets: ExerciseSet[]): WorkoutVolume {
  if (sets.length === 0) {
    return {
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      avgWeight: 0,
      avgReps: 0,
    }
  }

  const totalSets = sets.length
  const totalReps = sets.reduce((sum, set) => sum + set.reps, 0)
  const totalVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0)
  const avgWeight = sets.reduce((sum, set) => sum + set.weight, 0) / totalSets
  const avgReps = totalReps / totalSets

  return {
    totalSets,
    totalReps,
    totalVolume: Math.round(totalVolume),
    avgWeight: Math.round(avgWeight * 10) / 10,
    avgReps: Math.round(avgReps * 10) / 10,
  }
}

/**
 * Calculate training intensity zone based on 1RM percentage
 */
export function getIntensityZone(percentage: number): string {
  if (percentage >= 90) return 'Strength/Power'
  if (percentage >= 80) return 'Strength'
  if (percentage >= 70) return 'Hypertrophy'
  if (percentage >= 60) return 'Muscular Endurance'
  return 'Light/Recovery'
}

/**
 * Calculate rest time recommendation based on intensity
 */
export function getRecommendedRestTime(percentage: number): number {
  if (percentage >= 90) return 300 // 5 minutes
  if (percentage >= 80) return 180 // 3 minutes
  if (percentage >= 70) return 120 // 2 minutes
  if (percentage >= 60) return 90 // 1.5 minutes
  return 60 // 1 minute
}

/**
 * Calculate RPE-based weight suggestion
 * RPE 10 = failure, RPE 7 = 3 reps in reserve
 */
export function suggestWeightFromRPE(
  lastWeight: number,
  targetReps: number,
  lastRPE: number,
  targetRPE: number
): number {
  const rpeToRIR = (rpe: number) => Math.max(0, 10 - rpe) // Reps in Reserve
  const lastRIR = rpeToRIR(lastRPE)
  const targetRIR = rpeToRIR(targetRPE)
  const repsDiff = targetRIR - lastRIR
  
  // Adjust ~2.5% per rep difference
  const adjustment = 1 + (repsDiff * -0.025)
  return Math.round(lastWeight * adjustment / 2.5) * 2.5
}

/**
 * Calculate progressive overload suggestion
 */
export function calculateProgressiveOverload(
  currentWeight: number,
  completedReps: number,
  targetReps: number,
  progressionType: 'weight' | 'reps' = 'weight'
): { weight: number; reps: number; reason: string } {
  if (completedReps >= targetReps) {
    if (progressionType === 'weight') {
      return {
        weight: currentWeight + 2.5,
        reps: targetReps,
        reason: 'Increase weight by 2.5kg as target reps achieved'
      }
    }
    return {
      weight: currentWeight,
      reps: targetReps + 1,
      reason: 'Add one rep as target achieved'
    }
  }
  
  return {
    weight: currentWeight,
    reps: targetReps,
    reason: 'Maintain current weight until target reps achieved'
  }
}

/**
 * Calculate weekly training volume recommendations
 */
export function getWeeklyVolumeRecommendation(
  muscleGroup: 'large' | 'small',
  experience: 'beginner' | 'intermediate' | 'advanced'
): { minSets: number; maxSets: number; optimal: number } {
  const volumeMatrix = {
    large: {
      beginner: { minSets: 6, maxSets: 10, optimal: 8 },
      intermediate: { minSets: 10, maxSets: 16, optimal: 12 },
      advanced: { minSets: 16, maxSets: 22, optimal: 18 },
    },
    small: {
      beginner: { minSets: 4, maxSets: 8, optimal: 6 },
      intermediate: { minSets: 8, maxSets: 12, optimal: 10 },
      advanced: { minSets: 12, maxSets: 16, optimal: 14 },
    },
  }
  
  return volumeMatrix[muscleGroup][experience]
}

/**
 * Calculate heart rate zones based on max heart rate
 */
export function calculateHeartRateZones(maxHeartRate: number): {
  zone1: { min: number; max: number; name: string }
  zone2: { min: number; max: number; name: string }
  zone3: { min: number; max: number; name: string }
  zone4: { min: number; max: number; name: string }
  zone5: { min: number; max: number; name: string }
} {
  return {
    zone1: {
      min: Math.round(maxHeartRate * 0.5),
      max: Math.round(maxHeartRate * 0.6),
      name: 'Recovery',
    },
    zone2: {
      min: Math.round(maxHeartRate * 0.6),
      max: Math.round(maxHeartRate * 0.7),
      name: 'Fat Burn',
    },
    zone3: {
      min: Math.round(maxHeartRate * 0.7),
      max: Math.round(maxHeartRate * 0.8),
      name: 'Cardio',
    },
    zone4: {
      min: Math.round(maxHeartRate * 0.8),
      max: Math.round(maxHeartRate * 0.9),
      name: 'Anaerobic',
    },
    zone5: {
      min: Math.round(maxHeartRate * 0.9),
      max: maxHeartRate,
      name: 'Max Effort',
    },
  }
}

/**
 * Estimate max heart rate based on age
 */
export function estimateMaxHeartRate(age: number): number {
  // Using Tanaka formula: 208 - (0.7 × age)
  return Math.round(208 - 0.7 * age)
}

/**
 * Calculate target heart rate for a specific zone
 */
export function getTargetHeartRate(
  age: number,
  zonePercentage: number
): number {
  const maxHR = estimateMaxHeartRate(age)
  return Math.round(maxHR * (zonePercentage / 100))
}
