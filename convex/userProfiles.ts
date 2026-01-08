import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrUpdateProfile = mutation({
  args: {
    userId: v.string(),
    // Basic info
    age: v.number(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    weight: v.number(),
    height: v.number(),
    targetWeight: v.optional(v.number()),
    bodyFat: v.optional(v.number()),
    
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
      v.literal("sedentary"),
      v.literal("semi_active"),
      v.literal("highly_active")
    ),
    preferredWorkoutTime: v.union(
      v.literal("early_morning"),
      v.literal("morning"),
      v.literal("afternoon"),
      v.literal("evening"),
      v.literal("night")
    ),
    timeAvailability: v.number(),
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
    cookingTimeAvailable: v.number(),
    kitchenEquipment: v.array(v.string()),
    allergies: v.array(v.string()),
    medicalConditions: v.array(v.string()),
    mealBudget: v.number(),
    currentSupplements: v.array(v.string()),
    supplementsBudget: v.number(),
    equipmentAccess: v.union(v.literal("gym"), v.literal("home"), v.literal("both")),
    location: v.string(),
    tasteProfile: v.array(v.string()),
    mealFrequency: v.number(),
    
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
    mentalHealthTime: v.number(),
    socialLevel: v.union(v.literal("introvert"), v.literal("neutral"), v.literal("extrovert")),
    sleepQuality: v.number(),
    sleepHours: v.number(),
    screenTime: v.number(),
    workScreenTime: v.number(),
    pastTherapy: v.optional(v.boolean()),
    copingPreferences: v.array(v.string()),
    interests: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const profileData = {
      ...args,
      onboardingCompleted: true,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, profileData);
      return existing._id;
    } else {
      return await ctx.db.insert("userProfiles", {
        ...profileData,
        createdAt: Date.now(),
      });
    }
  },
});

export const getUserProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const calculateBMI = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);
    
    let category;
    if (bmi < 18.5) category = "underweight";
    else if (bmi < 25) category = "normal";
    else if (bmi < 30) category = "overweight";
    else category = "obese";

    return { bmi: bmi.toFixed(1), category };
  },
});

export const calculateDailyCalories = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    // Mifflin-St Jeor Equation
    let bmr;
    if (profile.gender === "male") {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    // Activity multiplier
    let activityMultiplier;
    switch (profile.gymStyle) {
      case "sedentary":
        activityMultiplier = 1.2;
        break;
      case "semi_active":
        activityMultiplier = 1.55;
        break;
      case "highly_active":
        activityMultiplier = 1.9;
        break;
    }

    const maintenanceCalories = bmr * activityMultiplier;

    // Adjust for goals
    let targetCalories = maintenanceCalories;
    if (profile.fitnessGoals.includes("fat_loss")) {
      targetCalories = maintenanceCalories - 500; // 500 calorie deficit
    } else if (profile.fitnessGoals.includes("muscle_gain")) {
      targetCalories = maintenanceCalories + 300; // 300 calorie surplus
    }

    return {
      bmr: Math.round(bmr),
      maintenanceCalories: Math.round(maintenanceCalories),
      targetCalories: Math.round(targetCalories),
    };
  },
});
