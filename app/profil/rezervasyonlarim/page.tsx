"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, AlertCircle, Check, X, List, ChevronLeft, ChevronRight } from "lucide-react";
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
}

const statusStyle: Record<string, { label: string; cls: string; icon: typeof Check }> = {
  bekliyor:   { label: "Onay Bekliyor", cls: "bg-amber-500/10 text-amber-600 border-amber-200", icon: AlertCircle },
  onaylandi:  { label: "Onaylandı",     cls: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: Check },
  reddedildi: { label: "Reddedildi",    cls: "bg-red-500/10 text-red-600 border-red-200", icon: X },
  tamamlandi: { label: "Tamamlandı",    cls: "bg-slate-500/10 text-slate-600 border-slate-200", icon: Check },
};

function fmtDate(d: string) {
  return d ? d.slice(0, 10).split("-").reverse().join(".") : "-";
}

function fmtTime(t: string) {
  return t ? t.slice(0, 5) : "-";
}

function ReservationPopup({ r, onClose }: { r: Reservation; onClose: () => void }) {
  const s = statusStyle[r.status] || statusStyle.bekliyor;
  const Icon = s.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 lg:items-center" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-base font-bold">{r.business_name || "İşletme"}</p>
            <p className="text-xs text-muted-foreground capitalize">{r.type === "randevu" ? "Randevu" : "Rezervasyon"}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className={`mb-4 flex items-center gap-2 rounded-xl border px-3 py-2 ${s.cls}`}>
          <Icon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-semibold">{s.label}</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Tarih: <strong>{fmtDate(r.date)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Saat: <strong>{fmtTime(r.time)}</strong></span>
          </div>
          {r.note && (
            <div className="mt-3 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <span className="font-semibold">Not: </span>{r.note}
            </div>
          )}
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          Kapat
        </button>
      </div>
    </div>
  );
}

function CalendarView({ list, onSelect }: { list: Reservation[]; onSelect: (r: Reservation) => void }) {
  const [offset, setOffset] = useState(0); // ay offseti
  const base = new Date();
  const year = new Date(base.getFullYear(), base.getMonth() + offset).getFullYear();
  const month = new Date(base.getFullYear(), base.getMonth() + offset).getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthName = new Date(year, month).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const todayDate = base.getDate();
  const isCurrentMonth = offset === 0;

  // Rezervasyonları güne göre grupla
  const byDay: Record<number, Reservation[]> = {};
  list.forEach((r) => {
    const d = new Date(r.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(r);
    }
  });

  const cells: (number | null)[] = [...Array(firstDay).fill(null)];
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const days = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {/* Ay navigasyonu */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => setOffset(o => o - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background hover:bg-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold capitalize">{monthName}</p>
        <button onClick={() => setOffset(o => o + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Gün başlıkları */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {days.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-semibold text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Günler */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const isToday = isCurrentMonth && day === todayDate;
          const events = day ? (byDay[day] || []) : [];
          const hasApproved = events.some(e => e.status === "onaylandi");
          const hasPending = events.some(e => e.status === "bekliyor");

          return (
            <div key={i} className="aspect-square">
              {day && (
                <button
                  onClick={() => events.length > 0 && onSelect(events[0])}
                  className={`relative flex h-full w-full flex-col items-center justify-center rounded-xl text-xs font-medium transition ${
                    events.length > 0 ? "hover:bg-primary/10 cursor-pointer" : "cursor-default"
                  } ${isToday ? "bg-primary text-primary-foreground" : ""}`}
                >
                  <span>{day}</span>
                  {events.length > 0 && (
                    <div className="mt-0.5 flex gap-0.5">
                      {hasApproved && <div className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-white" : "bg-emerald-500"}`} />}
                      {hasPending && <div className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-white/70" : "bg-amber-500"}`} />}
                    </div>
                  )}
                  {events.length > 1 && (
                    <span className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${isToday ? "bg-white text-primary" : "bg-primary text-white"}`}>
                      {events.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-500" />Onaylı</span>
        <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-amber-500" />Bekliyor</span>
      </div>
    </div>
  );
}

export default function RezerasyonlarimPage() {
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selected, setSelected] = useState<Reservation | null>(null);

  useEffect(() => {
    api.user.getReservations().then((data) => {
      setList(data as Reservation[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Randevularım" subtitle={`${list.length} kayıt`} back="/profil" />
      <div className="px-5 pb-6 pt-4">
        {/* Toggle */}
        <div className="mb-4 flex rounded-xl border border-border bg-muted/30 p-1">
          <button onClick={() => setView("list")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${view === "list" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
            <List className="h-3.5 w-3.5" />Liste
          </button>
          <button onClick={() => setView("calendar")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${view === "calendar" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
            <Calendar className="h-3.5 w-3.5" />Takvim
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Yükleniyor...</div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-semibold">Henüz randevunuz yok</p>
            <p className="mt-1 text-xs text-muted-foreground">Hizmetler bölümünden randevu alabilirsiniz.</p>
          </div>
        ) : view === "calendar" ? (
          <CalendarView list={list} onSelect={setSelected} />
        ) : (
          <div className="space-y-3">
            {list.map((r) => {
              const s = statusStyle[r.status] || statusStyle.bekliyor;
              const Icon = s.icon;
              return (
                <button key={r.id} onClick={() => setSelected(r)} className="w-full text-left">
                  <div className="rounded-2xl border border-border bg-card p-4 transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{r.business_name || "İşletme"}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{r.type === "randevu" ? "Randevu" : "Rezervasyon"}</p>
                        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{fmtDate(r.date)}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{fmtTime(r.time)}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>
                        <Icon className="h-3 w-3" />{s.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && <ReservationPopup r={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
