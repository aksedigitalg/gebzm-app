"use client";

import { useEffect, useState } from "react";
import { Check, X, Calendar, Clock, Phone, List, LayoutGrid } from "lucide-react";
import { api } from "@/lib/api";

interface Reservation {
  id: string;
  user_name: string;
  user_phone: string;
  date: string;
  time: string;
  party_size: number;
  note: string;
  status: string;
  type: string;
}

const statusStyle: Record<string, { label: string; cls: string }> = {
  bekliyor:   { label: "Onay Bekliyor", cls: "bg-amber-500/10 text-amber-600" },
  onaylandi:  { label: "Onaylandı",     cls: "bg-emerald-500/10 text-emerald-600" },
  reddedildi: { label: "Reddedildi",    cls: "bg-red-500/10 text-red-600" },
  tamamlandi: { label: "Tamamlandı",    cls: "bg-slate-500/10 text-slate-600" },
};

function formatDate(d: string) {
  return d ? d.slice(0,10).split("-").reverse().join(".") : "-";
}

function CalendarView({ list, onStatusChange }: { list: Reservation[]; onStatusChange: (id: string, s: string) => void }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const monthName = today.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const byDay: Record<number, Reservation[]> = {};
  list.forEach((r) => {
    const d = new Date(r.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(r);
    }
  });

  const days = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
  const cells: (number | null)[] = [...Array(firstDay).fill(null)];
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const selectedReservations = selectedDay ? (byDay[selectedDay] || []) : [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold capitalize">{monthName}</p>
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((d) => <div key={d} className="py-1 text-[10px] font-semibold text-muted-foreground">{d}</div>)}
          {cells.map((day, i) => {
            const isToday = day === today.getDate();
            const isSelected = day === selectedDay;
            const events = day ? (byDay[day] || []) : [];
            const hasPending = events.some(e => e.status === "bekliyor");
            return (
              <button key={i} type="button"
                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                disabled={!day}
                className={`flex flex-col items-center rounded-lg p-1 transition ${
                  isSelected ? "bg-primary text-primary-foreground" :
                  isToday ? "bg-primary/10" : "hover:bg-muted"
                } disabled:cursor-default`}>
                {day && (
                  <>
                    <span className={`text-xs font-medium ${isSelected ? "text-primary-foreground" : isToday ? "text-primary font-bold" : ""}`}>{day}</span>
                    {events.length > 0 && (
                      <div className="mt-0.5 flex gap-0.5">
                        {hasPending && <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-amber-500"}`} />}
                        {events.some(e => e.status === "onaylandi") && <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">{selectedDay} {monthName} randevuları</p>
          {selectedReservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bu gün için randevu yok.</p>
          ) : selectedReservations.map((r) => (
            <ReservationCard key={r.id} r={r} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReservationCard({ r, onStatusChange }: { r: Reservation; onStatusChange: (id: string, s: string) => void }) {
  const s = statusStyle[r.status] || statusStyle.bekliyor;
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{r.user_name || "Müşteri"}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />Tarih: {formatDate(r.date)} · Saat: {r.time?.slice(0,5) || "-"}
            </span>
            {r.user_phone && (
              <a href={`tel:${r.user_phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                <Phone className="h-3 w-3" />{r.user_phone}
              </a>
            )}
          </div>
          {r.note && <p className="mt-2 rounded-lg bg-muted px-2.5 py-1.5 text-[11px]"><span className="font-semibold">Not:</span> {r.note}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
      </div>
      {r.status === "bekliyor" && (
        <div className="mt-3 flex gap-2">
          <button onClick={() => onStatusChange(r.id, "onaylandi")}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20">
            <Check className="h-3.5 w-3.5" />Onayla
          </button>
          <button onClick={() => onStatusChange(r.id, "reddedildi")}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/20">
            <X className="h-3.5 w-3.5" />Reddet
          </button>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [list, setList] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.business.getReservations().then((data) => { setList(data as Reservation[]); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const update = async (id: string, status: string) => {
    try {
      await api.business.updateReservationStatus(id, status);
      setList((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch { alert("Güncelleme başarısız"); }
  };

  const filtered = filter === "all" ? list : list.filter((r) => r.status === filter);
  const pendingCount = list.filter((r) => r.status === "bekliyor").length;

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Randevular</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pendingCount} onay bekliyor · Toplam {list.length}</p>
        </div>
        <div className="flex rounded-xl border border-border bg-muted/30 p-1">
          <button onClick={() => setView("list")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === "list" ? "bg-card shadow" : "text-muted-foreground"}`}>
            <List className="h-3.5 w-3.5" />Liste
          </button>
          <button onClick={() => setView("calendar")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === "calendar" ? "bg-card shadow" : "text-muted-foreground"}`}>
            <LayoutGrid className="h-3.5 w-3.5" />Takvim
          </button>
        </div>
      </header>

      {view === "calendar" ? (
        <CalendarView list={list} onStatusChange={update} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {[["all","Tümü"],["bekliyor","Onay Bekleyen"],["onaylandi","Onaylı"],["tamamlandi","Tamamlanan"]].map(([f,label]) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}>
                {label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
              <p className="mt-3 text-sm text-muted-foreground">Bu filtrede randevu yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => <ReservationCard key={r.id} r={r} onStatusChange={update} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
