import { notFound } from "next/navigation";
import { MapPin, Phone, Clock, Tag, UtensilsCrossed, Wrench, Package } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BusinessActions } from "@/components/BusinessActions";
import { BusinessReviews } from "@/components/BusinessReviews";

export const dynamic = "force-dynamic";

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const TYPE_CONFIG: Record<string, { label: string; bookingLabel: string; color: string }> = {
  restoran: { label: "Restoran",        bookingLabel: "Rezervasyon Al",  color: "from-orange-500 to-red-600" },
  yemek:    { label: "Yemek Teslimat",  bookingLabel: "Sipariş Ver",     color: "from-rose-500 to-orange-500" },
  kafe:     { label: "Kafe & Pastane",  bookingLabel: "Rezervasyon Al",  color: "from-amber-500 to-orange-600" },
  market:   { label: "Market",          bookingLabel: "Sipariş Ver",     color: "from-emerald-500 to-teal-600" },
  magaza:   { label: "Mağaza",          bookingLabel: "Sipariş Ver",     color: "from-sky-500 to-blue-600" },
  doktor:   { label: "Doktor & Klinik", bookingLabel: "Randevu Al",      color: "from-cyan-500 to-blue-600" },
  kuafor:   { label: "Kuaför & Berber", bookingLabel: "Randevu Al",      color: "from-pink-500 to-fuchsia-600" },
  usta:     { label: "Usta",            bookingLabel: "Talep Gönder",    color: "from-amber-600 to-orange-700" },
  emlakci:  { label: "Emlakçı",         bookingLabel: "İletişim",        color: "from-blue-600 to-indigo-700" },
  galerici: { label: "Oto Galeri",      bookingLabel: "İletişim",        color: "from-slate-600 to-zinc-700" },
};

const FOOD_TYPES = ["restoran", "yemek", "kafe"];
const SERVICE_TYPES = ["kuafor", "usta", "doktor"];

async function getBusiness(id: string) {
  try {
    const res = await fetch(`${API}/businesses/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function getServices(id: string) {
  try {
    const res = await fetch(`${API}/businesses/${id}/services`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function getMenu(id: string) {
  try {
    const res = await fetch(`${API}/businesses/${id}/menu`, { cache: "no-store" });
    if (!res.ok) return { categories: [], items: [] };
    return await res.json();
  } catch { return { categories: [], items: [] }; }
}

interface Service { id: string; name: string; description?: string; price?: number; duration?: string; category?: string; }
interface MenuItem { id: string; category_id: string; name: string; description: string; price: number; photo_url: string; }
interface MenuCat { id: string; name: string; }

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const biz = await getBusiness(slug);
  if (!biz) notFound();

  const cfg = TYPE_CONFIG[biz.type] || { label: biz.type, bookingLabel: "İletişim", color: "from-slate-500 to-gray-600" };
  const isFood = FOOD_TYPES.includes(biz.type);
  const isService = SERVICE_TYPES.includes(biz.type);

  const [services, menu] = await Promise.all([
    isService ? getServices(slug) : Promise.resolve([]),
    isFood ? getMenu(slug) : Promise.resolve({ categories: [], items: [] }),
  ]);

  const grouped = (services as Service[]).reduce<Record<string, Service[]>>((acc, s) => {
    const c = s.category || "Hizmetler";
    if (!acc[c]) acc[c] = [];
    acc[c].push(s);
    return acc;
  }, {});

  const hasMenu = (menu.items || []).length > 0;
  const hasServices = Object.keys(grouped).length > 0;

  return (
    <>
      <PageHeader title={biz.name} subtitle={cfg.label} back="/hizmetler" />
      <div className="pb-36">
        {/* Kapak */}
        <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${cfg.color}`}>
          {biz.cover_url && <img src={biz.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
        </div>

        <div className="px-5 pt-5 space-y-4">
          {/* Başlık */}
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.color} text-white overflow-hidden`}>
              {biz.logo_url
                ? <img src={biz.logo_url} alt="" className="h-full w-full object-cover" />
                : <Wrench className="h-7 w-7" strokeWidth={1.75} />
              }
            </div>
            <div>
              <h1 className="text-lg font-bold">{biz.name}</h1>
              <span className={`inline-block rounded-full bg-gradient-to-br ${cfg.color} px-2.5 py-0.5 text-[11px] font-bold text-white`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Açıklama */}
          {biz.description && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hakkında</h3>
              <p className="text-sm leading-relaxed">{biz.description}</p>
            </div>
          )}

          {/* İletişim */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">İletişim</h3>
            {biz.address && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />{biz.address}
              </p>
            )}
            {biz.phone && (
              <a href={`tel:${biz.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Phone className="h-4 w-4 shrink-0" />{biz.phone}
              </a>
            )}
          </div>
        </div>

        {/* Hizmet listesi (kuafor, usta, doktor) */}
        {isService && (
          <div className="px-5 mt-5 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-primary" />Hizmetler
            </h2>
            {hasServices ? (
              Object.entries(grouped).map(([cat, svcs]) => (
                <section key={cat}>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h3>
                  <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    {svcs.map((s, i) => (
                      <div key={s.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${i < svcs.length - 1 ? "border-b border-border" : ""}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{s.name}</p>
                          {s.description && <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>}
                          {s.duration && (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="h-3 w-3" />{s.duration}
                            </p>
                          )}
                        </div>
                        {(s.price ?? 0) > 0 && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            {(s.price ?? 0).toLocaleString("tr-TR")} ₺
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-10 text-center">
                <Tag className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-muted-foreground">Hizmet listesi henüz eklenmemiş</p>
              </div>
            )}
          </div>
        )}

        {/* Menü (restoran, yemek, kafe) */}
        {isFood && (
          <div className="px-5 mt-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <UtensilsCrossed className="h-4 w-4 text-primary" />Menü
            </h2>
            {hasMenu ? (
              <div className="space-y-5">
                {(menu.categories as MenuCat[]).map((cat) => {
                  const catItems = (menu.items as MenuItem[]).filter(it => it.category_id === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <section key={cat.id}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat.name}</h3>
                      <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        {catItems.map((it, i) => (
                          <div key={it.id} className={`flex items-start gap-3 p-4 ${i < catItems.length - 1 ? "border-b border-border" : ""}`}>
                            {it.photo_url && (
                              <img src={it.photo_url} alt={it.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{it.name}</p>
                              {it.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{it.description}</p>}
                            </div>
                            {it.price > 0 && (
                              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                                {it.price.toLocaleString("tr-TR")} ₺
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
                {/* Kategorisiz öğeler */}
                {(menu.items as MenuItem[]).filter(it => !it.category_id || !(menu.categories as MenuCat[]).find(c => c.id === it.category_id)).map((it) => (
                  <div key={it.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                    {it.photo_url && <img src={it.photo_url} alt={it.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{it.name}</p>
                      {it.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{it.description}</p>}
                    </div>
                    {it.price > 0 && <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">{it.price.toLocaleString("tr-TR")} ₺</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-10 text-center">
                <UtensilsCrossed className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-muted-foreground">Menü henüz eklenmemiş</p>
              </div>
            )}
          </div>
        )}

        {/* Market / Mağaza */}
        {(biz.type === "market" || biz.type === "magaza") && (
          <div className="px-5 mt-5">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-10 text-center">
              <Package className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold">Ürün kataloğu</p>
              <p className="mt-1 text-xs text-muted-foreground">Ürünler için işletmeyle iletişime geçin</p>
            </div>
          </div>
        )}

        {/* Yorumlar */}
        <div className="px-5 mt-5">
          <BusinessReviews businessId={biz.id} businessName={biz.name} />
        </div>
      </div>

      <BusinessActions
        businessName={biz.name}
        businessType={cfg.label}
        bookingLabel={cfg.bookingLabel}
        businessId={biz.id}
      />
    </>
  );
}
