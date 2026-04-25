"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Locate, MapPin, Search, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Kocaeli yaklaşık merkez (Kocaeli geneli durakları kapsayan zoom için)
const KOCAELI_CENTER = { lat: 40.7654, lng: 29.9408 };

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function BusStopsPageClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterRef = useRef<any>(null);
  const markerByIdRef = useRef<Map<string, LeafletMarker>>(new Map());
  const userMarkerRef = useRef<LeafletMarker | null>(null);

  const [stops, setStops] = useState<BusStop[]>([]);
  const [loadingStops, setLoadingStops] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 1) JSON'ı public'ten fetch et — tarayıcı cache'i kullanır
  useEffect(() => {
    let cancelled = false;
    fetch("/data/bus-stops.json", { cache: "force-cache" })
      .then(r => {
        if (!r.ok) throw new Error("404");
        return r.json();
      })
      .then((data: BusStop[]) => {
        if (cancelled) return;
        setStops(data);
        setLoadingStops(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Durak verisi yüklenemedi");
        setLoadingStops(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Stops geldiğinde Leaflet'i yükle, haritayı kur, marker cluster'a duraklarını ekle
  useEffect(() => {
    if (!containerRef.current || stops.length === 0 || mapRef.current) return;

    const L = require("leaflet");
    require("leaflet.markercluster");

    // Default marker icon fix (Next.js webpack asset path)
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    const map: LeafletMap = L.map(containerRef.current, {
      center: [KOCAELI_CENTER.lat, KOCAELI_CENTER.lng],
      zoom: 11,
      zoomControl: false,
    });
    mapRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıda bulunanlar',
      maxZoom: 19,
    }).addTo(map);

    const cluster = (L as any).markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 100,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
    });
    clusterRef.current = cluster;

    const stopIcon = L.divIcon({
      className: "",
      html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:#0ea5e9;border:2px solid white;
        box-shadow:0 1px 3px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const markerById = markerByIdRef.current;
    stops.forEach(s => {
      const m: LeafletMarker = L.marker([s.lat, s.lng], { icon: stopIcon })
        .bindPopup(
          `
          <div style="font-family:system-ui,sans-serif;padding:2px;min-width:180px;">
            <p style="font-size:13px;font-weight:700;margin:0 0 4px;line-height:1.3;color:#0f172a;">${esc(s.name)}</p>
            <p style="font-size:11px;color:#64748b;margin:0;">Durak no: ${esc(s.id)}</p>
          </div>
        `,
          { maxWidth: 240 }
        );
      markerById.set(s.id, m);
      cluster.addLayer(m);
    });

    map.addLayer(cluster);

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markerByIdRef.current.clear();
      userMarkerRef.current = null;
    };
  }, [stops]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (q.length < 2) return [];
    return stops
      .filter(
        s =>
          s.name.toLocaleLowerCase("tr").includes(q) || s.id.includes(q)
      )
      .slice(0, 25);
  }, [query, stops]);

  function focusStop(s: BusStop) {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    const marker = markerByIdRef.current.get(s.id);
    if (!map || !cluster || !marker) return;
    cluster.zoomToShowLayer(marker, () => marker.openPopup());
    setQuery("");
  }

  function locateMe() {
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
          html: `<div style="
            width:16px;height:16px;border-radius:50%;
            background:#10b981;border:3px solid white;
            box-shadow:0 0 0 4px rgba(16,185,129,0.25);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(
          map
        );
        map.flyTo([lat, lng], 16, { duration: 0.6 });
      },
      () => setError("Konum alınamadı"),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }

  // Hata mesajını otomatik kaybet
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <div
      className="fixed inset-x-0 top-0 z-10 bg-card"
      style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* Üst bar: geri + arama + konumum */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3">
        <div className="pointer-events-auto mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              aria-label="Geri"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="relative flex-1">
              <div className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 shadow-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Durak ara: ad veya numara"
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

              {filtered.length > 0 && (
                <div className="absolute inset-x-0 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
                  {filtered.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => focusStop(s)}
                      className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted last:border-b-0"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Durak no: {s.id}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={locateMe}
              aria-label="Konumum"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-md"
            >
              <Locate className="h-5 w-5 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Yükleniyor overlay'i */}
      {loadingStops && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-md">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            <span className="text-sm">Duraklar yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Hata toast */}
      {error && (
        <div className="absolute bottom-6 left-1/2 z-[600] -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {error}
        </div>
      )}

      {/* Sayaç badge */}
      {!loadingStops && stops.length > 0 && (
        <div className="absolute bottom-6 left-4 z-[500] rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-md">
          {stops.length.toLocaleString("tr-TR")} durak
        </div>
      )}
    </div>
  );
}
