import { notFound } from "next/navigation";
import { MapPin, Phone, Clock, Star, UtensilsCrossed, Image as ImageIcon, Tag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BusinessActions } from "@/components/BusinessActions";

export const dynamic = "force-dynamic";

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function getData(id: string) {
  try {
    const [biz, menu, gallery] = await Promise.all([
      fetch(`${API}/businesses/${id}`, { cache: "no-store" }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/businesses/${id}/menu`, { cache: "no-store" }).then(r => r.ok ? r.json() : { categories: [], items: [] }),
      fetch(`${API}/businesses/${id}/gallery`, { cache: "no-store" }).then(r => r.ok ? r.json() : []),
    ]);
    return { biz, menu, gallery };
  } catch { return { biz: null, menu: { categories: [], items: [] }, gallery: [] }; }
}

interface MenuItem { id: string; category_id: string; name: string; description: string; price: number; photo_url: string; }
interface MenuCat { id: string; name: string; }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { biz, menu, gallery } = await getData(id);
  if (!biz) notFound();

  const hasMenu = menu.items.length > 0;
  const hasGallery = gallery.length > 0;

  return (
    <>
      <PageHeader title={biz.name} subtitle="Restoran" back="/restoran" />
      <div className="pb-36">
        {/* Kapak */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-orange-500/40 to-red-600/40">
          {biz.cover_url && <img src={biz.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />}
          {hasGallery && !biz.cover_url && (
            <img src={gallery[0].photo_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          )}
        </div>

        <div className="space-y-5 px-5 pt-5">
          {/* İşletme başlık */}
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
              {biz.logo_url
                ? <img src={biz.logo_url} alt="" className="h-full w-full object-cover" />
                : <UtensilsCrossed className="h-7 w-7" strokeWidth={1.75} />
              }
            </div>
            <div>
              <h1 className="text-xl font-bold">{biz.name}</h1>
              <span className="inline-block rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-bold text-orange-600">Restoran</span>
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

          {/* Galeri */}
          {hasGallery && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><ImageIcon className="h-4 w-4 text-primary" />Galeri</h2>
              <div className="-mx-5 flex gap-2 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-2 no-scrollbar">
                {gallery.map((p: { id: string; photo_url: string; caption: string }, i: number) => (
                  <img key={p.id} src={p.photo_url} alt={p.caption}
                    className={`h-32 w-32 shrink-0 rounded-2xl object-cover ${i === 0 ? "ml-5" : ""} ${i === gallery.length - 1 ? "mr-5" : ""}`} />
                ))}
              </div>
            </div>
          )}

          {/* Menü */}
          {hasMenu ? (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold"><UtensilsCrossed className="h-4 w-4 text-primary" />Menü</h2>
              <div className="space-y-5">
                {menu.categories.map((cat: MenuCat) => {
                  const catItems = menu.items.filter((it: MenuItem) => it.category_id === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <section key={cat.id}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat.name}</h3>
                      <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        {catItems.map((it: MenuItem, i: number) => (
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
                {/* Kategorisiz */}
                {menu.items.filter((it: MenuItem) => !it.category_id || !menu.categories.find((c: MenuCat) => c.id === it.category_id)).map((it: MenuItem, i: number, arr: MenuItem[]) => (
                  <div key={it.id} className={`flex items-start gap-3 rounded-2xl border border-border bg-card p-4`}>
                    {it.photo_url && <img src={it.photo_url} alt={it.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{it.name}</p>
                      {it.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{it.description}</p>}
                    </div>
                    {it.price > 0 && <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">{it.price.toLocaleString("tr-TR")} ₺</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-10 text-center">
              <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
              <p className="mt-3 text-sm text-muted-foreground">Menü henüz eklenmemiş</p>
            </div>
          )}
        </div>
      </div>

      <BusinessActions businessName={biz.name} businessType="Restoran" bookingLabel="Rezervasyon Al" businessId={biz.id} />
    </>
  );
}
