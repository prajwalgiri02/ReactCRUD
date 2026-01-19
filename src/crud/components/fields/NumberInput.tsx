import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberInputProps {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  placeholder?: string;
}

export function NumberInput({ name, label, value, onChange, error, placeholder }: NumberInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
