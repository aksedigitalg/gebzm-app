"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Hash, Loader2 } from "lucide-react";
import { socialApi } from "@/lib/api";
import { PostCard } from "@/components/social/PostCard";
import type { SocialPost } from "@/lib/types/social";

export default function HashtagPage() {
  const router = useRouter();
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tag) return;
    socialApi
      .getPostsByHashtag(tag)
      .then(list => setPosts(list as unknown as SocialPost[]))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [tag]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Hash className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-extrabold">{tag}</h1>
      </header>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Bu etiketle gönderi yok
        </p>
      )}

      {!loading && posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
