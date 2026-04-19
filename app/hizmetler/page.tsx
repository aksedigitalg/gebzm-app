"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  UtensilsCrossed, Utensils, Coffee, Store, ShoppingBag,
  Stethoscope, Scissors, Wrench, Building, Car,
  MapPin, Plus, Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bookingLabel: string }> = {
  restoran: { label: "Restoran", icon: UtensilsCrossed, color: "from-orange-500 to-red-600", bookingLabel: "Rezervasyon Al" },
  yemek:    { label: "Yemek",    icon: Utensils,       color: "from-rose-500 to-orange-500", bookingLabel: "Sipariş Ver" },
  kafe:     { label: "Kafe",     icon: Coffee,          color: "from-amber-500 to-orange-600", bookingLabel: "Rezervasyon Al" },
  market:   { label: "Market",   icon: Store,           color: "from-emerald-500 to-teal-600", bookingLabel: "İletişim" },
  magaza:   { label: "Mağaza",   icon: ShoppingBag,     color: "from-sky-500 to-blue-600", bookingLabel: "İletişim" },
  doktor:   { label: "Doktor",   icon: Stethoscope,     color: "from-cyan-500 to-blue-600", bookingLabel: "Randevu Al" },
  kuafor:   { label: "Kuaför",   icon: Scissors,        color: "from-pink-500 to-fuchsia-600", bookingLabel: "Randevu Al" },
  usta:     { label: "Usta",     icon: Wrench,          color: "from-amber-600 to-orange-700", bookingLabel: "Talep Gönder" },
  emlakci:  { label: "Emlakçı",  icon: Building,        color: "from-blue-600 to-indigo-700", bookingLabel: "İletişim" },
  galerici: { label: "Galerici", icon: Car,             color: "from-slate-600 to-zinc-700", bookingLabel: "İletişim" },
};

const TYPE_ORDER = ["kuafor", "usta", "doktor", "market", "magaza", "restoran", "yemek", "kafe"];

interface Biz {
  id: string; name: string; type: string; phone: string;
  address: string; description: string; logo_url: string;
}

function detailHref(b: Biz) {
  if (b.type === "restoran" || b.type === "kafe" || b.type === "yemek") return `/restoran/${b.id}`;
  return `/hizmetler/${b.id}`;
}

function HizmetlerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTip = searchParams.get("tip") || "";
  const [activeType, setActiveType] = useState(initialTip);
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/businesses`)
      .then(r => r.json())
      .then(data => { setBusinesses(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeType ? businesses.filter(b => b.type === activeType) : businesses;

  const handleType = (t: string) => {
    setActiveType(t);
    const params = new URLSearchParams(searchParams.toString());
    if (t) params.set("tip", t); else params.delete("tip");
    router.replace(`/hizmetler?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <PageHeader title="Hizmetler" subtitle="Kuaför, usta, doktor ve daha fazlası" back="/kategoriler" />
      <div className="px-5 pb-6 pt-4">
        <Link href="/isletme/kayit"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 transition hover:bg-primary/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">İşletmenizi Ekleyin</p>
            <p className="text-xs text-muted-foreground">Gebzem'de yerinizi alın — ücretsiz başvuru</p>
          </div>
        </Link>

        {/* Tip filtresi */}
        <div className="-mx-5 flex gap-2 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-3 no-scrollbar">
          <button
            onClick={() => handleType("")}
            className={`ml-5 shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              activeType === "" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            Tümü
          </button>
          {TYPE_ORDER.map(t => {
            const cfg = TYPE_CONFIG[t];
            return (
              <button
                key={t}
                onClick={() => handleType(t)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition last:mr-5 ${
                  activeType === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wrench className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-semibold">Henüz işletme eklenmemiş</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeType ? `${TYPE_CONFIG[activeType]?.label} kategorisinde` : ""} işletmeler yakında listelenecek.
            </p>
          </div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {filtered.map((p) => {
              const cfg = TYPE_CONFIG[p.type] || { label: p.type, color: "from-slate-500 to-gray-600", icon: Wrench };
              const Icon = cfg.icon;
              return (
                <Link key={p.id} href={detailHref(p)}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-md">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.color} text-white overflow-hidden`}>
                    {p.logo_url
                      ? <img src={p.logo_url} alt={p.name} className="h-full w-full object-cover" />
                      : <Icon className="h-7 w-7" strokeWidth={1.75} />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <span className={`shrink-0 rounded-full bg-gradient-to-br ${cfg.color} px-2 py-0.5 text-[10px] font-bold text-white`}>
                        {cfg.label}
                      </span>
                    </div>
                    {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                    {p.address && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />{p.address}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default function HizmetlerPage() {
  return (
    <Suspense>
      <HizmetlerContent />
    </Suspense>
  );
}
