"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { EventCategory } from "@/lib/types/event";

interface Props {
  categories: EventCategory[];
  activeCategory?: string;
  activeWhen?: string;
}

export function EventFilters({ categories, activeCategory, activeWhen }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      const qs = params.toString();
      router.push(qs ? `?${qs}` : "/etkinlikler");
    },
    [router, sp]
  );

  return (
    <div className="space-y-3">
      {/* Zaman filtresi */}
      <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          <Chip
            active={!activeWhen}
            onClick={() => updateParam("when", null)}
          >
            Tümü
          </Chip>
          <Chip
            active={activeWhen === "today"}
            onClick={() => updateParam("when", "today")}
          >
            Bugün
          </Chip>
          <Chip
            active={activeWhen === "week"}
            onClick={() => updateParam("when", "week")}
          >
            Bu Hafta
          </Chip>
          <Chip
            active={activeWhen === "month"}
            onClick={() => updateParam("when", "month")}
          >
            Bu Ay
          </Chip>
        </div>
      </div>

      {/* Kategori filtresi */}
      <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          <Chip
            active={!activeCategory}
            onClick={() => updateParam("category", null)}
          >
            Hepsi
          </Chip>
          {categories.map(cat => (
            <Chip
              key={cat.key}
              active={activeCategory === cat.key}
              onClick={() => updateParam("category", cat.key)}
              color={cat.color}
            >
              {cat.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition"
      style={{
        backgroundColor: active ? color || "#0e7490" : "transparent",
        color: active ? "white" : undefined,
        borderColor: active ? color || "#0e7490" : "var(--border, #e5e7eb)",
      }}
    >
      {children}
    </button>
  );
}
