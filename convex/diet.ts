import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate daily nutrient plan based on user profile
export const generateNutrientPlan = mutation({
  args: {
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) throw new Error("User profile not found");

    // Calculate base requirements
    const weight = profile.weight;
    const goals = profile.fitnessGoals;
    
    // Base calculations
    let proteinMultiplier = 1.6; // g per kg for general fitness
    let carbMultiplier = 3.0; // g per kg
    let fatMultiplier = 0.8; // g per kg

    // Adjust for goals
    if (goals.includes("muscle_gain")) {
      proteinMultiplier = 2.2;
      carbMultiplier = 4.0;
      fatMultiplier = 1.0;
    } else if (goals.includes("fat_loss")) {
      proteinMultiplier = 2.0;
      carbMultiplier = 2.0;
      fatMultiplier = 0.7;
    }

    const targetProtein = Math.round(weight * proteinMultiplier);
    const targetCarbs = Math.round(weight * carbMultiplier);
    const targetFats = Math.round(weight * fatMultiplier);
    const targetCalories = (targetProtein * 4) + (targetCarbs * 4) + (targetFats * 9);

    // Check if plan exists for date
    const existing = await ctx.db
      .query("nutrientPlans")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    const nutrientPlan = {
      userId: args.userId,
      date: args.date,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      targetFiber: 25, // Default 25g
      vitamins: {
        a: 900, // mcg
        b_complex: 100, // mg
        c: 90, // mg
        d: 20, // mcg
        e: 15, // mg
        k: 120, // mcg
      },
      minerals: {
        calcium: 1000, // mg
        iron: profile.gender === "female" ? 18 : 8, // mg
        zinc: profile.gender === "male" ? 11 : 8, // mg
        magnesium: profile.gender === "male" ? 400 : 310, // mg
      },
      omega3: 1000, // mg
      probiotics: true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, nutrientPlan);
      return existing._id;
    } else {
      return await ctx.db.insert("nutrientPlans", nutrientPlan);
    }
  },
});

// Generate meal suggestions based on preferences and nutrient needs
export const generateMealSuggestions = query({
  args: {
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
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    const nutrientPlan = await ctx.db
      .query("nutrientPlans")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    if (!nutrientPlan) return null;

    // Calculate meal-wise split
    const mealSplits = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snack: 0.10,
      pre_workout: 0.15,
      post_workout: 0.20,
    };

    const mealCalories = Math.round(nutrientPlan.targetCalories * mealSplits[args.mealType]);
    const mealProtein = Math.round(nutrientPlan.targetProtein * mealSplits[args.mealType]);
    const mealCarbs = Math.round(nutrientPlan.targetCarbs * mealSplits[args.mealType]);
    const mealFats = Math.round(nutrientPlan.targetFats * mealSplits[args.mealType]);

    // Generate suggestions based on diet preference and cooking style
    const suggestions = getMealSuggestions(
      profile.dietPreference,
      profile.cookingStyle,
      args.mealType,
      {
        calories: mealCalories,
        protein: mealProtein,
        carbs: mealCarbs,
        fats: mealFats,
      },
      profile.allergies,
      profile.cookingTimeAvailable
    );

    return suggestions;
  },
});

// Log consumed meal
export const logMeal = mutation({
  args: {
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
    prepTime: v.optional(v.number()),
    recipe: v.optional(v.string()),
    source: v.union(v.literal("home"), v.literal("restaurant"), v.literal("ordered")),
    restaurantName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Calculate points based on adherence to plan
    const nutrientPlan = await ctx.db
      .query("nutrientPlans")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    let pointsEarned = 10; // Base points for logging
    
    if (nutrientPlan) {
      const totalCalories = args.foods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = args.foods.reduce((sum, food) => sum + food.protein, 0);
      
      // Bonus points for staying within targets
      if (Math.abs(totalCalories - nutrientPlan.targetCalories * 0.3) < 100) {
        pointsEarned += 20;
      }
      if (totalProtein >= nutrientPlan.targetProtein * 0.25) {
        pointsEarned += 15;
      }
    }

    // Extra points for home cooking
    if (args.source === "home") {
      pointsEarned += 25;
    }

    const mealId = await ctx.db.insert("meals", {
      ...args,
      pointsEarned,
      consumed: true,
    });

    // Update user points
    await updateUserPoints(ctx, args.userId, pointsEarned);

    return mealId;
  },
});

// Generate weekly grocery list
export const generateGroceryList = mutation({
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

    // Get meal plans for the week
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(args.weekStartDate);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    // Generate grocery items based on diet preference and cooking style
    const groceryItems = generateWeeklyGroceryItems(
      profile.dietPreference,
      profile.cookingStyle,
      profile.mealBudget,
      profile.mealFrequency,
      profile.allergies
    );

    const groceryListId = await ctx.db.insert("groceryLists", {
      userId: args.userId,
      weekStartDate: args.weekStartDate,
      items: groceryItems,
      totalEstimatedCost: groceryItems.reduce((sum, item) => sum + item.estimatedCost, 0),
      createdAt: Date.now(),
    });

    return groceryListId;
  },
});

// Get daily nutrition summary
export const getDailyNutritionSummary = query({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("consumed"), true))
      .collect();

    const nutrientPlan = await ctx.db
      .query("nutrientPlans")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    const consumed = meals.reduce((acc, meal) => {
      const mealTotals = meal.foods.reduce((totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fats: totals.fats + food.fats,
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

      return {
        calories: acc.calories + mealTotals.calories,
        protein: acc.protein + mealTotals.protein,
        carbs: acc.carbs + mealTotals.carbs,
        fats: acc.fats + mealTotals.fats,
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return {
      consumed,
      target: nutrientPlan ? {
        calories: nutrientPlan.targetCalories,
        protein: nutrientPlan.targetProtein,
        carbs: nutrientPlan.targetCarbs,
        fats: nutrientPlan.targetFats,
      } : null,
      meals,
      adherencePercentage: nutrientPlan ? 
        Math.round((consumed.calories / nutrientPlan.targetCalories) * 100) : 0,
    };
  },
});

// Helper functions
function getMealSuggestions(
  dietPreference: string,
  cookingStyle: string,
  mealType: string,
  macros: { calories: number; protein: number; carbs: number; fats: number },
  allergies: string[],
  cookingTime: number
) {
  // This would integrate with a meal database or AI service
  // For now, returning mock data based on preferences
  const suggestions = [];

  if (cookingStyle === "lazy" || cookingTime <= 10) {
    suggestions.push({
      mode: "quick",
      meals: getQuickMeals(dietPreference, mealType, macros, allergies),
    });
  } else if (cookingStyle === "active") {
    suggestions.push({
      mode: "cook",
      meals: getCookingMeals(dietPreference, mealType, macros, allergies),
    });
  }

  suggestions.push({
    mode: "order",
    meals: getRestaurantOptions(dietPreference, mealType, macros, allergies),
  });

  return suggestions;
}

function getQuickMeals(dietPreference: string, mealType: string, macros: any, allergies: string[]) {
  // Mock quick meal suggestions
  return [
    {
      name: "Quick Oats Bowl",
      prepTime: 5,
      foods: [
        { name: "Oats", quantity: 60, unit: "g", calories: 222, protein: 8, carbs: 38, fats: 4 },
        { name: "Banana", quantity: 1, unit: "medium", calories: 105, protein: 1, carbs: 27, fats: 0 },
        { name: "Almonds", quantity: 10, unit: "pieces", calories: 70, protein: 3, carbs: 2, fats: 6 },
      ],
    },
  ];
}

function getCookingMeals(dietPreference: string, mealType: string, macros: any, allergies: string[]) {
  // Mock cooking meal suggestions
  return [
    {
      name: "Grilled Chicken Salad",
      prepTime: 20,
      recipe: "1. Grill chicken breast\n2. Mix lettuce, tomatoes, cucumber\n3. Add dressing",
      foods: [
        { name: "Chicken Breast", quantity: 150, unit: "g", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
        { name: "Mixed Salad", quantity: 200, unit: "g", calories: 40, protein: 2, carbs: 8, fats: 0.5 },
        { name: "Olive Oil", quantity: 1, unit: "tbsp", calories: 120, protein: 0, carbs: 0, fats: 14 },
      ],
    },
  ];
}

function getRestaurantOptions(dietPreference: string, mealType: string, macros: any, allergies: string[]) {
  // Mock restaurant suggestions
  return [
    {
      name: "Subway Protein Bowl",
      restaurant: "Subway",
      estimatedCost: 250,
      foods: [
        { name: "Protein Bowl", quantity: 1, unit: "bowl", calories: 350, protein: 30, carbs: 25, fats: 15 },
      ],
    },
  ];
}

function generateWeeklyGroceryItems(
  dietPreference: string,
  cookingStyle: string,
  budget: number,
  mealFrequency: number,
  allergies: string[]
) {
  // Mock grocery list generation
  const baseItems = [
    { name: "Brown Rice", quantity: 2, unit: "kg", category: "grains", estimatedCost: 150, purchased: false },
    { name: "Chicken Breast", quantity: 1.5, unit: "kg", category: "protein", estimatedCost: 450, purchased: false },
    { name: "Mixed Vegetables", quantity: 2, unit: "kg", category: "vegetables", estimatedCost: 100, purchased: false },
    { name: "Eggs", quantity: 30, unit: "pieces", category: "protein", estimatedCost: 210, purchased: false },
    { name: "Milk", quantity: 4, unit: "liters", category: "dairy", estimatedCost: 200, purchased: false },
    { name: "Bananas", quantity: 12, unit: "pieces", category: "fruits", estimatedCost: 60, purchased: false },
    { name: "Oats", quantity: 1, unit: "kg", category: "grains", estimatedCost: 120, purchased: false },
  ];

  // Filter out items based on diet preference and allergies
  return baseItems.filter(item => {
    if (dietPreference === "veg" && ["Chicken Breast", "Fish"].includes(item.name)) {
      return false;
    }
    if (allergies.includes("dairy") && ["Milk", "Cheese"].includes(item.name)) {
      return false;
    }
    return true;
  });
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
  } else {
    await ctx.db.insert("userPoints", {
      userId,
      totalPoints: points,
      currentStreak: 1,
      longestStreak: 1,
      level: 1,
      achievements: [],
      weeklyPoints: points,
      monthlyPoints: points,
      lastActiveDate: new Date().toISOString().split('T')[0],
    });
  }
}

// Get current diet plan for user
export const getCurrentDietPlan = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get the most recent nutrient plan
    const nutrientPlan = await ctx.db
      .query("nutrientPlans")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    if (!nutrientPlan) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      id: nutrientPlan._id,
      name: `${profile?.dietPreference || 'Balanced'} Diet Plan`,
      description: `Customized nutrition plan based on your ${profile?.fitnessGoals.join(', ')} goals`,
      dietType: profile?.dietPreference || 'balanced',
      targetCalories: nutrientPlan.targetCalories,
      targetProtein: nutrientPlan.targetProtein,
      targetCarbs: nutrientPlan.targetCarbs,
      targetFats: nutrientPlan.targetFats,
      meals: ['breakfast', 'lunch', 'dinner', 'snacks'],
      restrictions: profile?.allergies || [],
      createdAt: nutrientPlan.date,
    };
  },
});

// Get meals for a specific day
export const getDayMeals = query({
  args: { 
    userId: v.string(),
    date: v.string()
  },
  handler: async (ctx, args) => {
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();

    // Group meals by type
    const mealsByType = {
      breakfast: meals.filter(m => m.mealType === 'breakfast'),
      lunch: meals.filter(m => m.mealType === 'lunch'),
      dinner: meals.filter(m => m.mealType === 'dinner'),
      snack: meals.filter(m => m.mealType === 'snack'),
      pre_workout: meals.filter(m => m.mealType === 'pre_workout'),
      post_workout: meals.filter(m => m.mealType === 'post_workout'),
    };

    return mealsByType;
  },
});

// Alias for getDailyNutritionSummary to match component usage
export const getDayNutrientSummary = query({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Call the existing getDailyNutritionSummary function
    // Manually compute the daily nutrition summary
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();

    const nutrientPlan = await ctx.db
      .query("nutrientPlans")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    const consumed = meals
      .filter(m => m.consumed)
      .reduce((acc, meal) => {
        const mealTotals = meal.foods.reduce((foodAcc, food) => ({
          calories: foodAcc.calories + food.calories,
          protein: foodAcc.protein + food.protein,
          carbs: foodAcc.carbs + food.carbs,
          fats: foodAcc.fats + food.fats,
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
        
        return {
          calories: acc.calories + mealTotals.calories,
          protein: acc.protein + mealTotals.protein,
          carbs: acc.carbs + mealTotals.carbs,
          fats: acc.fats + mealTotals.fats,
        };
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const target = nutrientPlan ? {
      calories: nutrientPlan.targetCalories,
      protein: nutrientPlan.targetProtein,
      carbs: nutrientPlan.targetCarbs,
      fats: nutrientPlan.targetFats,
    } : null;

    const adherencePercentage = target
      ? Math.round((consumed.calories / target.calories) * 100)
      : 0;

    return {
      consumed,
      target,
      meals: meals.map(m => {
        const mealCalories = m.foods.reduce((sum, food) => sum + food.calories, 0);
        return {
          mealType: m.mealType,
          consumed: m.consumed,
          calories: mealCalories,
        };
      }),
      adherencePercentage,
    };
  },
});

// Get grocery list for user
export const getGroceryList = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get the most recent grocery list
    const groceryList = await ctx.db
      .query("groceryLists")
      .withIndex("by_user_week", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    if (!groceryList) return null;

    return {
      ...groceryList,
      // Group items by category
      itemsByCategory: groceryList.items.reduce((acc: any, item: any) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {}),
    };
  },
});
