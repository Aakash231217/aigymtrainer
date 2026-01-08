import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Initialize user points system
export const initializeUserPoints = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPoints")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("userPoints", {
      userId: args.userId,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      achievements: [],
      weeklyPoints: 0,
      monthlyPoints: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      workoutStreak: 0,
      dietStreak: 0,
      mentalHealthStreak: 0,
    });
  },
});

// Award points for various activities
export const awardPoints = mutation({
  args: {
    userId: v.string(),
    points: v.number(),
    reason: v.string(),
    category: v.union(
      v.literal("workout"),
      v.literal("diet"),
      v.literal("mental_health"),
      v.literal("social"),
      v.literal("consistency"),
      v.literal("achievement")
    ),
  },
  handler: async (ctx, args) => {
    const userPoints = await ctx.db
      .query("userPoints")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .first();

    if (!userPoints) {
      throw new Error("User points not initialized");
    }

    const newTotalPoints = userPoints.totalPoints + args.points;
    const newLevel = calculateLevel(newTotalPoints);

    // Check for level up
    let levelUpBonus = 0;
    if (newLevel > userPoints.level) {
      levelUpBonus = 100 * (newLevel - userPoints.level);
      await createAchievement(ctx, args.userId, `level_${newLevel}`, 
        `Reached Level ${newLevel}!`);
    }

    await ctx.db.patch(userPoints._id, {
      totalPoints: newTotalPoints + levelUpBonus,
      weeklyPoints: userPoints.weeklyPoints + args.points + levelUpBonus,
      monthlyPoints: userPoints.monthlyPoints + args.points + levelUpBonus,
      level: newLevel,
      lastActiveDate: new Date().toISOString().split('T')[0],
    });

    // Check for achievements
    await checkAndAwardAchievements(ctx, args.userId, args.category, userPoints);

    return {
      pointsAwarded: args.points,
      levelUpBonus,
      newLevel,
      totalPoints: newTotalPoints + levelUpBonus,
    };
  },
});

// Get user's gamification status
export const getUserGamificationStatus = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userPoints = await ctx.db
      .query("userPoints")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .first();

    if (!userPoints) return null;

    // Get recent rewards
    const userRewards = await ctx.db
      .query("userRewards")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(5);

    // Calculate points to next level
    const pointsToNextLevel = getPointsRequiredForLevel(userPoints.level + 1) - userPoints.totalPoints;

    // Get leaderboard position
    const leaderboardPosition = await getLeaderboardPosition(ctx, args.userId);

    return {
      ...userPoints,
      pointsToNextLevel,
      levelProgress: getLevelProgress(userPoints.totalPoints, userPoints.level),
      recentRewards: userRewards,
      leaderboardPosition,
    };
  },
});

// Get available rewards
export const getAvailableRewards = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userPoints = await ctx.db
      .query("userPoints")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .first();

    if (!userPoints) return [];

    const allRewards = await ctx.db
      .query("rewards")
      .collect();

    // Filter rewards user can afford and hasn't redeemed recently
    const redeemedRewards = await ctx.db
      .query("userRewards")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const redeemedRewardIds = new Set(
      redeemedRewards
        .filter(r => !r.used && (r as any).expiryDate > Date.now())
        .map(r => r.rewardId)
    );

    return allRewards
      .filter(reward => 
        reward.pointsCost <= userPoints.totalPoints &&
        reward.isActive &&
        (!(reward as any).limitPerUser || 
          redeemedRewards.filter(r => r.rewardId === reward._id).length < (reward as any).limitPerUser)
      )
      .map(reward => ({
        ...reward,
        alreadyRedeemed: redeemedRewardIds.has(reward._id),
      }));
  },
});

// Redeem a reward
export const redeemReward = mutation({
  args: {
    userId: v.string(),
    rewardId: v.id("rewards"),
  },
  handler: async (ctx, args) => {
    const userPoints = await ctx.db
      .query("userPoints")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .first();

    if (!userPoints) throw new Error("User points not initialized");

    const reward = await ctx.db.get(args.rewardId);
    if (!reward) throw new Error("Reward not found");

    if (userPoints.totalPoints < reward.pointsCost) {
      throw new Error("Insufficient points");
    }

    // Check redemption limit
    if ((reward as any).limitPerUser) {
      const previousRedemptions = await ctx.db
        .query("userRewards")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("rewardId"), args.rewardId))
        .collect();

      if (previousRedemptions.length >= (reward as any).limitPerUser) {
        throw new Error("Redemption limit reached for this reward");
      }
    }

    // Deduct points
    await ctx.db.patch(userPoints._id, {
      totalPoints: userPoints.totalPoints - reward.pointsCost,
    });

    // Create user reward
    const userRewardId = await ctx.db.insert("userRewards", {
      userId: args.userId,
      rewardId: args.rewardId,
      redeemedAt: Date.now(),
      expiresAt: (reward as any).validityDays ? Date.now() + ((reward as any).validityDays * 24 * 60 * 60 * 1000) : undefined,
      used: false,
    });

    // Generate redemption code
    const redemptionCode = generateRedemptionCode(userRewardId);

    return {
      userRewardId,
      redemptionCode,
      reward,
      remainingPoints: userPoints.totalPoints - reward.pointsCost,
    };
  },
});

// Get leaderboard
export const getLeaderboard = query({
  args: {
    period: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("all_time")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let sortField: "weeklyPoints" | "monthlyPoints" | "totalPoints";
    switch (args.period) {
      case "weekly":
        sortField = "weeklyPoints";
        break;
      case "monthly":
        sortField = "monthlyPoints";
        break;
      default:
        sortField = "totalPoints";
    }

    const topUsers = await ctx.db
      .query("userPoints")
      .order("desc")
      .take(limit);

    // Sort by the appropriate field
    const sorted = topUsers.sort((a, b) => b[sortField] - a[sortField]);

    // Get user profiles for display names
    const leaderboard = await Promise.all(
      sorted.map(async (points, index) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", points.userId))
          .first();

        return {
          rank: index + 1,
          userId: points.userId,
          displayName: profile ? `User${points.userId.slice(-4)}` : "Anonymous",
          points: points[sortField],
          level: points.level,
          currentStreak: points.currentStreak,
          achievements: points.achievements.length,
        };
      })
    );

    return leaderboard;
  },
});

// Create standard rewards (admin function)
export const createStandardRewards = mutation({
  handler: async (ctx) => {
    const standardRewards = [
      {
        name: "Free Protein Shake",
        description: "Redeem at partner gyms",
        pointsCost: 500,
        type: "supplement_discount" as const,
        availability: 100,
        isActive: true,
      },
      {
        name: "Free Personal Training Session",
        description: "30-minute 1-on-1 session with a certified trainer",
        pointsCost: 1500,
        type: "trainer_session" as const,
        availability: 20,
        isActive: true,
      },
      {
        name: "₹200 Meal Voucher",
        description: "Use on any partnered restaurant order",
        pointsCost: 800,
        type: "meal_voucher" as const,
        availability: 50,
        isActive: true,
      },
      {
        name: "Premium Gym Merchandise",
        description: "Exclusive AI Gym Trainer t-shirt or water bottle",
        pointsCost: 1000,
        type: "gym_merchandise" as const,
        availability: 30,
        isActive: true,
      },
      {
        name: "Sunday Meetup Priority Entry",
        description: "Guaranteed spot in the next Sunday community meetup",
        pointsCost: 300,
        type: "event_entry" as const,
        availability: 40,
        isActive: true,
      },
    ];

    const rewardIds = [];
    for (const reward of standardRewards) {
      const id = await ctx.db.insert("rewards", reward);
      rewardIds.push(id);
    }

    return rewardIds;
  },
});

// Helper functions
function calculateLevel(totalPoints: number): number {
  // Level progression: 0-500 (L1), 501-1500 (L2), 1501-3000 (L3), etc.
  if (totalPoints < 500) return 1;
  if (totalPoints < 1500) return 2;
  if (totalPoints < 3000) return 3;
  if (totalPoints < 5000) return 4;
  if (totalPoints < 8000) return 5;
  if (totalPoints < 12000) return 6;
  if (totalPoints < 17000) return 7;
  if (totalPoints < 23000) return 8;
  if (totalPoints < 30000) return 9;
  return 10;
}

function getPointsRequiredForLevel(level: number): number {
  const levelPoints: { [key: number]: number } = {
    1: 0,
    2: 500,
    3: 1500,
    4: 3000,
    5: 5000,
    6: 8000,
    7: 12000,
    8: 17000,
    9: 23000,
    10: 30000,
  };
  return levelPoints[level] || 30000;
}

function getLevelProgress(totalPoints: number, currentLevel: number): number {
  const currentLevelPoints = getPointsRequiredForLevel(currentLevel);
  const nextLevelPoints = getPointsRequiredForLevel(currentLevel + 1);
  const progress = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
  return Math.min(100, Math.max(0, progress));
}

async function createAchievement(ctx: any, userId: string, achievementId: string, description: string) {
  const userPoints = await ctx.db
    .query("userPoints")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first();

  if (userPoints && !userPoints.achievements.includes(achievementId)) {
    await ctx.db.patch(userPoints._id, {
      achievements: [...userPoints.achievements, achievementId],
    });

    // Award bonus points for achievement
    await ctx.db.patch(userPoints._id, {
      totalPoints: userPoints.totalPoints + 50,
    });
  }
}

async function checkAndAwardAchievements(ctx: any, userId: string, category: string, userPoints: any) {
  // Workout achievements
  if (category === "workout") {
    const workoutCount = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_date", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.neq(q.field("endTime"), undefined))
      .collect();

    if (workoutCount.length === 10 && !userPoints.achievements.includes("first_10_workouts")) {
      await createAchievement(ctx, userId, "first_10_workouts", "Completed 10 workouts!");
    }
    if (workoutCount.length === 50 && !userPoints.achievements.includes("workout_warrior")) {
      await createAchievement(ctx, userId, "workout_warrior", "50 workouts completed!");
    }
  }

  // Streak achievements
  if (userPoints.currentStreak === 7 && !userPoints.achievements.includes("week_streak")) {
    await createAchievement(ctx, userId, "week_streak", "7-day streak!");
  }
  if (userPoints.currentStreak === 30 && !userPoints.achievements.includes("month_streak")) {
    await createAchievement(ctx, userId, "month_streak", "30-day streak!");
  }

  // Diet achievements
  if (category === "diet") {
    const mealLogs = await ctx.db
      .query("meals")
      .withIndex("by_user_date", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("consumed"), true))
      .collect();

    if (mealLogs.length === 50 && !userPoints.achievements.includes("nutrition_tracker")) {
      await createAchievement(ctx, userId, "nutrition_tracker", "Logged 50 meals!");
    }
  }

  // Mental health achievements
  if (category === "mental_health") {
    const mentalHealthLogs = await ctx.db
      .query("mentalHealthLogs")
      .withIndex("by_user_date", (q: any) => q.eq("userId", userId))
      .collect();

    if (mentalHealthLogs.length === 30 && !userPoints.achievements.includes("mindful_month")) {
      await createAchievement(ctx, userId, "mindful_month", "30 days of mental health check-ins!");
    }
  }
}

async function getLeaderboardPosition(ctx: any, userId: string): Promise<number> {
  const allUsers = await ctx.db
    .query("userPoints")
    .order("desc")
    .collect();

  const position = allUsers.findIndex((u: any) => u.userId === userId) + 1;
  return position || 0;
}

function generateRedemptionCode(userRewardId: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `REWARD-${timestamp}-${randomPart}`.toUpperCase();
}

// Reset weekly/monthly points (scheduled function)
export const resetPeriodicPoints = mutation({
  args: {
    period: v.union(v.literal("weekly"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    const allUserPoints = await ctx.db
      .query("userPoints")
      .collect();

    for (const userPoint of allUserPoints) {
      if (args.period === "weekly") {
        await ctx.db.patch(userPoint._id, { weeklyPoints: 0 });
      } else {
        await ctx.db.patch(userPoint._id, { monthlyPoints: 0 });
      }
    }
  },
});
