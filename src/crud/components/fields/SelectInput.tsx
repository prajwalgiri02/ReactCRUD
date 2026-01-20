import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
        <SelectTrigger id={name} className={cn(error && "border-destructive focus:ring-destructive")}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
