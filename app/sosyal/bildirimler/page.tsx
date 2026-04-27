"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Loader2, UserPlus, Heart, MessageSquare, Repeat2, AtSign, Mail, BookOpenCheck, Wifi } from "lucide-react";
import { getUser } from "@/lib/auth";
import { useSocialWS, requestBrowserNotifPermission } from "@/lib/social-ws";
import type { SocialNotification } from "@/lib/types/story";

const API = process.env.NEXT_PUBLIC_API_URL || "https://gebzem.app/api/v1";

const typeIcon: Record<string, typeof Bell> = {
  social_like: Heart,
  social_comment: MessageSquare,
  social_repost: Repeat2,
  social_follow: UserPlus,
  social_follow_request: UserPlus,
  social_follow_accepted: UserPlus,
  social_mention: AtSign,
  social_dm: Mail,
  social_reply: MessageSquare,
  social_story_reply: BookOpenCheck,
};

const typeColor: Record<string, string> = {
  social_like: "text-rose-500 bg-rose-500/10",
  social_comment: "text-sky-500 bg-sky-500/10",
  social_repost: "text-emerald-500 bg-emerald-500/10",
  social_follow: "text-primary bg-primary/10",
  social_follow_request: "text-primary bg-primary/10",
  social_follow_accepted: "text-emerald-500 bg-emerald-500/10",
  social_mention: "text-fuchsia-500 bg-fuchsia-500/10",
  social_dm: "text-amber-500 bg-amber-500/10",
  social_reply: "text-sky-500 bg-sky-500/10",
  social_story_reply: "text-fuchsia-500 bg-fuchsia-500/10",
};

export default function SocialNotificationsPage() {
  const [notifs, setNotifs] = useState<SocialNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { subscribe, status } = useSocialWS();

  const load = async () => {
    const u = getUser();
    if (!u?.token) return;
    const headers = { Authorization: `Bearer ${u.token}` };
    try {
      const [notifList, requests] = await Promise.all([
        fetch(`${API}/user/notifications`, { headers, cache: "no-store" })
          .then(r => (r.ok ? r.json() : []))
          .catch(() => []),
        fetch(`${API}/social/follow/requests`, { headers, cache: "no-store" })
          .then(r => (r.ok ? r.json() : []))
          .catch(() => []),
      ]);
      const filtered = (notifList as SocialNotification[]).filter(n =>
        n.type.startsWith("social_")
      );
      setNotifs(filtered);
      setPendingCount(Array.isArray(requests) ? requests.length : 0);
      // Read-all on view
      fetch(`${API}/user/notifications/read-all`, { method: "PUT", headers }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    requestBrowserNotifPermission().catch(() => {});
  }, []);

  // WebSocket: yeni bildirim gelince listeyi anlık yenile
  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("gebzem_user") : null;
    if (!u) return;
    let userID = "";
    try {
      userID = JSON.parse(u)?.id || "";
    } catch {
      /* */
    }
    if (!userID) return;
    const off = subscribe(`notif:${userID}`, () => {
      load();
    });
    return off;
  }, [subscribe]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <Bell className="h-5 w-5 text-primary" />
        <h1 className="flex-1 text-lg font-extrabold">Bildirimler</h1>
        {status === "open" && (
          <span title="Realtime aktif" className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
            <Wifi className="h-3 w-3" />
            CANLI
          </span>
        )}
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
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-3 text-base font-bold">Henüz bildirim yok</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Birileri seni takip ettiğinde, gönderini beğendiğinde veya etiketlediğinde burada gözükür.
          </p>
        </div>
      )}

      {!loading &&
        notifs.map(n => {
          const Icon = typeIcon[n.type] || Bell;
          const color = typeColor[n.type] || "text-primary bg-primary/10";
          const link = n.target_url || (n.type === "social_dm" ? "/sosyal/mesajlar" : "#");
          const firstActor = n.actors?.[0];
          const Inner = (
            <div className="flex items-start gap-3">
              {firstActor?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={firstActor.avatar_url}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{n.title}</p>
                {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("tr-TR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          );
          if (link === "#") {
            return (
              <article
                key={n.id}
                className={`border-b border-border px-4 py-3 ${!n.is_read ? "bg-primary/5" : ""}`}
              >
                {Inner}
              </article>
            );
          }
          return (
            <Link
              key={n.id}
              href={link}
              className={`block border-b border-border px-4 py-3 transition hover:bg-muted/40 ${!n.is_read ? "bg-primary/5" : ""}`}
            >
              {Inner}
            </Link>
          );
        })}
    </div>
  );
}
