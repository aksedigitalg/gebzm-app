"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: string;
  active: boolean;
}

const initial: Service[] = [
  { id: "s-1", name: "İlk Muayene", description: "Detaylı değerlendirme, anamnez, fiziksel muayene", duration: "30 dk", price: 750, category: "Muayene", active: true },
  { id: "s-2", name: "Kontrol Muayenesi", description: "Takip ve kontrol ziyareti", duration: "15 dk", price: 400, category: "Muayene", active: true },
  { id: "s-3", name: "Online Görüşme", description: "Video konferans ile uzaktan danışmanlık", duration: "20 dk", price: 500, category: "Dijital", active: true },
  { id: "s-4", name: "Tahlil Değerlendirme", description: "Kan tahlili sonuçlarının yorumlanması", duration: "15 dk", price: 300, category: "Muayene", active: true },
  { id: "s-5", name: "Reçete Yenileme", description: "Düzenli ilaç reçetesi yenileme", duration: "10 dk", price: 200, category: "Dijital", active: false },
];

export default function Page() {
  const [list, setList] = useState<Service[]>(initial);
  const toggle = (id: string) =>
    setList((p) => p.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  const remove = (id: string) => setList((p) => p.filter((s) => s.id !== id));

  const byCategory = list.reduce<Record<string, Service[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hizmetlerim</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.length} hizmet · {list.filter((s) => s.active).length} aktif
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Yeni Hizmet
        </button>
      </header>

      {Object.entries(byCategory).map(([cat, items]) => (
        <section key={cat} className="rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">{cat}</h3>
            <span className="text-xs text-muted-foreground">{items.length} hizmet</span>
          </header>
          <ul className="divide-y divide-border">
            {items.map((s) => (
              <li key={s.id} className="flex items-start gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{s.name}</p>
                    {!s.active && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600">
                        Pasif
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {s.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {s.duration}
                    </span>
                    <span className="font-bold text-primary">{s.price}₺</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggle(s.id)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                      s.active
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                        : "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20"
                    }`}
                  >
                    {s.active ? "Açık" : "Kapalı"}
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted" aria-label="Düzenle">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
