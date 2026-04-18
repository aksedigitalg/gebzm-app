export interface AuthUser {
  phone: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  id?: string;
}

const USER_KEY = "gebzem_user";
const ONBOARDED_KEY = "gebzem_onboarded";
const BUILD_KEY = "gebzem_build_id";

export const CURRENT_BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID || "dev";

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDED_KEY) === "1";
}

export function setOnboarded() {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDED_KEY, "1");
}

/**
 * Yeni bir deploy algilanirsa onboarding bayragini sifirlar.
 * Boylece her PWA guncellemesinden sonra onboarding 1 kez gosterilir,
 * sonrasinda (ayni build icinde) giris/cikis yapsa bile tekrar gosterilmez.
 */
export function syncBuildVersion(): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(BUILD_KEY);
  if (stored !== CURRENT_BUILD_ID) {
    localStorage.removeItem(ONBOARDED_KEY);
    localStorage.setItem(BUILD_KEY, CURRENT_BUILD_ID);
  }
}

export const AUTH_ROUTES = [
  "/onboarding",
  "/giris",
  "/kayit",
  "/sifremi-unuttum",
];

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}
