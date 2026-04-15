"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

const initial: Item[] = [
  { id: "1", name: "Adana Kebap", description: "El çekimi, közde pişirilmiş", price: 185, category: "Kebaplar", available: true },
  { id: "2", name: "Urfa Kebap", description: "Acısız, közde pişirilmiş", price: 185, category: "Kebaplar", available: true },
  { id: "3", name: "Kuzu Şiş", description: "Marine kuzu kuşbaşı", price: 240, category: "Kebaplar", available: true },
  { id: "4", name: "Tavuk Şiş", description: "Marine tavuk kuşbaşı", price: 160, category: "Kebaplar", available: true },
  { id: "5", name: "Lahmacun", description: "İnce hamur, köy tereyağı", price: 45, category: "Pide & Lahmacun", available: true },
  { id: "6", name: "Karışık Pide", description: "Kaşar, sucuk, mantar", price: 165, category: "Pide & Lahmacun", available: false },
  { id: "7", name: "Künefe", description: "Antep fıstığıyla, sıcak", price: 90, category: "Tatlılar", available: true },
];

export default function Page() {
  const [items, setItems] = useState<Item[]>(initial);
  const toggle = (id: string) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, available: !i.available } : i)));

  const byCategory = items.reduce<Record<string, Item[]>>((acc, i) => {
    (acc[i.category] ??= []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Menü / Ürünler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} ürün · {items.filter((i) => i.available).length} aktif
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Yeni Ürün
        </button>
      </header>

      {Object.entries(byCategory).map(([cat, list]) => (
        <section key={cat} className="rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">{cat}</h3>
            <span className="text-xs text-muted-foreground">{list.length} ürün</span>
          </header>
          <ul className="divide-y divide-border">
            {list.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 to-orange-400">
                  <ImageIcon className="h-7 w-7 text-white/80" strokeWidth={1.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{item.name}</p>
                    {!item.available && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600">
                        Stok Yok
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-1 text-sm font-bold text-primary">
                    {item.price}₺
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggle(item.id)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                      item.available
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                        : "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20"
                    }`}
                  >
                    {item.available ? "Açık" : "Kapalı"}
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition hover:bg-muted" aria-label="Düzenle">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 transition hover:bg-red-500/20" aria-label="Sil">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
