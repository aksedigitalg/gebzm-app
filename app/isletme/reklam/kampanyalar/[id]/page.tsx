"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import {
  ChevronLeft,
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  Play,
  Pause,
  Pencil,
  Trash2,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/panel/StatCard";
import { LineChart, BarChart } from "@/components/panel/SimpleChart";
import {
  demoCampaigns,
  computeCTR,
  computeCPC,
  computeCPM,
  statusLabels,
  objectiveLabels,
  placementLabels,
} from "@/lib/ads";
import {
  aggregateByDay,
  aggregateByHour,
  generateVisits,
} from "@/lib/analytics";

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const c = demoCampaigns.find((x) => x.id === params.id);

  const events = useMemo(
    () => generateVisits(`${params.id}-campaign`, 30, "restoran"),
    [params.id]
  );

  if (!c) {
    if (typeof window !== "undefined") router.replace("/isletme/reklam/kampanyalar");
    return null;
  }

  const daily = aggregateByDay(events, 30).map((b) => ({
    label: b.label,
    value: b.value * 5,
  }));
  const hourly = aggregateByHour(events).filter((_, i) => i >= 6 && i <= 23).map((b) => ({
    label: b.label,
    value: b.value * 5,
  }));

  const ctr = computeCTR(c.metrics.impressions, c.metrics.clicks);
  const cpc = computeCPC(c.metrics.spend, c.metrics.clicks);
  const cpm = computeCPM(c.metrics.spend, c.metrics.impressions);
  const convRate = c.metrics.clicks
    ? (c.metrics.conversions / c.metrics.clicks) * 100
    : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start gap-3">
        <Link
          href="/isletme/reklam/kampanyalar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted"
          aria-label="Geri"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{c.name}</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusLabels[c.status].cls}`}
            >
              {statusLabels[c.status].label}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {objectiveLabels[c.objective]} · {c.businessName}
          </p>
        </div>
        <div className="flex gap-2">
          {c.status === "active" ? (
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
              <Pause className="h-3.5 w-3.5" /> Duraklat
            </button>
          ) : (
            c.status === "paused" && (
              <button className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20">
                <Play className="h-3.5 w-3.5" /> Yayınla
              </button>
            )
          )}
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
            <Pencil className="h-3.5 w-3.5" /> Düzenle
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/20">
            <Trash2 className="h-3.5 w-3.5" /> Sil
          </button>
        </div>
      </header>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gösterim"
          value={c.metrics.impressions.toLocaleString("tr")}
          change={`CPM: ${cpm.toFixed(2)}₺`}
          trend="up"
          icon={Eye}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          label="Tıklama"
          value={c.metrics.clicks.toLocaleString("tr")}
          change={`CTR: %${ctr.toFixed(2)}`}
          trend="up"
          icon={MousePointerClick}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Dönüşüm"
          value={c.metrics.conversions.toLocaleString("tr")}
          change={`%${convRate.toFixed(1)} dönüşüm oranı`}
          trend="up"
          icon={Target}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          label="Harcama"
          value={`₺${c.metrics.spend.toLocaleString("tr")}`}
          change={`Tıklama başı ${cpc.toFixed(2)}₺`}
          trend="neutral"
          icon={DollarSign}
          color="from-rose-500 to-pink-600"
        />
      </div>

      {/* Reklam önizleme */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Performans Trendi</h3>
          <LineChart data={daily} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Reklam Önizleme</h3>
          <div
            className={`relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${c.ad.gradient} p-4 text-white shadow-lg`}
          >
            <p className="text-xs font-bold uppercase tracking-wider opacity-90">
              SPONSORLU
            </p>
            <p className="mt-1 text-base font-bold leading-tight">{c.ad.title}</p>
            <p className="mt-1 text-xs opacity-90">{c.ad.description}</p>
            <button className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900">
              {c.ad.cta}
            </button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {c.placements.length} yerleşim alanında gösteriliyor
          </p>
        </div>
      </div>

      {/* Saatlik performans */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Saatlik Gösterim (06:00-23:00)</h3>
        <BarChart data={hourly} />
      </div>

      {/* Detay tabloları */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Hedefleme</h3>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Lokasyon
            </dt>
            <dd className="font-medium">{c.targeting.locations.join(", ")}</dd>

            <dt className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> Yaş
            </dt>
            <dd className="font-medium">
              {c.targeting.ageMin} - {c.targeting.ageMax}
            </dd>

            <dt className="text-xs text-muted-foreground">Cinsiyet</dt>
            <dd className="font-medium">
              {c.targeting.gender === "all"
                ? "Tümü"
                : c.targeting.gender === "male"
                  ? "Erkek"
                  : "Kadın"}
            </dd>

            <dt className="text-xs text-muted-foreground">İlgi Alanları</dt>
            <dd className="font-medium">{c.targeting.interests.join(", ")}</dd>

            <dt className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Takvim
            </dt>
            <dd className="font-medium">
              {c.schedule.startDate} → {c.schedule.endDate}
            </dd>

            <dt className="text-xs text-muted-foreground">Bütçe</dt>
            <dd className="font-medium">
              ₺{c.budget.amount} /{c.budget.type === "daily" ? "gün" : "toplam"}
            </dd>
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Yerleşim Performansı</h3>
          <ul className="space-y-2">
            {c.placements.map((p, i) => {
              const pctShare = 100 / c.placements.length;
              const estImpressions = Math.floor(
                (c.metrics.impressions * pctShare) / 100
              );
              return (
                <li
                  key={p}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {placementLabels[p]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      İyi
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    ~{estImpressions.toLocaleString("tr")} gösterim · %
                    {pctShare.toFixed(0)} pay
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
