import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

export default function EquipmentScheduleStep({ data, setData }: any) {
  const equipmentOptions = [
    { value: "none", label: "No equipment" },
    { value: "dumbbells", label: "Dumbbells" },
    { value: "barbell", label: "Barbell" },
    { value: "resistance_bands", label: "Resistance Bands" },
    { value: "pull_up_bar", label: "Pull-up Bar" },
    { value: "kettlebell", label: "Kettlebell" },
    { value: "treadmill", label: "Treadmill" },
    { value: "bike", label: "Exercise Bike" },
    { value: "yoga_mat", label: "Yoga Mat" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label>Workout Location</Label>
        <RadioGroup value={data.workoutLocation} onValueChange={(value) => setData({ ...data, workoutLocation: value })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="home" id="home" />
            <Label htmlFor="home">Home</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gym" id="gym" />
            <Label htmlFor="gym">Gym</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both">Both</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>Equipment Access</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {equipmentOptions.map((equipment) => (
            <div key={equipment.value} className="flex items-center space-x-2">
              <Checkbox
                id={equipment.value}
                checked={data.equipmentAccess.includes(equipment.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setData({ ...data, equipmentAccess: [...data.equipmentAccess, equipment.value] });
                  } else {
                    setData({
                      ...data,
                      equipmentAccess: data.equipmentAccess.filter((e: string) => e !== equipment.value),
                    });
                  }
                }}
              />
              <Label htmlFor={equipment.value}>{equipment.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Days Available Per Week</Label>
        <Slider
          value={[data.daysAvailable]}
          onValueChange={(value) => setData({ ...data, daysAvailable: value[0] })}
          min={1}
          max={7}
          step={1}
          className="mt-2"
        />
        <span className="text-sm text-muted-foreground">{data.daysAvailable} days</span>
      </div>

      <div>
        <Label>Preferred Workout Time</Label>
        <RadioGroup value={data.workoutTimePreference} onValueChange={(value) => setData({ ...data, workoutTimePreference: value })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="morning" id="morning" />
            <Label htmlFor="morning">Morning (6 AM - 10 AM)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="afternoon" id="afternoon" />
            <Label htmlFor="afternoon">Afternoon (12 PM - 4 PM)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="evening" id="evening" />
            <Label htmlFor="evening">Evening (5 PM - 9 PM)</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>Session Duration (minutes)</Label>
        <Slider
          value={[data.sessionDuration]}
          onValueChange={(value) => setData({ ...data, sessionDuration: value[0] })}
          min={15}
          max={120}
          step={15}
          className="mt-2"
        />
        <span className="text-sm text-muted-foreground">{data.sessionDuration} minutes</span>
      </div>
    </div>
  );
}
