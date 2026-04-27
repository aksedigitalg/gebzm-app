"use client";

import { useEffect, useState } from "react";
import { Compass, Loader2 } from "lucide-react";
import { socialApi } from "@/lib/api";
import { PostCard } from "@/components/social/PostCard";
import type { SocialPost } from "@/lib/types/social";

export default function ExplorePage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    socialApi
      .getExplore()
      .then(p => setPosts(p as unknown as SocialPost[]))
      .catch(err => setError(err instanceof Error ? err.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <Compass className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-extrabold">Keşfet</h1>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && error && (
        <p className="p-4 text-sm text-rose-600">{error}</p>
      )}

      {!loading && posts.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Keşfedilecek içerik bulunamadı
        </p>
      )}

      {!loading && posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
