// Kocaeli GTFS ham verisinden:
//   1. routes.json       — 374 hat metadata (id, no, ad, renk, yön)
//   2. stop-routes.json  — durak → uğradığı hat numaraları (coğrafi eşleştirme)
//   3. route-shapes/*    — her hat için güzergah polyline'ı (lazy load)
//   4. kentkart.json     — 930 kentkart yükleme bayisi
//
// stop_times.txt elimizde olmadığı için durak-hat eşleştirmesini coğrafi
// yakınlıkla yapıyoruz: shape (güzergah çizgisi) noktalarına 50 m'den yakın
// duraklar o hattın uğrak duraklarıdır. Hassasiyet ~%85-95.
//
// Kullanım: node scripts/build-bus-data.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const RAW = resolve(ROOT, "data/gtfs-raw");
const OUT_DIR = resolve(ROOT, "public/data/bus");
const OUT_POI = resolve(ROOT, "public/data/poi");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
if (!existsSync(OUT_POI)) mkdirSync(OUT_POI, { recursive: true });

// ─── CSV parser (build-bus-stops.mjs ile aynı) ──────────────────────────────
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        out.push(cur);
        cur = "";
      } else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function readCsv(path) {
  if (!existsSync(path)) {
    console.error(`HATA: ${path} bulunamadı.`);
    process.exit(1);
  }
  const text = readFileSync(path, "utf8").replace(/^﻿/, "");
  const lines = text.split(/\r?\n/).filter(l => l.length > 0);
  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = cols[j] ?? "";
    rows.push(row);
  }
  return rows;
}

// ─── 1. ROUTES ──────────────────────────────────────────────────────────────
console.log("Routes okunuyor...");
const rawRoutes = readCsv(resolve(RAW, "routes.txt"));
const routesById = new Map();
const routeList = [];
for (const r of rawRoutes) {
  const cleaned = {
    id: r.route_id,
    short: (r.route_short_name || "").trim(),
    long: (r.route_long_name || "").trim(),
    color: (r.route_color || "0e7490").trim().toLowerCase(),
    textColor: (r.route_text_color || "ffffff").trim().toLowerCase(),
    desc: (r.route_desc || "").trim(),
  };
  routesById.set(cleaned.id, cleaned);
  routeList.push(cleaned);
}
console.log(`  ${routeList.length} hat`);

// ─── 2. TRIPS — shape ↔ route mapping ──────────────────────────────────────
console.log("Trips okunuyor...");
const rawTrips = readCsv(resolve(RAW, "trips.txt"));
const shapeToRoutes = new Map(); // shape_id → Set<route_id>
const routeToShapes = new Map(); // route_id → Set<shape_id>
const shapeHeadsign = new Map(); // shape_id → trip_headsign (ilk gördüğümüz)
const shapeDirection = new Map(); // shape_id → direction_id (0/1)

for (const t of rawTrips) {
  if (!t.shape_id || !t.route_id) continue;
  if (!shapeToRoutes.has(t.shape_id)) shapeToRoutes.set(t.shape_id, new Set());
  shapeToRoutes.get(t.shape_id).add(t.route_id);
  if (!routeToShapes.has(t.route_id)) routeToShapes.set(t.route_id, new Set());
  routeToShapes.get(t.route_id).add(t.shape_id);
  if (!shapeHeadsign.has(t.shape_id)) {
    // # ile başlayan boş headsign'lar var, atla
    const hs = (t.trip_headsign || "").trim();
    if (hs && hs !== "#") shapeHeadsign.set(t.shape_id, hs);
  }
  if (!shapeDirection.has(t.shape_id)) shapeDirection.set(t.shape_id, t.direction_id);
}
console.log(`  ${shapeToRoutes.size} unique shape, ${rawTrips.length} trip`);

// ─── 3. SHAPES — group by shape_id, sort by sequence ────────────────────────
console.log("Shapes okunuyor (büyük dosya, biraz sürer)...");
const rawShapes = readCsv(resolve(RAW, "shapes.txt"));
const shapesById = new Map(); // shape_id → [{lat, lng, seq}]
for (const s of rawShapes) {
  const id = s.shape_id;
  if (!id) continue;
  const lat = parseFloat(s.shape_pt_lat);
  const lng = parseFloat(s.shape_pt_lon);
  const seq = parseInt(s.shape_pt_sequence, 10);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(seq)) continue;
  if (!shapesById.has(id)) shapesById.set(id, []);
  shapesById.get(id).push({ lat, lng, seq });
}
for (const points of shapesById.values()) {
  points.sort((a, b) => a.seq - b.seq);
}
console.log(`  ${shapesById.size} shape, ${rawShapes.length} nokta`);

// Her shape için her noktanın "shape başından kümülatif km" değerini hesapla
// (GTFS shape_dist_traveled standardı). Bu, ETA hesabının temelidir.
console.log("Kümülatif mesafeler hesaplanıyor...");
const shapeCumDist = new Map(); // shape_id → Float64Array (her index için km)
const shapeTotalKm = new Map(); // shape_id → toplam km
function haversineKmInline(lat1, lng1, lat2, lng2) {
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
for (const [shapeId, points] of shapesById) {
  const cum = new Float64Array(points.length);
  cum[0] = 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKmInline(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
    cum[i] = total;
  }
  shapeCumDist.set(shapeId, cum);
  shapeTotalKm.set(shapeId, total);
}

// ─── 4. SPATIAL BUCKETING — durak ↔ shape eşleştirme ────────────────────────
// Coğrafi yakınlık: durak < 50m shape noktası varsa eşleşme.
// Brute force 8259 × 1M nokta = ~8 milyar hesap (çok yavaş).
// Çözüm: 0.0015° (~150m) grid. Her durak sadece kendi cell + 8 komşu cell'i kontrol eder.
console.log("Spatial bucket inşa ediliyor...");
const GRID_SIZE = 0.0015;
const MAX_DIST_KM = 0.05; // 50 m
const bucketKey = (lat, lng) =>
  `${Math.floor(lat / GRID_SIZE)}_${Math.floor(lng / GRID_SIZE)}`;

// Bucket → Map<shape_id, true>
const bucketToShapes = new Map();
for (const [shapeId, points] of shapesById) {
  for (const p of points) {
    const k = bucketKey(p.lat, p.lng);
    let m = bucketToShapes.get(k);
    if (!m) {
      m = new Map();
      bucketToShapes.set(k, m);
    }
    m.set(shapeId, true);
  }
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

console.log("Stops eşleştiriliyor...");
const rawStops = readCsv(resolve(RAW, "stops.txt"));
const stopRoutes = {}; // stop_id → [{ id, short, color, headsign }]

for (const stop of rawStops) {
  const slat = parseFloat(stop.stop_lat);
  const slng = parseFloat(stop.stop_lon);
  if (!Number.isFinite(slat) || !Number.isFinite(slng)) continue;

  const bLat = Math.floor(slat / GRID_SIZE);
  const bLng = Math.floor(slng / GRID_SIZE);

  // Aday shape'ler: kendi bucket + 8 komşu
  const candidateShapes = new Set();
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const k = `${bLat + dy}_${bLng + dx}`;
      const m = bucketToShapes.get(k);
      if (m) for (const sId of m.keys()) candidateShapes.add(sId);
    }
  }

  // Her aday shape için en yakın noktayı bul + kümülatif uzaklığı hesapla
  // matchedShapes: shape_id → { distKm: shape başından buraya, totalKm }
  const matchedShapes = new Map();
  const stopPos = { lat: slat, lng: slng };
  for (const shapeId of candidateShapes) {
    const points = shapesById.get(shapeId);
    if (!points) continue;
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const d = haversineKm(stopPos, p);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
      // Optimize: çok yakın bulduysak ve uzaklaşmaya başladıysak çık
      if (bestDist < 0.01 && d > bestDist + 0.05) break;
    }
    if (bestDist < MAX_DIST_KM && bestIdx >= 0) {
      const cum = shapeCumDist.get(shapeId);
      matchedShapes.set(shapeId, {
        distKm: cum[bestIdx],
        totalKm: shapeTotalKm.get(shapeId) || 0,
      });
    }
  }

  if (matchedShapes.size === 0) continue;

  // shape → route → unique route info (her route için en kısa shape'i seç)
  const routeBest = new Map(); // route_id → { shapeId, distKm, totalKm, headsign }
  for (const [shapeId, info] of matchedShapes) {
    const routeIds = shapeToRoutes.get(shapeId);
    if (!routeIds) continue;
    for (const rId of routeIds) {
      const existing = routeBest.get(rId);
      // Aynı route için birden fazla shape eşleşirse, en kısa total'ı al
      // (genelde gidiş yönü tercih edilir)
      if (!existing || info.totalKm < existing.totalKm) {
        routeBest.set(rId, {
          shapeId,
          distKm: info.distKm,
          totalKm: info.totalKm,
          headsign: shapeHeadsign.get(shapeId) || "",
        });
      }
    }
  }

  const list = [];
  for (const [rId, info] of routeBest) {
    const route = routesById.get(rId);
    if (!route) continue;
    list.push({
      id: rId,
      short: route.short,
      color: route.color,
      headsign: info.headsign,
      // 2 ondalık yeterli (10 m hassasiyet) — JSON boyutu için
      dist: Math.round(info.distKm * 100) / 100,
      total: Math.round(info.totalKm * 100) / 100,
    });
  }

  // Hat numarasına göre sırala (numerik)
  list.sort((a, b) => {
    const na = parseInt(a.short, 10);
    const nb = parseInt(b.short, 10);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
    return (a.short || "").localeCompare(b.short || "", "tr");
  });

  stopRoutes[stop.stop_id] = list;
}
const matchedCount = Object.keys(stopRoutes).length;
console.log(`  ${matchedCount}/${rawStops.length} durak eşleşti`);

// ─── 5. ROUTE-SHAPES — her hat için güzergah polyline dosyaları ─────────────
const SHAPES_DIR = resolve(OUT_DIR, "route-shapes");
if (existsSync(SHAPES_DIR)) {
  // Eski dosyaları temizle
  rmSync(SHAPES_DIR, { recursive: true, force: true });
}
mkdirSync(SHAPES_DIR, { recursive: true });

console.log("Route shape dosyaları yazılıyor...");
let shapesWritten = 0;
let shapesBytes = 0;
for (const [routeId, shapeIds] of routeToShapes) {
  // Her shape'i polyline olarak [[lat,lng],...] formatında ver
  const polylines = [];
  for (const sId of shapeIds) {
    const points = shapesById.get(sId);
    if (!points || points.length < 2) continue;
    // 5 ondalık = ~1 m hassasiyet
    const coords = points.map(p => [
      Math.round(p.lat * 100000) / 100000,
      Math.round(p.lng * 100000) / 100000,
    ]);
    polylines.push({
      id: sId,
      direction: shapeDirection.get(sId) || "0",
      headsign: shapeHeadsign.get(sId) || "",
      coords,
    });
  }
  if (polylines.length === 0) continue;
  const json = JSON.stringify(polylines);
  writeFileSync(resolve(SHAPES_DIR, `${routeId}.json`), json);
  shapesWritten++;
  shapesBytes += Buffer.byteLength(json);
}
console.log(`  ${shapesWritten} hat, ${(shapesBytes / 1024 / 1024).toFixed(1)} MB toplam`);

// ─── 6. ROUTE STOP DISTANCES — ghost bus simülasyonu için ──────────────────
// Her hat için: durakların başlangıçtan sıralı uzaklık dizisi (km)
console.log("Hat-bazında durak listeleri oluşturuluyor...");
const routeStopsList = new Map(); // route_id → sorted Array<dist>
for (const stopId in stopRoutes) {
  for (const r of stopRoutes[stopId]) {
    if (typeof r.dist !== "number") continue;
    if (!routeStopsList.has(r.id)) routeStopsList.set(r.id, []);
    routeStopsList.get(r.id).push(r.dist);
  }
}
for (const dists of routeStopsList.values()) {
  dists.sort((a, b) => a - b);
}

// Her stop-route eşleşmesine "kendinden önce kaç durak var" bilgisi ekle.
// Bu ETA hesabında kullanılır (her durakta 1 dk bekleme).
for (const stopId in stopRoutes) {
  for (const r of stopRoutes[stopId]) {
    const allDists = routeStopsList.get(r.id);
    if (!allDists || typeof r.dist !== "number") continue;
    // binary search: kendisinden önce kaç durak var (kendisi dahil değil)
    let lo = 0;
    let hi = allDists.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (allDists[mid] < r.dist - 0.005) lo = mid + 1;
      else hi = mid;
    }
    r.before = lo;
  }
}

// ─── 7. routes.json + stop-routes.json + route-stops.json ──────────────────
const routesPath = resolve(OUT_DIR, "routes.json");
const routesJson = JSON.stringify(routeList);
writeFileSync(routesPath, routesJson);
console.log(`  routes.json — ${routeList.length} hat — ${(Buffer.byteLength(routesJson) / 1024).toFixed(1)} KB`);

const stopRoutesPath = resolve(OUT_DIR, "stop-routes.json");
const stopRoutesJson = JSON.stringify(stopRoutes);
writeFileSync(stopRoutesPath, stopRoutesJson);
console.log(`  stop-routes.json — ${matchedCount} durak — ${(Buffer.byteLength(stopRoutesJson) / 1024).toFixed(1)} KB`);

// route-stops.json: ghost bus simülasyonu için lazy load
const routeStopsObj = Object.fromEntries(
  Array.from(routeStopsList.entries()).map(([k, v]) => [
    k,
    // 2 ondalık (10 m) yeterli, JSON boyutu için
    v.map(d => Math.round(d * 100) / 100),
  ])
);
const routeStopsPath = resolve(OUT_DIR, "route-stops.json");
const routeStopsJson = JSON.stringify(routeStopsObj);
writeFileSync(routeStopsPath, routeStopsJson);
console.log(`  route-stops.json — ${routeStopsList.size} hat — ${(Buffer.byteLength(routeStopsJson) / 1024).toFixed(1)} KB`);

// ─── 7. KENTKART BAYİLERİ ───────────────────────────────────────────────────
// places.txt: kiosk_no, owner, distirict, term_no, lat, lon, title, term_type, address
console.log("Kentkart bayileri okunuyor...");
const rawPlaces = readCsv(resolve(RAW, "places.txt"));
const kentkart = [];
for (const p of rawPlaces) {
  const lat = parseFloat(p.lat);
  const lng = parseFloat(p.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  const title = (p.title || "").trim();
  const owner = (p.owner || "").trim();
  const address = (p.address || "").trim();
  kentkart.push({
    id: `kentkart-${(p.term_no || "").trim() || (p.kiosk_no || "").trim() || kentkart.length}`,
    name: title || owner || "Kentkart Bayisi",
    lat,
    lng,
    address: address || undefined,
    phone: undefined,
  });
}
const kentkartPath = resolve(OUT_POI, "kentkart.json");
const kentkartJson = JSON.stringify(kentkart);
writeFileSync(kentkartPath, kentkartJson);
console.log(`  kentkart.json — ${kentkart.length} bayi — ${(Buffer.byteLength(kentkartJson) / 1024).toFixed(1)} KB`);

console.log("\nTamam.");
