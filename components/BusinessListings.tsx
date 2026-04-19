"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, MapPin, TrendingUp, CheckCircle, XCircle, Clock, Play, type LucideIcon } from "lucide-react";

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/");
}
import { api } from "@/lib/api";
import { listingCategories } from "@/lib/listing-categories";

interface Listing {
  id: string; title: string; category: string; subcategory: string;
  price: number; price_type: string; location: string; status: string;
  views: number; photos: string[]; created_at: string;
}

const statusConfig: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
  active:   { label: "Aktif",    cls: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  pasif:    { label: "Pasif",    cls: "bg-slate-500/10 text-slate-500",     icon: XCircle },
  satildi:  { label: "Satıldı", cls: "bg-blue-500/10 text-blue-600",       icon: CheckCircle },
  bekliyor: { label: "Bekliyor", cls: "bg-amber-500/10 text-amber-600",     icon: Clock },
};

interface Props {
  title: string;
  emptyText: string;
  emptyBtn: string;
  headerIcon: LucideIcon;
  headerColor: string;
}

export function BusinessListings({ title, emptyText, emptyBtn, headerIcon: HeaderIcon, headerColor }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opMsg, setOpMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.business.getMyListings()
      .then(d => setListings(d as Listing[]))
      .catch(e => setError(e.message || "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const del = async (id: string, ttl: string) => {
    if (!confirm(`"${ttl}" ilanını silmek istediğinizden emin misiniz?`)) return;
    try {
      await api.business.deleteListing(id);
      setListings(p => p.filter(l => l.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Silinemedi");
    }
  };

  const setStatus = async (id: string, newStatus: string) => {
    const prev = listings.find(l => l.id === id)?.status ?? "active";
    setListings(p => p.map(l => l.id === id ? { ...l, status: newStatus } : l));
    try {
      await api.business.updateListingStatus(id, newStatus);
      const labels: Record<string, string> = { active: "Aktif", pasif: "Pasif", satildi: "Satıldı" };
      setOpMsg({ text: `İlan "${labels[newStatus] ?? newStatus}" yapıldı`, ok: true });
      setTimeout(() => setOpMsg(null), 2500);
    } catch (e) {
      setListings(p => p.map(l => l.id === id ? { ...l, status: prev } : l));
      setOpMsg({ text: e instanceof Error ? e.message : "Durum güncellenemedi", ok: false });
      setTimeout(() => setOpMsg(null), 3000);
    }
  };

  const filtered = filter === "all" ? listings : listings.filter(l => l.status === filter);
  const counts = {
    all: listings.length,
    active: listings.filter(l => l.status === "active").length,
    pasif: listings.filter(l => l.status === "pasif").length,
  };
  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
      Yükleniyor...
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold text-red-600">Yüklenemedi</p>
      <p className="mt-1 text-xs text-muted-foreground">{error}</p>
      <button onClick={() => { setError(""); setLoading(true); api.business.getMyListings().then(d => setListings(d as Listing[])).catch(e => setError(e.message)).finally(() => setLoading(false)); }}
        className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
        Tekrar Dene
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* İşlem bildirimi */}
      {opMsg && (
        <div className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all ${opMsg.ok ? "bg-emerald-600" : "bg-red-600"}`}>
          {opMsg.text}
        </div>
      )}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{counts.active} aktif · {totalViews} görüntülenme</p>
        </div>
        <Link href="/isletme/satis-ilanlari/yeni"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />Yeni İlan
        </Link>
      </header>

      {listings.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Toplam İlan", value: counts.all, icon: HeaderIcon, color: headerColor },
            { label: "Aktif", value: counts.active, icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
            { label: "Görüntülenme", value: totalViews, icon: TrendingUp, color: "from-violet-500 to-purple-600" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {[["all","Tümü"], ["active","Aktif"], ["pasif","Pasif"], ["satildi","Satıldı"]].map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
            {label} {f === "all" ? `(${counts.all})` : ""}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <HeaderIcon className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold">{emptyText}</p>
          <Link href="/isletme/satis-ilanlari/yeni"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground">
            <Plus className="h-3.5 w-3.5" />{emptyBtn}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(l => {
            const s = statusConfig[l.status] || statusConfig.bekliyor;
            const Icon = s.icon;
            const cat = listingCategories.find(c => c.id === l.category);
            return (
              <div key={l.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {l.photos?.[0] ? (
                      isVideoUrl(l.photos[0]) ? (
                        <>
                          <video src={l.photos[0]} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="h-5 w-5 text-white" fill="white" />
                          </div>
                        </>
                      ) : (
                        <img src={l.photos[0]} alt="" className="h-full w-full object-cover" />
                      )
                    ) : (
                      <HeaderIcon className="m-auto h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight line-clamp-2">{l.title}</p>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.cls}`}>
                        <Icon className="h-3 w-3" />{s.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{cat?.label || l.category}{l.subcategory ? ` · ${l.subcategory}` : ""}</p>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-bold text-primary">
                        {(l.price || 0).toLocaleString("tr-TR")} ₺
                        {l.price_type !== "sabit" ? ` (${l.price_type === "pazarlik" ? "Pazarlık" : "Takas"})` : ""}
                      </span>
                      {l.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{l.location}</span>}
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{l.views || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                  <Link href={`/ilanlar/${l.id}`} target="_blank"
                    className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                    <Eye className="h-3 w-3" />Görüntüle
                  </Link>
                  <Link href={`/isletme/satis-ilanlari/${l.id}/duzenle`}
                    className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                    <Pencil className="h-3 w-3" />Düzenle
                  </Link>
                  {l.status === "active" && (
                    <button onClick={() => setStatus(l.id, "pasif")}
                      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                      <XCircle className="h-3 w-3" />Pasife Al
                    </button>
                  )}
                  {l.status === "pasif" && (
                    <button onClick={() => setStatus(l.id, "active")}
                      className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20">
                      <CheckCircle className="h-3 w-3" />Aktif Et
                    </button>
                  )}
                  {l.status !== "satildi" && (
                    <button onClick={() => setStatus(l.id, "satildi")}
                      className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-500/20">
                      Satıldı
                    </button>
                  )}
                  <button onClick={() => del(l.id, l.title)}
                    className="ml-auto flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/20">
                    <Trash2 className="h-3 w-3" />Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
