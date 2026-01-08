import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Apple, Coffee, Utensils, Moon, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";

export default function DietManager({ userId }: { userId: string }) {
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  
  const currentDietPlan = useQuery(api.diet.getCurrentDietPlan, { userId });
  const dayMeals = useQuery(api.diet.getDayMeals, { userId, date: selectedDay });
  const nutrientSummary = useQuery(api.diet.getDayNutrientSummary, { userId, date: selectedDay });
  const groceryList = useQuery(api.diet.getGroceryList, { userId });
  const supplementRecommendations = useQuery(api.supplements.getSupplementRecommendations, { userId });
  
  // Fetch meal suggestions for each meal type
  const breakfastSuggestions = useQuery(api.diet.generateMealSuggestions, { 
    userId, 
    date: selectedDay, 
    mealType: "breakfast" 
  });
  const lunchSuggestions = useQuery(api.diet.generateMealSuggestions, { 
    userId, 
    date: selectedDay, 
    mealType: "lunch" 
  });
  const snackSuggestions = useQuery(api.diet.generateMealSuggestions, { 
    userId, 
    date: selectedDay, 
    mealType: "snack" 
  });
  const dinnerSuggestions = useQuery(api.diet.generateMealSuggestions, { 
    userId, 
    date: selectedDay, 
    mealType: "dinner" 
  });

  const logMeal = useMutation(api.diet.logMeal);
  const orderMeal = useMutation(api.ordering.createMealOrder);
  const orderGroceries = useMutation(api.ordering.createGroceryOrder);

  const mealTypes = [
    { type: "breakfast", icon: Coffee, label: "Breakfast", time: "7:00 - 9:00 AM" },
    { type: "lunch", icon: Utensils, label: "Lunch", time: "12:00 - 2:00 PM" },
    { type: "snack", icon: Apple, label: "Snack", time: "4:00 - 6:00 PM" },
    { type: "dinner", icon: Moon, label: "Dinner", time: "7:00 - 9:00 PM" },
  ] as const;

  const handleLogMeal = async (
    mealType: "breakfast" | "lunch" | "dinner" | "snack" | "pre_workout" | "post_workout",
    meal: any
  ) => {
    await logMeal({
      userId,
      date: selectedDay,
      mealType,
      name: meal.name,
      foods: meal.foods,
      prepTime: meal.prepTime,
      source: meal.restaurant ? "restaurant" : "home",
      restaurantName: meal.restaurant,
    });
  };

  const nutrientGoals = {
    calories: currentDietPlan?.targetCalories || 2000,
    protein: currentDietPlan?.targetProtein || 150,
    carbs: currentDietPlan?.targetCarbs || 250,
    fat: currentDietPlan?.targetFats || 65,
  };

  return (
    <div className="space-y-6">
      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Calories</p>
                <span className="text-sm font-medium">
                  {nutrientSummary?.calories || 0} / {nutrientGoals.calories}
                </span>
              </div>
              <Progress 
                value={(nutrientSummary?.calories || 0) / nutrientGoals.calories * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Protein</p>
                <span className="text-sm font-medium">
                  {nutrientSummary?.protein || 0}g / {nutrientGoals.protein}g
                </span>
              </div>
              <Progress 
                value={(nutrientSummary?.protein || 0) / nutrientGoals.protein * 100} 
                className="h-2 [&>div]:bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Carbs</p>
                <span className="text-sm font-medium">
                  {nutrientSummary?.carbs || 0}g / {nutrientGoals.carbs}g
                </span>
              </div>
              <Progress 
                value={(nutrientSummary?.carbs || 0) / nutrientGoals.carbs * 100} 
                className="h-2 [&>div]:bg-green-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Fat</p>
                <span className="text-sm font-medium">
                  {nutrientSummary?.fat || 0}g / {nutrientGoals.fat}g
                </span>
              </div>
              <Progress 
                value={(nutrientSummary?.fat || 0) / nutrientGoals.fat * 100} 
                className="h-2 [&>div]:bg-yellow-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="meals">
        <TabsList>
          <TabsTrigger value="meals">Today's Meals</TabsTrigger>
          <TabsTrigger value="plan">Weekly Plan</TabsTrigger>
          <TabsTrigger value="grocery">Grocery List</TabsTrigger>
          <TabsTrigger value="supplements">Supplements</TabsTrigger>
        </TabsList>

        <TabsContent value="meals">
          <div className="space-y-4">
            {/* Date Selector */}
            <div className="flex items-center justify-between">
              <input
                type="date"
                value={selectedDay}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDay(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
              <Button variant="outline" size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Order Meals
              </Button>
            </div>

            {/* Meals by Type */}
            {mealTypes.map((mealType) => {
              const Icon = mealType.icon;
              
              // Get meal suggestions based on meal type
              let mealSuggestions;
              switch(mealType.type) {
                case "breakfast":
                  mealSuggestions = breakfastSuggestions;
                  break;
                case "lunch":
                  mealSuggestions = lunchSuggestions;
                  break;
                case "snack":
                  mealSuggestions = snackSuggestions;
                  break;
                case "dinner":
                  mealSuggestions = dinnerSuggestions;
                  break;
              }
              
              // Get the first meal suggestion (quick mode)
              const meal = mealSuggestions?.[0]?.meals?.[0];
              const isLogged = (dayMeals?.[mealType.type]?.length ?? 0) > 0;

              return (
                <Card key={mealType.type}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <CardTitle className="text-lg">{mealType.label}</CardTitle>
                      </div>
                      <span className="text-sm text-muted-foreground">{mealType.time}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {meal ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium">{meal.name}</h4>
                          {'prepTime' in meal && meal.prepTime && (
                            <p className="text-sm text-muted-foreground mt-1">Prep time: {meal.prepTime} mins</p>
                          )}
                        </div>
                        
                        <div className="flex gap-4 text-sm">
                          <span>{meal.foods.reduce((sum: number, f: any) => sum + f.calories, 0)} cal</span>
                          <span>{meal.foods.reduce((sum: number, f: any) => sum + f.protein, 0)}g protein</span>
                          <span>{meal.foods.reduce((sum: number, f: any) => sum + f.carbs, 0)}g carbs</span>
                          <span>{meal.foods.reduce((sum: number, f: any) => sum + f.fats, 0)}g fat</span>
                        </div>

                        {meal.foods && meal.foods.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Ingredients:</p>
                            <p className="text-sm text-muted-foreground">
                              {meal.foods.map((f: { name: string; quantity: number; unit: string }) => 
                                `${f.name} (${f.quantity}${f.unit})`
                              ).join(", ")}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {isLogged ? (
                            <Badge variant="secondary">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Logged
                            </Badge>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleLogMeal(mealType.type, meal)}
                            >
                              Log Meal
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Order from Restaurant
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No meal planned</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Meal Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentDietPlan ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan Type</p>
                        <p className="font-medium capitalize">{currentDietPlan.dietType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Daily Calories</p>
                        <p className="font-medium">{currentDietPlan.targetCalories} cal</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Diet Preferences</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">
                          {currentDietPlan.dietType}
                        </Badge>
                        {currentDietPlan.restrictions && currentDietPlan.restrictions.length > 0 && 
                          currentDietPlan.restrictions.map((restriction) => (
                            <Badge key={restriction} variant="secondary" className="capitalize">
                              No {restriction}
                            </Badge>
                          ))}
                      </div>
                    </div>

                    {currentDietPlan.restrictions && currentDietPlan.restrictions.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-900">Dietary Restrictions</p>
                          <p className="text-sm text-red-700">
                            {currentDietPlan.restrictions.join(", ")}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button className="w-full">Generate New Weekly Plan</Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No diet plan created yet</p>
                    <Button>Create Diet Plan</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grocery">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Grocery List</CardTitle>
              <Button 
                size="sm" 
                onClick={() => groceryList?._id && orderGroceries({
                  userId,
                  deliveryAddress: "",
                  paymentMethod: "cod",
                  groceryListId: groceryList._id,
                  deliverySlot: "",
                  selectedItems: []
                })}
                disabled={!groceryList?._id}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Order Groceries
              </Button>
            </CardHeader>
            <CardContent>
              {groceryList && groceryList.items && groceryList.items.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {groceryList.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Estimated Cost:</span>
                      <span className="font-bold">₹{groceryList.totalEstimatedCost}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No grocery list generated yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplements">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Supplements</CardTitle>
            </CardHeader>
            <CardContent>
              {supplementRecommendations && (supplementRecommendations.recommendations.high?.length > 0 || supplementRecommendations.recommendations.medium?.length > 0 || supplementRecommendations.recommendations.low?.length > 0) ? (
                <div className="space-y-4">
                  {[
                    ...(supplementRecommendations.recommendations.high || []).map(rec => ({ ...rec, priority: 'high' })),
                    ...(supplementRecommendations.recommendations.medium || []).map(rec => ({ ...rec, priority: 'medium' })),
                    ...(supplementRecommendations.recommendations.low || []).map(rec => ({ ...rec, priority: 'low' }))
                  ].map((supplement: any) => (
                    <div key={supplement.name} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{supplement.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {supplement.reason}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm">
                              <strong>Dosage:</strong> {supplement.dosage}
                            </span>
                            <span className="text-sm">
                              <strong>Timing:</strong> {supplement.timing}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={supplement.priority === "high" ? "destructive" : "secondary"}>
                            {supplement.priority} priority
                          </Badge>
                          <p className="text-sm font-medium mt-1">₹{supplement.monthlyCost}/mo</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Monthly Cost:</span>
                      <span className="font-bold">
                        ₹{supplementRecommendations.totalMonthlyCost || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Complete your nutrient tracking to get supplement recommendations
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
