import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  // Comprehensive user profile with all onboarding data
  userProfiles: defineTable({
    userId: v.string(),
    // Basic info
    age: v.number(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    weight: v.number(), // in kg
    height: v.number(), // in cm
    targetWeight: v.optional(v.number()), // in kg
    bodyFat: v.optional(v.number()), // percentage
    
    // Professional & lifestyle
    profession: v.string(),
    mentalStressLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    
    // Fitness goals & preferences
    fitnessGoals: v.array(v.union(
      v.literal("fat_loss"),
      v.literal("muscle_gain"),
      v.literal("flexibility"),
      v.literal("endurance"),
      v.literal("strength"),
      v.literal("general_health")
    )),
    gymStyle: v.union(
      v.literal("sedentary"), // 1-3 days
      v.literal("semi_active"), // 3-5 days
      v.literal("highly_active") // 5-7 days
    ),
    preferredWorkoutTime: v.union(
      v.literal("early_morning"),
      v.literal("morning"),
      v.literal("afternoon"),
      v.literal("evening"),
      v.literal("night")
    ),
    timeAvailability: v.number(), // minutes per session
    workoutDaysPerWeek: v.number(),
    fitnessLevel: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    
    // Diet preferences
    dietPreference: v.union(
      v.literal("veg"),
      v.literal("non_veg"),
      v.literal("vegan"),
      v.literal("jain"),
      v.literal("keto"),
      v.literal("paleo")
    ),
    currentDietChart: v.optional(v.string()),
    cookingStyle: v.union(
      v.literal("active"),
      v.literal("semi_active"),
      v.literal("lazy")
    ),
    cookingTimeAvailable: v.number(), // minutes
    kitchenEquipment: v.array(v.string()), // microwave, stove, induction, etc.
    allergies: v.array(v.string()),
    medicalConditions: v.array(v.string()), // PCOD, diabetes, injuries
    mealBudget: v.number(), // per week
    currentSupplements: v.array(v.string()),
    supplementsBudget: v.number(),
    equipmentAccess: v.union(v.literal("gym"), v.literal("home"), v.literal("both")),
    location: v.string(),
    tasteProfile: v.array(v.string()), // spicy, sweet, neutral, etc.
    mealFrequency: v.number(), // meals per day
    
    // Mental health preferences
    mentalHealthTone: v.union(
      v.literal("motivational"),
      v.literal("neutral"),
      v.literal("soft"),
      v.literal("spiritual")
    ),
    preferredContent: v.array(v.union(
      v.literal("music"),
      v.literal("podcasts"),
      v.literal("stories"),
      v.literal("audiobooks")
    )),
    mentalHealthTime: v.number(), // minutes per day
    socialLevel: v.union(v.literal("introvert"), v.literal("neutral"), v.literal("extrovert")),
    sleepQuality: v.number(), // 1-10 scale
    sleepHours: v.number(),
    screenTime: v.number(), // hours per day
    workScreenTime: v.number(), // work portion
    pastTherapy: v.optional(v.boolean()),
    copingPreferences: v.array(v.string()), // music, journaling, talking, etc.
    interests: v.array(v.string()), // hobbies, spirituality, games, nature
    
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Gym and equipment data
  gyms: defineTable({
    name: v.string(),
    location: v.string(),
    equipment: v.array(v.string()),
    hasFreestyleZone: v.boolean(),
    trainers: v.array(v.id("trainers")),
    createdAt: v.number(),
  })
    .index("by_location", ["location"]),

  trainers: defineTable({
    gymId: v.id("gyms"),
    name: v.string(),
    specialization: v.array(v.string()),
    videoIds: v.array(v.id("exerciseVideos")),
  })
    .index("by_gym", ["gymId"]),

  exerciseVideos: defineTable({
    trainerId: v.optional(v.id("trainers")),
    gymId: v.id("gyms"),
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    duration: v.number(), // seconds
    equipment: v.array(v.string()),
    muscleGroups: v.array(v.string()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    goalMapping: v.array(v.string()), // fat_loss, muscle_gain, etc.
    tags: v.array(v.string()),
  })
    .index("by_gym", ["gymId"])
    .index("by_trainer", ["trainerId"])
    .index("by_equipment", ["equipment"]),

  // Daily diet tracking
  nutrientPlans: defineTable({
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD
    targetCalories: v.number(),
    targetProtein: v.number(), // grams
    targetCarbs: v.number(),
    targetFats: v.number(),
    targetFiber: v.number(),
    vitamins: v.object({
      a: v.optional(v.number()),
      b_complex: v.optional(v.number()),
      c: v.optional(v.number()),
      d: v.optional(v.number()),
      e: v.optional(v.number()),
      k: v.optional(v.number()),
    }),
    minerals: v.object({
      calcium: v.optional(v.number()),
      iron: v.optional(v.number()),
      zinc: v.optional(v.number()),
      magnesium: v.optional(v.number()),
    }),
    omega3: v.optional(v.number()),
    probiotics: v.optional(v.boolean()),
  })
    .index("by_user_date", ["userId", "date"]),

  meals: defineTable({
    userId: v.string(),
    date: v.string(),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack"),
      v.literal("pre_workout"),
      v.literal("post_workout")
    ),
    name: v.string(),
    foods: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      unit: v.string(),
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
    })),
    prepTime: v.optional(v.number()), // minutes
    recipe: v.optional(v.string()),
    source: v.union(v.literal("home"), v.literal("restaurant"), v.literal("ordered")),
    restaurantName: v.optional(v.string()),
    pointsEarned: v.number(),
    consumed: v.boolean(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_meal_type", ["mealType"]),

  groceryLists: defineTable({
    userId: v.string(),
    weekStartDate: v.string(),
    items: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      unit: v.string(),
      category: v.string(), // vegetables, fruits, dairy, etc.
      estimatedCost: v.number(),
      purchased: v.boolean(),
    })),
    totalEstimatedCost: v.number(),
    mealPrepBatches: v.optional(v.array(v.object({
      name: v.string(),
      servings: v.number(),
      ingredients: v.array(v.string()),
    }))),
    createdAt: v.number(),
  })
    .index("by_user_week", ["userId", "weekStartDate"]),

  // Mental health tracking
  mentalHealthLogs: defineTable({
    userId: v.string(),
    date: v.string(),
    time: v.number(),
    
    // Layer 1: Emotional pulse
    emotionalState: v.string(), // one word
    mindState: v.union(
      v.literal("calm"),
      v.literal("overthinking"),
      v.literal("scattered"),
      v.literal("blank")
    ),
    energyLevel: v.union(v.literal("low"), v.literal("balanced"), v.literal("high")),
    
    // Layer 2: Pattern decoding
    stressSource: v.optional(v.union(
      v.literal("family"),
      v.literal("relationship"),
      v.literal("work"),
      v.literal("finances"),
      v.literal("loneliness"),
      v.literal("overthinking"),
      v.literal("no_reason")
    )),
    loopingThought: v.optional(v.string()),
    
    // Layer 3: Intensity assessment
    intensityLevel: v.number(), // 1-10
    duration: v.union(
      v.literal("today"),
      v.literal("few_days"),
      v.literal("week_plus")
    ),
    preferredRelief: v.union(v.literal("venting"), v.literal("peace")),
    
    // Relief provided
    reliefProvided: v.optional(v.object({
      type: v.string(), // meditation, journaling, audiobook, etc.
      content: v.string(),
      duration: v.number(), // minutes
    })),
    
    weeklyMeetupSuggested: v.optional(v.boolean()),
  })
    .index("by_user_date", ["userId", "date"]),

  // Workout tracking
  workoutPlans: defineTable({
    userId: v.string(),
    weekStartDate: v.string(),
    dailyPlans: v.array(v.object({
      day: v.string(),
      date: v.string(),
      focus: v.string(), // Full Body HIIT, Cardio Core, etc.
      exercises: v.array(v.object({
        name: v.string(),
        videoId: v.optional(v.id("exerciseVideos")),
        sets: v.optional(v.number()),
        reps: v.optional(v.number()),
        duration: v.optional(v.number()), // seconds
        restTime: v.optional(v.number()), // seconds
        equipment: v.array(v.string()),
        completed: v.boolean(),
      })),
      warmup: v.array(v.string()),
      cooldown: v.array(v.string()),
      estimatedDuration: v.number(), // minutes
      adjustedForEnergy: v.boolean(),
    })),
    nutritionReminders: v.array(v.string()),
    restDays: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_week", ["userId", "weekStartDate"]),

  workoutSessions: defineTable({
    userId: v.string(),
    planId: v.id("workoutPlans"),
    date: v.string(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    energyLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    exercisesCompleted: v.array(v.object({
      name: v.string(),
      actualSets: v.optional(v.number()),
      actualReps: v.optional(v.number()),
      actualDuration: v.optional(v.number()),
      notes: v.optional(v.string()),
    })),
    pointsEarned: v.number(),
    caloriesBurned: v.optional(v.number()),
  })
    .index("by_user_date", ["userId", "date"]),

  // Gamification
  userPoints: defineTable({
    userId: v.string(),
    totalPoints: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    level: v.number(),
    achievements: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      earnedAt: v.number(),
      points: v.number(),
    })),
    weeklyPoints: v.number(),
    monthlyPoints: v.number(),
    lastActiveDate: v.string(),
    workoutStreak: v.number(),
    dietStreak: v.number(),
    mentalHealthStreak: v.number(),
    lastWorkoutDate: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_level", ["level"]),

  rewards: defineTable({
    name: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    type: v.union(
      v.literal("supplement_discount"),
      v.literal("trainer_session"),
      v.literal("meal_voucher"),
      v.literal("gym_merchandise"),
      v.literal("event_entry")
    ),
    availability: v.number(), // quantity available
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  }),

  userRewards: defineTable({
    userId: v.string(),
    rewardId: v.id("rewards"),
    redeemedAt: v.number(),
    used: v.boolean(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"]),

  // Supplement recommendations
  supplementRecommendations: defineTable({
    userId: v.string(),
    recommendations: v.array(v.object({
      name: v.string(),
      type: v.string(), // whey, creatine, omega3, etc.
      brand: v.string(),
      dosage: v.string(),
      timing: v.string(), // morning, pre-workout, post-workout, etc.
      reason: v.string(),
      priority: v.union(v.literal("essential"), v.literal("recommended"), v.literal("optional")),
      monthlyCoast: v.number(),
      purchaseLink: v.optional(v.string()),
    })),
    totalMonthlyCost: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Sunday meetups
  sundayMeetups: defineTable({
    date: v.string(),
    location: v.string(),
    activities: v.array(v.string()),
    maxParticipants: v.number(),
    registeredUsers: v.array(v.string()),
    status: v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed")),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_status", ["status"]),

  // Meal orders from restaurants
  mealOrders: defineTable({
    userId: v.string(),
    mealId: v.id("meals"),
    restaurantName: v.string(),
    items: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      unit: v.string(),
      price: v.number(),
    })),
    deliveryAddress: v.string(),
    deliveryTime: v.string(),
    orderStatus: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    paymentMethod: v.union(v.literal("cod"), v.literal("online"), v.literal("wallet")),
    paymentStatus: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    subtotal: v.number(),
    deliveryFee: v.number(),
    taxes: v.number(),
    totalAmount: v.number(),
    specialInstructions: v.optional(v.string()),
    deliveryPersonName: v.optional(v.string()),
    deliveryPersonPhone: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    estimatedDeliveryTime: v.number(),
    actualDeliveryTime: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["orderStatus"]),

  // Grocery orders
  groceryOrders: defineTable({
    userId: v.string(),
    groceryListId: v.id("groceryLists"),
    vendor: v.string(),
    items: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      unit: v.string(),
      price: v.number(),
    })),
    deliveryAddress: v.string(),
    deliverySlot: v.string(),
    orderStatus: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("packing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    paymentMethod: v.union(v.literal("cod"), v.literal("online"), v.literal("wallet")),
    paymentStatus: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    subtotal: v.number(),
    deliveryFee: v.number(),
    totalAmount: v.number(),
    trackingUrl: v.optional(v.string()),
    actualDeliveryTime: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["orderStatus"]),

  // Fitness tracking
  fitnessProgress: defineTable({
    userId: v.string(),
    date: v.string(),
    weight: v.number(),
    bodyFat: v.optional(v.number()),
    measurements: v.optional(
      v.object({
        chest: v.optional(v.number()),
        waist: v.optional(v.number()),
        hips: v.optional(v.number()),
        biceps: v.optional(v.number()),
        thighs: v.optional(v.number()),
      })
    ),
  })
    .index("by_user", ["userId"]),

  // Daily nutrition tracking
  dailyNutrition: defineTable({
    userId: v.string(),
    date: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    fiber: v.number(),
    targetCalories: v.number(),
    targetProtein: v.number(),
    targetCarbs: v.number(),
    targetFat: v.number(),
    targetFiber: v.number(),
  })
    .index("by_user", ["userId"]),

  // Diet plans
  dietPlans: defineTable({
    userId: v.string(),
    name: v.string(),
    isActive: v.boolean(),
    weeklyPlan: v.array(
      v.object({
        day: v.string(),
        meals: v.array(
          v.object({
            type: v.string(),
            name: v.string(),
            calories: v.number(),
            protein: v.number(),
            carbs: v.number(),
            fat: v.number(),
          })
        ),
      })
    ),
  })
    .index("by_user", ["userId"]),

  // Workouts
  workouts: defineTable({
    name: v.string(),
    description: v.string(),
    duration: v.number(),
    difficulty: v.string(),
    targetGoal: v.string(),
    equipment: v.array(v.string()),
    exercises: v.array(
      v.object({
        name: v.string(),
        sets: v.optional(v.number()),
        reps: v.optional(v.number()),
        duration: v.optional(v.number()),
      })
    ),
  }),

  // Workout schedules
  workoutSchedules: defineTable({
    userId: v.string(),
    workoutId: v.id("workouts"),
    workoutName: v.string(),
    duration: v.number(),
    scheduledDate: v.string(),
    scheduledTime: v.string(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"]),

  // Workout history
  workoutHistory: defineTable({
    userId: v.string(),
    workoutId: v.id("workouts"),
    workoutName: v.string(),
    duration: v.number(),
    completedDate: v.string(),
    caloriesBurned: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),

  // Points history
  pointsHistory: defineTable({
    userId: v.string(),
    points: v.number(),
    activity: v.string(),
    description: v.string(),
    date: v.string(),
  })
    .index("by_user", ["userId"]),

  // Achievements
  achievements: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    type: v.string(),
    category: v.string(),
    requirement: v.number(),
    bonusPoints: v.number(),
  }),

  // User achievements
  userAchievements: defineTable({
    userId: v.string(),
    achievementId: v.id("achievements"),
    unlockedDate: v.string(),
  })
    .index("by_user", ["userId"]),

  // Reward redemptions
  rewardRedemptions: defineTable({
    userId: v.string(),
    rewardId: v.id("rewards"),
    rewardName: v.string(),
    pointsSpent: v.number(),
    redeemedAt: v.string(),
    status: v.string(),
  })
    .index("by_user", ["userId"]),

  // Keep existing plans table for backward compatibility
  plans: defineTable({
    userId: v.string(),
    name: v.string(),
    workoutPlan: v.object({
      schedule: v.array(v.string()),
      exercises: v.array(
        v.object({
          day: v.string(),
          routines: v.array(
            v.object({
              name: v.string(),
              sets: v.optional(v.number()),
              reps: v.optional(v.number()),
              duration: v.optional(v.string()),
              description: v.optional(v.string()),
              exercises: v.optional(v.array(v.string())),
            })
          ),
        })
      ),
    }),
    dietPlan: v.object({
      dailyCalories: v.number(),
      meals: v.array(
        v.object({
          name: v.string(),
          foods: v.array(v.string()),
        })
      ),
    }),
    isActive: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_active", ["isActive"]),
});
