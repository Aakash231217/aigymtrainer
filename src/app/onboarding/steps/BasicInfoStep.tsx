import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BasicInfoStep({ data, setData }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={data.age}
            onChange={(e) => setData({ ...data, age: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={data.gender} onValueChange={(value) => setData({ ...data, gender: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            value={data.height}
            onChange={(e) => setData({ ...data, height: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={data.weight}
            onChange={(e) => setData({ ...data, weight: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City, Country"
          value={data.location}
          onChange={(e) => setData({ ...data, location: e.target.value })}
        />
      </div>
    </div>
  );
}
