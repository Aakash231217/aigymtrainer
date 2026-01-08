import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function FinalPreferencesStep({ data, setData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold mb-4 block">Notification Preferences</Label>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="workoutReminders"
              checked={data.notificationPreferences.workoutReminders}
              onCheckedChange={(checked) => 
                setData({
                  ...data,
                  notificationPreferences: {
                    ...data.notificationPreferences,
                    workoutReminders: checked,
                  },
                })
              }
            />
            <Label htmlFor="workoutReminders">
              <div>Workout Reminders</div>
              <div className="text-sm text-muted-foreground">Get notified about your scheduled workouts</div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="mealReminders"
              checked={data.notificationPreferences.mealReminders}
              onCheckedChange={(checked) => 
                setData({
                  ...data,
                  notificationPreferences: {
                    ...data.notificationPreferences,
                    mealReminders: checked,
                  },
                })
              }
            />
            <Label htmlFor="mealReminders">
              <div>Meal Reminders</div>
              <div className="text-sm text-muted-foreground">Never miss a meal with timely reminders</div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="mentalHealthCheckIns"
              checked={data.notificationPreferences.mentalHealthCheckIns}
              onCheckedChange={(checked) => 
                setData({
                  ...data,
                  notificationPreferences: {
                    ...data.notificationPreferences,
                    mentalHealthCheckIns: checked,
                  },
                })
              }
            />
            <Label htmlFor="mentalHealthCheckIns">
              <div>Mental Health Check-ins</div>
              <div className="text-sm text-muted-foreground">Regular mental wellness reminders and mood tracking</div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="progressUpdates"
              checked={data.notificationPreferences.progressUpdates}
              onCheckedChange={(checked) => 
                setData({
                  ...data,
                  notificationPreferences: {
                    ...data.notificationPreferences,
                    progressUpdates: checked,
                  },
                })
              }
            />
            <Label htmlFor="progressUpdates">
              <div>Progress Updates</div>
              <div className="text-sm text-muted-foreground">Weekly summaries of your fitness journey</div>
            </Label>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Ready to Start Your Journey!</h3>
        <p className="text-sm text-muted-foreground">
          We've collected all your preferences and are ready to create your personalized AI-powered fitness plan. 
          Click "Complete" to finish setup and access your dashboard.
        </p>
      </div>
    </div>
  );
}
