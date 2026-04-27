"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Sparkles, User as UserIcon } from "lucide-react";
import { socialApi } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u?.token) {
      router.replace("/giris");
      return;
    }
    // Eğer profili varsa anasayfaya yönlendir
    socialApi
      .getMyProfile()
      .then(() => router.replace("/sosyal"))
      .catch(() => {});
  }, [router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar 5MB'dan büyük olamaz");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("photo", file);
      const u = getUser();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://gebzem.app/api/v1"}/upload?folder=social/avatars`,
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
      setAvatarUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setError("");
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      setError("Kullanıcı adı 3-30 karakter, sadece harf/rakam/_ olabilir");
      return;
    }
    if (displayName.trim().length < 1) {
      setError("Görünen ad zorunlu");
      return;
    }
    setSubmitting(true);
    try {
      await socialApi.createProfile({
        username,
        display_name: displayName.trim(),
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl || undefined,
      });
      router.replace("/sosyal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profil oluşturulamadı");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold">GebzemSosyal'a Hoş Geldin!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          İlk olarak sosyal profilini oluşturalım
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <label className="group relative cursor-pointer">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted shadow-md">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-white">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">Profil fotoğrafı (opsiyonel)</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Kullanıcı adı *
          </label>
          <div className="flex items-center rounded-xl border border-border bg-background pl-3">
            <span className="text-muted-foreground">@</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30))}
              placeholder="kullaniciadi"
              className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
              autoFocus
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            3-30 karakter, sadece harf/rakam/_ — sonradan değiştirilemez
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Görünen ad *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value.slice(0, 50))}
            placeholder="Ahmet Yılmaz"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, 280))}
            rows={3}
            placeholder="Kendinden bahset..."
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {bio.length}/280
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={submitting || uploading || !username || !displayName.trim()}
          className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? "Oluşturuluyor..." : "Profili Oluştur"}
        </button>
      </div>
    </div>
  );
}
