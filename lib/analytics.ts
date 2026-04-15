// Analitik altyapısı — Visit eventi toplama ve zaman dilimine göre aggregation
// Mock veri ile çalışır (backend gelince gerçek tracking'e bağlanır)

export type VisitSource = "home" | "category" | "search" | "map" | "direct" | "ad";
export type DeviceType = "mobile" | "desktop" | "pwa";

export interface VisitEvent {
  businessId: string;
  timestamp: number; // ms
  source: VisitSource;
  device: DeviceType;
  duration?: number; // saniye
}

export interface TimeBucket {
  label: string;
  value: number;
}

export interface HeatmapCell {
  day: number; // 0=Pazartesi ... 6=Pazar
  hour: number; // 0-23
  count: number;
}

// ────────────────────────────────────────
// Deterministik rastgele sayı (seed tabanlı)
// ────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ────────────────────────────────────────
// Demo veri üretimi
// ────────────────────────────────────────
export function generateVisits(
  businessId: string,
  days: number,
  businessType: string = "restoran"
): VisitEvent[] {
  const rand = seededRandom(hashString(businessId));
  const events: VisitEvent[] = [];
  const now = Date.now();

  const hourWeights = getHourWeights(businessType);
  const dayWeights = [0.9, 1.0, 0.95, 1.05, 1.3, 1.6, 1.4]; // Pzt..Paz
  const sources: VisitSource[] = ["home", "category", "search", "map", "direct", "ad"];
  const sourceWeights = [0.35, 0.25, 0.15, 0.1, 0.1, 0.05];
  const devices: DeviceType[] = ["mobile", "desktop", "pwa"];
  const deviceWeights = [0.6, 0.15, 0.25];

  for (let d = 0; d < days; d++) {
    const date = new Date(now - d * 86400000);
    const dayOfWeek = (date.getDay() + 6) % 7;
    const dayMultiplier = dayWeights[dayOfWeek];

    // Trend: geçmişe gidildikçe azalır (büyüyen işletme)
    const growthFactor = 1 - (d / days) * 0.3;

    // Günlük ziyaret sayısı
    const baseDaily = 50;
    const dailyVisits = Math.floor(baseDaily * dayMultiplier * growthFactor * (0.8 + rand() * 0.4));

    for (let v = 0; v < dailyVisits; v++) {
      // Saat dağılımı (weighted)
      const hour = pickWeighted(hourWeights, rand);
      const minute = Math.floor(rand() * 60);
      const ts = new Date(date);
      ts.setHours(hour, minute, 0, 0);

      const sourceIdx = pickWeightedIndex(sourceWeights, rand);
      const deviceIdx = pickWeightedIndex(deviceWeights, rand);

      events.push({
        businessId,
        timestamp: ts.getTime(),
        source: sources[sourceIdx],
        device: devices[deviceIdx],
        duration: Math.floor(30 + rand() * 240),
      });
    }
  }

  return events;
}

function getHourWeights(type: string): number[] {
  // Saat başına ağırlık (0-23). Toplam önemsiz, oran önemli.
  switch (type) {
    case "restoran":
    case "kafe":
    case "yemek":
      return [
        0.2, 0.1, 0.05, 0.05, 0.05, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 1.5,
        2.5, 2.8, 2.0, 1.5, 1.3, 1.6, 2.8, 3.2, 3.0, 2.5, 1.8, 0.8,
      ];
    case "doktor":
      return [
        0.05, 0.02, 0.02, 0.02, 0.02, 0.05, 0.2, 0.5, 1.5, 2.2, 2.5, 2.0,
        1.3, 2.0, 2.3, 2.2, 2.0, 1.2, 0.5, 0.3, 0.2, 0.1, 0.05, 0.05,
      ];
    case "market":
    case "magaza":
      return [
        0.2, 0.1, 0.05, 0.05, 0.05, 0.1, 0.2, 0.5, 0.8, 1.2, 1.5, 1.8,
        2.0, 1.8, 1.6, 1.5, 1.8, 2.2, 2.5, 2.3, 1.8, 1.2, 0.8, 0.4,
      ];
    case "kuafor":
      return [
        0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.1, 0.3, 0.8, 1.5, 2.0, 2.2,
        1.5, 2.0, 2.5, 2.8, 2.5, 2.0, 1.5, 1.0, 0.6, 0.3, 0.15, 0.1,
      ];
    case "emlakci":
    case "galerici":
      return [
        0.1, 0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.5, 1.5, 2.0, 2.3, 2.0,
        1.8, 2.0, 2.3, 2.2, 1.8, 1.2, 0.8, 0.5, 0.3, 0.2, 0.1, 0.05,
      ];
    default:
      return new Array(24).fill(1);
  }
}

function pickWeighted(weights: number[], rand: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function pickWeightedIndex(weights: number[], rand: () => number): number {
  return pickWeighted(weights, rand);
}

// ────────────────────────────────────────
// Aggregation fonksiyonları
// ────────────────────────────────────────
export function aggregateByHour(events: VisitEvent[]): TimeBucket[] {
  const counts = new Array(24).fill(0);
  events.forEach((e) => {
    const h = new Date(e.timestamp).getHours();
    counts[h]++;
  });
  return counts.map((count, hour) => ({
    label: `${hour.toString().padStart(2, "0")}:00`,
    value: count,
  }));
}

export function aggregateByDay(events: VisitEvent[], days: number): TimeBucket[] {
  const buckets: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }
  events.forEach((e) => {
    const key = new Date(e.timestamp).toISOString().slice(0, 10);
    if (key in buckets) buckets[key]++;
  });
  return Object.entries(buckets).map(([key, count]) => {
    const d = new Date(key);
    return {
      label: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
      value: count,
    };
  });
}

export function aggregateByWeek(events: VisitEvent[], weeks: number): TimeBucket[] {
  const buckets: Record<string, number> = {};
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    const year = d.getFullYear();
    const weekNum = getWeekNumber(d);
    const key = `${year}-W${weekNum.toString().padStart(2, "0")}`;
    buckets[key] = 0;
  }
  events.forEach((e) => {
    const d = new Date(e.timestamp);
    const key = `${d.getFullYear()}-W${getWeekNumber(d).toString().padStart(2, "0")}`;
    if (key in buckets) buckets[key]++;
  });
  return Object.entries(buckets).map(([key, count]) => {
    const weekNum = parseInt(key.split("-W")[1]);
    return { label: `${weekNum}. Hf`, value: count };
  });
}

export function aggregateByMonth(events: VisitEvent[], months: number): TimeBucket[] {
  const buckets: Record<string, number> = {};
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    buckets[key] = 0;
  }
  events.forEach((e) => {
    const d = new Date(e.timestamp);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    if (key in buckets) buckets[key]++;
  });
  const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return Object.entries(buckets).map(([key, count]) => {
    const [, month] = key.split("-");
    return { label: monthNames[parseInt(month) - 1], value: count };
  });
}

export function aggregateByYear(events: VisitEvent[]): TimeBucket[] {
  const buckets: Record<string, number> = {};
  events.forEach((e) => {
    const year = new Date(e.timestamp).getFullYear().toString();
    buckets[year] = (buckets[year] || 0) + 1;
  });
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ label: year, value: count }));
}

export function buildHeatmap(events: VisitEvent[]): number[][] {
  const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));
  events.forEach((e) => {
    const d = new Date(e.timestamp);
    const day = (d.getDay() + 6) % 7; // Pzt=0
    grid[day][d.getHours()]++;
  });
  return grid;
}

export function aggregateBySources(events: VisitEvent[]): Record<VisitSource, number> {
  const counts: Record<VisitSource, number> = {
    home: 0,
    category: 0,
    search: 0,
    map: 0,
    direct: 0,
    ad: 0,
  };
  events.forEach((e) => counts[e.source]++);
  return counts;
}

export function aggregateByDevices(events: VisitEvent[]): Record<DeviceType, number> {
  const counts: Record<DeviceType, number> = {
    mobile: 0,
    desktop: 0,
    pwa: 0,
  };
  events.forEach((e) => counts[e.device]++);
  return counts;
}

export function getTopHours(events: VisitEvent[], n = 5): { hour: number; count: number }[] {
  const hourly = aggregateByHour(events);
  return hourly
    .map((h, i) => ({ hour: i, count: h.value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export function totalVisits(events: VisitEvent[]): number {
  return events.length;
}

export function averageDuration(events: VisitEvent[]): number {
  const withDur = events.filter((e) => e.duration != null);
  if (withDur.length === 0) return 0;
  return Math.round(withDur.reduce((a, e) => a + (e.duration || 0), 0) / withDur.length);
}

// ────────────────────────────────────────
// Yardımcı
// ────────────────────────────────────────
function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export const sourceLabels: Record<VisitSource, string> = {
  home: "Ana Sayfa",
  category: "Kategoriler",
  search: "Arama",
  map: "Harita",
  direct: "Direkt",
  ad: "Reklam",
};

export const deviceLabels: Record<DeviceType, string> = {
  mobile: "Mobil",
  desktop: "Masaüstü",
  pwa: "PWA",
};
