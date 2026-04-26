// Otobüs ETA (Estimated Time of Arrival) tahmini.
//
// Headway-based heuristic — gerçek tarife (stop_times.txt) elimizde olmadığı
// için tahmini hesaplama yapar. Modelimiz:
//   1. Hattın çalışma saatleri (örn 06:00-23:00)
//   2. Sefer sıklığı (frekans, örn 15 dk)
//   3. Saf seyahat hızı (durakta beklemeden, örn 30 km/h)
//   4. Her durakta sabit bekleme (örn 1 dk)
//
// Doğruluk yaklaşık %50-65. stop_times.txt veya gerçek-zamanlı GPS feed
// olmadan bu seviyeden fazlası mümkün değil.

export interface ETAConfig {
  startHour: number; // 6 = 06:00
  endHour: number; // 23 = 23:00
  frequencyMin: number; // 15 dk frekans (her X dakikada bir kalkış)
  pureSpeedKmh: number; // 30 km/h — durakta beklemeden saf hız
  stopWaitMin: number; // 1 dk — her durakta bekleme
}

export const DEFAULT_ETA_CONFIG: ETAConfig = {
  startHour: 6,
  endHour: 23,
  frequencyMin: 15,
  pureSpeedKmh: 30,
  stopWaitMin: 1,
};

export type ETAState = "soon" | "wait" | "before_start" | "closed" | "unknown";

export interface ETAResult {
  text: string;
  state: ETAState;
  waitMin: number | null;
}

/**
 * Bir otobüsün başlangıçtan bu durağa varış süresi (dakika).
 *
 * @param distKm        Hat başından bu durağa mesafe (km)
 * @param stopsBefore   Bu durakta hariç, başlangıçla bu durak arasındaki durak sayısı
 *                      (her birinde stopWaitMin bekleme var)
 */
export function travelTimeMin(
  distKm: number,
  stopsBefore: number,
  config: ETAConfig = DEFAULT_ETA_CONFIG
): number {
  const travel = (distKm / config.pureSpeedKmh) * 60;
  const waits = Math.max(0, stopsBefore) * config.stopWaitMin;
  return travel + waits;
}

/**
 * Hattın bir uçtan diğerine toplam yolculuk süresi.
 */
export function totalTripMin(
  totalKm: number,
  totalStops: number,
  config: ETAConfig = DEFAULT_ETA_CONFIG
): number {
  const travel = (totalKm / config.pureSpeedKmh) * 60;
  const waits = Math.max(0, totalStops) * config.stopWaitMin;
  return travel + waits;
}

/**
 * Bu duraktan ETA hesaplar.
 *
 * @param distKm        Hat başından bu durağa km
 * @param totalKm       Hattın toplam km
 * @param stopsBefore   Bu durakla başlangıç arasında kaç durak var
 * @param totalStops    Hattaki toplam durak sayısı
 */
export function computeETA(
  distKm: number | undefined,
  totalKm: number | undefined,
  stopsBefore: number | undefined,
  totalStops: number | undefined,
  now: Date = new Date(),
  config: ETAConfig = DEFAULT_ETA_CONFIG
): ETAResult {
  if (
    typeof distKm !== "number" ||
    typeof totalKm !== "number" ||
    !Number.isFinite(distKm) ||
    !Number.isFinite(totalKm) ||
    totalKm <= 0
  ) {
    return { text: "", state: "unknown", waitMin: null };
  }

  const before = typeof stopsBefore === "number" ? stopsBefore : 0;
  const total = typeof totalStops === "number" ? totalStops : before * 2;

  const startMin = config.startHour * 60;
  const endMin = config.endHour * 60;

  const travelMin = travelTimeMin(distKm, before, config);
  const tripMin = totalTripMin(totalKm, total, config);

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const firstArrivalMin = startMin + travelMin;
  const lastDepartureMin = endMin - tripMin;
  const lastArrivalMin = lastDepartureMin + travelMin;

  if (nowMin < firstArrivalMin) {
    const waitMin = firstArrivalMin - nowMin;
    return {
      text: `${formatHHMM(firstArrivalMin)}'de`,
      state: "before_start",
      waitMin,
    };
  }

  if (nowMin > lastArrivalMin || lastDepartureMin < startMin) {
    return { text: "kapalı", state: "closed", waitMin: null };
  }

  // Bir sonraki sefer ne zaman buraya varır?
  const elapsedSinceFirstArrival = nowMin - firstArrivalMin;
  const n = Math.max(0, Math.ceil(elapsedSinceFirstArrival / config.frequencyMin));
  const nextArrivalMin = startMin + n * config.frequencyMin + travelMin;

  if (nextArrivalMin > lastArrivalMin) {
    return { text: "son sefer", state: "closed", waitMin: null };
  }

  const waitMin = nextArrivalMin - nowMin;
  const waitRounded = Math.round(waitMin);

  if (waitRounded <= 0) {
    return { text: "şimdi", state: "soon", waitMin };
  }
  if (waitRounded < 60) {
    return {
      text: `~${waitRounded} dk`,
      state: waitRounded <= 10 ? "soon" : "wait",
      waitMin,
    };
  }
  const h = Math.floor(waitRounded / 60);
  const m = waitRounded % 60;
  return {
    text: m > 0 ? `~${h}sa ${m}dk` : `~${h}sa`,
    state: "wait",
    waitMin,
  };
}

function formatHHMM(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = Math.floor(m % 60);
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function etaStateColor(state: ETAState): string {
  switch (state) {
    case "soon":
      return "#10b981";
    case "wait":
      return "#64748b";
    case "before_start":
      return "#0ea5e9";
    case "closed":
      return "#dc2626";
    default:
      return "#94a3b8";
  }
}
