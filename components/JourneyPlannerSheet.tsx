"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bus,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Footprints,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Search,
  Target,
  X,
} from "lucide-react";
import {
  type JourneyOption,
  type JourneyOriginInput,
  type PlannerStop,
  type WalkLeg,
  type BusLeg,
  planJourneys,
  formatTotalMin,
  findNearestTaxi,
} from "@/lib/journey-planner";
import { formatDistance } from "@/lib/geolocation";
import type { BusRoute, StopRouteRef } from "@/lib/bus-data";
import { photonSearch, type PhotonResult } from "@/lib/photon";
import { osrmFoot, formatMeters, type OsrmRoute } from "@/lib/osrm";
import { safeHexColor } from "@/lib/security";

interface TaxiPoi {
  id: string;
  name: string;
  lat: number;
  lng: number;
  phone?: string;
  address?: string;
}

interface SearchablePoi {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  address?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  origin: JourneyOriginInput | null;
  destination: JourneyOriginInput | null;
  setDestination: (d: JourneyOriginInput | null) => void;
  // Kullanıcı "haritadan seç" tıklayınca parent manuel mod açar
  onPickFromMap: () => void;
  // Bir seçenek seçilince parent harita üstünde rotayı çizer
  onSelectOption: (option: JourneyOption) => void;
  // Veri
  stops: PlannerStop[];
  stopRoutes: Record<string, StopRouteRef[]> | null;
  routesById: Record<string, BusRoute> | null;
  routeStopCounts: Record<string, number> | null;
  taxis: TaxiPoi[];
  // POI arama veri kaynağı (bus-stops + diğer kategoriler birleşik)
  searchablePois: SearchablePoi[];
}

export function JourneyPlannerSheet({
  open,
  onClose,
  origin,
  destination,
  setDestination,
  onPickFromMap,
  onSelectOption,
  stops,
  stopRoutes,
  routesById,
  routeStopCounts,
  taxis,
  searchablePois,
}: Props) {
  const [query, setQuery] = useState("");
  const [computing, setComputing] = useState(false);
  const [options, setOptions] = useState<JourneyOption[]>([]);
  const [computed, setComputed] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [taxiAlt, setTaxiAlt] = useState<{
    stop: TaxiPoi;
    distKm: number;
  } | null>(null);
  const [addresses, setAddresses] = useState<PhotonResult[]>([]);
  const [geocoding, setGeocoding] = useState(false);

  // Sheet kapandığında state sıfırla
  useEffect(() => {
    if (!open) {
      setQuery("");
      setOptions([]);
      setComputed(false);
      setExpandedIdx(null);
      setTaxiAlt(null);
      setAddresses([]);
      setGeocoding(false);
    }
  }, [open]);

  // Photon ile autocomplete — debounce 300ms, 2+ karakter
  // Politika: fair use, memory cache + interval — sürekli istek atılmaz
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setAddresses([]);
      setGeocoding(false);
      return;
    }
    let cancelled = false;
    setGeocoding(true);
    const timer = setTimeout(async () => {
      const near =
        origin && origin.lat && origin.lng
          ? { lat: origin.lat, lng: origin.lng }
          : null;
      const results = await photonSearch(q, near);
      if (!cancelled) {
        setAddresses(results);
        setGeocoding(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, origin]);

  const matches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (q.length < 2) return [] as SearchablePoi[];
    return searchablePois
      .filter(p => p.name.toLocaleLowerCase("tr").includes(q))
      .slice(0, 12);
  }, [query, searchablePois]);

  const compute = (dest: JourneyOriginInput) => {
    if (!origin || !stopRoutes || !routesById || !routeStopCounts) return;
    setComputing(true);
    setComputed(false);
    setOptions([]);
    setTaxiAlt(null);
    // Hesap CPU bound (8K durak × N çift) — UI yanıt versin diye microtask'a it
    setTimeout(() => {
      const opts = planJourneys(
        origin,
        dest,
        stops,
        stopRoutes,
        routesById,
        routeStopCounts
      );
      setOptions(opts);
      setComputed(true);
      setComputing(false);
      // Hep taksi alternatifi öner
      const tx = findNearestTaxi(dest, taxis);
      if (tx) setTaxiAlt(tx);
    }, 30);
  };

  const handlePickPoi = (poi: SearchablePoi) => {
    const d: JourneyOriginInput = {
      lat: poi.lat,
      lng: poi.lng,
      label: poi.name,
    };
    setDestination(d);
    setQuery("");
    compute(d);
  };

  const handlePickAddress = (addr: PhotonResult) => {
    const d: JourneyOriginInput = {
      lat: addr.lat,
      lng: addr.lng,
      label: addr.name,
    };
    setDestination(d);
    setQuery("");
    setAddresses([]);
    compute(d);
  };

  // Destination set edildikten sonra hesabı tetikle (örn haritadan tıklayınca)
  useEffect(() => {
    if (open && destination && !computed && !computing) {
      compute(destination);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/45 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Navigation className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-bold">Nereye gideceksin?</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Origin */}
          <div className="border-b border-border px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              NEREDEN
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {origin
                ? origin.label || `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}`
                : "Önce konumunu paylaşman lazım"}
            </p>
            {!origin && (
              <p className="mt-1 text-xs text-muted-foreground">
                Sheet'i kapat, haritada konum (📍) ya da manuel (✛) butonuna bas.
              </p>
            )}
          </div>

          {/* Destination input */}
          <div className="border-b border-border px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-rose-600" />
              NEREYE
            </div>
            {destination && computed ? (
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {destination.label || "Seçili nokta"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDestination(null);
                    setOptions([]);
                    setComputed(false);
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Değiştir
                </button>
              </div>
            ) : (
              <>
                <div className="mt-2 flex h-10 items-center gap-2 rounded-full border border-border bg-muted px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Yer ara (eczane, durak, park...)"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onPickFromMap();
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  <Crosshair className="h-3.5 w-3.5" />
                  Haritadan seç
                </button>
                {/* POI sonuçları (kayıtlı yerler) */}
                {matches.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Kayıtlı Yerler
                    </p>
                    <div className="max-h-44 overflow-y-auto rounded-2xl border border-border">
                      {matches.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlePickPoi(p)}
                          className="flex w-full items-start gap-2 border-b border-border px-3 py-2 text-left transition hover:bg-muted last:border-b-0"
                        >
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{p.name}</p>
                            {p.address && (
                              <p className="truncate text-xs text-muted-foreground">
                                {p.address}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adres sonuçları — kullanıcı yazdıkça otomatik (Photon) */}
                {addresses.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Adresler {geocoding && "(yükleniyor...)"}
                    </p>
                    <div className="max-h-56 overflow-y-auto rounded-2xl border border-border">
                      {addresses.map((a, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handlePickAddress(a)}
                          className="flex w-full items-start gap-2 border-b border-border px-3 py-2 text-left transition hover:bg-muted last:border-b-0"
                        >
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{a.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {a.fullAddress}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yükleniyor göstergesi (henüz sonuç yokken) */}
                {geocoding && addresses.length === 0 && matches.length === 0 && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 px-2 py-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Aranıyor...
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sonuçlar */}
          {computing && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Yolculuk hesaplanıyor...
            </div>
          )}

          {computed && !computing && options.length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-muted-foreground">
              <p className="mb-2 font-semibold">Doğrudan otobüs hattı bulunamadı</p>
              <p className="text-xs">
                Hedef ya da başlangıç noktası 600 m yarıçapında otobüs durağı yok.
              </p>
            </div>
          )}

          {computed && options.length > 0 && (
            <div className="border-b border-border">
              <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Önerilen Yolculuk
              </div>
              {options.map((opt, i) => (
                <JourneyOptionCard
                  key={i}
                  option={opt}
                  expanded={expandedIdx === i}
                  onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  onShowOnMap={() => {
                    onSelectOption(opt);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}

          {/* Taksi alternatifi */}
          {computed && taxiAlt && (
            <div className="px-5 py-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Taksi Alternatifi
              </div>
              <div className="rounded-2xl border border-border bg-card p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-md bg-yellow-100 px-1.5 py-0.5 text-[10px] font-bold text-yellow-800">
                    🚖 TAKSİ
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistance(taxiAlt.distKm)} uzaklıkta
                  </span>
                </div>
                <p className="text-sm font-semibold">{taxiAlt.stop.name}</p>
                {taxiAlt.stop.address && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {taxiAlt.stop.address}
                  </p>
                )}
                {taxiAlt.stop.phone && (
                  <a
                    href={`tel:${taxiAlt.stop.phone.replace(/[^+\d]/g, "")}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    <Phone className="h-3 w-3" />
                    {taxiAlt.stop.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JourneyOptionCard({
  option,
  expanded,
  onToggle,
  onShowOnMap,
}: {
  option: JourneyOption;
  expanded: boolean;
  onToggle: () => void;
  onShowOnMap: () => void;
}) {
  const busLeg = option.legs.find(l => l.type === "bus") as BusLeg | undefined;
  const isWalkOnly = !busLeg;
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-muted"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">
              {formatTotalMin(option.totalMin)}
            </span>
            {busLeg && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: `#${safeHexColor(busLeg.routeColor)}`}}
              >
                {busLeg.routeShort}
              </span>
            )}
            {isWalkOnly && (
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                YÜRÜYÜŞ
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              {option.arrivalHHMM}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-0.5">
              <Footprints className="h-3 w-3" />
              {Math.round(option.walkMeters)} m
            </span>
            {busLeg && (
              <>
                <ArrowRight className="h-3 w-3" />
                <span className="inline-flex items-center gap-0.5">
                  <Bus className="h-3 w-3" />
                  {Math.round(busLeg.travelMin)} dk
                </span>
              </>
            )}
          </div>
          {busLeg && (
            <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">
              {busLeg.etaText} bekle · {busLeg.routeHeadsign || busLeg.routeLong}
            </p>
          )}
          {isWalkOnly && (
            <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">
              Otobüse gerek yok — direkt yürüyebilirsin
            </p>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="bg-muted/30 px-5 py-3">
          <ol className="space-y-2.5">
            {option.legs.map((leg, i) => (
              <LegRow key={i} leg={leg} index={i + 1} />
            ))}
          </ol>
          <button
            type="button"
            onClick={onShowOnMap}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Haritada Göster
          </button>
        </div>
      )}
    </div>
  );
}

function LegRow({ leg, index }: { leg: WalkLeg | BusLeg; index: number }) {
  if (leg.type === "walk") return <WalkLegRow leg={leg} />;
  return <BusLegRow leg={leg} />;
}

function WalkLegRow({ leg }: { leg: WalkLeg }) {
  const [details, setDetails] = useState<OsrmRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchDetails = async () => {
    if (loading || details) return;
    setLoading(true);
    setError(false);
    const r = await osrmFoot(
      { lat: leg.fromLat, lng: leg.fromLng },
      { lat: leg.toLat, lng: leg.toLng }
    );
    setLoading(false);
    if (r && r.steps.length > 0) {
      setDetails(r);
    } else {
      setError(true);
    }
  };

  return (
    <li className="flex gap-2.5">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs">
        <Footprints className="h-3 w-3 text-slate-700" />
      </div>
      <div className="flex-1 text-xs leading-relaxed">
        <p className="font-semibold">
          {Math.round(leg.durationMin)} dk yürü ·{" "}
          <span className="text-muted-foreground">
            {formatDistance(leg.distanceKm)}
          </span>
        </p>
        <p className="text-muted-foreground">
          {leg.fromLabel} → {leg.toLabel}
        </p>
        {details ? (
          <ol className="mt-1.5 space-y-1 rounded-lg bg-white/60 px-2 py-1.5 text-[11px] dark:bg-black/20">
            {details.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="font-bold text-primary">{i + 1}.</span>
                <span className="flex-1">
                  <span>{s.instruction}</span>
                  {s.distanceM > 0 && (
                    <span className="ml-1 text-muted-foreground">
                      ({formatMeters(s.distanceM)})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <button
            type="button"
            onClick={fetchDetails}
            disabled={loading}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Tarif yükleniyor...
              </>
            ) : error ? (
              "Tarif alınamadı, tekrar dene"
            ) : (
              "Adım adım yön tarifi"
            )}
          </button>
        )}
      </div>
    </li>
  );
}

function BusLegRow({ leg }: { leg: BusLeg }) {
  return (
    <li className="flex gap-2.5">
      <div
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold text-white"
        style={{ backgroundColor: `#${safeHexColor(leg.routeColor)}` }}
      >
        {leg.routeShort}
      </div>
      <div className="flex-1 text-xs leading-relaxed">
        <p className="font-semibold">
          {leg.routeShort} hattı · {Math.round(leg.travelMin)} dk yolda
        </p>
        <p className="text-muted-foreground">
          {leg.fromStopName} → {leg.toStopName}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {leg.etaText} bekle ·{" "}
          {leg.routeHeadsign || leg.routeLong || "Hat yönü"}
        </p>
      </div>
    </li>
  );
}
