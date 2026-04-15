"use client";

import { useState } from "react";
import { Plus, Home, MapPin, Eye, Users, Pencil, Trash2 } from "lucide-react";

type PropertyStatus = "active" | "pending" | "sold";
type PropertyType = "Satılık" | "Kiralık";

interface Property {
  id: string;
  title: string;
  type: PropertyType;
  subType: string;
  price: number;
  rentPerMonth?: boolean;
  area: number; // m²
  rooms: string;
  address: string;
  views: number;
  inquiries: number;
  status: PropertyStatus;
  gradient: string;
  photoCount: number;
}

const initial: Property[] = [
  { id: "e-1", title: "3+1 Daire · Hacı Halil Merkez", type: "Satılık", subType: "Daire", price: 4250000, area: 125, rooms: "3+1", address: "Hacı Halil Mah., Gebze", views: 2480, inquiries: 24, status: "active", gradient: "from-blue-500 to-indigo-700", photoCount: 24 },
  { id: "e-2", title: "2+1 Eşyasız Kiralık", type: "Kiralık", subType: "Daire", price: 18500, rentPerMonth: true, area: 90, rooms: "2+1", address: "İstasyon Mah., Gebze", views: 1520, inquiries: 31, status: "active", gradient: "from-emerald-500 to-teal-700", photoCount: 15 },
  { id: "e-3", title: "Dubleks Villa Ballıkayalar Manzara", type: "Satılık", subType: "Villa", price: 8750000, area: 280, rooms: "4+2", address: "Tavşanlı Mah., Gebze", views: 892, inquiries: 12, status: "active", gradient: "from-amber-500 to-orange-700", photoCount: 32 },
  { id: "e-4", title: "İşyeri Satılık · Güzeller OSB", type: "Satılık", subType: "İşyeri", price: 3200000, area: 150, rooms: "Depo+Ofis", address: "Güzeller OSB, Gebze", views: 412, inquiries: 8, status: "active", gradient: "from-slate-500 to-zinc-700", photoCount: 10 },
  { id: "e-5", title: "1+1 Kiralık Stüdyo", type: "Kiralık", subType: "Daire", price: 12000, rentPerMonth: true, area: 55, rooms: "1+1", address: "Sultan Orhan Mah.", views: 680, inquiries: 15, status: "pending", gradient: "from-rose-500 to-pink-700", photoCount: 8 },
  { id: "e-6", title: "4+1 Satılık Daire (Satıldı)", type: "Satılık", subType: "Daire", price: 5200000, area: 165, rooms: "4+1", address: "Hürriyet Mah.", views: 3210, inquiries: 45, status: "sold", gradient: "from-slate-400 to-slate-600", photoCount: 20 },
];

const statusStyle: Record<PropertyStatus, { label: string; cls: string }> = {
  active: { label: "Yayında", cls: "bg-emerald-500/10 text-emerald-600" },
  pending: { label: "Beklemede", cls: "bg-amber-500/10 text-amber-600" },
  sold: { label: "Satıldı", cls: "bg-slate-500/10 text-slate-600" },
};

export default function Page() {
  const [list] = useState<Property[]>(initial);
  const active = list.filter((p) => p.status === "active").length;
  const totalViews = list.reduce((a, p) => a + p.views, 0);
  const totalInquiries = list.reduce((a, p) => a + p.inquiries, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Emlak İlanları</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active} aktif · {totalViews.toLocaleString("tr")} görüntüleme · {totalInquiries} başvuru
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Yeni İlan Ver
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className={`relative flex h-40 items-end bg-gradient-to-br ${p.gradient} p-4`}>
              <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusStyle[p.status].cls}`}>
                {statusStyle[p.status].label}
              </span>
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                {p.type}
              </span>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                {p.photoCount} foto
              </span>
              <Home className="h-10 w-10 text-white/70" strokeWidth={1.25} />
            </div>
            <div className="p-4">
              <p className="line-clamp-2 text-sm font-semibold">{p.title}</p>
              <p className="mt-1 text-lg font-bold text-primary">
                {p.price.toLocaleString("tr")}₺
                {p.rentPerMonth && <span className="text-xs font-normal text-muted-foreground"> / ay</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span>{p.rooms}</span>
                <span>•</span>
                <span>{p.area} m²</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {p.address}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px]">
                <div className="flex gap-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {p.views.toLocaleString("tr")}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    <Users className="h-3 w-3" />
                    {p.inquiries}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
