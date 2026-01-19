import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SelectInputProps {
  name: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function SelectInput({ name, label, value, onChange, error, options }: SelectInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select value={String(value ?? "")} onValueChange={onChange}>
        <SelectTrigger id={name} className={error ? "border-red-500" : ""}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
