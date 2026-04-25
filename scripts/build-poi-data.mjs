// Kocaeli açık veri portalından indirilen ham dosyalardan haritada
// kullanılacak temiz POI JSON'ları üretir.
//
// Girdi: data/gtfs-raw/ altındaki çeşitli ham dosyalar
// Çıktı: public/data/poi/*.json — { id, name, lat, lng, ... }
//
// Kullanım: node scripts/build-poi-data.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import proj4 from "proj4";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const RAW = resolve(ROOT, "data/gtfs-raw");
const OUT_DIR = resolve(ROOT, "public/data/poi");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Türkiye TUREF / TM30 (EPSG:5254) → WGS84 dönüşümü için tanım
const TUREF_TM30 =
  "+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs";
proj4.defs("TUREF_TM30", TUREF_TM30);

function tmercToLatLng(x, y) {
  const [lng, lat] = proj4("TUREF_TM30", "WGS84", [x, y]);
  return { lat, lng };
}

function clean(s) {
  if (s == null) return undefined;
  const t = String(s).trim();
  return t.length > 0 ? t : undefined;
}

function write(name, items) {
  const path = resolve(OUT_DIR, `${name}.json`);
  const json = JSON.stringify(items);
  writeFileSync(path, json);
  const sizeKb = (Buffer.byteLength(json) / 1024).toFixed(1);
  console.log(`  ✓ ${name}.json — ${items.length} kayıt — ${sizeKb} KB`);
}

// ─── 1) AKILLI DURAKLAR (xlsx) ──────────────────────────────────────────────
{
  console.log("\nAkıllı Duraklar:");
  const wb = XLSX.readFile(
    resolve(RAW, "Akıllı Durak Ekran Bilgileri.xlsx")
  );
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  const items = [];
  for (const r of rows) {
    const headerVal = r["AKILLI DURAK EKRAN BİLGİLERİ"];
    if (headerVal === "SIRA") continue;
    const stopId = r["__EMPTY_3"];
    const name = r["__EMPTY_2"];
    const ilce = r["__EMPTY"];
    const mahalle = r["__EMPTY_1"];
    const latStr = r["__EMPTY_4"];
    const lngStr = r["__EMPTY_5"];
    if (latStr == null || lngStr == null) continue;
    const lat = parseFloat(String(latStr).replace(",", ".").trim());
    const lng = parseFloat(String(lngStr).replace(",", ".").trim());
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    items.push({
      id: `akilli-${stopId}`,
      stopId: stopId != null ? String(stopId) : undefined,
      name: clean(name),
      lat,
      lng,
      ilce: clean(ilce),
      mahalle: clean(mahalle),
    });
  }
  write("akilli-durak", items);
}

// ─── 2) EDS NOKTALARI (xls) ─────────────────────────────────────────────────
{
  console.log("\nEDS (Elektronik Denetleme Sistemi):");
  const wb = XLSX.readFile(resolve(RAW, "eds-noktalar.xls"));
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  const items = [];
  for (const r of rows) {
    const lat = parseFloat(
      String(r["Enlem"] ?? "")
        .replace("°", "")
        .replace(",", ".")
        .trim()
    );
    const lng = parseFloat(
      String(r["Boylam"] ?? "")
        .replace("°", "")
        .replace(",", ".")
        .trim()
    );
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    items.push({
      id: `eds-${clean(r["AÇIKLAMA"]) || items.length}`,
      name: clean(r["ADI"]),
      lat,
      lng,
      ilce: clean(r["İLÇE"]),
      address: clean(r["MAHALLE"]),
      code: clean(r["AÇIKLAMA"]),
    });
  }
  write("eds", items);
}

// ─── 3) PETROL İSTASYONLARI (GeoJSON, EPSG:4326) ────────────────────────────
{
  console.log("\nPetrol İstasyonları:");
  const f = JSON.parse(
    readFileSync(resolve(RAW, "petrol-istasyonlar.json"), "utf8")
  );
  const items = [];
  for (const ft of f.features || []) {
    const [lng, lat] = ft.geometry?.coordinates || [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const p = ft.properties || {};
    items.push({
      id: `petrol-${p.poi_id || ft.id}`,
      name: clean(p.adi) || "Petrol İstasyonu",
      lat,
      lng,
      address: clean(p.adres),
      phone: clean(p.telefon),
    });
  }
  write("petrol", items);
}

// ─── 4) OTOPARK — açık + ücretsiz birleşik ─────────────────────────────────
{
  console.log("\nOtopark (açık + ücretsiz):");
  const items = [];

  // Açık otopark — EPSG:4326 GeoJSON
  const acik = JSON.parse(readFileSync(resolve(RAW, "ack-otopark_.json"), "utf8"));
  for (const ft of acik.features || []) {
    const [lng, lat] = ft.geometry?.coordinates || [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const p = ft.properties || {};
    items.push({
      id: `otopark-acik-${p.poi_id || ft.id}`,
      name: clean(p.adi) || "Açık Otopark",
      lat,
      lng,
      address: clean(p.adres),
      phone: clean(p.telefon),
      tip: "acik",
    });
  }

  // Ücretsiz otopark — ESRI ArcGIS WKID 5254
  const ucretsiz = JSON.parse(
    readFileSync(resolve(RAW, "ucretsiz_otoparklar.json"), "utf8")
  );
  for (const ft of ucretsiz.features || []) {
    const x = ft.geometry?.x;
    const y = ft.geometry?.y;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const { lat, lng } = tmercToLatLng(x, y);
    const a = ft.attributes || {};
    items.push({
      id: `otopark-ucretsiz-${a.objectid}`,
      name: clean(a.adi) || "Ücretsiz Otopark",
      lat,
      lng,
      address: clean(a.adres),
      ilce: clean(a.ILCE_ADI),
      mahalle: clean(a.MAHALLE_ADI),
      tip: "ucretsiz",
    });
  }

  write("otopark", items);
}

// ─── 5) TAKSİ DURAKLARI (ESRI ArcGIS WKID 5254) ─────────────────────────────
{
  console.log("\nTaksi Durakları:");
  const f = JSON.parse(readFileSync(resolve(RAW, "taksi_duraklar.json"), "utf8"));
  const items = [];
  for (const ft of f.features || []) {
    const x = ft.geometry?.x;
    const y = ft.geometry?.y;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const { lat, lng } = tmercToLatLng(x, y);
    const a = ft.attributes || {};
    items.push({
      id: `taksi-${a.objectid}`,
      name: clean(a.adi) || "Taksi Durağı",
      lat,
      lng,
      address: clean(a.adres),
      ilce: clean(a.ILCE_ADI),
      mahalle: clean(a.MAHALLE_ADI),
    });
  }
  write("taksi", items);
}

console.log("\nTamam.");
