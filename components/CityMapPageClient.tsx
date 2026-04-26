"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Building2,
  Bus,
  Camera,
  Car,
  Coffee,
  CreditCard,
  Fuel,
  GraduationCap,
  Hospital,
  Crosshair,
  Loader2,
  Locate,
  MonitorSmartphone,
  Navigation,
  ParkingSquare,
  Pill,
  Search,
  ShoppingBag,
  Target,
  Trees,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useGeolocation } from "@/lib/use-geolocation";
import { setConsent } from "@/lib/geolocation-consent";
import { formatDistance, haversineKm } from "@/lib/geolocation";
import {
  loadRoutes,
  loadRouteShapes,
  loadRouteStops,
  loadStopRoutes,
  type BusRoute,
  type RouteShape,
  type StopRouteRef,
} from "@/lib/bus-data";
import { computeETA, configForRoute } from "@/lib/bus-eta";
import {
  buildCumDist,
  simulateBuses,
  type GhostBus,
} from "@/lib/bus-positions";
import {
  type JourneyOption,
  type JourneyOriginInput,
  type PlannerStop,
} from "@/lib/journey-planner";
import { JourneyPlannerSheet } from "@/components/JourneyPlannerSheet";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

type CategoryKey =
  | "durak"
  | "akilli-durak"
  | "taksi"
  | "kentkart"
  | "petrol"
  | "otopark"
  | "eds"
  | "park"
  | "eczane"
  | "hastane"
  | "atm"
  | "cami"
  | "okul"
  | "restoran"
  | "kafe"
  | "market"
  | "banka";

interface CategoryDef {
  key: CategoryKey;
  label: string;
  color: string;
  overpassFilter?: string;
  localUrl?: string;
}

const CATEGORIES: CategoryDef[] = [
  { key: "durak", label: "Duraklar", color: "#0ea5e9", localUrl: "/data/bus-stops.json" },
  { key: "akilli-durak", label: "Akıllı Durak", color: "#0891b2", localUrl: "/data/poi/akilli-durak.json" },
  { key: "taksi", label: "Taksi", color: "#eab308", localUrl: "/data/poi/taksi.json" },
  { key: "kentkart", label: "Kentkart", color: "#a16207", localUrl: "/data/poi/kentkart.json" },
  { key: "petrol", label: "Petrol", color: "#f97316", localUrl: "/data/poi/petrol.json" },
  { key: "otopark", label: "Otopark", color: "#64748b", localUrl: "/data/poi/otopark.json" },
  { key: "eds", label: "EDS Kamera", color: "#dc2626", localUrl: "/data/poi/eds.json" },
  { key: "park", label: "Parklar", color: "#22c55e", overpassFilter: '"leisure"="park"' },
  { key: "eczane", label: "Eczane", color: "#ef4444", overpassFilter: '"amenity"="pharmacy"' },
  { key: "hastane", label: "Sağlık", color: "#f43f5e", overpassFilter: '"amenity"~"hospital|clinic|doctors"' },
  { key: "atm", label: "ATM", color: "#06b6d4", overpassFilter: '"amenity"="atm"' },
  { key: "cami", label: "Cami", color: "#8b5cf6", overpassFilter: '"amenity"="place_of_worship"' },
  { key: "okul", label: "Okul", color: "#a855f7", overpassFilter: '"amenity"~"school|kindergarten|university|college"' },
  { key: "restoran", label: "Restoran", color: "#ec4899", overpassFilter: '"amenity"="restaurant"' },
  { key: "kafe", label: "Kafe", color: "#d97706", overpassFilter: '"amenity"="cafe"' },
  { key: "market", label: "Market", color: "#0d9488", overpassFilter: '"shop"~"supermarket|convenience"' },
  { key: "banka", label: "Banka", color: "#6366f1", overpassFilter: '"amenity"="bank"' },
];

const CATEGORY_BY_KEY: Record<CategoryKey, CategoryDef> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c])
) as Record<CategoryKey, CategoryDef>;

const CATEGORY_ICON: Record<CategoryKey, typeof Bus> = {
  durak: Bus,
  "akilli-durak": MonitorSmartphone,
  taksi: Car,
  kentkart: Wallet,
  petrol: Fuel,
  otopark: ParkingSquare,
  eds: Camera,
  park: Trees,
  eczane: Pill,
  hastane: Hospital,
  atm: CreditCard,
  cami: Building2,
  okul: GraduationCap,
  restoran: UtensilsCrossed,
  kafe: Coffee,
  market: ShoppingBag,
  banka: Banknote,
};

const CATEGORY_FALLBACK_NAME: Record<CategoryKey, string> = {
  durak: "Durak",
  "akilli-durak": "Akıllı Durak",
  taksi: "Taksi Durağı",
  kentkart: "Kentkart Bayisi",
  petrol: "Petrol İstasyonu",
  otopark: "Otopark",
  eds: "EDS Noktası",
  park: "Park",
  eczane: "Eczane",
  hastane: "Sağlık Merkezi",
  atm: "ATM",
  cami: "Cami",
  okul: "Okul",
  restoran: "Restoran",
  kafe: "Kafe",
  market: "Market",
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
  distanceKm?: number;
}

// Gebze merkez — başlangıçta odaklı görünüm
const GEBZE_CENTER = { lat: 40.8030, lng: 29.4310 };
// Overpass POI sorguları için Kocaeli geneli bbox [south, west, north, east]
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

  if (cat.localUrl) {
    const res = await fetch(cat.localUrl, { cache: "force-cache" });
    if (!res.ok) throw new Error("local fetch failed");
    const arr = (await res.json()) as Array<{
      id?: string;
      name?: string;
      lat: number;
      lng: number;
      address?: string;
      phone?: string;
      ilce?: string;
      mahalle?: string;
    }>;
    const list: POI[] = arr.map((it, i) => ({
      id: it.id || `${cat.key}-${i}`,
      name: it.name || CATEGORY_FALLBACK_NAME[cat.key],
      lat: it.lat,
      lng: it.lng,
      category: cat.key,
      address: it.address || [it.mahalle, it.ilce].filter(Boolean).join(" / ") || undefined,
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

interface PopupCtx {
  stopRoutes?: StopRouteRef[];
  routesById?: Record<string, BusRoute>;
  routeStopCounts?: Record<string, number>;
}

function popupHtml(
  poi: POI,
  ctx?: PopupCtx,
  now: Date = new Date()
): string {
  const cat = CATEGORY_BY_KEY[poi.category];
  const phoneClean = poi.phone ? poi.phone.replace(/[^+\d]/g, "") : "";
  const stopRoutes = ctx?.stopRoutes;
  const routesById = ctx?.routesById;
  const routeStopCounts = ctx?.routeStopCounts;
  const hasRoutes = poi.category === "durak" && stopRoutes && stopRoutes.length > 0;
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;min-width:260px;max-width:320px;padding:2px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cat.color};"></span>
        <span style="font-size:11px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;">${esc(cat.label)}</span>
      </div>
      <p style="font-size:14px;font-weight:700;margin:0 0 6px;line-height:1.3;color:#0f172a;">${esc(poi.name)}</p>
      ${poi.address ? `<p style="font-size:12px;color:#475569;margin:0 0 4px;line-height:1.4;">${esc(poi.address)}</p>` : ""}
      ${poi.phone ? `<p style="font-size:12px;margin:0 0 4px;"><a href="tel:${esc(phoneClean)}" style="color:#0e7490;text-decoration:none;font-weight:500;">${esc(poi.phone)}</a></p>` : ""}
      ${poi.opening_hours ? `<p style="font-size:11px;color:#64748b;margin:0 0 6px;line-height:1.4;">${esc(poi.opening_hours)}</p>` : ""}
      ${hasRoutes ? `
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin:0 0 6px;">
            <p style="font-size:10px;color:#64748b;font-weight:600;letter-spacing:0.04em;margin:0;text-transform:uppercase;">Geçen Hatlar</p>
            <p style="font-size:9px;color:#94a3b8;margin:0;">tahmini · 06-23</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${stopRoutes!
              .map(r => {
                const totalStops = routeStopCounts?.[r.id];
                const route = routesById?.[r.id];
                const cfg = configForRoute(route?.tripsByService, now);
                const eta = computeETA(r.dist, r.total, r.before, totalStops, now, cfg);
                const etaHtml = eta.text
                  ? `<span style="font-size:10px;font-weight:600;opacity:0.92;margin-left:auto;padding:1px 6px;border-radius:4px;background:rgba(255,255,255,0.22);">${esc(eta.text)}</span>`
                  : "";
                return `<button data-route-id="${esc(r.id)}" style="
                    display:flex;align-items:center;gap:6px;width:100%;
                    background:#${esc(r.color || "0e7490")};color:#fff;
                    font-size:12px;font-weight:700;
                    padding:5px 9px;border-radius:7px;border:none;cursor:pointer;
                    font-family:inherit;line-height:1.2;text-align:left;
                  "><span style="min-width:30px;text-align:left;">${esc(r.short || r.id)}</span>${
                    r.headsign
                      ? `<span style="font-size:10px;font-weight:500;opacity:0.85;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(r.headsign)}</span>`
                      : ""
                  }${etaHtml}</button>`;
              })
              .join("")}
          </div>
        </div>
      ` : ""}
      <a href="https://www.google.com/maps/search/?api=1&amp;query=${poi.lat},${poi.lng}" target="_blank" rel="noopener" style="display:inline-block;font-size:12px;color:#0e7490;text-decoration:none;font-weight:600;margin-top:8px;">Yol Tarifi →</a>
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
                  <div className="flex items-center gap-1.5">
                    {poi.distanceKm != null && (
                      <span
                        className="text-xs font-bold"
                        style={{ color: activeCat.color }}
                      >
                        {formatDistance(poi.distanceKm)}
                      </span>
                    )}
                    {(poi.address || poi.phone) && (
                      <p className="truncate text-xs text-muted-foreground">
                        {poi.address || poi.phone}
                      </p>
                    )}
                  </div>
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
  const userAccuracyRef = useRef<any>(null);
  const selectedShapesRef = useRef<any[]>([]);
  // Stable ID → marker mapping. Aynı sefer (kalkış slot'u) her refresh'te
  // aynı ID döner → setLatLng ile pozisyon güncellenir → CSS transition smooth.
  const ghostBusMarkersRef = useRef<Map<string, any>>(new Map());
  const ghostBusIntervalRef = useRef<number | null>(null);
  // popupHtml'de stopRoutes / routeStopCounts / routesById lookup için (closure güncel)
  const stopRoutesRef = useRef<Record<string, StopRouteRef[]> | null>(null);
  const routeStopCountsRef = useRef<Record<string, number> | null>(null);
  const routeStopsRef = useRef<Record<string, number[]> | null>(null);
  const routesByIdRef = useRef<Record<string, BusRoute> | null>(null);

  const [active, setActive] = useState<CategoryKey>("durak");
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [stopRoutes, setStopRoutes] = useState<Record<string, StopRouteRef[]> | null>(null);
  const [routesData, setRoutesData] = useState<BusRoute[] | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [ghostBusCount, setGhostBusCount] = useState(0);
  // Journey planner state
  const [allBusStops, setAllBusStops] = useState<PlannerStop[]>([]);
  const [taxiPois, setTaxiPois] = useState<
    Array<{ id: string; name: string; lat: number; lng: number; phone?: string; address?: string }>
  >([]);
  const [searchablePois, setSearchablePois] = useState<
    Array<{ id: string; name: string; lat: number; lng: number; category: string; address?: string }>
  >([]);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [destination, setDestination] = useState<JourneyOriginInput | null>(null);
  const [pickingDestOnMap, setPickingDestOnMap] = useState(false);
  const journeyLayersRef = useRef<any[]>([]);
  const destMarkerRef = useRef<any>(null);
  // Şu an seçili hattın shape verisi — interval refresh'te tekrar fetch etmemek için
  const selectedShapeDataRef = useRef<{
    shapes: RouteShape[];
    cumDists: Map<string, Float64Array>;
    totalKms: Map<string, number>;
    routeStopDists: number[];
  } | null>(null);

  const geo = useGeolocation();

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const L = require("leaflet");
    require("leaflet.markercluster");

    delete (L.Icon.Default.prototype as any)._getIconUrl;

    const map: LeafletMap = L.map(containerRef.current, {
      center: [GEBZE_CENTER.lat, GEBZE_CENTER.lng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

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
      userAccuracyRef.current = null;
      selectedShapesRef.current = [];
      ghostBusMarkersRef.current.clear();
      if (ghostBusIntervalRef.current !== null) {
        window.clearInterval(ghostBusIntervalRef.current);
        ghostBusIntervalRef.current = null;
      }
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
        const sr = stopRoutesRef.current;

        list.forEach(poi => {
          // Durak ise hat listesini popup HTML'ine geçir
          const routes =
            poi.category === "durak" && sr ? sr[poi.id] : undefined;
          const buildCtx = (): PopupCtx => ({
            stopRoutes: routes,
            routesById: routesByIdRef.current ?? undefined,
            routeStopCounts: routeStopCountsRef.current ?? undefined,
          });
          const m = L.marker([poi.lat, poi.lng], { icon: useIcon }).bindPopup(
            popupHtml(poi, buildCtx()),
            { maxWidth: 340, autoPan: true }
          );
          // Durak popup'ı açıldığında taze "şu an" ile ETA hesabı
          if (routes && routes.length > 0) {
            m.on("popupopen", () => {
              const popup = m.getPopup();
              if (popup) {
                popup.setContent(popupHtml(poi, buildCtx(), new Date()));
              }
            });
          }
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
  }, [active, stopRoutes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    let list: POI[] =
      q.length >= 2
        ? pois.filter(p => p.name.toLocaleLowerCase("tr").includes(q))
        : !q
          ? pois
          : [];

    // Konum varsa: uzaklık hesapla + uzaklığa göre sırala
    if (geo.coords) {
      const here = geo.coords;
      list = list
        .map(p => ({ ...p, distanceKm: haversineKm(here, p) }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    return list.slice(0, 200);
  }, [query, pois, geo.coords]);

  const focusPoi = useCallback((poi: POI) => {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    const marker = markerByIdRef.current.get(poi.id);
    if (!map || !cluster || !marker) return;
    cluster.zoomToShowLayer(marker, () => marker.openPopup());
  }, []);

  // Konum butonu — ANINDA manuel modu açar VE arka planda GPS dener.
  // GPS başarılıysa manuel mod kendi kapanır + koordinat yerleşir.
  // GPS başarısızsa kullanıcı zaten haritaya tıklayabiliyor — hata mesajı yok.
  const handleLocateClick = useCallback(async () => {
    setConsent("granted");
    setManualMode(true); // hemen tıklanabilir hale getir
    setLocating(true);

    const result = await geo.request();
    setLocating(false);

    if (result.coords) {
      // GPS işe yaradı — manuel modu kapat (coords useEffect marker'ı zaten çiziyor)
      setManualMode(false);
    }
    // GPS başarısız: manuel mod açık kaldı, banner'ı görüyor, tıklayıp seçer.
    // Hiçbir error toast/modal göstermiyoruz — kullanıcı "yapamadım" hissi yaşamaz.
  }, [geo]);

  // Manuel mod — tap = açık rıza
  const handleManualClick = useCallback(() => {
    setConsent("granted");
    setManualMode(prev => !prev);
  }, []);

  // Manuel mod / Destination picking — haritaya tıklama
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();
    const cursorOn = manualMode || pickingDestOnMap;
    container.style.cursor = cursorOn ? "crosshair" : "";

    if (!cursorOn) return;

    const handleMapClick = (e: any) => {
      if (pickingDestOnMap) {
        const dest: JourneyOriginInput = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          label: "Haritada seçilen nokta",
        };
        setDestination(dest);
        setPickingDestOnMap(false);
        setPlannerOpen(true);
        return;
      }
      if (manualMode) {
        geo.setManual(e.latlng.lat, e.latlng.lng);
        setManualMode(false);
      }
    };
    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
      container.style.cursor = "";
    };
  }, [manualMode, pickingDestOnMap, geo]);

  // Konum bilindiğinde haritada kullanıcı marker'ı + doğruluk halkası çiz
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geo.coords) return;
    const L = require("leaflet");

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    if (userAccuracyRef.current) {
      map.removeLayer(userAccuracyRef.current);
    }

    // Doğruluk halkası — gerçek hassasiyeti görsel olarak gösterir
    const accuracyMeters = geo.coords.accuracy ?? 0;
    if (accuracyMeters > 0) {
      userAccuracyRef.current = L.circle([geo.coords.lat, geo.coords.lng], {
        radius: accuracyMeters,
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 0.1,
        weight: 1,
        interactive: false,
      }).addTo(map);
    }

    const userIcon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 0 6px rgba(16,185,129,0.25);"></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    userMarkerRef.current = L.marker([geo.coords.lat, geo.coords.lng], {
      icon: userIcon,
      interactive: false,
      keyboard: false,
    }).addTo(map);

    // Halkayı tam sığdıracak zoom seviyesi
    if (accuracyMeters > 0 && userAccuracyRef.current) {
      map.fitBounds(userAccuracyRef.current.getBounds(), {
        padding: [60, 60],
        maxZoom: 16,
        animate: true,
        duration: 0.6,
      });
    } else {
      map.flyTo([geo.coords.lat, geo.coords.lng], 15, { duration: 0.6 });
    }

    // Hassasiyet düşükse uyar
    if (accuracyMeters > 500) {
      setError(
        `Konum hassasiyeti ~${Math.round(accuracyMeters)} m. GPS açık telefondan daha doğru sonuç alırsın.`
      );
    }
  }, [geo.coords]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error]);

  // Mount: hat metadata + durak-hat eşleştirme + hat-durak listesi (ghost bus)
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadRoutes(), loadStopRoutes(), loadRouteStops()])
      .then(([r, sr, rs]) => {
        if (cancelled) return;
        setRoutesData(r);
        setStopRoutes(sr);
        stopRoutesRef.current = sr;
        routeStopsRef.current = rs;
        const counts: Record<string, number> = {};
        for (const k in rs) counts[k] = rs[k].length;
        routeStopCountsRef.current = counts;
        const byId: Record<string, BusRoute> = {};
        for (const route of r) byId[route.id] = route;
        routesByIdRef.current = byId;
      })
      .catch(() => {
        // sessizce yut — bu olmadan da harita çalışır
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Mount: yolculuk planlayıcı için POI'leri yükle (paralel, async)
  useEffect(() => {
    let cancelled = false;
    // Bus stops (PlannerStop formatı)
    fetch("/data/bus-stops.json", { cache: "force-cache" })
      .then(r => r.json())
      .then(arr => {
        if (cancelled) return;
        setAllBusStops(
          arr.map((s: any) => ({
            id: String(s.id),
            name: String(s.name || ""),
            lat: Number(s.lat),
            lng: Number(s.lng),
          }))
        );
      })
      .catch(() => {});
    // Taksi (telefon dahil — ileride aramak için)
    fetch("/data/poi/taksi.json", { cache: "force-cache" })
      .then(r => r.json())
      .then(arr => {
        if (cancelled) return;
        setTaxiPois(
          arr.map((t: any) => ({
            id: String(t.id),
            name: String(t.name || "Taksi Durağı"),
            lat: Number(t.lat),
            lng: Number(t.lng),
            phone: t.phone,
            address: t.address,
          }))
        );
      })
      .catch(() => {});
    // Aranabilir POI: bus-stops + petrol + otopark + akıllı durak + kentkart + taksi + eds
    Promise.all([
      fetch("/data/bus-stops.json", { cache: "force-cache" }).then(r => r.json()),
      fetch("/data/poi/petrol.json", { cache: "force-cache" }).then(r => r.json()),
      fetch("/data/poi/otopark.json", { cache: "force-cache" }).then(r => r.json()),
      fetch("/data/poi/kentkart.json", { cache: "force-cache" }).then(r => r.json()),
      fetch("/data/poi/taksi.json", { cache: "force-cache" }).then(r => r.json()),
    ])
      .then(([buses, petrol, otopark, kentkart, taksi]) => {
        if (cancelled) return;
        const list: Array<{ id: string; name: string; lat: number; lng: number; category: string; address?: string }> = [];
        for (const s of buses)
          list.push({ id: `bs-${s.id}`, name: s.name, lat: s.lat, lng: s.lng, category: "durak" });
        for (const p of petrol)
          list.push({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, category: "petrol", address: p.address });
        for (const p of otopark)
          list.push({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, category: "otopark", address: p.address });
        for (const p of kentkart)
          list.push({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, category: "kentkart", address: p.address });
        for (const p of taksi)
          list.push({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, category: "taksi", address: p.address });
        setSearchablePois(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Eski ghost bus marker'larını ve interval'i temizler
  const clearGhostBuses = useCallback(() => {
    const map = mapRef.current;
    const ghostMap = ghostBusMarkersRef.current;
    if (map) {
      ghostMap.forEach(m => map.removeLayer(m));
    }
    ghostMap.clear();
    if (ghostBusIntervalRef.current !== null) {
      window.clearInterval(ghostBusIntervalRef.current);
      ghostBusIntervalRef.current = null;
    }
    setGhostBusCount(0);
    selectedShapeDataRef.current = null;
  }, []);

  // Mevcut shape verisi + zaman ile ghost bus marker'larını yeniden çizer
  // Marker'lar POOL'da tutulur (silinmez) → CSS transition smooth çalışır.
  const renderGhostBuses = useCallback(
    (route: BusRoute) => {
      const map = mapRef.current;
      const data = selectedShapeDataRef.current;
      if (!map || !data) return;
      const L = require("leaflet");

      const now = new Date();
      // Hat-bazında frekans (trips.txt'ten türetilmiş gerçek değer)
      const cfg = configForRoute(route.tripsByService, now);
      const allBuses: GhostBus[] = [];
      for (const s of data.shapes) {
        const cum = data.cumDists.get(s.id);
        const total = data.totalKms.get(s.id);
        if (!cum || !total) continue;
        const buses = simulateBuses(
          s.id,
          s.coords,
          cum,
          total,
          data.routeStopDists,
          now,
          cfg
        );
        allBuses.push(...buses);
      }

      const color = `#${route.color || "0e7490"}`;
      const short = (route.short || "").trim() || "?";
      const ghostMap = ghostBusMarkersRef.current;

      const buildIcon = () =>
        L.divIcon({
          className: "gebzem-ghost-bus",
          html: `<div style="
            display:flex;align-items:center;justify-content:center;
            width:30px;height:30px;border-radius:50%;
            background:white;border:3px solid ${color};
            box-shadow:0 3px 8px rgba(0,0,0,0.4);
            font-size:11px;font-weight:800;color:${color};
            font-family:system-ui,-apple-system,sans-serif;
            position:relative;
          ">
            ${esc(short)}
            <span style="
              position:absolute;inset:-3px;border-radius:50%;
              border:3px solid ${color};opacity:0.4;
              animation:gebzem-bus-pulse 1.6s ease-out infinite;
            "></span>
          </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

      const newIds = new Set<string>();

      // Stable ID ile match: aynı sefer = aynı marker → setLatLng → smooth.
      for (const b of allBuses) {
        newIds.add(b.id);
        const tooltip = `<b>${esc(route.short || "?")}</b> — yaklaşık ${Math.round(b.elapsedMin)} dk yolda<br><span style="font-size:10px;color:#94a3b8;">tahmini konum, gerçek değil</span>`;
        const existing = ghostMap.get(b.id);
        if (existing) {
          existing.setLatLng([b.lat, b.lng]);
          existing.setTooltipContent(tooltip);
        } else {
          const marker = L.marker([b.lat, b.lng], {
            icon: buildIcon(),
            interactive: true,
            zIndexOffset: 1000,
          }).addTo(map);
          marker.bindTooltip(tooltip, {
            direction: "top",
            offset: [0, -8],
            opacity: 0.95,
          });
          ghostMap.set(b.id, marker);
        }
      }

      // Aktif olmayan seferleri sil (trip tamamlandı)
      for (const [id, marker] of ghostMap) {
        if (!newIds.has(id)) {
          map.removeLayer(marker);
          ghostMap.delete(id);
        }
      }

      setGhostBusCount(allBuses.length);
    },
    []
  );

  // Hat seçildiğinde güzergah polyline'larını çiz + ghost bus simülasyonu başlat
  const handleSelectRoute = useCallback(
    async (routeId: string) => {
      const map = mapRef.current;
      if (!map) return;
      const route = routesData?.find(r => r.id === routeId);
      if (!route) return;

      setSelectedRoute(route);
      setRouteLoading(true);

      // Önceki ghost bus marker'larını temizle
      clearGhostBuses();

      try {
        const shapes = await loadRouteShapes(routeId);
        const L = require("leaflet");

        // Eski polyline'ları sil
        selectedShapesRef.current.forEach(p => map.removeLayer(p));
        selectedShapesRef.current = [];

        const color = `#${route.color || "0e7490"}`;
        const all: Array<[number, number]> = [];
        const cumDists = new Map<string, Float64Array>();
        const totalKms = new Map<string, number>();
        shapes.forEach(s => {
          if (!s.coords || s.coords.length < 2) return;
          const polyline = L.polyline(s.coords, {
            color,
            weight: 5,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round",
            interactive: false,
          }).addTo(map);
          selectedShapesRef.current.push(polyline);
          all.push(...s.coords);

          const cum = buildCumDist(s.coords);
          cumDists.set(s.id, cum);
          totalKms.set(s.id, cum[cum.length - 1]);
        });

        // Polyline'ları sığdıracak bounds
        if (all.length > 1) {
          const bounds = L.latLngBounds(all);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
        }

        // Ghost bus simülasyonu için shape verisini sakla
        const routeStopDists =
          (routeStopsRef.current && routeStopsRef.current[routeId]) || [];
        selectedShapeDataRef.current = {
          shapes,
          cumDists,
          totalKms,
          routeStopDists,
        };

        // İlk render
        renderGhostBuses(route);
        // Her 5 saniyede yeniden hesapla — CSS transition smooth kaydırır
        ghostBusIntervalRef.current = window.setInterval(() => {
          renderGhostBuses(route);
        }, 5_000);
      } catch {
        setError("Hat güzergahı yüklenemedi");
      } finally {
        setRouteLoading(false);
      }
    },
    [routesData, clearGhostBuses, renderGhostBuses]
  );

  const handleCloseRoute = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      selectedShapesRef.current.forEach(p => map.removeLayer(p));
    }
    selectedShapesRef.current = [];
    clearGhostBuses();
    setSelectedRoute(null);
  }, [clearGhostBuses]);

  // Yolculuk rotalarını haritadan temizle
  const clearJourneyLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    journeyLayersRef.current.forEach(l => map.removeLayer(l));
    journeyLayersRef.current = [];
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }
  }, []);

  // Bir yolculuk seçeneğini haritaya çiz (yürü kesik + bus polyline + destination pin)
  const drawJourneyOnMap = useCallback(
    async (option: JourneyOption) => {
      const map = mapRef.current;
      if (!map) return;
      const L = require("leaflet");
      clearJourneyLayers();

      // Önce hat polyline'ını çiz (bus segmenti)
      const busLeg = option.legs.find(l => l.type === "bus");
      if (busLeg && busLeg.type === "bus") {
        try {
          const shapes = await loadRouteShapes(busLeg.routeId);
          // En uygun shape'i seç: from/to durak hattaki dist'lerine göre
          // Basitçe ilk shape'i kullanalım (gidiş yönü)
          const shape = shapes[0];
          if (shape && shape.coords.length > 1) {
            const polyline = L.polyline(shape.coords, {
              color: `#${busLeg.routeColor || "0e7490"}`,
              weight: 5,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
              interactive: false,
            }).addTo(map);
            journeyLayersRef.current.push(polyline);
          }
        } catch {
          /* polyline yüklenemedi, devam */
        }

        // Bus from/to durak işaretleri (büyük noktalar)
        const fromIcon = L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const toIcon = L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:50%;background:#dc2626;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const fromMarker = L.marker([busLeg.fromStopLat, busLeg.fromStopLng], {
          icon: fromIcon,
          interactive: true,
        })
          .addTo(map)
          .bindTooltip(`Bin: ${busLeg.fromStopName}`, { direction: "top" });
        const toMarker = L.marker([busLeg.toStopLat, busLeg.toStopLng], {
          icon: toIcon,
          interactive: true,
        })
          .addTo(map)
          .bindTooltip(`İn: ${busLeg.toStopName}`, { direction: "top" });
        journeyLayersRef.current.push(fromMarker, toMarker);
      }

      // Yürüyüş segmentleri (kesik mavi çizgi)
      for (const leg of option.legs) {
        if (leg.type !== "walk") continue;
        const line = L.polyline(
          [
            [leg.fromLat, leg.fromLng],
            [leg.toLat, leg.toLng],
          ],
          {
            color: "#0e7490",
            weight: 4,
            opacity: 0.7,
            dashArray: "8, 8",
            interactive: false,
          }
        ).addTo(map);
        journeyLayersRef.current.push(line);
      }

      // Hedef pin
      const lastLeg = option.legs[option.legs.length - 1];
      const destLat = lastLeg.type === "walk" ? lastLeg.toLat : 0;
      const destLng = lastLeg.type === "walk" ? lastLeg.toLng : 0;
      const destIcon = L.divIcon({
        className: "",
        html: `<div style="
          display:flex;align-items:center;justify-content:center;
          width:28px;height:28px;border-radius:50%;
          background:#dc2626;border:3px solid white;
          box-shadow:0 3px 8px rgba(0,0,0,0.5);
        "><div style="width:8px;height:8px;border-radius:50%;background:white;"></div></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      destMarkerRef.current = L.marker([destLat, destLng], {
        icon: destIcon,
        interactive: false,
        zIndexOffset: 2000,
      }).addTo(map);

      // Tüm rotayı sığdır
      const all: Array<[number, number]> = [];
      for (const leg of option.legs) {
        if (leg.type === "walk") {
          all.push([leg.fromLat, leg.fromLng]);
          all.push([leg.toLat, leg.toLng]);
        } else {
          all.push([leg.fromStopLat, leg.fromStopLng]);
          all.push([leg.toStopLat, leg.toStopLng]);
        }
      }
      if (all.length > 1) {
        const bounds = L.latLngBounds(all);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      }
    },
    [clearJourneyLayers]
  );

  // Popup içinde [data-route-id] butonuna tıklama — event delegation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest("[data-route-id]") as HTMLElement | null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const routeId = btn.getAttribute("data-route-id");
      if (routeId) handleSelectRoute(routeId);
    };
    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, [handleSelectRoute]);

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

      {/* MOBILE TOP BAR — back + search */}
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
        </div>
      </div>

      {/* NEREYE? — büyük buton, üst-orta (mobilde search'ün hemen altı) */}
      <button
        type="button"
        onClick={() => setPlannerOpen(true)}
        className="absolute z-[510] flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95
          left-1/2 -translate-x-1/2
          top-[68px] lg:top-4 lg:left-[396px] lg:translate-x-0"
      >
        <Navigation className="h-4 w-4" />
        Nereye gideceksin?
      </button>

      {/* LOCATE & MANUAL BUTTONS — desktop: harita sağ üst */}
      <div className="absolute right-4 top-4 z-[500] hidden flex-col gap-2 lg:flex">
        <button
          type="button"
          onClick={handleLocateClick}
          aria-label="Konumumu göster (GPS)"
          title="Konumumu göster (GPS)"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-md transition hover:bg-muted"
          style={
            geo.coords && (geo.coords.accuracy ?? 0) > 0
              ? { backgroundColor: "#10b981", borderColor: "#10b981" }
              : {}
          }
        >
          {locating ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Locate
              className="h-5 w-5"
              style={{
                color:
                  geo.coords && (geo.coords.accuracy ?? 0) > 0
                    ? "white"
                    : undefined,
              }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={handleManualClick}
          aria-label="Konumu manuel seç"
          title="Konumu manuel seç (haritaya tıkla)"
          className="flex h-11 w-11 items-center justify-center rounded-full border shadow-md transition"
          style={{
            backgroundColor: manualMode
              ? "#0e7490"
              : geo.coords && geo.coords.accuracy === 0
                ? "#0e7490"
                : "white",
            borderColor: manualMode || (geo.coords && geo.coords.accuracy === 0)
              ? "#0e7490"
              : "var(--border, #e5e7eb)",
          }}
        >
          <Crosshair
            className="h-5 w-5"
            style={{
              color:
                manualMode || (geo.coords && geo.coords.accuracy === 0)
                  ? "white"
                  : "#0f172a",
            }}
          />
        </button>
      </div>

      {/* LOCATE & MANUAL BUTTONS — mobile: alt panelin üstünde sağda */}
      <div
        className="absolute right-4 z-[460] flex flex-col gap-2 lg:hidden"
        style={{ bottom: "calc(196px + env(safe-area-inset-bottom, 0px))" }}
      >
        <button
          type="button"
          onClick={handleManualClick}
          aria-label="Konumu manuel seç"
          className="flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition active:scale-95"
          style={{
            backgroundColor: manualMode
              ? "#0e7490"
              : geo.coords && geo.coords.accuracy === 0
                ? "#0e7490"
                : "white",
            borderColor:
              manualMode || (geo.coords && geo.coords.accuracy === 0)
                ? "#0e7490"
                : "var(--border, #e5e7eb)",
          }}
        >
          <Crosshair
            className="h-5 w-5"
            style={{
              color:
                manualMode || (geo.coords && geo.coords.accuracy === 0)
                  ? "white"
                  : "#0f172a",
            }}
          />
        </button>

        <button
          type="button"
          onClick={handleLocateClick}
          aria-label="Konumumu göster (GPS)"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-lg transition active:scale-95"
          style={
            geo.coords && (geo.coords.accuracy ?? 0) > 0
              ? { backgroundColor: "#10b981", borderColor: "#10b981" }
              : {}
          }
        >
          {locating ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Locate
              className="h-5 w-5"
              style={{
                color:
                  geo.coords && (geo.coords.accuracy ?? 0) > 0
                    ? "white"
                    : undefined,
              }}
            />
          )}
        </button>
      </div>

      {/* MANUEL MOD BANNER */}
      {manualMode && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-[600] -translate-x-1/2 lg:top-6">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-[#0e7490] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <Crosshair className="h-4 w-4" />
            <span>Konumun olacağı yere haritaya tıkla</span>
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold hover:bg-white/30"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* DESTINATION PICK BANNER */}
      {pickingDestOnMap && (
        <div className="pointer-events-none absolute left-1/2 top-32 z-[600] -translate-x-1/2 lg:top-6">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <Target className="h-4 w-4" />
            <span>Hedef noktanı haritaya tıkla</span>
            <button
              type="button"
              onClick={() => {
                setPickingDestOnMap(false);
                setPlannerOpen(true);
              }}
              className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold hover:bg-white/30"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* SEÇİLİ HAT OVERLAY */}
      {selectedRoute && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-[610] -translate-x-1/2 px-3 lg:top-6 lg:left-[400px] lg:translate-x-0">
          <div
            className="pointer-events-auto flex max-w-[92vw] items-center gap-2 rounded-2xl px-3 py-2 shadow-xl lg:max-w-[640px]"
            style={{
              backgroundColor: `#${selectedRoute.color || "0e7490"}`,
            }}
          >
            <div className="flex h-7 w-auto min-w-7 items-center justify-center rounded-lg bg-white/25 px-2 text-xs font-extrabold text-white">
              {selectedRoute.short || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white leading-tight">
                {selectedRoute.long || "Hat"}
              </p>
              {ghostBusCount > 0 && (
                <p className="truncate text-[10px] font-medium text-white/80 leading-tight">
                  ~{ghostBusCount} otobüs yolda · tahmini
                </p>
              )}
              {ghostBusCount === 0 && !routeLoading && (
                <p className="truncate text-[10px] font-medium text-white/80 leading-tight">
                  şu an aktif sefer yok
                </p>
              )}
            </div>
            {routeLoading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white" />
            )}
            <button
              type="button"
              onClick={handleCloseRoute}
              aria-label="Hattı kapat"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 text-white transition hover:bg-white/40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}


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
        <div className="absolute bottom-44 left-1/2 z-[600] -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {error}
        </div>
      )}

      {/* MOBILE BOTTOM PANEL — kategori kartları + POI bilgi kartları */}
      <MobileBottomPanel
        active={active}
        setActive={setActive}
        filtered={filtered}
        loading={loading}
        focusPoi={focusPoi}
      />

      {/* YOLCULUK PLANLAYICI */}
      <JourneyPlannerSheet
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        origin={
          geo.coords
            ? { lat: geo.coords.lat, lng: geo.coords.lng, label: "Konumum" }
            : null
        }
        destination={destination}
        setDestination={setDestination}
        onPickFromMap={() => {
          setPlannerOpen(false);
          setPickingDestOnMap(true);
        }}
        onSelectOption={opt => {
          drawJourneyOnMap(opt);
        }}
        stops={allBusStops}
        stopRoutes={stopRoutes}
        routesById={routesByIdRef.current}
        routeStopCounts={routeStopCountsRef.current}
        taxis={taxiPois}
        searchablePois={searchablePois}
      />
    </div>
  );
}

interface MobileBottomPanelProps {
  active: CategoryKey;
  setActive: (k: CategoryKey) => void;
  filtered: POI[];
  loading: boolean;
  focusPoi: (poi: POI) => void;
}

function MobileBottomPanel({
  active,
  setActive,
  filtered,
  loading,
  focusPoi,
}: MobileBottomPanelProps) {
  const stop = (e: React.TouchEvent | React.PointerEvent) => e.stopPropagation();
  const visibleCards = filtered.slice(0, 50);

  return (
    <div
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-[450] flex flex-col gap-2 px-3 pb-3 lg:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
    >
      {/* Üst sıra: 80×80 kategori kartları, sol-sağ scroll */}
      <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICON[cat.key];
            const isActive = cat.key === active;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActive(cat.key)}
                className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border bg-white shadow-md transition"
                style={{
                  backgroundColor: isActive ? cat.color : "white",
                  color: isActive ? "white" : "#0f172a",
                  borderColor: isActive ? cat.color : "#e5e7eb",
                }}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-semibold leading-tight text-center px-1">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alt sıra: POI bilgi kartları, sol-sağ scroll */}
      <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {loading && (
            <div className="flex h-20 w-72 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border bg-white text-sm text-muted-foreground shadow-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              Yükleniyor...
            </div>
          )}
          {!loading && visibleCards.length === 0 && (
            <div className="flex h-20 w-72 shrink-0 items-center justify-center rounded-2xl border border-border bg-white text-sm text-muted-foreground shadow-md">
              Sonuç yok
            </div>
          )}
          {!loading &&
            visibleCards.map(poi => {
              const cat = CATEGORY_BY_KEY[poi.category];
              return (
                <button
                  key={poi.id}
                  type="button"
                  onClick={() => focusPoi(poi)}
                  className="flex w-72 shrink-0 items-center gap-3 rounded-2xl border border-border bg-white p-3 text-left shadow-md active:scale-[0.98] transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold leading-tight text-slate-900">
                      {poi.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {poi.distanceKm != null && (
                        <span
                          className="shrink-0 text-xs font-bold"
                          style={{ color: cat.color }}
                        >
                          {formatDistance(poi.distanceKm)}
                        </span>
                      )}
                      <span className="truncate text-xs text-slate-500">
                        {poi.address || cat.label}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Navigation className="h-4 w-4 text-white" />
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
