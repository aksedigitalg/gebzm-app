"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Users, MapPin, Check, X, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

interface Reservation {
  id: string;
  business_name: string;
  business_type: string;
  date: string;
  time: string;
  type: string;
  status: string;
  note: string;
  party_size: number;
  created_at: string;
}

const statusStyle: Record<string, { label: string; cls: string; icon: typeof Check }> = {
  bekliyor: { label: "Onay Bekliyor", cls: "bg-amber-500/10 text-amber-600", icon: AlertCircle },
  onaylandi: { label: "Onaylandı", cls: "bg-emerald-500/10 text-emerald-600", icon: Check },
  reddedildi: { label: "Reddedildi", cls: "bg-red-500/10 text-red-600", icon: X },
  tamamlandi: { label: "Tamamlandı", cls: "bg-slate-500/10 text-slate-600", icon: Check },
  iptal: { label: "İptal Edildi", cls: "bg-red-500/10 text-red-600", icon: X },
};

export default function RezerasyonlarimPage() {
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.user.getReservations().then((data) => {
      setList(data as Reservation[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Rezervasyonlarım" subtitle={`${list.length} rezervasyon`} back="/profil" />
      <div className="px-5 pb-6 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Yükleniyor...</div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Calendar className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-sm font-semibold">Henüz rezervasyonunuz yok</p>
            <p className="mt-1 text-xs text-muted-foreground">Restoran veya hizmet sayfasından rezervasyon yapabilirsiniz.</p>
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
                      <Icon className="h-3 w-3" />
                      {s.label}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Tarih: {r.date ? r.date.slice(0,10).split("-").reverse().join(".") : "-"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Saat: {r.time?.slice(0, 5) || "-"}
                    </span>
                    {r.party_size > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />{r.party_size} kişi
                      </span>
                    )}
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
