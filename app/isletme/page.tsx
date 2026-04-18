"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  CalendarCheck2,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  ShoppingCart,
  Users,
  Package,
  Home,
  Car,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/panel/StatCard";
import { LineChart, BarChart } from "@/components/panel/SimpleChart";
import { getBusinessSession, type BusinessSession } from "@/lib/panel-auth";
import { getBusinessType } from "@/lib/business-types";
import { api } from "@/lib/api";

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

interface DashboardConfig {
  greeting: string;
  stats: {
    label: string;
    value: string;
    change: string;
    trend: "up" | "down" | "neutral";
    icon: typeof Eye;
    color: string;
  }[];
  primaryListTitle: string;
  primaryListLink: string;
}

function getDashboardConfig(typeId: string): DashboardConfig {
  switch (typeId) {
    case "doktor":
      return {
        greeting: "Bugün takviminizde",
        stats: [
          { label: "Bugünkü Randevu", value: "8", change: "2 onay bekliyor", trend: "neutral", icon: CalendarCheck2, color: "from-cyan-500 to-blue-600" },
          { label: "Hasta Sayısı", value: "148", change: "+6 bu hafta", trend: "up", icon: Users, color: "from-emerald-500 to-teal-600" },
          { label: "Yeni Mesaj", value: "5", change: "4 yanıtlanmadı", trend: "neutral", icon: MessageSquare, color: "from-amber-500 to-orange-600" },
          { label: "Aylık Gelir", value: "₺48.4K", change: "+12%", trend: "up", icon: DollarSign, color: "from-rose-500 to-pink-600" },
        ],
        primaryListTitle: "Yaklaşan Randevular",
        primaryListLink: "/isletme/randevular",
      };

    case "kuafor":
      return {
        greeting: "İyi günler",
        stats: [
          { label: "Bugünkü Randevu", value: "6", change: "3 hizmet kalıyor", trend: "neutral", icon: CalendarCheck2, color: "from-pink-500 to-fuchsia-600" },
          { label: "Hizmet Sayısı", value: "12", change: "9 aktif", trend: "neutral", icon: Star, color: "from-emerald-500 to-teal-600" },
          { label: "Yeni Mesaj", value: "5", change: "2 randevu talebi", trend: "neutral", icon: MessageSquare, color: "from-amber-500 to-orange-600" },
          { label: "Aylık Gelir", value: "₺24.8K", change: "+18%", trend: "up", icon: DollarSign, color: "from-rose-500 to-pink-600" },
        ],
        primaryListTitle: "Yaklaşan Randevular",
        primaryListLink: "/isletme/randevular",
      };

    case "usta":
      return {
        greeting: "Merhaba usta",
        stats: [
          { label: "Yeni Talep", value: "4", change: "2 teklif bekliyor", trend: "neutral", icon: Clock, color: "from-amber-500 to-orange-700" },
          { label: "Aktif İş", value: "3", change: "Yarın 1 tamamlama", trend: "neutral", icon: CalendarCheck2, color: "from-emerald-500 to-teal-600" },
          { label: "Tamamlanan", value: "142", change: "Bu ay 18 iş", trend: "up", icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
          { label: "Aylık Gelir", value: "₺32.1K", change: "+22%", trend: "up", icon: DollarSign, color: "from-rose-500 to-pink-600" },
        ],
        primaryListTitle: "Yeni Hizmet Talepleri",
        primaryListLink: "/isletme/talepler",
      };

    case "market":
    case "magaza":
      return {
        greeting: "Bugün satışlar",
        stats: [
          { label: "Bugünkü Sipariş", value: "47", change: "12 hazırlanıyor", trend: "neutral", icon: ShoppingCart, color: "from-emerald-500 to-teal-600" },
          { label: "Stok Uyarısı", value: "8", change: "2 tükendi", trend: "down", icon: Package, color: "from-amber-500 to-orange-600" },
          { label: "Aktif Kampanya", value: "3", change: "494 kullanım", trend: "up", icon: TrendingUp, color: "from-rose-500 to-pink-600" },
          { label: "Günlük Gelir", value: "₺12.4K", change: "+28%", trend: "up", icon: DollarSign, color: "from-blue-500 to-indigo-600" },
        ],
        primaryListTitle: "Yeni Siparişler",
        primaryListLink: "/isletme/siparisler",
      };

    case "emlakci":
      return {
        greeting: "Merhaba",
        stats: [
          { label: "Aktif İlan", value: "28", change: "3 bu hafta eklendi", trend: "up", icon: Home, color: "from-blue-500 to-indigo-600" },
          { label: "Bu Ay Satış/Kira", value: "12", change: "+4 geçen aya göre", trend: "up", icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
          { label: "Gelen Başvuru", value: "45", change: "31 yanıtlandı", trend: "neutral", icon: Users, color: "from-amber-500 to-orange-600" },
          { label: "Aylık Komisyon", value: "₺184K", change: "+22%", trend: "up", icon: DollarSign, color: "from-rose-500 to-pink-600" },
        ],
        primaryListTitle: "Son Eklenen İlanlar",
        primaryListLink: "/isletme/emlak-ilanlari",
      };

    case "galerici":
      return {
        greeting: "Merhaba galerici",
        stats: [
          { label: "Stoktaki Araç", value: "18", change: "2 rezerve", trend: "neutral", icon: Car, color: "from-slate-600 to-zinc-700" },
          { label: "Bu Ay Satılan", value: "4", change: "Hedef: 6", trend: "up", icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
          { label: "Başvuru", value: "62", change: "12 test sürüşü", trend: "up", icon: Users, color: "from-amber-500 to-orange-600" },
          { label: "Aylık Gelir", value: "₺285K", change: "+15%", trend: "up", icon: DollarSign, color: "from-rose-500 to-pink-600" },
        ],
        primaryListTitle: "Son Eklenen Araçlar",
        primaryListLink: "/isletme/vasita-ilanlari",
      };

    default:
      // restoran, yemek, kafe
      return {
        greeting: "İyi günler",
        stats: [
          { label: "Bugünkü Ziyaret", value: "285", change: "+12% dün", trend: "up", icon: Eye, color: "from-blue-500 to-indigo-600" },
          { label: "Rezervasyon", value: "3", change: "bugün", trend: "neutral", icon: CalendarCheck2, color: "from-emerald-500 to-teal-600" },
          { label: "Yeni Mesaj", value: "5", change: "4 yanıtlanmadı", trend: "neutral", icon: MessageSquare, color: "from-amber-500 to-orange-600" },
          { label: "Aylık Gelir", value: "₺18.4K", change: "+9%", trend: "up", icon: DollarSign, color: "from-rose-500 to-pink-600" },
        ],
        primaryListTitle: "Yaklaşan Rezervasyonlar",
        primaryListLink: "/isletme/rezervasyonlar",
      };
  }
}

export default function BusinessDashboard() {
  const [session, setSession] = useState<BusinessSession | null>(null);
  const [reservations, setReservations] = useState<Record<string, unknown>[]>([]);
  const [conversations, setConversations] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const s = getBusinessSession();
    setSession(s);
    if (s?.token) {
      api.business.getReservations().then((d) => setReservations(d as Record<string, unknown>[])).catch(() => {});
      api.business.getConversations().then((d) => setConversations(d as Record<string, unknown>[])).catch(() => {});
    }
  }, []);

  if (!session) return null;

  const typeConfig = getBusinessType(session.type);
  const pendingRes = reservations.filter((r) => r.status === "bekliyor").length;
  const unreadMsgs = conversations.length;

  const statCards = [
    { label: "Bekleyen Rezervasyon", value: String(pendingRes), change: "onay bekliyor", trend: "neutral" as const, icon: CalendarCheck2, color: "from-emerald-500 to-teal-600" },
    { label: "Toplam Rezervasyon", value: String(reservations.length), change: "tüm zamanlar", trend: "neutral" as const, icon: CalendarCheck2, color: "from-blue-500 to-indigo-600" },
    { label: "Müşteri Mesajı", value: String(unreadMsgs), change: "aktif konuşma", trend: "neutral" as const, icon: MessageSquare, color: "from-amber-500 to-orange-600" },
    { label: "Profil", value: session.name.slice(0, 12), change: typeConfig.label, trend: "neutral" as const, icon: Eye, color: "from-rose-500 to-pink-600" },
  ];

  const recentRes = reservations.slice(0, 4);
  const recentConvs = conversations.slice(0, 4);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İyi günler, {session.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{typeConfig.description}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} change={s.change} trend={s.trend} icon={s.icon} color={s.color} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Rezervasyonlar */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Son Rezervasyonlar</h3>
            <Link href="/isletme/rezervasyonlar" className="text-[11px] font-medium text-primary hover:underline">Tümü</Link>
          </div>
          {recentRes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz rezervasyon yok.</p>
          ) : (
            <ul className="space-y-2">
              {recentRes.map((r) => (
                <li key={r.id as string} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold">{r.user_name as string || "Misafir"}</p>
                    <p className="text-[11px] text-muted-foreground">{r.date as string} · {(r.time as string)?.slice(0, 5)}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === "onaylandi" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {r.status === "onaylandi" ? "Onaylı" : "Bekliyor"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mesajlar */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Son Mesajlar</h3>
            <Link href="/isletme/mesajlar" className="text-[11px] font-medium text-primary hover:underline">Tümü</Link>
          </div>
          {recentConvs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz mesaj yok.</p>
          ) : (
            <ul className="space-y-2">
              {recentConvs.map((c) => (
                <li key={c.id as string} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {((c.user_name as string) || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{c.user_name as string || "Kullanıcı"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{c.last_message as string || "..."}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
