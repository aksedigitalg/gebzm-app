// Konum (geolocation) yardımcıları — saf TypeScript, React'siz.
// Haversine mesafe, formatlama, tipler.

export interface Coords {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export type GeoStatus =
  | "idle"
  | "requesting"
  | "watching"
  | "success"
  | "error"
  | "unsupported";

export type GeoErrorCode =
  | "permission_denied"
  | "position_unavailable"
  | "timeout"
  | "unsupported"
  | "no_consent"
  | "unknown";

export interface GeoError {
  code: GeoErrorCode;
  message: string;
}

// Haversine formülü — iki nokta arası "yer çizgisi" mesafesi (km)
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371; // dünya yarıçapı (km)
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// "1.2 km" / "320 m"
export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "";
  if (km < 1) {
    const m = Math.round(km * 1000);
    return `${m} m`;
  }
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

// Konum cache anahtarları
export const GEO_CACHE_KEY = "gebzem_geo_cache";
export const GEO_CACHE_TTL_MS = 30 * 60 * 1000; // 30 dk

// Cache'den oku — TTL geçmişse null
export function readGeoCache(): Coords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Coords;
    if (
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number" ||
      typeof parsed.timestamp !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.timestamp > GEO_CACHE_TTL_MS) {
      localStorage.removeItem(GEO_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeGeoCache(coords: Coords): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(coords));
  } catch {
    // sessizce yut — private mod, vs.
  }
}

export function clearGeoCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GEO_CACHE_KEY);
}

// Browser GeolocationPositionError'u kendi tipimize çevirir
export function mapPositionError(err: GeolocationPositionError): GeoError {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return {
        code: "permission_denied",
        message: "Konum izni reddedildi. Tarayıcı ayarlarından açabilirsin.",
      };
    case err.POSITION_UNAVAILABLE:
      return {
        code: "position_unavailable",
        message: "Konum belirlenemedi. GPS açık mı kontrol et.",
      };
    case err.TIMEOUT:
      return {
        code: "timeout",
        message: "Konum alınamadı (zaman aşımı). Tekrar dene.",
      };
    default:
      return { code: "unknown", message: "Konum alınamadı." };
  }
}
