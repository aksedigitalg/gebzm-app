"use client";

export interface AdminSession {
  email: string;
  name: string;
  token?: string;
}

export interface BusinessSession {
  id: string;
  name: string;
  type: string; // BusinessTypeId slug (restoran, doktor, vs.)
  email: string;
  token?: string;
}

const ADMIN_KEY = "gebzem_admin";
const BUSINESS_KEY = "gebzem_business";

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(s: AdminSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_KEY, JSON.stringify(s));
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_KEY);
}

export function getBusinessSession(): BusinessSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BUSINESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setBusinessSession(s: BusinessSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(s));
}

export function clearBusinessSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BUSINESS_KEY);
}

export function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isBusinessRoute(pathname: string) {
  return pathname === "/isletme" || pathname.startsWith("/isletme/");
}
