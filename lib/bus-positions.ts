// Ghost bus pozisyon simülasyonu — gerçek GPS feed'i olmadığı için tarifeye
// göre "şu an otobüs muhtemelen burada olur" hesabı yapar.
//
// Algoritma:
//   - Hattın çalışma saatlerinde her N dakikada bir kalkış yapılır (06:00, 06:15, ...)
//   - Her kalkış için: elapsed = now - departureTime
//   - elapsed kadar süre sonra otobüs nerede olur? → distAtTime
//   - distAtTime, polyline üzerinde lat/lng'ye çevrilir
//
// Önemli: Bu konum YAKLAŞIK. Trafik, gecikme, hız değişiklikleri hesaba
// katılmaz. Gerçek konum ±500m-1.5km sapabilir.

import type { ETAConfig } from "./bus-eta";
import { DEFAULT_ETA_CONFIG, totalTripMin } from "./bus-eta";

export interface GhostBus {
  // Kararlı ID: aynı kalkış slot'u her refresh'te aynı ID döner.
  // Sayesinde frontend marker'ları silmeyip pozisyon update ile smooth animasyon yapar.
  // Format: "{shapeId}:{departureMinSinceMidnight}"
  id: string;
  lat: number;
  lng: number;
  distKm: number;
  elapsedMin: number;
  shapeId: string;
  progress: number;
}

/**
 * Polyline için kümülatif km dizisi inşa eder.
 * Genelde shape mount sırasında bir kez hesaplanır.
 */
export function buildCumDist(
  coords: Array<[number, number]>
): Float64Array {
  const cum = new Float64Array(coords.length);
  cum[0] = 0;
  for (let i = 1; i < coords.length; i++) {
    cum[i] = cum[i - 1] + haversineKm(
      coords[i - 1][0],
      coords[i - 1][1],
      coords[i][0],
      coords[i][1]
    );
  }
  return cum;
}

/**
 * Polyline'da `targetKm` mesafesindeki noktayı interpolasyonla bulur.
 * @returns [lat, lng] veya targetKm aralık dışındaysa null
 */
export function pointAtDistance(
  coords: Array<[number, number]>,
  cumDist: Float64Array,
  targetKm: number
): [number, number] | null {
  if (
    !Number.isFinite(targetKm) ||
    targetKm < 0 ||
    cumDist.length === 0 ||
    targetKm > cumDist[cumDist.length - 1]
  ) {
    return null;
  }
  // Binary search: cumDist[i] >= targetKm olan en küçük i
  let lo = 1;
  let hi = cumDist.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cumDist[mid] < targetKm) lo = mid + 1;
    else hi = mid;
  }
  const i = lo;
  const span = cumDist[i] - cumDist[i - 1];
  const frac = span > 0 ? (targetKm - cumDist[i - 1]) / span : 0;
  return [
    coords[i - 1][0] + frac * (coords[i][0] - coords[i - 1][0]),
    coords[i - 1][1] + frac * (coords[i][1] - coords[i - 1][1]),
  ];
}

/**
 * "elapsed dakika sonra otobüs hattın hangi km'sinde olur" hesabı.
 * Her durakta `stopWaitMin` kadar bekleme yapıldığını dikkate alır.
 *
 * @param elapsedMin    Otobüsün başlangıçtan ayrılalı geçen dakika
 * @param totalKm       Hattın toplam uzunluğu
 * @param stopDists     Hattın durakları, başlangıçtan km cinsinden sıralı
 * @returns             Otobüsün şu anki ilerleyişi (km), trip bittiyse null
 */
export function distAtTime(
  elapsedMin: number,
  totalKm: number,
  stopDists: number[],
  config: ETAConfig = DEFAULT_ETA_CONFIG
): number | null {
  if (elapsedMin < 0) return null;
  const minPerKm = 60 / config.pureSpeedKmh;
  let curTime = 0;
  let curDist = 0;

  for (const stopDist of stopDists) {
    if (stopDist < curDist) continue;
    const segMin = (stopDist - curDist) * minPerKm;
    if (curTime + segMin >= elapsedMin) {
      // Otobüs bu segmentin içinde
      return curDist + (elapsedMin - curTime) / minPerKm;
    }
    curTime += segMin;
    curDist = stopDist;
    // Durakta bekleme
    if (curTime + config.stopWaitMin >= elapsedMin) {
      return stopDist; // durakta bekliyor
    }
    curTime += config.stopWaitMin;
  }
  // Son durak ile uç arasında
  const remaining = totalKm - curDist;
  if (remaining > 0) {
    const segMin = remaining * minPerKm;
    if (curTime + segMin >= elapsedMin) {
      return curDist + (elapsedMin - curTime) / minPerKm;
    }
  }
  return null; // sefer tamamlandı
}

/**
 * Bir hat üzerindeki tüm aktif "ghost bus"ları üretir.
 *
 * @param shapeId     Bu shape'in ID'si (gidiş veya dönüş)
 * @param coords      Shape polyline koordinatları
 * @param cumDist     Önceden hesaplanmış kümülatif km
 * @param totalKm     cumDist[length-1]
 * @param stopDists   Bu hattın durakları (sıralı km — birleşik gidiş+dönüş olabilir)
 * @param now         Şu anki zaman
 */
export function simulateBuses(
  shapeId: string,
  coords: Array<[number, number]>,
  cumDist: Float64Array,
  totalKm: number,
  stopDists: number[],
  now: Date,
  config: ETAConfig = DEFAULT_ETA_CONFIG
): GhostBus[] {
  // Shape'e ait stop dist'leri filtre — totalKm'den fazla olanları at
  // (stopDists ham listede gidiş+dönüş birleşik olabilir, biz her shape için
  //  totalKm'den küçük olanları kullanırız)
  const relevantStops = stopDists.filter(d => d <= totalKm + 0.01);

  const startMin = config.startHour * 60;
  const endMin = config.endHour * 60;
  const tripMin = totalTripMin(totalKm, relevantStops.length, config);
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const buses: GhostBus[] = [];

  // Her potansiyel kalkıştan kontrol et
  // Son kalkış: tripi tamamlayabilecek son saat (endMin - tripMin)
  const lastDeparture = endMin - tripMin;
  for (let t = startMin; t <= lastDeparture + 0.5; t += config.frequencyMin) {
    const elapsed = nowMin - t;
    if (elapsed < 0) break; // gelecek kalkışlar
    if (elapsed > tripMin) continue; // tamamlanmış sefer

    const distKm = distAtTime(elapsed, totalKm, relevantStops, config);
    if (distKm == null) continue;

    const point = pointAtDistance(coords, cumDist, distKm);
    if (!point) continue;

    buses.push({
      id: `${shapeId}:${t}`,
      lat: point[0],
      lng: point[1],
      distKm,
      elapsedMin: elapsed,
      shapeId,
      progress: totalKm > 0 ? distKm / totalKm : 0,
    });
  }

  return buses;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const r1 = (lat1 * Math.PI) / 180;
  const r2 = (lat2 * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r1) * Math.cos(r2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
