import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create daily mental health check-in
export const createDailyCheckIn = mutation({
  args: {
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD
    emotionalState: v.string(),
    mindState: v.union(
      v.literal("calm"),
      v.literal("overthinking"),
      v.literal("scattered"),
      v.literal("blank")
    ),
    energyLevel: v.union(v.literal("low"), v.literal("balanced"), v.literal("high")),
    intensityLevel: v.number(), // 1-10
    duration: v.union(
      v.literal("today"),
      v.literal("few_days"),
      v.literal("week_plus")
    ),
    preferredRelief: v.union(v.literal("venting"), v.literal("peace")),
  },
  handler: async (ctx, args) => {
    // Check if log exists for today
    const existing = await ctx.db
      .query("mentalHealthLogs")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    const logData = {
      userId: args.userId,
      date: args.date,
      time: Date.now(),
      emotionalState: args.emotionalState,
      mindState: args.mindState,
      energyLevel: args.energyLevel,
      intensityLevel: args.intensityLevel,
      duration: args.duration,
      preferredRelief: args.preferredRelief,
      stressSource: undefined,
      loopingThought: undefined,
      reliefProvided: undefined,
      weeklyMeetupSuggested: undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, logData);
      return existing._id;
    } else {
      return await ctx.db.insert("mentalHealthLogs", logData);
    }
  },
});

// Answer layer 1 questions
export const answerLayer1 = mutation({
  args: {
    logId: v.id("mentalHealthLogs"),
    answers: v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db.get(args.logId);
    if (!log) throw new Error("Log not found");

    // Generate layer 2 questions based on answers
    const layer2Questions = generateLayer2Questions(log, args.answers);

    await ctx.db.patch(args.logId, {
      emotionalState: analyzeEmotionalState(args.answers),
      mindState: analyzeMindState(args.answers) as any,
    });

    // Award points for engagement
    await updateUserPoints(ctx, log.userId, 15);

    return { layer2Questions };
  },
});

// Answer layer 2 questions
export const answerLayer2 = mutation({
  args: {
    logId: v.id("mentalHealthLogs"),
    answers: v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db.get(args.logId);
    if (!log) throw new Error("Log not found");

    // Generate layer 3 questions based on answers
    const layer3Questions = generateLayer3Questions(log, args.answers);

    await ctx.db.patch(args.logId, {
      stressSource: analyzeStressSource(args.answers) as any,
      loopingThought: extractLoopingThought(args.answers),
    });

    // Award points for deeper engagement
    await updateUserPoints(ctx, log.userId, 20);

    return { layer3Questions };
  },
});

// Answer layer 3 questions and get relief suggestions
export const answerLayer3 = mutation({
  args: {
    logId: v.id("mentalHealthLogs"),
    answers: v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db.get(args.logId);
    if (!log) throw new Error("Log not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", log.userId))
      .first();

    if (!profile) throw new Error("User profile not found");

    // Analyze all answers and generate relief mapping
    const reliefMapping = generateReliefMapping(log, args.answers, profile);

    await ctx.db.patch(args.logId, {
      // intensityLevel, duration, and preferredRelief already set
      // Just set the relief provided
      reliefProvided: generateReliefContent("meditation", profile.mentalHealthTone || "supportive", analyzeCurrentMood(log), profile.interests || []) as any,
      // Store layer 3 completion
      weeklyMeetupSuggested: false,
    });

    // Award points for completing full check-in
    await updateUserPoints(ctx, log.userId, 30);

    // Check if user needs social support
    if (shouldSuggestSocialMeetup(log, profile)) {
      await suggestSundayMeetup(ctx, log.userId, log.date);
    }

    return { reliefMapping };
  },
});

// Get mental health trends
export const getMentalHealthTrends = query({
  args: {
    userId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const logs = await ctx.db
      .query("mentalHealthLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    if (logs.length === 0) return null;

    // Calculate trends
    const moodTrend = logs.map(log => ({
      date: log.date,
      mood: log.emotionalState,
      stress: log.intensityLevel,
      energy: log.energyLevel,
      anxiety: log.intensityLevel,
    }));

    const avgMood = 5; // Default mood value since emotionalState is a string
    const avgStress = logs.reduce((sum, log) => sum + log.intensityLevel, 0) / logs.length;
    const avgEnergy = logs.reduce((sum, log) => sum + (log.energyLevel === "high" ? 8 : log.energyLevel === "balanced" ? 5 : 2), 0) / logs.length;
    const avgAnxiety = logs.reduce((sum, log) => sum + log.intensityLevel, 0) / logs.length;

    // Identify patterns
    const patterns = identifyMentalHealthPatterns(logs);

    return {
      trends: moodTrend,
      averages: {
        mood: avgMood.toFixed(1),
        stress: avgStress.toFixed(1),
        energy: avgEnergy.toFixed(1),
        anxiety: avgAnxiety.toFixed(1),
      },
      patterns,
      totalCheckIns: logs.length,
      streakDays: calculateCheckInStreak(logs),
    };
  },
});

// Get personalized relief content
export const getReliefContent = query({
  args: {
    userId: v.string(),
    contentType: v.union(
      v.literal("music"),
      v.literal("podcasts"),
      v.literal("stories"),
      v.literal("audiobooks"),
      v.literal("meditation"),
      v.literal("breathing")
    ),
    mood: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profileWithReliefContent = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profileWithReliefContent) return null;

    // Get recent mental health data
    const recentLog = await ctx.db
      .query("mentalHealthLogs")
      .withIndex("by_user_date", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    const content = generateReliefContent(
      args.contentType,
      profileWithReliefContent.mentalHealthTone,
      args.mood || (recentLog ? analyzeCurrentMood(recentLog) : "neutral"),
      profileWithReliefContent.interests
    );

    return content;
  },
});

// Helper functions
function generateLayer1Questions(baseAnswers: any) {
  const questions = [];

  if (baseAnswers.stressLevel > 6) {
    questions.push({
      id: "stress_source",
      question: "What's the main source of your stress today?",
      options: ["Work", "Relationships", "Health", "Financial", "Other"],
    });
  }

  if (baseAnswers.sleepQuality < 5) {
    questions.push({
      id: "sleep_issue",
      question: "What affected your sleep?",
      options: ["Couldn't fall asleep", "Woke up multiple times", "Bad dreams", "Physical discomfort"],
    });
  }

  if (baseAnswers.energyLevel < 5) {
    questions.push({
      id: "energy_drain",
      question: "What's draining your energy?",
      options: ["Poor sleep", "Overwork", "Emotional stress", "Physical fatigue", "Poor nutrition"],
    });
  }

  return questions;
}

function generateLayer2Questions(log: any, layer1Answers: any[]) {
  const questions = [];
  
  const stressAnswer = layer1Answers.find(a => a.questionId === "stress_source");
  if (stressAnswer) {
    if (stressAnswer.answer === "Work") {
      questions.push({
        id: "work_stress_detail",
        question: "Which aspect of work is most stressful?",
        options: ["Deadlines", "Workload", "Colleagues", "Uncertainty", "Performance pressure"],
      });
    }
  }

  questions.push({
    id: "coping_preference",
    question: "How would you prefer to cope right now?",
    options: ["Talk to someone", "Be alone", "Physical activity", "Creative activity", "Mindfulness"],
  });

  return questions;
}

function generateLayer3Questions(log: any, layer2Answers: any[]) {
  const questions = [];

  const copingAnswer = layer2Answers.find(a => a.questionId === "coping_preference");
  if (copingAnswer) {
    if (copingAnswer.answer === "Physical activity") {
      questions.push({
        id: "activity_preference",
        question: "What type of physical activity sounds appealing?",
        options: ["Light walk", "Intense workout", "Yoga/stretching", "Dancing", "Sports"],
      });
    } else if (copingAnswer.answer === "Mindfulness") {
      questions.push({
        id: "mindfulness_preference",
        question: "What mindfulness practice would help?",
        options: ["Guided meditation", "Breathing exercises", "Body scan", "Nature sounds", "Journaling"],
      });
    }
  }

  questions.push({
    id: "time_available",
    question: "How much time can you dedicate to self-care now?",
    options: ["5 minutes", "15 minutes", "30 minutes", "1 hour", "More than 1 hour"],
  });

  return questions;
}

function generateReliefMapping(log: any, layer3Answers: any[], profile: any) {
  const mapping = {
    primarySuggestion: "",
    alternativeSuggestions: [] as string[],
    contentType: [] as string[],
    duration: 15,
    intensity: "medium" as "low" | "medium" | "high",
  };

  // Analyze all answers to create personalized relief plan
  const timeAnswer = layer3Answers.find(a => a.questionId === "time_available");
  if (timeAnswer) {
    mapping.duration = parseInt(timeAnswer.answer.split(" ")[0]);
  }

  // Based on mood and preferences
  if (log.anxietyLevel > 7) {
    mapping.primarySuggestion = "Guided breathing exercise for anxiety relief";
    mapping.contentType = ["breathing", "meditation"];
    mapping.intensity = "low";
  } else if (log.energyLevel < 4) {
    mapping.primarySuggestion = "Energizing movement routine";
    mapping.contentType = ["music", "movement"];
    mapping.intensity = "medium";
  }

  // Add alternatives based on profile preferences
  if (profile.preferredContent.includes("music")) {
    mapping.alternativeSuggestions.push("Curated playlist for mood enhancement");
  }
  if (profile.preferredContent.includes("podcasts")) {
    mapping.alternativeSuggestions.push("Motivational podcast episode");
  }

  return mapping;
}

function shouldSuggestSocialMeetup(log: any, profile: any) {
  // Suggest meetup if:
  // - User is not strongly introverted
  // - Mood has been low for multiple days
  // - User indicated preference for talking to someone
  return (
    profile.socialLevel !== "introvert" &&
    log.intensityLevel > 7 &&
    log.preferredRelief === "venting"
  );
}

async function suggestSundayMeetup(ctx: any, userId: string, date: string) {
  // Find or create Sunday meetup for user's area
  const profile = await ctx.db
    .query("userProfiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile) return;

  const nextSunday = getNextSunday(date);
  
  const existingMeetup = await ctx.db
    .query("sundayMeetups")
      .withIndex("by_date", (q: any) => q.eq("date", nextSunday))
      .filter((q: any) => q.eq(q.field("location"), profile.location))
    .first();

  if (existingMeetup && !existingMeetup.registeredUsers.includes(userId)) {
    await ctx.db.patch(existingMeetup._id, {
      registeredUsers: [...existingMeetup.registeredUsers, userId],
    });
  } else if (!existingMeetup) {
    await ctx.db.insert("sundayMeetups", {
      date: nextSunday,
      location: profile.location,
      activities: ["Wellness Walk & Talk"],
      registeredUsers: [userId],
      maxParticipants: 10,
      status: "upcoming" as const,
      createdAt: Date.now(),
    });
  }
}

function identifyMentalHealthPatterns(logs: any[]) {
  const patterns = [];

  // Check for consistent low mood
  const lowMoodDays = logs.filter(log => log.intensityLevel > 7).length;
  if (lowMoodDays > logs.length * 0.5) {
    patterns.push("Persistent low mood detected");
  }

  // Check for high stress patterns
  const highStressDays = logs.filter(log => log.intensityLevel > 7).length;
  if (highStressDays > logs.length * 0.4) {
    patterns.push("Chronic stress pattern identified");
  }

  // Check for sleep issues
  const poorSleepDays = logs.filter(log => log.sleepQuality < 5).length;
  if (poorSleepDays > logs.length * 0.3) {
    patterns.push("Sleep quality needs attention");
  }

  return patterns;
}

function calculateCheckInStreak(logs: any[]) {
  if (logs.length === 0) return 0;

  // Sort by date descending
  const sortedLogs = logs.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 1;
  for (let i = 1; i < sortedLogs.length; i++) {
    const currentDate = new Date(sortedLogs[i].date);
    const prevDate = new Date(sortedLogs[i - 1].date);
    const dayDiff = (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function analyzeEmotionalState(answers: any[]): string {
  // Analyze answers to determine emotional state
  const emotions = answers.map(a => a.answer.toLowerCase());
  if (emotions.some(e => e.includes("anxious") || e.includes("worried"))) return "anxious";
  if (emotions.some(e => e.includes("sad") || e.includes("down"))) return "sad";
  if (emotions.some(e => e.includes("happy") || e.includes("good"))) return "happy";
  return "neutral";
}

function analyzeMindState(answers: any[]): string {
  // Analyze mind state from answers
  const states = answers.map(a => a.answer.toLowerCase());
  if (states.some(s => s.includes("racing") || s.includes("overthinking"))) return "overthinking";
  if (states.some(s => s.includes("scattered") || s.includes("unfocused"))) return "scattered";
  if (states.some(s => s.includes("blank") || s.includes("empty"))) return "blank";
  return "calm";
}

function analyzeStressSource(answers: any[]): string {
  // Analyze stress source from answers
  const sources = answers.map(a => a.answer.toLowerCase());
  if (sources.some(s => s.includes("work") || s.includes("job"))) return "work";
  if (sources.some(s => s.includes("family") || s.includes("home"))) return "family";
  if (sources.some(s => s.includes("relationship") || s.includes("partner"))) return "relationship";
  if (sources.some(s => s.includes("money") || s.includes("financial"))) return "finances";
  if (sources.some(s => s.includes("lonely") || s.includes("alone"))) return "loneliness";
  if (sources.some(s => s.includes("thinking") || s.includes("thoughts"))) return "overthinking";
  return "no_reason";
}

function extractLoopingThought(answers: any[]): string {
  // Extract looping thought from answers
  const thoughts = answers.find(a => a.questionId === "looping_thought");
  return thoughts?.answer || "";
}

function analyzeIntensity(answers: any[]): number {
  // Analyze intensity from answers
  const intensity = answers.find(a => a.questionId === "intensity_level");
  return parseInt(intensity?.answer || "5");
}

function analyzeDuration(answers: any[]): string {
  // Analyze duration from answers
  const durations = answers.map(a => a.answer.toLowerCase());
  if (durations.some(d => d.includes("week") || d.includes("weeks"))) return "week_plus";
  if (durations.some(d => d.includes("days") || d.includes("few days"))) return "few_days";
  return "today";
}

function analyzeReliefPreference(answers: any[]): string {
  // Analyze relief preference from answers
  const prefs = answers.map(a => a.answer.toLowerCase());
  if (prefs.some(p => p.includes("talk") || p.includes("vent") || p.includes("express"))) return "venting";
  return "peace";
}

function analyzeCurrentMood(log: any) {
  // Analyze current mood based on emotional state and intensity
  if (log.emotionalState?.includes("happy") || log.emotionalState?.includes("joy")) return "happy";
  if (log.emotionalState?.includes("content") || log.emotionalState?.includes("peaceful")) return "content";
  if (log.emotionalState?.includes("anxious") || log.emotionalState?.includes("worried")) return "anxious";
  if (log.emotionalState?.includes("sad") || log.emotionalState?.includes("down")) return "low";
  return "neutral";
}

function getMoodEmotionalState(mood: number): string {
  if (mood >= 8) return "happy";
  if (mood >= 6) return "content";
  if (mood >= 4) return "neutral";
  if (mood >= 2) return "sad";
  return "very low";
}

function getStressMindState(stress: number): string {
  if (stress >= 8) return "overthinking";
  if (stress >= 6) return "scattered";
  if (stress >= 3) return "calm";
  return "blank";
}

function generateReliefContent(contentType: string, tone: string, mood: string, interests: string[]) {
  // This would connect to actual content APIs
  // For now, returning mock content suggestions
  const content = {
    type: contentType,
    mood: mood,
    suggestions: [] as any[],
  };

  switch (contentType) {
    case "music":
      content.suggestions = [
        {
          title: "Mood Boost Playlist",
          duration: 30,
          description: "Uplifting tracks to enhance your mood",
          url: "#",
        },
        {
          title: "Calm & Focused",
          duration: 45,
          description: "Ambient music for relaxation",
          url: "#",
        },
      ];
      break;
    case "meditation":
      content.suggestions = [
        {
          title: "5-Minute Breathing Space",
          duration: 5,
          description: "Quick reset for your mind",
          url: "#",
        },
        {
          title: "Body Scan for Relaxation",
          duration: 15,
          description: "Progressive muscle relaxation",
          url: "#",
        },
      ];
      break;
    case "podcasts":
      content.suggestions = [
        {
          title: "The Science of Happiness",
          duration: 25,
          description: "Evidence-based tips for wellbeing",
          url: "#",
        },
      ];
      break;
  }

  return content;
}

function getNextSunday(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const daysUntilSunday = (7 - day) % 7 || 7;
  date.setDate(date.getDate() + daysUntilSunday);
  return date.toISOString().split('T')[0];
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

// Simple mental health logging for the dashboard component
export const logMentalHealth = mutation({
  args: {
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD
    overallMood: v.number(), // 1-10
    stressLevel: v.number(), // 1-10
    sleepQuality: v.number(), // 1-10
    energyLevel: v.union(v.literal("low"), v.literal("balanced"), v.literal("high")),
    anxietyLevel: v.number(), // 1-10
    sleepHours: v.number(),
    activities: v.array(v.string()),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const date = args.date;
    
    // Check if log exists for today
    const existing = await ctx.db
      .query("mentalHealthLogs")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", date)
      )
      .first();

    const logData = {
      userId: args.userId,
      date,
      emotionalState: getMoodEmotionalState(args.overallMood),
      mindState: getStressMindState(args.stressLevel) as any,
      energyLevel: args.energyLevel,
      intensityLevel: Math.round((args.stressLevel + args.anxietyLevel) / 2),
      duration: "today" as const,
      preferredRelief: "peace" as const,
      time: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, logData);
      return existing._id;
    } else {
      return await ctx.db.insert("mentalHealthLogs", {
        userId: logData.userId,
        date: logData.date,
        time: Date.now(),
        emotionalState: "neutral",
        mindState: "calm" as const,
        energyLevel: "balanced" as const,
        intensityLevel: 5,
        duration: "today" as const,
        preferredRelief: "peace" as const,
        stressSource: undefined,
        loopingThought: undefined,
        reliefProvided: undefined,
        weeklyMeetupSuggested: undefined,
      });
    }
  },
});

// Get recent mental health logs for the dashboard
export const getRecentMentalHealthLogs = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 30;
    
    const logs = await ctx.db
      .query("mentalHealthLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return logs.map(log => ({
      _id: log._id,
      date: log.date,
      mood: log.emotionalState,
      energy: log.energyLevel,
      stress: log.intensityLevel,
      anxiety: log.intensityLevel,
      sleepQuality: 5, // Default value since not in schema
      sleepHours: 7, // Default value since not in schema
      activities: [],
      notes: log.loopingThought || "",
    }));
  },
});

// Get personalized mental health recommendations
export const getMentalHealthRecommendations = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get recent logs to analyze patterns
    const recentLogs = await ctx.db
      .query("mentalHealthLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(7);

    if (recentLogs.length === 0) return [];

    const recommendations = [];
    
    // Analyze recent patterns
    const avgMood = 5; // Default mood value since emotionalState is a string
    const avgStress = recentLogs.reduce((sum, log) => sum + log.intensityLevel, 0) / recentLogs.length;
    const avgSleep = 5; // Default sleep quality
    const avgEnergy = recentLogs.reduce((sum, log) => sum + (log.energyLevel === "high" ? 8 : log.energyLevel === "balanced" ? 5 : 2), 0) / recentLogs.length;

    // Generate recommendations based on patterns
    if (avgStress > 7) {
      recommendations.push({
        activity: "Deep Breathing Exercise",
        reason: "Your stress levels have been high. This can help activate your parasympathetic nervous system.",
        duration: 10,
        timeOfDay: "Morning & Evening",
      });
    }

    if (avgSleep < 5) {
      recommendations.push({
        activity: "Sleep Hygiene Routine",
        reason: "Your sleep quality needs improvement. A consistent bedtime routine can help.",
        duration: 30,
        timeOfDay: "Before bed",
      });
    }

    if (avgMood < 5) {
      recommendations.push({
        activity: "Gratitude Journaling",
        reason: "Writing down positive experiences can help improve mood over time.",
        duration: 15,
        timeOfDay: "Morning",
      });
    }

    if (avgEnergy < 5) {
      recommendations.push({
        activity: "Light Exercise",
        reason: "Physical activity can boost energy levels and improve overall wellbeing.",
        duration: 20,
        timeOfDay: "Afternoon",
      });
    }

    // Always include at least one recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        activity: "Mindful Meditation",
        reason: "Regular meditation practice supports overall mental wellness.",
        duration: 10,
        timeOfDay: "Anytime",
      });
    }

    return recommendations;
  },
});
