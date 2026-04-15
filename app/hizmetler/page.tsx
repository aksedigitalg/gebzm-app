import Link from "next/link";
import { Star, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { serviceCategories, serviceProviders } from "@/data/providers";

export const metadata = { title: "Hizmetler" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const { k } = await searchParams;
  const active = k ?? null;
  const filtered = active
    ? serviceProviders.filter((p) => p.category === active)
    : serviceProviders;

  return (
    <>
      <PageHeader
        title="Hizmetler"
        subtitle="Güvenilir ustalar ve hizmet sağlayıcıları"
        back="/kategoriler"
      />
      <div className="px-5 pb-6 pt-4">
        {/* Kategori kart grid */}
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Kategoriler
        </h3>
        <div className="-mx-5 mb-6 grid grid-cols-4 gap-2 px-5">
          {serviceCategories.slice(0, 8).map((c) => {
            const Icon = c.icon;
            const selected = active === c.id;
            return (
              <Link
                key={c.id}
                href={selected ? "/hizmetler" : `/hizmetler?k=${c.id}`}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/60"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span className="line-clamp-1 text-[10px] font-medium">
                  {c.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Providers */}
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Hizmet Sağlayıcıları ({filtered.length})
        </h3>
        <div className="space-y-3">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/hizmetler/${p.slug}`}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-md"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-base font-bold text-primary-foreground">
                {p.photo}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{p.name}</p>
                  {p.verified && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      <ShieldCheck className="h-3 w-3" />
                      Onaylı
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {p.categoryLabel} · {p.location}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600">
                    <Star className="h-3 w-3 fill-current" />
                    {p.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    {p.reviewCount} değerlendirme
                  </span>
                  <span className="text-muted-foreground">
                    {p.completedJobs} iş
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-primary">
                  {p.priceRange}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
