import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Target, Zap, Medal, Crown, Flame, Award, Apple, Brain, Users } from "lucide-react";

// Type definitions
interface UserStats {
  totalPoints: number;
  currentStreak: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: keyof typeof achievementCategories;
  tier?: "gold" | "silver" | "bronze";
  points: number;
  progress?: number;
  target?: number;
  unlockedAt?: string;
  earnedAt?: number;
}

interface LeaderboardUser {
  userId: string;
  name: string;
  totalPoints: number;
}

interface Reward {
  _id: string;
  name: string;
  description: string;
  pointsCost: number;
  claimed: boolean;
}

// Helper functions to map achievement IDs to properties
function getAchievementName(id: string): string {
  const achievements: Record<string, string> = {
    "first_workout": "First Workout",
    "week_streak": "Week Warrior",
    "month_streak": "Monthly Master",
    "100_workouts": "Century Club",
    "perfect_form": "Perfect Form",
    "early_bird": "Early Bird",
    "night_owl": "Night Owl",
    "diet_tracker": "Diet Tracker",
    "hydration_hero": "Hydration Hero",
    "mindful_minutes": "Mindful Minutes",
    "social_butterfly": "Social Butterfly",
    "goal_crusher": "Goal Crusher"
  };
  return achievements[id] || "Unknown Achievement";
}

function getAchievementDescription(id: string): string {
  const descriptions: Record<string, string> = {
    "first_workout": "Complete your first workout session",
    "week_streak": "Maintain a 7-day workout streak",
    "month_streak": "Maintain a 30-day workout streak",
    "100_workouts": "Complete 100 workout sessions",
    "perfect_form": "Complete 10 workouts with perfect form score",
    "early_bird": "Complete 5 workouts before 7 AM",
    "night_owl": "Complete 5 workouts after 8 PM",
    "diet_tracker": "Log meals for 7 consecutive days",
    "hydration_hero": "Meet hydration goals for 7 days",
    "mindful_minutes": "Complete 100 minutes of meditation",
    "social_butterfly": "Work out with 5 different buddies",
    "goal_crusher": "Achieve 3 fitness goals"
  };
  return descriptions[id] || "Complete this achievement to unlock";
}

function getAchievementCategory(id: string): keyof typeof achievementCategories {
  const categories: Record<string, keyof typeof achievementCategories> = {
    "first_workout": "fitness",
    "week_streak": "consistency",
    "month_streak": "consistency",
    "100_workouts": "fitness",
    "perfect_form": "fitness",
    "early_bird": "consistency",
    "night_owl": "consistency",
    "diet_tracker": "diet",
    "hydration_hero": "diet",
    "mindful_minutes": "mental",
    "social_butterfly": "social",
    "goal_crusher": "fitness"
  };
  return categories[id] || "fitness";
}

function getAchievementTier(id: string): "gold" | "silver" | "bronze" | undefined {
  const tiers: Record<string, "gold" | "silver" | "bronze"> = {
    "month_streak": "gold",
    "100_workouts": "gold",
    "goal_crusher": "gold",
    "week_streak": "silver",
    "perfect_form": "silver",
    "social_butterfly": "silver",
    "first_workout": "bronze",
    "early_bird": "bronze",
    "night_owl": "bronze",
    "diet_tracker": "bronze",
    "hydration_hero": "bronze",
    "mindful_minutes": "bronze"
  };
  return tiers[id];
}

function getAchievementPoints(id: string): number {
  const points: Record<string, number> = {
    "first_workout": 10,
    "week_streak": 50,
    "month_streak": 200,
    "100_workouts": 500,
    "perfect_form": 100,
    "early_bird": 25,
    "night_owl": 25,
    "diet_tracker": 30,
    "hydration_hero": 30,
    "mindful_minutes": 40,
    "social_butterfly": 60,
    "goal_crusher": 150
  };
  return points[id] || 10;
}

function calculateStreakBonus(streak: number): number {
  if (streak >= 30) return 50;
  if (streak >= 14) return 25;
  if (streak >= 7) return 10;
  if (streak >= 3) return 5;
  return 0;
}

// Move achievementCategories before the component
const achievementCategories = {
  fitness: { icon: Trophy, color: "text-blue-600", bgColor: "bg-blue-100" },
  diet: { icon: Apple, color: "text-green-600", bgColor: "bg-green-100" },
  mental: { icon: Brain, color: "text-purple-600", bgColor: "bg-purple-100" },
  consistency: { icon: Flame, color: "text-orange-600", bgColor: "bg-orange-100" },
  social: { icon: Users, color: "text-pink-600", bgColor: "bg-pink-100" },
} as const;

export default function Achievements({ userId }: { userId: string }) {
  const gamificationStatus = useQuery(api.gamification.getUserGamificationStatus, { userId });
  const userStats = gamificationStatus ? { totalPoints: gamificationStatus.totalPoints, currentStreak: gamificationStatus.currentStreak } as UserStats : undefined;
  // Map achievement IDs to full achievement objects
  const achievementData = gamificationStatus?.achievements || [];
  const achievements = achievementData.map(achievement => {
    // If it's just a string ID, map it to the full object
    if (typeof achievement === 'string') {
      return {
        id: achievement,
        name: getAchievementName(achievement),
        description: getAchievementDescription(achievement),
        category: getAchievementCategory(achievement),
        tier: getAchievementTier(achievement),
        points: getAchievementPoints(achievement),
        unlockedAt: new Date().toISOString(),
        earnedAt: Date.now()
      };
    }
    // If it's already an object, extract the ID properly
    const achievementId = achievement.id;
    if (!achievementId || typeof achievementId !== 'string') {
      console.error('Invalid achievement object missing ID:', achievement);
      return null; // Skip invalid achievements
    }
    return {
      id: achievementId,
      name: getAchievementName(achievementId),
      description: getAchievementDescription(achievementId),
      category: getAchievementCategory(achievementId),
      tier: getAchievementTier(achievementId),
      points: getAchievementPoints(achievementId),
      unlockedAt: new Date().toISOString(),
      earnedAt: Date.now()
    };
  }).filter((achievement) => achievement !== null) as Achievement[];
  const leaderboard = useQuery(api.gamification.getLeaderboard, { period: "all_time" as const }) as LeaderboardUser[] | undefined;
  const rewards = useQuery(api.gamification.getAvailableRewards, { userId }) as Reward[] | undefined;

  const level = gamificationStatus?.level || 1;
  const streakBonus = calculateStreakBonus(gamificationStatus?.currentStreak || 0);
  const nextLevelPoints = gamificationStatus?.pointsToNextLevel || 1000;
  const currentLevelProgress = gamificationStatus?.levelProgress || 0;

  // achievementCategories is now defined outside the component

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Total Points</h3>
                <p className="text-3xl font-bold text-primary">
                  {gamificationStatus?.totalPoints || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Level {level}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Current Streak</h3>
                <p className="text-3xl font-bold text-orange-500">
                  {gamificationStatus?.currentStreak || 0} days
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{streakBonus}% bonus
                </p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">
                  {achievements.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {achievements?.length || 0} total
                </p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold">
                  #{leaderboard ? (leaderboard.findIndex(u => u.userId === userId) + 1 || "--") : "--"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Top {leaderboard ? Math.round(((leaderboard.findIndex(u => u.userId === userId) + 1) / leaderboard.length) * 100) : 0}%
                </p>
              </div>
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <Progress value={currentLevelProgress} max={100} className="mt-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{gamificationStatus?.totalPoints || 0} / {nextLevelPoints} points</span>
              <span>{nextLevelPoints - (gamificationStatus?.totalPoints || 0)} points to next level</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements?.map((achievement) => {
              const category = achievementCategories[achievement.category];
              const Icon = category?.icon || Trophy;
              const isUnlocked = true; // All achievements in the list are unlocked

              return (
                <Card key={achievement.id} className="">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${isUnlocked ? category?.bgColor : "bg-gray-100"}`}>
                        <Icon className={`w-6 h-6 ${isUnlocked ? category?.color : "text-gray-400"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{achievement.name}</h4>
                          {achievement.tier && (
                            <Badge variant={
                              achievement.tier === "gold" ? "default" :
                              achievement.tier === "silver" ? "secondary" :
                              "outline"
                            }>
                              {achievement.tier}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        {achievement.progress !== undefined && achievement.target && (
                          <div className="mt-2">
                            <Progress 
                              value={(Number(achievement.progress) / Number(achievement.target)) * 100} 
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {achievement.progress} / {achievement.target}
                            </p>
                          </div>
                        )}
                        {isUnlocked && (
                          <div className="flex items-center gap-2 mt-2">
                            <Zap className="w-3 h-3 text-yellow-600" />
                            <span className="text-xs font-medium">
                              +{achievement.points} points
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : "Just now"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard?.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-orange-600 text-white" :
                        "bg-muted"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Level {calculateLevel(Number(user.totalPoints) || 0).level}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{user.totalPoints}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards?.map((reward) => (
              <Card key={reward._id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium">{reward.pointsCost || 0} points</span>
                        </div>
                        {reward.claimed ? (
                          <Badge variant="secondary">Claimed</Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            disabled={(userStats?.totalPoints || 0) < (reward.pointsCost || 0)}
                          >
                            Redeem
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function calculateLevel(points: number) {
  const basePoints = 100;
  const multiplier = 1.5;
  
  let level = 1;
  let totalRequired = 0;
  let currentLevelRequired = basePoints;
  
  while (totalRequired + currentLevelRequired <= points) {
    totalRequired += currentLevelRequired;
    level++;
    currentLevelRequired = Math.floor(basePoints * Math.pow(multiplier, level - 1));
  }
  
  const currentLevelPoints = points - totalRequired;
  const nextLevelPoints = currentLevelRequired;
  const progress = (currentLevelPoints / nextLevelPoints) * 100;
  const pointsToNext = nextLevelPoints - currentLevelPoints;
  
  return {
    level,
    currentLevelPoints,
    nextLevelPoints,
    progress,
    pointsToNext,
  };
}


