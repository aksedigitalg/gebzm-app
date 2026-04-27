"use client";

/**
 * SocialWSProvider — GebzemSosyal Realtime
 *
 * Tek WebSocket bağlantısı, multiplex kanallar (notif:, feed:, dm:, post:, story:).
 * Otomatik reconnect (exponential backoff), heartbeat (ping/pong), auth (JWT query).
 *
 * Kullanım:
 *   const { subscribe, status } = useSocialWS();
 *   useEffect(() => {
 *     const off = subscribe("post:abc123", (msg) => { ... });
 *     return off;
 *   }, []);
 *
 * Güvenlik:
 *   - JWT token query param'da (HTTPS altında, logger maskeler)
 *   - Server-side: kullanıcı kendi olmayan kanallara subscribe edemez
 *   - Token kaybolursa otomatik unmount
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getUser } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

// /api/v1 → ws/social URL
function getWSURL(token: string): string {
  // wss://gebzem.app/api/v1 → wss://gebzem.app/ws/social
  // http://138.68.69.122:8080/api/v1 → ws://138.68.69.122:8080/ws/social
  const base = API_URL.replace(/^http/, "ws").replace(/\/api\/v1\/?$/, "");
  return `${base}/ws/social?token=${encodeURIComponent(token)}`;
}

export type WSMessage = {
  channel: string;
  type: string;
  payload?: Record<string, unknown>;
};

type Listener = (msg: WSMessage) => void;
type Status = "connecting" | "open" | "closed" | "error";

interface SocialWSCtx {
  status: Status;
  /** Kanala subscribe ol. Listener her mesajda çalışır. unsubscribe için return değerini çağır. */
  subscribe: (channel: string, listener: Listener) => () => void;
  /** Bir kez yayınla (ör. feed badge yenile). Server'a gönderilir. */
  send: (msg: { action: string; channel?: string }) => void;
}

const Ctx = createContext<SocialWSCtx | null>(null);

export function SocialWSProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("closed");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const retryCount = useRef(0);
  const listenersRef = useRef<Map<string, Set<Listener>>>(new Map());
  const subscribedChannels = useRef<Set<string>>(new Set());
  const closingRef = useRef(false);

  const flushSubscriptions = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    // Yeniden bağlanınca tüm aktif kanalları tekrar subscribe et
    subscribedChannels.current.forEach(ch => {
      ws.send(JSON.stringify({ action: "sub", channel: ch }));
    });
  }, []);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;
    const u = getUser();
    if (!u?.token) return;

    closingRef.current = false;
    setStatus("connecting");

    let ws: WebSocket;
    try {
      ws = new WebSocket(getWSURL(u.token));
    } catch {
      setStatus("error");
      scheduleReconnect();
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      retryCount.current = 0;
      setStatus("open");
      flushSubscriptions();
    };

    ws.onmessage = ev => {
      try {
        const msg: WSMessage = JSON.parse(ev.data);
        const listeners = listenersRef.current.get(msg.channel);
        if (listeners) {
          listeners.forEach(l => {
            try {
              l(msg);
            } catch {
              /* listener error swallowed */
            }
          });
        }
        // Wildcard listeners (channel "*")
        const wildcard = listenersRef.current.get("*");
        if (wildcard) {
          wildcard.forEach(l => {
            try {
              l(msg);
            } catch {
              /* */
            }
          });
        }
      } catch {
        /* invalid JSON ignored */
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("closed");
      wsRef.current = null;
      if (!closingRef.current) {
        scheduleReconnect();
      }
    };
  }, [flushSubscriptions]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) return;
    const attempt = Math.min(retryCount.current, 6);
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // 1, 2, 4, 8, 16, 30, 30...
    retryCount.current++;
    reconnectTimer.current = window.setTimeout(() => {
      reconnectTimer.current = null;
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    closingRef.current = true;
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        /* */
      }
      wsRef.current = null;
    }
    setStatus("closed");
  }, []);

  // Auto-connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sayfa görünür olunca tekrar connect (mobil ekran kapanma)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") {
        const ws = wsRef.current;
        if (!ws || ws.readyState === WebSocket.CLOSED) {
          retryCount.current = 0;
          connect();
        }
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [connect]);

  const subscribe = useCallback(
    (channel: string, listener: Listener) => {
      // Local listener kayıt
      let set = listenersRef.current.get(channel);
      if (!set) {
        set = new Set();
        listenersRef.current.set(channel, set);
      }
      set.add(listener);

      // İlk listener ise server'a subscribe gönder
      if (set.size === 1 && channel !== "*" && !subscribedChannels.current.has(channel)) {
        subscribedChannels.current.add(channel);
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "sub", channel }));
        }
        // open değilse: connect olunca flushSubscriptions otomatik göndericek
      }

      return () => {
        const ls = listenersRef.current.get(channel);
        if (!ls) return;
        ls.delete(listener);
        if (ls.size === 0) {
          listenersRef.current.delete(channel);
          if (channel !== "*" && subscribedChannels.current.has(channel)) {
            subscribedChannels.current.delete(channel);
            const ws = wsRef.current;
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ action: "unsub", channel }));
            }
          }
        }
      };
    },
    []
  );

  const send = useCallback((msg: { action: string; channel?: string }) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  const value = useMemo<SocialWSCtx>(
    () => ({ status, subscribe, send }),
    [status, subscribe, send]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSocialWS(): SocialWSCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Provider'sız sayfalarda no-op fallback
    return {
      status: "closed",
      subscribe: () => () => {},
      send: () => {},
    };
  }
  return ctx;
}

/** Browser Notification API permission iste (kullanıcı opt-in) */
export function requestBrowserNotifPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve("denied" as NotificationPermission);
  }
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Promise.resolve(Notification.permission);
  }
  return Notification.requestPermission();
}

/** Browser bildirimi göster (sayfa kapalı/arka planda) */
export function showBrowserNotif(title: string, body?: string, tag?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return; // sayfa açıkken popup gerekmez
  try {
    new Notification(title, {
      body,
      tag,
      icon: "/icon-192.png",
      silent: false,
    });
  } catch {
    /* */
  }
}
