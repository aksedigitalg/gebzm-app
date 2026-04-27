"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Loader2, UserPlus } from "lucide-react";
import { getUser } from "@/lib/auth";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "https://gebzem.app/api/v1";

export default function SocialNotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const u = getUser();
    if (!u?.token) return;
    const headers = { Authorization: `Bearer ${u.token}` };

    Promise.all([
      fetch(`${API}/user/notifications`, { headers })
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`${API}/social/follow/requests`, { headers })
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(([notifList, requests]) => {
      const filtered = (notifList as Notification[]).filter(n =>
        n.type.startsWith("social_")
      );
      setNotifs(filtered);
      setPendingCount(Array.isArray(requests) ? requests.length : 0);
      setLoading(false);
      // Read-all
      fetch(`${API}/user/notifications/read-all`, { method: "PUT", headers }).catch(() => {});
    });
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <Bell className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-extrabold">Bildirimler</h1>
      </header>

      {pendingCount > 0 && (
        <Link
          href="/sosyal/istekler"
          className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-3 transition hover:bg-primary/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {pendingCount} takip isteği
            </p>
            <p className="text-xs text-muted-foreground">İncelemek için tıkla</p>
          </div>
        </Link>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && notifs.length === 0 && pendingCount === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Bildirim yok
        </p>
      )}

      {!loading &&
        notifs.map(n => (
          <article
            key={n.id}
            className={`border-b border-border px-4 py-3 ${
              !n.is_read ? "bg-primary/5" : ""
            }`}
          >
            <p className="text-sm font-bold">{n.title}</p>
            {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
            <p className="mt-1 text-[10px] text-muted-foreground">
              {new Date(n.created_at).toLocaleString("tr-TR")}
            </p>
          </article>
        ))}
    </div>
  );
}
