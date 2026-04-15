"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Clock,
  Smartphone,
  TrendingUp,
  MousePointerClick,
  Users,
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
  aggregateByDay,
  aggregateByHour,
  aggregateByMonth,
  aggregateByWeek,
  aggregateBySources,
  aggregateByDevices,
  averageDuration,
  buildHeatmap,
  deviceLabels,
  generateVisits,
  getTopHours,
  sourceLabels,
  totalVisits,
} from "@/lib/analytics";
import { getBusinessSession } from "@/lib/panel-auth";

export default function Page() {
  const [range, setRange] = useState<DateRange>("30d");
  const [businessType, setBusinessType] = useState("restoran");
  const [businessId, setBusinessId] = useState("biz-demo-1");

  useEffect(() => {
    const s = getBusinessSession();
    if (s) {
      setBusinessId(s.id);
      setBusinessType(s.type);
    }
  }, []);

  const days = rangeToDays(range);

  const events = useMemo(
    () => generateVisits(businessId, days, businessType),
    [businessId, days, businessType]
  );

  const total = totalVisits(events);
  const avgDur = averageDuration(events);
  const hourly = aggregateByHour(events);
  const daily = aggregateByDay(events, Math.min(days, 30));
  const weekly = aggregateByWeek(events, 12);
  const monthly = aggregateByMonth(events, 12);
  const heatmap = buildHeatmap(events);
  const sources = aggregateBySources(events);
  const devices = aggregateByDevices(events);
  const topHours = getTopHours(events, 5);

  const sourceTotal = Object.values(sources).reduce((a, b) => a + b, 0) || 1;
  const deviceTotal = Object.values(devices).reduce((a, b) => a + b, 0) || 1;

  const dayAverage = Math.round(total / Math.max(days, 1));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">İstatistikler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ziyaret analizi, yoğunluk haritası, kaynak dağılımı
          </p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Ziyaret"
          value={total.toLocaleString("tr")}
          change={`Günlük ortalama ${dayAverage}`}
          trend="up"
          icon={Eye}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          label="Ortalama Süre"
          value={`${avgDur}s`}
          change="Profil görüntüleme"
          trend="neutral"
          icon={Clock}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Tıklama Oranı"
          value="%12.4"
          change="Aksiyon alan kullanıcı"
          trend="up"
          icon={MousePointerClick}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          label="Tekil Kullanıcı"
          value={Math.floor(total * 0.67).toLocaleString("tr")}
          change="%67 tekil oranı"
          trend="up"
          icon={Users}
          color="from-rose-500 to-pink-600"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Ziyaretçi Trendi</h3>
            <p className="text-xs text-muted-foreground">
              Seçili dönem günlük ziyaret dağılımı
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            Büyüyor
          </span>
        </div>
        <LineChart data={daily} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Haftalık (Son 12 Hafta)</h3>
          <BarChart data={weekly} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Aylık (Son 12 Ay)</h3>
          <BarChart data={monthly} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Saatlik Dağılım</h3>
          <BarChart data={hourly.filter((_, i) => i >= 6 && i <= 23)} />
          <p className="mt-3 text-[11px] text-muted-foreground">
            06:00 - 23:00 arası gösteriliyor
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-1 text-sm font-semibold">En Yoğun Saatler</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Top 5 — reklam için ideal saatler
          </p>
          <ol className="space-y-2">
            {topHours.map((h, i) => {
              const maxCount = topHours[0]?.count || 1;
              const pct = (h.count / maxCount) * 100;
              return (
                <li key={h.hour} className="flex items-center gap-3 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="w-14 shrink-0 font-semibold">
                    {h.hour.toString().padStart(2, "0")}:00
                  </span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                    {h.count}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3">
          <h3 className="text-sm font-semibold">Yoğunluk Haritası</h3>
          <p className="text-xs text-muted-foreground">
            7 gün × 24 saat — hangi gün/saat en yoğun
          </p>
        </div>
        <HeatmapChart data={heatmap} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Ziyaret Kaynakları</h3>
          <ul className="space-y-2.5">
            {Object.entries(sources).map(([key, count]) => {
              const pct = (count / sourceTotal) * 100;
              return (
                <li key={key}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">
                      {sourceLabels[key as keyof typeof sourceLabels]}
                    </span>
                    <span className="font-semibold">
                      %{pct.toFixed(1)} · {count.toLocaleString("tr")}
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

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Smartphone className="h-4 w-4 text-primary" />
            Cihaz Dağılımı
          </h3>
          <ul className="space-y-3">
            {Object.entries(devices).map(([key, count]) => {
              const pct = (count / deviceTotal) * 100;
              const colors: Record<string, string> = {
                mobile: "from-blue-500 to-indigo-600",
                desktop: "from-amber-500 to-orange-600",
                pwa: "from-emerald-500 to-teal-600",
              };
              return (
                <li
                  key={key}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {deviceLabels[key as keyof typeof deviceLabels]}
                    </span>
                    <span className="text-sm font-bold">%{pct.toFixed(1)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[key]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {count.toLocaleString("tr")} ziyaret
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
