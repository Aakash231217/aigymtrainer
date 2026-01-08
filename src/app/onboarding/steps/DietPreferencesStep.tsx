import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

export default function DietPreferencesStep({ data, setData }: any) {
  const cuisineOptions = [
    "indian", "chinese", "italian", "mexican", "thai", 
    "mediterranean", "japanese", "american"
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label>Diet Preference</Label>
        <RadioGroup value={data.dietPreference} onValueChange={(value) => setData({ ...data, dietPreference: value })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="veg" id="veg" />
            <Label htmlFor="veg">Vegetarian</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non_veg" id="non_veg" />
            <Label htmlFor="non_veg">Non-Vegetarian</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vegan" id="vegan" />
            <Label htmlFor="vegan">Vegan</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="eggetarian" id="eggetarian" />
            <Label htmlFor="eggetarian">Eggetarian</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="allergies">Allergies (comma separated)</Label>
        <Input
          id="allergies"
          placeholder="e.g., nuts, dairy, gluten"
          value={data.allergies.join(", ")}
          onChange={(e) => setData({ ...data, allergies: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
        />
      </div>

      <div>
        <Label>Preferred Cuisines</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {cuisineOptions.map((cuisine) => (
            <div key={cuisine} className="flex items-center space-x-2">
              <Checkbox
                id={cuisine}
                checked={data.cuisinePreferences.includes(cuisine)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setData({ ...data, cuisinePreferences: [...data.cuisinePreferences, cuisine] });
                  } else {
                    setData({
                      ...data,
                      cuisinePreferences: data.cuisinePreferences.filter((c: string) => c !== cuisine),
                    });
                  }
                }}
              />
              <Label htmlFor={cuisine} className="capitalize">{cuisine}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Cooking Style</Label>
        <RadioGroup value={data.cookingStyle} onValueChange={(value) => setData({ ...data, cookingStyle: value })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="active" id="active" />
            <Label htmlFor="active">I love cooking</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="semi_active" id="semi_active" />
            <Label htmlFor="semi_active">I cook sometimes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lazy" id="lazy" />
            <Label htmlFor="lazy">I prefer ordering/minimal cooking</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>Available cooking time (minutes)</Label>
        <Slider
          value={[data.cookingTimeAvailable]}
          onValueChange={(value) => setData({ ...data, cookingTimeAvailable: value[0] })}
          min={10}
          max={120}
          step={10}
          className="mt-2"
        />
        <span className="text-sm text-muted-foreground">{data.cookingTimeAvailable} minutes</span>
      </div>
    </div>
  );
}
