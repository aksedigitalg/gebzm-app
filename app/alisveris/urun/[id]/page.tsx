import { notFound } from "next/navigation";
import { Star, Package, ShoppingBag, Heart, Share2, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { shopProducts, getProductById, getCategoryById } from "@/data/shopping";

export async function generateStaticParams() {
  return shopProducts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getProductById(id);
  return { title: p?.name ?? "Ürün" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getProductById(id);
  if (!p) notFound();

  const category = getCategoryById(p.category);
  const backHref = category ? `/alisveris/${p.category}` : "/alisveris";

  return (
    <>
      <PageHeader title={p.brand} subtitle={category?.label} back={backHref} />
      <div className="pb-32">
        <div className={`relative h-64 bg-gradient-to-br ${p.gradient}`}>
          <Package className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-white/50" strokeWidth={1.25} />
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            <button
              type="button"
              aria-label="Favori"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Paylaş"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:bg-white"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {p.brand}
          </p>
          <p className="mt-1 text-lg font-bold leading-tight">{p.name}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
              <Star className="h-3.5 w-3.5 fill-current" />
              {p.rating.toFixed(1)}
            </div>
            <span className="text-xs text-muted-foreground">
              {p.reviewCount} değerlendirme
            </span>
          </div>

          <div className="mt-4">
            {p.oldPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {p.oldPrice.toLocaleString("tr")}₺
              </p>
            )}
            <p className="text-3xl font-bold text-primary">
              {p.price.toLocaleString("tr")}₺
            </p>
          </div>

          {p.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {p.description}
            </p>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2">
            {p.freeShipping && (
              <Benefit icon={<Truck className="h-4 w-4" />} label="Ücretsiz Kargo" />
            )}
            <Benefit icon={<ShieldCheck className="h-4 w-4" />} label="Orijinal Ürün" />
            <Benefit icon={<RotateCcw className="h-4 w-4" />} label="14 Gün İade" />
          </div>
        </div>
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
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-xl transition hover:opacity-90"
          >
            <ShoppingBag className="h-4 w-4" />
            Sepete Ekle
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-4 text-sm font-semibold shadow-lg transition hover:bg-muted"
          >
            Hemen Al
          </button>
        </div>
      </div>
    </>
  );
}

function Benefit({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-2.5 text-center">
      <div className="text-primary">{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}
