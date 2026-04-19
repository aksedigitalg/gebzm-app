"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getBusinessSession } from "@/lib/panel-auth";

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getToken() {
  if (typeof window === "undefined") return "";
  const biz = getBusinessSession();
  if (biz?.token) return biz.token;
  return getUser()?.token || "";
}


export function PhotoUpload({ photos, onChange, max = 10 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız");
      return data.url as string;
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = max - photos.length;
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const url = await upload(file);
        if (url) urls.push(url);
      }
      onChange([...photos, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme hatası");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (index: number) => onChange(photos.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos.map((url, i) => (
          <div key={url} className="relative h-24 w-24 shrink-0">
            <img src={url} alt="" className="h-full w-full rounded-xl object-cover border border-border" />
            <button type="button" onClick={() => remove(i)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
              <X className="h-3 w-3" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">Kapak</span>
            )}
          </div>
        ))}

        {photos.length < max && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Camera className="h-6 w-6" /><span className="text-[10px] font-medium">Fotoğraf Ekle</span></>}
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple className="hidden" onChange={handleFiles} />

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">{photos.length}/{max} fotoğraf · Otomatik sıkıştırılır · JPG, PNG, WebP</p>
    </div>
  );
}
