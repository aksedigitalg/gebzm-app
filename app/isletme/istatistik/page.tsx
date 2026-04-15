"use client";

import { Eye, CalendarCheck2, ShoppingBag, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/panel/StatCard";
import { LineChart, BarChart } from "@/components/panel/SimpleChart";

const monthlyViews = [
  { label: "Hf1", value: 1240 },
  { label: "Hf2", value: 1680 },
  { label: "Hf3", value: 2140 },
  { label: "Hf4", value: 2620 },
];

const monthlyReservations = [
  { label: "Oca", value: 45 },
  { label: "Şub", value: 62 },
  { label: "Mar", value: 78 },
  { label: "Nis", value: 94 },
];

const topItems = [
  { label: "Adana Kebap", value: 184 },
  { label: "Kuzu Şiş", value: 162 },
  { label: "Tavuk Şiş", value: 135 },
  { label: "Karışık Pide", value: 98 },
  { label: "Lahmacun", value: 76 },
];

const visitorSources = [
  { name: "Organik Arama", value: 42, color: "bg-blue-500" },
  { name: "Kategoriler", value: 28, color: "bg-emerald-500" },
  { name: "Harita", value: 18, color: "bg-amber-500" },
  { name: "Arama", value: 8, color: "bg-rose-500" },
  { name: "Direkt", value: 4, color: "bg-violet-500" },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İstatistikler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          İşletme performansınızı detaylı analiz edin
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aylık Ziyaret" value="7.680" change="+32%" trend="up" icon={Eye} color="from-blue-500 to-indigo-600" />
        <StatCard label="Rezervasyon" value="94" change="+18%" trend="up" icon={CalendarCheck2} color="from-emerald-500 to-teal-600" />
        <StatCard label="Tamamlanan" value="86" change="%91 başarı" trend="up" icon={ShoppingBag} color="from-amber-500 to-orange-600" />
        <StatCard label="Aylık Gelir" value="₺18.4K" change="+22%" trend="up" icon={TrendingUp} color="from-rose-500 to-red-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Haftalık Ziyaretçi Trendi</h3>
          <LineChart data={monthlyViews} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Aylık Rezervasyon</h3>
          <BarChart data={monthlyReservations} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">En Çok Satan Ürünler</h3>
          <ul className="space-y-2.5">
            {topItems.map((item, i) => {
              const pct = (item.value / topItems[0].value) * 100;
              return (
                <li key={item.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      {item.label}
                    </span>
                    <span className="font-semibold">{item.value} sipariş</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Ziyaretçi Kaynakları</h3>
          <div className="space-y-3">
            {visitorSources.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-semibold">%{s.value}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${s.color}`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
