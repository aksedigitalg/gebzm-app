import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Phone, Clock, Navigation } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { dineInRestaurants } from "@/data/restaurants";
import { BusinessActions } from "@/components/BusinessActions";

export async function generateStaticParams() {
  return dineInRestaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = dineInRestaurants.find((x) => x.slug === slug);
  return { title: r?.name ?? "Restoran" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = dineInRestaurants.find((x) => x.slug === slug);
  if (!r) notFound();

  const [lat, lng] = r.coordinates;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <>
      <PageHeader title={r.name} subtitle={r.cuisine} back="/restoran" />
      <div className="pb-6">
        <div className={`relative h-44 bg-gradient-to-br ${r.coverGradient}`}>
          <div className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {r.rating.toFixed(1)}
            <span className="opacity-80">({r.reviewCount})</span>
          </div>
          <div className="absolute right-5 top-5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800">
            {"₺".repeat(r.priceLevel)}
          </div>
        </div>

        <div className="px-5 pt-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {r.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {r.features.map((f) => (
              <span
                key={f}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
              >
                {f}
              </span>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Adres
                </p>
                <p className="text-sm">{r.address}</p>
              </div>
            </div>
            <a
              href={`tel:${r.phone.replace(/\s/g, "")}`}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 transition hover:bg-muted"
            >
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Telefon
                </p>
                <p className="text-sm">{r.phone}</p>
              </div>
            </a>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Çalışma Saatleri
                </p>
                <p className="text-sm">{r.hours}</p>
              </div>
            </div>
          </div>

          <Link
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            <Navigation className="h-4 w-4" />
            Yol Tarifi
          </Link>
          <div className="h-32" />
        </div>
      </div>
      <BusinessActions
        businessName={r.name}
        businessType="Restoran"
        bookingLabel="Rezervasyon"
      />
    </>
  );
}
