"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AvatarNameCell({ name, subtitle, src }: { name: string; subtitle?: string; src?: string }) {
  return (
    <div className="flex items-center gap-3 min-w-[240px]">
      <div className="h-10 w-10 rounded-full bg-muted overflow-hidden grid place-items-center">
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">{name.slice(0, 1).toUpperCase()}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="font-semibold leading-5 truncate">{name}</div>
        {subtitle ? <div className="text-xs text-muted-foreground truncate">{subtitle}</div> : null}
      </div>
    </div>
  );
}

export function StatusPill({ value }: { value: string }) {
  const v = String(value).toLowerCase();

  const styles =
    v === "paid" || v === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : v === "unpaid" || v === "pending"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : v === "cancelled" || v === "inactive"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        styles
      )}
    >
      {value}
    </span>
  );
}


export function MoneyCell({ value, currency = "$" }: { value: number | string; currency?: string }) {
  const num = typeof value === "string" ? Number(value) : value;
  const formatted = Number.isFinite(num) ? `${currency}${num.toLocaleString()}` : String(value);
  return <span className="font-medium">{formatted}</span>;
}
