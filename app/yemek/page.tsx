import Link from "next/link";
import { Star, Clock, Bike } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { foodRestaurants, foodCategories } from "@/data/food";

export const metadata = { title: "Yemek" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const { k } = await searchParams;
  const active = k ?? "all";
  const list =
    active === "all"
      ? foodRestaurants
      : foodRestaurants.filter((r) => r.tags.includes(active));

  return (
    <>
      <PageHeader
        title="Yemek"
        subtitle={`${list.length} restoran · Gebze'ye teslimat`}
        back="/kategoriler"
      />
      <div className="px-5 pb-6 pt-4">
        {/* Kategori filtreleri */}
        <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-1 no-scrollbar">
          {foodCategories.map((c, i) => {
            const selected = active === c.id;
            const href = c.id === "all" ? "/yemek" : `/yemek?k=${c.id}`;
            return (
              <Link
                key={c.id}
                href={href}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition first:ml-5 last:mr-5 ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                } ${i === 0 ? "ml-5" : ""} ${i === foodCategories.length - 1 ? "mr-5" : ""}`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Restoran listesi */}
        <div className="space-y-3">
          {list.map((r) => (
            <Link
              key={r.slug}
              href={`/yemek/${r.slug}`}
              className="block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
            >
              <div
                className={`h-32 bg-gradient-to-br ${r.coverGradient} relative`}
              >
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {r.rating.toFixed(1)}
                  <span className="opacity-80">({r.reviewCount})</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.cuisine}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {r.deliveryTimeMin} dk
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Bike className="h-3 w-3" />
                    {r.deliveryFee === 0 ? "Ücretsiz teslimat" : `${r.deliveryFee}₺ teslimat`}
                  </span>
                  <span>Min. {r.minOrder}₺</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
