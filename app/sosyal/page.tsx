"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { socialApi } from "@/lib/api";
import { PostCard } from "@/components/social/PostCard";
import { PostComposer } from "@/components/social/PostComposer";
import type { SocialPost, SocialProfile } from "@/lib/types/social";

export default function SocialFeedPage() {
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePosted = () => load();

  const handleDelete = (id: string) => {
    setPosts(p => p.filter(x => x.id !== id));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-extrabold">Anasayfa</h1>
      </header>

      <PostComposer profile={profile} onPosted={handlePosted} />

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
