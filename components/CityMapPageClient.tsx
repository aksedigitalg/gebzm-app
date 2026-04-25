"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Building2,
  Bus,
  Coffee,
  CreditCard,
  Fuel,
  GraduationCap,
  Hospital,
  Loader2,
  Locate,
  Menu,
  ParkingSquare,
  Pill,
  Search,
  ShoppingBag,
  Trees,
  UtensilsCrossed,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

type CategoryKey =
  | "durak"
  | "park"
  | "eczane"
  | "hastane"
  | "atm"
  | "benzin"
  | "cami"
  | "okul"
  | "restoran"
  | "kafe"
  | "market"
  | "otopark"
  | "banka";

interface CategoryDef {
  key: CategoryKey;
  label: string;
  color: string;
  overpassFilter?: string;
}

const CATEGORIES: CategoryDef[] = [
  { key: "durak", label: "Duraklar", color: "#0ea5e9" },
  { key: "park", label: "Parklar", color: "#22c55e", overpassFilter: '"leisure"="park"' },
  { key: "eczane", label: "Eczane", color: "#ef4444", overpassFilter: '"amenity"="pharmacy"' },
  { key: "hastane", label: "Sağlık", color: "#f43f5e", overpassFilter: '"amenity"~"hospital|clinic|doctors"' },
  { key: "atm", label: "ATM", color: "#06b6d4", overpassFilter: '"amenity"="atm"' },
  { key: "benzin", label: "Benzin", color: "#f97316", overpassFilter: '"amenity"="fuel"' },
  { key: "cami", label: "Cami", color: "#8b5cf6", overpassFilter: '"amenity"="place_of_worship"' },
  { key: "okul", label: "Okul", color: "#a855f7", overpassFilter: '"amenity"~"school|kindergarten|university|college"' },
  { key: "restoran", label: "Restoran", color: "#ec4899", overpassFilter: '"amenity"="restaurant"' },
  { key: "kafe", label: "Kafe", color: "#d97706", overpassFilter: '"amenity"="cafe"' },
  { key: "market", label: "Market", color: "#0d9488", overpassFilter: '"shop"~"supermarket|convenience"' },
  { key: "otopark", label: "Otopark", color: "#64748b", overpassFilter: '"amenity"="parking"' },
  { key: "banka", label: "Banka", color: "#6366f1", overpassFilter: '"amenity"="bank"' },
];

const CATEGORY_BY_KEY: Record<CategoryKey, CategoryDef> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c])
) as Record<CategoryKey, CategoryDef>;

const CATEGORY_ICON: Record<CategoryKey, typeof Bus> = {
  durak: Bus,
  park: Trees,
  eczane: Pill,
  hastane: Hospital,
  atm: CreditCard,
  benzin: Fuel,
  cami: Building2,
  okul: GraduationCap,
  restoran: UtensilsCrossed,
  kafe: Coffee,
  market: ShoppingBag,
  otopark: ParkingSquare,
  banka: Banknote,
};

const CATEGORY_FALLBACK_NAME: Record<CategoryKey, string> = {
  durak: "Durak",
  park: "Park",
  eczane: "Eczane",
  hastane: "Sağlık Merkezi",
  atm: "ATM",
  benzin: "Benzin İstasyonu",
  cami: "Cami",
  okul: "Okul",
  restoran: "Restoran",
  kafe: "Kafe",
  market: "Market",
  otopark: "Otopark",
  banka: "Banka",
};

interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: CategoryKey;
  address?: string;
  phone?: string;
  opening_hours?: string;
  website?: string;
}

const KOCAELI_CENTER = { lat: 40.7654, lng: 29.9408 };
// [south, west, north, east]
const KOCAELI_BBOX = [40.55, 29.0, 41.1, 30.5] as const;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const poiCache = new Map<CategoryKey, POI[]>();

async function fetchPois(cat: CategoryDef): Promise<POI[]> {
  const cached = poiCache.get(cat.key);
  if (cached) return cached;

  if (cat.key === "durak") {
    const res = await fetch("/data/bus-stops.json", { cache: "force-cache" });
    if (!res.ok) throw new Error("bus-stops fetch failed");
    const stops = (await res.json()) as { id: string; name: string; lat: number; lng: number }[];
    const list: POI[] = stops.map(s => ({
      id: `stop-${s.id}`,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      category: "durak",
    }));
    poiCache.set(cat.key, list);
    return list;
  }

  if (!cat.overpassFilter) return [];

  const bbox = KOCAELI_BBOX.join(",");
  const query = `[out:json][timeout:30];nwr[${cat.overpassFilter}](${bbox});out center tags 1500;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: "data=" + encodeURIComponent(query),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) throw new Error("Overpass error");
  const data = (await res.json()) as { elements?: any[] };
  const elements = data.elements || [];

  const list: POI[] = [];
  const seen = new Set<string>();
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    const id = `${el.type}-${el.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const tags = el.tags || {};
    const addrParts = [tags["addr:street"], tags["addr:housenumber"], tags["addr:district"]]
      .filter(Boolean)
      .map(String);
    list.push({
      id,
      name:
        tags.name ||
        tags["name:tr"] ||
        tags.brand ||
        tags.operator ||
        CATEGORY_FALLBACK_NAME[cat.key],
      lat,
      lng,
      category: cat.key,
      address: addrParts.length ? addrParts.join(" ") : undefined,
      phone: tags.phone || tags["contact:phone"],
      opening_hours: tags.opening_hours,
      website: tags.website || tags["contact:website"],
    });
  }

  poiCache.set(cat.key, list);
  return list;
}

function popupHtml(poi: POI): string {
  const cat = CATEGORY_BY_KEY[poi.category];
  const phoneClean = poi.phone ? poi.phone.replace(/[^+\d]/g, "") : "";
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;min-width:220px;max-width:280px;padding:2px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cat.color};"></span>
        <span style="font-size:11px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;">${esc(cat.label)}</span>
      </div>
      <p style="font-size:14px;font-weight:700;margin:0 0 6px;line-height:1.3;color:#0f172a;">${esc(poi.name)}</p>
      ${poi.address ? `<p style="font-size:12px;color:#475569;margin:0 0 4px;line-height:1.4;">${esc(poi.address)}</p>` : ""}
      ${poi.phone ? `<p style="font-size:12px;margin:0 0 4px;"><a href="tel:${esc(phoneClean)}" style="color:#0e7490;text-decoration:none;font-weight:500;">${esc(poi.phone)}</a></p>` : ""}
      ${poi.opening_hours ? `<p style="font-size:11px;color:#64748b;margin:0 0 6px;line-height:1.4;">${esc(poi.opening_hours)}</p>` : ""}
      <a href="https://www.google.com/maps/search/?api=1&amp;query=${poi.lat},${poi.lng}" target="_blank" rel="noopener" style="display:inline-block;font-size:12px;color:#0e7490;text-decoration:none;font-weight:600;margin-top:2px;">Yol Tarifi →</a>
    </div>
  `;
}

interface SidebarProps {
  active: CategoryKey;
  setActive: (k: CategoryKey) => void;
  query: string;
  setQuery: (q: string) => void;
  filtered: POI[];
  loading: boolean;
  totalCount: number;
  focusPoi: (poi: POI) => void;
  hideHeader?: boolean;
  onClose?: () => void;
}

function SidebarPanel({
  active,
  setActive,
  query,
  setQuery,
  filtered,
  loading,
  totalCount,
  focusPoi,
  hideHeader,
  onClose,
}: SidebarProps) {
  const activeCat = CATEGORY_BY_KEY[active];
  return (
    <div className="flex flex-col h-full min-h-0">
      {!hideHeader && (
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Link
            href="/"
            aria-label="Geri"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight">Gebze Haritası</h1>
            <p className="truncate text-xs text-muted-foreground">Kocaeli geneli yerler</p>
          </div>
        </div>
      )}

      <div className="border-b border-border p-3">
        <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-muted px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`${activeCat.label.toLocaleLowerCase("tr")} ara...`}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Temizle"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-border px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-x-auto">
        <div className="flex gap-2">
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICON[cat.key];
            const isActive = cat.key === active;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActive(cat.key)}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition"
                style={{
                  backgroundColor: isActive ? cat.color : "transparent",
                  color: isActive ? "white" : undefined,
                  borderColor: isActive ? cat.color : "var(--border, #e5e7eb)",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span>
          {loading
            ? "Yükleniyor..."
            : `${totalCount.toLocaleString("tr-TR")} ${activeCat.label.toLocaleLowerCase("tr")}`}
        </span>
        {query && filtered.length !== totalCount && (
          <span className="font-medium">{filtered.length} sonuç</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Yükleniyor...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Sonuç bulunamadı
          </div>
        )}
        {!loading &&
          filtered.map(poi => {
            const Icon = CATEGORY_ICON[poi.category];
            return (
              <button
                key={poi.id}
                type="button"
                onClick={() => {
                  focusPoi(poi);
                  onClose?.();
                }}
                className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted last:border-b-0"
              >
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: activeCat.color }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{poi.name}</p>
                  {poi.address && (
                    <p className="truncate text-xs text-muted-foreground">{poi.address}</p>
                  )}
                  {!poi.address && poi.phone && (
                    <p className="truncate text-xs text-muted-foreground">{poi.phone}</p>
                  )}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default function CityMapPageClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterRef = useRef<any>(null);
  const markerByIdRef = useRef<Map<string, LeafletMarker>>(new Map());
  const userMarkerRef = useRef<LeafletMarker | null>(null);

  const [active, setActive] = useState<CategoryKey>("durak");
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const L = require("leaflet");
    require("leaflet.markercluster");

    delete (L.Icon.Default.prototype as any)._getIconUrl;

    const map: LeafletMap = L.map(containerRef.current, {
      center: [KOCAELI_CENTER.lat, KOCAELI_CENTER.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    const cluster = (L as any).markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 100,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markerByIdRef.current.clear();
      userMarkerRef.current = null;
    };
  }, []);

  // Fetch + render markers when active category changes
  useEffect(() => {
    const cluster = clusterRef.current;
    const map = mapRef.current;
    if (!cluster || !map) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPois(CATEGORY_BY_KEY[active])
      .then(list => {
        if (cancelled) return;
        setPois(list);

        cluster.clearLayers();
        markerByIdRef.current.clear();

        const L = require("leaflet");
        const cat = CATEGORY_BY_KEY[active];

        const dotIcon = L.divIcon({
          className: "",
          html: `<div style="width:22px;height:22px;border-radius:50%;background:${cat.color};border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.35);"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const stopIcon = L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${cat.color};border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.4);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const useIcon = active === "durak" ? stopIcon : dotIcon;

        list.forEach(poi => {
          const m = L.marker([poi.lat, poi.lng], { icon: useIcon }).bindPopup(
            popupHtml(poi),
            { maxWidth: 300, autoPan: true }
          );
          markerByIdRef.current.set(poi.id, m);
          cluster.addLayer(m);
        });

        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Veri yüklenemedi");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (!q) return pois.slice(0, 200);
    if (q.length < 2) return [];
    return pois.filter(p => p.name.toLocaleLowerCase("tr").includes(q)).slice(0, 200);
  }, [query, pois]);

  const focusPoi = useCallback((poi: POI) => {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    const marker = markerByIdRef.current.get(poi.id);
    if (!map || !cluster || !marker) return;
    cluster.zoomToShowLayer(marker, () => marker.openPopup());
  }, []);

  const locateMe = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!navigator.geolocation) {
      setError("Konum servisi desteklenmiyor");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const L = require("leaflet");
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 0 4px rgba(16,185,129,0.25);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map);
        map.flyTo([lat, lng], 16, { duration: 0.6 });
      },
      () => setError("Konum alınamadı"),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error]);

  const activeCat = CATEGORY_BY_KEY[active];

  return (
    <div className="absolute inset-0 bg-card">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* DESKTOP SIDEBAR */}
      <aside className="absolute bottom-0 left-0 top-0 z-[500] hidden w-[380px] flex-col border-r border-border bg-card/95 shadow-xl backdrop-blur-md lg:flex">
        <SidebarPanel
          active={active}
          setActive={setActive}
          query={query}
          setQuery={setQuery}
          filtered={filtered}
          loading={loading}
          totalCount={pois.length}
          focusPoi={focusPoi}
        />
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3 lg:hidden">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href="/"
            aria-label="Geri"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 shadow-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`${activeCat.label.toLocaleLowerCase("tr")} ara...`}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Temizle"
                className="text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Liste"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-md"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="pointer-events-auto mt-3 -mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 pr-3">
            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICON[cat.key];
              const isActive = cat.key === active;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActive(cat.key)}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-md transition"
                  style={{
                    backgroundColor: isActive ? cat.color : "rgb(var(--card-rgb, 255 255 255) / 0.95)",
                    color: isActive ? "white" : undefined,
                    borderColor: isActive ? cat.color : undefined,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* LOCATE BUTTON — top right */}
      <button
        type="button"
        onClick={locateMe}
        aria-label="Konumum"
        className="absolute right-4 top-4 z-[500] hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-md lg:flex"
      >
        <Locate className="h-5 w-5 text-primary" />
      </button>

      {/* LOCATE BUTTON — mobile, above bottom nav */}
      <button
        type="button"
        onClick={locateMe}
        aria-label="Konumum"
        className="absolute right-4 z-[500] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-md lg:hidden"
        style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        <Locate className="h-5 w-5 text-primary" />
      </button>

      {/* LOADING INDICATOR */}
      {loading && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[600] -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">{activeCat.label} yükleniyor...</span>
          </div>
        </div>
      )}

      {/* ERROR TOAST */}
      {error && (
        <div className="absolute bottom-24 left-1/2 z-[600] -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {error}
        </div>
      )}

      {/* MOBILE DRAWER */}
      {drawerOpen && (
        <div
          className="absolute inset-0 z-[700] bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 flex max-h-[85%] flex-col rounded-t-3xl bg-card shadow-2xl"
            style={{ paddingBottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-base font-bold">{activeCat.label}</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Kapat"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarPanel
              active={active}
              setActive={setActive}
              query={query}
              setQuery={setQuery}
              filtered={filtered}
              loading={loading}
              totalCount={pois.length}
              focusPoi={focusPoi}
              hideHeader
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
