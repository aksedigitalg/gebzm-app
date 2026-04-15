"use client";

import { LayoutGrid, TrendingUp, Home, DollarSign } from "lucide-react";
import { BarChart } from "@/components/panel/SimpleChart";

const stats = {
  totalProperties: 34,
  activeListings: 28,
  soldThisMonth: 5,
  rentedThisMonth: 7,
  monthlyIncome: 184500,
  averageCommission: 5.2,
};

const categoryBreakdown = [
  { label: "Satılık Daire", value: 18 },
  { label: "Kiralık Daire", value: 12 },
  { label: "Villa", value: 3 },
  { label: "İşyeri", value: 4 },
  { label: "Arsa", value: 2 },
];

const topPerformers = [
  { title: "3+1 Daire · Hacı Halil Merkez", price: "4.250.000 ₺", views: 2480, inquiries: 24 },
  { title: "Dubleks Villa · Ballıkayalar", price: "8.750.000 ₺", views: 892, inquiries: 12 },
  { title: "2+1 Kiralık · İstasyon", price: "18.500 ₺/ay", views: 1520, inquiries: 31 },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Portföy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ofisinizin portföy özeti ve performans analizi
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBox icon={LayoutGrid} label="Toplam Portföy" value={stats.totalProperties} color="from-blue-500 to-indigo-600" />
        <StatBox icon={Home} label="Aktif İlan" value={stats.activeListings} color="from-emerald-500 to-teal-600" />
        <StatBox icon={TrendingUp} label="Bu Ay Satılan" value={stats.soldThisMonth} color="from-amber-500 to-orange-600" />
        <StatBox icon={DollarSign} label="Aylık Gelir" value={`₺${(stats.monthlyIncome / 1000).toFixed(1)}K`} color="from-rose-500 to-pink-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Kategori Dağılımı</h3>
          <BarChart data={categoryBreakdown} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">En İyi Performans Gösteren İlanlar</h3>
          <ul className="space-y-3">
            {topPerformers.map((p, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.title}</p>
                  <p className="text-[11px] text-primary">{p.price}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {p.views.toLocaleString("tr")} görüntüleme · {p.inquiries} başvuru
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Komisyon & Gelir</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Ortalama Komisyon</p>
            <p className="mt-1 text-2xl font-bold">%{stats.averageCommission}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bu Ay Kiraya Verilen</p>
            <p className="mt-1 text-2xl font-bold">{stats.rentedThisMonth}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Toplam Aylık Gelir</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {stats.monthlyIncome.toLocaleString("tr")} ₺
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof LayoutGrid;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
