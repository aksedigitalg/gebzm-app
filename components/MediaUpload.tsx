"use client";

import { useRef, useState } from "react";
import { Camera, Video, X, Loader2, Play, Plus } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getBusinessSession } from "@/lib/panel-auth";

interface Props {
  photos: string[];
  videos?: string[];
  onPhotosChange: (photos: string[]) => void;
  onVideosChange?: (videos: string[]) => void;
  maxPhotos?: number;
  maxVideos?: number;
  allowVideo?: boolean;
  folder?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getToken() {
  if (typeof window === "undefined") return "";
  const biz = getBusinessSession();
  if (biz?.token) return biz.token;
  return getUser()?.token || "";
}

async function uploadFile(file: File, folder?: string) {
  const body = new FormData();
  body.append("photo", file);
  const url = folder ? `${API}/upload?folder=${encodeURIComponent(folder)}` : `${API}/upload`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Yükleme başarısız");
  return { url: data.url as string, thumbnail: data.thumbnail as string | undefined };
}

function triggerPicker(inputRef: React.RefObject<HTMLInputElement | null>) {
  const inp = inputRef.current;
  if (!inp) return;
  if ("showPicker" in inp) {
    try {
      (inp as unknown as { showPicker: () => void }).showPicker();
      return;
    } catch {}
  }
  inp.click();
}

export function MediaUpload({
  photos, videos = [], onPhotosChange, onVideosChange,
  maxPhotos = 20, maxVideos = 1, allowVideo = true, folder,
}: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [error, setError] = useState("");
  const [videoThumbs, setVideoThumbs] = useState<Record<string, string>>({});

  const handlePhotoFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) { setError(`En fazla ${maxPhotos} fotoğraf`); return; }
    setUploading(true); setError("");
    try {
      const urls: string[] = [];
      for (const file of files.slice(0, remaining)) {
        const r = await uploadFile(file, folder);
        urls.push(r.url);
      }
      onPhotosChange([...photos, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme hatası");
    } finally { setUploading(false); }
  };

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (videos.length >= maxVideos) { setError(`En fazla ${maxVideos} video`); return; }
    if (file.size > 500 * 1024 * 1024) { setError("Video max 500MB"); return; }
    setUploadingVideo(true); setError("");
    try {
      const r = await uploadFile(file, folder);
      if (onVideosChange) onVideosChange([...videos, r.url]);
      if (r.thumbnail) setVideoThumbs(p => ({ ...p, [r.url]: r.thumbnail! }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video yükleme hatası");
    } finally { setUploadingVideo(false); }
  };

  const removePhoto = (i: number) => onPhotosChange(photos.filter((_, idx) => idx !== i));
  const removeVideo = (i: number) => {
    const removed = videos[i];
    if (onVideosChange) onVideosChange(videos.filter((_, idx) => idx !== i));
    setVideoThumbs(p => { const n = { ...p }; delete n[removed]; return n; });
  };

  return (
    <div className="space-y-3">
      {/* Fotoğraf butonu */}
      {photos.length < maxPhotos && (
        <div>
          <button
            type="button"
            onClick={() => triggerPicker(photoInputRef)}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-4 text-sm font-medium text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary select-none disabled:pointer-events-none disabled:opacity-50"
          >
            {uploading
              ? <><Loader2 className="h-5 w-5 animate-spin" />Yükleniyor...</>
              : <><Camera className="h-5 w-5" /><Plus className="h-3.5 w-3.5 -ml-1" />Fotoğraf Seç ({photos.length}/{maxPhotos})</>
            }
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
            multiple
            style={{ position: "fixed", top: -9999, left: -9999, opacity: 0 }}
            onChange={handlePhotoFiles}
            disabled={uploading}
          />
        </div>
      )}

      {/* Video butonu */}
      {allowVideo && videos.length < maxVideos && (
        <div>
          <button
            type="button"
            onClick={() => triggerPicker(videoInputRef)}
            disabled={uploadingVideo}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 py-3 text-sm font-medium text-violet-500 transition hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:bg-violet-950/20 select-none disabled:pointer-events-none disabled:opacity-50"
          >
            {uploadingVideo
              ? <><Loader2 className="h-5 w-5 animate-spin" />Video yükleniyor...</>
              : <><Video className="h-5 w-5" />Video Ekle (max 500MB)</>
            }
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept=".mp4,.mov,.avi,.webm"
            style={{ position: "fixed", top: -9999, left: -9999, opacity: 0 }}
            onChange={handleVideoFile}
            disabled={uploadingVideo}
          />
        </div>
      )}

      {/* Önizlemeler */}
      {(photos.length > 0 || videos.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url, i) => (
            <div key={url} className="relative h-24 w-24 shrink-0">
              <img src={url} alt="" className="h-full w-full rounded-xl object-cover border border-border" />
              <button type="button" onClick={() => removePhoto(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
                <X className="h-3 w-3" />
              </button>
              {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">Kapak</span>}
            </div>
          ))}
          {videos.map((url, i) => {
            const thumb = videoThumbs[url];
            return (
              <div key={url} className="relative h-24 w-24 shrink-0">
                {thumb
                  ? <img src={thumb} alt="" className="h-full w-full rounded-xl object-cover border border-border" />
                  : <video src={url} className="h-full w-full rounded-xl object-cover border border-border" muted playsInline preload="metadata" />
                }
                <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60">
                    <Play className="h-3.5 w-3.5 text-white" fill="white" />
                  </div>
                </div>
                <button type="button" onClick={() => removeVideo(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
                  <X className="h-3 w-3" />
                </button>
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">VİDEO</span>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Birden fazla fotoğraf aynı anda seçilebilir · WebP&apos;e dönüştürülür
        {allowVideo && " · Video max 500MB"}
      </p>
    </div>
  );
}
