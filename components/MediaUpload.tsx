"use client";

import { useRef, useState } from "react";
import { Camera, Video, X, Loader2, Play } from "lucide-react";
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
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getToken() {
  if (typeof window === "undefined") return "";
  const biz = getBusinessSession();
  if (biz?.token) return biz.token;
  return getUser()?.token || "";
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1920;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

async function uploadFile(file: File, type: "photo" | "video"): Promise<string> {
  let body: FormData;
  if (type === "photo") {
    const compressed = await compressImage(file);
    body = new FormData();
    body.append("photo", compressed, file.name.replace(/\.[^.]+$/, ".jpg"));
  } else {
    if (file.size > 100 * 1024 * 1024) throw new Error("Video max 100MB olabilir");
    body = new FormData();
    body.append("photo", file);
  }
  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Yükleme başarısız");
  return data.url as string;
}

export function MediaUpload({
  photos, videos = [], onPhotosChange, onVideosChange,
  maxPhotos = 20, maxVideos = 1, allowVideo = true,
}: Props) {
  const [uploading, setUploading] = useState<"photo" | "video" | null>(null);
  const [error, setError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handlePhotoFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) { setError(`En fazla ${maxPhotos} fotoğraf eklenebilir`); return; }
    setUploading("photo");
    setError("");
    try {
      const urls: string[] = [];
      for (const file of files.slice(0, remaining)) {
        const url = await uploadFile(file, "photo");
        urls.push(url);
      }
      onPhotosChange([...photos, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme hatası");
    } finally {
      setUploading(null);
      if (photoRef.current) photoRef.current.value = "";
    }
  };

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videos.length >= maxVideos) { setError(`En fazla ${maxVideos} video eklenebilir`); return; }
    setUploading("video");
    setError("");
    try {
      const url = await uploadFile(file, "video");
      if (onVideosChange) onVideosChange([...videos, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video yükleme hatası");
    } finally {
      setUploading(null);
      if (videoRef.current) videoRef.current.value = "";
    }
  };

  const removePhoto = (i: number) => onPhotosChange(photos.filter((_, idx) => idx !== i));
  const removeVideo = (i: number) => onVideosChange && onVideosChange(videos.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
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

        {videos.map((url, i) => (
          <div key={url} className="relative h-24 w-24 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-black">
              <Play className="h-8 w-8 text-white/80" />
            </div>
            <button type="button" onClick={() => removeVideo(i)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
              <X className="h-3 w-3" />
            </button>
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">VİDEO</span>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button type="button" onClick={() => photoRef.current?.click()} disabled={uploading === "photo"}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50">
            {uploading === "photo" ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Camera className="h-6 w-6" /><span className="text-[10px] font-medium">Fotoğraf</span></>}
          </button>
        )}

        {allowVideo && videos.length < maxVideos && (
          <button type="button" onClick={() => videoRef.current?.click()} disabled={uploading === "video"}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-violet-500 hover:text-violet-500 disabled:opacity-50">
            {uploading === "video" ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Video className="h-6 w-6" /><span className="text-[10px] font-medium">Video</span></>}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {photos.length}/{maxPhotos} fotoğraf
        {allowVideo && ` · ${videos.length}/${maxVideos} video`}
        {" · "}Resimler otomatik sıkıştırılır · Video max 100MB
      </p>

      <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple className="hidden" onChange={handlePhotoFiles} />
      {allowVideo && <input ref={videoRef} type="file" accept="video/mp4,video/mov,video/avi,video/webm" className="hidden" onChange={handleVideoFile} />}
    </div>
  );
}
