"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { socialApi } from "@/lib/api";
import { PostCard } from "@/components/social/PostCard";
import { PostComposer } from "@/components/social/PostComposer";
import { StoryTray } from "@/components/social/StoryTray";
import { useSocialWS } from "@/lib/social-ws";
import { getUser } from "@/lib/auth";
import type { SocialPost, SocialProfile } from "@/lib/types/social";

export default function SocialFeedPage() {
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingNewCount, setPendingNewCount] = useState(0);
  const newPostIds = useRef<Set<string>>(new Set());
  const { subscribe } = useSocialWS();

  const me = typeof window !== "undefined" ? getUser() : null;

  const load = async () => {
    setLoading(true);
    try {
      const [p, list] = await Promise.all([
        socialApi.getMyProfile().catch(() => null),
        socialApi.getFeed(0).catch(() => []),
      ]);
      if (p) setProfile(p as unknown as SocialProfile);
      setPosts(list as unknown as SocialPost[]);
      setError("");
      newPostIds.current.clear();
      setPendingNewCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // WebSocket: feed kanalına bağlan, takip ettiklerin yeni post atınca badge artır
  useEffect(() => {
    if (!me?.id) return;
    const off = subscribe(`feed:${me.id}`, msg => {
      if (msg.type !== "new_post") return;
      const p = (msg.payload as Record<string, unknown>) || {};
      const postID = p.post_id as string | undefined;
      const authorID = p.author_id as string | undefined;
      if (!postID || authorID === me.id) return; // kendi postum zaten ekranda
      if (newPostIds.current.has(postID)) return;
      newPostIds.current.add(postID);
      setPendingNewCount(c => c + 1);
    });
    return off;
  }, [me?.id, subscribe]);

  const handlePosted = () => load();

  const handleDelete = (id: string) => {
    setPosts(p => p.filter(x => x.id !== id));
  };

  const showNewPosts = async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    await load();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-extrabold">Anasayfa</h1>
      </header>

      {/* Story Tray */}
      <StoryTray myAvatar={profile?.avatar_url} myUsername={profile?.username} />

      <PostComposer profile={profile} onPosted={handlePosted} />

      {/* Yeni postlar badge */}
      {pendingNewCount > 0 && (
        <div className="sticky top-[60px] z-[5] flex justify-center bg-gradient-to-b from-card via-card/80 to-transparent px-4 py-2">
          <button
            onClick={showNewPosts}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:scale-105"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            {pendingNewCount} yeni gönderi
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && error && (
        <p className="p-4 text-sm text-rose-600">{error}</p>
      )}

      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="text-base font-bold">Henüz gönderi yok</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Birilerini takip et veya kendin paylaşım yap. Keşfet sekmesinden popüler
            içerikleri görebilirsin.
          </p>
        </div>
      )}

      {!loading &&
        posts.map(p => (
          <PostCard key={p.id} post={p} onDelete={handleDelete} />
        ))}
    </div>
  );
}
