"use client";

import { useState } from "react";
import { Plus, Pencil, Package, AlertCircle, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  active: boolean;
}

const initial: Product[] = [
  { id: "u-1", name: "Ayçiçek Yağı", brand: "Ona", category: "Bakliyat & Erzak", price: 185, stock: 48, unit: "5 L", active: true },
  { id: "u-2", name: "Pirinç (Baldo)", brand: "Reis", category: "Bakliyat & Erzak", price: 165, stock: 92, unit: "2 kg", active: true },
  { id: "u-3", name: "Domates", category: "Meyve & Sebze", price: 32, stock: 3, unit: "1 kg", active: true },
  { id: "u-4", name: "Süt", brand: "Pınar", category: "Süt & Kahvaltı", price: 45, stock: 120, unit: "1 L", active: true },
  { id: "u-5", name: "Bebek Bezi", brand: "Prima", category: "Bebek", price: 495, stock: 24, unit: "44'lü", active: true },
  { id: "u-6", name: "Çamaşır Deterjanı", brand: "Ariel", category: "Temizlik", price: 325, stock: 0, unit: "5.2 kg", active: false },
  { id: "u-7", name: "Tam Yağlı Peynir", brand: "Sek", category: "Süt & Kahvaltı", price: 195, stock: 56, unit: "500 g", active: true },
  { id: "u-8", name: "Kola", brand: "Coca-Cola", category: "İçecek", price: 45, stock: 88, unit: "2.5 L", active: true },
];

export default function Page() {
  const [list, setList] = useState<Product[]>(initial);
  const toggle = (id: string) =>
    setList((p) => p.map((i) => (i.id === id ? { ...i, active: !i.active } : i)));

  const lowStock = list.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outOfStock = list.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ürünler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.length} ürün · {lowStock} düşük stok · {outOfStock} tükendi
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Yeni Ürün
        </button>
      </header>

      {(lowStock > 0 || outOfStock > 0) && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">Stok Uyarıları</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {lowStock > 0 && `${lowStock} ürün azalıyor. `}
                {outOfStock > 0 && `${outOfStock} ürün stokta yok.`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Ürün ara..."
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Ürün</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Birim</th>
                <th className="px-4 py-3 font-medium">Fiyat</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
                        <Package className="h-5 w-5" strokeWidth={1.25} />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.brand && <p className="text-[11px] text-muted-foreground">{p.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.unit}</td>
                  <td className="px-4 py-3 font-semibold">{p.price}₺</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock === 0 ? "text-red-600" : p.stock < 10 ? "text-amber-600" : ""}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(p.id)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                        p.active
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-slate-500/10 text-slate-600"
                      }`}
                    >
                      {p.active ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted" aria-label="Düzenle">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
