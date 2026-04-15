"use client";

// PWA ortami mi yoksa normal tarayici mi?
export function isPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isDesktopWidth(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
}
