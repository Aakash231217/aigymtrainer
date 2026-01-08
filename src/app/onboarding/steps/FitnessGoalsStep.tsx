import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function FitnessGoalsStep({ data, setData }: any) {
  const fitnessGoalOptions = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "endurance", label: "Improve Endurance" },
    { value: "strength", label: "Build Strength" },
    { value: "flexibility", label: "Increase Flexibility" },
    { value: "general_health", label: "General Health" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label>Select your fitness goals (multiple allowed)</Label>
        <div className="space-y-2 mt-2">
          {fitnessGoalOptions.map((goal) => (
            <div key={goal.value} className="flex items-center space-x-2">
              <Checkbox
                id={goal.value}
                checked={data.fitnessGoals.includes(goal.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setData({ ...data, fitnessGoals: [...data.fitnessGoals, goal.value] });
                  } else {
                    setData({
                      ...data,
                      fitnessGoals: data.fitnessGoals.filter((g: string) => g !== goal.value),
                    });
                  }
                }}
              />
              <Label htmlFor={goal.value}>{goal.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="targetWeight">Target Weight (kg)</Label>
        <Input
          id="targetWeight"
          type="number"
          value={data.targetWeight}
          onChange={(e) => setData({ ...data, targetWeight: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <Label htmlFor="targetDate">Target Date</Label>
        <Input
          id="targetDate"
          type="date"
          value={data.targetDate}
          onChange={(e) => setData({ ...data, targetDate: e.target.value })}
        />
      </div>

      <div>
        <Label>Fitness Level</Label>
        <RadioGroup value={data.fitnessLevel} onValueChange={(value) => setData({ ...data, fitnessLevel: value })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="beginner" id="beginner" />
            <Label htmlFor="beginner">Beginner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <Label htmlFor="intermediate">Intermediate</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="advanced" id="advanced" />
            <Label htmlFor="advanced">Advanced</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
