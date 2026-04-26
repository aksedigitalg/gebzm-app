// Güvenlik yardımcıları — XSS önleme, attribute escape, format doğrulama.
//
// Leaflet popup/tooltip HTML'i innerHTML olarak işlenir. Kullanıcıdan veya
// dış kaynaklardan (Nominatim, OSM, GTFS) gelen tüm string'ler bu
// fonksiyonlarla kaçırılmalı.

/**
 * HTML body içine güvenli string. <, >, &, ", ', / karakterleri kaçırılır.
 * Inner text için yeterli; href/src gibi attribute'lar için yeterli DEĞİL.
 */
export function escapeHtml(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
}

/**
 * HTML attribute içine güvenli — özellikle style, href, src.
 * Çift tırnak içinde kullanım için tasarlanmıştır.
 */
export function escapeAttr(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`/g, "&#x60;");
}

/**
 * Hex renk doğrulama — yalnızca geçerli hex (3 veya 6 hane) kabul eder.
 * GTFS gibi dış veri kaynaklarından gelen renkler CSS injection'a karşı
 * süzülmek zorundadır:
 *   "red; background-image: url(javascript:...)"  →  fallback'e döner
 *   "1ea9bd"                                      →  "1ea9bd"
 *   "#1ea9bd"                                     →  "1ea9bd" (# kaldırılır)
 *
 * @param raw       Validate edilecek string
 * @param fallback  Default renk (hex, # olmadan, lowercase)
 * @returns         Geçerli hex (lowercase, # olmadan) veya fallback
 */
export function safeHexColor(raw: unknown, fallback = "0e7490"): string {
  if (raw == null) return fallback;
  const s = String(raw).trim().toLowerCase().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/.test(s)) return s;
  if (/^[0-9a-f]{6}$/.test(s)) return s;
  if (/^[0-9a-f]{8}$/.test(s)) return s.slice(0, 6); // alpha kanal at
  return fallback;
}

/**
 * URL doğrulama — yalnızca http/https şemalarını kabul eder.
 * javascript:, data:, vbscript: gibi tehlikeli şemaları reddeder.
 * Geçersizse boş string döner.
 */
export function safeHttpUrl(raw: unknown): string {
  if (raw == null) return "";
  const s = String(raw).trim();
  try {
    const u = new URL(s);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
    return "";
  } catch {
    return "";
  }
}

/**
 * Telefon numarası temizleme — tel: link için.
 * Yalnızca rakam ve + işareti, en fazla 16 karakter.
 */
export function safePhoneNumber(raw: unknown): string {
  if (raw == null) return "";
  const s = String(raw).replace(/[^+\d]/g, "").slice(0, 16);
  return s;
}

/**
 * Lat/lng doğrulama — koordinatları geçerli aralıkta tut.
 */
export function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
