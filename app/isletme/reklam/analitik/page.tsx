"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/panel/StatCard";
import { LineChart, BarChart } from "@/components/panel/SimpleChart";
import { HeatmapChart } from "@/components/panel/HeatmapChart";
import {
  DateRangePicker,
  rangeToDays,
  type DateRange,
} from "@/components/panel/DateRangePicker";
import {
  demoCampaigns,
  campaignTotals,
  computeCTR,
  computeCPC,
  computeCPM,
  objectiveLabels,
  placementLabels,
  type Placement,
} from "@/lib/ads";
import {
  aggregateByDay,
  aggregateByHour,
  buildHeatmap,
  generateVisits,
} from "@/lib/analytics";
import { getBusinessSession } from "@/lib/panel-auth";

export default function Page() {
  const [range, setRange] = useState<DateRange>("30d");
  const [businessId, setBusinessId] = useState("biz-demo-1");

  useEffect(() => {
    const s = getBusinessSession();
    if (s) setBusinessId(s.id);
  }, []);

  const days = rangeToDays(range);
  const businessCampaigns = demoCampaigns.filter(
    (c) => c.businessId === businessId
  );
  const totals = campaignTotals(businessCampaigns);
  const ctr = computeCTR(totals.impressions, totals.clicks);
  const cpc = computeCPC(totals.spend, totals.clicks);
  const cpm = computeCPM(totals.spend, totals.impressions);

  const adEvents = useMemo(
    () => generateVisits(`${businessId}-ads-analytics`, days, "restoran"),
    [businessId, days]
  );

  const impressionsDaily = aggregateByDay(adEvents, Math.min(days, 30)).map(
    (b) => ({ label: b.label, value: b.value * 5 })
  );
  const clicksDaily = aggregateByDay(adEvents, Math.min(days, 30)).map((b) => ({
    label: b.label,
    value: Math.floor(b.value * 0.3),
  }));
  const hourly = aggregateByHour(adEvents)
    .filter((_, i) => i >= 6 && i <= 23)
    .map((b) => ({ label: b.label, value: b.value * 4 }));
  const heatmap = buildHeatmap(adEvents).map((row) =>
    row.map((v) => v * 5)
  );

  // Yerleşim bazlı veri (sahte dağılım)
  const placementPerformance: Record<
    Placement,
    { impressions: number; clicks: number }
  > = {
    "home-slider": { impressions: 0, clicks: 0 },
    "category-banner": { impressions: 0, clicks: 0 },
    "search-results": { impressions: 0, clicks: 0 },
    "map-premium": { impressions: 0, clicks: 0 },
    "listing-featured": { impressions: 0, clicks: 0 },
  };
  businessCampaigns.forEach((c) => {
    const share = 1 / c.placements.length;
    c.placements.forEach((p) => {
      placementPerformance[p].impressions += Math.floor(
        c.metrics.impressions * share
      );
      placementPerformance[p].clicks += Math.floor(c.metrics.clicks * share);
    });
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reklam Analitiği</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kampanyalarınızın derinlemesine performans raporu
          </p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gösterim"
          value={totals.impressions.toLocaleString("tr")}
          change={`CPM: ${cpm.toFixed(2)}₺`}
          trend="up"
          icon={Eye}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          label="Tıklama"
          value={totals.clicks.toLocaleString("tr")}
          change={`CTR: %${ctr.toFixed(2)}`}
          trend="up"
          icon={MousePointerClick}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Dönüşüm"
          value={totals.conversions.toLocaleString("tr")}
          change="Aktif kampanyalar"
          trend="up"
          icon={Target}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          label="Harcama"
          value={`₺${totals.spend.toLocaleString("tr")}`}
          change={`Tıklama başı ${cpc.toFixed(2)}₺`}
          trend="neutral"
          icon={DollarSign}
          color="from-rose-500 to-pink-600"
        />
      </div>

      {/* Trendler */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Gösterim Trendi</h3>
          <LineChart data={impressionsDaily} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Tıklama Trendi</h3>
          <LineChart data={clicksDaily} />
        </div>
      </div>

      {/* Saatlik + Heatmap */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Saatlik Dağılım</h3>
          <BarChart data={hourly} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-1 text-sm font-semibold">Yoğunluk Haritası</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Hangi gün/saat en çok gösterim alıyor
          </p>
          <HeatmapChart data={heatmap} />
        </div>
      </div>

      {/* Yerleşim ve hedef dağılımı */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Yerleşim Performansı</h3>
          <ul className="space-y-3">
            {(Object.entries(placementPerformance) as [Placement, typeof placementPerformance["home-slider"]][]).map(
              ([key, perf]) => {
                if (perf.impressions === 0) return null;
                const ctr = computeCTR(perf.impressions, perf.clicks);
                return (
                  <li
                    key={key}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{placementLabels[key]}</span>
                      <span className="text-xs font-semibold text-emerald-600">
                        CTR %{ctr.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>
                        <Eye className="mr-1 inline h-3 w-3" />
                        {perf.impressions.toLocaleString("tr")}
                      </span>
                      <span>
                        <MousePointerClick className="mr-1 inline h-3 w-3" />
                        {perf.clicks.toLocaleString("tr")}
                      </span>
                    </div>
                  </li>
                );
              }
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Hedef Dağılımı</h3>
          <ul className="space-y-2.5">
            {Object.entries(
              businessCampaigns.reduce<Record<string, number>>((acc, c) => {
                acc[c.objective] = (acc[c.objective] || 0) + c.metrics.conversions;
                return acc;
              }, {})
            ).map(([obj, count]) => {
              const total = Object.values(
                businessCampaigns.reduce<Record<string, number>>((acc, c) => {
                  acc[c.objective] =
                    (acc[c.objective] || 0) + c.metrics.conversions;
                  return acc;
                }, {})
              ).reduce((a, b) => a + b, 0) || 1;
              const pct = (count / total) * 100;
              return (
                <li key={obj}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">
                      {objectiveLabels[obj as keyof typeof objectiveLabels]}
                    </span>
                    <span className="font-semibold">
                      {count} dönüşüm · %{pct.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
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
      </div>

      {/* En iyi performans */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">En İyi Performans Gösteren Kampanyalar</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            Top 3
          </span>
        </div>
        <ul className="space-y-2">
          {businessCampaigns
            .sort((a, b) => b.metrics.clicks - a.metrics.clicks)
            .slice(0, 3)
            .map((c, i) => {
              const ctr = computeCTR(c.metrics.impressions, c.metrics.clicks);
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {objectiveLabels[c.objective]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {c.metrics.clicks.toLocaleString("tr")}
                    </p>
                    <p className="text-[11px] text-primary">
                      CTR %{ctr.toFixed(2)}
                    </p>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
