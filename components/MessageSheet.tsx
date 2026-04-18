"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { timeAgoTR } from "@/lib/format";

interface Conv {
  id: string;
  business_name: string;
  last_message: string;
  updated_at: string;
}

export function MessageSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    const user = getUser();
    if (!user?.token) return;
    try {
      const data = await api.user.getConversations() as Conv[];
      setConvs(data);
      // En son 5 dakikadaki mesajları "okunmamış" say
      const fiveMin = Date.now() - 5 * 60 * 1000;
      setUnread(data.filter(c => new Date(c.updated_at).getTime() > fiveMin).length);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => {
        const opening = !open;
        setOpen(opening);
        if (opening) {
          load();
          // Badge'i temizle
          setTimeout(() => setUnread(0), 1000);
        }
      }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted">
        <MessageSquare className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Mesajlar</p>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto no-scrollbar">
            {convs.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="mt-2 text-xs text-muted-foreground">Henüz mesajınız yok</p>
              </div>
            ) : (
              convs.map((c) => (
                <button key={c.id}
                  onClick={() => { router.push("/profil/mesajlar"); setOpen(false); }}
                  className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted/40">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground">
                    {c.business_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{c.business_name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{c.last_message || "..."}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgoTR(c.updated_at)}</span>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-border px-4 py-2">
            <button onClick={() => { router.push("/profil/mesajlar"); setOpen(false); }}
              className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline">
              Tüm mesajları gör <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
