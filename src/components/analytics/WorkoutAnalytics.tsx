"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Clock,
  Target,
  Trophy,
  Calendar,
  Dumbbell,
  Heart,
  Zap,
  Award,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface WorkoutSession {
  id: string;
  date: string;
  duration: number; // minutes
  caloriesBurned: number;
  exercises: ExercisePerformed[];
  muscleGroups: string[];
  intensity: "low" | "moderate" | "high";
  notes?: string;
}

interface ExercisePerformed {
  exerciseId: string;
  exerciseName: string;
  sets: SetData[];
  muscleGroup: string;
}

interface SetData {
  reps: number;
  weight: number;
  rpe?: number; // Rate of Perceived Exertion
}

interface ProgressData {
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
}

interface WorkoutAnalyticsProps {
  workoutHistory: WorkoutSession[];
  progressData: ProgressData[];
  goals: {
    weeklyWorkouts: number;
    caloriesBurnedWeekly: number;
    targetWeight?: number;
  };
  className?: string;
}

// Color palette
const COLORS = {
  primary: "#22c55e",
  secondary: "#3b82f6",
  accent: "#f59e0b",
  danger: "#ef4444",
  muted: "#6b7280",
  background: "#1f2937",
};

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#ef4444",
  back: "#3b82f6",
  shoulders: "#f59e0b",
  biceps: "#22c55e",
  triceps: "#8b5cf6",
  legs: "#ec4899",
  core: "#14b8a6",
  cardio: "#f97316",
};

// Utility functions
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function calculateTrend(data: number[]): "up" | "down" | "stable" {
  if (data.length < 2) return "stable";
  const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const previous = data.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
  const diff = ((recent - previous) / previous) * 100;
  if (diff > 5) return "up";
  if (diff < -5) return "down";
  return "stable";
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <ChevronUp className="w-4 h-4 text-green-500" />;
  if (trend === "down") return <ChevronDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-500" />;
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color?: string;
}

function StatCard({ title, value, subtitle, icon, trend, trendValue, color = "primary" }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && trendValue && (
              <div className="flex items-center gap-1 text-xs">
                <TrendIcon trend={trend} />
                <span className={cn(
                  trend === "up" && "text-green-500",
                  trend === "down" && "text-red-500",
                  trend === "stable" && "text-gray-500"
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-full",
            color === "primary" && "bg-primary/10 text-primary",
            color === "secondary" && "bg-blue-500/10 text-blue-500",
            color === "accent" && "bg-amber-500/10 text-amber-500",
            color === "danger" && "bg-red-500/10 text-red-500"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Progress Ring Component
function ProgressRing({ progress, size = 120, strokeWidth = 8, label, value }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  value: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted/20"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

// Main Analytics Component
export function WorkoutAnalytics({
  workoutHistory,
  progressData,
  goals,
  className,
}: WorkoutAnalyticsProps) {
  // Calculate summary statistics
  const stats = useMemo(() => {
    const now = new Date();
    const thisWeek = workoutHistory.filter(w => {
      const workoutDate = new Date(w.date);
      const diffDays = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });

    const thisMonth = workoutHistory.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate.getMonth() === now.getMonth() && 
             workoutDate.getFullYear() === now.getFullYear();
    });

    const totalCaloriesThisWeek = thisWeek.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const totalDurationThisWeek = thisWeek.reduce((sum, w) => sum + w.duration, 0);
    const totalWorkoutsThisMonth = thisMonth.length;

    // Calculate streak
    let streak = 0;
    const sortedWorkouts = [...workoutHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    // Muscle group distribution
    const muscleGroupCounts: Record<string, number> = {};
    workoutHistory.forEach(w => {
      w.muscleGroups.forEach(mg => {
        muscleGroupCounts[mg] = (muscleGroupCounts[mg] || 0) + 1;
      });
    });

    // Weekly data for charts
    const last8Weeks = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (7 * (7 - i)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekWorkouts = workoutHistory.filter(w => {
        const wDate = new Date(w.date);
        return wDate >= weekStart && wDate < weekEnd;
      });

      return {
        week: `W${getWeekNumber(weekStart)}`,
        workouts: weekWorkouts.length,
        calories: weekWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0),
        duration: weekWorkouts.reduce((sum, w) => sum + w.duration, 0),
      };
    });

    // Daily data for this week
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayWorkout = workoutHistory.find(w => w.date.startsWith(dateStr));
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: dayWorkout?.caloriesBurned || 0,
        duration: dayWorkout?.duration || 0,
        completed: !!dayWorkout,
      };
    });

    return {
      thisWeek,
      totalCaloriesThisWeek,
      totalDurationThisWeek,
      totalWorkoutsThisMonth,
      streak,
      muscleGroupCounts,
      last8Weeks,
      last7Days,
      caloriesTrend: calculateTrend(last8Weeks.map(w => w.calories)),
      workoutsTrend: calculateTrend(last8Weeks.map(w => w.workouts)),
    };
  }, [workoutHistory]);

  // Muscle group pie chart data
  const muscleGroupData = useMemo(() => {
    return Object.entries(stats.muscleGroupCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: MUSCLE_COLORS[name] || COLORS.muted,
    }));
  }, [stats.muscleGroupCounts]);

  // Progress chart data
  const progressChartData = useMemo(() => {
    return progressData.slice(-30).map(p => ({
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: p.weight,
      bodyFat: p.bodyFat,
      muscleMass: p.muscleMass,
    }));
  }, [progressData]);

  // Goal progress
  const weeklyWorkoutProgress = (stats.thisWeek.length / goals.weeklyWorkouts) * 100;
  const caloriesProgress = (stats.totalCaloriesThisWeek / goals.caloriesBurnedWeekly) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Workouts This Week"
          value={stats.thisWeek.length}
          subtitle={`Goal: ${goals.weeklyWorkouts}`}
          icon={<Dumbbell className="w-6 h-6" />}
          trend={stats.workoutsTrend}
          trendValue="vs last week"
          color="primary"
        />
        <StatCard
          title="Calories Burned"
          value={stats.totalCaloriesThisWeek.toLocaleString()}
          subtitle={`Goal: ${goals.caloriesBurnedWeekly.toLocaleString()}`}
          icon={<Flame className="w-6 h-6" />}
          trend={stats.caloriesTrend}
          trendValue="vs last week"
          color="accent"
        />
        <StatCard
          title="Time Exercising"
          value={formatDuration(stats.totalDurationThisWeek)}
          subtitle="This week"
          icon={<Clock className="w-6 h-6" />}
          color="secondary"
        />
        <StatCard
          title="Current Streak"
          value={`${stats.streak} days`}
          subtitle="Keep it up!"
          icon={<Trophy className="w-6 h-6" />}
          color="accent"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="muscles">Muscles</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-around">
                <ProgressRing
                  progress={Math.min(weeklyWorkoutProgress, 100)}
                  label="Workouts"
                  value={`${stats.thisWeek.length}/${goals.weeklyWorkouts}`}
                />
                <ProgressRing
                  progress={Math.min(caloriesProgress, 100)}
                  label="Calories"
                  value={`${Math.round(caloriesProgress)}%`}
                />
              </CardContent>
            </Card>

            {/* This Week Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  This Week's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.last7Days}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="calories"
                      fill={COLORS.primary}
                      radius={[4, 4, 0, 0]}
                      name="Calories"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 8 Week Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                8 Week Trend
              </CardTitle>
              <CardDescription>Track your consistency over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.last8Weeks}>
                  <defs>
                    <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="workouts"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorWorkouts)"
                    name="Workouts"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="calories"
                    stroke={COLORS.accent}
                    fillOpacity={1}
                    fill="url(#colorCalories)"
                    name="Calories"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Body Composition Progress
              </CardTitle>
              <CardDescription>Track changes in weight, body fat, and muscle mass</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progressChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="weight" domain={['dataMin - 5', 'dataMax + 5']} className="text-xs" />
                  <YAxis yAxisId="percentage" orientation="right" domain={[0, 50]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="weight"
                    type="monotone"
                    dataKey="weight"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, strokeWidth: 2 }}
                    name="Weight (kg)"
                  />
                  <Line
                    yAxisId="percentage"
                    type="monotone"
                    dataKey="bodyFat"
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    dot={{ fill: COLORS.accent, strokeWidth: 2 }}
                    name="Body Fat (%)"
                  />
                  <Line
                    yAxisId="weight"
                    type="monotone"
                    dataKey="muscleMass"
                    stroke={COLORS.secondary}
                    strokeWidth={2}
                    dot={{ fill: COLORS.secondary, strokeWidth: 2 }}
                    name="Muscle Mass (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Progress Stats */}
          {progressData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {progressData[progressData.length - 1].weight && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Weight</p>
                        <p className="text-3xl font-bold">
                          {progressData[progressData.length - 1].weight} kg
                        </p>
                        {goals.targetWeight && (
                          <p className="text-xs text-muted-foreground">
                            Target: {goals.targetWeight} kg
                          </p>
                        )}
                      </div>
                      <div className="p-3 rounded-full bg-primary/10">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    {goals.targetWeight && progressData[progressData.length - 1].weight && (
                      <div className="mt-4">
                        <Progress 
                          value={Math.min(
                            ((progressData[0].weight! - progressData[progressData.length - 1].weight!) /
                            (progressData[0].weight! - goals.targetWeight)) * 100,
                            100
                          )} 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.abs(progressData[progressData.length - 1].weight! - goals.targetWeight).toFixed(1)} kg to goal
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {progressData[progressData.length - 1].bodyFat && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Body Fat</p>
                        <p className="text-3xl font-bold">
                          {progressData[progressData.length - 1].bodyFat}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {progressData.length > 1 && 
                            `${(progressData[progressData.length - 1].bodyFat! - progressData[0].bodyFat!).toFixed(1)}% since start`
                          }
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-amber-500/10">
                        <Zap className="w-6 h-6 text-amber-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {progressData[progressData.length - 1].muscleMass && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Muscle Mass</p>
                        <p className="text-3xl font-bold">
                          {progressData[progressData.length - 1].muscleMass} kg
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {progressData.length > 1 && 
                            `+${(progressData[progressData.length - 1].muscleMass! - progressData[0].muscleMass!).toFixed(1)} kg gained`
                          }
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-500/10">
                        <Dumbbell className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Muscles Tab */}
        <TabsContent value="muscles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  Muscle Group Distribution
                </CardTitle>
                <CardDescription>See which muscles you&apos;ve been training most</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={muscleGroupData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {muscleGroupData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Muscle Group Breakdown</CardTitle>
                <CardDescription>Workout frequency by muscle group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {muscleGroupData.sort((a, b) => b.value - a.value).map((muscle) => (
                  <div key={muscle.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{muscle.name}</span>
                      <span className="text-sm text-muted-foreground">{muscle.value} workouts</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(muscle.value / Math.max(...muscleGroupData.map(m => m.value))) * 100}%`,
                          backgroundColor: muscle.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Muscle Balance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Training Balance Analysis
              </CardTitle>
              <CardDescription>Recommendations for balanced training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const pushMuscles = ['chest', 'shoulders', 'triceps'];
                  const pullMuscles = ['back', 'biceps'];
                  const legMuscles = ['legs', 'quadriceps', 'hamstrings', 'glutes', 'calves'];
                  
                  const pushCount = pushMuscles.reduce((sum, m) => sum + (stats.muscleGroupCounts[m] || 0), 0);
                  const pullCount = pullMuscles.reduce((sum, m) => sum + (stats.muscleGroupCounts[m] || 0), 0);
                  const legCount = legMuscles.reduce((sum, m) => sum + (stats.muscleGroupCounts[m] || 0), 0);
                  
                  const total = pushCount + pullCount + legCount || 1;
                  
                  return (
                    <>
                      <div className="p-4 rounded-lg bg-muted/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Push Muscles</span>
                          <Badge variant={pushCount / total > 0.25 && pushCount / total < 0.4 ? "default" : "secondary"}>
                            {Math.round((pushCount / total) * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Chest, Shoulders, Triceps</p>
                        <Progress value={(pushCount / total) * 100} />
                      </div>
                      <div className="p-4 rounded-lg bg-muted/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Pull Muscles</span>
                          <Badge variant={pullCount / total > 0.25 && pullCount / total < 0.4 ? "default" : "secondary"}>
                            {Math.round((pullCount / total) * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Back, Biceps</p>
                        <Progress value={(pullCount / total) * 100} />
                      </div>
                      <div className="p-4 rounded-lg bg-muted/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Leg Muscles</span>
                          <Badge variant={legCount / total > 0.3 && legCount / total < 0.5 ? "default" : "secondary"}>
                            {Math.round((legCount / total) * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Quads, Hamstrings, Glutes, Calves</p>
                        <Progress value={(legCount / total) * 100} />
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Workout History
              </CardTitle>
              <CardDescription>Your recent workout sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workoutHistory.slice(0, 10).map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-full",
                        workout.intensity === "low" && "bg-green-500/10 text-green-500",
                        workout.intensity === "moderate" && "bg-amber-500/10 text-amber-500",
                        workout.intensity === "high" && "bg-red-500/10 text-red-500"
                      )}>
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {workout.muscleGroups.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workout.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDuration(workout.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-muted-foreground" />
                        <span>{workout.caloriesBurned} kcal</span>
                      </div>
                      <Badge variant={
                        workout.intensity === "low" ? "secondary" :
                        workout.intensity === "moderate" ? "default" : "destructive"
                      }>
                        {workout.intensity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WorkoutAnalytics;
