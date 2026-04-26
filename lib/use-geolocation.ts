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
  queryGeolocationPermission,
} from "./geolocation";
import { readConsent } from "./geolocation-consent";

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  // İlk render'da cache'den koordinat varsa hidrate edilsin mi (varsayılan: true)
  hydrateFromCache?: boolean;
}

export interface UseGeolocationResult {
  coords: Coords | null;
  status: GeoStatus;
  error: GeoError | null;
  hasConsent: boolean;
  // Tek seferlik konum iste — KVKK rızası kontrol eder, yoksa "no_consent" hatası döner
  request: () => Promise<Coords | null>;
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

  const request = useCallback(async (): Promise<Coords | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const err: GeoError = {
        code: "unsupported",
        message: "Tarayıcı konum servisini desteklemiyor.",
      };
      setStatus("unsupported");
      setError(err);
      return null;
    }

    if (readConsent() !== "granted") {
      const err: GeoError = {
        code: "no_consent",
        message: "Konum kullanımı için açık rıza gereklidir.",
      };
      setError(err);
      return null;
    }

    setStatus("requesting");
    setError(null);
    // Kullanıcı bilinçli olarak konum istiyor — eski localStorage cache'ini at,
    // taze cihaz konumunu zorla.
    clearGeoCache();

    // Permissions API ile preflight: tarayıcı önceden engellendi mi?
    // Engellendiyse hem kullanıcıya doğru hata gösteririz, hem de
    // gereksiz getCurrentPosition çağrısı yapmayız.
    const perm = await queryGeolocationPermission();
    if (perm === "denied") {
      const err: GeoError = {
        code: "permission_denied",
        message:
          "Tarayıcı konum erişimini daha önce engellemişsin. Adres çubuğundaki kilit ikonuna tıkla → Konum → İzin Ver → sayfayı yenile.",
      };
      setError(err);
      setStatus("error");
      return null;
    }

    return new Promise<Coords | null>(resolve => {
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
          setCoords(c);
          setStatus("success");
          writeGeoCache(c);
          resolve(c);
        },
        err => {
          const e = mapPositionError(err);
          setError(e);
          setStatus("error");
          resolve(null);
        },
        {
          enableHighAccuracy: o.enableHighAccuracy,
          timeout: o.timeout,
          maximumAge: o.maximumAge,
        }
      );
    });
  }, [o.enableHighAccuracy, o.timeout, o.maximumAge]);

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
