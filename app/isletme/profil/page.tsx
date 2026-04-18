"use client";

import { useEffect, useState } from "react";
import { Save, MapPin, Phone, FileText } from "lucide-react";
import { api } from "@/lib/api";

export default function Page() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.business.getMe().then((data) => {
      const d = data as Record<string, string>;
      setName(d.name || "");
      setPhone(d.phone || "");
      setAddress(d.address || "");
      setDescription(d.description || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.business.updateMe({ name, phone, address, description });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert("Kayıt başarısız"); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">İşletme Profilim</h1>
        <p className="mt-1 text-sm text-muted-foreground">Müşterilere görünen profil bilgilerinizi düzenleyin</p>
      </header>

      <form onSubmit={handleSave} className="space-y-5">
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
          <button type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            <Save className="h-4 w-4" />Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
