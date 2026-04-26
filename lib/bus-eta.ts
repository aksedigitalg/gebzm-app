// Otobüs ETA (Estimated Time of Arrival) tahmini.
//
// Headway-based heuristic — gerçek tarife (stop_times.txt) elimizde olmadığı
// için tahmini hesaplama yapar. Endüstri standart 3 girdi:
//   1. Hattın çalışma saatleri (örn 06:00-23:00)
//   2. Sefer sıklığı (frekans, örn 15 dk)
//   3. Ortalama şehir içi otobüs hızı (Türkiye konvansiyonel ~22 km/h)
//
// Doğruluk yaklaşık %60-70 (pik saatler hariç). stop_times.txt veya
// gerçek-zamanlı GPS feed olmadan bu seviyeden fazlası mümkün değil.

export interface ETAConfig {
  startHour: number; // 6 = 06:00
  endHour: number; // 23 = 23:00
  frequencyMin: number; // 15 dk frekans
  speedKmh: number; // 22 km/h şehir içi otobüs ortalaması
}

export const DEFAULT_ETA_CONFIG: ETAConfig = {
  startHour: 6,
  endHour: 23,
  frequencyMin: 15,
  speedKmh: 22,
};

export type ETAState = "soon" | "wait" | "before_start" | "closed" | "unknown";

export interface ETAResult {
  text: string; // "~5 dk", "kapalı", "06:23'te"
  state: ETAState;
  waitMin: number | null; // null = hesap dışı
}

/**
 * Hat ETA hesaplar.
 * @param distKm   Hattın başlangıç noktasından bu durağa olan mesafe (km)
 * @param totalKm  Hattın toplam uzunluğu (km)
 * @param now      Şu anki tarih
 * @param config   ETA varsayımları
 */
export function computeETA(
  distKm: number | undefined,
  totalKm: number | undefined,
  now: Date = new Date(),
  config: ETAConfig = DEFAULT_ETA_CONFIG
): ETAResult {
  // Veri yoksa hesap yapamayız
  if (
    typeof distKm !== "number" ||
    typeof totalKm !== "number" ||
    !Number.isFinite(distKm) ||
    !Number.isFinite(totalKm) ||
    totalKm <= 0
  ) {
    return { text: "", state: "unknown", waitMin: null };
  }

  const { startHour, endHour, frequencyMin, speedKmh } = config;
  const startMin = startHour * 60;
  const endMin = endHour * 60;

  // Bir otobüsün başlangıçtan bu durağa kadar olan tahmini yolculuk süresi
  const travelMin = (distKm / speedKmh) * 60;
  // Hattın bir uçtan diğerine yolculuk süresi (son sefer hesabı için)
  const totalMin = (totalKm / speedKmh) * 60;

  // Şu anki dakika
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  // İlk seferin bu durağa varış zamanı
  const firstArrivalMin = startMin + travelMin;
  // Son seferin başlangıçtan ayrılış zamanı (servis bitmeden tamamlanması için)
  const lastDepartureMin = endMin - totalMin;
  // Son seferin bu durağa varış zamanı
  const lastArrivalMin = lastDepartureMin + travelMin;

  // Saat 06:00 öncesi
  if (nowMin < firstArrivalMin) {
    const waitMin = firstArrivalMin - nowMin;
    return {
      text: `${formatHHMM(firstArrivalMin)}'de`,
      state: "before_start",
      waitMin,
    };
  }

  // Servis bitmiş
  if (nowMin > lastArrivalMin || lastDepartureMin < startMin) {
    return { text: "kapalı", state: "closed", waitMin: null };
  }

  // Otobüs sıklığı 15 dk: 06:00, 06:15, 06:30, ... başlangıçtan ayrılışlar.
  // Bu durağa varışlar: 06:00+travel, 06:15+travel, ...
  // Şu anki en yakın gelecek varış:
  //   arrival = startMin + n*frequency + travel
  //   arrival >= nowMin için en küçük n:
  //   n >= (nowMin - startMin - travel) / frequency
  const elapsedSinceFirstArrival = nowMin - firstArrivalMin;
  const n = Math.max(0, Math.ceil(elapsedSinceFirstArrival / frequencyMin));
  const nextArrivalMin = startMin + n * frequencyMin + travelMin;

  // Aralarda son sefer geçilmiş olabilir
  if (nextArrivalMin > lastArrivalMin) {
    return { text: "son sefer", state: "closed", waitMin: null };
  }

  const waitMin = nextArrivalMin - nowMin;
  const waitRounded = Math.round(waitMin);

  // Görüntü metni
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
  // 1 saatten uzun (nadiren — son seferden çok önce)
  const h = Math.floor(waitRounded / 60);
  const m = waitRounded % 60;
  return {
    text: m > 0 ? `~${h}sa ${m}dk` : `~${h}sa`,
    state: "wait",
    waitMin,
  };
}

function formatHHMM(minutes: number): string {
  // 24 saati aşabiliyor (gece yarısı sonrası), modulo
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = Math.floor(m % 60);
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * ETA renkleri — popup badge arkaplan rengi
 */
export function etaStateColor(state: ETAState): string {
  switch (state) {
    case "soon":
      return "#10b981"; // yeşil — yakında
    case "wait":
      return "#64748b"; // gri — beklemeli
    case "before_start":
      return "#0ea5e9"; // mavi — sabah açılacak
    case "closed":
      return "#dc2626"; // kırmızı — kapalı
    default:
      return "#94a3b8";
  }
}
