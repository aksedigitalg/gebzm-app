"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, AlertCircle, Check, X, List, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

interface Reservation {
  id: string;
  business_name: string;
  date: string;
  time: string;
  type: string;
  status: string;
  note: string;
  party_size: number;
}

const statusStyle: Record<string, { label: string; cls: string; icon: typeof Check }> = {
  bekliyor:   { label: "Onay Bekliyor", cls: "bg-amber-500/10 text-amber-600", icon: AlertCircle },
  onaylandi:  { label: "Onaylandı",     cls: "bg-emerald-500/10 text-emerald-600", icon: Check },
  reddedildi: { label: "Reddedildi",    cls: "bg-red-500/10 text-red-600", icon: X },
  tamamlandi: { label: "Tamamlandı",    cls: "bg-slate-500/10 text-slate-600", icon: Check },
};

function formatDate(d: string) {
  return d ? d.slice(0,10).split("-").reverse().join(".") : "-";
}

function CalendarView({ list }: { list: Reservation[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  const byDay: Record<number, Reservation[]> = {};
  list.forEach((r) => {
    const d = new Date(r.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(r);
    }
  });

  const days = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];
  const cells: (number | null)[] = [...Array((firstDay + 6) % 7).fill(null)];
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold capitalize">{monthName}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((d) => <div key={d} className="text-[10px] font-semibold text-muted-foreground py-1">{d}</div>)}
        {cells.map((day, i) => {
          const isToday = day === today.getDate();
          const events = day ? byDay[day] : [];
          return (
            <div key={i} className={`flex flex-col items-center rounded-lg p-1 ${isToday ? "bg-primary/10" : ""}`}>
              {day && (
                <>
                  <span className={`text-xs font-medium ${isToday ? "text-primary font-bold" : "text-foreground"}`}>{day}</span>
                  {events.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {events.slice(0, 2).map((e, ei) => (
                        <div key={ei} className={`h-1.5 w-1.5 rounded-full ${e.status === "onaylandi" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RezerasyonlarimPage() {
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    api.user.getReservations().then((data) => {
      setList(data as Reservation[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Randevularım" subtitle={`${list.length} randevu / rezervasyon`} back="/profil" />
      <div className="px-5 pb-6 pt-4">
        {/* Görünüm toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex rounded-xl border border-border bg-muted/30 p-1">
            <button onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === "list" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
              <List className="h-3.5 w-3.5" />Liste
            </button>
            <button onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === "calendar" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
              <LayoutGrid className="h-3.5 w-3.5" />Takvim
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Yükleniyor...</div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Calendar className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-sm font-semibold">Henüz randevunuz yok</p>
            <p className="mt-1 text-xs text-muted-foreground">Hizmetler bölümünden randevu alabilirsiniz.</p>
          </div>
        ) : view === "calendar" ? (
          <div className="space-y-4">
            <CalendarView list={list} />
            {/* Bu ayki randevular */}
            <div className="space-y-2">
              {list.filter((r) => {
                const d = new Date(r.date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).map((r) => {
                const s = statusStyle[r.status] || statusStyle.bekliyor;
                const Icon = s.icon;
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.cls}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{r.business_name || "İşletme"}</p>
                      <p className="text-xs text-muted-foreground">
                        Tarih: {formatDate(r.date)} · Saat: {r.time?.slice(0,5) || "-"}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold ${s.cls} rounded-full px-2.5 py-1`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((r) => {
              const s = statusStyle[r.status] || statusStyle.bekliyor;
              const Icon = s.icon;
              return (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{r.business_name || "İşletme"}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {r.type === "randevu" ? "Randevu" : "Rezervasyon"}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>
                      <Icon className="h-3 w-3" />{s.label}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />Tarih: {formatDate(r.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />Saat: {r.time?.slice(0,5) || "-"}
                    </span>
                  </div>
                  {r.note && (
                    <p className="mt-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
                      <span className="font-medium">Not: </span>{r.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
