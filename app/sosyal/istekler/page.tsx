"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, User as UserIcon, X } from "lucide-react";
import { socialApi } from "@/lib/api";
import type { FollowRequest } from "@/lib/types/social";

export default function FollowRequestsPage() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = () =>
    socialApi
      .getFollowRequests()
      .then(list => setRequests(list as unknown as FollowRequest[]))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const respond = async (id: string, action: "accept" | "reject") => {
    setActing(id);
    try {
      await socialApi.respondFollowRequest(id, action);
      setRequests(r => r.filter(x => x.user_id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-extrabold">Takip İstekleri</h1>
      </header>
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!loading && requests.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Bekleyen takip isteği yok
        </p>
      )}
      {!loading &&
        requests.map(r => (
          <div
            key={r.user_id}
            className="flex items-center gap-3 border-b border-border px-4 py-3"
          >
            <Link href={`/sosyal/${r.username}`}>
              {r.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={r.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
            </Link>
            <Link href={`/sosyal/${r.username}`} className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{r.display_name}</p>
              <p className="truncate text-xs text-muted-foreground">@{r.username}</p>
            </Link>
            <button
              type="button"
              onClick={() => respond(r.user_id, "reject")}
              disabled={acting === r.user_id}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => respond(r.user_id, "accept")}
              disabled={acting === r.user_id}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
            >
              {acting === r.user_id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
    </div>
  );
}
