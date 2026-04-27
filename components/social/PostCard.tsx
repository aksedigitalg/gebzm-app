"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share2,
  ThumbsDown,
  Trash2,
  Flag,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { socialApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { SocialPost } from "@/lib/types/social";

interface Props {
  post: SocialPost;
  compact?: boolean;
  onUpdate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PostCard({ post: initial, compact, onUpdate, onDelete }: Props) {
  const router = useRouter();
  const [post, setPost] = useState<SocialPost>(initial);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const me = typeof window !== "undefined" ? getUser() : null;
  const isOwner = me?.id === post.author_id;

  const renderText = (text: string) => {
    // Parse hashtags + mentions
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        const tag = part.substring(1).replace(/[^a-zA-Z0-9_]/g, "");
        if (tag) {
          return (
            <Link
              key={i}
              href={`/sosyal/etiket/${tag.toLowerCase()}`}
              className="text-primary hover:underline"
              onClick={e => e.stopPropagation()}
            >
              #{tag}
            </Link>
          );
        }
      }
      if (part.startsWith("@")) {
        const username = part.substring(1).replace(/[^a-zA-Z0-9_]/g, "");
        if (username) {
          return (
            <Link
              key={i}
              href={`/sosyal/${username}`}
              className="text-primary hover:underline"
              onClick={e => e.stopPropagation()}
            >
              @{username}
            </Link>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleReact = async (e: React.MouseEvent, reaction: "like" | "dislike") => {
    e.stopPropagation();
    if (!me?.token) {
      alert("Önce giriş yap");
      return;
    }
    const next = post.my_reaction === reaction ? "" : reaction;
    // Optimistic
    const oldReaction = post.my_reaction;
    setPost(p => {
      const np = { ...p };
      if (oldReaction === "like") np.likes_count = Math.max(0, p.likes_count - 1);
      if (oldReaction === "dislike") np.dislikes_count = Math.max(0, p.dislikes_count - 1);
      if (next === "like") np.likes_count = p.likes_count + (oldReaction === "like" ? -1 : 1);
      if (next === "dislike") np.dislikes_count = p.dislikes_count + (oldReaction === "dislike" ? -1 : 1);
      np.my_reaction = next as SocialPost["my_reaction"];
      return np;
    });
    try {
      await socialApi.react(post.id, next as "like" | "dislike" | "");
      onUpdate?.(post.id);
    } catch (err) {
      // Revert
      setPost(initial);
      alert(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!me?.token) {
      alert("Önce giriş yap");
      return;
    }
    try {
      const r = await socialApi.bookmark(post.id);
      setPost(p => ({ ...p, is_bookmarked: r.bookmarked }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata");
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!me?.token) {
      alert("Önce giriş yap");
      return;
    }
    if (!confirm("Bu gönderiyi paylaşmak istediğine emin misin?")) return;
    try {
      await socialApi.createPost({ repost_of_id: post.id });
      setPost(p => ({ ...p, reposts_count: p.reposts_count + 1, is_reposted: true }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Paylaşılamadı");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Gönderiyi silmek istediğine emin misin?")) return;
    try {
      await socialApi.deletePost(post.id);
      onDelete?.(post.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silinemedi");
    }
  };

  const goPost = () => router.push(`/sosyal/post/${post.id}`);

  const author = post.author;
  const time = formatRelative(post.created_at);

  return (
    <article
      className="cursor-pointer border-b border-border bg-card px-4 py-3 transition hover:bg-muted/30"
      onClick={goPost}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Link
          href={`/sosyal/${author?.username || ""}`}
          className="shrink-0"
          onClick={e => e.stopPropagation()}
        >
          {author?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={author.avatar_url}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
              {author?.display_name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
              <Link
                href={`/sosyal/${author?.username || ""}`}
                onClick={e => e.stopPropagation()}
                className="hover:underline"
              >
                <span className="text-sm font-bold">{author?.display_name || "Bilinmeyen"}</span>
              </Link>
              {author?.is_verified && (
                <CheckCircle2 className="h-3.5 w-3.5 fill-primary text-white" />
              )}
              <span className="text-xs text-muted-foreground">@{author?.username}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{time}</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setMenuOpen(o => !o);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                  onClick={e => e.stopPropagation()}
                >
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 transition hover:bg-muted"
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        setReportOpen(true);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 transition hover:bg-muted"
                    >
                      <Flag className="h-4 w-4" />
                      Şikayet Et
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Repost banner */}
          {post.repost_of && (
            <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
              <Repeat2 className="mr-1 inline h-3 w-3" />
              {author?.display_name} paylaştı
            </p>
          )}

          {/* Text */}
          {post.text && (
            <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed">
              {renderText(post.text)}
            </p>
          )}

          {/* Quote text (RT with quote) */}
          {post.quote_text && (
            <div className="mt-2 rounded-xl border border-border p-3">
              <p className="whitespace-pre-line text-sm">{renderText(post.quote_text)}</p>
            </div>
          )}

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div
              className={`mt-2 grid gap-1 overflow-hidden rounded-xl border border-border ${
                post.media.length === 1
                  ? "grid-cols-1"
                  : post.media.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2"
              }`}
            >
              {post.media.slice(0, 4).map((m, i) => (
                <div key={i} className="relative aspect-video w-full overflow-hidden bg-muted">
                  {m.type === "video" ? (
                    /* eslint-disable-next-line jsx-a11y/media-has-caption */
                    <video
                      src={m.url}
                      poster={m.thumbnail}
                      controls
                      preload="metadata"
                      className="h-full w-full"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {!compact && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <ActionBtn
                icon={MessageCircle}
                count={post.comments_count}
                onClick={goPost}
              />
              <ActionBtn
                icon={Repeat2}
                count={post.reposts_count}
                active={post.is_reposted}
                onClick={handleRepost}
                color="emerald"
              />
              <ActionBtn
                icon={Heart}
                count={post.likes_count}
                active={post.my_reaction === "like"}
                onClick={e => handleReact(e, "like")}
                color="rose"
              />
              <ActionBtn
                icon={ThumbsDown}
                count={post.dislikes_count}
                active={post.my_reaction === "dislike"}
                onClick={e => handleReact(e, "dislike")}
                color="amber"
              />
              <ActionBtn
                icon={Eye}
                count={post.views_count}
                onClick={e => e.stopPropagation()}
                noHover
              />
              <ActionBtn
                icon={Bookmark}
                active={post.is_bookmarked}
                onClick={handleBookmark}
                color="primary"
              />
            </div>
          )}
        </div>
      </div>

      {reportOpen && (
        <ReportDialog
          targetType="post"
          targetId={post.id}
          onClose={() => setReportOpen(false)}
        />
      )}
    </article>
  );
}

function ActionBtn({
  icon: Icon,
  count,
  active,
  color,
  onClick,
  noHover,
}: {
  icon: typeof Heart;
  count?: number;
  active?: boolean;
  color?: "rose" | "emerald" | "amber" | "primary";
  onClick: (e: React.MouseEvent) => void;
  noHover?: boolean;
}) {
  const colorClass = active
    ? color === "rose"
      ? "text-rose-600"
      : color === "emerald"
        ? "text-emerald-600"
        : color === "amber"
          ? "text-amber-600"
          : color === "primary"
            ? "text-primary"
            : ""
    : "text-muted-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition ${colorClass} ${
        !noHover ? "hover:bg-muted" : ""
      }`}
    >
      <Icon
        className="h-4 w-4"
        fill={active && (color === "rose" || color === "primary") ? "currentColor" : "none"}
      />
      {count !== undefined && count > 0 && <span>{count.toLocaleString("tr-TR")}</span>}
    </button>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return "şimdi";
  if (diff < 3600) return `${Math.floor(diff / 60)}d`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}g`;
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

function ReportDialog({
  targetType,
  targetId,
  onClose,
}: {
  targetType: "post" | "profile";
  targetId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await socialApi.report({
        target_type: targetType,
        target_id: targetId,
        reason,
        description: description.trim() || undefined,
      });
      alert("Şikayetin alındı, inceleyeceğiz");
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata");
    } finally {
      setSubmitting(false);
    }
  };

  const reasons = [
    { value: "spam", label: "Spam / İstenmeyen" },
    { value: "hate", label: "Nefret söylemi" },
    { value: "violence", label: "Şiddet / Tehdit" },
    { value: "harassment", label: "Taciz" },
    { value: "fake", label: "Sahte / Yanıltıcı" },
    { value: "sexual", label: "Cinsel içerik" },
    { value: "other", label: "Diğer" },
  ];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-3 text-base font-bold">Şikayet Et</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Lütfen neden şikayet ettiğini seç:
        </p>
        <div className="mb-3 space-y-1">
          {reasons.map(r => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm ${
                reason === r.value ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={e => setReason(e.target.value)}
                className="accent-primary"
              />
              {r.label}
            </label>
          ))}
        </div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value.slice(0, 500))}
          rows={2}
          maxLength={500}
          placeholder="Detay (opsiyonel)..."
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!reason || submitting}
            className="flex-1 rounded-full bg-rose-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "Gönderiliyor..." : "Şikayet Et"}
          </button>
        </div>
      </div>
    </div>
  );
}
