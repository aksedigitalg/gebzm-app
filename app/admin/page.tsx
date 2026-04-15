"use client";

import {
  Users,
  Building2,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/panel/StatCard";
import { BarChart, LineChart } from "@/components/panel/SimpleChart";
import { dineInRestaurants } from "@/data/restaurants";
import { foodRestaurants } from "@/data/food";
import { serviceProviders } from "@/data/providers";
import { classifieds } from "@/data/classifieds";
import { jobs } from "@/data/jobs";

const weekData = [
  { label: "Pzt", value: 45 },
  { label: "Sal", value: 62 },
  { label: "Çar", value: 58 },
  { label: "Per", value: 78 },
  { label: "Cum", value: 92 },
  { label: "Cmt", value: 108 },
  { label: "Paz", value: 82 },
];

const categoryData = [
  { label: "Yemek", value: foodRestaurants.length },
  { label: "Restoran", value: dineInRestaurants.length },
  { label: "Hizmet", value: serviceProviders.length },
  { label: "İlan", value: classifieds.length },
  { label: "İş", value: jobs.length },
];

const recentActivity = [
  { id: 1, text: "Yeni işletme başvurusu: Köşeoğlu Kebap", time: "5 dk önce", type: "business" },
  { id: 2, text: "Ahmet Y. kullanıcı hesabını oluşturdu", time: "12 dk önce", type: "user" },
  { id: 3, text: "Yeni ilan: MacBook Air M2 16GB", time: "1 saat önce", type: "listing" },
  { id: 4, text: "Raporlanan içerik: 'Sahte İlan' şikayeti", time: "2 saat önce", type: "report" },
  { id: 5, text: "İş ilanı yayınlandı: Frontend Developer", time: "3 saat önce", type: "job" },
];

export default function AdminDashboard() {
  const totalBusinesses =
    dineInRestaurants.length + foodRestaurants.length + serviceProviders.length;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gebzem platform geneli istatistikleri
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Kullanıcı"
          value="12.480"
          change="+8% bu hafta"
          trend="up"
          icon={Users}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          label="Aktif İşletme"
          value={totalBusinesses}
          change="+3 bu ay"
          trend="up"
          icon={Building2}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Aylık Sipariş"
          value="3.842"
          change="+18% geçen aya göre"
          trend="up"
          icon={ShoppingBag}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          label="Aylık Gelir"
          value="₺184K"
          change="+22%"
          trend="up"
          icon={TrendingUp}
          color="from-rose-500 to-red-600"
        />
      </div>

      {/* Grafikler */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Haftalık Aktivite</h3>
              <p className="text-xs text-muted-foreground">Günlük sipariş sayısı</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              +12%
            </span>
          </div>
          <LineChart data={weekData} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Kategori Dağılımı</h3>
            <p className="text-xs text-muted-foreground">İçerik türüne göre</p>
          </div>
          <BarChart data={categoryData} />
        </div>
      </div>

      {/* Son aktivite + hızlı erişim */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Son Aktiviteler</h3>
            <Link
              href="#"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Tümünü gör
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{a.text}</p>
                  <p className="text-[11px] text-muted-foreground">{a.time}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Hızlı İşlemler</h3>
          <div className="space-y-2">
            <QuickAction href="/admin/isletmeler" label="Onay Bekleyen İşletmeler" count="4" />
            <QuickAction href="/admin/ilanlar" label="Raporlanan İlanlar" count="2" />
            <QuickAction href="/admin/mesajlar" label="Destek Mesajları" count="6" />
            <QuickAction href="/admin/kullanicilar" label="Yeni Kullanıcılar" count="37" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-sm transition hover:bg-muted"
    >
      <span className="font-medium">{label}</span>
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
        {count}
      </span>
    </Link>
  );
}
