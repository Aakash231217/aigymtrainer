import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit2, MapPin, Calendar, Target, Utensils, Brain, Dumbbell } from "lucide-react";

export default function ProfileOverview({ profile }: any) {
  const calculateBMI = () => {
    const heightInMeters = profile.height / 100;
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  const bmi = parseFloat(calculateBMI());
  const bmiInfo = getBMICategory(bmi);

  const calculateProgress = () => {
    const totalChange = Math.abs(profile.targetWeight - profile.weight);
    const initialChange = Math.abs(profile.targetWeight - profile.weight);
    return totalChange === 0 ? 100 : ((initialChange - totalChange) / initialChange) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          <Button variant="ghost" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="text-lg font-medium">{profile.age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="text-lg font-medium capitalize">{profile.gender}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="text-lg">{profile.location || "Not specified"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-lg font-medium">{profile.height} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-lg font-medium">{profile.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Weight</p>
                <p className="text-lg font-medium">{profile.targetWeight} kg</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">BMI</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium">{bmi}</p>
                  <Badge variant="outline" className={bmiInfo.color}>
                    {bmiInfo.category}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fitness Level</p>
                <Badge variant="default" className="capitalize">
                  {profile.fitnessLevel}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Weight Goal Progress</span>
                <span className="text-sm text-muted-foreground">
                  {profile.weight} / {profile.targetWeight} kg
                </span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Target Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <p>{profile.targetDate || "Not set"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Fitness Goals</p>
              <div className="flex flex-wrap gap-2">
                {profile.fitnessGoals.map((goal: string) => (
                  <Badge key={goal} variant="secondary">
                    {goal.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Diet Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="mb-2 capitalize">
              {profile.dietPreference.replace(/_/g, " ")}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {profile.cuisinePreferences.length} cuisine preferences
            </p>
            {profile.allergies.length > 0 && (
              <p className="text-sm text-red-600 mt-1">
                {profile.allergies.length} allergies
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workout Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile.daysAvailable} days/week</p>
            <p className="text-sm text-muted-foreground">
              {profile.sessionDuration} min sessions
            </p>
            <Badge variant="outline" className="mt-2 capitalize">
              {profile.workoutTimePreference} workouts
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Mental Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Stress Level</span>
                <span className="text-sm font-medium">{profile.stressLevel}/10</span>
              </div>
              <Progress value={profile.stressLevel * 10} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {profile.sleepHours} hours sleep
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical & Budget Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.medicalConditions.length > 0 ? (
                <div>
                  <p className="text-sm font-medium mb-1">Conditions:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.medicalConditions.map((condition: string) => (
                      <Badge key={condition} variant="destructive" className="text-xs">
                        {condition.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No medical conditions</p>
              )}
              
              {profile.injuries.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Injuries:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.injuries.map((injury: string) => (
                      <Badge key={injury} variant="outline" className="text-xs">
                        {injury}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Diet Budget</p>
                <p className="text-xl font-semibold">₹{profile.dietBudget}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplements Budget</p>
                <p className="text-xl font-semibold">₹{profile.supplementsBudget}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
