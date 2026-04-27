"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, User as UserIcon } from "lucide-react";
import { socialApi } from "@/lib/api";

interface FollowEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_verified: boolean;
}

export default function FollowingPage() {
  const { username } = useParams<{ username: string }>();
  const [users, setUsers] = useState<FollowEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    socialApi
      .getFollowing(username)
      .then(list => setUsers(list as unknown as FollowEntry[]))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <Link href={`/sosyal/${username}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-extrabold">Takip Edilenler</h1>
      </header>
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!loading && users.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">Henüz kimseyi takip etmiyor</p>
      )}
      {!loading &&
        users.map(u => (
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
    </div>
  );
}
