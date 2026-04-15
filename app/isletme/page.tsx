"use client";

import {
  Eye,
  CalendarCheck2,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/panel/StatCard";
import { LineChart, BarChart } from "@/components/panel/SimpleChart";

const weekViews = [
  { label: "Pzt", value: 124 },
  { label: "Sal", value: 180 },
  { label: "Çar", value: 165 },
  { label: "Per", value: 220 },
  { label: "Cum", value: 310 },
  { label: "Cmt", value: 420 },
  { label: "Paz", value: 285 },
];

const monthlyRevenue = [
  { label: "Oca", value: 12400 },
  { label: "Şub", value: 14200 },
  { label: "Mar", value: 16800 },
  { label: "Nis", value: 18400 },
];

const upcomingReservations = [
  { id: "r-1", name: "Ahmet Y.", time: "Bugün 20:00", party: 4, status: "confirmed" },
  { id: "r-2", name: "Elif K.", time: "Yarın 19:30", party: 2, status: "pending" },
  { id: "r-3", name: "Mert D.", time: "Yarın 21:00", party: 6, status: "pending" },
];

const recentReviews = [
  { id: "rv-1", name: "Zeynep Ş.", rating: 5, text: "Mangalı mükemmel, servis hızlı!" },
  { id: "rv-2", name: "Can A.", rating: 4, text: "Güzel mekan, biraz kalabalıktı." },
];

export default function BusinessDashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İyi günler, Gebze Mangal Evi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bugün 3 yeni rezervasyon, 5 yeni mesaj
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Bugünkü Ziyaret"
          value="285"
          change="+12% dün"
          trend="up"
          icon={Eye}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          label="Rezervasyon"
          value="3"
          change="bugün"
          trend="neutral"
          icon={CalendarCheck2}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Yeni Mesaj"
          value="5"
          change="4 yanıtlanmadı"
          trend="neutral"
          icon={MessageSquare}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          label="Aylık Gelir"
          value="₺18.4K"
          change="+9%"
          trend="up"
          icon={DollarSign}
          color="from-rose-500 to-pink-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Haftalık Ziyaretçi</h3>
              <p className="text-xs text-muted-foreground">Profil görüntüleme</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              +24%
            </span>
          </div>
          <LineChart data={weekViews} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Aylık Gelir</h3>
            <p className="text-xs text-muted-foreground">Son 4 ay (₺)</p>
          </div>
          <BarChart data={monthlyRevenue} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Yaklaşan rezervasyonlar */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Yaklaşan Rezervasyonlar</h3>
            <Link href="/isletme/rezervasyonlar" className="text-[11px] font-medium text-primary hover:underline">
              Tümü
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {upcomingReservations.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarCheck2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {r.time} · {r.party} kişi
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    r.status === "confirmed"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {r.status === "confirmed" ? "Onaylı" : "Bekliyor"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Son yorumlar */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Son Yorumlar</h3>
            <Link href="/isletme/yorumlar" className="text-[11px] font-medium text-primary hover:underline">
              Tümü
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentReviews.map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
