import { notFound } from "next/navigation";
import { Star, Clock, Bike, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { foodRestaurants } from "@/data/food";

export async function generateStaticParams() {
  return foodRestaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = foodRestaurants.find((x) => x.slug === slug);
  return { title: r?.name ?? "Restoran" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = foodRestaurants.find((x) => x.slug === slug);
  if (!r) notFound();

  // Menüyü kategorilere göre grupla
  const byCategory = r.menu.reduce<Record<string, typeof r.menu>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <>
      <PageHeader title={r.name} subtitle={r.cuisine} back="/yemek" />
      <div className="pb-32">
        {/* Kapak */}
        <div className={`relative h-40 bg-gradient-to-br ${r.coverGradient}`}>
          <div className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {r.rating.toFixed(1)}
            <span className="opacity-80">({r.reviewCount})</span>
          </div>
        </div>

        <div className="px-5 pt-4">
          {/* Bilgi şeridi */}
          <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {r.deliveryTimeMin} dk
            </span>
            <span className="inline-flex items-center gap-1">
              <Bike className="h-3 w-3" />
              {r.deliveryFee}₺ teslimat
            </span>
            <span>Min. sipariş {r.minOrder}₺</span>
          </div>

          {/* Menü */}
          {Object.entries(byCategory).map(([cat, items]) => (
            <section key={cat} className="mb-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {cat}
              </h3>
              <div className="space-y-2">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{it.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {it.description}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-primary">
                        {it.price}₺
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
                      aria-label="Sepete ekle"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Sepet bar (mock) */}
      <div
        className="fixed inset-x-0 z-30 px-5"
        style={{
          bottom: "calc(76px + env(safe-area-inset-bottom, 0px) + 10px)",
        }}
      >
        <button
          type="button"
          className="mx-auto flex w-full max-w-[600px] items-center justify-between rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-2xl transition hover:opacity-90"
        >
          <span className="inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Sepete Git
          </span>
          <span>0 ürün · 0₺</span>
        </button>
      </div>
    </>
  );
}
