import Link from "next/link";
import { ShoppingBag, Plus, Package, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  marketProducts,
  marketCategories,
  marketCampaigns,
} from "@/data/market";

export const metadata = { title: "Market" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const { k } = await searchParams;
  const active = k ?? "all";
  const products =
    active === "all"
      ? marketProducts
      : marketProducts.filter((p) => p.category === active);

  return (
    <>
      <PageHeader
        title="Market"
        subtitle="Aynı gün teslimat · Gebze içi"
        back="/kategoriler"
      />
      <div className="pb-32">
        {/* Kampanya slider */}
        <div className="-mx-5 mb-5 flex gap-3 overflow-x-auto snap-x scroll-pl-5 scroll-pr-5 px-5 pb-2 no-scrollbar">
          {marketCampaigns.map((c, i) => (
            <div
              key={c.id}
              className={`relative flex w-[80vw] max-w-[360px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${c.gradient} p-5 text-white shadow-lg first:ml-5 last:mr-5`}
              style={{ height: "160px" }}
            >
              {i === 0 && <span className="mb-3 inline-block w-fit rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Bu Hafta</span>}
              <div>
                <p className="text-base font-bold leading-tight">{c.title}</p>
                <p className="mt-1 text-xs opacity-90">{c.subtitle}</p>
              </div>
              <button
                type="button"
                className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white/90"
              >
                {c.cta}
                <ChevronRight className="h-3 w-3" />
              </button>
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
            </div>
          ))}
        </div>

        {/* Kategoriler */}
        <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-1 no-scrollbar">
          {marketCategories.map((c, i) => {
            const selected = active === c.id;
            const href = c.id === "all" ? "/market" : `/market?k=${c.id}`;
            return (
              <Link
                key={c.id}
                href={href}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                } ${i === 0 ? "ml-5" : ""} ${i === marketCategories.length - 1 ? "mr-5" : ""}`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Ürünler grid */}
        <div className="grid grid-cols-2 gap-3 px-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div
                className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${p.gradient}`}
              >
                <Package
                  className="h-10 w-10 text-white/70"
                  strokeWidth={1.25}
                />
                {p.discount && (
                  <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    %{p.discount}
                  </span>
                )}
                {p.tag && !p.discount && (
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="p-3">
                {p.brand && (
                  <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {p.brand}
                  </p>
                )}
                <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug">
                  {p.name}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {p.unit}
                </p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div>
                    {p.oldPrice && (
                      <p className="text-[10px] text-muted-foreground line-through">
                        {p.oldPrice}₺
                      </p>
                    )}
                    <p className="text-sm font-bold text-primary">{p.price}₺</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`${p.name} sepete ekle`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sepet barı */}
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
