"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Megaphone,
  AlertCircle,
  Check,
  X,
  Eye,
} from "lucide-react";
import { StatCard } from "@/components/panel/StatCard";
import { BarChart } from "@/components/panel/SimpleChart";
import {
  demoCampaigns,
  campaignTotals,
  objectiveLabels,
  statusLabels,
  computeCTR,
} from "@/lib/ads";

export default function Page() {
  const [filter, setFilter] = useState<"all" | "pending-review" | "active" | "completed">("all");

  const all = demoCampaigns;
  const totals = campaignTotals(all);
  const activeCount = all.filter((c) => c.status === "active").length;
  const pendingCount = all.filter((c) => c.status === "pending-review").length;

  const filtered =
    filter === "all"
      ? all
      : all.filter((c) => c.status === filter);

  // Demo: Platform geneli aylık gelir
  const monthlyRevenue = [
    { label: "Oca", value: 48000 },
    { label: "Şub", value: 62000 },
    { label: "Mar", value: 84000 },
    { label: "Nis", value: 112000 },
  ];

  // Top spenders
  const topSpenders = [...all]
    .sort((a, b) => b.metrics.spend - a.metrics.spend)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Reklam Yönetimi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform genelindeki tüm reklam kampanyaları · {activeCount} aktif · {pendingCount} inceleme bekliyor
        </p>
      </header>

      {pendingCount > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">
                {pendingCount} kampanya inceleme bekliyor
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Politikalara uygunluk için önce onayınızı gerektiriyor.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Platform Geliri"
          value={`₺${(totals.spend / 1000).toFixed(0)}K`}
          change="+38% bu ay"
          trend="up"
          icon={DollarSign}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Toplam Gösterim"
          value={`${(totals.impressions / 1000).toFixed(1)}K`}
          change="Bu ay"
          trend="up"
          icon={Eye}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          label="Aktif Kampanya"
          value={activeCount}
          change={`${all.length} toplam`}
          trend="neutral"
          icon={Megaphone}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          label="Ortalama CTR"
          value={`%${computeCTR(totals.impressions, totals.clicks).toFixed(2)}`}
          change="Platform geneli"
          trend="up"
          icon={TrendingUp}
          color="from-rose-500 to-pink-600"
        />
      </div>

      {/* Gelir grafiği + Top spender */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Reklam Geliri — Son 4 Ay</h3>
          <BarChart data={monthlyRevenue} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">En Çok Harcayan İşletmeler</h3>
          <ul className="space-y-2">
            {topSpenders.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{c.businessName}</p>
                  <p className="text-[10px] text-muted-foreground">{c.name}</p>
                </div>
                <p className="text-sm font-bold">
                  ₺{c.metrics.spend.toLocaleString("tr")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending-review", "active", "completed"] as const).map((f) => {
          const labels = {
            all: "Tümü",
            "pending-review": "İnceleme Bekliyor",
            active: "Aktif",
            completed: "Tamamlanan",
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Kampanya</th>
                <th className="px-4 py-3 font-medium">İşletme</th>
                <th className="px-4 py-3 font-medium">Hedef</th>
                <th className="px-4 py-3 font-medium">Bütçe</th>
                <th className="px-4 py-3 font-medium text-right">Gösterim</th>
                <th className="px-4 py-3 font-medium text-right">Harcama</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 text-right font-medium">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${c.ad.gradient}`}
                      />
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {c.ad.title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{c.businessName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {objectiveLabels[c.objective]}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {c.budget.amount}₺/
                    {c.budget.type === "daily" ? "gün" : "toplam"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {c.metrics.impressions.toLocaleString("tr")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ₺{c.metrics.spend.toLocaleString("tr")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusLabels[c.status].cls}`}
                    >
                      {statusLabels[c.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {c.status === "pending-review" ? (
                        <>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" aria-label="Onayla">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20" aria-label="Reddet">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted" aria-label="Detay">
                          <Eye className="h-3.5 w-3.5" />
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
