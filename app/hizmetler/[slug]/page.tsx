import { notFound } from "next/navigation";
import { Star, ShieldCheck, Clock, MapPin, CheckCircle2, Phone, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { serviceProviders } from "@/data/providers";

export async function generateStaticParams() {
  return serviceProviders.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = serviceProviders.find((x) => x.slug === slug);
  return { title: p?.name ?? "Hizmet Sağlayıcı" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = serviceProviders.find((x) => x.slug === slug);
  if (!p) notFound();

  return (
    <>
      <PageHeader title={p.name} subtitle={p.categoryLabel} back="/hizmetler" />
      <div className="px-5 pb-32 pt-5">
        {/* Profil başlığı */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-xl font-bold text-primary-foreground">
            {p.photo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-semibold">{p.name}</p>
              {p.verified && (
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {p.categoryLabel}
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600">
                <Star className="h-3 w-3 fill-current" />
                {p.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                {p.reviewCount} değerlendirme
              </span>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Tamamlanan" value={p.completedJobs.toLocaleString("tr")} />
          <Stat label="Yanıt Süresi" value={p.responseTime} />
          <Stat label="Fiyat" value={p.priceRange} />
        </div>

        {/* Açıklama */}
        <section className="mt-5 rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Hakkında
          </h3>
          <p className="text-sm leading-relaxed">{p.description}</p>
        </section>

        {/* Özellikler */}
        <section className="mt-3 rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Özellikler
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {p.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* Ek bilgi */}
        <section className="mt-3 space-y-2">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Hizmet Bölgesi
              </p>
              <p className="text-sm">{p.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Ortalama Yanıt
              </p>
              <p className="text-sm">{p.responseTime}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed inset-x-0 z-30 px-5"
        style={{
          bottom: "calc(76px + env(safe-area-inset-bottom, 0px) + 10px)",
        }}
      >
        <div className="mx-auto flex max-w-[600px] gap-2">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Teklif Al
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold shadow-lg transition hover:bg-muted"
          >
            <Phone className="h-4 w-4" />
            Ara
          </button>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
