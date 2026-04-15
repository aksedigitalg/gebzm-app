import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Package } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  shopCategories,
  shopProducts,
  getCategoryById,
} from "@/data/shopping";

export async function generateStaticParams() {
  return shopCategories.map((c) => ({ kategori: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;
  const c = getCategoryById(kategori);
  return { title: c?.label ?? "Alışveriş" };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ kategori: string }>;
  searchParams: Promise<{ alt?: string }>;
}) {
  const { kategori } = await params;
  const { alt } = await searchParams;
  const c = getCategoryById(kategori);
  if (!c) notFound();

  const activeSub = alt ?? "all";
  const list = shopProducts.filter(
    (p) =>
      p.category === kategori &&
      (activeSub === "all" || p.subCategory === activeSub)
  );

  return (
    <>
      <PageHeader title={c.label} subtitle={`${list.length} ürün`} back="/alisveris" />
      <div className="pb-6">
        {/* Alt kategoriler */}
        <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto scroll-pl-5 scroll-pr-5 px-5 pb-1 no-scrollbar">
          <Link
            href={`/alisveris/${kategori}`}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition first:ml-5 ${
              activeSub === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            Tümü
          </Link>
          {c.subCategories.map((s, i) => (
            <Link
              key={s.id}
              href={`/alisveris/${kategori}?alt=${s.id}`}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                activeSub === s.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              } ${i === c.subCategories.length - 1 ? "mr-5" : ""}`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Bu kategoride ürün bulunamadı.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-5">
            {list.map((p) => (
              <Link
                key={p.id}
                href={`/alisveris/urun/${p.id}`}
                className="overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
              >
                <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${p.gradient}`}>
                  <Package className="h-10 w-10 text-white/70" strokeWidth={1.25} />
                  {p.oldPrice && (
                    <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      %{Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {p.brand}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug">
                    {p.name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{p.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({p.reviewCount})</span>
                  </div>
                  <div className="mt-2">
                    {p.oldPrice && (
                      <p className="text-[10px] text-muted-foreground line-through">
                        {p.oldPrice.toLocaleString("tr")}₺
                      </p>
                    )}
                    <p className="text-sm font-bold text-primary">
                      {p.price.toLocaleString("tr")}₺
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
