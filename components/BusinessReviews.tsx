"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { api, publicApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { AuthModal } from "@/components/AuthModal";
import type { Review, ReviewStats } from "@/lib/types/review";

interface Props {
  businessId: string;
  businessName: string;
}

export function BusinessReviews({ businessId, businessName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [writeOpen, setWriteOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [eligibility, setEligibility] = useState<{
    can_review: boolean;
    has_standalone: boolean;
    eligible_orders: Array<{ id: string; created_at: string }>;
  } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [list, statsData] = await Promise.all([
        publicApi.getBusinessReviews(businessId).catch(() => []),
        publicApi.getBusinessReviewStats(businessId).catch(() => null),
      ]);
      setReviews(list as Review[]);
      setStats(statsData as ReviewStats | null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // Login varsa eligibility'yi de çek
    const u = getUser();
    if (u?.token) {
      api.user
        .getReviewEligibility(businessId)
        .then(setEligibility)
        .catch(() => setEligibility(null));
    }
  }, [businessId]);

  const handleWriteClick = () => {
    const u = getUser();
    if (!u?.token) {
      setAuthOpen(true);
      return;
    }
    setWriteOpen(true);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4 text-primary" />
          Yorumlar {stats && stats.count > 0 && `(${stats.count})`}
        </h2>
        <button
          type="button"
          onClick={handleWriteClick}
          className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white transition active:scale-95"
        >
          Yorum Yaz
        </button>
      </div>

      {/* İstatistik */}
      {stats && stats.count > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-muted/40 p-3">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold text-amber-500">
              {stats.average_rating.toFixed(1)}
            </span>
            <Stars value={stats.average_rating} size={14} />
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              {stats.count} yorum
            </span>
          </div>
          <div className="flex-1 space-y-0.5">
            {[5, 4, 3, 2, 1].map(n => {
              const count = stats.distribution[String(n)] || 0;
              const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2 text-[11px]">
                  <span className="w-3 text-muted-foreground">{n}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <p className="py-6 text-center text-xs text-muted-foreground">Yükleniyor...</p>
      )}

      {!loading && reviews.length === 0 && (
        <div className="flex flex-col items-center py-8 text-center">
          <MessageSquare className="h-9 w-9 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-2 text-sm font-semibold">Henüz yorum yok</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            İlk yorumu sen yaz
          </p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <ul className="space-y-3">
          {reviews.map(r => (
            <ReviewItem key={r.id} review={r} onDeleted={loadAll} />
          ))}
        </ul>
      )}

      {writeOpen && eligibility && (
        <ReviewWriteDialog
          businessId={businessId}
          businessName={businessName}
          eligibility={eligibility}
          onClose={() => setWriteOpen(false)}
          onSuccess={() => {
            setWriteOpen(false);
            loadAll();
          }}
        />
      )}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          // Yeniden eligibility çek + dialog aç
          api.user
            .getReviewEligibility(businessId)
            .then(e => {
              setEligibility(e);
              setWriteOpen(true);
            })
            .catch(() => {});
        }}
        message="Yorum yazmak için giriş yapın"
      />
    </section>
  );
}

function ReviewItem({ review, onDeleted }: { review: Review; onDeleted: () => void }) {
  const u = typeof window !== "undefined" ? getUser() : null;
  const isOwner = u?.token && u.id === review.user_id;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Yorumunu silmek istediğine emin misin?")) return;
    setDeleting(true);
    try {
      await api.user.deleteReview(review.id);
      onDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silinemedi");
    } finally {
      setDeleting(false);
    }
  };

  const date = new Date(review.created_at).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <li className="rounded-xl border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{review.user_name}</span>
            <Stars value={review.rating} size={13} />
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{date}</p>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-muted-foreground transition hover:text-rose-600 disabled:opacity-50"
            aria-label="Yorumu sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{review.comment}</p>
      {review.business_reply && (
        <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
            İşletmenin Cevabı
          </p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed">
            {review.business_reply}
          </p>
        </div>
      )}
    </li>
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

function ReviewWriteDialog({
  businessId,
  businessName,
  eligibility,
  onClose,
  onSuccess,
}: {
  businessId: string;
  businessName: string;
  eligibility: {
    can_review: boolean;
    has_standalone: boolean;
    eligible_orders: Array<{ id: string; created_at: string }>;
  };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [orderId, setOrderId] = useState<string>(
    eligibility.eligible_orders[0]?.id || ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canWrite = eligibility.can_review;
  const blockReason = !canWrite
    ? "Bu işletmeye zaten yorum yazmışsın. Yeni yorum için tamamlanmış bir sipariş gerekiyor."
    : "";

  const submit = async () => {
    if (comment.trim().length < 3) {
      setError("Yorum en az 3 karakter olmalı");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.user.createReview(businessId, {
        rating,
        comment: comment.trim(),
        order_id: orderId || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-1 text-base font-bold">{businessName}</h3>
        <p className="mb-4 text-xs text-muted-foreground">Deneyimini paylaş</p>

        {!canWrite ? (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            {blockReason}
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  aria-label={`${i} yıldız`}
                >
                  <Star
                    className="h-9 w-9 transition active:scale-90"
                    fill={i <= rating ? "#fbbf24" : "none"}
                    color={i <= rating ? "#fbbf24" : "#d4d4d8"}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>

            {eligibility.eligible_orders.length > 0 && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Sipariş ile bağla (opsiyonel)
                </label>
                <select
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Genel yorum (sipariş bağlama)</option>
                  {eligibility.eligible_orders.map(o => (
                    <option key={o.id} value={o.id}>
                      Sipariş #{o.id.slice(0, 8)} —{" "}
                      {new Date(o.created_at).toLocaleDateString("tr-TR")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value.slice(0, 1000))}
              rows={4}
              maxLength={1000}
              placeholder="Deneyimini yaz..."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {comment.length}/1000
            </p>

            {error && (
              <div className="mt-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}
          </>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            {canWrite ? "Vazgeç" : "Kapat"}
          </button>
          {canWrite && (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {submitting ? "Gönderiliyor..." : "Gönder"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
