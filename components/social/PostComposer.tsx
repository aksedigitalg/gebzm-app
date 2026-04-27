"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Send, X } from "lucide-react";
import { socialApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { SocialMedia, SocialProfile } from "@/lib/types/social";

interface Props {
  profile: SocialProfile | null;
  parentId?: string;
  placeholder?: string;
  onPosted?: (postId: string) => void;
}

const MAX_LENGTH = 500;
const MAX_MEDIA = 4;

export function PostComposer({ profile, parentId, placeholder, onPosted }: Props) {
  const [text, setText] = useState("");
  const [media, setMedia] = useState<SocialMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (media.length + files.length > MAX_MEDIA) {
      setError(`En fazla ${MAX_MEDIA} medya`);
      return;
    }
    setUploading(true);
    setError("");
    const u = getUser();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://gebzem.app/api/v1";
    try {
      const uploaded: SocialMedia[] = [];
      for (const f of files) {
        if (f.size > 50 * 1024 * 1024) {
          throw new Error(`${f.name} çok büyük (max 50MB)`);
        }
        const form = new FormData();
        form.append("photo", f);
        const res = await fetch(`${apiUrl}/upload?folder=social/posts`, {
          method: "POST",
          headers: { Authorization: `Bearer ${u?.token}` },
          body: form,
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Yüklenemedi");
        }
        const data = await res.json();
        uploaded.push({
          type: data.type === "video" ? "video" : "image",
          url: data.url,
          thumbnail: data.thumbnail,
        });
      }
      setMedia(m => [...m, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeMedia = (idx: number) => {
    setMedia(m => m.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    if (!text.trim() && media.length === 0) {
      setError("Boş gönderi yazılamaz");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const r = await socialApi.createPost({
        text: text.trim(),
        media,
        parent_id: parentId,
      });
      setText("");
      setMedia([]);
      onPosted?.(r.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paylaşılamadı");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = MAX_LENGTH - text.length;
  const canSubmit = (text.trim().length > 0 || media.length > 0) && !submitting && !uploading;

  return (
    <div className="border-b border-border bg-card p-4">
      <div className="flex gap-3">
        {profile?.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={profile.avatar_url}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
            {profile?.display_name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_LENGTH))}
            rows={2}
            placeholder={placeholder || "Ne paylaşmak istersin?"}
            className="w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />

          {/* Media preview */}
          {media.length > 0 && (
            <div
              className={`mt-2 grid gap-1 overflow-hidden rounded-xl border border-border ${
                media.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {media.map((m, i) => (
                <div key={i} className="relative aspect-video bg-muted">
                  {m.type === "video" ? (
                    /* eslint-disable-next-line jsx-a11y/media-has-caption */
                    <video src={m.url} poster={m.thumbnail} className="h-full w-full object-cover" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || media.length >= MAX_MEDIA}
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFile}
                className="hidden"
              />
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs ${
                  remaining < 50 ? "text-amber-600 font-bold" : "text-muted-foreground"
                }`}
              >
                {remaining}
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {parentId ? "Yorumla" : "Paylaş"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
