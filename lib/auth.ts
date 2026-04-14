export interface AuthUser {
  phone: string;
  firstName?: string;
  lastName?: string;
}

const USER_KEY = "gebzem_user";
const ONBOARDED_KEY = "gebzem_onboarded";

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

export const AUTH_ROUTES = [
  "/onboarding",
  "/giris",
  "/kayit",
  "/sifremi-unuttum",
];

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}
