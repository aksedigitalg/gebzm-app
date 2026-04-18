"use client";

import { useEffect, useState } from "react";
import { Save, MapPin, Phone, FileText, Upload, Camera } from "lucide-react";
import { api } from "@/lib/api";
import { getBusinessSession } from "@/lib/panel-auth";

export default function Page() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);

  const session = typeof window !== "undefined" ? getBusinessSession() : null;

  useEffect(() => {
    api.business.getMe().then((data) => {
      const d = data as Record<string, string>;
      setName(d.name || "");
      setPhone(d.phone || "");
      setAddress(d.address || "");
      setDescription(d.description || "");
      setLogoUrl(d.logo_url || "");
      setCoverUrl(d.cover_url || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const uploadPhoto = async (file: File, type: "logo" | "cover") => {
    setUploading(type);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (type === "logo") setLogoUrl(data.url);
      else setCoverUrl(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally { setUploading(null); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.business.updateMe({ name, phone, address, description, logo_url: logoUrl, cover_url: coverUrl } as Parameters<typeof api.business.updateMe>[0]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert("Kayıt başarısız"); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İşletme Profilim</h1>
        <p className="mt-1 text-sm text-muted-foreground">Müşterilere görünen profil bilgilerinizi düzenleyin</p>
      </header>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Kapak & Logo */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Kapak & Logo</h3>
          <div className="relative flex h-40 items-end overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
            {coverUrl && <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <label className="m-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-white">
              <Upload className="h-3.5 w-3.5" />
              {uploading === "cover" ? "Yükleniyor..." : "Kapak Yükle"}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "cover")} />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary">
              {logoUrl && <img src={logoUrl} alt="" className="h-full w-full object-cover" />}
              {!logoUrl && <Camera className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-white/60" />}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold transition hover:bg-muted">
              <Upload className="h-3.5 w-3.5" />
              {uploading === "logo" ? "Yükleniyor..." : "Logo Yükle"}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "logo")} />
            </label>
          </div>
        </div>

        {/* Temel bilgiler */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Temel Bilgiler</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">İşletme Adı</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Kısa Açıklama</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
        </section>

        {/* İletişim */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Adres & İletişim</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Adres</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm font-semibold text-emerald-600">Değişiklikler kaydedildi</span>}
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            <Save className="h-4 w-4" />Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
