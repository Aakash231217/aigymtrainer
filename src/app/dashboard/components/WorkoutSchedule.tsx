import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Play, CheckCircle, XCircle, Dumbbell, Video, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { format } from "date-fns";

// Type definitions
interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  videoUrl?: string;
}

interface Workout {
  _id: string;
  name: string;
  duration: number;
  difficulty: string;
  status?: string;
  scheduledTime?: string;
  estimatedCalories: number;
  equipment?: string[];
  muscleGroups: string[];
  exercises?: Exercise[];
  instructions?: string;
  completedAt?: string;
  caloriesBurned?: number;
}

interface WorkoutPlan {
  workouts: Workout[];
}

export default function WorkoutSchedule({ userId }: { userId: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const workoutPlan = useQuery(api.workouts.getCurrentWorkoutPlan, { userId }) as WorkoutPlan | undefined;
  const scheduledWorkouts = useQuery(api.workouts.getScheduledWorkouts, { 
    userId, 
    date: selectedDate?.toISOString() || new Date().toISOString() 
  }) as Workout[] | undefined;
  const workoutHistory = useQuery(api.workouts.getWorkoutHistory, { userId, limit: 10 }) as Workout[] | undefined;
  const equipmentList = useQuery(api.equipment.getUserEquipment, { userId });

  const scheduleWorkout = useMutation(api.workouts.scheduleWorkout);
  const completeWorkout = useMutation(api.workouts.completeWorkout);
  const cancelWorkout = useMutation(api.workouts.cancelWorkout);

  const handleScheduleWorkout = async (workoutId: string, time: string) => {
    if (!selectedDate) return;
    
    await scheduleWorkout({
      userId,
      workoutId,
      scheduledDate: selectedDate.toISOString(),
      scheduledTime: time,
    });
  };

  const handleCompleteWorkout = async (workoutId: string, duration: number, caloriesBurned: number) => {
    await completeWorkout({
      userId,
      workoutId,
      duration,
      caloriesBurned,
      completedAt: new Date().toISOString(),
    });
  };

  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00"
  ];

  const getDaysWithWorkouts = () => {
    // This would typically come from a query for the month
    return scheduledWorkouts ? [selectedDate] : [];
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {workoutHistory?.filter(w => {
                    const workoutDate = new Date(w.completedAt!);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return workoutDate > weekAgo;
                  }).length || 0} workouts
                </p>
              </div>
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">
                  {workoutHistory?.reduce((sum: any, w: { duration: any; }) => sum + (w.duration || 0), 0) || 0} min
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calories Burned</p>
                <p className="text-2xl font-bold">
                  {workoutHistory?.reduce((sum: any, w: { caloriesBurned: any; }) => sum + (w.caloriesBurned || 0), 0) || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">5 days</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Workout Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                hasWorkout: getDaysWithWorkouts(),
              }}
              modifiersStyles={{
                hasWorkout: {
                  backgroundColor: "hsl(var(--primary))",
                  color: "white",
                  borderRadius: "50%",
                },
              }}
              className="rounded-md border"
            />

            {selectedDate && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">
                  {format(selectedDate, "MMMM d, yyyy")} Schedule
                </h3>
                
                {scheduledWorkouts && scheduledWorkouts.length > 0 ? (
                  <div className="space-y-3">
                    {scheduledWorkouts.map((workout: Workout) => (
                      <div key={workout._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{workout.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {workout.scheduledTime}
                              </span>
                              <span>{workout.duration} min</span>
                              <Badge variant="secondary">{workout.difficulty}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setSelectedWorkout(workout)}>
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{workout.name}</DialogTitle>
                                </DialogHeader>
                                <WorkoutDetails workout={workout} />
                              </DialogContent>
                            </Dialog>
                            {workout.status === "scheduled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompleteWorkout(
                                  workout._id,
                                  workout.duration,
                                  workout.estimatedCalories
                                )}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No workouts scheduled for this day</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Available Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {workoutPlan?.workouts ? (
              <div className="space-y-3">
                {workoutPlan.workouts.map((workout: { _id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; duration: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; difficulty: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; muscleGroups: any[]; }) => (
                  <div key={workout._id} className="border rounded-lg p-3">
                    <h4 className="font-medium">{workout.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{workout.duration} min</span>
                      <Badge variant="outline" className="text-xs">
                        {workout.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {workout.muscleGroups.join(", ")}
                    </p>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-full mt-2">
                          Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule {workout.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Select time for {selectedDate ? format(selectedDate, "MMMM d") : "today"}
                            </p>
                            <Select onValueChange={(time: string) => handleScheduleWorkout(workout._id, time)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No workout plan created yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Workout History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          {workoutHistory && workoutHistory.length > 0 ? (
            <div className="space-y-3">
              {workoutHistory.map((workout: Workout) => (
                <div key={workout._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{workout.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {workout.completedAt ? new Date(workout.completedAt).toLocaleDateString() : 'Not completed'} • {workout.duration} min
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{workout.caloriesBurned} cal</Badge>
                    {workout.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No workout history yet. Start your fitness journey today!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WorkoutDetails({ workout }: { workout: Workout }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="font-medium">{workout.duration} minutes</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Difficulty</p>
          <Badge className="mt-1">{workout.difficulty}</Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Calories</p>
          <p className="font-medium">{workout.estimatedCalories} cal</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Equipment</p>
          <p className="font-medium">
            {workout.equipment?.length > 0 ? workout.equipment.join(", ") : "None"}
          </p>
        </div>
      </div>

      {workout.exercises && workout.exercises.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Exercises</h4>
          <div className="space-y-2">
            {workout.exercises.map((exercise: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {exercise.sets} sets × {exercise.reps} reps
                    {exercise.duration && ` • ${exercise.duration}s`}
                  </p>
                </div>
                {exercise.videoUrl && (
                  <Button size="sm" variant="ghost">
                    <Video className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {workout.instructions && (
        <div>
          <h4 className="font-medium mb-2">Instructions</h4>
          <p className="text-sm text-muted-foreground">{workout.instructions}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button className="flex-1">
          <Play className="w-4 h-4 mr-2" />
          Start Workout
        </Button>
        <Button variant="outline">
          <Video className="w-4 h-4 mr-2" />
          Watch Video
        </Button>
      </div>
    </div>
  );
}
