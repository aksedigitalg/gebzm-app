// Toplu taşıma yolculuk planlayıcı.
//
// Algoritma (MVP — doğrudan hat, transfer yok):
//   1. Origin'in 500m yakınındaki durakları bul
//   2. Destination'ın 500m yakınındaki durakları bul
//   3. Her (origin_stop, dest_stop) çifti için:
//      - Ortak hat var mı? (stop-routes.json'dan)
//      - Yön doğru mu? (origin_stop hattın başına daha yakın olmalı)
//   4. Her seçenek için süre hesapla:
//      - Yürüyüş1 (origin → o_stop) = mesafe / 5 km/h * 60
//      - Bekleme = computeETA(o_stop, route, now)
//      - Yolculuk = travelTime(d_stop) - travelTime(o_stop)
//      - Yürüyüş2 (d_stop → destination)
//   5. Toplam süreye göre sırala, en iyi 3'ü döndür

import { haversineKm, formatDistance } from "./geolocation";
import {
  computeETA,
  configForRoute,
  travelTimeMin,
  type ETAConfig,
} from "./bus-eta";
import type { BusRoute, StopRouteRef } from "./bus-data";

const WALK_SPEED_KMH = 5; // ortalama yürüyüş hızı
const MAX_WALK_KM = 0.6; // başlangıç/bitiş için max yürünebilir mesafe (600 m)
const MAX_CANDIDATES = 8; // her uçta en yakın N durağı kontrol et

export interface PlannerStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface JourneyOriginInput {
  lat: number;
  lng: number;
  label?: string;
}

export interface WalkLeg {
  type: "walk";
  fromLabel?: string;
  toLabel?: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  distanceKm: number;
  durationMin: number;
}

export interface BusLeg {
  type: "bus";
  routeId: string;
  routeShort: string;
  routeLong: string;
  routeColor: string;
  routeHeadsign?: string;
  fromStopId: string;
  fromStopName: string;
  fromStopLat: number;
  fromStopLng: number;
  toStopId: string;
  toStopName: string;
  toStopLat: number;
  toStopLng: number;
  distanceKm: number;
  travelMin: number;
  waitMin: number;
  // ETA mevcut durumu — "kapalı" / "şimdi" / "~5 dk"
  etaText: string;
}

export type JourneyLeg = WalkLeg | BusLeg;

export interface JourneyOption {
  legs: JourneyLeg[];
  totalMin: number;
  walkMeters: number;
  busDistanceKm: number;
  // Bu seçeneğin "şimdi başla" varış zamanı (HH:MM)
  arrivalHHMM: string;
}

/**
 * En iyi 3 toplu taşıma yolculuğunu hesaplar.
 *
 * @param origin           Başlangıç noktası
 * @param destination      Hedef
 * @param stops            Tüm duraklar (id, name, lat, lng)
 * @param stopRoutes       stop-routes.json içeriği
 * @param routesById       routes.json'dan id → BusRoute lookup
 * @param routeStopCounts  Her hat için toplam durak sayısı
 * @param now              Şu an
 */
export function planJourneys(
  origin: JourneyOriginInput,
  destination: JourneyOriginInput,
  stops: PlannerStop[],
  stopRoutes: Record<string, StopRouteRef[]>,
  routesById: Record<string, BusRoute>,
  routeStopCounts: Record<string, number>,
  now: Date = new Date()
): JourneyOption[] {
  const originCands = nearestStopsWithin(stops, origin, MAX_CANDIDATES);
  const destCands = nearestStopsWithin(stops, destination, MAX_CANDIDATES);

  if (originCands.length === 0 || destCands.length === 0) return [];

  // routeId → { originStop, dist, before }
  // Her hat için origin'e en yakın durağı tut
  type RouteOriginEntry = {
    stop: PlannerStop;
    walkKm: number;
    routeRef: StopRouteRef;
  };
  const originRouteMap = new Map<string, RouteOriginEntry>();

  for (const o of originCands) {
    const refs = stopRoutes[o.stop.id];
    if (!refs) continue;
    for (const r of refs) {
      const existing = originRouteMap.get(r.id);
      if (!existing || o.distKm < existing.walkKm) {
        originRouteMap.set(r.id, { stop: o.stop, walkKm: o.distKm, routeRef: r });
      }
    }
  }

  // Aynısını destination için
  type RouteDestEntry = {
    stop: PlannerStop;
    walkKm: number;
    routeRef: StopRouteRef;
  };
  const destRouteMap = new Map<string, RouteDestEntry>();

  for (const d of destCands) {
    const refs = stopRoutes[d.stop.id];
    if (!refs) continue;
    for (const r of refs) {
      const existing = destRouteMap.get(r.id);
      if (!existing || d.distKm < existing.walkKm) {
        destRouteMap.set(r.id, { stop: d.stop, walkKm: d.distKm, routeRef: r });
      }
    }
  }

  // Ortak hatlar = doğrudan rota olanlar
  const options: JourneyOption[] = [];
  for (const [routeId, oEntry] of originRouteMap) {
    const dEntry = destRouteMap.get(routeId);
    if (!dEntry) continue;
    if (oEntry.stop.id === dEntry.stop.id) continue; // aynı durak, mantıksız

    // Yön kontrolü — origin durağı destination durağından önce olmalı
    const oDist = oEntry.routeRef.dist;
    const dDist = dEntry.routeRef.dist;
    if (typeof oDist !== "number" || typeof dDist !== "number") continue;
    if (oDist >= dDist) continue; // ters yön

    const route = routesById[routeId];
    if (!route) continue;

    // Süreleri hesapla
    const cfg = configForRoute(route.tripsByService, now);
    const totalKm = oEntry.routeRef.total ?? 0;
    const totalStops = routeStopCounts[routeId] ?? 0;

    const walkMin1 = (oEntry.walkKm / WALK_SPEED_KMH) * 60;
    const walkMin2 = (dEntry.walkKm / WALK_SPEED_KMH) * 60;

    // ETA at origin stop
    const eta = computeETA(
      oDist,
      totalKm,
      oEntry.routeRef.before,
      totalStops,
      now,
      cfg
    );
    if (eta.state === "closed" || eta.waitMin === null) continue;

    // Bus travel time = travelTime(dest) - travelTime(origin)
    const oTravelMin = travelTimeMin(
      oDist,
      oEntry.routeRef.before ?? 0,
      cfg
    );
    const dTravelMin = travelTimeMin(
      dDist,
      dEntry.routeRef.before ?? oEntry.routeRef.before ?? 0,
      cfg
    );
    const busTravelMin = Math.max(0, dTravelMin - oTravelMin);

    // Toplam yolculuk süresi: yürü + bekle + yolda + yürü
    const totalMin = walkMin1 + eta.waitMin + busTravelMin + walkMin2;

    // Tahmini varış saati
    const arrivalDate = new Date(now.getTime() + totalMin * 60_000);
    const arrivalHHMM = `${String(arrivalDate.getHours()).padStart(2, "0")}:${String(arrivalDate.getMinutes()).padStart(2, "0")}`;

    const distBus = Math.max(0, dDist - oDist);

    const legs: JourneyLeg[] = [
      {
        type: "walk",
        fromLabel: origin.label ?? "Başlangıç",
        toLabel: oEntry.stop.name,
        fromLat: origin.lat,
        fromLng: origin.lng,
        toLat: oEntry.stop.lat,
        toLng: oEntry.stop.lng,
        distanceKm: oEntry.walkKm,
        durationMin: walkMin1,
      },
      {
        type: "bus",
        routeId: route.id,
        routeShort: route.short,
        routeLong: route.long,
        routeColor: route.color,
        routeHeadsign: oEntry.routeRef.headsign,
        fromStopId: oEntry.stop.id,
        fromStopName: oEntry.stop.name,
        fromStopLat: oEntry.stop.lat,
        fromStopLng: oEntry.stop.lng,
        toStopId: dEntry.stop.id,
        toStopName: dEntry.stop.name,
        toStopLat: dEntry.stop.lat,
        toStopLng: dEntry.stop.lng,
        distanceKm: distBus,
        travelMin: busTravelMin,
        waitMin: eta.waitMin,
        etaText: eta.text,
      },
      {
        type: "walk",
        fromLabel: dEntry.stop.name,
        toLabel: destination.label ?? "Hedef",
        fromLat: dEntry.stop.lat,
        fromLng: dEntry.stop.lng,
        toLat: destination.lat,
        toLng: destination.lng,
        distanceKm: dEntry.walkKm,
        durationMin: walkMin2,
      },
    ];

    options.push({
      legs,
      totalMin,
      walkMeters: Math.round((oEntry.walkKm + dEntry.walkKm) * 1000),
      busDistanceKm: distBus,
      arrivalHHMM,
    });
  }

  // En iyi 3'ü döndür (toplam süreye göre)
  return options.sort((a, b) => a.totalMin - b.totalMin).slice(0, 3);
}

// Bir noktaya en yakın N durak (MAX_WALK_KM içinde)
function nearestStopsWithin(
  stops: PlannerStop[],
  point: { lat: number; lng: number },
  limit: number
): Array<{ stop: PlannerStop; distKm: number }> {
  const list: Array<{ stop: PlannerStop; distKm: number }> = [];
  for (const s of stops) {
    const d = haversineKm(point, s);
    if (d > MAX_WALK_KM) continue;
    list.push({ stop: s, distKm: d });
  }
  list.sort((a, b) => a.distKm - b.distKm);
  return list.slice(0, limit);
}

/**
 * Hedefin yakınında otobüs durağı yoksa veya seçenek bulunamazsa,
 * en yakın taksi durağını alternatif olarak öner.
 */
export function findNearestTaxi(
  point: { lat: number; lng: number },
  taxis: Array<{ id: string; name: string; lat: number; lng: number; phone?: string; address?: string }>
): { stop: { id: string; name: string; lat: number; lng: number; phone?: string; address?: string }; distKm: number } | null {
  let best: { stop: any; distKm: number } | null = null;
  for (const t of taxis) {
    const d = haversineKm(point, t);
    if (!best || d < best.distKm) best = { stop: t, distKm: d };
  }
  return best;
}

// UI yardımcıları
export function legSummary(leg: JourneyLeg): string {
  if (leg.type === "walk") {
    return `🚶 ${formatDistance(leg.distanceKm)} · ${Math.round(leg.durationMin)} dk`;
  }
  return `🚌 ${leg.routeShort} · ${Math.round(leg.travelMin)} dk yolda`;
}

export function formatTotalMin(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm > 0 ? `${h}sa ${mm}dk` : `${h}sa`;
}
