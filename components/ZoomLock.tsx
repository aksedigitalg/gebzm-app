"use client";

import { useEffect } from "react";

/**
 * iOS Safari / PWA ortaminda cift dokunma ve pinch zoom hareketlerini engeller.
 * Harita (Leaflet) kendi pinch/zoom handler'larini kullanir, onlara dokunmaz.
 */
export function ZoomLock() {
  useEffect(() => {
    const preventGesture = (e: Event) => e.preventDefault();
    // iOS gesture events
    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("gesturechange", preventGesture);
    document.addEventListener("gestureend", preventGesture);

    // Double-tap zoom engeli (haritayi etkilemez, leaflet kendi tap handle ediyor)
    let lastTouch = 0;
    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouch <= 350) {
        const target = e.target as HTMLElement | null;
        if (target && target.closest(".leaflet-container")) return;
        e.preventDefault();
      }
      lastTouch = now;
    };
    document.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}
