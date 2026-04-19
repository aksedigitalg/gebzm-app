"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Clock, Tag, SlidersHorizontal, X, Map, List, Search, RotateCcw, Play } from "lucide-react";
import { listingCategories } from "@/lib/listing-categories";
import { formatTRY, timeAgoTR } from "@/lib/format";

const IlanlarMapDynamic = dynamic(() => import("@/components/IlanlarMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/30">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
});

interface Listing {
  id: string; title: string; price: number; price_type: string;
  location?: string; created_at?: string; photos?: string[];
  listing_type: string; category: string;
}

interface Filters {
  category: string; priceMin: string; priceMax: string;
  listingType: string; priceTypes: string[]; search: string;
}

const EMPTY: Filters = { category: "", priceMin: "", priceMax: "", listingType: "", priceTypes: [], search: "" };

function isActive(f: Filters) {
  return !!(f.category || f.priceMin || f.priceMax || f.listingType || f.priceTypes.length || f.search);
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/");
}

/* ---- Sidebar bileşeni parent dışında tanımlandı (her render'da yeniden mount olmaz) ---- */
interface SidebarProps {
  filters: Filters;
  setF: (k: keyof Filters, v: string | string[]) => void;
  togglePT: (v: string) => void;
  resetFilters: () => void;
}

function SidebarFilters({ filters, setF, togglePT, resetFilters }: SidebarProps) {
  return (
    <div className="space-y-5 text-sm">
      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={filters.search}
          onChange={e => setF("search", e.target.value)}
          placeholder="İlan ara..."
          className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs outline-none focus:border-primary"
        />
      </div>

      {/* Kategori */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kategori</p>
        <div className="space-y-0.5">
          <button onClick={() => setF("category", "")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${!filters.category ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}>
            <Tag className="h-3.5 w-3.5" />Tümü
          </button>
          {listingCategories.map(c => (
            <button key={c.id} onClick={() => setF("category", filters.category === c.id ? "" : c.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${filters.category === c.id ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}>
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Fiyat aralığı */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fiyat Aralığı (₺)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={e => setF("priceMin", e.target.value)}
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
          />
          <span className="shrink-0 text-[10px] text-muted-foreground">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={e => setF("priceMax", e.target.value)}
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      <hr className="border-border" />

      {/* İlan tipi */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">İlan Tipi</p>
        {[["", "Tümü"], ["kurumsal", "Kurumsal (PRO)"], ["bireysel", "Bireysel"]].map(([v, lb]) => (
          <button key={v} onClick={() => setF("listingType", v)}
            className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${filters.listingType === v ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}>
            <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${filters.listingType === v ? "border-primary" : "border-border"}`}>
              {filters.listingType === v && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </span>{lb}
          </button>
        ))}
      </div>

      <hr className="border-border" />

      {/* Fiyat türü */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fiyat Türü</p>
        {[["sabit", "Sabit Fiyat"], ["pazarlik", "Pazarlık Var"], ["takas", "Takas Olur"]].map(([v, lb]) => {
          const on = filters.priceTypes.includes(v);
          return (
            <button key={v} onClick={() => togglePT(v)}
              className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${on ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}>
              <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border-2 transition ${on ? "border-primary bg-primary" : "border-border"}`}>
                {on && <svg className="h-2 w-2 text-white" viewBox="0 0 8 8"><path d="M1.5 4l1.8 2L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </span>{lb}
            </button>
          );
        })}
      </div>

      {isActive(filters) && (
        <>
          <hr className="border-border" />
          <button onClick={resetFilters}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition">
            <RotateCcw className="h-3 w-3" />Filtreleri Sıfırla
          </button>
        </>
      )}
    </div>
  );
}

export function IlanlarClient({ initialListings }: { initialListings: Listing[] }) {
  const [view, setView] = useState<"liste" | "harita">("liste");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [mobileFilter, setMobileFilter] = useState(false);

  const setF = useCallback((k: keyof Filters, v: string | string[]) =>
    setFilters(p => ({ ...p, [k]: v })), []);

  const togglePT = useCallback((v: string) =>
    setFilters(p => ({
      ...p,
      priceTypes: p.priceTypes.includes(v)
        ? p.priceTypes.filter(x => x !== v)
        : [...p.priceTypes, v],
    })), []);

  const resetFilters = useCallback(() => setFilters(EMPTY), []);

  const filtered = useMemo(() => initialListings.filter(l => {
    if (filters.category && l.category !== filters.category) return false;
    if (filters.priceMin && l.price < +filters.priceMin) return false;
    if (filters.priceMax && l.price > +filters.priceMax) return false;
    if (filters.listingType && l.listing_type !== filters.listingType) return false;
    if (filters.priceTypes.length && !filters.priceTypes.includes(l.price_type)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!l.title.toLowerCase().includes(q) && !(l.location || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [initialListings, filters]);

  return (
    <div className="-mx-5 -mb-6 lg:-mx-6 lg:-my-4">
      {/* Üst bilgi çubuğu */}
      <div className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur-sm">
        <p className="text-sm font-semibold text-muted-foreground">
          <span className="font-bold text-foreground">{filtered.length}</span> ilan
          {isActive(filters) && (
            <button onClick={resetFilters}
              className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              <X className="h-2.5 w-2.5" />filtre aktif
            </button>
          )}
        </p>
        <button onClick={() => setMobileFilter(true)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium lg:hidden">
          <SlidersHorizontal className="h-3.5 w-3.5" />Filtrele
        </button>
      </div>

      {/* Grid: sidebar + içerik */}
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-card/50 p-4 lg:block"
          style={{ height: "calc(100dvh - 97px)" }}>
          <SidebarFilters filters={filters} setF={setF} togglePT={togglePT} resetFilters={resetFilters} />
        </aside>

        {/* İçerik */}
        <div className="min-w-0 flex-1" style={{ height: "calc(100dvh - 97px)", overflowY: view === "liste" ? "auto" : "hidden" }}>
          {view === "liste" ? (
            filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <Tag className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="mt-4 text-sm font-semibold">Sonuç bulunamadı</p>
                {isActive(filters) && (
                  <button onClick={resetFilters}
                    className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground">
                    Filtreleri Sıfırla
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 p-4 pb-24 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map(l => {
                  const firstMedia = l.photos?.[0];
                  const isVideo = firstMedia ? isVideoUrl(firstMedia) : false;
                  return (
                    <Link key={l.id} href={`/ilanlar/${l.id}`}
                      className="flex gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/30 hover:shadow-md">
                      <div className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {firstMedia ? (
                          isVideo ? (
                            <>
                              <video src={firstMedia} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Play className="h-6 w-6 text-white" fill="white" />
                              </div>
                            </>
                          ) : (
                            <img src={firstMedia} alt="" className="h-full w-full object-cover" />
                          )
                        ) : (
                          <Tag className="m-auto h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
                        )}
                        {l.listing_type === "kurumsal" && (
                          <span className="absolute bottom-1 left-1 rounded bg-primary/80 px-1 py-0.5 text-[8px] font-bold text-white">PRO</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-tight">{l.title}</p>
                        <p className="mt-1 text-base font-bold text-primary">{formatTRY(l.price)}</p>
                        {l.price_type !== "sabit" && (
                          <span className="text-[10px] text-muted-foreground">
                            {l.price_type === "pazarlik" ? "Pazarlık Var" : "Takas Olur"}
                          </span>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                          {l.location && (
                            <span className="flex items-center gap-0.5 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />{l.location}
                            </span>
                          )}
                          {l.created_at && (
                            <span className="flex items-center gap-0.5 whitespace-nowrap">
                              <Clock className="h-3 w-3" />{timeAgoTR(l.created_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          ) : (
            <div className="h-full w-full">
              <IlanlarMapDynamic listings={filtered} />
            </div>
          )}
        </div>
      </div>

      {/* Sabit alt toggle */}
      <div className="pointer-events-none fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px)+20px)] left-0 right-0 z-40 flex justify-center lg:bottom-5">
        <div className="pointer-events-auto flex overflow-hidden rounded-full border border-border bg-card/95 shadow-2xl backdrop-blur">
          <button onClick={() => setView("liste")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition ${view === "liste" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            <List className="h-4 w-4" />Liste
          </button>
          <button onClick={() => setView("harita")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition ${view === "harita" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            <Map className="h-4 w-4" />Harita
          </button>
        </div>
      </div>

      {/* Mobil filtre sheet */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilter(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85svh] overflow-y-auto rounded-t-3xl bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold">Filtrele</p>
              <button onClick={() => setMobileFilter(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarFilters filters={filters} setF={setF} togglePT={togglePT} resetFilters={resetFilters} />
            <button onClick={() => setMobileFilter(false)}
              className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">
              {filtered.length} İlan Göster
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
