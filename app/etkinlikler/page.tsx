import { MapPin, PartyPopper, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { EventFilters } from "@/components/EventFilters";
import type { Event, EventCategory } from "@/lib/types/event";

export const dynamic = "force-dynamic";

const API =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api/v1";

interface SearchParams {
  category?: string;
  when?: string;
  q?: string;
}

async function getData(searchParams: SearchParams) {
  const qs = new URLSearchParams();
  if (searchParams.category) qs.set("category", searchParams.category);
  if (searchParams.when) qs.set("when", searchParams.when);
  if (searchParams.q) qs.set("q", searchParams.q);

  try {
    const [events, categories] = await Promise.all([
      fetch(`${API}/events${qs.toString() ? "?" + qs.toString() : ""}`, {
        cache: "no-store",
      })
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`${API}/event-categories`, { cache: "no-store" })
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
    ]);
    return {
      events: events as Event[],
      categories: categories as EventCategory[],
    };
  } catch {
    return { events: [] as Event[], categories: [] as EventCategory[] };
  }
}

function formatTr(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      weekday: "short",
    }),
    time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { events, categories } = await getData(sp);

  return (
    <>
      <PageHeader title="Etkinlikler" subtitle="Gebze'de neler oluyor?" back="/" />
      <div className="px-5 pb-10 pt-2">
        {/* Hero */}
        <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <PartyPopper className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight">
                Yaklaşan Etkinlikler
              </h1>
              <p className="text-xs opacity-90">
                Konser · Tiyatro · Sergi · Festival ve daha fazlası
              </p>
            </div>
          </div>
        </div>

        {/* Filtreler — client component */}
        <EventFilters
          categories={categories}
          activeCategory={sp.category}
          activeWhen={sp.when}
        />

        {/* Liste */}
        {events.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <Sparkles
              className="h-10 w-10 text-muted-foreground/30"
              strokeWidth={1.5}
            />
            <p className="mt-3 text-sm font-semibold">Etkinlik bulunamadı</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Filtreyi değiştirmeyi dene veya birkaç gün sonra tekrar bak
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {events.map(ev => {
              const d = formatTr(ev.start_at);
              return (
                <Link
                  key={ev.id}
                  href={`/etkinlikler/${ev.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-violet-500 to-pink-500">
                    {(ev.cover_url || ev.photo_url) && (
                      <img
                        src={ev.cover_url || ev.photo_url}
                        alt={ev.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}
                    {ev.category_label && (
                      <span
                        className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow"
                        style={{
                          backgroundColor: ev.category_color || "#8b5cf6",
                        }}
                      >
                        {ev.category_label}
                      </span>
                    )}
                    {ev.price === 0 && (
                      <span className="absolute right-2 top-2 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                        Ücretsiz
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-primary">
                      {d.date} · {d.time}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-tight">
                      {ev.title}
                    </h3>
                    {ev.location_name && (
                      <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {ev.location_name}
                      </p>
                    )}
                    {(ev.interested_count > 0 || ev.attending_count > 0) && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {ev.attending_count > 0 && `${ev.attending_count} katılıyor`}
                        {ev.attending_count > 0 && ev.interested_count > 0 && " · "}
                        {ev.interested_count > 0 &&
                          `${ev.interested_count} ilgileniyor`}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
