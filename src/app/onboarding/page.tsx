"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, User, Target, Apple, Activity, Brain, DollarSign } from "lucide-react";
import BasicInfoStep from "./steps/BasicInfoStep";
import FitnessGoalsStep from "./steps/FitnessGoalsStep";
import MedicalInfoStep from "./steps/MedicalInfoStep";
import DietPreferencesStep from "./steps/DietPreferencesStep";
import MentalHealthStep from "./steps/MentalHealthStep";
import EquipmentScheduleStep from "./steps/EquipmentScheduleStep";
import BudgetStep from "./steps/BudgetStep";
import FinalPreferencesStep from "./steps/FinalPreferencesStep";

const TOTAL_STEPS = 8;

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const createOrUpdateProfile = useMutation(api.userProfiles.createOrUpdateProfile);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    // Basic Info (Step 1)
    age: 25,
    gender: "male",
    height: 170,
    weight: 70,
    location: "",
    
    // Fitness Goals (Step 2)
    fitnessGoals: [] as string[],
    targetWeight: 70,
    targetDate: "",
    fitnessLevel: "beginner",
    
    // Medical Info (Step 3)
    medicalConditions: [] as string[],
    injuries: [] as string[],
    medications: [] as string[],
    isPregnant: false,
    
        // Diet Preferences (Step 4)
    dietPreference: "veg",
    currentDietChart: "",
    cookingStyle: "semi_active",
    cookingTimeAvailable: 30,
    allergies: [] as string[],
    cuisinePreferences: [] as string[],
    
    // Mental Health (Step 5)
    stressLevel: 5,
    sleepHours: 7,
    mentalHealthGoals: [] as string[],
    preferredReliefContent: [] as string[],
    socialPreference: "sometimes",
    
    // Equipment & Schedule (Step 6)
    workoutLocation: "home",
    equipmentAccess: [] as string[],
    daysAvailable: 4,
    workoutTimePreference: "morning",
    sessionDuration: 45,
    
    // Budget & Preferences (Step 7)
    dietBudget: 5000,
    supplementsBudget: 2000,
    currentSupplements: [] as string[],
    
    // Final Preferences (Step 8)
    notificationPreferences: {
      workoutReminders: true,
      mealReminders: true,
      mentalHealthCheckIns: true,
      progressUpdates: true,
    },
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Map frontend form data to Convex schema
      await createOrUpdateProfile({
        userId: user.id,
        // Basic info
        age: profileData.age,
        gender: profileData.gender as "male" | "female" | "other",
        weight: profileData.weight,
        height: profileData.height,
        targetWeight: profileData.targetWeight,
        location: profileData.location || "Not specified",
        
        // Professional & lifestyle (using defaults where not collected)
        profession: "Not specified",
        mentalStressLevel: profileData.stressLevel >= 7 ? "high" : profileData.stressLevel >= 4 ? "medium" : "low",
        
        // Fitness goals & preferences
        fitnessGoals: profileData.fitnessGoals,
        gymStyle: "semi_active", // Default
        preferredWorkoutTime: profileData.workoutTimePreference as "early_morning" | "morning" | "afternoon" | "evening" | "night",
        timeAvailability: profileData.sessionDuration,
        workoutDaysPerWeek: profileData.daysAvailable,
        fitnessLevel: profileData.fitnessLevel as "beginner" | "intermediate" | "advanced",
        
        // Diet preferences
        dietPreference: profileData.dietPreference as "veg" | "non_veg" | "vegan" | "jain" | "keto" | "paleo",
        currentDietChart: profileData.currentDietChart || undefined,
        cookingStyle: profileData.cookingStyle as "active" | "semi_active" | "lazy",
        cookingTimeAvailable: profileData.cookingTimeAvailable,
        kitchenEquipment: [],
        allergies: [],
        medicalConditions: profileData.medicalConditions,
        mealBudget: profileData.dietBudget,
        currentSupplements: profileData.currentSupplements,
        supplementsBudget: profileData.supplementsBudget,
        equipmentAccess: profileData.workoutLocation === "gym" ? "gym" : profileData.workoutLocation === "home" ? "home" : "both",
        tasteProfile: [],
        mealFrequency: 3, // Default
        
        // Mental health preferences
        mentalHealthTone: "motivational",
        preferredContent: profileData.preferredReliefContent as Array<"music" | "podcasts" | "stories" | "audiobooks">,
        mentalHealthTime: 15, // Default
        socialLevel: profileData.socialPreference === "always" ? "extrovert" : profileData.socialPreference === "sometimes" ? "neutral" : "introvert",
        sleepQuality: 7, // Default
        sleepHours: profileData.sleepHours,
        screenTime: 4, // Default
        workScreenTime: 8, // Default
        pastTherapy: false,
        copingPreferences: profileData.mentalHealthGoals,
        interests: [],
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={profileData} setData={setProfileData} />;
      case 2:
        return <FitnessGoalsStep data={profileData} setData={setProfileData} />;
      case 3:
        return <MedicalInfoStep data={profileData} setData={setProfileData} />;
      case 4:
        return <DietPreferencesStep data={profileData} setData={setProfileData} />;
      case 5:
        return <MentalHealthStep data={profileData} setData={setProfileData} />;
      case 6:
        return <EquipmentScheduleStep data={profileData} setData={setProfileData} />;
      case 7:
        return <BudgetStep data={profileData} setData={setProfileData} />;
      case 8:
        return <FinalPreferencesStep data={profileData} setData={setProfileData} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const titles = [
      "Basic Information",
      "Fitness Goals",
      "Medical Information",
      "Diet Preferences",
      "Mental Health",
      "Equipment & Schedule",
      "Budget",
      "Final Preferences",
    ];
    return titles[currentStep - 1];
  };

  const getStepIcon = () => {
    const icons = [
      <User className="w-5 h-5" />,
      <Target className="w-5 h-5" />,
      <Activity className="w-5 h-5" />,
      <Apple className="w-5 h-5" />,
      <Brain className="w-5 h-5" />,
      <Activity className="w-5 h-5" />,
      <DollarSign className="w-5 h-5" />,
      <Target className="w-5 h-5" />,
    ];
    return icons[currentStep - 1];
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">
            Welcome to <span className="text-primary">AI Gym Trainer</span>
          </h1>
          <p className="text-center text-muted-foreground">
            Let's personalize your fitness journey in just a few steps
          </p>
        </div>

        <Progress value={(currentStep / TOTAL_STEPS) * 100} className="mb-8" />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {getStepIcon()}
              <div>
                <CardTitle>{getStepTitle()}</CardTitle>
                <CardDescription>Step {currentStep} of {TOTAL_STEPS}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
              >
                {currentStep === TOTAL_STEPS ? "Complete" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
