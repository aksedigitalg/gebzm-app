"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Megaphone,
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  Plus,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/panel/StatCard";
import { LineChart } from "@/components/panel/SimpleChart";
import {
  demoCampaigns,
  campaignTotals,
  computeCTR,
  computeCPC,
  computeCPM,
  statusLabels,
  objectiveLabels,
  type Campaign,
} from "@/lib/ads";
import {
  DateRangePicker,
  rangeToDays,
  type DateRange,
} from "@/components/panel/DateRangePicker";
import {
  aggregateByDay,
  generateVisits,
} from "@/lib/analytics";
import { getBusinessSession } from "@/lib/panel-auth";

export default function AdDashboardPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [businessId, setBusinessId] = useState("biz-demo-1");

  useEffect(() => {
    const s = getBusinessSession();
    if (s) setBusinessId(s.id);
  }, []);

  const businessCampaigns = demoCampaigns.filter(
    (c) => c.businessId === businessId
  );
  const activeCampaigns = businessCampaigns.filter((c) => c.status === "active");

  const totals = campaignTotals(businessCampaigns);
  const ctr = computeCTR(totals.impressions, totals.clicks);
  const cpc = computeCPC(totals.spend, totals.clicks);
  const cpm = computeCPM(totals.spend, totals.impressions);

  const days = rangeToDays(range);

  // Sahte gösterim trendi — ziyaret verilerinden x3 oranında scale
  const impressionsEvents = useMemo(
    () => generateVisits(`${businessId}-ads`, days, "restoran"),
    [businessId, days]
  );
  const impressionsDaily = aggregateByDay(
    impressionsEvents,
    Math.min(days, 30)
  ).map((b) => ({ label: b.label, value: b.value * 4 }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reklam Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCampaigns.length} aktif kampanya · Performansınızı izleyin
          </p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker value={range} onChange={setRange} />
          <Link
            href="/isletme/reklam/kampanyalar/yeni"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Yeni Kampanya
          </Link>
        </div>
      </header>

      {/* KPI kartlar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Gösterim"
          value={totals.impressions.toLocaleString("tr")}
          change={`CPM: ${cpm.toFixed(2)}₺`}
          trend="up"
          icon={Eye}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          label="Toplam Tıklama"
          value={totals.clicks.toLocaleString("tr")}
          change={`CTR: %${ctr.toFixed(2)}`}
          trend="up"
          icon={MousePointerClick}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Dönüşüm"
          value={totals.conversions.toLocaleString("tr")}
          change={`Tıklama başı ${cpc.toFixed(2)}₺`}
          trend="up"
          icon={Target}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          label="Toplam Harcama"
          value={`₺${totals.spend.toLocaleString("tr")}`}
          change="Bu ay harcanan"
          trend="neutral"
          icon={DollarSign}
          color="from-rose-500 to-pink-600"
        />
      </div>

      {/* Trend grafiği */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Gösterim Trendi</h3>
            <p className="text-xs text-muted-foreground">
              Seçili dönemde günlük gösterim sayısı
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            +24%
          </span>
        </div>
        <LineChart data={impressionsDaily} />
      </div>

      {/* Aktif kampanyalar + üst performans */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Aktif Kampanyalar</h3>
            <Link
              href="/isletme/reklam/kampanyalar"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Tümü
            </Link>
          </div>
          {activeCampaigns.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-2">
              {activeCampaigns.map((c) => (
                <CampaignRow key={c.id} c={c} />
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Hedef Performansı</h3>
          <div className="space-y-3">
            {Object.entries(
              businessCampaigns.reduce<Record<string, number>>((acc, c) => {
                acc[c.objective] =
                  (acc[c.objective] || 0) + c.metrics.conversions;
                return acc;
              }, {})
            ).map(([obj, count]) => (
              <div key={obj}>
                <div className="flex justify-between text-xs">
                  <span className="font-medium">
                    {objectiveLabels[obj as keyof typeof objectiveLabels]}
                  </span>
                  <span className="font-semibold">{count.toLocaleString("tr")}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{
                      width: `${Math.min((count / 400) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hızlı aksiyonlar */}
      <div className="grid gap-3 sm:grid-cols-3">
        <QuickAction
          href="/isletme/reklam/kampanyalar"
          icon={Megaphone}
          label="Kampanya Yönetimi"
          subtitle="Tüm kampanyalar ve durumları"
        />
        <QuickAction
          href="/isletme/reklam/analitik"
          icon={TrendingUp}
          label="Detaylı Analitik"
          subtitle="Derinlemesine performans raporu"
        />
        <QuickAction
          href="/isletme/reklam/kampanyalar/yeni"
          icon={Plus}
          label="Yeni Kampanya"
          subtitle="Adım adım kampanya oluştur"
        />
      </div>
    </div>
  );
}

function CampaignRow({ c }: { c: Campaign }) {
  const ctr = computeCTR(c.metrics.impressions, c.metrics.clicks);
  return (
    <li className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/isletme/reklam/kampanyalar/${c.id}`}
            className="line-clamp-1 text-sm font-semibold hover:text-primary"
          >
            {c.name}
          </Link>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {objectiveLabels[c.objective]} · {c.budget.amount}₺/
            {c.budget.type === "daily" ? "gün" : "toplam"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            statusLabels[c.status].cls
          }`}
        >
          {statusLabels[c.status].label}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <p className="text-muted-foreground">Gösterim</p>
          <p className="font-semibold">
            {c.metrics.impressions.toLocaleString("tr")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Tıklama</p>
          <p className="font-semibold">
            {c.metrics.clicks.toLocaleString("tr")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">CTR</p>
          <p className="font-semibold text-primary">%{ctr.toFixed(2)}</p>
        </div>
      </div>
    </li>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  subtitle,
}: {
  href: string;
  icon: typeof Megaphone;
  label: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border p-6 text-center">
      <Megaphone className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="mt-2 text-sm font-semibold">Henüz aktif kampanyan yok</p>
      <p className="mt-1 text-xs text-muted-foreground">
        İlk kampanyanı oluştur ve profilini daha görünür yap
      </p>
      <Link
        href="/isletme/reklam/kampanyalar/yeni"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" />
        Yeni Kampanya
      </Link>
    </div>
  );
}
