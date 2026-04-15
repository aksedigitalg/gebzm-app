"use client";

import { useState } from "react";
import { Plus, Calendar, Percent, TrendingUp, Pencil, Trash2 } from "lucide-react";

type CampaignStatus = "active" | "scheduled" | "ended";

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: "discount" | "bogo" | "free-shipping";
  value: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  gradient: string;
  usedCount: number;
}

const initial: Campaign[] = [
  { id: "c-1", title: "Hafta Sonu %20 İndirim", description: "Tüm temizlik ürünlerinde geçerli", type: "discount", value: "%20", startDate: "Bugün", endDate: "3 gün sonra", status: "active", gradient: "from-rose-500 to-pink-600", usedCount: 124 },
  { id: "c-2", title: "1 Alana 1 Bedava", description: "Seçili içeceklerde", type: "bogo", value: "1+1", startDate: "Dün", endDate: "1 hafta sonra", status: "active", gradient: "from-emerald-500 to-teal-600", usedCount: 58 },
  { id: "c-3", title: "100₺ Üzeri Ücretsiz Teslimat", description: "Gebze içi geçerli", type: "free-shipping", value: "100₺+", startDate: "2 hafta önce", endDate: "2 hafta sonra", status: "active", gradient: "from-blue-500 to-indigo-600", usedCount: 312 },
  { id: "c-4", title: "Ramazan Özel İndirimi", description: "Gıda ürünlerinde %30", type: "discount", value: "%30", startDate: "1 hafta sonra", endDate: "1 ay sonra", status: "scheduled", gradient: "from-amber-500 to-orange-600", usedCount: 0 },
  { id: "c-5", title: "Yılbaşı Kampanyası", description: "Seçili kategorilerde", type: "discount", value: "%40", startDate: "3 ay önce", endDate: "2 ay önce", status: "ended", gradient: "from-violet-500 to-purple-600", usedCount: 892 },
];

const statusStyle: Record<CampaignStatus, { label: string; cls: string }> = {
  active: { label: "Aktif", cls: "bg-emerald-500/10 text-emerald-600" },
  scheduled: { label: "Planlandı", cls: "bg-blue-500/10 text-blue-600" },
  ended: { label: "Bitti", cls: "bg-slate-500/10 text-slate-600" },
};

export default function Page() {
  const [list, setList] = useState<Campaign[]>(initial);
  const active = list.filter((c) => c.status === "active").length;
  const scheduled = list.filter((c) => c.status === "scheduled").length;
  const totalUsed = list.reduce((a, c) => a + c.usedCount, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kampanyalar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active} aktif · {scheduled} planlanan · {totalUsed.toLocaleString("tr")} kullanım
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Yeni Kampanya
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Percent} label="Aktif Kampanya" value={active} color="from-rose-500 to-pink-600" />
        <StatCard icon={TrendingUp} label="Toplam Kullanım" value={totalUsed.toLocaleString("tr")} color="from-emerald-500 to-teal-600" />
        <StatCard icon={Calendar} label="Planlanan" value={scheduled} color="from-blue-500 to-indigo-600" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className={`relative flex h-28 items-end bg-gradient-to-br ${c.gradient} p-4 text-white`}>
              <div>
                <p className="text-3xl font-bold">{c.value}</p>
                <p className="mt-1 text-xs opacity-90">{c.title}</p>
              </div>
              <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusStyle[c.status].cls}`}>
                {statusStyle[c.status].label}
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {c.startDate} → {c.endDate}
                </span>
                <span>•</span>
                <span className="font-semibold text-primary">
                  {c.usedCount.toLocaleString("tr")} kullanım
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted">
                  <Pencil className="h-3 w-3" />
                  Düzenle
                </button>
                <button className="inline-flex items-center justify-center rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/20">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Percent;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
