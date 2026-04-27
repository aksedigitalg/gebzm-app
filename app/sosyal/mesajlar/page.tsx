"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Mail, User as UserIcon } from "lucide-react";
import { socialApi } from "@/lib/api";
import type { DMConversation } from "@/lib/types/social";

export default function DMListPage() {
  const [convs, setConvs] = useState<DMConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      socialApi
        .getDMConversations()
        .then(list => setConvs(list as unknown as DMConversation[]))
        .catch(() => setConvs([]))
        .finally(() => setLoading(false));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <Mail className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-extrabold">Mesajlar</h1>
      </header>
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!loading && convs.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Mesaj yok. Bir profilden mesaj başlat.
        </p>
      )}
      {!loading &&
        convs.map(c => (
          <Link
            key={c.id}
            href={`/sosyal/mesajlar/${c.id}`}
            className="flex items-center gap-3 border-b border-border px-4 py-3 transition hover:bg-muted/30"
          >
            {c.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={c.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-sm font-bold">{c.display_name}</span>
                <span className="truncate text-xs text-muted-foreground">@{c.username}</span>
              </div>
              <p
                className={`truncate text-xs ${
                  c.unread > 0 ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                {c.last_message || "Henüz mesaj yok"}
              </p>
            </div>
            {c.unread > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                {c.unread}
              </span>
            )}
          </Link>
        ))}
    </div>
  );
}
