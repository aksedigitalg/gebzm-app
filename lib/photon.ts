// Photon (Komoot) geocoding client — autocomplete destekler.
// https://photon.komoot.io/
//
// Photon Nominatim'in aksine search-as-you-type için TASARLANDI.
// Elasticsearch backend, OSM verisi.
//
// Politika: "fair use" — agresif sorgu kapatılır. Biz 300ms debounce ve
// memory cache ile politik sınırlar içinde kalırız.
//
// Yedek: bağlantı koparsa veya Photon down olursa Nominatim çağrılabilir.

import { isValidCoord } from "./security";

const BASE = "https://photon.komoot.io";
// Kocaeli çevresi öncelikli — bias parametresi
const KOCAELI_LAT = 40.78;
const KOCAELI_LNG = 29.52;
// İstek başına min 200ms (saniyede 5 istek = makul)
const MIN_REQUEST_INTERVAL_MS = 200;
const CACHE_MAX = 100;
const MIN_QUERY_LEN = 2;
const MAX_QUERY_LEN = 100;

export interface PhotonResult {
  lat: number;
  lng: number;
  // İnsan-okunur kısa ad (örn "Gaziler 1711 Sk")
  name: string;
  // Tam adres (örn "Gaziler 1711 Sk, Gebze, Kocaeli, Türkiye")
  fullAddress: string;
  // Kategori — street, house, place, restaurant, vs.
  type?: string;
  // Mahalle/şehir/ülke
  city?: string;
  district?: string;
  postcode?: string;
  // 0-1 önem skoru
  importance?: number;
}

let lastRequestTime = 0;
const memCache = new Map<string, PhotonResult[]>();

async function rateLimit(): Promise<void> {
  const elapsed = Date.now() - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

function sanitizeQuery(raw: string): string {
  if (typeof raw !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const cleaned = raw.replace(/[\x00-\x1f\x7f]/g, " ").trim();
  if (cleaned.length < MIN_QUERY_LEN || cleaned.length > MAX_QUERY_LEN) return "";
  return cleaned;
}

function pickName(props: Record<string, unknown>): string {
  // Photon street tipinde name=null oluyor; alternatif alanlardan derle
  const candidates = [
    props.name,
    props.street,
    props.housename,
    props.locality,
    props.suburb,
    props.district,
    props.city,
    props.county,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return String(c).slice(0, 80);
  }
  return "Adres";
}

function pickFullAddress(props: Record<string, unknown>): string {
  const parts: string[] = [];
  if (typeof props.name === "string" && props.name) parts.push(props.name);
  if (typeof props.street === "string" && props.street && props.street !== props.name) {
    parts.push(props.street);
  }
  if (typeof props.housenumber === "string" && props.housenumber) {
    parts.push(`No ${props.housenumber}`);
  }
  if (typeof props.suburb === "string" && props.suburb) parts.push(props.suburb);
  if (typeof props.district === "string" && props.district) parts.push(props.district);
  if (typeof props.city === "string" && props.city) parts.push(props.city);
  if (typeof props.country === "string" && props.country) parts.push(props.country);
  return parts.slice(0, 5).join(", ").slice(0, 200);
}

/**
 * Photon ile autocomplete arama.
 *
 * @param query     Aranacak metin (2+ karakter)
 * @param near      İsteğe bağlı yakınlık biası — bu noktaya yakınları öne çıkarır
 * @returns         En fazla 8 sonuç
 */
export async function photonSearch(
  query: string,
  near?: { lat: number; lng: number } | null
): Promise<PhotonResult[]> {
  const q = sanitizeQuery(query);
  if (!q) return [];

  // Memory cache kontrolü
  const cacheKey = `${q.toLowerCase()}|${near ? `${near.lat.toFixed(2)},${near.lng.toFixed(2)}` : "x"}`;
  const cached = memCache.get(cacheKey);
  if (cached) return cached;

  await rateLimit();

  const params = new URLSearchParams({
    q,
    limit: "8",
    lang: "default",
  });
  // Yakınlık biası — kullanıcı konumu varsa kullan, yoksa Kocaeli merkez
  const biasLat = near?.lat ?? KOCAELI_LAT;
  const biasLng = near?.lng ?? KOCAELI_LNG;
  params.set("lat", String(biasLat));
  params.set("lon", String(biasLng));
  // Türkiye dışından sonuç gelmesin
  // Photon `osm_tag` ile filter de yapabilir ama country ile yetinelim
  // (countrycodes desteklemiyor ama dünya verisi olduğu için bias ile sıralama yeterli)

  let res: Response;
  try {
    res = await fetch(`${BASE}/api?${params.toString()}`, {
      cache: "force-cache",
      credentials: "omit",
    });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return [];
  }

  const features =
    data && typeof data === "object" && Array.isArray((data as any).features)
      ? ((data as any).features as unknown[])
      : [];

  const results: PhotonResult[] = [];
  for (const f of features) {
    if (!f || typeof f !== "object") continue;
    const ft = f as Record<string, unknown>;
    const geom = ft.geometry as { coordinates?: unknown } | undefined;
    const coords = geom?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    const lng = parseFloat(String(coords[0]));
    const lat = parseFloat(String(coords[1]));
    if (!isValidCoord(lat, lng)) continue;
    const props = (ft.properties as Record<string, unknown>) || {};
    // Türkiye dışı sonuçları at (country code TR yoksa atla)
    const cc = props.countrycode;
    if (typeof cc === "string" && cc.toUpperCase() !== "TR") continue;
    const name = pickName(props);
    const fullAddress = pickFullAddress(props);
    results.push({
      lat,
      lng,
      name,
      fullAddress,
      type: typeof props.osm_value === "string" ? props.osm_value : undefined,
      city: typeof props.city === "string" ? props.city : undefined,
      district: typeof props.district === "string" ? props.district : undefined,
      postcode: typeof props.postcode === "string" ? props.postcode : undefined,
      importance:
        typeof props.importance === "number" ? props.importance : undefined,
    });
  }

  // Cache (LRU benzeri — kapasite aşıldığında en eskiyi at)
  if (memCache.size >= CACHE_MAX) {
    const firstKey = memCache.keys().next().value;
    if (firstKey) memCache.delete(firstKey);
  }
  memCache.set(cacheKey, results);

  return results;
}
