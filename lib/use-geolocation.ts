"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Coords,
  type GeoError,
  type GeoStatus,
  GEO_CACHE_TTL_MS,
  mapPositionError,
  readGeoCache,
  writeGeoCache,
  clearGeoCache,
} from "./geolocation";
import { readConsent } from "./geolocation-consent";

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  // İlk render'da cache'den koordinat varsa hidrate edilsin mi (varsayılan: true)
  hydrateFromCache?: boolean;
}

export interface RequestResult {
  coords: Coords | null;
  error: GeoError | null;
}

export interface UseGeolocationResult {
  coords: Coords | null;
  status: GeoStatus;
  error: GeoError | null;
  hasConsent: boolean;
  // Tek seferlik konum iste — caller stale-state bug'ından kaçınmak için
  // sonucu doğrudan döndürür (state'e güvenmeyin)
  request: () => Promise<RequestResult>;
  // Sürekli takip başlat (kurye, navigasyon vs için)
  startWatch: () => void;
  // Takibi durdur
  stopWatch: () => void;
  // Cache'i ve memory'deki koordinatı temizle (rıza geri çekildiğinde)
  clear: () => void;
  // Manuel konum belirle — desktop'ta GPS olmadığında veya kullanıcı doğru noktayı bilmiyorsa
  setManual: (lat: number, lng: number) => void;
}

// W3C `maximumAge` = tarayıcının kendi "kullanıcının konumu" cache'inin
// kabul edilebilir maksimum yaşı. Yüksek değer = eski/yanlış konum riski.
// Bizim 30 dk localStorage cache'imizden ayrı: bunu 0 tutuyoruz ki istek
// her zaman taze cihaz konumunu zorlasın.
const DEFAULT_OPTS: Required<UseGeolocationOptions> = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
  hydrateFromCache: true,
};

export function useGeolocation(
  opts: UseGeolocationOptions = {}
): UseGeolocationResult {
  const o = { ...DEFAULT_OPTS, ...opts };
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<GeoError | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Mount: cache'den hidrate + rıza durumu oku
  useEffect(() => {
    setHasConsent(readConsent() === "granted");
    if (o.hydrateFromCache) {
      const cached = readGeoCache();
      if (cached) {
        setCoords(cached);
        setStatus("success");
      }
    }
    // unmount'ta watch'ı kapat
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const request = useCallback(async (): Promise<RequestResult> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const err: GeoError = {
        code: "unsupported",
        message: "Tarayıcı konum servisini desteklemiyor.",
      };
      setStatus("unsupported");
      setError(err);
      return { coords: null, error: err };
    }

    if (readConsent() !== "granted") {
      const err: GeoError = {
        code: "no_consent",
        message: "Konum kullanımı için açık rıza gereklidir.",
      };
      setError(err);
      return { coords: null, error: err };
    }

    setStatus("requesting");
    setError(null);
    clearGeoCache();

    // ÖNEMLİ: iOS Safari user gesture context'i async hop'larda kaybolur.
    // Permissions.query() preflight'ı KALDIRDIK çünkü mobile'da popup
    // tetiklenmiyordu. Doğrudan getCurrentPosition çağırırız —
    // PERMISSION_DENIED hatasını sonradan yakalarız.

    // İki aşamalı strateji:
    // 1) GPS yüksek hassasiyet (mobil için ideal)
    // 2) Düşük hassasiyet (WiFi/baz/IP, indoor/desktop fallback)
    const tryOnce = (highAccuracy: boolean, timeout: number) =>
      new Promise<RequestResult>(resolve => {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const c: Coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
              timestamp: pos.timestamp,
            };
            resolve({ coords: c, error: null });
          },
          err => {
            resolve({ coords: null, error: mapPositionError(err) });
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout,
            maximumAge: 0,
          }
        );
      });

    let result = await tryOnce(o.enableHighAccuracy, o.timeout);
    // PERMISSION_DENIED ise fallback'e gerek yok — kullanıcı izin vermedi
    if (
      !result.coords &&
      result.error &&
      result.error.code !== "permission_denied" &&
      o.enableHighAccuracy
    ) {
      result = await tryOnce(false, 8000);
    }

    if (result.coords) {
      setCoords(result.coords);
      setStatus("success");
      writeGeoCache(result.coords);
    } else if (result.error) {
      setError(result.error);
      setStatus("error");
    }
    return result;
  }, [o.enableHighAccuracy, o.timeout]);

  const startWatch = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    if (readConsent() !== "granted") {
      setError({
        code: "no_consent",
        message: "Konum kullanımı için açık rıza gereklidir.",
      });
      return;
    }
    if (watchIdRef.current !== null) return; // zaten çalışıyor

    setStatus("watching");
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const c: Coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        };
        setCoords(c);
        writeGeoCache(c);
      },
      err => {
        const e = mapPositionError(err);
        setError(e);
        setStatus("error");
      },
      {
        enableHighAccuracy: o.enableHighAccuracy,
        timeout: o.timeout,
        maximumAge: o.maximumAge,
      }
    );
  }, [o.enableHighAccuracy, o.timeout, o.maximumAge]);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (status === "watching") setStatus("success");
  }, [status]);

  const clear = useCallback(() => {
    setCoords(null);
    setError(null);
    setStatus("idle");
    clearGeoCache();
  }, []);

  const setManual = useCallback((lat: number, lng: number) => {
    const c: Coords = {
      lat,
      lng,
      accuracy: 0, // manuel = nokta atışı
      timestamp: Date.now(),
    };
    setCoords(c);
    setStatus("success");
    setError(null);
    writeGeoCache(c);
  }, []);

  return {
    coords,
    status,
    error,
    hasConsent,
    request,
    startWatch,
    stopWatch,
    clear,
    setManual,
  };
}
