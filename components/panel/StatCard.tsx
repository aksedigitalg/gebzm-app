import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color: string; // Tailwind gradient classes e.g. "from-blue-500 to-indigo-600"
}

export function StatCard({ label, value, change, trend, icon: Icon, color }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-[11px] font-semibold",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground",
            color
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
