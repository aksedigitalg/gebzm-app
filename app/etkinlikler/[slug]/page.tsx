import { notFound } from "next/navigation";
import {
  Calendar,
  ExternalLink,
  MapPin,
  Phone,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EventInterestButton } from "@/components/EventInterestButton";
import type { Event } from "@/lib/types/event";

export const dynamic = "force-dynamic";

const API =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api/v1";

async function getData(slug: string): Promise<Event | null> {
  try {
    const res = await fetch(`${API}/events/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Event;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getData(slug);
  return { title: event?.title ?? "Etkinlik" };
}

function formatTr(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getData(slug);
  if (!event) notFound();

  const start = formatTr(event.start_at);
  const end = event.end_at ? formatTr(event.end_at) : null;

  return (
    <>
      <PageHeader
        title="Etkinlik"
        subtitle={event.category_label}
        back="/etkinlikler"
      />
      <div className="pb-32">
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500">
          {(event.cover_url || event.photo_url) && (
            <img
              src={event.cover_url || event.photo_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          )}
          {event.category_label && (
            <span
              className="absolute left-4 top-4 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg"
              style={{ backgroundColor: event.category_color || "#8b5cf6" }}
            >
              {event.category_label}
            </span>
          )}
          {event.price === 0 && (
            <span className="absolute right-4 top-4 rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
              Ücretsiz
            </span>
          )}
        </div>

        <div className="space-y-4 px-5 pt-5">
          <h1 className="text-2xl font-extrabold leading-tight">{event.title}</h1>

          <div className="space-y-2.5 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{start.date}</p>
                <p className="text-xs text-muted-foreground">
                  {start.time}
                  {end &&
                    ` — ${end.date === start.date ? end.time : end.date + " " + end.time}`}
                </p>
              </div>
            </div>
            {event.location_name && (
              <div className="flex items-start gap-3 border-t border-border pt-2.5">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{event.location_name}</p>
                  {event.address && (
                    <p className="text-xs text-muted-foreground">{event.address}</p>
                  )}
                  {event.lat && event.lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      Haritada Gör <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
            {event.price > 0 && (
              <div className="flex items-start gap-3 border-t border-border pt-2.5">
                <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {event.price.toLocaleString("tr-TR", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </p>
                  <p className="text-xs text-muted-foreground">Bilet Ücreti</p>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Açıklama
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </div>
          )}

          {(event.organizer ||
            event.contact_phone ||
            event.contact_url ||
            event.ticket_url) && (
            <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                İletişim & Bilet
              </h3>
              {event.organizer && (
                <p className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 shrink-0 text-primary" />
                  {event.organizer}
                </p>
              )}
              {event.contact_phone && (
                <a
                  href={`tel:${event.contact_phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {event.contact_phone}
                </a>
              )}
              {event.contact_url && (
                <a
                  href={event.contact_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  Web Sitesi
                </a>
              )}
              {event.ticket_url && (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-bold text-white transition hover:opacity-90"
                >
                  <Ticket className="h-4 w-4 shrink-0" />
                  Bilet Al
                </a>
              )}
            </div>
          )}

          {(event.attending_count > 0 || event.interested_count > 0) && (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">
                <b className="text-foreground">{event.attending_count}</b>{" "}
                katılıyor ·{" "}
                <b className="text-foreground">{event.interested_count}</b>{" "}
                ilgileniyor
              </span>
            </div>
          )}
        </div>

        <EventInterestButton
          eventId={event.id}
          initialStatus={event.user_status}
        />
      </div>
    </>
  );
}
