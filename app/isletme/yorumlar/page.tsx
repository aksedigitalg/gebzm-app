"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Reply, Send, Star } from "lucide-react";
import { api } from "@/lib/api";
import { getBusinessSession } from "@/lib/panel-auth";
import type { Review } from "@/lib/types/review";

export default function IsletmeYorumlarPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    const session = getBusinessSession();
    if (!session?.token) {
      router.replace("/isletme/giris");
      return;
    }
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    try {
      const list = (await api.business.getMyReviews()) as Review[];
      setReviews(list || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (id: string) => {
    if (replyText.trim().length < 2) return;
    setReplying(true);
    try {
      await api.business.replyToReview(id, replyText.trim());
      setReplyOpen(null);
      setReplyText("");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cevap kaydedilemedi");
    } finally {
      setReplying(false);
    }
  };

  const stats = (() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    const avg = sum / reviews.length;
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    reviews.forEach(r => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    return { avg, count: reviews.length, dist };
  })();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Yorumlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Müşteri değerlendirmeleri ve cevapların
        </p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && stats && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-amber-500">
                {stats.avg.toFixed(1)}
              </span>
              <Stars value={stats.avg} size={14} />
              <span className="mt-0.5 text-[11px] text-muted-foreground">
                {stats.count} yorum
              </span>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(n => {
                const count = stats.dist[n] || 0;
                const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
                return (
                  <div key={n} className="flex items-center gap-2 text-[12px]">
                    <span className="w-3 text-muted-foreground">{n}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!loading && reviews.length === 0 && !error && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-semibold">Henüz yorum yok</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Müşteriler yorum yazınca burada listelenir
          </p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <ul className="space-y-3">
          {reviews.map(r => (
            <li
              key={r.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{r.user_name}</span>
                    <Stars value={r.rating} size={13} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                    {r.order_id && (
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                        Sipariş #{r.order_id.slice(0, 8)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                {r.comment}
              </p>

              {r.business_reply ? (
                <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Cevabın
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {r.business_replied_at &&
                        new Date(r.business_replied_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
                    {r.business_reply}
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  {replyOpen === r.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value.slice(0, 1000))}
                        rows={3}
                        maxLength={1000}
                        placeholder="Cevabını yaz... (max 1000 karakter)"
                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyOpen(null);
                            setReplyText("");
                          }}
                          className="flex-1 rounded-full border border-border py-2 text-xs font-semibold transition hover:bg-muted"
                        >
                          Vazgeç
                        </button>
                        <button
                          type="button"
                          onClick={() => submitReply(r.id)}
                          disabled={replying || replyText.trim().length < 2}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          <Send className="h-3 w-3" />
                          {replying ? "Gönderiliyor..." : "Cevap Gönder"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyOpen(r.id);
                        setReplyText("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
                    >
                      <Reply className="h-3 w-3" />
                      Cevapla
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }
        />
      ))}
    </span>
  );
}
