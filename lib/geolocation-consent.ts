// KVKK 2026/347 ilke kararı uyarınca açık rıza yönetimi.
// Tarayıcı izni (browser permission) ve KVKK açık rıza (kullanıcı bilinçli onay)
// AYRI iki kavramdır. Tarayıcı izni "yes" olsa bile biz KVKK rızası alınmadan
// konum istemeyiz.

const CONSENT_KEY = "gebzem_geo_consent";

export type ConsentState = "granted" | "denied" | "unknown";

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === "granted" || v === "denied") return v;
  return "unknown";
}

export function setConsent(state: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, state);
}

export function clearConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_KEY);
}
