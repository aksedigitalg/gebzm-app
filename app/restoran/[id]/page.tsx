import { notFound } from "next/navigation";
import { MapPin, Phone, UtensilsCrossed } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BusinessActions } from "@/components/BusinessActions";

export const dynamic = "force-dynamic";

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function getData(id: string) {
  try {
    const [biz, menu] = await Promise.all([
      fetch(`${API}/businesses/${id}`, { cache: "no-store" }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/businesses/${id}/menu`, { cache: "no-store" }).then(r => r.ok ? r.json() : { categories: [], items: [] }),
    ]);
    return { biz, menu };
  } catch { return { biz: null, menu: { categories: [], items: [] } }; }
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bookingLabel: string }> = {
  restoran: { label: "Restoran",       color: "from-orange-500 to-red-600",    bookingLabel: "Rezervasyon Al" },
  yemek:    { label: "Yemek Teslimat", color: "from-rose-500 to-orange-500",   bookingLabel: "Sipariş Ver" },
  kafe:     { label: "Kafe & Pastane", color: "from-amber-500 to-orange-600",  bookingLabel: "Rezervasyon Al" },
};

interface MenuItem { id: string; category_id: string; name: string; description: string; price: number; photo_url: string; }
interface MenuCat { id: string; name: string; }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { biz, menu } = await getData(id);
  if (!biz) notFound();

  const cfg = TYPE_CONFIG[biz.type] || TYPE_CONFIG.restoran;
  const hasMenu = (menu.items || []).length > 0;

  return (
    <>
      <PageHeader title={biz.name} subtitle={cfg.label} back="/restoran" />
      <div className="pb-36">
        {/* Kapak */}
        <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${cfg.color}`}>
          {biz.cover_url && <img src={biz.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />}
        </div>

        <div className="space-y-5 px-5 pt-5">
          {/* Başlık */}
          <div className="flex items-start gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.color} text-white shadow-lg`}>
              {biz.logo_url
                ? <img src={biz.logo_url} alt="" className="h-full w-full object-cover" />
                : <UtensilsCrossed className="h-7 w-7" strokeWidth={1.75} />
              }
            </div>
            <div>
              <h1 className="text-xl font-bold">{biz.name}</h1>
              <span className={`inline-block rounded-full bg-gradient-to-br ${cfg.color} px-2.5 py-0.5 text-[11px] font-bold text-white`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Açıklama */}
          {biz.description && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{biz.description}</p>
            </div>
          )}

          {/* İletişim */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">İletişim</h3>
            {biz.address && <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 text-primary" />{biz.address}</p>}
            {biz.phone && <a href={`tel:${biz.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-primary hover:underline"><Phone className="h-4 w-4 shrink-0" />{biz.phone}</a>}
          </div>

          {/* Menü */}
          <div>
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
                <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-muted-foreground">Menü henüz eklenmemiş</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BusinessActions businessName={biz.name} businessType={cfg.label} bookingLabel={cfg.bookingLabel} businessId={biz.id} />
    </>
  );
}
