"use client";

import { useState } from "react";
import { Check, X, Calendar, Users, Clock, Phone } from "lucide-react";

interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  party: number;
  note?: string;
  status: "pending" | "confirmed" | "rejected" | "completed";
}

const initial: Reservation[] = [
  { id: "r-1", name: "Ahmet Yılmaz", phone: "+90 555 111 22 33", date: "Bugün", time: "20:00", party: 4, note: "Bahçe masası tercih edilir", status: "confirmed" },
  { id: "r-2", name: "Elif Kaya", phone: "+90 532 444 55 66", date: "Yarın", time: "19:30", party: 2, status: "pending" },
  { id: "r-3", name: "Mert Demir", phone: "+90 543 777 88 99", date: "Yarın", time: "21:00", party: 6, note: "Doğum günü kutlaması", status: "pending" },
  { id: "r-4", name: "Zeynep Şahin", phone: "+90 505 222 33 44", date: "2 gün sonra", time: "20:30", party: 3, status: "pending" },
  { id: "r-5", name: "Can Aslan", phone: "+90 533 666 77 88", date: "Dün", time: "19:00", party: 5, status: "completed" },
];

const statusStyle: Record<Reservation["status"], { label: string; cls: string }> = {
  pending: { label: "Onay Bekliyor", cls: "bg-amber-500/10 text-amber-600" },
  confirmed: { label: "Onaylandı", cls: "bg-emerald-500/10 text-emerald-600" },
  rejected: { label: "Reddedildi", cls: "bg-red-500/10 text-red-600" },
  completed: { label: "Tamamlandı", cls: "bg-slate-500/10 text-slate-600" },
};

export default function Page() {
  const [list, setList] = useState<Reservation[]>(initial);
  const [filter, setFilter] = useState<"all" | Reservation["status"]>("all");

  const filtered = filter === "all" ? list : list.filter((r) => r.status === filter);

  const update = (id: string, status: Reservation["status"]) =>
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const pendingCount = list.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Rezervasyonlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount} onay bekliyor · Toplam {list.length} rezervasyon
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "completed"] as const).map((f) => {
          const selected = filter === f;
          const labels = {
            all: "Tümü",
            pending: "Onay Bekleyen",
            confirmed: "Onaylı",
            completed: "Tamamlanan",
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {r.date} · {r.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {r.party} kişi
                    </span>
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                      <Phone className="h-3 w-3" />
                      {r.phone}
                    </a>
                  </div>
                  {r.note && (
                    <p className="mt-2 rounded-lg bg-muted px-2.5 py-1.5 text-[11px]">
                      <span className="font-semibold">Not:</span> {r.note}
                    </p>
                  )}
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[r.status].cls}`}>
                {statusStyle[r.status].label}
              </span>
            </div>

            {r.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => update(r.id, "confirmed")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20"
                >
                  <Check className="h-3.5 w-3.5" />
                  Onayla
                </button>
                <button
                  onClick={() => update(r.id, "rejected")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/20"
                >
                  <X className="h-3.5 w-3.5" />
                  Reddet
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
