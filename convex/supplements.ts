import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate supplement recommendations based on user data
export const generateSupplementRecommendations = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) throw new Error("User profile not found");

    // Get recent nutrition data to identify gaps
    const recentNutrientPlans = await ctx.db
      .query("nutrientPlans")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(7);

    const recentMeals = await ctx.db
      .query("meals")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("consumed"), true))
      .order("desc")
      .take(21); // 3 meals x 7 days

    // Analyze nutrient gaps
    const nutrientGaps = analyzeNutrientGaps(
      profile,
      recentNutrientPlans,
      recentMeals
    );

    // Generate recommendations
    const recommendations = generateRecommendations(
      nutrientGaps,
      profile.fitnessGoals,
      profile.currentSupplements,
      profile.supplementsBudget,
      profile.medicalConditions
    );

    // Save recommendations
    // Insert a single recommendation document with all recommendations
    const id = await ctx.db.insert("supplementRecommendations", {
      userId: args.userId,
      recommendations: recommendations.map((r: any) => ({
        name: r.name,
        type: r.type || "supplement",
        brand: r.brand || "Generic",
        dosage: r.dosage,
        timing: r.timing || "daily",
        reason: r.reason,
        priority: (r.priority === "high" ? "essential" : r.priority === "medium" ? "recommended" : "optional") as "essential" | "recommended" | "optional",
        monthlyCoast: r.monthlyCost, // Note: schema has typo "monthlyCoast" instead of "monthlyCost" 
        purchaseLink: r.purchaseLink,
      })),
      totalMonthlyCost: recommendations.reduce((sum: number, r: any) => sum + r.monthlyCost, 0),
      createdAt: Date.now(),
    });

    return { recommendations, count: recommendations.length };
  },
});

// Get current supplement recommendations
export const getSupplementRecommendations = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const recommendations = await ctx.db
      .query("supplementRecommendations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    // Group by priority
    const grouped = {
      high: recommendations.filter((r: any) => r.recommendations?.some((rec: any) => rec.priority === "essential")) || [],
      medium: recommendations.filter((r: any) => r.recommendations?.some((rec: any) => rec.priority === "recommended")) || [],
      low: recommendations.filter((r: any) => r.recommendations?.some((rec: any) => rec.priority === "optional")) || [],
    };

    const totalCost = recommendations.reduce((sum: number, r: any) => sum + (r.totalMonthlyCost || 0), 0);

    return {
      recommendations: grouped,
      totalMonthlyCost: totalCost,
      count: recommendations.length,
    };
  },
});

// Helper functions
function analyzeNutrientGaps(profile: any, nutrientPlans: any[], meals: any[]) {
  const gaps = {
    protein: 0,
    vitamins: {} as any,
    minerals: {} as any,
    omega3: 0,
    fiber: 0,
  };

  if (nutrientPlans.length === 0) return gaps;

  // Calculate average targets
  const avgTargets = nutrientPlans.reduce((acc, plan) => ({
    protein: acc.protein + plan.targetProtein,
    fiber: acc.fiber + plan.targetFiber,
    omega3: acc.omega3 + plan.omega3,
  }), { protein: 0, fiber: 0, omega3: 0 });

  Object.keys(avgTargets).forEach(key => {
    avgTargets[key as keyof typeof avgTargets] /= nutrientPlans.length;
  });

  // Calculate average consumption
  const mealsByDate = meals.reduce((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {} as any);

  const dailyConsumption = Object.values(mealsByDate).map((dayMeals: any) => {
    return dayMeals.reduce((acc: any, meal: any) => {
      const totals = meal.foods.reduce((t: any, food: any) => ({
        protein: t.protein + food.protein,
        carbs: t.carbs + food.carbs,
        fats: t.fats + food.fats,
      }), { protein: 0, carbs: 0, fats: 0 });
      
      return {
        protein: acc.protein + totals.protein,
        carbs: acc.carbs + totals.carbs,
        fats: acc.fats + totals.fats,
      };
    }, { protein: 0, carbs: 0, fats: 0 });
  });

  if (dailyConsumption.length > 0) {
    const avgConsumption = dailyConsumption.reduce((acc, day) => ({
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fats: acc.fats + day.fats,
    }), { protein: 0, carbs: 0, fats: 0 });

    Object.keys(avgConsumption).forEach(key => {
      avgConsumption[key as keyof typeof avgConsumption] /= dailyConsumption.length;
    });

    // Calculate gaps
    gaps.protein = Math.max(0, avgTargets.protein - avgConsumption.protein);
  }

  // Estimate vitamin/mineral gaps based on diet variety
  const dietVariety = calculateDietVariety(meals);
  if (dietVariety < 5) {
    gaps.vitamins.b_complex = true;
    gaps.vitamins.d = true;
    gaps.minerals.zinc = true;
    gaps.minerals.magnesium = true;
  }

  // Check for specific needs based on profile
  if (profile.dietPreference === "veg" || profile.dietPreference === "vegan") {
    gaps.vitamins.b12 = true;
    gaps.minerals.iron = true;
  }

  return gaps;
}

function calculateDietVariety(meals: any[]) {
  const uniqueFoods = new Set();
  meals.forEach(meal => {
    meal.foods.forEach((food: any) => {
      uniqueFoods.add(food.name.toLowerCase());
    });
  });
  return uniqueFoods.size;
}

function generateRecommendations(
  gaps: any,
  fitnessGoals: string[],
  currentSupplements: string[],
  budget: number,
  medicalConditions: string[]
) {
  const recommendations: any[] = [];
  let totalCost = 0;

  // Protein supplement if gap exists
  if (gaps.protein > 20 && !currentSupplements.includes("protein_powder")) {
    recommendations.push({
      name: "Whey Protein Powder",
      reason: `Your diet is ${Math.round(gaps.protein)}g short of daily protein target`,
      dosage: "1 scoop (25g protein) post-workout",
      priority: "high" as const,
      monthlyCost: 2000,
      purchaseLink: "https://example.com/protein",
    });
    totalCost += 2000;
  }

  // Multivitamin for general coverage
  if (Object.keys(gaps.vitamins).length > 2 && !currentSupplements.includes("multivitamin")) {
    recommendations.push({
      name: "Multivitamin Complex",
      reason: "Limited diet variety may cause vitamin deficiencies",
      dosage: "1 tablet daily with breakfast",
      priority: "medium" as const,
      monthlyCost: 500,
      purchaseLink: "https://example.com/multivitamin",
    });
    totalCost += 500;
  }

  // Omega-3 for overall health
  if (!currentSupplements.includes("omega3") && totalCost < budget) {
    recommendations.push({
      name: "Omega-3 Fish Oil",
      reason: "Supports heart health, reduces inflammation",
      dosage: "1000mg daily with meals",
      priority: "medium" as const,
      monthlyCost: 800,
      purchaseLink: "https://example.com/omega3",
    });
    totalCost += 800;
  }

  // Goal-specific supplements
  if (fitnessGoals.includes("muscle_gain") && !currentSupplements.includes("creatine")) {
    recommendations.push({
      name: "Creatine Monohydrate",
      reason: "Proven to increase strength and muscle mass",
      dosage: "5g daily, anytime",
      priority: "high" as const,
      monthlyCost: 600,
      purchaseLink: "https://example.com/creatine",
    });
    totalCost += 600;
  }

  if (fitnessGoals.includes("fat_loss") && !currentSupplements.includes("l_carnitine")) {
    recommendations.push({
      name: "L-Carnitine",
      reason: "May support fat metabolism during exercise",
      dosage: "2g before workout",
      priority: "low" as const,
      monthlyCost: 1200,
      purchaseLink: "https://example.com/l-carnitine",
    });
    totalCost += 1200;
  }

  // Vitamin D for everyone (common deficiency)
  if (!currentSupplements.includes("vitamin_d") && totalCost < budget) {
    recommendations.push({
      name: "Vitamin D3",
      reason: "Common deficiency, supports immunity and bone health",
      dosage: "2000 IU daily",
      priority: "high" as const,
      monthlyCost: 300,
      purchaseLink: "https://example.com/vitamind",
    });
    totalCost += 300;
  }

  // Filter by budget
  return recommendations
    .sort((a: any, b: any) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .filter((rec, index) => {
      const runningTotal = recommendations
        .slice(0, index + 1)
        .reduce((sum, r) => sum + r.monthlyCost, 0);
      return runningTotal <= budget;
    });
}
