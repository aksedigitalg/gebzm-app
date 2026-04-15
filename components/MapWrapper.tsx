"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin, Landmark } from "lucide-react";
import type { MapPoint } from "@/data/services";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Harita yükleniyor...
    </div>
  ),
});

export default function MapWrapper({
  points,
  focusSlug,
}: {
  points: MapPoint[];
  focusSlug?: string;
}) {
  const [activeSlug, setActiveSlug] = useState<string | undefined>(focusSlug);

  return (
    <div className="relative h-full w-full">
      <MapView points={points} focusSlug={activeSlug} />

      {points.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[30px] z-[500]">
          <div
            className="pointer-events-auto flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-pl-5 scroll-pr-5 no-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {points.map((p, i) => {
              const active = p.slug === activeSlug;
              const isFirst = i === 0;
              const isLast = i === points.length - 1;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setActiveSlug(p.slug)}
                  className={`group w-[72vw] max-w-[300px] shrink-0 snap-start rounded-2xl border bg-white text-left shadow-lg transition ${
                    active
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:shadow-xl"
                  } ${isFirst ? "ml-5" : ""} ${isLast ? "mr-5" : ""}`}
                >
                  <div className="flex gap-3 p-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
                      <Landmark
                        className="h-7 w-7 text-primary/70"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                        {p.category}
                      </span>
                      <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-900">
                        {p.name}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{p.address}</span>
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
