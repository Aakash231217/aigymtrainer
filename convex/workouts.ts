import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate weekly workout plan
export const generateWeeklyPlan = mutation({
  args: {
    userId: v.string(),
    weekStartDate: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) throw new Error("User profile not found");

    // Check for existing plan
    const existing = await ctx.db
      .query("workoutPlans")
      .withIndex("by_user_week", (q) => 
        q.eq("userId", args.userId).eq("weekStartDate", args.weekStartDate)
      )
      .first();

    // Generate plan based on profile
    const workouts = generateWorkoutSchedule(
      profile.fitnessGoals,
      profile.workoutDaysPerWeek,
      profile.timeAvailability,
      profile.fitnessLevel,
      profile.equipmentAccess
    );

    const planData = {
      userId: args.userId,
      weekStartDate: args.weekStartDate,
      workouts,
      isActive: true,
      createdAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, planData);
      return existing._id;
    } else {
      // Deactivate previous plans
      const previousPlans = await ctx.db
        .query("workoutPlans")
        .withIndex("by_user_week", (q) => q.eq("userId", args.userId))
        // Remove isActive filter as it doesn't exist in schema
        .collect();

      for (const plan of previousPlans) {
        // Previous plans are not deactivated since isActive field doesn't exist
      }

      // Transform planData to match schema
      const transformedData = {
        userId: planData.userId,
        weekStartDate: planData.weekStartDate,
        dailyPlans: planData.workouts.map((workout: any) => ({
          day: getDayName(workout.dayOfWeek),
          date: getDateForDay(planData.weekStartDate, workout.dayOfWeek),
          focus: workout.type,
          exercises: workout.exercises.map((ex: any) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            duration: ex.duration,
            restTime: ex.restSeconds,
            equipment: [ex.equipment || "none"],
            completed: false,
          })),
          warmup: [],
          cooldown: [],
          estimatedDuration: workout.estimatedDuration,
          adjustedForEnergy: false,
        })),
        nutritionReminders: [],
        restDays: [],
        createdAt: Date.now(),
      };
      return await ctx.db.insert("workoutPlans", transformedData);
    }
  },
});

// Get exercises for a specific day
export const getDayWorkout = query({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const dayOfWeek = new Date(args.date).getDay();
    
    // Find active workout plan
    const plan = await ctx.db
      .query("workoutPlans")
      .withIndex("by_user_week", (q) => q.eq("userId", args.userId))
      .first();

    if (!plan) return null;

    const dayWorkout = plan.dailyPlans.find((w: any) => new Date(w.date).getDay() === dayOfWeek);
    if (!dayWorkout) return null;

    // Get exercise videos
    const exercisesWithVideos = await Promise.all(
      dayWorkout.exercises.map(async (exercise: any) => {
        const videos = await ctx.db
          .query("exerciseVideos")
          .withIndex("by_equipment", (q) => 
            q.eq("equipment", exercise.equipment || "none")
          )
          .collect();

        return {
          ...exercise,
          videos: videos.slice(0, 3), // Top 3 videos
        };
      })
    );

    return {
      ...dayWorkout,
      exercises: exercisesWithVideos,
    };
  },
});

// Start workout session
export const startWorkoutSession = mutation({
  args: {
    userId: v.string(),
    workoutType: v.string(),
    planId: v.id("workoutPlans"),
    plannedExercises: v.array(v.object({
      name: v.string(),
      sets: v.number(),
      reps: v.number(),
      weight: v.optional(v.number()),
      duration: v.optional(v.number()),
      trainerId: v.optional(v.id("trainers")),
      equipment: v.optional(v.string()),
    })),
    energyLevel: v.number(), // 1-10
  },
  handler: async (ctx, args) => {
    // Adjust workout based on energy level
    const adjustedExercises = adjustWorkoutIntensity(
      args.plannedExercises,
      args.energyLevel
    );

    const sessionId = await ctx.db.insert("workoutSessions", {
      userId: args.userId,
      date: new Date().toISOString().split('T')[0],
      // workoutType field doesn't exist in schema
      startTime: Date.now(),
      endTime: undefined,
      planId: args.planId,
      energyLevel: args.energyLevel === 1 || args.energyLevel === 2 ? "low" : args.energyLevel >= 7 ? "high" : "medium",
      exercisesCompleted: adjustedExercises.map((ex: any) => ({
        name: ex.name,
        actualSets: ex.sets,
        actualReps: ex.reps,
        actualDuration: ex.duration,
        notes: "",
      })),
      caloriesBurned: 0,
      pointsEarned: 0,
    });

    return { sessionId, adjustedExercises };
  },
});

// Log exercise completion
export const logExerciseCompletion = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
    exerciseIndex: v.number(),
    actualSets: v.number(),
    actualReps: v.array(v.number()),
    actualWeight: v.optional(v.number()),
    actualDuration: v.optional(v.number()),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const exercises = [...session.exercisesCompleted];
    exercises[args.exerciseIndex] = {
      ...exercises[args.exerciseIndex],
      actualSets: args.actualSets,
      actualReps: args.actualReps[0] || 0, // Take first rep count
      // actualWeight field removed
      actualDuration: args.actualDuration,
      // difficulty field doesn't exist in schema
      // completed field removed
    };

    await ctx.db.patch(args.sessionId, {
      exercisesCompleted: exercises,
    });

    // Award points based on completion
    let points = 10; // Base points
    if (args.actualSets >= (exercises[args.exerciseIndex] as any).sets) {
      points += 10; // Full sets bonus
    }
    if (args.difficulty === "hard") {
      points += 15; // Challenge bonus
    }

    await updateUserPoints(ctx, session.userId, points);

    return { pointsEarned: points };
  },
});

// Complete workout session
export const completeWorkoutSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
    energyLevelEnd: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Calculate calories burned
    const duration = (Date.now() - session.startTime) / 1000 / 60; // minutes
    const caloriesBurned = calculateCaloriesBurned(
      "Workout",
      session.endTime ? (session.endTime - session.startTime) / 60000 : 30,
      session.exercisesCompleted
    );

    // Calculate total points
    const completedExercises = session.exercisesCompleted.filter((e: any) => e.completed).length;
    const completionRate = completedExercises / session.exercisesCompleted.length;
    let totalPoints = Math.round(50 * completionRate); // Base completion points

    // Bonus points
    if (completionRate === 1) {
      totalPoints += 50; // Perfect workout bonus
    }
    if (session.energyLevel === "low" && completionRate > 0.7) {
      totalPoints += 30; // Low energy warrior bonus
    }

    await ctx.db.patch(args.sessionId, {
      endTime: Date.now(),
      // energyLevel is already set, remove energyLevelEnd as it doesn't exist
      caloriesBurned,
      // notes field removed
      pointsEarned: totalPoints,
    });

    await updateUserPoints(ctx, session.userId, totalPoints);

    // Update streak
    await updateWorkoutStreak(ctx, session.userId);

    return { 
      totalPoints,
      caloriesBurned,
      completionRate: Math.round(completionRate * 100),
    };
  },
});

// Get workout statistics
export const getWorkoutStats = query({
  args: {
    userId: v.string(),
    period: v.union(v.literal("week"), v.literal("month"), v.literal("all")),
  },
  handler: async (ctx, args) => {
    let startDate = new Date();
    if (args.period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (args.period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(0); // All time
    }

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.gte(q.field("date"), startDate.toISOString().split('T')[0])
      )
      .collect();

    const completedSessions = sessions.filter(s => s.endTime !== undefined);

    const stats = {
      totalWorkouts: completedSessions.length,
      totalCaloriesBurned: completedSessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0),
      totalMinutes: completedSessions.reduce((sum, s) => 
        sum + ((s.endTime! - s.startTime) / 1000 / 60), 0
      ),
      averageEnergyChange: calculateAverageEnergyChange(completedSessions),
      favoriteWorkoutType: getFavoriteWorkoutType(completedSessions),
      workoutsByType: getWorkoutsByType(completedSessions),
      weeklyProgress: getWeeklyProgress(sessions),
    };

    return stats;
  },
});

// Add gym and trainer management functions
export const addGym = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    equipment: v.array(v.string()),
    amenities: v.array(v.string()),
    timings: v.string(),
    membershipFee: v.number(),
  },
  handler: async (ctx, args) => {
    // Fix gym insertion to match schema
    return await ctx.db.insert("gyms", {
      name: args.name,
      location: args.city || args.address, // Use city or address as location
      equipment: args.equipment,
      hasFreestyleZone: false, // Default value
      trainers: [], // Empty trainers array
      createdAt: Date.now(),
    });
  },
});

export const addTrainer = mutation({
  args: {
    gymId: v.id("gyms"),
    name: v.string(),
    specializations: v.array(v.string()),
    experience: v.number(),
    rating: v.number(),
    hourlyRate: v.number(),
    availability: v.array(v.object({
      day: v.string(),
      slots: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Fix trainer insertion to match schema
    return await ctx.db.insert("trainers", {
      gymId: args.gymId,
      name: args.name,
      specialization: args.specializations || [], // Map to correct field name
      videoIds: [], // Empty video IDs array
    });
  },
});

export const addExerciseVideo = mutation({
  args: {
    gymId: v.id("gyms"),
    planId: v.id("workoutPlans"),
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    duration: v.number(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    equipment: v.array(v.string()),
    muscleGroups: v.array(v.string()),
    goalMapping: v.array(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("exerciseVideos", args);
  },
});

// Helper functions
function generateWorkoutSchedule(
  goals: string[],
  daysPerWeek: number,
  timeAvailable: number,
  fitnessLevel: string,
  equipmentAccess: string
) {
  const workouts = [];
  const dayMap = getDayDistribution(daysPerWeek);

  for (const [dayOfWeek, workoutType] of Object.entries(dayMap)) {
    if (workoutType) {
      const exercises = generateExercisesForDay(
        workoutType as string,
        goals,
        timeAvailable,
        fitnessLevel,
        equipmentAccess
      );

      workouts.push({
        dayOfWeek: parseInt(dayOfWeek),
        type: workoutType as string,
        exercises,
        estimatedDuration: calculateWorkoutDuration(exercises),
      });
    }
  }

  return workouts;
}

function getDayDistribution(daysPerWeek: number) {
  const distributions: { [key: number]: { [key: number]: string | null } } = {
    3: { 1: "upper", 3: "lower", 5: "cardio" },
    4: { 1: "upper", 2: "lower", 4: "upper", 5: "cardio" },
    5: { 1: "upper", 2: "lower", 3: "cardio", 4: "upper", 5: "lower" },
    6: { 1: "upper", 2: "lower", 3: "cardio", 4: "upper", 5: "lower", 6: "full" },
  };

  return distributions[Math.min(daysPerWeek, 6)] || distributions[3];
}

function generateExercisesForDay(
  workoutType: string,
  goals: string[],
  timeAvailable: number,
  fitnessLevel: string,
  equipmentAccess: string
) {
  const exercises = [];
  const hasGymAccess = equipmentAccess === "gym" || equipmentAccess === "both";

  // Base exercise selection
  if (workoutType === "upper") {
    exercises.push(
      {
        name: "Push-ups",
        sets: fitnessLevel === "beginner" ? 3 : 4,
        reps: fitnessLevel === "beginner" ? 8 : 12,
        equipment: "none",
        restSeconds: 60,
      },
      {
        name: hasGymAccess ? "Bench Press" : "Dumbbell Press",
        sets: 3,
        reps: 10,
        weight: fitnessLevel === "beginner" ? 20 : 40,
        equipment: hasGymAccess ? "barbell" : "dumbbells",
        restSeconds: 90,
      }
    );
  } else if (workoutType === "lower") {
    exercises.push(
      {
        name: hasGymAccess ? "Squats" : "Bodyweight Squats",
        sets: fitnessLevel === "beginner" ? 3 : 4,
        reps: fitnessLevel === "beginner" ? 10 : 15,
        equipment: hasGymAccess ? "barbell" : "none",
        restSeconds: 90,
      },
      {
        name: "Lunges",
        sets: 3,
        reps: 10,
        equipment: "none",
        restSeconds: 60,
      }
    );
  } else if (workoutType === "cardio") {
    exercises.push(
      {
        name: "Treadmill Run",
        duration: Math.min(timeAvailable * 0.5, 30),
        equipment: "treadmill",
        intensity: fitnessLevel === "beginner" ? "moderate" : "high",
      },
      {
        name: "Burpees",
        sets: 3,
        reps: fitnessLevel === "beginner" ? 5 : 10,
        equipment: "none",
        restSeconds: 60,
      }
    );
  }

  // Add goal-specific exercises
  if (goals.includes("muscle_gain")) {
    exercises.forEach(ex => {
      if (ex.sets) ex.sets += 1;
    });
  }

  return exercises;
}

function adjustWorkoutIntensity(exercises: any[], energyLevel: number) {
  if (energyLevel >= 7) {
    // High energy - maintain or increase intensity
    return exercises.map(ex => ({
      ...ex,
      sets: ex.sets ? ex.sets : undefined,
      reps: ex.reps ? ex.reps : undefined,
      intensity: ex.intensity === "moderate" ? "high" : ex.intensity,
    }));
  } else if (energyLevel >= 4) {
    // Medium energy - maintain planned workout
    return exercises;
  } else {
    // Low energy - reduce intensity
    return exercises.map(ex => ({
      ...ex,
      sets: ex.sets ? Math.max(2, ex.sets - 1) : undefined,
      reps: ex.reps ? Math.max(5, Math.floor(ex.reps * 0.7)) : undefined,
      duration: ex.duration ? Math.floor(ex.duration * 0.7) : undefined,
      intensity: ex.intensity === "high" ? "moderate" : ex.intensity,
    }));
  }
}

function calculateWorkoutDuration(exercises: any[]) {
  let totalMinutes = 5; // Warm-up

  exercises.forEach(ex => {
    if (ex.duration) {
      totalMinutes += ex.duration;
    } else if (ex.sets && ex.reps) {
      // Estimate: 3 seconds per rep + rest time
      const exerciseTime = (ex.sets * ex.reps * 3) / 60;
      const restTime = ((ex.sets - 1) * (ex.restSeconds || 60)) / 60;
      totalMinutes += exerciseTime + restTime;
    }
  });

  totalMinutes += 5; // Cool-down
  return Math.round(totalMinutes);
}

function calculateCaloriesBurned(workoutType: string, duration: number, exercises: any[]) {
  // Base calorie burn rates per minute
  const burnRates: { [key: string]: number } = {
    upper: 6,
    lower: 8,
    cardio: 10,
    full: 8,
    hiit: 12,
  };

  const baseRate = burnRates[workoutType] || 7;
  
  // Adjust for exercise intensity
  const completedExercises = exercises.filter(e => e.completed);
  const intensityMultiplier = completedExercises.some(e => e.difficulty === "hard") ? 1.2 : 1.0;

  return Math.round(duration * baseRate * intensityMultiplier);
}

function calculateAverageEnergyChange(sessions: any[]) {
  const validSessions = sessions.filter(s => s.energyLevelEnd !== null);
  if (validSessions.length === 0) return 0;

  const totalChange = validSessions.reduce((sum, s) => 
    sum + (s.energyLevelEnd - s.energyLevelStart), 0
  );

  return (totalChange / validSessions.length).toFixed(1);
}

function getFavoriteWorkoutType(sessions: any[]) {
  const typeCounts = sessions.reduce((acc, s) => {
    acc[s.workoutType] = (acc[s.workoutType] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return Object.entries(typeCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || "none";
}

function getWorkoutsByType(sessions: any[]) {
  return sessions.reduce((acc, s) => {
    acc[s.workoutType] = (acc[s.workoutType] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
}

function getWeeklyProgress(sessions: any[]) {
  const weeks: { [key: string]: number } = {};
  
  sessions.forEach(s => {
    const weekStart = getWeekStart(s.date);
    weeks[weekStart] = (weeks[weekStart] || 0) + 1;
  });

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));
}

function getWeekStart(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getDateForDay(weekStartDate: string, dayOfWeek: number): string {
  const date = new Date(weekStartDate);
  date.setDate(date.getDate() + dayOfWeek - 1);
  return date.toISOString().split('T')[0];
}

function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek];
}

async function updateUserPoints(ctx: any, userId: string, points: number) {
  const userPoints = await ctx.db
    .query("userPoints")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first();

  if (userPoints) {
    await ctx.db.patch(userPoints._id, {
      totalPoints: userPoints.totalPoints + points,
      weeklyPoints: userPoints.weeklyPoints + points,
      monthlyPoints: userPoints.monthlyPoints + points,
      lastActiveDate: new Date().toISOString().split('T')[0],
    });
  }
}

async function updateWorkoutStreak(ctx: any, userId: string) {
  const points = await ctx.db
    .query("userPoints")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first();

  if (!points) return;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (points.lastActiveDate === today) {
    // Already worked out today
    return;
  } else if (points.lastActiveDate === yesterdayStr) {
    // Continuing streak
    await ctx.db.patch(points._id, {
      currentStreak: points.currentStreak + 1,
      longestStreak: Math.max(points.longestStreak, points.currentStreak + 1),
    });
  } else {
    // Streak broken, restart
    await ctx.db.patch(points._id, {
      currentStreak: 1,
    });
  }
}

export const getRecentWorkouts = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    return await ctx.db
      .query("workoutSessions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(limit);
  },
});

export const getCurrentWorkoutPlan = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get the most recent active workout plan
    const plans = await ctx.db
      .query("workoutPlans")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(1);
    
    return plans[0] || null;
  },
});

export const getScheduledWorkouts = query({
  args: { 
    userId: v.string(),
    date: v.string()
  },
  handler: async (ctx, args) => {
    const dateObj = new Date(args.date);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999)).toISOString();
    
    return await ctx.db
      .query("workoutSessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gte(q.field("date"), args.date),
          q.lte(q.field("date"), args.date)
        )
      )
      .collect();
  },
});

export const getWorkoutHistory = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query("workoutSessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.neq(q.field("endTime"), undefined)
        )
      )
      .order("desc")
      .take(limit);
  },
});

export const scheduleWorkout = mutation({
  args: {
    userId: v.string(),
    workoutPlanId: v.id("workoutPlans"),
    scheduledAt: v.string(),
    exercises: v.array(v.object({
      exerciseId: v.id("exercises"),
      sets: v.number(),
      reps: v.number(),
      weight: v.optional(v.number()),
      duration: v.optional(v.number()),
      restTime: v.optional(v.number())
    }))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workoutSessions", {
      userId: args.userId,
      planId: args.workoutPlanId,
      date: args.scheduledAt.split('T')[0],
      energyLevel: "medium" as const,
      exercisesCompleted: args.exercises.map(ex => ({
        name: `Exercise ${ex.exerciseId}`,
        actualSets: ex.sets,
        actualReps: ex.reps,
        actualDuration: ex.duration,
        notes: ""
      })),
      caloriesBurned: 0,
      pointsEarned: 0,
      startTime: new Date(args.scheduledAt).getTime(),
      endTime: undefined
    });
  },
});
