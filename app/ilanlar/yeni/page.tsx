"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PhotoUpload } from "@/components/PhotoUpload";
import { api } from "@/lib/api";

const categories = [
  { id: "emlak", label: "Emlak", subs: ["Konut Satılık", "Konut Kiralık", "Villa Satılık", "İşyeri Satılık", "İşyeri Kiralık", "Arsa"] },
  { id: "vasita", label: "Vasıta", subs: ["Otomobil", "Motosiklet", "Kamyon", "Minibüs", "Diğer"] },
  { id: "elektronik", label: "Elektronik", subs: ["Telefon", "Laptop", "Tablet", "TV", "Beyaz Eşya", "Diğer"] },
  { id: "ev-yasam", label: "Ev & Yaşam", subs: ["Mobilya", "Dekorasyon", "Mutfak", "Bahçe", "Diğer"] },
  { id: "moda", label: "Moda", subs: ["Kadın Giyim", "Erkek Giyim", "Çocuk Giyim", "Ayakkabı", "Aksesuar"] },
  { id: "is-makineleri", label: "İş Makineleri", subs: ["Tarım", "İnşaat", "Endüstriyel", "Diğer"] },
];

export default function YeniIlanPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [features, setFeatures] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  const selectedCategory = categories.find(c => c.id === category);

  const addFeature = () => setFeatures([...features, { key: "", value: "" }]);
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, field: "key" | "value", val: string) =>
    setFeatures(features.map((f, idx) => idx === i ? { ...f, [field]: val } : f));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !category || !price) {
      setError("Başlık, kategori ve fiyat zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const featureMap: Record<string, string> = {};
      features.filter(f => f.key.trim()).forEach(f => { featureMap[f.key] = f.value; });

      await api.user.createListing({
        title,
        category,
        sub_category: subCategory,
        price: parseInt(price.replace(/\D/g, "")) || 0,
        description,
        location,
        features: featureMap,
        photos,
      });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "İlan oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="flex min-h-[calc(100dvh-76px)] flex-col items-center justify-center px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-12 w-12" strokeWidth={1.5} />
        </div>
        <h2 className="mt-5 text-xl font-bold">İlanınız Yayında!</h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          İlanınız başarıyla oluşturuldu ve yayınlandı.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/ilanlar"
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-muted">
            İlanlara Git
          </Link>
          <Link href="/profil/ilanlarim"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            İlanlarım
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-76px)]">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
        <Link href="/ilanlar" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-base font-semibold">Yeni İlan Ver</h1>
      </div>

      <form onSubmit={submit} className="space-y-5 px-5 pb-8 pt-5">
        {/* Fotoğraflar */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Fotoğraflar</h3>
          <PhotoUpload photos={photos} onChange={setPhotos} max={10} />
        </section>

        {/* Temel bilgiler */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <h3 className="text-sm font-semibold">İlan Bilgileri</h3>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Başlık *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="İlan başlığı"
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Kategori *</label>
              <select value={category} onChange={e => { setCategory(e.target.value); setSubCategory(""); }}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                <option value="">Seçin</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            {selectedCategory && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Alt Kategori</label>
                <select value={subCategory} onChange={e => setSubCategory(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                  <option value="">Seçin</option>
                  {selectedCategory.subs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Fiyat (₺) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Konum</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Gebze / Mahalle"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Açıklama</label>
            <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="İlanınız hakkında detaylı bilgi verin..."
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </section>

        {/* Özellikler */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Özellikler</h3>
            <button type="button" onClick={addFeature}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Plus className="h-3.5 w-3.5" />Ekle
            </button>
          </div>
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input value={f.key} onChange={e => updateFeature(i, "key", e.target.value)}
                placeholder="Özellik (örn: KM)" className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
              <input value={f.value} onChange={e => updateFeature(i, "value", e.target.value)}
                placeholder="Değer (örn: 62.000)" className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
              {features.length > 1 && (
                <button type="button" onClick={() => removeFeature(i)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </section>

        {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

        <button type="submit" disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          {loading ? "Yayınlanıyor..." : "İlanı Yayınla"}
        </button>
      </form>
    </div>
  );
}
