"use client";

import { useId, useState } from "react";
import { Camera, X, Loader2, Plus } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getBusinessSession } from "@/lib/panel-auth";

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  folder?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getToken() {
  if (typeof window === "undefined") return "";
  const biz = getBusinessSession();
  if (biz?.token) return biz.token;
  return getUser()?.token || "";
}

export function PhotoUpload({ photos, onChange, max = 10, folder }: Props) {
  const uid = useId();
  const inputId = `photo-upload-${uid}`;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const remaining = max - photos.length;
    if (remaining <= 0) { setError(`En fazla ${max} fotoğraf eklenebilir`); return; }
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const form = new FormData();
        form.append("photo", file);
        const uploadUrl = folder ? `${API}/upload?folder=${encodeURIComponent(folder)}` : `${API}/upload`;
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Yükleme başarısız");
        urls.push(data.url as string);
      }
      onChange([...photos, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme hatası");
    } finally {
      setUploading(false);
    }
  };

  const remove = (index: number) => onChange(photos.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {photos.length < max && (
        <label
          htmlFor={inputId}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-4 text-sm font-medium text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary ${uploading ? "pointer-events-none opacity-50" : ""}`}
        >
          {uploading
            ? <><Loader2 className="h-5 w-5 animate-spin" />Yükleniyor...</>
            : <><Camera className="h-5 w-5" /><Plus className="h-3.5 w-3.5 -ml-1" />Fotoğraf Seç ({photos.length}/{max})</>
          }
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            className="sr-only"
            onChange={handleFiles}
            disabled={uploading}
          />
        </label>
      )}

      {photos.length > 0 && (
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
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">{photos.length}/{max} · Birden fazla seçilebilir · JPG, PNG, WebP, HEIC</p>
    </div>
  );
}
