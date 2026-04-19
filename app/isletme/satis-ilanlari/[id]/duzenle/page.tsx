"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { MediaUpload } from "@/components/MediaUpload";
import { listingCategories, getCategoryById } from "@/lib/listing-categories";
import { api } from "@/lib/api";

export default function DuzenlemePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("sabit");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [attrs, setAttrs] = useState<Record<string, string>>({});

  const catCfg = getCategoryById(category);
  const sa = (k: string, v: string) => setAttrs(p => ({ ...p, [k]: v }));

  useEffect(() => {
    api.business.getListing(id)
      .then((d: Record<string, unknown>) => {
        setTitle((d.title as string) || "");
        setDescription((d.description as string) || "");
        setPrice(String(d.price || ""));
        setPriceType((d.price_type as string) || "sabit");
        setLocation((d.location as string) || "");
        setCategory((d.category as string) || "");
        setSubcategory((d.subcategory as string) || "");
        setPhotos((d.photos as string[]) || []);
        setAttrs((d.attributes as Record<string, string>) || {});
      })
      .catch(() => setError("İlan yüklenemedi"))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    if (!title || !price) { setError("Başlık ve fiyat zorunlu"); return; }
    setSaving(true);
    setError("");
    try {
      await api.business.updateListing(id, {
        title, category, subcategory,
        price: parseInt(price) || 0,
        price_type: priceType,
        description, location,
        photos,
        attributes: attrs,
        listing_type: "kurumsal",
      });
      router.push("/isletme/satis-ilanlari");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  if (error && !title) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold text-red-600">{error}</p>
      <Link href="/isletme/satis-ilanlari" className="mt-4 text-xs text-primary underline">Geri Dön</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/isletme/satis-ilanlari"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">İlanı Düzenle</h1>
          <p className="text-xs text-muted-foreground line-clamp-1">{title}</p>
        </div>
      </div>

      {/* Kategori */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Kategori</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {listingCategories.map(c => (
            <button key={c.id} onClick={() => { setCategory(c.id); setSubcategory(""); }}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition ${category === c.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"}`}>
              <span className="text-2xl">{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
        {category && catCfg && catCfg.subcategories.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mt-2">
            {catCfg.subcategories.map(s => (
              <button key={s.id} onClick={() => setSubcategory(s.id)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium text-left transition ${subcategory === s.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Temel bilgiler */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Temel Bilgiler</h3>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Başlık *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Açıklama</label>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Fiyat (₺) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Fiyat Türü</label>
            <select value={priceType} onChange={e => setPriceType(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary">
              <option value="sabit">Sabit Fiyat</option>
              <option value="pazarlik">Pazarlık Var</option>
              <option value="takas">Takas Olur</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Konum</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Gebze / Mahalle"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        </div>
      </div>

      {/* Kategori özellikleri */}
      {catCfg && catCfg.attributes.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">{catCfg.label} Özellikleri</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {catCfg.attributes.map(a => (
              <div key={a.key}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{a.label}</label>
                {a.type === "select" ? (
                  <select value={attrs[a.key] || ""} onChange={e => sa(a.key, e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                    <option value="">Seçin</option>
                    {a.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={a.type === "number" ? "number" : "text"} value={attrs[a.key] || ""}
                    onChange={e => sa(a.key, e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fotoğraflar */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Fotoğraflar</h3>
        <MediaUpload
          photos={photos} videos={videos}
          onPhotosChange={setPhotos} onVideosChange={setVideos}
          maxPhotos={20} maxVideos={3}
          folder={`listings/${category || "diger"}`}
        />
      </div>

      {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Link href="/isletme/satis-ilanlari"
          className="flex-1 flex items-center justify-center rounded-full border border-border py-3 text-sm font-semibold hover:bg-muted transition">
          İptal
        </Link>
        <button onClick={save} disabled={saving || !title || !price}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Kaydediliyor...</> : <><Check className="h-4 w-4" />Değişiklikleri Kaydet</>}
        </button>
      </div>
    </div>
  );
}
