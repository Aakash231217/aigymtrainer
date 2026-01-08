/**
 * Comprehensive Fitness Calculations Library
 * Contains all formulas and utilities for fitness tracking
 */

// Types
export interface UserMetrics {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  bodyFatPercentage?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  neckCircumference?: number;
}

export interface WorkoutMetrics {
  exerciseType: ExerciseType;
  duration: number; // minutes
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
  heartRate?: number;
  weight?: number;
  reps?: number;
  sets?: number;
  distance?: number; // km
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

export interface ProgressMetrics {
  currentWeight: number;
  targetWeight: number;
  startWeight: number;
  startDate: Date;
  targetDate: Date;
  weeklyWeightChange: number[];
}

export type ActivityLevel = 
  | 'sedentary' 
  | 'lightly_active' 
  | 'moderately_active' 
  | 'very_active' 
  | 'extra_active';

export type ExerciseType = 
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'weightlifting'
  | 'hiit'
  | 'yoga'
  | 'pilates'
  | 'rowing'
  | 'jump_rope'
  | 'elliptical'
  | 'stair_climbing'
  | 'boxing'
  | 'martial_arts'
  | 'dancing'
  | 'basketball'
  | 'soccer'
  | 'tennis'
  | 'volleyball'
  | 'golf'
  | 'stretching'
  | 'calisthenics';

export type FitnessGoal = 
  | 'weight_loss'
  | 'muscle_gain'
  | 'maintenance'
  | 'endurance'
  | 'strength'
  | 'flexibility'
  | 'general_fitness';

// Activity Level Multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,           // Little or no exercise
  lightly_active: 1.375,    // Light exercise 1-3 days/week
  moderately_active: 1.55,  // Moderate exercise 3-5 days/week
  very_active: 1.725,       // Hard exercise 6-7 days/week
  extra_active: 1.9,        // Very hard exercise & physical job
};

// MET values for different exercises
const MET_VALUES: Record<ExerciseType, Record<string, number>> = {
  running: { low: 6.0, moderate: 9.8, high: 11.5, very_high: 14.5 },
  walking: { low: 2.5, moderate: 3.5, high: 4.5, very_high: 5.0 },
  cycling: { low: 4.0, moderate: 6.8, high: 10.0, very_high: 12.0 },
  swimming: { low: 4.5, moderate: 6.0, high: 8.3, very_high: 10.0 },
  weightlifting: { low: 3.0, moderate: 5.0, high: 6.0, very_high: 6.0 },
  hiit: { low: 6.0, moderate: 8.0, high: 10.0, very_high: 12.0 },
  yoga: { low: 2.0, moderate: 3.0, high: 4.0, very_high: 5.0 },
  pilates: { low: 3.0, moderate: 4.0, high: 5.0, very_high: 6.0 },
  rowing: { low: 4.8, moderate: 7.0, high: 8.5, very_high: 12.0 },
  jump_rope: { low: 8.8, moderate: 11.0, high: 12.3, very_high: 14.0 },
  elliptical: { low: 4.6, moderate: 6.0, high: 7.7, very_high: 9.0 },
  stair_climbing: { low: 4.0, moderate: 6.0, high: 8.8, very_high: 10.0 },
  boxing: { low: 5.5, moderate: 7.8, high: 9.0, very_high: 12.0 },
  martial_arts: { low: 5.0, moderate: 7.0, high: 10.0, very_high: 12.0 },
  dancing: { low: 3.0, moderate: 5.0, high: 7.0, very_high: 9.0 },
  basketball: { low: 4.5, moderate: 6.5, high: 8.0, very_high: 10.0 },
  soccer: { low: 5.0, moderate: 7.0, high: 9.0, very_high: 11.0 },
  tennis: { low: 4.5, moderate: 6.0, high: 8.0, very_high: 10.0 },
  volleyball: { low: 3.0, moderate: 4.0, high: 6.0, very_high: 8.0 },
  golf: { low: 3.5, moderate: 4.3, high: 5.3, very_high: 6.0 },
  stretching: { low: 2.3, moderate: 2.5, high: 3.0, very_high: 3.5 },
  calisthenics: { low: 3.5, moderate: 5.0, high: 7.0, very_high: 8.0 },
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * This is the most accurate formula for most people
 */
export function calculateBMR(metrics: UserMetrics): number {
  const { weight, height, age, gender } = metrics;
  
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

/**
 * Calculate BMR using Harris-Benedict Equation (alternative)
 */
export function calculateBMRHarrisBenedict(metrics: UserMetrics): number {
  const { weight, height, age, gender } = metrics;
  
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

/**
 * Calculate BMR using Katch-McArdle Formula (requires body fat %)
 * Most accurate when body fat percentage is known
 */
export function calculateBMRKatchMcArdle(weight: number, bodyFatPercentage: number): number {
  const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
  return 370 + (21.6 * leanBodyMass);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(metrics: UserMetrics): number {
  const bmr = calculateBMR(metrics);
  return bmr * ACTIVITY_MULTIPLIERS[metrics.activityLevel];
}

/**
 * Calculate Body Mass Index (BMI)
 */
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Get BMI Category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese Class I';
  if (bmi < 40) return 'Obese Class II';
  return 'Obese Class III';
}

/**
 * Calculate Ideal Body Weight using multiple formulas
 */
export function calculateIdealBodyWeight(height: number, gender: 'male' | 'female'): {
  devine: number;
  robinson: number;
  miller: number;
  hamwi: number;
  average: number;
} {
  const heightInInches = height / 2.54;
  const inchesOver5Feet = Math.max(0, heightInInches - 60);

  let devine: number, robinson: number, miller: number, hamwi: number;

  if (gender === 'male') {
    devine = 50 + (2.3 * inchesOver5Feet);
    robinson = 52 + (1.9 * inchesOver5Feet);
    miller = 56.2 + (1.41 * inchesOver5Feet);
    hamwi = 48 + (2.7 * inchesOver5Feet);
  } else {
    devine = 45.5 + (2.3 * inchesOver5Feet);
    robinson = 49 + (1.7 * inchesOver5Feet);
    miller = 53.1 + (1.36 * inchesOver5Feet);
    hamwi = 45.5 + (2.2 * inchesOver5Feet);
  }

  return {
    devine,
    robinson,
    miller,
    hamwi,
    average: (devine + robinson + miller + hamwi) / 4,
  };
}

/**
 * Calculate Body Fat Percentage using US Navy Method
 */
export function calculateBodyFatNavyMethod(
  waist: number,
  neck: number,
  height: number,
  hip: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }
}

/**
 * Calculate Lean Body Mass
 */
export function calculateLeanBodyMass(weight: number, bodyFatPercentage: number): number {
  return weight * (1 - bodyFatPercentage / 100);
}

/**
 * Calculate Fat Mass
 */
export function calculateFatMass(weight: number, bodyFatPercentage: number): number {
  return weight * (bodyFatPercentage / 100);
}

/**
 * Calculate calories burned during exercise
 */
export function calculateCaloriesBurned(
  weight: number,
  workout: WorkoutMetrics
): number {
  const met = MET_VALUES[workout.exerciseType][workout.intensity];
  // Formula: Calories = MET × weight (kg) × time (hours)
  return met * weight * (workout.duration / 60);
}

/**
 * Calculate calories burned with heart rate (more accurate)
 */
export function calculateCaloriesBurnedWithHeartRate(
  heartRate: number,
  weight: number,
  age: number,
  gender: 'male' | 'female',
  duration: number
): number {
  if (gender === 'male') {
    return ((age * 0.2017) + (weight * 0.1988) + (heartRate * 0.6309) - 55.0969) * (duration / 4.184);
  } else {
    return ((age * 0.074) + (weight * 0.1263) + (heartRate * 0.4472) - 20.4022) * (duration / 4.184);
  }
}

/**
 * Calculate macro nutrient distribution based on goal
 */
export function calculateMacros(
  tdee: number,
  goal: FitnessGoal,
  weight: number
): NutritionGoals {
  let calories: number;
  let proteinPerKg: number;
  let fatPercentage: number;

  switch (goal) {
    case 'weight_loss':
      calories = tdee * 0.8; // 20% deficit
      proteinPerKg = 2.2; // Higher protein to preserve muscle
      fatPercentage = 0.25;
      break;
    case 'muscle_gain':
      calories = tdee * 1.1; // 10% surplus
      proteinPerKg = 2.0;
      fatPercentage = 0.25;
      break;
    case 'strength':
      calories = tdee * 1.05; // 5% surplus
      proteinPerKg = 2.2;
      fatPercentage = 0.30;
      break;
    case 'endurance':
      calories = tdee * 1.0;
      proteinPerKg = 1.6;
      fatPercentage = 0.25;
      break;
    case 'maintenance':
    default:
      calories = tdee;
      proteinPerKg = 1.8;
      fatPercentage = 0.25;
      break;
  }

  const protein = weight * proteinPerKg;
  const fat = (calories * fatPercentage) / 9;
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbs = (calories - proteinCalories - fatCalories) / 4;

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    fiber: Math.round(calories / 1000 * 14), // 14g per 1000 calories
    water: Math.round(weight * 0.033 * 1000), // ml
  };
}

/**
 * Calculate One Rep Max (1RM) using various formulas
 */
export function calculateOneRepMax(weight: number, reps: number): {
  brzycki: number;
  epley: number;
  lander: number;
  lombardi: number;
  mayhew: number;
  oconner: number;
  wathen: number;
  average: number;
} {
  const brzycki = weight * (36 / (37 - reps));
  const epley = weight * (1 + reps / 30);
  const lander = (100 * weight) / (101.3 - 2.67123 * reps);
  const lombardi = weight * Math.pow(reps, 0.10);
  const mayhew = (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps));
  const oconner = weight * (1 + reps / 40);
  const wathen = (100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * reps));

  const average = (brzycki + epley + lander + lombardi + mayhew + oconner + wathen) / 7;

  return {
    brzycki: Math.round(brzycki * 10) / 10,
    epley: Math.round(epley * 10) / 10,
    lander: Math.round(lander * 10) / 10,
    lombardi: Math.round(lombardi * 10) / 10,
    mayhew: Math.round(mayhew * 10) / 10,
    oconner: Math.round(oconner * 10) / 10,
    wathen: Math.round(wathen * 10) / 10,
    average: Math.round(average * 10) / 10,
  };
}

/**
 * Calculate training weight from 1RM percentage
 */
export function calculateTrainingWeight(oneRepMax: number, percentage: number): number {
  return Math.round((oneRepMax * percentage / 100) * 10) / 10;
}

/**
 * Calculate estimated reps at a given weight based on 1RM
 */
export function calculateEstimatedReps(oneRepMax: number, weight: number): number {
  if (weight >= oneRepMax) return 1;
  // Using Brzycki formula inversed
  const reps = 37 - (36 * weight / oneRepMax);
  return Math.max(1, Math.round(reps));
}

/**
 * Calculate Wilks Score for powerlifting comparison
 */
export function calculateWilksScore(
  bodyWeight: number,
  liftedWeight: number,
  gender: 'male' | 'female'
): number {
  const coefficients = gender === 'male'
    ? { a: -216.0475144, b: 16.2606339, c: -0.002388645, d: -0.00113732, e: 7.01863e-6, f: -1.291e-8 }
    : { a: 594.31747775582, b: -27.23842536447, c: 0.82112226871, d: -0.00930733913, e: 4.731582e-5, f: -9.054e-8 };

  const { a, b, c, d, e, f } = coefficients;
  const x = bodyWeight;
  
  const coeff = 500 / (a + b * x + c * Math.pow(x, 2) + d * Math.pow(x, 3) + e * Math.pow(x, 4) + f * Math.pow(x, 5));
  
  return Math.round(liftedWeight * coeff * 100) / 100;
}

/**
 * Calculate DOTS Score (newer alternative to Wilks)
 */
export function calculateDOTSScore(
  bodyWeight: number,
  liftedWeight: number,
  gender: 'male' | 'female'
): number {
  const coefficients = gender === 'male'
    ? { a: -307.75076, b: 24.0900756, c: -0.1918759221, d: 0.0007391293, e: -0.000001093 }
    : { a: -57.96288, b: 13.6175032, c: -0.1126655495, d: 0.0005158568, e: -0.0000010706 };

  const { a, b, c, d, e } = coefficients;
  const x = bodyWeight;

  const denominator = a + b * x + c * Math.pow(x, 2) + d * Math.pow(x, 3) + e * Math.pow(x, 4);
  const coeff = 500 / denominator;

  return Math.round(liftedWeight * coeff * 100) / 100;
}

/**
 * Calculate Target Heart Rate Zones
 */
export function calculateHeartRateZones(age: number, restingHeartRate?: number): {
  maxHeartRate: number;
  zone1: { min: number; max: number; description: string };
  zone2: { min: number; max: number; description: string };
  zone3: { min: number; max: number; description: string };
  zone4: { min: number; max: number; description: string };
  zone5: { min: number; max: number; description: string };
} {
  const maxHeartRate = 220 - age;
  
  // Using Karvonen Formula if resting HR is provided
  const calculateZone = (minPercent: number, maxPercent: number) => {
    if (restingHeartRate) {
      const heartRateReserve = maxHeartRate - restingHeartRate;
      return {
        min: Math.round(heartRateReserve * minPercent + restingHeartRate),
        max: Math.round(heartRateReserve * maxPercent + restingHeartRate),
      };
    }
    return {
      min: Math.round(maxHeartRate * minPercent),
      max: Math.round(maxHeartRate * maxPercent),
    };
  };

  return {
    maxHeartRate,
    zone1: { ...calculateZone(0.50, 0.60), description: 'Recovery - Very Light' },
    zone2: { ...calculateZone(0.60, 0.70), description: 'Fat Burn - Light' },
    zone3: { ...calculateZone(0.70, 0.80), description: 'Aerobic - Moderate' },
    zone4: { ...calculateZone(0.80, 0.90), description: 'Anaerobic - Hard' },
    zone5: { ...calculateZone(0.90, 1.00), description: 'VO2 Max - Maximum' },
  };
}

/**
 * Calculate VO2 Max estimate from running performance
 */
export function calculateVO2MaxFromRun(distanceKm: number, timeMinutes: number): number {
  const speed = distanceKm / (timeMinutes / 60); // km/h
  const vo2Max = (speed * 3.5) + 3.5;
  return Math.round(vo2Max * 10) / 10;
}

/**
 * Calculate VO2 Max from Cooper Test (12-minute run)
 */
export function calculateVO2MaxCooper(distanceMeters: number): number {
  return Math.round(((distanceMeters - 504.9) / 44.73) * 10) / 10;
}

/**
 * Get VO2 Max fitness category
 */
export function getVO2MaxCategory(vo2Max: number, age: number, gender: 'male' | 'female'): string {
  // Simplified categories - in real app would have age-specific ranges
  const thresholds = gender === 'male'
    ? { poor: 35, fair: 40, good: 45, excellent: 50, superior: 55 }
    : { poor: 30, fair: 35, good: 40, excellent: 45, superior: 50 };

  if (vo2Max < thresholds.poor) return 'Very Poor';
  if (vo2Max < thresholds.fair) return 'Poor';
  if (vo2Max < thresholds.good) return 'Fair';
  if (vo2Max < thresholds.excellent) return 'Good';
  if (vo2Max < thresholds.superior) return 'Excellent';
  return 'Superior';
}

/**
 * Calculate water intake recommendation
 */
export function calculateWaterIntake(
  weight: number,
  activityLevel: ActivityLevel,
  climate: 'cold' | 'moderate' | 'hot'
): number {
  let baseIntake = weight * 33; // ml per kg

  // Adjust for activity
  const activityMultiplier: Record<ActivityLevel, number> = {
    sedentary: 1.0,
    lightly_active: 1.1,
    moderately_active: 1.2,
    very_active: 1.3,
    extra_active: 1.4,
  };
  baseIntake *= activityMultiplier[activityLevel];

  // Adjust for climate
  const climateMultiplier: Record<string, number> = {
    cold: 0.9,
    moderate: 1.0,
    hot: 1.2,
  };
  baseIntake *= climateMultiplier[climate];

  return Math.round(baseIntake);
}

/**
 * Calculate estimated time to reach goal weight
 */
export function calculateTimeToGoal(
  currentWeight: number,
  targetWeight: number,
  weeklyChange: number // kg per week (positive for gain, negative for loss)
): {
  weeks: number;
  months: number;
  targetDate: Date;
  isSafe: boolean;
  recommendation: string;
} {
  const weightDifference = targetWeight - currentWeight;
  const weeks = Math.abs(weightDifference / weeklyChange);
  const months = weeks / 4.33;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeks * 7);

  // Safe rate: 0.5-1kg loss per week, 0.25-0.5kg gain per week
  const isLoss = weightDifference < 0;
  const absWeeklyChange = Math.abs(weeklyChange);
  
  let isSafe: boolean;
  let recommendation: string;

  if (isLoss) {
    isSafe = absWeeklyChange <= 1;
    recommendation = absWeeklyChange > 1
      ? 'Consider a more gradual weight loss of 0.5-1kg per week for sustainable results'
      : 'Your weight loss rate is within healthy guidelines';
  } else {
    isSafe = absWeeklyChange <= 0.5;
    recommendation = absWeeklyChange > 0.5
      ? 'Consider a slower weight gain of 0.25-0.5kg per week to minimize fat gain'
      : 'Your weight gain rate is optimal for lean muscle growth';
  }

  return {
    weeks: Math.round(weeks),
    months: Math.round(months * 10) / 10,
    targetDate,
    isSafe,
    recommendation,
  };
}

/**
 * Calculate weekly calorie adjustment needed
 */
export function calculateCalorieAdjustment(
  currentWeight: number,
  targetWeight: number,
  weeks: number
): {
  dailyDeficitOrSurplus: number;
  totalCalories: number;
  isDeficit: boolean;
} {
  const weightDifference = targetWeight - currentWeight;
  // 7700 calories per kg of body weight
  const totalCalories = Math.abs(weightDifference) * 7700;
  const dailyDeficitOrSurplus = Math.round(totalCalories / (weeks * 7));

  return {
    dailyDeficitOrSurplus,
    totalCalories: Math.round(totalCalories),
    isDeficit: weightDifference < 0,
  };
}

/**
 * Calculate strength standards for major lifts
 */
export function getStrengthStandards(
  bodyWeight: number,
  gender: 'male' | 'female'
): {
  squat: { beginner: number; novice: number; intermediate: number; advanced: number; elite: number };
  bench: { beginner: number; novice: number; intermediate: number; advanced: number; elite: number };
  deadlift: { beginner: number; novice: number; intermediate: number; advanced: number; elite: number };
  overhead: { beginner: number; novice: number; intermediate: number; advanced: number; elite: number };
} {
  // Multipliers based on body weight (simplified)
  const standards = gender === 'male'
    ? {
        squat: { beginner: 0.75, novice: 1.25, intermediate: 1.5, advanced: 2.0, elite: 2.5 },
        bench: { beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.5, elite: 2.0 },
        deadlift: { beginner: 1.0, novice: 1.5, intermediate: 1.75, advanced: 2.25, elite: 3.0 },
        overhead: { beginner: 0.35, novice: 0.55, intermediate: 0.8, advanced: 1.0, elite: 1.3 },
      }
    : {
        squat: { beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.5, elite: 2.0 },
        bench: { beginner: 0.25, novice: 0.5, intermediate: 0.75, advanced: 1.0, elite: 1.25 },
        deadlift: { beginner: 0.75, novice: 1.0, intermediate: 1.25, advanced: 1.75, elite: 2.25 },
        overhead: { beginner: 0.25, novice: 0.35, intermediate: 0.5, advanced: 0.75, elite: 0.9 },
      };

  return {
    squat: {
      beginner: Math.round(bodyWeight * standards.squat.beginner),
      novice: Math.round(bodyWeight * standards.squat.novice),
      intermediate: Math.round(bodyWeight * standards.squat.intermediate),
      advanced: Math.round(bodyWeight * standards.squat.advanced),
      elite: Math.round(bodyWeight * standards.squat.elite),
    },
    bench: {
      beginner: Math.round(bodyWeight * standards.bench.beginner),
      novice: Math.round(bodyWeight * standards.bench.novice),
      intermediate: Math.round(bodyWeight * standards.bench.intermediate),
      advanced: Math.round(bodyWeight * standards.bench.advanced),
      elite: Math.round(bodyWeight * standards.bench.elite),
    },
    deadlift: {
      beginner: Math.round(bodyWeight * standards.deadlift.beginner),
      novice: Math.round(bodyWeight * standards.deadlift.novice),
      intermediate: Math.round(bodyWeight * standards.deadlift.intermediate),
      advanced: Math.round(bodyWeight * standards.deadlift.advanced),
      elite: Math.round(bodyWeight * standards.deadlift.elite),
    },
    overhead: {
      beginner: Math.round(bodyWeight * standards.overhead.beginner),
      novice: Math.round(bodyWeight * standards.overhead.novice),
      intermediate: Math.round(bodyWeight * standards.overhead.intermediate),
      advanced: Math.round(bodyWeight * standards.overhead.advanced),
      elite: Math.round(bodyWeight * standards.overhead.elite),
    },
  };
}

/**
 * Calculate muscle group volume recommendations
 */
export function calculateWeeklyVolume(
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  goal: FitnessGoal
): Record<string, { minSets: number; maxSets: number; frequency: number }> {
  const baseVolume = {
    beginner: { min: 10, max: 12, freq: 2 },
    intermediate: { min: 12, max: 18, freq: 2 },
    advanced: { min: 16, max: 22, freq: 3 },
  }[experienceLevel];

  const goalMultiplier = {
    weight_loss: 0.8,
    muscle_gain: 1.2,
    strength: 1.0,
    endurance: 0.7,
    maintenance: 0.9,
    flexibility: 0.5,
    general_fitness: 1.0,
  }[goal];

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 
    'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs'
  ];

  return muscleGroups.reduce((acc, muscle) => {
    acc[muscle] = {
      minSets: Math.round(baseVolume.min * goalMultiplier),
      maxSets: Math.round(baseVolume.max * goalMultiplier),
      frequency: baseVolume.freq,
    };
    return acc;
  }, {} as Record<string, { minSets: number; maxSets: number; frequency: number }>);
}

/**
 * Calculate rest time between sets based on goal
 */
export function calculateRestTime(
  goal: FitnessGoal,
  intensity: 'low' | 'moderate' | 'high'
): { seconds: number; description: string } {
  const restTimes: Record<FitnessGoal, Record<string, number>> = {
    strength: { low: 180, moderate: 240, high: 300 },
    muscle_gain: { low: 60, moderate: 90, high: 120 },
    endurance: { low: 30, moderate: 45, high: 60 },
    weight_loss: { low: 30, moderate: 45, high: 60 },
    maintenance: { low: 60, moderate: 90, high: 120 },
    flexibility: { low: 30, moderate: 30, high: 30 },
    general_fitness: { low: 60, moderate: 90, high: 120 },
  };

  const seconds = restTimes[goal][intensity];
  const description = seconds >= 180 
    ? 'Long rest for maximum strength recovery'
    : seconds >= 90 
      ? 'Moderate rest for hypertrophy'
      : 'Short rest for metabolic conditioning';

  return { seconds, description };
}

/**
 * Calculate progressive overload recommendation
 */
export function calculateProgressiveOverload(
  currentWeight: number,
  currentReps: number,
  currentSets: number,
  goal: FitnessGoal
): {
  newWeight: number;
  newReps: number;
  newSets: number;
  method: string;
} {
  switch (goal) {
    case 'strength':
      return {
        newWeight: currentWeight * 1.025, // 2.5% increase
        newReps: currentReps,
        newSets: currentSets,
        method: 'Add 2.5% to the weight',
      };
    case 'muscle_gain':
      if (currentReps < 12) {
        return {
          newWeight: currentWeight,
          newReps: currentReps + 1,
          newSets: currentSets,
          method: 'Add 1 rep per set',
        };
      } else {
        return {
          newWeight: currentWeight * 1.05,
          newReps: 8,
          newSets: currentSets,
          method: 'Increase weight 5%, reset reps to 8',
        };
      }
    case 'endurance':
      return {
        newWeight: currentWeight,
        newReps: currentReps + 2,
        newSets: currentSets,
        method: 'Add 2 reps per set',
      };
    default:
      return {
        newWeight: currentWeight * 1.025,
        newReps: currentReps,
        newSets: currentSets,
        method: 'Gradual weight increase',
      };
  }
}

// Export utility functions for formatting
export const formatWeight = (kg: number, unit: 'kg' | 'lbs' = 'kg'): string => {
  if (unit === 'lbs') {
    return `${Math.round(kg * 2.205)} lbs`;
  }
  return `${Math.round(kg * 10) / 10} kg`;
};

export const formatHeight = (cm: number, unit: 'cm' | 'ft' = 'cm'): string => {
  if (unit === 'ft') {
    const inches = cm / 2.54;
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}'${remainingInches}"`;
  }
  return `${cm} cm`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
};

export const formatCalories = (calories: number): string => {
  return `${Math.round(calories)} kcal`;
};
