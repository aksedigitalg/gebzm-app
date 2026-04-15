"use client";

interface Props {
  data: number[][]; // 7 gün × 24 saat
}

const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function HeatmapChart({ data }: Props) {
  const max = Math.max(...data.flat(), 1);

  const getColor = (count: number) => {
    const intensity = count / max;
    if (intensity === 0) return "bg-muted/30";
    if (intensity < 0.2) return "bg-primary/10";
    if (intensity < 0.4) return "bg-primary/25";
    if (intensity < 0.6) return "bg-primary/45";
    if (intensity < 0.8) return "bg-primary/65";
    return "bg-primary";
  };

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="min-w-[560px]">
        {/* Saat başlıkları */}
        <div className="mb-1 grid grid-cols-[40px_repeat(24,1fr)] gap-0.5">
          <div />
          {Array.from({ length: 24 }).map((_, h) => (
            <div
              key={h}
              className="text-center text-[9px] text-muted-foreground"
            >
              {h % 3 === 0 ? h : ""}
            </div>
          ))}
        </div>

        {/* Gün satırları */}
        {days.map((dayLabel, dIdx) => (
          <div
            key={dayLabel}
            className="mb-0.5 grid grid-cols-[40px_repeat(24,1fr)] gap-0.5"
          >
            <div className="flex items-center text-[10px] font-semibold text-muted-foreground">
              {dayLabel}
            </div>
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                className={`group relative aspect-square rounded-sm ${getColor(
                  data[dIdx][h]
                )} transition hover:ring-2 hover:ring-primary/50`}
                title={`${dayLabel} ${h}:00 - ${data[dIdx][h]} ziyaret`}
              >
                <span className="pointer-events-none absolute bottom-full left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[9px] font-semibold text-background group-hover:block">
                  {dayLabel} {h}:00 · {data[dIdx][h]}
                </span>
              </div>
            ))}
          </div>
        ))}

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>Az</span>
          <div className="h-3 w-3 rounded-sm bg-muted/30" />
          <div className="h-3 w-3 rounded-sm bg-primary/25" />
          <div className="h-3 w-3 rounded-sm bg-primary/45" />
          <div className="h-3 w-3 rounded-sm bg-primary/65" />
          <div className="h-3 w-3 rounded-sm bg-primary" />
          <span>Çok</span>
        </div>
      </div>
    </div>
  );
}
