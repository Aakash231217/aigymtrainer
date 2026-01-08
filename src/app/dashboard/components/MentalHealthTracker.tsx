import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Heart, Moon, Sun, Cloud, Activity, Music, Headphones } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function MentalHealthTracker({ userId }: { userId: string }) {
  const [moodData, setMoodData] = useState({
    mood: 5,
    energy: 5,
    stress: 5,
    anxiety: 5,
    sleepQuality: 5,
    sleepHours: 7,
    activities: [] as string[],
    notes: "",
  });

  const recentLogs = useQuery(api.mentalHealth.getRecentMentalHealthLogs, { userId, limit: 30 });
  const recommendations = useQuery(api.mentalHealth.getMentalHealthRecommendations, { userId });
  const logMentalHealth = useMutation(api.mentalHealth.logMentalHealth);

  const handleLogMood = async () => {
    await logMentalHealth({
      userId,
      ...moodData,
    });

    // Reset form
    setMoodData({
      mood: 5,
      energy: 5,
      stress: 5,
      anxiety: 5,
      sleepQuality: 5,
      sleepHours: 7,
      activities: [],
      notes: "",
    });
  };

  const activityOptions = [
    { value: "meditation", label: "Meditation", icon: Brain },
    { value: "exercise", label: "Exercise", icon: Activity },
    { value: "socializing", label: "Socializing", icon: Heart },
    { value: "music", label: "Music", icon: Music },
    { value: "nature", label: "Nature Walk", icon: Sun },
    { value: "breathing", label: "Breathing", icon: Cloud },
  ];

  // Prepare chart data
  const chartData = recentLogs?.map((log) => ({
    date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mood: log.mood,
    energy: log.energy,
    stress: 10 - log.stress, // Invert stress for positive visualization
    sleep: log.sleepQuality,
  })) || [];

  // Calculate averages for radar chart
  const calculateAverages = () => {
    if (!recentLogs || recentLogs.length === 0) return [];
    
    const last7Days = recentLogs.slice(0, 7);
    const avgMood = last7Days.reduce((sum, log) => sum + (log.mood || 0), 0) / last7Days.length;
    const avgEnergy = last7Days.reduce((sum, log) => sum + (log.energy || 0), 0) / last7Days.length;
    const avgStress = last7Days.reduce((sum, log) => sum + (log.stress || 0), 0) / last7Days.length;
    const avgAnxiety = last7Days.reduce((sum, log) => sum + (log.anxiety || 0), 0) / last7Days.length;
    const avgSleep = last7Days.reduce((sum, log) => sum + (log.sleepQuality || 0), 0) / last7Days.length;

    return [
      { metric: "Mood", value: avgMood, fullMark: 10 },
      { metric: "Energy", value: avgEnergy, fullMark: 10 },
      { metric: "Sleep", value: avgSleep, fullMark: 10 },
      { metric: "Calm", value: 10 - avgStress, fullMark: 10 },
      { metric: "Peace", value: 10 - avgAnxiety, fullMark: 10 },
    ];
  };

  const radarData = calculateAverages();

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Mood</p>
                <p className="text-2xl font-bold">
                  {recentLogs?.[0]?.mood || "--"}/10
                </p>
              </div>
              <Brain className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sleep Quality</p>
                <p className="text-2xl font-bold">
                  {recentLogs?.[0]?.sleepQuality || "--"}/10
                </p>
              </div>
              <Moon className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energy Level</p>
                <p className="text-2xl font-bold">
                  {recentLogs?.[0]?.energy || "--"}/10
                </p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stress Level</p>
                <p className="text-2xl font-bold">
                  {recentLogs?.[0]?.stress || "--"}/10
                </p>
              </div>
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log New Entry */}
        <Card>
          <CardHeader>
            <CardTitle>Log Today's Mental Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mood (1-10)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[moodData.mood]}
                  onValueChange={(value: number[]) => setMoodData({ ...moodData, mood: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="w-8 text-center font-medium">{moodData.mood}</span>
              </div>
            </div>

            <div>
              <Label>Energy Level (1-10)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[moodData.energy]}
                  onValueChange={(value: number[]) => setMoodData({ ...moodData, energy: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="w-8 text-center font-medium">{moodData.energy}</span>
              </div>
            </div>

            <div>
              <Label>Stress Level (1-10)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[moodData.stress]}
                  onValueChange={(value: number[]) => setMoodData({ ...moodData, stress: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="w-8 text-center font-medium">{moodData.stress}</span>
              </div>
            </div>

            <div>
              <Label>Anxiety Level (1-10)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[moodData.anxiety]}
                  onValueChange={(value: number[]) => setMoodData({ ...moodData, anxiety: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="w-8 text-center font-medium">{moodData.anxiety}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sleep Quality (1-10)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[moodData.sleepQuality]}
                    onValueChange={(value: number[]) => setMoodData({ ...moodData, sleepQuality: value[0] })}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-8 text-center font-medium">{moodData.sleepQuality}</span>
                </div>
              </div>

              <div>
                <Label>Sleep Hours</Label>
                <Select
                  value={moodData.sleepHours.toString()}
                  onValueChange={(value: string) => setMoodData({ ...moodData, sleepHours: parseFloat(value) })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hours) => (
                      <SelectItem key={hours} value={hours.toString()}>
                        {hours} hours
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Activities Today</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {activityOptions.map((activity) => {
                  const Icon = activity.icon;
                  const isSelected = moodData.activities.includes(activity.value);
                  
                  return (
                    <Button
                      key={activity.value}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setMoodData({
                            ...moodData,
                            activities: moodData.activities.filter(a => a !== activity.value),
                          });
                        } else {
                          setMoodData({
                            ...moodData,
                            activities: [...moodData.activities, activity.value],
                          });
                        }
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {activity.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={moodData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMoodData({ ...moodData, notes: e.target.value })}
                placeholder="How are you feeling today?"
                className="mt-2"
              />
            </div>

            <Button onClick={handleLogMood} className="w-full">
              Log Entry
            </Button>
          </CardContent>
        </Card>

        {/* Mental Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} />
                  <Radar
                    name="Average"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Trends */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Mood Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#8884d8" name="Mood" />
                <Line type="monotone" dataKey="energy" stroke="#82ca9d" name="Energy" />
                <Line type="monotone" dataKey="stress" stroke="#ffc658" name="Calm (10-Stress)" />
                <Line type="monotone" dataKey="sleep" stroke="#ff7c7c" name="Sleep Quality" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Headphones className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.activity}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{rec.duration} min</Badge>
                        <Badge variant="outline">{rec.timeOfDay}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Log your mood regularly to get personalized recommendations
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
