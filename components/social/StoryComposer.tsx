"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Palette, Type, Upload, X } from "lucide-react";
import { socialApi } from "@/lib/api";
import { getUser } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

const BG_COLORS = [
  "#0e7490", "#10b981", "#0f172a", "#7c3aed", "#db2777",
  "#dc2626", "#ea580c", "#ca8a04", "#475569", "#000000",
];

/**
 * StoryComposer — Yeni story oluşturma sayfası
 *
 * Akış:
 *  1. Kullanıcı medya seçer (image/video) → Cloudflare R2'ye yükler
 *  2. Caption (opsiyonel, max 200), bg renk (opsiyonel)
 *  3. Submit → /social/stories POST → /sosyal'a yönlendir
 *
 * Güvenlik: medya size limit 50MB, image/video MIME kontrolü.
 */
export function StoryComposer() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [bgColor, setBgColor] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) {
      setError("Dosya 50MB'dan büyük olamaz");
      return;
    }
    const isImage = f.type.startsWith("image/");
    const isVideo = f.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setError("Sadece görsel veya video yükleyebilirsin");
      return;
    }
    setFile(f);
    setMediaType(isImage ? "image" : "video");
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Önce bir medya seç");
      return;
    }
    const u = getUser();
    if (!u?.token) {
      setError("Giriş yapmalısın");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // 1) Medya upload (R2) — backend upload handler "photo" field bekliyor
      setUploading(true);
      const fd = new FormData();
      fd.append("photo", file);
      const upRes = await fetch(`${API_URL}/upload?folder=social/stories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${u.token}` },
        body: fd,
      });
      if (!upRes.ok) {
        const j = await upRes.json().catch(() => ({}));
        throw new Error(j.error || "Yükleme başarısız");
      }
      const upJson = (await upRes.json()) as { url: string; thumbnail?: string };
      setUploading(false);

      // 2) Story oluştur
      await socialApi.createStory({
        media_url: upJson.url,
        media_type: mediaType,
        thumbnail_url: upJson.thumbnail,
        caption: caption.trim() || undefined,
        background_color: bgColor || undefined,
        duration_sec: mediaType === "video" ? 15 : 5,
      });

      router.replace("/sosyal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Story oluşturulamadı");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={bgColor ? { background: bgColor } : undefined}
    >
      <header className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
        <h1 className="text-base font-bold">Yeni Story</h1>
        <button
          onClick={handleSubmit}
          disabled={!file || submitting}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Paylaş"}
        </button>
      </header>

      <div className="mx-auto max-w-md p-4">
        {error && (
          <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
            {error}
          </div>
        )}

        {/* Preview */}
        <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-black">
          {preview ? (
            mediaType === "image" ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={preview} alt="" className="h-full w-full object-contain" />
            ) : (
              <video
                src={preview}
                controls
                playsInline
                className="h-full w-full object-contain"
              />
            )
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70 hover:text-white"
            >
              <Upload className="h-10 w-10" strokeWidth={1.5} />
              <span className="text-sm font-semibold">Medya seç</span>
              <span className="text-xs">JPG, PNG, MP4 — max 50MB</span>
            </button>
          )}

          {caption && preview && (
            <div className="pointer-events-none absolute inset-x-0 bottom-12 px-4 text-center">
              <p className="inline-block max-w-full break-words rounded-2xl bg-black/50 px-3 py-2 text-sm font-medium text-white backdrop-blur">
                {caption}
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0] || null)}
        />

        {/* Toolbar */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            <Camera className="h-3.5 w-3.5" />
            {file ? "Değiştir" : "Medya seç"}
          </button>
          <details className="rounded-full border border-border bg-card">
            <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold">
              <Palette className="h-3.5 w-3.5" />
              Renk
            </summary>
            <div className="flex flex-wrap gap-2 border-t border-border p-2">
              <button
                onClick={() => setBgColor("")}
                className={`h-6 w-6 rounded-full border ${
                  bgColor === "" ? "border-primary border-2" : "border-border"
                } bg-transparent`}
                title="Şeffaf"
              />
              {BG_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  style={{ background: c }}
                  className={`h-6 w-6 rounded-full ${
                    bgColor === c ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                  aria-label={c}
                />
              ))}
            </div>
          </details>
        </div>

        {/* Caption */}
        <div className="mt-3">
          <label className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Type className="h-3.5 w-3.5" />
            Yazı (opsiyonel)
          </label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value.slice(0, 200))}
            rows={2}
            maxLength={200}
            placeholder="Story'ne bir yazı ekle..."
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
            {caption.length}/200
          </p>
        </div>

        {uploading && (
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Yükleniyor...
          </p>
        )}

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Story'n 24 saat sonra otomatik silinir.
        </p>
      </div>
    </div>
  );
}
