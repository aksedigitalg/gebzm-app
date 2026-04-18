"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X, Calendar, MessageSquare, Tag } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

const typeIcon: Record<string, typeof Bell> = {
  reservation: Calendar,
  message: MessageSquare,
  listing: Tag,
};

function getNotifLink(notif: Notif, endpoint: string): string {
  switch (notif.type) {
    case "message": return endpoint === "business" ? "/isletme/mesajlar" : "/profil/mesajlar";
    case "reservation": return endpoint === "business" ? "/isletme/rezervasyonlar" : "/profil/rezervasyonlarim";
    case "listing": return "/ilanlar";
    default: return "#";
  }
}

interface Props {
  token: string;
  endpoint: "user" | "business" | "admin";
}

export function NotificationBell({ token, endpoint }: Props) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.is_read).length;

  const load = async () => {
    if (!token) return;
    try {
      const path = endpoint === "admin" ? "/admin/notifications"
        : endpoint === "business" ? "/business/notifications"
        : "/user/notifications";
      const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifs(await res.json());
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    if (!token) return;
    const path = endpoint === "admin" ? "/admin/notifications/read-all"
      : endpoint === "business" ? "/business/notifications/read-all"
      : "/user/notifications/read-all";
    await fetch(`${API}${path}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(!open); if (!open) load(); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Bildirimler</p>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] font-medium text-primary hover:underline">
                  Tümünü oku
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="mt-2 text-xs text-muted-foreground">Henüz bildirim yok</p>
              </div>
            ) : (
              notifs.map((n) => {
                const Icon = typeIcon[n.type] || Bell;
                const link = getNotifLink(n, endpoint);
                return (
                  <Link key={n.id} href={link} onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 border-b border-border px-4 py-3 transition hover:bg-muted/40 ${!n.is_read ? "bg-primary/5" : ""}`}>
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.is_read ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">{n.title}</p>
                      {n.body && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
