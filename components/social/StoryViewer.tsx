"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Send, Trash2, X } from "lucide-react";
import { socialApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { SocialStory, StoryViewer as StoryViewerType } from "@/lib/types/story";

/**
 * StoryViewer — full-screen Instagram-tarzı oynatıcı
 *
 * Kontroller:
 *  - Tap sol/sağ → prev/next story
 *  - Long-press → pause (basılı tut)
 *  - Swipe down (X butonu) → kapat
 *  - 5sn (image) / video duration → otomatik next
 *  - Progress bar üstte
 *  - Sahibi: 👁 viewer count + delete butonu
 *  - Başkası: cevap yazma input'u
 *
 * Güvenlik: media URL render edilirken HTML olarak değil sadece <img>/<video> src'de
 */
interface Props {
  /** Görüntülenen story ID. Otomatik yükleme yapar; sonraki/önceki story'ler için tüm grup gerekir. */
  initialStoryId: string;
}

export function StoryViewer({ initialStoryId }: Props) {
  const router = useRouter();
  const [story, setStory] = useState<SocialStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0); // 0-100
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<StoryViewerType[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const me = typeof window !== "undefined" ? getUser() : null;
  const isMine = me?.id === story?.author_id;

  // Story yükle
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setProgress(0);
    elapsedRef.current = 0;
    socialApi
      .getStory(initialStoryId)
      .then(s => {
        if (!alive) return;
        setStory(s as unknown as SocialStory);
      })
      .catch(err => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Story yüklenemedi");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [initialStoryId]);

  // Progress bar — image için interval, video için video time
  useEffect(() => {
    if (!story || loading) return;

    const total = (story.duration_sec || 5) * 1000;

    const tick = () => {
      if (paused) return;
      const now = performance.now();
      elapsedRef.current += now - startTimeRef.current;
      startTimeRef.current = now;
      const pct = Math.min(100, (elapsedRef.current / total) * 100);
      setProgress(pct);
      if (pct >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Tamamlandı → kapat (single story; grup geçişi parent'ta yapılabilir)
        router.back();
      }
    };

    startTimeRef.current = performance.now();
    if (story.media_type === "image") {
      intervalRef.current = window.setInterval(tick, 50);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, loading, paused]);

  // Video pause/resume
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) {
      v.pause();
    } else {
      v.play().catch(() => {});
    }
  }, [paused]);

  const handleVideoTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const total = (story?.duration_sec || v.duration || 5);
    const pct = Math.min(100, (v.currentTime / total) * 100);
    setProgress(pct);
    if (v.currentTime >= total) {
      router.back();
    }
  };

  const handleReply = async () => {
    if (!story || !replyText.trim()) return;
    setSending(true);
    try {
      const r = await socialApi.replyToStory(story.id, replyText.trim());
      setReplyText("");
      router.push(`/sosyal/mesajlar/${r.conversation_id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cevap gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!story) return;
    if (!confirm("Story silinsin mi?")) return;
    try {
      await socialApi.deleteStory(story.id);
      router.back();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silinemedi");
    }
  };

  const loadViewers = async () => {
    if (!story) return;
    try {
      const v = await socialApi.getStoryViewers(story.id);
      setViewers(v as unknown as StoryViewerType[]);
      setShowViewers(true);
      setPaused(true);
    } catch {
      /* */
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black px-6 text-center text-white">
        <p className="text-base font-bold">Story bulunamadı</p>
        <p className="mt-1 text-sm text-white/70">{error || "Bu hikaye süresini doldurmuş olabilir."}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      style={story.background_color ? { background: story.background_color } : undefined}
    >
      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex gap-1 px-3 pt-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full bg-white transition-[width]"
            style={{ width: `${progress}%`, transitionDuration: paused ? "0ms" : "100ms" }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="absolute inset-x-0 top-6 z-10 flex items-center gap-3 px-4 pt-2">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 sm:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link
          href={`/sosyal/${story.author?.username || ""}`}
          className="flex flex-1 items-center gap-2 text-white"
        >
          {story.author?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={story.author.avatar_url}
              alt=""
              className="h-9 w-9 rounded-full border border-white/30 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              {story.author?.display_name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{story.author?.display_name || "Bilinmeyen"}</p>
            <p className="truncate text-xs text-white/70">
              {timeAgoShort(story.created_at)} • @{story.author?.username}
            </p>
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && isMine && (
            <div className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-xl border border-white/20 bg-black/90 backdrop-blur">
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-400 hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
                Story'i sil
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 sm:flex"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Media — tap zones */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Sol/sağ tap zone (UX için sadece görsel, prev/next şu an grup olmadan no-op) */}
        <button
          aria-label="Önceki"
          onClick={() => router.back()}
          className="absolute inset-y-0 left-0 z-[1] w-1/3 sm:hidden"
        />
        <button
          aria-label="Sonraki"
          onClick={() => router.back()}
          className="absolute inset-y-0 right-0 z-[1] w-1/3 sm:hidden"
        />

        {/* Desktop oklar */}
        <button
          aria-label="Geri"
          onClick={() => router.back()}
          className="absolute left-4 top-1/2 z-[2] hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="İleri"
          onClick={() => router.back()}
          className="absolute right-4 top-1/2 z-[2] hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {story.media_type === "image" ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={story.media_url}
            alt=""
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        ) : (
          <video
            ref={videoRef}
            src={story.media_url}
            poster={story.thumbnail_url}
            playsInline
            autoPlay
            muted={false}
            onTimeUpdate={handleVideoTimeUpdate}
            onClick={e => e.stopPropagation()}
            className="max-h-full max-w-full"
          />
        )}

        {/* Caption */}
        {story.caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-24 px-6 text-center">
            <p className="inline-block max-w-full break-words rounded-2xl bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              {story.caption}
            </p>
          </div>
        )}
      </div>

      {/* Footer: cevap input (başkası) veya viewer count (sahibi) */}
      <div className="relative z-10 px-4 pb-5 pt-3">
        {isMine ? (
          <button
            onClick={loadViewers}
            className="flex items-center gap-2 text-white/90 hover:text-white"
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {story.views_count.toLocaleString("tr-TR")} izleyici
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-3 py-2 backdrop-blur">
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value.slice(0, 1000))}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReply();
                }
              }}
              placeholder={`@${story.author?.username || "kullanici"} hikayesine cevap yaz...`}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/50 outline-none"
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim() || sending}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Viewers sheet (sahibi) */}
      {showViewers && (
        <div
          className="fixed inset-0 z-[110] flex items-end bg-black/70 sm:items-center sm:justify-center"
          onClick={() => {
            setShowViewers(false);
            setPaused(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-4 sm:rounded-3xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">İzleyiciler ({viewers.length})</h3>
              <button
                onClick={() => {
                  setShowViewers(false);
                  setPaused(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {viewers.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Henüz kimse izlemedi
                </p>
              )}
              {viewers.map(v => (
                <Link
                  key={v.user_id}
                  href={`/sosyal/${v.username}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
                >
                  {v.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={v.avatar_url}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {v.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{v.display_name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{v.username}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgoShort(v.viewed_at)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgoShort(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "şimdi";
  if (diff < 3600) return `${Math.floor(diff / 60)}d`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
  return `${Math.floor(diff / 86400)}g`;
}
