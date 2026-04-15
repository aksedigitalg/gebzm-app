"use client";

interface DataPoint {
  label: string;
  value: number;
}

export function BarChart({ data }: { data: DataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-44 items-end gap-2">
      {data.map((d, i) => {
        const h = (d.value / max) * 100;
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-2">
            <div
              className="relative w-full overflow-hidden rounded-t-lg bg-gradient-to-t from-primary to-secondary transition-all group-hover:from-primary group-hover:to-primary"
              style={{ height: `${Math.max(h, 4)}%` }}
            >
              <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background group-hover:block">
                {d.value}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({ data }: { data: DataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const width = 600;
  const height = 180;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1]?.x} ${height - padding} L ${points[0]?.x} ${height - padding} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
        <defs>
          <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#line-area)" />
        <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--primary)" />
            <circle cx={p.x} cy={p.y} r="7" fill="var(--primary)" opacity="0.15" />
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-between px-2 text-[10px] text-muted-foreground">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
