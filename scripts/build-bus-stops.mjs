// Kocaeli GTFS ham verisinden Gebze duraklarını filtreler.
// Kullanım: npm run build:bus-stops
//
// Önce data/gtfs-raw/ altına Kocaeli açık veri portalındaki GTFS .zip'in
// içeriğini aç (stops.txt, routes.txt, trips.txt, stop_times.txt vb.).
// Bu klasör .gitignore'da, repo'ya girmez.
//
// Çıktı: lib/bus-stops.json — sadece Gebze bbox içindeki duraklar.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const RAW = resolve(ROOT, "data/gtfs-raw");
const OUT_STOPS = resolve(ROOT, "public/data/bus-stops.json");

// Tüm Kocaeli durakları dahil. Sadece geçerli koordinatlı kayıtlar alınır.
// İlçe filtresi istenirse buradan bbox uygulanabilir.

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function readCsv(path) {
  if (!existsSync(path)) {
    console.error(`HATA: ${path} bulunamadı.`);
    console.error(`GTFS dosyalarını ${RAW}/ altına aç ve tekrar dene.`);
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

console.log(`Okunuyor: ${RAW}/stops.txt`);
const allStops = readCsv(resolve(RAW, "stops.txt"));
console.log(`  toplam durak: ${allStops.length}`);

const stops = allStops
  .map(r => ({
    id: r.stop_id,
    name: r.stop_name,
    lat: parseFloat(r.stop_lat),
    lng: parseFloat(r.stop_lon),
  }))
  .filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng));

console.log(`  geçerli koordinatlı: ${stops.length}`);

const json = JSON.stringify(stops);
writeFileSync(OUT_STOPS, json);
const sizeKb = (Buffer.byteLength(json) / 1024).toFixed(1);
console.log(`Yazıldı: ${OUT_STOPS} (${sizeKb} KB)`);
