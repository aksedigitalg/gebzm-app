import Link from "next/link";
import { Star, ChevronRight, Package } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { shopCategories, shopProducts } from "@/data/shopping";

export const metadata = { title: "Alışveriş" };

const campaigns = [
  {
    id: "sh-1",
    title: "Elektronik'te %40 İndirim",
    subtitle: "Telefon, laptop, kulaklık ve daha fazlası",
    gradient: "from-blue-600 to-indigo-800",
    href: "/alisveris/elektronik",
  },
  {
    id: "sh-2",
    title: "Giyim'de Yaz Fırsatları",
    subtitle: "Yeni sezon ürünler, sepette %30 indirim",
    gradient: "from-rose-500 to-pink-700",
    href: "/alisveris/giyim",
  },
  {
    id: "sh-3",
    title: "Ev Dekorasyonu",
    subtitle: "Ev'inizi yenilemenin tam zamanı",
    gradient: "from-emerald-500 to-teal-700",
    href: "/alisveris/ev-yasam",
  },
];

export default function Page() {
  const featured = shopProducts.slice(0, 6);

  return (
    <>
      <PageHeader
        title="Alışveriş"
        subtitle="Milyonlarca ürün, Gebze'ye hızlı teslimat"
        back="/kategoriler"
      />
      <div className="pb-6">
        {/* Hero slider */}
        <div className="-mx-5 flex gap-3 overflow-x-auto snap-x scroll-pl-5 scroll-pr-5 px-5 pb-3 no-scrollbar">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              className={`relative flex h-40 w-[85vw] max-w-[400px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${c.gradient} p-5 text-white shadow-lg first:ml-5 last:mr-5`}
            >
              <p className="text-lg font-bold leading-tight">{c.title}</p>
              <p className="mt-1 text-xs opacity-90">{c.subtitle}</p>
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-4 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            </Link>
          ))}
        </div>

        {/* Kategoriler grid */}
        <section className="px-5 pt-5">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Kategoriler
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {shopCategories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.id}
                  href={`/alisveris/${c.id}`}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-center transition hover:bg-muted/60"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-sm`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="line-clamp-1 text-[10px] font-medium">
                    {c.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Öne çıkan ürünler */}
        <section className="px-5 pt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Öne Çıkan Ürünler
            </h3>
            <Link
              href="/alisveris/elektronik"
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
            >
              Tümü <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/alisveris/urun/${p.id}`}
                className="overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
              >
                <div
                  className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${p.gradient}`}
                >
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
                    <span className="text-muted-foreground">
                      ({p.reviewCount})
                    </span>
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
        </section>
      </div>
    </>
  );
}
