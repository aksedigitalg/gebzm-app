"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Camera, Tag, MapPin, Eye } from "lucide-react";
import Link from "next/link";
import { MediaUpload } from "@/components/MediaUpload";
import { listingCategories, getCategoryById } from "@/lib/listing-categories";
import { getBusinessSession } from "@/lib/panel-auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";
type Step = "category" | "details" | "photos" | "preview";

export default function YeniIlanPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("category");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("sabit");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [attrs, setAttrs] = useState<Record<string, string>>({});

  const catCfg = getCategoryById(category);
  const steps: Step[] = ["category", "details", "photos", "preview"];
  const idx = steps.indexOf(step);
  const sa = (k: string, v: string) => setAttrs(p => ({ ...p, [k]: v }));

  const submit = async () => {
    const s = getBusinessSession();
    if (!s?.token) { setError("Oturum süresi dolmuş."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/business/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.token}` },
        body: JSON.stringify({ title, category, subcategory, price: parseInt(price) || 0,
          price_type: priceType, description, location, photos, attributes: attrs, listing_type: "kurumsal" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Hata");
      router.push("/isletme/satis-ilanlari");
    } catch (e) { setError(e instanceof Error ? e.message : "Hata"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step !== "category" ? (
          <button onClick={() => setStep(steps[idx - 1])}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <Link href="/isletme/satis-ilanlari" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold">Yeni İlan Oluştur</h1>
          <p className="text-xs text-muted-foreground">Adım {idx + 1} / {steps.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {steps.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= idx ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {/* ADIM 1 — Kategori */}
      {step === "category" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold">Kategori Seçin</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">İlanınız hangi kategoride?</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {listingCategories.map(c => (
              <button key={c.id} onClick={() => { setCategory(c.id); setSubcategory(""); }}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${category === c.id ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"}`}>
                <span className="text-3xl">{c.icon}</span>
                <span className="text-xs font-semibold leading-tight">{c.label}</span>
              </button>
            ))}
          </div>

          {category && catCfg && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Alt Kategori</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {catCfg.subcategories.map(s => (
                  <button key={s.id} onClick={() => setSubcategory(s.id)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-medium text-left transition ${subcategory === s.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-background hover:border-primary/30"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setStep("details")} disabled={!category}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition hover:opacity-90">
            Devam Et <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ADIM 2 — Detaylar */}
      {step === "details" && catCfg && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold">{catCfg.icon} {catCfg.label} Detayları</h2>

          {/* Temel bilgiler */}
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Başlık *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
                placeholder="Örn: 2019 BMW 320i M Sport - 72.000 km"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Açıklama</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="İlanınız hakkında detaylı bilgi verin..."
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Fiyat (₺) *</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0"
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

          {/* Kategori özellikler */}
          {catCfg.attributes.length > 0 && (
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

          <button onClick={() => setStep("photos")} disabled={!title || !price}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition hover:opacity-90">
            Fotoğraflara Geç <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ADIM 3 — Fotoğraflar */}
      {step === "photos" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5" />Fotoğraflar
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">İlk fotoğraf kapak görseli olarak kullanılır. Max 20.</p>
          </div>
          <MediaUpload photos={photos} videos={videos} onPhotosChange={setPhotos} onVideosChange={setVideos} maxPhotos={20} maxVideos={3} />
          <button onClick={() => setStep("preview")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            Önizlemeye Geç <Eye className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ADIM 4 — Önizleme */}
      {step === "preview" && catCfg && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />Önizleme
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Yayınlandığında bu şekilde görünecek.</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            {photos[0] ? (
              <img src={photos[0]} alt="" className="h-52 w-full object-cover" />
            ) : (
              <div className="flex h-52 items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <Tag className="h-14 w-14 text-muted-foreground/30" strokeWidth={1.25} />
              </div>
            )}
            <div className="space-y-3 p-5">
              <div>
                <p className="text-lg font-bold">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {catCfg.label}{subcategory ? ` · ${catCfg.subcategories.find(s => s.id === subcategory)?.label}` : ""}
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {parseInt(price || "0").toLocaleString("tr-TR")} ₺
                {priceType !== "sabit" && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({priceType === "pazarlik" ? "Pazarlık Var" : "Takas Olur"})
                  </span>
                )}
              </p>
              {location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />{location}
                </p>
              )}
              {description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{description}</p>}
              {Object.keys(attrs).filter(k => attrs[k]).length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {Object.entries(attrs).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs">
                      <span className="text-muted-foreground">{catCfg.attributes.find(a => a.key === k)?.label}: </span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep("photos")}
              className="flex-1 rounded-full border border-border py-3 text-sm font-semibold transition hover:bg-muted">
              Düzenle
            </button>
            <button onClick={submit} disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Yayınlanıyor..." : <><Check className="h-4 w-4" />İlanı Yayınla</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
