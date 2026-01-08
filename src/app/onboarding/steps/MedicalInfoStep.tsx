import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function MedicalInfoStep({ data, setData }: any) {
  const medicalConditionOptions = [
    "diabetes", "hypertension", "heart_disease", "asthma", 
    "arthritis", "thyroid", "pcos", "none"
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label>Medical Conditions (if any)</Label>
        <div className="space-y-2 mt-2">
          {medicalConditionOptions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={condition}
                checked={data.medicalConditions.includes(condition)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setData({ ...data, medicalConditions: [...data.medicalConditions, condition] });
                  } else {
                    setData({
                      ...data,
                      medicalConditions: data.medicalConditions.filter((c: string) => c !== condition),
                    });
                  }
                }}
              />
              <Label htmlFor={condition} className="capitalize">
                {condition.replace(/_/g, " ")}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="injuries">Current Injuries (comma separated)</Label>
        <Input
          id="injuries"
          placeholder="e.g., lower back pain, knee injury"
          value={data.injuries.join(", ")}
          onChange={(e) => setData({ ...data, injuries: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
        />
      </div>

      <div>
        <Label htmlFor="medications">Current Medications (comma separated)</Label>
        <Input
          id="medications"
          placeholder="e.g., insulin, blood pressure medicine"
          value={data.medications.join(", ")}
          onChange={(e) => setData({ ...data, medications: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
        />
      </div>

      {data.gender === "female" && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="pregnant"
            checked={data.isPregnant}
            onCheckedChange={(checked) => setData({ ...data, isPregnant: checked })}
          />
          <Label htmlFor="pregnant">Are you pregnant?</Label>
        </div>
      )}
    </div>
  );
}
