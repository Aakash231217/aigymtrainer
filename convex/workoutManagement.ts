import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const getScheduledWorkouts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const scheduledWorkouts = await ctx.db
      .query("workoutSchedules")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isCompleted"), false))
      .take(10);
    
    return scheduledWorkouts;
  },
});

export const getAvailableWorkouts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!userProfile) return [];
    
    // Get workouts based on user's fitness level and goals
    const workouts = await ctx.db
      .query("workouts")
      .filter((q) => 
        q.and(
          q.lte(q.field("difficulty"), userProfile.fitnessLevel || "intermediate"),
          q.or(
            ...userProfile.fitnessGoals.map(goal => 
              q.eq(q.field("targetGoal"), goal)
            )
          )
        )
      )
      .take(20);
    
    return workouts;
  },
});

export const getWorkoutHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const completedWorkouts = await ctx.db
      .query("workoutHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);
    
    return completedWorkouts;
  },
});

export const scheduleWorkout = mutation({
  args: {
    userId: v.string(),
    workoutId: v.id("workouts"),
    scheduledDate: v.string(),
    scheduledTime: v.string(),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId);
    if (!workout) throw new Error("Workout not found");
    
    const scheduleId = await ctx.db.insert("workoutSchedules", {
      userId: args.userId,
      workoutId: args.workoutId,
      workoutName: workout.name,
      duration: workout.duration,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
    
    // Award points for scheduling
    await ctx.db.insert("pointsHistory", {
      userId: args.userId,
      points: 5,
      activity: "workout_scheduled",
      description: `Scheduled ${workout.name}`,
      date: new Date().toISOString(),
    });
    
    return scheduleId;
  },
});

export const completeWorkout = mutation({
  args: {
    scheduleId: v.id("workoutSchedules"),
    caloriesBurned: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Scheduled workout not found");
    
    // Mark as completed
    await ctx.db.patch(args.scheduleId, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
    });
    
    // Add to workout history
    await ctx.db.insert("workoutHistory", {
      userId: schedule.userId,
      workoutId: schedule.workoutId,
      workoutName: schedule.workoutName,
      duration: schedule.duration,
      completedDate: new Date().toISOString(),
      caloriesBurned: args.caloriesBurned || 0,
      notes: args.notes,
    });
    
    // Award points
    const points = Math.floor(schedule.duration / 10) * 10; // 10 points per 10 minutes
    await ctx.db.insert("pointsHistory", {
      userId: schedule.userId,
      points,
      activity: "workout_completed",
      description: `Completed ${schedule.workoutName}`,
      date: new Date().toISOString(),
    });
    
    // Update streak
    await updateWorkoutStreak(ctx, schedule.userId);
    
    return { success: true, pointsEarned: points };
  },
});

export const cancelWorkout = mutation({
  args: {
    scheduleId: v.id("workoutSchedules"),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Scheduled workout not found");
    
    await ctx.db.delete(args.scheduleId);
    
    return { success: true };
  },
});

async function updateWorkoutStreak(ctx: any, userId: string) {
  const userPoints = await ctx.db
    .query("userPoints")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first();
  
  if (!userPoints) return;
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Check if workout was completed yesterday
  const yesterdayWorkout = await ctx.db
    .query("workoutHistory")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.gte(q.field("completedDate"), yesterday + "T00:00:00.000Z"))
    .filter((q: any) => q.lt(q.field("completedDate"), today + "T00:00:00.000Z"))
    .first();
  
  if (yesterdayWorkout) {
    // Continue streak
    await ctx.db.patch(userPoints._id, {
      workoutStreak: userPoints.workoutStreak + 1,
      lastWorkoutDate: today,
    });
  } else {
    // Reset streak
    await ctx.db.patch(userPoints._id, {
      workoutStreak: 1,
      lastWorkoutDate: today,
    });
  }
}
