"use client";

import { useEffect, useState } from "react";
import { Check, X, Calendar, Clock, Phone } from "lucide-react";
import { api } from "@/lib/api";

interface Appointment {
  id: string;
  user_name: string;
  user_phone: string;
  date: string;
  time: string;
  note: string;
  status: string;
  type: string;
}

const statusStyle: Record<string, { label: string; cls: string }> = {
  bekliyor: { label: "Onay Bekliyor", cls: "bg-amber-500/10 text-amber-600" },
  onaylandi: { label: "Onaylı", cls: "bg-emerald-500/10 text-emerald-600" },
  reddedildi: { label: "Reddedildi", cls: "bg-red-500/10 text-red-600" },
  tamamlandi: { label: "Tamamlandı", cls: "bg-slate-500/10 text-slate-600" },
};

export default function Page() {
  const [list, setList] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.business.getReservations().then((data) => {
      setList(data as Appointment[]);
      setLoading(false);
    }).catch(() => setLoading(false));
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
      <header>
        <h1 className="text-2xl font-bold">Randevular</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount} onay bekliyor · Toplam {list.length} randevu
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {[["all", "Tümü"], ["bekliyor", "Onay Bekleyen"], ["onaylandi", "Onaylı"], ["tamamlandi", "Tamamlanan"]].map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-sm text-muted-foreground">Bu filtrede randevu yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.user_name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.date} · {r.time}</span>
                      {r.user_phone && (
                        <a href={`tel:${r.user_phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                          <Phone className="h-3 w-3" />{r.user_phone}
                        </a>
                      )}
                    </div>
                    {r.note && <p className="mt-2 rounded-lg bg-muted px-2.5 py-1.5 text-[11px]"><span className="font-semibold">Not:</span> {r.note}</p>}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${(statusStyle[r.status] || statusStyle.bekliyor).cls}`}>
                  {(statusStyle[r.status] || statusStyle.bekliyor).label}
                </span>
              </div>
              {r.status === "bekliyor" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => update(r.id, "onaylandi")} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20">
                    <Check className="h-3.5 w-3.5" />Onayla
                  </button>
                  <button onClick={() => update(r.id, "reddedildi")} className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/20">
                    <X className="h-3.5 w-3.5" />Reddet
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
