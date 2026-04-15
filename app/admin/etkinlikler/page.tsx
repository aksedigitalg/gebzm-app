"use client";

import { Calendar, MapPin, Search, Plus } from "lucide-react";
import { events, eventCategoryLabels } from "@/data/events";
import { formatDateTR } from "@/lib/utils";

export default function Page() {
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Etkinlikler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {events.length} etkinlik · Platform genelinde yaklaşanlar
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Yeni Etkinlik
        </button>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Etkinlik ara..."
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <div
            key={e.id}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Calendar className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <div className="p-4">
              <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {eventCategoryLabels[e.category]}
              </span>
              <p className="mt-2 line-clamp-2 text-sm font-semibold">{e.title}</p>
              <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                <p className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateTR(e.date)}
                </p>
                <p className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {e.location}
                </p>
              </div>
              <div className="mt-3 flex gap-1">
                <button className="flex-1 rounded-lg border border-border py-1.5 text-xs font-medium transition hover:bg-muted">
                  Düzenle
                </button>
                <button className="flex-1 rounded-lg bg-red-500/10 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500/20">
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
