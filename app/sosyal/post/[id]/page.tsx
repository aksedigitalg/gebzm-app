"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { socialApi } from "@/lib/api";
import { PostCard } from "@/components/social/PostCard";
import { PostComposer } from "@/components/social/PostComposer";
import type { SocialPost, SocialProfile } from "@/lib/types/social";

export default function PostDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<SocialPost | null>(null);
  const [comments, setComments] = useState<SocialPost[]>([]);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [p, c, mine] = await Promise.all([
        socialApi.getPost(id),
        socialApi.getComments(id),
        socialApi.getMyProfile().catch(() => null),
      ]);
      setPost(p as unknown as SocialPost);
      setComments(c as unknown as SocialPost[]);
      if (mine) setProfile(mine as unknown as SocialProfile);
      setError("");

      // View tracking
      socialApi.trackView(id).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderi yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePosted = () => load();

  const handleDelete = (deletedId: string) => {
    if (deletedId === id) {
      router.push("/sosyal");
    } else {
      setComments(c => c.filter(x => x.id !== deletedId));
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold">Gönderi</h1>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && error && <p className="p-4 text-sm text-rose-600">{error}</p>}

      {!loading && post && (
        <>
          <PostCard post={post} onDelete={handleDelete} />
          <PostComposer
            profile={profile}
            parentId={post.id}
            placeholder="Yorumunu yaz..."
            onPosted={handlePosted}
          />
          {comments.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Henüz yorum yok. İlk yorumu sen yap.
            </p>
          )}
          {comments.map(c => (
            <PostCard key={c.id} post={c} onDelete={handleDelete} />
          ))}
        </>
      )}
    </div>
  );
}
