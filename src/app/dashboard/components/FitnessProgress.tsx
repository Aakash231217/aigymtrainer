import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Minus, Weight, Ruler, Activity, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function FitnessProgress({ userId }: { userId: string }) {
  const [newWeight, setNewWeight] = useState("");
  const [newBodyFat, setNewBodyFat] = useState("");
  const [newMeasurements, setNewMeasurements] = useState({
    chest: "",
    waist: "",
    hips: "",
    biceps: "",
    thighs: "",
  });

  const progressData = useQuery(api.fitnessTracking.getUserProgress, { userId });
  const recentWorkouts = useQuery(api.workouts.getRecentWorkouts, { userId, limit: 5 });
  const logProgress = useMutation(api.fitnessTracking.logProgress);

  const handleLogProgress = async () => {
    if (!newWeight) return;

    await logProgress({
      userId,
      weight: parseFloat(newWeight),
      bodyFat: newBodyFat ? parseFloat(newBodyFat) : undefined,
      measurements: Object.entries(newMeasurements).reduce((acc, [key, value]) => {
        if (value) acc[key as keyof typeof newMeasurements] = parseFloat(value);
        return acc;
      }, {} as any),
    });

    // Reset form
    setNewWeight("");
    setNewBodyFat("");
    setNewMeasurements({
      chest: "",
      waist: "",
      hips: "",
      biceps: "",
      thighs: "",
    });
  };

  const calculateWeightChange = () => {
    if (!progressData || progressData.length < 2) return { value: 0, trend: "neutral" };
    const latest = progressData[progressData.length - 1];
    const previous = progressData[progressData.length - 2];
    const change = latest.weight - previous.weight;
    
    return {
      value: Math.abs(change).toFixed(1),
      trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
    };
  };

  const weightChange = calculateWeightChange();

  // Prepare chart data
  const chartData = progressData?.slice(-30).map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: entry.weight,
    bodyFat: entry.bodyFat,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-2xl font-bold">
                  {progressData?.[progressData.length - 1]?.weight || "--"} kg
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {weightChange.trend === "up" && <TrendingUp className="w-4 h-4 text-red-500" />}
                  {weightChange.trend === "down" && <TrendingDown className="w-4 h-4 text-green-500" />}
                  {weightChange.trend === "neutral" && <Minus className="w-4 h-4 text-gray-500" />}
                  <span className="text-sm text-muted-foreground">{weightChange.value} kg</span>
                </div>
              </div>
              <Weight className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Body Fat %</p>
                <p className="text-2xl font-bold">
                  {progressData?.[progressData.length - 1]?.bodyFat || "--"}%
                </p>
              </div>
              <Ruler className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workouts This Week</p>
                <p className="text-2xl font-bold">{recentWorkouts?.length || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Goal Progress</p>
                <Progress value={75} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">75% to target</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">Progress Chart</TabsTrigger>
          <TabsTrigger value="log">Log Progress</TabsTrigger>
          <TabsTrigger value="measurements">Body Measurements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Weight & Body Fat Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Body Fat %', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
                    <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="#82ca9d" name="Body Fat %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>Log Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={newWeight}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWeight(e.target.value)}
                      placeholder="Enter your current weight"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      step="0.1"
                      value={newBodyFat}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBodyFat(e.target.value)}
                      placeholder="Enter body fat percentage"
                    />
                  </div>
                </div>

                <Button onClick={handleLogProgress} disabled={!newWeight}>
                  Log Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <CardTitle>Body Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chest">Chest (cm)</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      value={newMeasurements.chest}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeasurements({ ...newMeasurements, chest: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="waist">Waist (cm)</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      value={newMeasurements.waist}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeasurements({ ...newMeasurements, waist: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hips">Hips (cm)</Label>
                    <Input
                      id="hips"
                      type="number"
                      step="0.1"
                      value={newMeasurements.hips}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeasurements({ ...newMeasurements, hips: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="biceps">Biceps (cm)</Label>
                    <Input
                      id="biceps"
                      type="number"
                      step="0.1"
                      value={newMeasurements.biceps}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeasurements({ ...newMeasurements, biceps: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="thighs">Thighs (cm)</Label>
                    <Input
                      id="thighs"
                      type="number"
                      step="0.1"
                      value={newMeasurements.thighs}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeasurements({ ...newMeasurements, thighs: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleLogProgress}>
                  Save Measurements
                </Button>
              </div>

              {/* Recent Measurements */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Recent Measurements</h3>
                <div className="space-y-2">
                  {progressData?.slice(-3).reverse().map((entry, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {entry.measurements && Object.entries(entry.measurements).map(([key, value]) => (
                          <div key={key}>
                            <span className="capitalize">{key}:</span> <span className="font-medium">{value} cm</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentWorkouts?.map((workout) => {
              const duration = workout.endTime && workout.startTime 
                ? Math.round((workout.endTime - workout.startTime) / 60000) 
                : 0;
              
              return (
                <div key={workout._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Workout Session</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(workout.date).toLocaleDateString()} • {duration} min
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {workout.caloriesBurned && (
                      <Badge variant="secondary">{workout.caloriesBurned} cal</Badge>
                    )}
                    <Badge>{workout.energyLevel} energy</Badge>
                    <Badge variant="outline">{workout.pointsEarned} pts</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
