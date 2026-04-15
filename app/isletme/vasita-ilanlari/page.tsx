"use client";

import { Car, Plus, Eye, Users, Pencil, Trash2, Fuel } from "lucide-react";

type VehicleStatus = "active" | "reserved" | "sold";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  km: number;
  fuel: string;
  transmission: "Manuel" | "Otomatik";
  color: string;
  price: number;
  views: number;
  inquiries: number;
  status: VehicleStatus;
  gradient: string;
  photoCount: number;
}

const vehicles: Vehicle[] = [
  { id: "v-1", make: "Ford", model: "Focus 1.5 TDCi Titanium", year: 2019, km: 62000, fuel: "Dizel", transmission: "Otomatik", color: "Metalik Gri", price: 785000, views: 3240, inquiries: 42, status: "active", gradient: "from-slate-500 to-zinc-700", photoCount: 18 },
  { id: "v-2", make: "Volkswagen", model: "Passat 1.6 TDi Comfortline", year: 2018, km: 98000, fuel: "Dizel", transmission: "Otomatik", color: "Beyaz", price: 920000, views: 2180, inquiries: 28, status: "active", gradient: "from-white to-slate-300", photoCount: 22 },
  { id: "v-3", make: "BMW", model: "320d xDrive M Sport", year: 2021, km: 45000, fuel: "Dizel", transmission: "Otomatik", color: "Siyah", price: 2450000, views: 4580, inquiries: 65, status: "active", gradient: "from-slate-800 to-black", photoCount: 28 },
  { id: "v-4", make: "Renault", model: "Megane 1.3 TCe Icon", year: 2020, km: 58000, fuel: "Benzin", transmission: "Otomatik", color: "Lacivert", price: 680000, views: 1890, inquiries: 22, status: "reserved", gradient: "from-indigo-800 to-blue-900", photoCount: 15 },
  { id: "v-5", make: "Toyota", model: "Corolla 1.6 Hybrid Dream", year: 2022, km: 28000, fuel: "Hibrit", transmission: "Otomatik", color: "Gümüş", price: 1280000, views: 5420, inquiries: 78, status: "active", gradient: "from-slate-400 to-gray-500", photoCount: 20 },
  { id: "v-6", make: "Hyundai", model: "i20 1.4 MPi Style", year: 2017, km: 120000, fuel: "Benzin", transmission: "Manuel", color: "Kırmızı", price: 425000, views: 980, inquiries: 15, status: "sold", gradient: "from-red-600 to-rose-800", photoCount: 12 },
];

const statusStyle: Record<VehicleStatus, { label: string; cls: string }> = {
  active: { label: "Satılık", cls: "bg-emerald-500/10 text-emerald-600" },
  reserved: { label: "Rezerve", cls: "bg-amber-500/10 text-amber-600" },
  sold: { label: "Satıldı", cls: "bg-slate-500/10 text-slate-600" },
};

export default function Page() {
  const active = vehicles.filter((v) => v.status === "active").length;
  const totalValue = vehicles.filter((v) => v.status === "active").reduce((a, v) => a + v.price, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vasıta İlanları</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active} satılık · Stok değeri ₺{(totalValue / 1000).toFixed(0)}K
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Yeni İlan
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {vehicles.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${v.gradient}`}>
              <Car className="h-16 w-16 text-white/70" strokeWidth={1.25} />
              <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusStyle[v.status].cls}`}>
                {statusStyle[v.status].label}
              </span>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                {v.photoCount} foto
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold">
                {v.year} {v.make} {v.model}
              </p>
              <p className="mt-1 text-lg font-bold text-primary">
                {v.price.toLocaleString("tr")} ₺
              </p>
              <div className="mt-2 grid grid-cols-2 gap-y-1 text-[11px] text-muted-foreground">
                <span>KM: {v.km.toLocaleString("tr")}</span>
                <span className="inline-flex items-center gap-1">
                  <Fuel className="h-3 w-3" /> {v.fuel}
                </span>
                <span>{v.transmission}</span>
                <span>Renk: {v.color}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px]">
                <div className="flex gap-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {v.views.toLocaleString("tr")}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    <Users className="h-3 w-3" />
                    {v.inquiries}
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
