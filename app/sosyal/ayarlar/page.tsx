"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Lock, Save } from "lucide-react";
import { socialApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { SocialProfile } from "@/lib/types/social";

export default function SocialSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const [error, setError] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);

  useEffect(() => {
    socialApi
      .getMyProfile()
      .then(p => {
        const sp = p as unknown as SocialProfile;
        setProfile(sp);
        setDisplayName(sp.display_name);
        setBio(sp.bio || "");
        setAvatarUrl(sp.avatar_url || "");
        setCoverUrl(sp.cover_url || "");
        setIsPrivate(sp.is_private);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const upload = async (kind: "avatar" | "cover", file: File) => {
    setUploading(kind);
    setError("");
    try {
      const form = new FormData();
      form.append("photo", file);
      const u = getUser();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://gebzem.app/api/v1"}/upload?folder=social/${kind}s`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${u?.token}` },
          body: form,
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Yüklenemedi");
      }
      const data = await res.json();
      if (kind === "avatar") setAvatarUrl(data.url);
      else setCoverUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSavedNote("");
    try {
      await socialApi.updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        is_private: isPrivate,
      });
      setSavedNote("Kaydedildi ✓");
      setTimeout(() => setSavedNote(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card py-20">
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold">Profili Düzenle</h1>
      </header>

      <div className="space-y-5 p-4">
        {/* Cover */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Kapak fotoğrafı
          </label>
          <div className="relative h-32 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-secondary/20 to-fuchsia-500/20">
            {coverUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              disabled={uploading === "cover"}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
            >
              {uploading === "cover" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) upload("cover", f);
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Avatar */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Profil fotoğrafı
          </label>
          <div className="flex items-center gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-card bg-muted">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                  {displayName[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              disabled={uploading === "avatar"}
              className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold transition hover:bg-muted"
            >
              {uploading === "avatar" ? "Yükleniyor..." : "Değiştir"}
            </button>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) upload("avatar", f);
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Username (readonly) */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Kullanıcı adı
          </label>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            @{profile?.username}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Kullanıcı adı değiştirilemez
          </p>
        </div>

        {/* Display name */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Görünen ad
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value.slice(0, 50))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, 280))}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {bio.length}/280
          </p>
        </div>

        {/* Private toggle */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
          <button
            type="button"
            onClick={() => setIsPrivate(p => !p)}
            className="relative mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full transition"
            style={{ backgroundColor: isPrivate ? "#0e7490" : "#e5e7eb" }}
          >
            <span
              className="ml-0.5 h-5 w-5 rounded-full bg-white shadow transition"
              style={{ transform: isPrivate ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Lock className="h-3.5 w-3.5" />
              Gizli profil
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Gönderilerini sadece takipçilerin görür. Yeni takipler için onay gerekir.
            </p>
          </div>
        </label>

        {error && (
          <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}
        {savedNote && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            {savedNote}
          </div>
        )}

        <button
          type="button"
          onClick={save}
          disabled={saving || !displayName.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
      </div>
    </div>
  );
}
