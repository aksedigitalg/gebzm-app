import { notFound } from "next/navigation";
import { Calendar, MapPin, Ticket, Share2, Heart, CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { events, eventCategoryLabels } from "@/data/events";
import { formatDateTR } from "@/lib/utils";

export async function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = events.find((x) => x.id === id);
  return { title: e?.title ?? "Etkinlik" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = events.find((x) => x.id === id);
  if (!e) notFound();

  const date = new Date(e.date);
  const day = date.toLocaleDateString("tr-TR", { day: "2-digit" });
  const month = date.toLocaleDateString("tr-TR", { month: "long" });
  const weekday = date.toLocaleDateString("tr-TR", { weekday: "long" });

  return (
    <>
      <PageHeader
        title="Etkinlik Detayı"
        subtitle={eventCategoryLabels[e.category]}
        back="/etkinlikler"
      />
      <div className="pb-32">
        {/* Hero */}
        <div className="relative h-40 bg-gradient-to-br from-primary via-secondary to-accent">
          <span className="absolute left-5 top-5 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {eventCategoryLabels[e.category]}
          </span>
          <div className="absolute right-5 top-5 flex gap-1">
            <button
              type="button"
              aria-label="Favori"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Paylaş"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:bg-white"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-5">
          {/* Başlık + tarih büyük */}
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="text-2xl font-bold leading-none">{day}</span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-wider">
                {month}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold leading-tight">{e.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {weekday}, {formatDateTR(e.date)}
              </p>
            </div>
          </div>

          {/* Açıklama */}
          <section className="mt-5 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Etkinlik Hakkında
            </h3>
            <p className="text-sm leading-relaxed">{e.description}</p>
          </section>

          {/* Detaylar */}
          <section className="mt-3 space-y-2">
            <InfoRow icon={<Calendar className="h-5 w-5 text-primary" />} label="Tarih & Saat" value={formatDateTR(e.date)} />
            <InfoRow icon={<MapPin className="h-5 w-5 text-primary" />} label="Konum" value={e.location} />
            {e.price && (
              <InfoRow icon={<Ticket className="h-5 w-5 text-primary" />} label="Katılım" value={e.price} />
            )}
          </section>
        </div>
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed inset-x-0 z-30 px-5"
        style={{
          bottom: "calc(76px + env(safe-area-inset-bottom, 0px) + 10px)",
        }}
      >
        <button
          type="button"
          className="mx-auto flex w-full max-w-[600px] items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-2xl transition hover:opacity-90"
        >
          <CalendarPlus className="h-4 w-4" />
          Takvime Ekle
        </button>
      </div>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
