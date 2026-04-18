"use client";

import { useEffect, useState } from "react";
import { CalendarCheck2, MessageSquare, Eye, Building2 } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/panel/StatCard";
import { getBusinessSession, type BusinessSession } from "@/lib/panel-auth";
import { getBusinessType } from "@/lib/business-types";
import { api } from "@/lib/api";

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İyi günler, {session.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{typeConfig.description}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bekleyen" value={String(pendingRes)} change="onay bekliyor" trend="neutral" icon={CalendarCheck2} color="from-emerald-500 to-teal-600" />
        <StatCard label="Toplam Rezervasyon" value={String(reservations.length)} change="tüm zamanlar" trend="neutral" icon={CalendarCheck2} color="from-blue-500 to-indigo-600" />
        <StatCard label="Müşteri Mesajı" value={String(conversations.length)} change="aktif konuşma" trend="neutral" icon={MessageSquare} color="from-amber-500 to-orange-600" />
        <StatCard label="İşletme Türü" value={typeConfig.label} change={session.email} trend="neutral" icon={Building2} color="from-rose-500 to-pink-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Rezervasyonlar */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Son Rezervasyonlar</h3>
            <Link href="/isletme/rezervasyonlar" className="text-[11px] font-medium text-primary hover:underline">Tümü</Link>
          </div>
          {reservations.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Henüz rezervasyon yok.</p>
          ) : (
            <ul className="space-y-2">
              {reservations.slice(0, 5).map((r) => (
                <li key={r.id as string} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold">{(r.user_name as string) || "Misafir"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(r.date as string).toLocaleDateString("tr-TR")} · {(r.time as string)?.slice(0, 5)}
                    </p>
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
          {conversations.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Henüz mesaj yok.</p>
          ) : (
            <ul className="space-y-2">
              {conversations.slice(0, 5).map((c) => (
                <li key={c.id as string} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {((c.user_name as string) || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{(c.user_name as string) || "Kullanıcı"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{(c.last_message as string) || "..."}</p>
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
