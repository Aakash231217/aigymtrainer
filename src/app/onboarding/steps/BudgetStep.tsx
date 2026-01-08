import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function BudgetStep({ data, setData }: any) {
  const supplementOptions = [
    { value: "protein_powder", label: "Protein Powder" },
    { value: "creatine", label: "Creatine" },
    { value: "multivitamin", label: "Multivitamin" },
    { value: "omega3", label: "Omega-3" },
    { value: "bcaa", label: "BCAAs" },
    { value: "pre_workout", label: "Pre-workout" },
    { value: "vitamin_d", label: "Vitamin D" },
    { value: "l_carnitine", label: "L-Carnitine" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="dietBudget">Monthly Diet Budget (₹)</Label>
        <Input
          id="dietBudget"
          type="number"
          value={data.dietBudget}
          onChange={(e) => setData({ ...data, dietBudget: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <Label htmlFor="supplementsBudget">Monthly Supplements Budget (₹)</Label>
        <Input
          id="supplementsBudget"
          type="number"
          value={data.supplementsBudget}
          onChange={(e) => setData({ ...data, supplementsBudget: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <Label>Current Supplements</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {supplementOptions.map((supplement) => (
            <div key={supplement.value} className="flex items-center space-x-2">
              <Checkbox
                id={supplement.value}
                checked={data.currentSupplements.includes(supplement.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setData({ ...data, currentSupplements: [...data.currentSupplements, supplement.value] });
                  } else {
                    setData({
                      ...data,
                      currentSupplements: data.currentSupplements.filter((s: string) => s !== supplement.value),
                    });
                  }
                }}
              />
              <Label htmlFor={supplement.value}>{supplement.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
