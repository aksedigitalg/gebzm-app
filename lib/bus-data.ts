// Otobüs verisi client-side fetch + cache helper'ları.
// Tüm fetch'ler force-cache; kullanıcı kez içinde stop-routes 1 kez yüklenir.

export interface BusRoute {
  id: string;
  short: string;
  long: string;
  color: string;
  textColor: string;
  desc: string;
}

export interface StopRouteRef {
  id: string;
  short: string;
  color: string;
  headsign: string;
  dist?: number; // km — hattın başından bu durağa
  total?: number; // km — hattın toplam uzunluğu
  before?: number; // başlangıçla bu durak arasındaki durak sayısı
}

export interface RouteShape {
  id: string;
  direction: string;
  headsign: string;
  coords: Array<[number, number]>; // [lat, lng]
}

let routesCache: BusRoute[] | null = null;
let routesPromise: Promise<BusRoute[]> | null = null;

let stopRoutesCache: Record<string, StopRouteRef[]> | null = null;
let stopRoutesPromise: Promise<Record<string, StopRouteRef[]>> | null = null;

let routeStopsCache: Record<string, number[]> | null = null;
let routeStopsPromise: Promise<Record<string, number[]>> | null = null;

const shapeCache = new Map<string, RouteShape[]>();

export async function loadRoutes(): Promise<BusRoute[]> {
  if (routesCache) return routesCache;
  if (routesPromise) return routesPromise;
  routesPromise = (async () => {
    const res = await fetch("/data/bus/routes.json", { cache: "force-cache" });
    if (!res.ok) throw new Error("routes.json fetch failed");
    const data = (await res.json()) as BusRoute[];
    routesCache = data;
    return data;
  })();
  return routesPromise;
}

export async function loadStopRoutes(): Promise<Record<string, StopRouteRef[]>> {
  if (stopRoutesCache) return stopRoutesCache;
  if (stopRoutesPromise) return stopRoutesPromise;
  stopRoutesPromise = (async () => {
    const res = await fetch("/data/bus/stop-routes.json", {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("stop-routes.json fetch failed");
    const data = (await res.json()) as Record<string, StopRouteRef[]>;
    stopRoutesCache = data;
    return data;
  })();
  return stopRoutesPromise;
}

export async function loadRouteStops(): Promise<Record<string, number[]>> {
  if (routeStopsCache) return routeStopsCache;
  if (routeStopsPromise) return routeStopsPromise;
  routeStopsPromise = (async () => {
    const res = await fetch("/data/bus/route-stops.json", {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("route-stops.json fetch failed");
    const data = (await res.json()) as Record<string, number[]>;
    routeStopsCache = data;
    return data;
  })();
  return routeStopsPromise;
}

export async function loadRouteShapes(routeId: string): Promise<RouteShape[]> {
  const cached = shapeCache.get(routeId);
  if (cached) return cached;
  const res = await fetch(`/data/bus/route-shapes/${routeId}.json`, {
    cache: "force-cache",
  });
  if (!res.ok) throw new Error(`route-shapes/${routeId}.json fetch failed`);
  const data = (await res.json()) as RouteShape[];
  shapeCache.set(routeId, data);
  return data;
}

// Route metadata cache by id (after loadRoutes)
let routesByIdCache: Map<string, BusRoute> | null = null;
export function getRouteById(id: string): BusRoute | undefined {
  if (!routesByIdCache && routesCache) {
    routesByIdCache = new Map(routesCache.map(r => [r.id, r]));
  }
  return routesByIdCache?.get(id);
}

// Hex color → CSS rgb. "1ea9bd" → "#1ea9bd"
export function hexToCss(hex: string | undefined): string {
  if (!hex) return "#0e7490";
  const h = hex.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return "#0e7490";
  return `#${h}`;
}
