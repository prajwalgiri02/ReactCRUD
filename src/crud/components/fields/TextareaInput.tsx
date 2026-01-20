import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextareaInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function TextareaInput({ name, label, value, onChange, error, placeholder }: TextareaInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
