import { cn } from "@/lib/utils";

interface Props {
  total: number;
  current: number; // 0-indexed
  className?: string;
}

export function StepIndicator({ total, current, className }: Props) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              active
                ? "w-8 bg-primary"
                : done
                  ? "w-4 bg-primary/60"
                  : "w-4 bg-muted"
            )}
          />
        );
      })}
    </div>
  );
}
