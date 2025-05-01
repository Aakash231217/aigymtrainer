"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import CornerElements from "@/components/CornerElements";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, CalendarIcon, DumbbellIcon, BellIcon, CheckCircle, XCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GenericId } from "convex/values";

const ProfilePage = () => {
  const { user } = useUser();
  const userId = user?.id as string;

  const allPlans = useQuery(api.plans.getUserPlans, { userId });
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);
  
  // Track completed exercises and meals
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
  
  // For notifications
  const [notifications, setNotifications] = useState<Array<{id: string, type: string, name: string}>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const activePlan = allPlans?.find((plan) => plan.isActive);

  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id === selectedPlanId)
    : activePlan;
    
  // Load saved progress from localStorage on component mount
  useEffect(() => {
    if (currentPlan?._id) {
      const savedExercises = localStorage.getItem(`exercises-${currentPlan._id}`);
      const savedMeals = localStorage.getItem(`meals-${currentPlan._id}`);
      
      if (savedExercises) {
        setCompletedExercises(JSON.parse(savedExercises));
      }
      
      if (savedMeals) {
        setCompletedMeals(JSON.parse(savedMeals));
      }
      
      // Check for incomplete items
      generateNotifications(currentPlan);
    }
  }, [currentPlan]);
  
  // Generate notifications based on incomplete items
  const generateNotifications = (plan: { _id: GenericId<"plans">; _creationTime: number; name: string; userId: string; workoutPlan: { schedule: string[]; exercises: { day: string; routines: { exercises?: string[] | undefined; sets?: number | undefined; reps?: number | undefined; duration?: string | undefined; description?: string | undefined; name: string; }[]; }[]; }; dietPlan: { dailyCalories: number; meals: { name: string; foods: string[]; }[]; }; isActive: boolean; } | undefined) => {
    if (!plan) return;
    
    const incompleteItems: ((prevState: { id: string; type: string; name: string; }[]) => { id: string; type: string; name: string; }[]) | { id: string; type: string; name: any; }[] = [];
    
    // Check exercises
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayExercises = plan.workoutPlan.exercises.find((ex: { day: string; }) => ex.day === today);
    
    if (todayExercises) {
      todayExercises.routines.forEach((routine: { name: any; }, idx: any) => {
        const routineId = `${today}-${idx}`;
        if (!completedExercises[routineId]) {
          incompleteItems.push({
            id: routineId,
            type: 'exercise',
            name: routine.name
          });
        }
      });
    }
    
    // Check meals
    plan.dietPlan.meals.forEach((meal: { name: any; }, idx: any) => {
      const mealId = `meal-${idx}`;
      if (!completedMeals[mealId]) {
        incompleteItems.push({
          id: mealId,
          type: 'meal',
          name: meal.name
        });
      }
    });
    
    setNotifications(incompleteItems);
    console.log(incompleteItems)
  };
  
  // Handle checking/unchecking exercises
  const toggleExerciseComplete = (dayName: string, routineIndex: number) => {
    const routineId = `${dayName}-${routineIndex}`;
    
    setCompletedExercises(prev => {
      const updated = { 
        ...prev,
        [routineId]: !prev[routineId]
      };
      
      // Save to localStorage
      localStorage.setItem(`exercises-${currentPlan?._id}`, JSON.stringify(updated));
      
      // Show toast notification
      if (updated[routineId]) {
        toast.success(`Exercise "${currentPlan?.workoutPlan.exercises.find(e => e.day === dayName)?.routines[routineIndex].name}" completed!`);
      }
      
      // Update notifications
      if (currentPlan) {
        setTimeout(() => generateNotifications(currentPlan), 100);
      }
      
      return updated;
    });
  };
  
  // Handle checking/unchecking meals
  const toggleMealComplete = (mealIndex: number) => {
    const mealId = `meal-${mealIndex}`;
    
    setCompletedMeals(prev => {
      const updated = { 
        ...prev,
        [mealId]: !prev[mealId]
      };
      
      // Save to localStorage
      localStorage.setItem(`meals-${currentPlan?._id}`, JSON.stringify(updated));
      
      // Show toast notification
      if (updated[mealId]) {
        toast.success(`Meal "${currentPlan?.dietPlan.meals[mealIndex].name}" completed!`);
      }
      
      // Update notifications
      if (currentPlan) {
        setTimeout(() => generateNotifications(currentPlan), 100);
      }
      
      return updated;
    });
  };
  
  // Reset today's progress
  const resetTodayProgress = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayExercises = currentPlan?.workoutPlan.exercises.find(ex => ex.day === today);
    
    const updatedExercises = { ...completedExercises };
    
    if (todayExercises) {
      todayExercises.routines.forEach((_, idx) => {
        const routineId = `${today}-${idx}`;
        updatedExercises[routineId] = false;
      });
    }
    
    const updatedMeals: Record<string, boolean> = {};
    currentPlan?.dietPlan.meals.forEach((_, idx) => {
      updatedMeals[`meal-${idx}`] = false;
    });
    
    setCompletedExercises(updatedExercises);
    setCompletedMeals(updatedMeals);
    
    localStorage.setItem(`exercises-${currentPlan?._id}`, JSON.stringify(updatedExercises));
    localStorage.setItem(`meals-${currentPlan?._id}`, JSON.stringify(updatedMeals));
    
    generateNotifications(currentPlan);
    toast.info("Today's progress has been reset");
  };

  // Calculate overall completion percentage
  const calculateCompletion = () => {
    if (!currentPlan) return 0;
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    let totalItems = currentPlan.dietPlan.meals.length;
    let completedItems = 0;
    
    // Count completed meals
    currentPlan.dietPlan.meals.forEach((_, idx) => {
      if (completedMeals[`meal-${idx}`]) {
        completedItems++;
      }
    });
    
    // Add today's exercises
    const todayExercises = currentPlan.workoutPlan.exercises.find(ex => ex.day === today);
    if (todayExercises) {
      totalItems += todayExercises.routines.length;
      
      todayExercises.routines.forEach((_, idx) => {
        if (completedExercises[`${today}-${idx}`]) {
          completedItems++;
        }
      });
    }
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  return (
    <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4">
      <ProfileHeader user={user} />

      {allPlans && allPlans?.length > 0 ? (
        <div className="space-y-8">
          {/* PLAN SELECTOR */}
          <div className="relative backdrop-blur-sm border border-border p-6">
            <CornerElements />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">
                <span className="text-primary">Your</span>{" "}
                <span className="text-foreground">Fitness Plans</span>
              </h2>
              <div className="flex items-center gap-4">
                {/* Notifications Popover */}
                <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <BellIcon className="h-5 w-5" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {notifications.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Tasks Remaining</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={resetTodayProgress}
                          className="text-xs h-6"
                        >
                          Reset Today
                        </Button>
                      </div>
                      <div className="h-px w-full bg-border"></div>
                      {notifications.length > 0 ? (
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                          {notifications.map((notif) => (
                            <div key={notif.id} className="flex items-center gap-2 p-2 border border-border rounded-md">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <div>
                                <p className="text-sm font-medium">{notif.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{notif.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm">All tasks completed for today!</p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <div className="font-mono text-xs text-muted-foreground">
                  TOTAL: {allPlans.length}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {allPlans.map((plan) => (
                <Button
                  key={plan._id}
                  onClick={() => setSelectedPlanId(plan._id)}
                  className={`text-foreground border hover:text-white ${
                    selectedPlanId === plan._id
                      ? "bg-primary/20 text-primary border-primary"
                      : "bg-transparent border-border hover:border-primary/50"
                  }`}
                >
                  {plan.name}
                  {plan.isActive && (
                    <span className="ml-2 bg-green-500/20 text-green-500 text-xs px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* PLAN DETAILS */}

          {currentPlan && (
            <div className="relative backdrop-blur-sm border border-border rounded-lg p-6">
              <CornerElements />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <h3 className="text-lg font-bold">
                    PLAN: <span className="text-primary">{currentPlan.name}</span>
                  </h3>
                </div>
                
                {/* Progress Indicator */}
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground">Today's Progress</div>
                  <div className="w-32 h-3 bg-background border border-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${calculateCompletion()}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-mono text-primary">{calculateCompletion()}%</div>
                </div>
              </div>

              <Tabs defaultValue="workout" className="w-full">
                <TabsList className="mb-6 w-full grid grid-cols-2 bg-cyber-terminal-bg border">
                  <TabsTrigger
                    value="workout"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    <DumbbellIcon className="mr-2 size-4" />
                    Workout Plan
                  </TabsTrigger>

                  <TabsTrigger
                    value="diet"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    <AppleIcon className="mr-2 h-4 w-4" />
                    Diet Plan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="workout">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm text-muted-foreground">
                        SCHEDULE: {currentPlan.workoutPlan.schedule.join(", ")}
                      </span>
                    </div>

                    <Accordion type="multiple" className="space-y-4">
                      {currentPlan.workoutPlan.exercises.map((exerciseDay, index) => {
                        const isToday = exerciseDay.day === new Date().toLocaleDateString('en-US', { weekday: 'long' });
                        
                        return (
                          <AccordionItem
                            key={index}
                            value={exerciseDay.day}
                            className={`border rounded-lg overflow-hidden ${isToday ? 'border-primary/50' : ''}`}
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/10 font-mono">
                              <div className="flex justify-between w-full items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-primary">{exerciseDay.day}</span>
                                  {isToday && (
                                    <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded">
                                      TODAY
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {exerciseDay.routines.length} EXERCISES
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="pb-4 px-4">
                              <div className="space-y-3 mt-2">
                                {exerciseDay.routines.map((routine, routineIndex) => {
                                  const routineId = `${exerciseDay.day}-${routineIndex}`;
                                  const isCompleted = completedExercises[routineId];
                                  
                                  return (
                                    <div
                                      key={routineIndex}
                                      className={`border rounded p-3 bg-background/50 flex ${
                                        isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-border'
                                      }`}
                                    >
                                      <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className={`font-semibold ${isCompleted ? 'text-green-500' : 'text-foreground'}`}>
                                            {routine.name}
                                          </h4>
                                          <div className="flex items-center gap-2">
                                            <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono">
                                              {routine.sets} SETS
                                            </div>
                                            <div className="px-2 py-1 rounded bg-secondary/20 text-secondary text-xs font-mono">
                                              {routine.reps} REPS
                                            </div>
                                          </div>
                                        </div>
                                        {routine.description && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {routine.description}
                                          </p>
                                        )}
                                      </div>
                                      
                                      {isToday && (
                                        <div className="flex items-center ml-4">
                                          <div className="flex h-full items-center justify-center">
                                            <Checkbox
                                              id={routineId}
                                              checked={isCompleted}
                                              onCheckedChange={() => toggleExerciseComplete(exerciseDay.day, routineIndex)}
                                              className={`h-6 w-6 ${isCompleted ? 'border-green-500 bg-green-500' : ''}`}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                </TabsContent>

                <TabsContent value="diet">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-sm text-muted-foreground">
                        DAILY CALORIE TARGET
                      </span>
                      <div className="font-mono text-xl text-primary">
                        {currentPlan.dietPlan.dailyCalories} KCAL
                      </div>
                    </div>

                    <div className="h-px w-full bg-border my-4"></div>

                    <div className="space-y-4">
                      {currentPlan.dietPlan.meals.map((meal, index) => {
                        const mealId = `meal-${index}`;
                        const isCompleted = completedMeals[mealId];
                        
                        return (
                          <div
                            key={index}
                            className={`border rounded-lg overflow-hidden p-4 ${
                              isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}></div>
                                <h4 className={`font-mono ${isCompleted ? 'text-green-500' : 'text-primary'}`}>{meal.name}</h4>
                              </div>
                              
                              <Checkbox
                                id={mealId}
                                checked={isCompleted}
                                onCheckedChange={() => toggleMealComplete(index)}
                                className={`h-6 w-6 ${isCompleted ? 'border-green-500 bg-green-500' : ''}`}
                              />
                            </div>
                            <ul className="space-y-2">
                              {meal.foods.map((food, foodIndex) => (
                                <li
                                  key={foodIndex}
                                  className="flex items-center gap-2 text-sm text-muted-foreground"
                                >
                                  <span className="text-xs text-primary font-mono">
                                    {String(foodIndex + 1).padStart(2, "0")}
                                  </span>
                                  {food}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      ) : (
        <NoFitnessPlan />
      )}
    </section>
  );
};
export default ProfilePage;