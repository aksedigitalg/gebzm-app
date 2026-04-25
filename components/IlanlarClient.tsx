"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Clock, Tag, Map, List, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { listingCategories, getCategoryById } from "@/lib/listing-categories";
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
  listing_type: string; category: string; subcategory?: string;
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes("/video/");
}

/* ─── SLIDES ─────────────────────────────────────────────────────────── */
const SLIDES = [
  { title: "Gebze'nin İlan Panosu", sub: "Binlerce ilan tek adreste", from: "#0e7490", to: "#10b981" },
  { title: "Emlak İlanları", sub: "Satılık & kiralık konutlar", from: "#1d4ed8", to: "#0891b2" },
  { title: "Vasıta İlanları", sub: "İkinci el araç ilanları", from: "#ea580c", to: "#ca8a04" },
  { title: "Elektronik & Teknoloji", sub: "Telefon, bilgisayar ve daha fazlası", from: "#7c3aed", to: "#db2777" },
];

/* ─── HERO SLIDER ─────────────────────────────────────────────────────── */
interface HeroProps {
  activeSlide: number;
  setSlide: (i: number) => void;
}

function HeroSlider({ activeSlide, setSlide }: HeroProps) {
  const s = SLIDES[activeSlide];
  return (
    <div className="relative h-44 overflow-hidden">
      {SLIDES.map((sl, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === activeSlide ? 1 : 0, background: `linear-gradient(135deg, ${sl.from}, ${sl.to})` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/20" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
        <p className="text-xl font-bold text-white drop-shadow">{s.title}</p>
        <p className="mt-1 text-sm text-white/80">{s.sub}</p>
      </div>

      <button
        onClick={() => setSlide((activeSlide - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => setSlide((activeSlide + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className="h-1.5 rounded-full bg-white transition-all"
            style={{ width: i === activeSlide ? 20 : 6, opacity: i === activeSlide ? 1 : 0.45 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── KATEGORİ BAR ───────────────────────────────────────────────────── */
interface CatBarProps {
  activeCategory: string;
  onSelect: (cat: string) => void;
}

function CategoryBar({ activeCategory, onSelect }: CatBarProps) {
  return (
    <div className="border-b border-border bg-background px-4 py-3">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {listingCategories.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(activeCategory === c.id ? "" : c.id)}
            style={{ width: 90, height: 90 }}
            className={`flex flex-col items-center justify-center rounded-2xl border text-center transition mx-auto
              ${activeCategory === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/50 hover:text-primary"}`}
          >
            <span className="text-xs font-semibold leading-tight px-1">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── MOBİL ALT KATEGORİ BAR ─────────────────────────────────────────── */
interface MobileSubcatBarProps {
  categoryId: string;
  activeSubcat: string;
  onSelect: (sub: string) => void;
}

function MobileSubcatBar({ categoryId, activeSubcat, onSelect }: MobileSubcatBarProps) {
  const cat = getCategoryById(categoryId);
  if (!cat) return null;
  return (
    <div className="border-b border-border bg-muted/30 lg:hidden">
      <div className="flex gap-1.5 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => onSelect("")}
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition
            ${!activeSubcat
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background hover:border-primary/40"}`}
        >
          Tümü
        </button>
        {cat.subcategories.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(activeSubcat === s.id ? "" : s.id)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition
              ${activeSubcat === s.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:border-primary/40"}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── DESKTOP ALT KATEGORİ PANELİ ───────────────────────────────────── */
interface SubcatPanelProps {
  categoryId: string;
  activeSubcat: string;
  onSelect: (sub: string) => void;
}

function SubcategoryPanel({ categoryId, activeSubcat, onSelect }: SubcatPanelProps) {
  const cat = getCategoryById(categoryId);
  if (!cat) return null;
  return (
    <aside
      className="hidden w-44 shrink-0 overflow-y-auto border-r border-border bg-card/60 py-3 lg:block sticky top-[97px]"
      style={{ height: "calc(100dvh - 97px)" }}
    >
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {cat.label}
      </p>
      <div className="space-y-0.5 px-2">
        <button
          onClick={() => onSelect("")}
          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition
            ${!activeSubcat ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}
        >
          Tümü
          {!activeSubcat && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </button>
        {cat.subcategories.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(activeSubcat === s.id ? "" : s.id)}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition
              ${activeSubcat === s.id ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}
          >
            {s.label}
            {activeSubcat === s.id && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ─── ANA BİLEŞEN ───────────────────────────────────────────────────── */
const PAGE_SIZE = 24;
const API = process.env.NEXT_PUBLIC_API_URL || "https://gebzem.app/api/v1";

export function IlanlarClient({ initialListings }: { initialListings: Listing[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [view, setView] = useState<"liste" | "harita">("liste");
  const [category, setCategory] = useState(params.get("k") || "");
  const [subcategory, setSubcategory] = useState(params.get("s") || "");
  const [allListings, setAllListings] = useState<Listing[]>(initialListings);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialListings.length >= PAGE_SIZE);
  const [activeSlide, setActiveSlide] = useState(0);
  const pageRef = useRef(1);

  useEffect(() => {
    const t = setInterval(() => setActiveSlide(i => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "visible") router.refresh(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [router]);

  useEffect(() => {
    setAllListings(initialListings);
    setHasMore(initialListings.length >= PAGE_SIZE);
    pageRef.current = 1;
  }, [initialListings]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const next = pageRef.current + 1;
      const res = await fetch(`${API}/listings?page=${next}`, { cache: "no-store" });
      if (!res.ok) return;
      const data: Listing[] = await res.json();
      setAllListings(prev => [...prev, ...data]);
      setHasMore(data.length >= PAGE_SIZE);
      pageRef.current = next;
    } catch { } finally { setLoadingMore(false); }
  }, []);

  const handleCatSelect = useCallback((cat: string) => {
    setCategory(cat);
    setSubcategory("");
    const url = cat ? `/ilanlar?k=${cat}` : "/ilanlar";
    router.replace(url, { scroll: false });
  }, [router]);

  const handleSubcatSelect = useCallback((sub: string) => {
    setSubcategory(sub);
    const url = sub ? `/ilanlar?k=${category}&s=${sub}` : `/ilanlar?k=${category}`;
    router.replace(url, { scroll: false });
  }, [router, category]);

  const filtered = useMemo(() => allListings.filter(l => {
    if (category && l.category !== category) return false;
    if (subcategory && l.subcategory !== subcategory) return false;
    return true;
  }), [allListings, category, subcategory]);

  const hasFilter = !!(category || subcategory);

  return (
    <div className="-mx-5 -mb-6 lg:-mx-6 lg:-my-4">

      {/* HERO */}
      <HeroSlider activeSlide={activeSlide} setSlide={setActiveSlide} />

      {/* KATEGORİ BAR */}
      <CategoryBar activeCategory={category} onSelect={handleCatSelect} />

      {/* MOBİL ALT KATEGORİ */}
      {category && (
        <MobileSubcatBar categoryId={category} activeSubcat={subcategory} onSelect={handleSubcatSelect} />
      )}

      {/* SONUÇ ÇUBUĞU */}
      <div className="sticky top-[57px] z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-2 backdrop-blur-sm">
        <p className="text-sm font-semibold text-muted-foreground">
          <span className="font-bold text-foreground">{filtered.length}</span> ilan
          {hasFilter && (
            <button
              onClick={() => { setCategory(""); setSubcategory(""); }}
              className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
            >
              ✕ temizle
            </button>
          )}
        </p>
      </div>

      {/* SIDEBAR + İÇERİK */}
      <div className="flex">

        {/* Desktop alt kategori paneli */}
        {category && (
          <SubcategoryPanel categoryId={category} activeSubcat={subcategory} onSelect={handleSubcatSelect} />
        )}

        {/* İçerik */}
        <div className="min-w-0 flex-1">

          {view === "harita" && (
            <div style={{ height: "calc(100dvh - 97px)" }}>
              <IlanlarMapDynamic listings={filtered} />
            </div>
          )}

          {view === "liste" && filtered.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <Tag className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
              <p className="mt-4 text-sm font-semibold">İlan bulunamadı</p>
              {hasFilter && (
                <button
                  onClick={() => { setCategory(""); setSubcategory(""); }}
                  className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Tümünü Göster
                </button>
              )}
            </div>
          )}

          {view === "liste" && filtered.length > 0 && (
            <>
              <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((l) => {
                  const firstMedia = l.photos?.[0];
                  const isVideo = firstMedia ? isVideoUrl(firstMedia) : false;
                  return (
                    <Link key={l.id} href={`/ilanlar/${l.id}`}
                      className="flex gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/30 hover:shadow-md">
                      <div className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {firstMedia && !isVideo && (
                          <img src={firstMedia} alt="" className="h-full w-full object-cover" />
                        )}
                        {firstMedia && isVideo && (
                          <>
                            <video src={firstMedia} className="h-full w-full object-cover" muted playsInline preload="auto" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-6 w-6 text-white" fill="white" />
                            </div>
                          </>
                        )}
                        {!firstMedia && (
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

              {hasMore && !hasFilter && (
                <div className="flex justify-center pb-36 pt-2">
                  <button onClick={loadMore} disabled={loadingMore}
                    className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:opacity-50">
                    {loadingMore ? "Yükleniyor..." : "Daha Fazla Yükle"}
                  </button>
                </div>
              )}
              {!hasMore && allListings.length > PAGE_SIZE && (
                <p className="pb-36 pt-2 text-center text-xs text-muted-foreground">Tüm ilanlar yüklendi</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Liste / Harita toggle */}
      <div className="pointer-events-none fixed bottom-[calc(84px+env(safe-area-inset-bottom,0px)+24px)] left-0 right-0 z-40 flex justify-center lg:bottom-5">
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
    </div>
  );
}
