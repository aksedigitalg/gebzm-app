"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Search as SearchIcon, User as UserIcon } from "lucide-react";
import { socialApi } from "@/lib/api";
import { PostCard } from "@/components/social/PostCard";
import type { SocialPost } from "@/lib/types/social";

interface SearchUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_verified: boolean;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setUsers([]);
      setPosts([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      socialApi
        .search(q.trim())
        .then(r => {
          setUsers(r.users as unknown as SearchUser[]);
          setPosts(r.posts as unknown as SocialPost[]);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Kullanıcı veya gönderi ara..."
            className="w-full bg-transparent text-sm outline-none"
            autoFocus
          />
        </div>
      </header>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && q.trim().length < 2 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          En az 2 karakter girin
        </p>
      )}

      {!loading && q.trim().length >= 2 && users.length === 0 && posts.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Sonuç bulunamadı
        </p>
      )}

      {users.length > 0 && (
        <section>
          <h2 className="border-b border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Kullanıcılar
          </h2>
          {users.map(u => (
            <Link
              key={u.user_id}
              href={`/sosyal/${u.username}`}
              className="flex items-center gap-3 border-b border-border px-4 py-3 transition hover:bg-muted/30"
            >
              {u.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={u.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate text-sm font-bold">{u.display_name}</span>
                  {u.is_verified && <CheckCircle2 className="h-3 w-3 fill-primary text-white" />}
                </div>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
              </div>
            </Link>
          ))}
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="border-b border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Gönderiler
          </h2>
          {posts.map(p => (
            <PostCard key={p.id} post={p} />
          ))}
        </section>
      )}
    </div>
  );
}
