"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { homeCategories } from "@/data/home-sections";

const hints: Record<string, string> = {
  "Gebzem AI": "Şehir asistanına sor",
  "Yemek": "Teslimat yapan restoranlar",
  "Restoran": "Yerinde yemek mekanları",
  "Market": "Gıda, temizlik, bebek ürünleri",
  "Alışveriş": "Elektronik, giyim, ev & yaşam",
  "İlanlar": "Emlak, vasıta, eşya",
  "Hizmetler": "Ustalar, doktorlar, kuaförler",
  "Etkinlik": "Yaklaşan etkinlikler",
  "İş Başvurusu": "İş ilanları",
};

function categoryHint(label: string) {
  return hints[label] ?? "";
}

export default function KategorilerPage() {
  return (
    <>
      <PageHeader title="Kategoriler" subtitle="Tüm kategoriler tek yerde" />
      <div className="px-5 pb-6 pt-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {homeCategories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                href={c.href}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition group-hover:from-primary/25 group-hover:to-secondary/25">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {categoryHint(c.label)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
