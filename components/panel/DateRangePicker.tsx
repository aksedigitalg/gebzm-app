"use client";

import { Calendar } from "lucide-react";

export type DateRange = "today" | "7d" | "30d" | "90d" | "12m" | "all";

interface Props {
  value: DateRange;
  onChange: (v: DateRange) => void;
}

const options: { value: DateRange; label: string }[] = [
  { value: "today", label: "Bugün" },
  { value: "7d", label: "Son 7 Gün" },
  { value: "30d", label: "Son 30 Gün" },
  { value: "90d", label: "Son 90 Gün" },
  { value: "12m", label: "Son 12 Ay" },
  { value: "all", label: "Tüm Zaman" },
];

export function DateRangePicker({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DateRange)}
        className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function rangeToDays(r: DateRange): number {
  switch (r) {
    case "today":
      return 1;
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "12m":
      return 365;
    case "all":
      return 365 * 2;
  }
}
