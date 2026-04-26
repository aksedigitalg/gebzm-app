// OSRM (Open Source Routing Machine) public demo client.
// https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server
//
// Public demo'nun rate limiti var (≤1 req/sn). Üç-beş request makul, daha
// fazlasında self-hosted gerekir. Production'da kendi OSRM sunucumuza
// geçeceğiz, şu an public demo yeterli.

const BASE = "https://router.project-osrm.org";

export interface OsrmStep {
  // Adımın metre cinsinden uzunluğu
  distanceM: number;
  // Adımın saniye cinsinden süresi
  durationSec: number;
  // Bu adımdaki yön talimatı (Türkçe çevrilmiş)
  instruction: string;
  // Sokak/caddeye ad varsa
  name?: string;
  // Polyline koordinatları (lat/lng)
  coords: Array<[number, number]>;
}

export interface OsrmRoute {
  distanceM: number;
  durationSec: number;
  steps: OsrmStep[];
  // Tüm rotanın polyline'ı
  geometry: Array<[number, number]>;
}

/**
 * İki nokta arası yürüyüş rotası — adım adım talimat dahil.
 *
 * @param from   {lat, lng} başlangıç
 * @param to     {lat, lng} hedef
 * @returns      OsrmRoute veya hata olursa null
 */
export async function osrmFoot(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<OsrmRoute | null> {
  // OSRM koordinat formatı: lng,lat (önce uzunluk!)
  const a = `${from.lng.toFixed(6)},${from.lat.toFixed(6)}`;
  const b = `${to.lng.toFixed(6)},${to.lat.toFixed(6)}`;
  const url = `${BASE}/route/v1/foot/${a};${b}?overview=full&geometries=geojson&steps=true&alternatives=false`;

  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) return null;
    const r = data.routes[0];

    const steps: OsrmStep[] = [];
    for (const leg of r.legs || []) {
      for (const s of leg.steps || []) {
        const coords: Array<[number, number]> = (s.geometry?.coordinates || []).map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );
        steps.push({
          distanceM: Math.round(s.distance || 0),
          durationSec: Math.round(s.duration || 0),
          instruction: turkishInstruction(s),
          name: s.name || undefined,
          coords,
        });
      }
    }

    const geometry: Array<[number, number]> = (
      r.geometry?.coordinates || []
    ).map(([lng, lat]: [number, number]) => [lat, lng]);

    return {
      distanceM: Math.round(r.distance || 0),
      durationSec: Math.round(r.duration || 0),
      steps,
      geometry,
    };
  } catch {
    return null;
  }
}

// OSRM step türlerini Türkçe talimata çevirir.
// Doc: https://project-osrm.org/docs/v5.24.0/api/#stepmaneuver-object
function turkishInstruction(step: any): string {
  const m = step.maneuver || {};
  const type = m.type as string;
  const modifier = m.modifier as string | undefined;
  const name = (step.name || "").trim();
  const dist = Math.round(step.distance || 0);

  const direction = (mod: string | undefined): string => {
    switch (mod) {
      case "left":
        return "sola dön";
      case "right":
        return "sağa dön";
      case "sharp left":
        return "keskin sola dön";
      case "sharp right":
        return "keskin sağa dön";
      case "slight left":
        return "hafif sola dön";
      case "slight right":
        return "hafif sağa dön";
      case "uturn":
        return "U dönüşü yap";
      case "straight":
        return "düz devam et";
      default:
        return "devam et";
    }
  };

  switch (type) {
    case "depart":
      return name ? `${name}'den yola çık` : "Yola çık";
    case "arrive":
      return name ? `${name}'e vardın` : "Vardın";
    case "turn":
      return name ? `${direction(modifier)} (${name})` : direction(modifier);
    case "new name":
      return name ? `${name}'e devam et` : "Devam et";
    case "merge":
      return name ? `${name}'e katıl` : "Katıl";
    case "on ramp":
      return "Rampaya gir";
    case "off ramp":
      return "Rampadan çık";
    case "fork":
      return modifier ? `Ayrımda ${direction(modifier)}` : "Ayrımdan devam et";
    case "end of road":
      return modifier ? `Yolun sonunda ${direction(modifier)}` : "Yolun sonu";
    case "continue":
      return name ? `${name}'e ${direction(modifier)}` : direction(modifier);
    case "roundabout":
    case "rotary":
      return "Döner kavşaktan çık";
    case "exit roundabout":
    case "exit rotary":
      return "Döner kavşaktan çık";
    default:
      return name ? `${dist} m: ${name}` : `${dist} m yürü`;
  }
}

// Mesafeyi insan-okunur biçime çevirir
export function formatMeters(m: number): string {
  if (!Number.isFinite(m) || m < 0) return "";
  if (m < 100) return `${Math.round(m / 10) * 10} m`;
  if (m < 1000) return `${Math.round(m / 50) * 50} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

// Süreyi insan-okunur biçime çevirir
export function formatDurationSec(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "";
  const min = Math.round(sec / 60);
  if (min < 1) return "1 dk";
  if (min < 60) return `${min} dk`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}sa ${m}dk` : `${h}sa`;
}
