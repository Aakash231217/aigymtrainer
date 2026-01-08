import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const getUserProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const progressEntries = await ctx.db
      .query("fitnessProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(100);
    
    return progressEntries;
  },
});

export const logProgress = mutation({
  args: {
    userId: v.string(),
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
  },
  handler: async (ctx, args) => {
    const progressEntry = await ctx.db.insert("fitnessProgress", {
      userId: args.userId,
      date: new Date().toISOString(),
      weight: args.weight,
      bodyFat: args.bodyFat,
      measurements: args.measurements,
    });

    // Award points for logging progress
    await ctx.db.insert("pointsHistory", {
      userId: args.userId,
      points: 10,
      activity: "fitness_progress",
      description: "Logged fitness progress",
      date: new Date().toISOString(),
    });

    return progressEntry;
  },
});
