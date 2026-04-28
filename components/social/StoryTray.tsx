"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, User as UserIcon } from "lucide-react";
import { socialApi } from "@/lib/api";
import { useSocialWS } from "@/lib/social-ws";
import type { StoryGroup } from "@/lib/types/story";

/**
 * StoryTray — feed üstü yatay scroll story bandı
 *
 * Davranış:
 *  - "Senin story'n" kart en başta (kendin yoksa "+", varsa avatar+ring)
 *  - Diğerleri: takip ettiklerin (gradient ring = okunmamış, gri ring = tümü okundu)
 *  - Tıklayınca /sosyal/story/[id] (ilk hikaye)
 *  - WS: yeni story (story_created) ve view (story_view) sinyalinde tray refresh
 *  - Kendi user_id'mizi localStorage'dan alıyoruz; profile prop yüklenmeden de eşleşir
 */
export function StoryTray({ myAvatar, myUsername }: { myAvatar?: string; myUsername?: string }) {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useSocialWS();

  // user_id senkron, mount'ta hazır — username prop async yüklendiği için fallback
  const myUserID = useMemo(() => {
    if (typeof window === "undefined") return "";
    try {
      const u = localStorage.getItem("gebzem_user");
      return u ? JSON.parse(u)?.id || "" : "";
    } catch {
      return "";
    }
  }, []);

  const load = async () => {
    try {
      const list = await socialApi.getStories();
      setGroups((list as unknown as StoryGroup[]) || []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // WS: story:<userID> kanalından her sinyal tray'i yeniler
  // (story_created — yeni story atıldı, story_view — birinin viewd ettiği bilgisi)
  useEffect(() => {
    if (!myUserID) return;
    const off = subscribe(`story:${myUserID}`, () => {
      load();
    });
    return off;
  }, [myUserID, subscribe]);

  // Sayfa odağa dönünce (composer'dan dönüş, başka tab'tan dönüş) yeniden yükle
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  if (loading) {
    return (
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex gap-3 overflow-x-auto">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-1.5">
              <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
              <div className="h-2 w-12 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Kendi story'mizi grup olarak ayır — user_id ile eşle (username prop'u async geliyor)
  const me = groups.find(g => g.author_id === myUserID || (myUsername && g.username === myUsername));
  const others = groups.filter(g => g !== me);

  return (
    <div className="border-b border-border bg-card">
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 py-3 no-scrollbar">
        {/* Senin story'n / Yeni story ekle */}
        <Link
          href={me ? `/sosyal/story/${me.stories[0].id}` : "/sosyal/story/yeni"}
          className="flex shrink-0 flex-col items-center gap-1.5"
          aria-label={me ? "Senin story'n" : "Yeni story ekle"}
        >
          <div className="relative">
            <div
              className={`h-16 w-16 rounded-full p-[2px] ${
                me && !me.all_seen
                  ? "bg-gradient-to-tr from-fuchsia-500 via-amber-500 to-rose-500"
                  : "bg-muted"
              }`}
            >
              <div className="h-full w-full rounded-full bg-card p-[2px]">
                {myAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={myAvatar}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>
            {/* + butonu */}
            <Link
              href="/sosyal/story/yeni"
              onClick={e => e.stopPropagation()}
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary text-white"
            >
              <Plus className="h-3 w-3" />
            </Link>
          </div>
          <span className="max-w-[64px] truncate text-[11px] font-medium">
            {me ? "Senin story'n" : "Story ekle"}
          </span>
        </Link>

        {/* Diğerleri */}
        {others.map(g => (
          <Link
            key={g.author_id}
            href={`/sosyal/story/${g.stories[0].id}`}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <div
              className={`h-16 w-16 rounded-full p-[2px] ${
                g.all_seen
                  ? "bg-muted"
                  : "bg-gradient-to-tr from-fuchsia-500 via-amber-500 to-rose-500"
              }`}
            >
              <div className="h-full w-full rounded-full bg-card p-[2px]">
                {g.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={g.avatar_url}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary text-base font-bold">
                    {g.display_name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
            </div>
            <span className="max-w-[64px] truncate text-[11px] font-medium">
              {g.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
