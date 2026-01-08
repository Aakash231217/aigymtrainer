import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Meal ordering integration
export const createMealOrder = mutation({
  args: {
    userId: v.string(),
    mealId: v.id("meals"),
    deliveryAddress: v.string(),
    deliveryTime: v.string(),
    paymentMethod: v.union(v.literal("cod"), v.literal("online"), v.literal("wallet")),
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const meal = await ctx.db.get(args.mealId);
    if (!meal) throw new Error("Meal not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) throw new Error("User profile not found");

    // Calculate order total
    const mealCost = calculateMealCost(meal.foods);
    const deliveryFee = 40; // Fixed delivery fee
    const taxes = Math.round(mealCost * 0.05); // 5% tax
    const totalAmount = mealCost + deliveryFee + taxes;

    // Create order
    const orderId = await ctx.db.insert("mealOrders", {
      userId: args.userId,
      mealId: args.mealId,
      restaurantName: meal.restaurantName || "Partner Restaurant",
      items: meal.foods.map(food => ({
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        price: estimateFoodPrice(food.name, food.quantity),
      })),
      deliveryAddress: args.deliveryAddress,
      deliveryTime: args.deliveryTime,
      orderStatus: "pending",
      paymentMethod: args.paymentMethod,
      paymentStatus: args.paymentMethod === "cod" ? "pending" : "processing",
      subtotal: mealCost,
      deliveryFee,
      taxes,
      totalAmount,
      specialInstructions: args.specialInstructions,
      createdAt: Date.now(),
      estimatedDeliveryTime: Date.now() + (45 * 60 * 1000), // 45 minutes
    });

    // Award points for ordering healthy meal
    await updateUserPoints(ctx, args.userId, 30);

    return {
      orderId,
      totalAmount,
      estimatedDeliveryTime: new Date(Date.now() + (45 * 60 * 1000)).toISOString(),
    };
  },
});

// Create grocery order from list
export const createGroceryOrder = mutation({
  args: {
    userId: v.string(),
    groceryListId: v.id("groceryLists"),
    selectedItems: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      unit: v.string(),
    })),
    deliveryAddress: v.string(),
    deliverySlot: v.string(),
    paymentMethod: v.union(v.literal("cod"), v.literal("online"), v.literal("wallet")),
  },
  handler: async (ctx, args) => {
    const groceryList = await ctx.db.get(args.groceryListId);
    if (!groceryList) throw new Error("Grocery list not found");

    // Calculate order total
    let subtotal = 0;
    const orderItems = args.selectedItems.map(item => {
      const listItem = groceryList.items.find(i => i.name === item.name);
      const price = listItem?.estimatedCost || estimateGroceryPrice(item.name, item.quantity);
      subtotal += price;
      return {
        ...item,
        price,
      };
    });

    const deliveryFee = subtotal > 500 ? 0 : 30; // Free delivery above ₹500
    const totalAmount = subtotal + deliveryFee;

    // Create order
    const orderId = await ctx.db.insert("groceryOrders", {
      userId: args.userId,
      groceryListId: args.groceryListId,
      vendor: "Local Grocery Partner",
      items: orderItems,
      deliveryAddress: args.deliveryAddress,
      deliverySlot: args.deliverySlot,
      orderStatus: "pending",
      paymentMethod: args.paymentMethod,
      paymentStatus: args.paymentMethod === "cod" ? "pending" : "processing",
      subtotal,
      deliveryFee,
      totalAmount,
      createdAt: Date.now(),
    });

    // Update grocery list items as purchased
    const updatedItems = groceryList.items.map(item => {
      const isPurchased = args.selectedItems.some(s => s.name === item.name);
      return { ...item, purchased: isPurchased };
    });

    await ctx.db.patch(args.groceryListId, { items: updatedItems });

    // Award points for grocery shopping
    await updateUserPoints(ctx, args.userId, 50);

    return {
      orderId,
      totalAmount,
      deliverySlot: args.deliverySlot,
    };
  },
});

// Get order status
export const getOrderStatus = query({
  args: {
    orderId: v.union(v.id("mealOrders"), v.id("groceryOrders")),
    orderType: v.union(v.literal("meal"), v.literal("grocery")),
  },
  handler: async (ctx, args) => {
    if (args.orderType === "meal") {
      const order = await ctx.db
        .query("mealOrders")
        .filter((q) => q.eq(q.field("_id"), args.orderId))
        .first();
      if (!order) return null;

      return {
        orderStatus: order.orderStatus,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        deliveryPersonName: order.deliveryPersonName,
        deliveryPersonPhone: order.deliveryPersonPhone,
        trackingUrl: order.trackingUrl,
      };
    } else {
      const order = await ctx.db
        .query("groceryOrders")
        .filter((q) => q.eq(q.field("_id"), args.orderId))
        .first();
      if (!order) return null;

      return {
        orderStatus: order.orderStatus,
        deliverySlot: order.deliverySlot,
        trackingUrl: order.trackingUrl,
      };
    }
  },
});

// Get user's order history
export const getOrderHistory = query({
  args: {
    userId: v.string(),
    orderType: v.optional(v.union(v.literal("meal"), v.literal("grocery"), v.literal("all"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const orderType = args.orderType || "all";

    let mealOrders: any[] = [];
    let groceryOrders: any[] = [];

    if (orderType === "meal" || orderType === "all") {
      mealOrders = await ctx.db
        .query("mealOrders")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit);
    }

    if (orderType === "grocery" || orderType === "all") {
      groceryOrders = await ctx.db
        .query("groceryOrders")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit);
    }

    // Combine and sort by date
    const allOrders = [
      ...mealOrders.map(o => ({ ...o, type: "meal" as const })),
      ...groceryOrders.map(o => ({ ...o, type: "grocery" as const })),
    ].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);

    return allOrders;
  },
});

// Get available restaurants/vendors
export const getAvailableVendors = query({
  args: {
    userId: v.string(),
    vendorType: v.union(v.literal("restaurant"), v.literal("grocery")),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return [];

    // Mock vendor data based on location
    if (args.vendorType === "restaurant") {
      return getRestaurantsByLocation(profile.location, profile.dietPreference);
    } else {
      return getGroceryStoresByLocation(profile.location);
    }
  },
});

// Check cooking mood and suggest alternatives
export const checkCookingMood = query({
  args: {
    userId: v.string(),
    plannedMealId: v.optional(v.id("meals")),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    // Get recent mental health log
    const recentMentalHealth = await ctx.db
      .query("mentalHealthLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    const energyLevel = recentMentalHealth?.energyLevel === "high" ? 8 : recentMentalHealth?.energyLevel === "balanced" ? 5 : 2;
    const mood = 5; // Default mood since emotionalState is a string

    // Decision tree for cooking mood
    const cookingMoodScore = calculateCookingMood(
      energyLevel as number,
      mood,
      profile.cookingStyle,
      new Date().getHours() // time of day
    );

    const suggestions = {
      mood: cookingMoodScore > 7 ? "ready_to_cook" : 
            cookingMoodScore > 4 ? "maybe_simple" : "order_recommended",
      alternatives: [] as any[],
    };

    if (cookingMoodScore <= 4) {
      // Suggest ordering
      suggestions.alternatives.push({
        type: "order",
        reason: "Low energy detected. Let's order something healthy!",
        options: getQuickHealthyOptions(profile.dietPreference),
      });
    } else if (cookingMoodScore <= 7) {
      // Suggest simple recipes
      suggestions.alternatives.push({
        type: "simple_recipe",
        reason: "How about something quick and easy?",
        options: getSimpleRecipes(profile.dietPreference, profile.cookingTimeAvailable),
      });
    }

    return suggestions;
  },
});

// Helper functions
function calculateMealCost(foods: any[]) {
  return foods.reduce((total, food) => {
    return total + estimateFoodPrice(food.name, food.quantity);
  }, 0);
}

function estimateFoodPrice(foodName: string, quantity: number): number {
  // Mock pricing logic
  const basePrices: { [key: string]: number } = {
    "chicken": 200,
    "rice": 50,
    "vegetables": 80,
    "salad": 60,
    "bread": 40,
    "eggs": 60,
    "fruits": 100,
  };

  const category = Object.keys(basePrices).find(cat => 
    foodName.toLowerCase().includes(cat)
  ) || "default";

  return basePrices[category] || 100;
}

function estimateGroceryPrice(itemName: string, quantity: number): number {
  // Mock grocery pricing
  const unitPrices: { [key: string]: number } = {
    "rice": 60, // per kg
    "wheat": 40,
    "oil": 150,
    "vegetables": 40,
    "fruits": 80,
    "milk": 50, // per liter
    "eggs": 7, // per piece
  };

  const category = Object.keys(unitPrices).find(cat => 
    itemName.toLowerCase().includes(cat)
  ) || "default";

  return (unitPrices[category] || 50) * quantity;
}

function getRestaurantsByLocation(location: string, dietPreference: string) {
  // Mock restaurant data
  const restaurants = [
    {
      id: "1",
      name: "Healthy Bowl Co.",
      cuisine: "Health Food",
      rating: 4.5,
      deliveryTime: "30-40 min",
      minOrder: 200,
      vegetarian: true,
      vegan: true,
    },
    {
      id: "2",
      name: "Protein Kitchen",
      cuisine: "Fitness Food",
      rating: 4.3,
      deliveryTime: "25-35 min",
      minOrder: 250,
      vegetarian: false,
      vegan: false,
    },
    {
      id: "3",
      name: "Green Leaf Cafe",
      cuisine: "Salads & Smoothies",
      rating: 4.6,
      deliveryTime: "20-30 min",
      minOrder: 150,
      vegetarian: true,
      vegan: true,
    },
  ];

  // Filter by diet preference
  return restaurants.filter(r => {
    if (dietPreference === "veg" || dietPreference === "vegan") {
      return r.vegetarian;
    }
    return true;
  });
}

function getGroceryStoresByLocation(location: string) {
  // Mock grocery store data
  return [
    {
      id: "1",
      name: "Fresh Mart",
      type: "Supermarket",
      rating: 4.4,
      deliverySlots: ["9-11 AM", "2-4 PM", "6-8 PM"],
      minOrder: 300,
    },
    {
      id: "2",
      name: "Organic Valley",
      type: "Organic Store",
      rating: 4.7,
      deliverySlots: ["10-12 PM", "3-5 PM", "7-9 PM"],
      minOrder: 500,
    },
  ];
}

function calculateCookingMood(
  energyLevel: number,
  mood: number,
  cookingStyle: string,
  hourOfDay: number
): number {
  let score = 5; // Base score

  // Energy level impact
  score += (energyLevel - 5) * 0.8;

  // Mood impact
  score += (mood - 5) * 0.5;

  // Cooking style impact
  if (cookingStyle === "active") score += 2;
  else if (cookingStyle === "lazy") score -= 2;

  // Time of day impact
  if (hourOfDay >= 20 || hourOfDay <= 7) score -= 1; // Late night/early morning
  if (hourOfDay >= 11 && hourOfDay <= 14) score += 1; // Lunch time energy

  return Math.max(0, Math.min(10, score));
}

function getQuickHealthyOptions(dietPreference: string) {
  const options = [
    {
      name: "Grilled Protein Bowl",
      restaurant: "Healthy Bowl Co.",
      time: "30 min",
      calories: 450,
    },
    {
      name: "Fresh Salad Combo",
      restaurant: "Green Leaf Cafe",
      time: "25 min",
      calories: 350,
    },
  ];

  if (dietPreference === "non_veg") {
    options.push({
      name: "Chicken Quinoa Bowl",
      restaurant: "Protein Kitchen",
      time: "35 min",
      calories: 500,
    });
  }

  return options;
}

function getSimpleRecipes(dietPreference: string, cookingTime: number) {
  const recipes = [
    {
      name: "Quick Oats Upma",
      time: 10,
      difficulty: "easy",
      calories: 300,
    },
    {
      name: "Veggie Scrambled Eggs",
      time: 15,
      difficulty: "easy",
      calories: 250,
    },
  ];

  if (cookingTime >= 20) {
    recipes.push({
      name: "Quinoa Salad Bowl",
      time: 20,
      difficulty: "medium",
      calories: 400,
    });
  }

  return recipes.filter(r => r.time <= cookingTime);
}

async function updateUserPoints(ctx: any, userId: string, points: number) {
  const userPoints = await ctx.db
    .query("userPoints")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
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

// Tables for orders (to be added to schema)
// mealOrders: orders for prepared meals from restaurants
// groceryOrders: orders for grocery items
