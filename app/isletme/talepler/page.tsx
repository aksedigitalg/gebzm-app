"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Check, X, MessageCircle } from "lucide-react";

type RequestStatus = "new" | "quoted" | "accepted" | "in-progress" | "completed" | "rejected";

interface ServiceRequest {
  id: string;
  customer: string;
  phone: string;
  service: string;
  description: string;
  address: string;
  preferredDate: string;
  createdAt: string;
  status: RequestStatus;
  quotedPrice?: number;
}

const initial: ServiceRequest[] = [
  { id: "t-1", customer: "Ahmet Yılmaz", phone: "+90 555 111 22 33", service: "Tıkanıklık Açma", description: "Mutfak lavabosu tıkandı, acil", address: "Hacı Halil Mah. No:15", preferredDate: "Bugün akşam", createdAt: "12 dk önce", status: "new" },
  { id: "t-2", customer: "Elif Kaya", phone: "+90 532 444 55 66", service: "Armatür Değişimi", description: "Banyo musluk değişimi, malzeme bende", address: "İstasyon Mah.", preferredDate: "Yarın öğleden sonra", createdAt: "1 saat önce", status: "quoted", quotedPrice: 450 },
  { id: "t-3", customer: "Mert Demir", phone: "+90 543 777 88 99", service: "Su Kaçağı", description: "Duvardan su sızıyor, bilinmeyen kaynak", address: "Mustafa Paşa Mah.", preferredDate: "Mümkün olan en kısa", createdAt: "3 saat önce", status: "accepted", quotedPrice: 850 },
  { id: "t-4", customer: "Zeynep Şahin", phone: "+90 505 222 33 44", service: "Genel Bakım", description: "Tüm evin tesisat kontrolü", address: "Hürriyet Mah.", preferredDate: "Hafta sonu", createdAt: "Dün", status: "in-progress", quotedPrice: 1200 },
  { id: "t-5", customer: "Can Aslan", phone: "+90 533 666 77 88", service: "Tıkanıklık Açma", description: "Banyo gideri", address: "Sultan Orhan Mah.", preferredDate: "Geçen hafta", createdAt: "1 hafta önce", status: "completed", quotedPrice: 350 },
];

const statusStyle: Record<RequestStatus, { label: string; cls: string }> = {
  new: { label: "Yeni Talep", cls: "bg-amber-500/10 text-amber-600" },
  quoted: { label: "Teklif Verildi", cls: "bg-blue-500/10 text-blue-600" },
  accepted: { label: "Kabul Edildi", cls: "bg-emerald-500/10 text-emerald-600" },
  "in-progress": { label: "Devam Ediyor", cls: "bg-violet-500/10 text-violet-600" },
  completed: { label: "Tamamlandı", cls: "bg-slate-500/10 text-slate-600" },
  rejected: { label: "Reddedildi", cls: "bg-red-500/10 text-red-600" },
};

export default function Page() {
  const [list, setList] = useState<ServiceRequest[]>(initial);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");

  const filtered = filter === "all" ? list : list.filter((r) => r.status === filter);
  const newCount = list.filter((r) => r.status === "new").length;
  const activeCount = list.filter((r) => r.status === "in-progress" || r.status === "accepted").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Hizmet Talepleri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {newCount} yeni talep · {activeCount} aktif iş
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", "new", "quoted", "accepted", "in-progress", "completed"] as const).map((f) => {
          const labels = { all: "Tümü", new: "Yeni", quoted: "Teklif Verildi", accepted: "Kabul Edilen", "in-progress": "Devam Eden", completed: "Tamamlanan" };
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
        {filtered.map((r) => (
          <article key={r.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{r.service}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[r.status].cls}`}>
                    {statusStyle[r.status].label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              </div>
              {r.quotedPrice && (
                <p className="shrink-0 text-sm font-bold text-primary">{r.quotedPrice}₺</p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{r.customer}</span>
              <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                <Phone className="h-3 w-3" />
                {r.phone}
              </a>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {r.address}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Tercih: {r.preferredDate}
              </span>
            </div>

            {r.status === "new" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setList((p) => p.map((x) => (x.id === r.id ? { ...x, status: "quoted", quotedPrice: 500 } : x)))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Teklif Ver
                </button>
                <button
                  onClick={() => setList((p) => p.map((x) => (x.id === r.id ? { ...x, status: "rejected" } : x)))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/20"
                >
                  <X className="h-3.5 w-3.5" />
                  Reddet
                </button>
              </div>
            )}

            {r.status === "accepted" && (
              <button
                onClick={() => setList((p) => p.map((x) => (x.id === r.id ? { ...x, status: "in-progress" } : x)))}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" />
                İşe Başla
              </button>
            )}

            {r.status === "in-progress" && (
              <button
                onClick={() => setList((p) => p.map((x) => (x.id === r.id ? { ...x, status: "completed" } : x)))}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20"
              >
                <Check className="h-3.5 w-3.5" />
                Tamamlandı
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
