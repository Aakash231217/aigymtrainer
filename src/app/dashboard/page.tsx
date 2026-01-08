"use client";

import { useState } from "react";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, Activity, Brain, Calendar, Award, User, Apple } from "lucide-react";
import ProfileOverview from "./components/ProfileOverview";
import FitnessProgress from "./components/FitnessProgress";
import DietManager from "./components/DietManager";
import MentalHealthTracker from "./components/MentalHealthTracker";
import WorkoutSchedule from "./components/WorkoutSchedule";
import Achievements from "./components/Achievements";

export default function DashboardPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  
  const userProfile = useQuery(api.userProfiles.getUserProfile, {
    userId: user?.id || "",
  });

  const gamificationStats = useQuery(api.gamification.getUserGamificationStatus, {
    userId: user?.id || "",
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view your dashboard</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p>No profile found. Let's get you started!</p>
          <Button onClick={() => window.location.href = "/onboarding"}>
            Complete Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {user.firstName}!</h1>
                <p className="text-white/80">Your personalized fitness journey continues</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-2xl font-bold">{gamificationStats?.totalPoints || 0}</span>
              </div>
              <p className="text-sm text-white/80">Total Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Weight</p>
                  <p className="text-2xl font-bold">{userProfile.weight} kg</p>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Target Weight</p>
                  <p className="text-2xl font-bold">{userProfile.targetWeight || userProfile.weight} kg</p>
                </div>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workout Streak</p>
                  <p className="text-2xl font-bold">{gamificationStats?.currentStreak || 0} days</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fitness Level</p>
                  <p className="text-2xl font-bold capitalize">{userProfile.fitnessLevel}</p>
                </div>
                <Badge className="bg-primary text-white">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="fitness" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Fitness
            </TabsTrigger>
            <TabsTrigger value="diet" className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              Diet
            </TabsTrigger>
            <TabsTrigger value="mental" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Mental Health
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ProfileOverview profile={userProfile} />
          </TabsContent>

          <TabsContent value="fitness">
            <FitnessProgress userId={user.id} />
          </TabsContent>

          <TabsContent value="diet">
            <DietManager userId={user.id} />
          </TabsContent>

          <TabsContent value="mental">
            <MentalHealthTracker userId={user.id} />
          </TabsContent>

          <TabsContent value="schedule">
            <WorkoutSchedule userId={user.id} />
          </TabsContent>

          <TabsContent value="achievements">
            <Achievements userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
