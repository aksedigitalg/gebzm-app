"use client";

import { useState } from "react";
import { Check, X, Calendar, Clock, Phone, User } from "lucide-react";

interface Appointment {
  id: string;
  patient: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  note?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

const initial: Appointment[] = [
  { id: "a-1", patient: "Ahmet Yılmaz", phone: "+90 555 111 22 33", service: "İlk Muayene", date: "Bugün", time: "14:00", duration: "30 dk", status: "confirmed" },
  { id: "a-2", patient: "Elif Kaya", phone: "+90 532 444 55 66", service: "Kontrol", date: "Bugün", time: "15:30", duration: "15 dk", note: "Tahlil sonuçları gelecek", status: "confirmed" },
  { id: "a-3", patient: "Mert Demir", phone: "+90 543 777 88 99", service: "İlk Muayene", date: "Yarın", time: "10:00", duration: "30 dk", status: "pending" },
  { id: "a-4", patient: "Zeynep Şahin", phone: "+90 505 222 33 44", service: "Online Görüşme", date: "Yarın", time: "13:00", duration: "20 dk", status: "pending" },
  { id: "a-5", patient: "Can Aslan", phone: "+90 533 666 77 88", service: "Kontrol", date: "2 gün sonra", time: "11:00", duration: "15 dk", status: "pending" },
  { id: "a-6", patient: "Berna Öztürk", phone: "+90 544 999 00 11", service: "İlk Muayene", date: "Dün", time: "10:30", duration: "30 dk", status: "completed" },
];

const statusStyle: Record<Appointment["status"], { label: string; cls: string }> = {
  pending: { label: "Onay Bekliyor", cls: "bg-amber-500/10 text-amber-600" },
  confirmed: { label: "Onaylı", cls: "bg-emerald-500/10 text-emerald-600" },
  completed: { label: "Tamamlandı", cls: "bg-slate-500/10 text-slate-600" },
  cancelled: { label: "İptal Edildi", cls: "bg-red-500/10 text-red-600" },
};

export default function Page() {
  const [list, setList] = useState<Appointment[]>(initial);
  const [filter, setFilter] = useState<"all" | Appointment["status"]>("all");

  const filtered = filter === "all" ? list : list.filter((a) => a.status === filter);
  const update = (id: string, status: Appointment["status"]) =>
    setList((p) => p.map((a) => (a.id === id ? { ...a, status } : a)));

  const pendingCount = list.filter((a) => a.status === "pending").length;
  const todayCount = list.filter((a) => a.date === "Bugün" && a.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Randevular</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingCount} onay bekleyen · Bugün {todayCount} randevu var
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Calendar className="h-4 w-4" />
          Takvim
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "completed"] as const).map((f) => {
          const labels = { all: "Tümü", pending: "Onay Bekleyen", confirmed: "Onaylı", completed: "Tamamlanan" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                  {a.patient.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{a.patient}</p>
                  <p className="mt-0.5 text-[11px] text-primary">{a.service}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {a.date} · {a.time} ({a.duration})
                    </span>
                    <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                      <Phone className="h-3 w-3" />
                      {a.phone}
                    </a>
                  </div>
                  {a.note && (
                    <p className="mt-2 rounded-lg bg-muted px-2.5 py-1.5 text-[11px]">
                      <span className="font-semibold">Not:</span> {a.note}
                    </p>
                  )}
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[a.status].cls}`}>
                {statusStyle[a.status].label}
              </span>
            </div>

            {a.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => update(a.id, "confirmed")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20"
                >
                  <Check className="h-3.5 w-3.5" />
                  Onayla
                </button>
                <button
                  onClick={() => update(a.id, "cancelled")}
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
