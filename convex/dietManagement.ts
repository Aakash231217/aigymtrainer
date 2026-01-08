import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const getTodayNutrition = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    const nutrition = await ctx.db
      .query("dailyNutrition")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("date"), today))
      .first();
    
    return nutrition || {
      userId: args.userId,
      date: today,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      targetCalories: 2000,
      targetProtein: 150,
      targetCarbs: 250,
      targetFat: 65,
      targetFiber: 30,
    };
  },
});

export const getDietPlan = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const dietPlan = await ctx.db
      .query("dietPlans")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    return dietPlan;
  },
});

export const getGroceryList = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const groceryList = await ctx.db
      .query("groceryLists")
      .withIndex("by_user_week", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
    
    return groceryList || {
      userId: args.userId,
      items: [],
      createdAt: new Date().toISOString(),
    };
  },
});

export const getSupplements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    // Mock supplement recommendations based on fitness goals
    const supplements = [];
    if (userProfile?.fitnessGoals?.includes("muscle_gain")) {
      supplements.push({
        name: "Whey Protein",
        description: "25g protein per serving",
        recommendation: "Post-workout",
      });
      supplements.push({
        name: "Creatine Monohydrate",
        description: "5g daily",
        recommendation: "Pre or post-workout",
      });
    }
    if (userProfile?.fitnessGoals?.includes("fat_loss")) {
      supplements.push({
        name: "L-Carnitine",
        description: "Fat metabolism support",
        recommendation: "Before cardio",
      });
    }
    supplements.push({
      name: "Multivitamin",
      description: "Complete micronutrient support",
      recommendation: "With breakfast",
    });
    
    return supplements;
  },
});

export const logMeal = mutation({
  args: {
    userId: v.string(),
    mealType: v.string(),
    foodItems: v.array(
      v.object({
        name: v.string(),
        calories: v.number(),
        protein: v.number(),
        carbs: v.number(),
        fat: v.number(),
        fiber: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate totals
    const totals = args.foodItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
        fiber: acc.fiber + (item.fiber || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
    
    // Update daily nutrition
    const existing = await ctx.db
      .query("dailyNutrition")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("date"), today))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        calories: existing.calories + totals.calories,
        protein: existing.protein + totals.protein,
        carbs: existing.carbs + totals.carbs,
        fat: existing.fat + totals.fat,
        fiber: existing.fiber + totals.fiber,
      });
    } else {
      await ctx.db.insert("dailyNutrition", {
        userId: args.userId,
        date: today,
        ...totals,
        targetCalories: 2000,
        targetProtein: 150,
        targetCarbs: 250,
        targetFat: 65,
        targetFiber: 30,
      });
    }

    // Award points
    await ctx.db.insert("pointsHistory", {
      userId: args.userId,
      points: 5,
      activity: "meal_logging",
      description: `Logged ${args.mealType}`,
      date: new Date().toISOString(),
    });

    return { success: true };
  },
});
