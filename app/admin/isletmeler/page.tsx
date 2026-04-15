"use client";

import { Search, Filter, Check, X, Eye } from "lucide-react";
import { dineInRestaurants } from "@/data/restaurants";
import { foodRestaurants } from "@/data/food";
import { serviceProviders } from "@/data/providers";

interface Row {
  id: string;
  name: string;
  type: string;
  category: string;
  rating: number;
  reviews: number;
  status: "active" | "pending" | "suspended";
}

const pendingBusinesses: Row[] = [
  { id: "pb-1", name: "Yeni Lezzet Pide", type: "Yemek", category: "Pide", rating: 0, reviews: 0, status: "pending" },
  { id: "pb-2", name: "Aile Kahvaltı Salonu", type: "Restoran", category: "Kahvaltı", rating: 0, reviews: 0, status: "pending" },
  { id: "pb-3", name: "Hızlı Tesisat Gebze", type: "Hizmet", category: "Tesisatçı", rating: 0, reviews: 0, status: "pending" },
  { id: "pb-4", name: "Elite Güzellik", type: "Hizmet", category: "Kuaför", rating: 0, reviews: 0, status: "pending" },
];

const rows: Row[] = [
  ...pendingBusinesses,
  ...foodRestaurants.map((r) => ({
    id: r.slug,
    name: r.name,
    type: "Yemek",
    category: r.cuisine,
    rating: r.rating,
    reviews: r.reviewCount,
    status: "active" as const,
  })),
  ...dineInRestaurants.map((r) => ({
    id: r.slug,
    name: r.name,
    type: "Restoran",
    category: r.cuisine,
    rating: r.rating,
    reviews: r.reviewCount,
    status: "active" as const,
  })),
  ...serviceProviders.map((p) => ({
    id: p.slug,
    name: p.name,
    type: "Hizmet",
    category: p.categoryLabel,
    rating: p.rating,
    reviews: p.reviewCount,
    status: "active" as const,
  })),
];

const statusStyles: Record<Row["status"], { label: string; class: string }> = {
  active: { label: "Aktif", class: "bg-emerald-500/10 text-emerald-600" },
  pending: { label: "Onay Bekliyor", class: "bg-amber-500/10 text-amber-600" },
  suspended: { label: "Askıda", class: "bg-red-500/10 text-red-600" },
};

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İşletmeler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toplam {rows.length} işletme · {pendingBusinesses.length} onay bekliyor
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="İşletme ara..."
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filtrele
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">İşletme</th>
                <th className="px-4 py-3 font-medium">Tür</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Puan</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground">
                        {r.name.charAt(0)}
                      </div>
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                  <td className="px-4 py-3">
                    {r.rating > 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold">
                        ⭐ {r.rating.toFixed(1)}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({r.reviews})
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Yeni</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[r.status].class}`}
                    >
                      {statusStyles[r.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {r.status === "pending" ? (
                        <>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition hover:bg-emerald-500/20" aria-label="Onayla">
                            <Check className="h-4 w-4" />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 transition hover:bg-red-500/20" aria-label="Reddet">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition hover:bg-muted" aria-label="Görüntüle">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
