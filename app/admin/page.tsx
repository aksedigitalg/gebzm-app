"use client";
import { useEffect, useState } from "react";
import { Building2, Users, CalendarCheck, Tag } from "lucide-react";
import { StatCard } from "@/components/panel/StatCard";
import { getAdminSession } from "@/lib/panel-auth";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, businesses: 0, pending: 0, reservations: 0 });
  useEffect(() => {
    const s = getAdminSession();
    if (s?.token) {
      api.admin.getStats(s.token).then(d => setStats(d as typeof stats)).catch(() => {});
    }
  }, []);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform genel bakış</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Kullanıcılar" value={String(stats.users)} change="toplam kayıtlı" trend="up" icon={Users} color="from-blue-500 to-indigo-600" />
        <StatCard label="Aktif İşletme" value={String(stats.businesses)} change="onaylı" trend="up" icon={Building2} color="from-emerald-500 to-teal-600" />
        <StatCard label="Onay Bekleyen" value={String(stats.pending)} change="işletme" trend={stats.pending > 0 ? "up" : "neutral"} icon={Building2} color="from-amber-500 to-orange-600" />
        <StatCard label="Rezervasyon" value={String(stats.reservations)} change="toplam" trend="neutral" icon={CalendarCheck} color="from-rose-500 to-pink-600" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/isletmeler", label: "İşletmeleri Yönet", desc: "Onay, red, düzenleme" },
          { href: "/admin/kullanicilar", label: "Kullanıcılar" , desc: "Kullanıcı listesi ve engelleme" },
          { href: "/admin/ayarlar", label: "SMS & Entegrasyon", desc: "Twilio, Netgsm ayarları" },
        ].map(item => (
          <a key={item.href} href={item.href} className="rounded-2xl border border-border bg-card p-5 transition hover:shadow-md">
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
