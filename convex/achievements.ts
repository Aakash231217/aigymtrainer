import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userPoints = await ctx.db
      .query("userPoints")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .first();
    
    if (!userPoints) {
      // Create default user points if not exists
      // Can't insert in a query, return null instead
      return null;
      /*const newPoints = await ctx.db.insert("userPoints", {
        userId: args.userId,
        totalPoints: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
        level: 1,
        workoutStreak: 0,
        dietStreak: 0,
        mentalHealthStreak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
      });*/
      
      /*return {
        _id: newPoints,
        userId: args.userId,
        totalPoints: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
        level: 1,
        workoutStreak: 0,
        dietStreak: 0,
        mentalHealthStreak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
      };*/
    }
    
    return userPoints;
  },
});

export const getUserAchievements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Get all possible achievements
    const allAchievements = await ctx.db.query("achievements").collect();
    
    // Map user achievements to full achievement data
    const userAchievementIds = new Set(achievements.map(a => a.achievementId));
    const achievementsWithStatus = allAchievements.map(achievement => ({
      ...achievement,
      isUnlocked: userAchievementIds.has(achievement._id),
      unlockedDate: achievements.find(a => a.achievementId === achievement._id)?.unlockedDate,
    }));
    
    return achievementsWithStatus;
  },
});

export const getLeaderboard = query({
  args: { timeframe: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("allTime")) },
  handler: async (ctx, args) => {
    const pointsField = args.timeframe === "weekly" 
      ? "weeklyPoints" 
      : args.timeframe === "monthly" 
      ? "monthlyPoints" 
      : "totalPoints";
    
    const topUsers = await ctx.db
      .query("userPoints")
      .order("desc")
      .take(10);
    
    // Sort by the appropriate points field
    const sorted = topUsers.sort((a, b) => b[pointsField] - a[pointsField]);
    
    // Get user profiles for names
    const leaderboard = await Promise.all(
      sorted.map(async (userPoints, index) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", userPoints.userId))
          .first();
        
        return {
          rank: index + 1,
          userId: userPoints.userId,
          name: `User${userPoints.userId.slice(-4)}`,
          points: userPoints[pointsField],
          level: userPoints.level,
        };
      })
    );
    
    return leaderboard;
  },
});

export const getAvailableRewards = query({
  args: {},
  handler: async (ctx, args) => {
    const rewards = await ctx.db.query("rewards").collect();
    
    return rewards.filter(reward => reward.isActive);
  },
});

export const redeemReward = mutation({
  args: {
    userId: v.string(),
    rewardId: v.id("rewards"),
  },
  handler: async (ctx, args) => {
    const reward = await ctx.db.get(args.rewardId);
    if (!reward) throw new Error("Reward not found");
    
    const userPoints = await ctx.db
      .query("userPoints")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .first();
    
    if (!userPoints) throw new Error("User points not found");
    
    if (userPoints.totalPoints < reward.pointsCost) {
      throw new Error("Insufficient points");
    }
    
    // Deduct points
    await ctx.db.patch(userPoints._id, {
      totalPoints: userPoints.totalPoints - reward.pointsCost,
    });
    
    // Record redemption
    const redemptionId = await ctx.db.insert("rewardRedemptions", {
      userId: args.userId,
      rewardId: args.rewardId,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
      redeemedAt: new Date().toISOString(),
      status: "pending",
    });
    
    return { 
      success: true, 
      redemptionId,
      remainingPoints: userPoints.totalPoints - reward.pointsCost,
    };
  },
});

// Helper function to check and award achievements
export const checkAndAwardAchievements = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userPoints = await ctx.db
      .query("userPoints")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .first();
    
    if (!userPoints) return;
    
    const achievements = await ctx.db.query("achievements").collect();
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const unlockedIds = new Set(userAchievements.map(a => a.achievementId));
    
    for (const achievement of achievements) {
      if (!unlockedIds.has(achievement._id)) {
        let shouldUnlock = false;
        
        // Check achievement criteria
        switch (achievement.type) {
          case "points":
            shouldUnlock = userPoints.totalPoints >= achievement.requirement;
            break;
          case "streak":
            if (achievement.category === "workout") {
              shouldUnlock = userPoints.workoutStreak >= achievement.requirement;
            } else if (achievement.category === "diet") {
              shouldUnlock = userPoints.dietStreak >= achievement.requirement;
            } else if (achievement.category === "mental_health") {
              shouldUnlock = userPoints.mentalHealthStreak >= achievement.requirement;
            }
            break;
          case "level":
            shouldUnlock = userPoints.level >= achievement.requirement;
            break;
        }
        
        if (shouldUnlock) {
          await ctx.db.insert("userAchievements", {
            userId: args.userId,
            achievementId: achievement._id,
            unlockedDate: new Date().toISOString(),
          });
          
          // Award bonus points
          await ctx.db.patch(userPoints._id, {
            totalPoints: userPoints.totalPoints + achievement.bonusPoints,
          });
        }
      }
    }
  },
});
