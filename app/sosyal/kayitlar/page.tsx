"use client";

import { useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { socialApi } from "@/lib/api";
import { PostCard } from "@/components/social/PostCard";
import type { SocialPost } from "@/lib/types/social";

export default function BookmarksPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialApi
      .getBookmarks()
      .then(p => setPosts(p as unknown as SocialPost[]))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <Bookmark className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-extrabold">Kayıtlar</h1>
      </header>
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!loading && posts.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Henüz kayıt yok. Beğendiğin gönderileri kaydet, daha sonra burada bul.
        </p>
      )}
      {!loading && posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
