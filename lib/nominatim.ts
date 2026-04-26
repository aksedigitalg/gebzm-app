// Nominatim (OpenStreetMap geocoding) client.
// https://nominatim.openstreetmap.org/
//
// KRİTİK kullanım politikası:
//   - Maks 1 istek/saniye (rate limit)
//   - Auto-complete YASAK — kullanıcı kelime kelime istek atılmaz
//   - Sonuçlar cache'lenmek zorunda
//   - Yüksek hacim için self-host
//   - User-Agent / Referer ile uygulama tanımlaması (browser otomatik referer yollar)
//
// Kullanım: kullanıcı "Adres olarak ara" butonuna BASARSA bir istek atılır,
// sonuçlar sessionStorage'da 24 saat cache'lenir.

import { isValidCoord } from "./security";

const BASE = "https://nominatim.openstreetmap.org";
// Kocaeli bbox — sonuçları yere bağlar (alakasız sonuçlar gelmez)
// [south, west, north, east]
const KOCAELI_BBOX = [40.55, 29.0, 41.1, 30.5] as const;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat
const CACHE_PREFIX = "gebzem_geocode_";
const MIN_QUERY_LEN = 3;
const MAX_QUERY_LEN = 100;

export interface GeocodeResult {
  lat: number;
  lng: number;
  // Kullanıcıya gösterilecek tam ad (Nominatim formatı)
  displayName: string;
  // OSM POI tipi (örn "house", "road", "amenity")
  type?: string;
  // 0-1 arası önem skoru
  importance?: number;
  // Daha kısa ad (yalnızca yer ismi, tam adres değil)
  shortName?: string;
}

let lastRequestTime = 0;

/**
 * 1 istek/saniye rate limit (politika gereği).
 */
async function rateLimit(): Promise<void> {
  const elapsed = Date.now() - lastRequestTime;
  if (elapsed < 1100) {
    await new Promise(r => setTimeout(r, 1100 - elapsed));
  }
  lastRequestTime = Date.now();
}

function cacheKey(query: string): string {
  return CACHE_PREFIX + query.toLowerCase().trim();
}

function readCache(query: string): GeocodeResult[] | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(query));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { expires: number; data: GeocodeResult[] };
    if (
      typeof parsed?.expires !== "number" ||
      !Array.isArray(parsed?.data) ||
      parsed.expires < Date.now()
    ) {
      sessionStorage.removeItem(cacheKey(query));
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(query: string, data: GeocodeResult[]): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      cacheKey(query),
      JSON.stringify({ expires: Date.now() + CACHE_TTL_MS, data })
    );
  } catch {
    // sessionStorage dolu veya private mode — sessizce yut
  }
}

/**
 * Kocaeli sınırlarında adres arar.
 *
 * @param query   Aranacak metin (3-100 karakter, sanitize edilir)
 * @returns       En fazla 5 sonuç. Hata olursa boş dizi.
 */
export async function geocodeKocaeli(query: string): Promise<GeocodeResult[]> {
  const q = sanitizeQuery(query);
  if (!q) return [];

  // Cache hit — anlık dön
  const cached = readCache(q);
  if (cached) return cached;

  await rateLimit();

  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
    "accept-language": "tr",
    countrycodes: "tr",
    // viewbox: west,south,east,north (Nominatim sırası farklı!)
    viewbox: `${KOCAELI_BBOX[1]},${KOCAELI_BBOX[2]},${KOCAELI_BBOX[3]},${KOCAELI_BBOX[0]}`,
    bounded: "1",
  });

  try {
    const res = await fetch(`${BASE}/search?${params.toString()}`, {
      // Browser otomatik Referer yollar (politika gereği identification)
      cache: "force-cache",
      // CORS politikası gereği credentials yollanmaz
      credentials: "omit",
    });
    if (!res.ok) return [];
    const arr = (await res.json()) as unknown;
    if (!Array.isArray(arr)) return [];

    const results: GeocodeResult[] = [];
    for (const r of arr) {
      if (!r || typeof r !== "object") continue;
      const item = r as Record<string, unknown>;
      const lat = parseFloat(String(item.lat));
      const lng = parseFloat(String(item.lon));
      if (!isValidCoord(lat, lng)) continue;
      const display = String(item.display_name || "").slice(0, 200);
      if (!display) continue;
      const importance =
        typeof item.importance === "number" ? item.importance : undefined;
      const type = typeof item.type === "string" ? item.type : undefined;
      // address objesinden kısa ad türet — neighbourhood/road/town
      const addr = (item.address as Record<string, unknown>) || {};
      const shortName = pickShortName(addr) || display.split(",")[0];
      results.push({
        lat,
        lng,
        displayName: display,
        type,
        importance,
        shortName,
      });
    }

    // Önemine göre sırala (yüksek = ilk)
    results.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));

    writeCache(q, results);
    return results;
  } catch {
    return [];
  }
}

function sanitizeQuery(raw: string): string {
  if (typeof raw !== "string") return "";
  // Kontrol karakterlerini at
  // eslint-disable-next-line no-control-regex
  const cleaned = raw.replace(/[\x00-\x1f\x7f]/g, " ").trim();
  if (cleaned.length < MIN_QUERY_LEN || cleaned.length > MAX_QUERY_LEN)
    return "";
  return cleaned;
}

function pickShortName(addr: Record<string, unknown>): string | undefined {
  const candidates = [
    addr.amenity,
    addr.shop,
    addr.tourism,
    addr.historic,
    addr.building,
    addr.road,
    addr.neighbourhood,
    addr.suburb,
    addr.town,
    addr.city,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c.slice(0, 80);
  }
  return undefined;
}
