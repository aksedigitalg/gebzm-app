"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Play, Pause, Copy, Trash2, Search } from "lucide-react";
import {
  demoCampaigns,
  computeCTR,
  statusLabels,
  objectiveLabels,
  type Campaign,
  type CampaignStatus,
} from "@/lib/ads";
import { getBusinessSession } from "@/lib/panel-auth";

export default function Page() {
  const [filter, setFilter] = useState<"all" | CampaignStatus>("all");
  const [businessId, setBusinessId] = useState("biz-demo-1");

  useEffect(() => {
    const s = getBusinessSession();
    if (s) setBusinessId(s.id);
  }, []);

  const list = demoCampaigns.filter((c) => c.businessId === businessId);
  const filtered = filter === "all" ? list : list.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kampanyalar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.filter((c) => c.status === "active").length} aktif ·{" "}
            {list.filter((c) => c.status === "draft").length} taslak
          </p>
        </div>
        <Link
          href="/isletme/reklam/kampanyalar/yeni"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni Kampanya
        </Link>
      </header>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "active", "paused", "draft", "completed"] as const).map((f) => {
          const labels = {
            all: "Tümü",
            active: "Yayında",
            paused: "Duraklatılan",
            draft: "Taslaklar",
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
        <div className="relative ml-auto max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kampanya ara..."
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Kampanya</th>
                <th className="px-4 py-3 font-medium">Hedef</th>
                <th className="px-4 py-3 font-medium">Bütçe</th>
                <th className="px-4 py-3 font-medium text-right">Gösterim</th>
                <th className="px-4 py-3 font-medium text-right">Tıklama</th>
                <th className="px-4 py-3 font-medium text-right">CTR</th>
                <th className="px-4 py-3 font-medium text-right">Harcama</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <Row key={c.id} c={c} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Bu filtreye uygun kampanya yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ c }: { c: Campaign }) {
  const ctr = computeCTR(c.metrics.impressions, c.metrics.clicks);
  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3">
        <Link
          href={`/isletme/reklam/kampanyalar/${c.id}`}
          className="flex items-center gap-3 hover:text-primary"
        >
          <div
            className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${c.ad.gradient}`}
          />
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {c.ad.title}
            </p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {objectiveLabels[c.objective]}
      </td>
      <td className="px-4 py-3 text-xs">
        {c.budget.amount}₺
        <span className="text-muted-foreground">
          /{c.budget.type === "daily" ? "gün" : "toplam"}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-semibold">
        {c.metrics.impressions.toLocaleString("tr")}
      </td>
      <td className="px-4 py-3 text-right font-semibold">
        {c.metrics.clicks.toLocaleString("tr")}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-semibold text-primary">%{ctr.toFixed(2)}</span>
      </td>
      <td className="px-4 py-3 text-right font-semibold">
        ₺{c.metrics.spend.toLocaleString("tr")}
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusLabels[c.status].cls}`}>
          {statusLabels[c.status].label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          {c.status === "active" && (
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted" aria-label="Duraklat">
              <Pause className="h-3.5 w-3.5" />
            </button>
          )}
          {c.status === "paused" && (
            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" aria-label="Başlat">
              <Play className="h-3.5 w-3.5" />
            </button>
          )}
          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted" aria-label="Kopyala">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20" aria-label="Sil">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
