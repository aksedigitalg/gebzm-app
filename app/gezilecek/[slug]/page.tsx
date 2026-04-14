import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Lightbulb, Landmark, Navigation } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { places, categoryLabels } from "@/data/places";

export async function generateStaticParams() {
  return places.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = places.find((p) => p.slug === slug);
  return { title: place?.name ?? "Yer" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = places.find((p) => p.slug === slug);
  if (!place) notFound();

  const [lat, lng] = place.coordinates;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <>
      <PageHeader
        title={place.name}
        subtitle={categoryLabels[place.category]}
        back="/gezilecek"
      />
      <article className="px-5 pb-6 pt-4">
        <div className="flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/25">
          <Landmark className="h-16 w-16 text-primary/70" strokeWidth={1.25} />
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
              {categoryLabels[place.category]}
            </span>
            <h2 className="mt-2 text-xl font-bold leading-tight">{place.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {place.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Adres
                </p>
                <p className="text-sm">{place.address}</p>
              </div>
            </div>

            {place.openHours && (
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Ziyaret Saatleri
                  </p>
                  <p className="text-sm">{place.openHours}</p>
                </div>
              </div>
            )}
          </div>

          {place.tips && place.tips.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-semibold">İpuçları</p>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {place.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Navigation className="h-4 w-4" />
              Yol Tarifi
            </a>
            <Link
              href={`/harita?yer=${place.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-muted"
            >
              <MapPin className="h-4 w-4" />
              Haritada Gör
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
