"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckboxInputProps {
  name: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export function CheckboxInput({ name, label, value, onChange, error, disabled }: CheckboxInputProps) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id={name}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(!!checked)}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
        <Label htmlFor={name} className="cursor-pointer font-medium">
          {label}
        </Label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
