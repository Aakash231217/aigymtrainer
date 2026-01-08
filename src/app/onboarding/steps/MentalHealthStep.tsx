import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

export default function MentalHealthStep({ data, setData }: any) {
  const mentalHealthGoalOptions = [
    { value: "reduce_stress", label: "Reduce Stress" },
    { value: "better_sleep", label: "Better Sleep" },
    { value: "manage_anxiety", label: "Manage Anxiety" },
    { value: "boost_mood", label: "Boost Mood" },
    { value: "increase_focus", label: "Increase Focus" },
    { value: "build_confidence", label: "Build Confidence" },
  ];

  const reliefContentOptions = [
    { value: "music", label: "Music" },
    { value: "podcasts", label: "Podcasts" },
    { value: "meditation", label: "Meditation" },
    { value: "breathing", label: "Breathing Exercises" },
    { value: "nature_sounds", label: "Nature Sounds" },
    { value: "motivational", label: "Motivational Content" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label>Current Stress Level (1-10)</Label>
        <Slider
          value={[data.stressLevel]}
          onValueChange={(value) => setData({ ...data, stressLevel: value[0] })}
          min={1}
          max={10}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>Low stress</span>
          <span>{data.stressLevel}</span>
          <span>High stress</span>
        </div>
      </div>

      <div>
        <Label>Average Sleep Hours</Label>
        <Slider
          value={[data.sleepHours]}
          onValueChange={(value) => setData({ ...data, sleepHours: value[0] })}
          min={4}
          max={10}
          step={0.5}
          className="mt-2"
        />
        <span className="text-sm text-muted-foreground">{data.sleepHours} hours</span>
      </div>

      <div>
        <Label>Mental Health Goals</Label>
        <div className="space-y-2 mt-2">
          {mentalHealthGoalOptions.map((goal) => (
            <div key={goal.value} className="flex items-center space-x-2">
              <Checkbox
                id={goal.value}
                checked={data.mentalHealthGoals.includes(goal.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setData({ ...data, mentalHealthGoals: [...data.mentalHealthGoals, goal.value] });
                  } else {
                    setData({
                      ...data,
                      mentalHealthGoals: data.mentalHealthGoals.filter((g: string) => g !== goal.value),
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
        <Label>Preferred Relief Content</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {reliefContentOptions.map((content) => (
            <div key={content.value} className="flex items-center space-x-2">
              <Checkbox
                id={content.value}
                checked={data.preferredReliefContent.includes(content.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setData({ ...data, preferredReliefContent: [...data.preferredReliefContent, content.value] });
                  } else {
                    setData({
                      ...data,
                      preferredReliefContent: data.preferredReliefContent.filter((c: string) => c !== content.value),
                    });
                  }
                }}
              />
              <Label htmlFor={content.value}>{content.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Social Preference</Label>
        <RadioGroup value={data.socialPreference} onValueChange={(value) => setData({ ...data, socialPreference: value })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="solo" id="solo" />
            <Label htmlFor="solo">I prefer solo activities</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sometimes" id="sometimes" />
            <Label htmlFor="sometimes">I enjoy social activities sometimes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="always" id="always" />
            <Label htmlFor="always">I love group activities</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
